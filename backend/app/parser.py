"""
PDF / 图片解析引擎 — IELTS Web
=================================

业务逻辑
--------
1. 混合解析（PDF）
   - 文字页（文章 / 题目）：全量提取文本，用于生成机考左文右题界面。
   - 扫描页（答案 / 解释）：
       a. 必须渲染并保存原始截图（供交卷后查看专家解释）。
       b. 同时用正则从 OCR 文本（或将来接入的 OCR 引擎）中抽取基础答案序号（1.A 形式）。

2. 交卷核对
   - 文字版内容 → 前端直接展示 `text` 字段。
   - 扫描版内容 → 前端使用 `screenshot_path` 字段在页面末尾渲染截图，让用户滚动查看原图。

3. 图片上传
   - 用户上传多张图片 → 调用本地 OCR（EasyOCR / PaddleOCR）→ 生成简易练习 JSON。

JSON 页面字段速查
-----------------
  page_num        int      页码（1-based）
  role            str      "content" | "answer" | "unknown"
  page_type       str      "text" | "scan"
  text            str      提取到的文字（文字页全量；扫描页为空或 OCR 结果）
  screenshot_path str|null 扫描页截图的绝对路径；文字页为 null
                           ← 前端交卷后据此决定是否渲染原图
  answers         list     基础答案列表，例如 [{"num":1,"ans":"A"}, ...]
                           文字版答案页和扫描答案页均会尝试填充
"""

from __future__ import annotations

import json
import re
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Optional

import fitz  # PyMuPDF


# ── 常量 ──────────────────────────────────────────────────────────────────────

# 每页可提取文字少于此字符数 → 判定为扫描页
SCAN_TEXT_THRESHOLD = 80

# 截图导出分辨率（2× ≈ 144 dpi，清晰且文件合理）
IMAGE_SCALE = 2.0

# 答案行正则：匹配 "1. A"  "2.B"  "32. TRUE"  "5.NOT GIVEN"
_ANSWER_RE = re.compile(
    r"^\s*(\d{1,2})\s*[.)]\s*((?:[A-D])|(?:TRUE|FALSE|NOT GIVEN))\s*$",
    re.IGNORECASE,
)

# 答案页特征词（用于角色推断）
_ANSWER_KEYWORDS = re.compile(
    r"\b(answer|answers|answer\s*key|解析|答案)\b",
    re.IGNORECASE,
)


# ── 数据模型 ──────────────────────────────────────────────────────────────────

@dataclass
class PageResult:
    page_num: int
    role: str                        # "content" | "answer" | "unknown"
    page_type: str                   # "text" | "scan"
    text: str                        # 文字页：全量文本；扫描页：""（OCR 接入后填充）
    screenshot_path: Optional[str]   # 扫描页截图绝对路径；文字页为 None
    answers: list[dict] = field(default_factory=list)
    # answers 示例: [{"num": 1, "ans": "A"}, {"num": 2, "ans": "TRUE"}]


@dataclass
class ParseResult:
    source: str                      # PDF 绝对路径
    stem: str                        # 文件名（无后缀），用于前端标题
    total_pages: int
    has_scan: bool                   # 是否含扫描页
    pages: list[PageResult]


# ── 内部工具 ──────────────────────────────────────────────────────────────────

def _is_scan_page(page: fitz.Page) -> bool:
    """可提取文字字符数低于阈值 → 扫描页。"""
    return len(page.get_text().strip()) < SCAN_TEXT_THRESHOLD


def _infer_role(text: str, page_type: str) -> str:
    """
    根据文字内容推断页面角色。
    - 含答案特征词，或含大量答案行 → "answer"
    - 否则 → "content"（文章/题目页）
    """
    if _ANSWER_KEYWORDS.search(text):
        return "answer"
    # 统计符合答案格式的行数
    answer_lines = sum(1 for line in text.splitlines() if _ANSWER_RE.match(line))
    if answer_lines >= 3:
        return "answer"
    return "content" if page_type == "text" else "unknown"


def _extract_clean_text(page: fitz.Page) -> str:
    """
    使用 block 级提取避免段落内的伪换行。
    PyMuPDF 的 get_text("blocks") 每个 block 对应一个视觉段落；
    block 内部的 \\n 是 PDF 排版的换行，并非真正的段落分隔，应合并为空格。

    特殊处理：
    1. 段落标记（单独的 A, B, C... 等）保持独立
    2. 题号、选项字母保留换行
    3. 副标题（较短的行）智能识别
    """
    try:
        blocks = page.get_text("blocks")
        if not blocks:
            return page.get_text()

        blocks.sort(key=lambda b: (b[1], b[0]))  # 按 y 后 x 排序

        parts: list[str] = []
        for block in blocks:
            if block[6] != 0:          # 跳过图片 block
                continue
            text = block[4].strip()
            if not text:
                continue

            lines = [l.strip() for l in text.split("\n") if l.strip()]
            merged: list[str] = []
            for i, line in enumerate(lines):
                # 1. 段落标记：单独的大写字母（A-Z）或单字母开头的简短行
                is_paragraph_marker = bool(re.match(r"^[A-Z]$", line) or
                                          re.match(r"^[A-Z]\s.{0,30}$", line))

                # 2. 题号或选项字母开头
                is_question_item = bool(re.match(r"^(\d{1,2}\s*[.)]\s+|[A-D]\s*[.)]\s+)", line))

                # 3. 副标题判断：较短的行（可能是副标题的一部分）
                is_short_line = len(line) < 60

                # 4. 以小写字母开头的行（可能是上一句的延续）
                starts_with_lowercase = line[0].islower() if line else False

                # 决定是否合并到上一行
                should_merge = (merged and
                               not is_paragraph_marker and
                               not is_question_item and
                               (not is_short_line or starts_with_lowercase))

                if should_merge:
                    merged[-1] += " " + line
                else:
                    merged.append(line)

            parts.append("\n".join(merged))

        return "\n\n".join(parts)
    except Exception:
        return page.get_text()


def _extract_answers(text: str) -> list[dict]:
    """从文字中抽取 '序号.选项' 格式的基础答案。"""
    results = []
    for line in text.splitlines():
        m = _ANSWER_RE.match(line)
        if m:
            results.append({"num": int(m.group(1)), "ans": m.group(2).upper()})
    return results


def _render_screenshot(page: fitz.Page, output_dir: Path, page_num: int) -> str:
    """
    将 PDF 页渲染为 PNG 截图并保存。
    这是扫描页的必须操作——前端交卷后需要展示原图供用户核查专家解释。
    返回截图的绝对路径字符串。
    """
    mat = fitz.Matrix(IMAGE_SCALE, IMAGE_SCALE)
    pix = page.get_pixmap(matrix=mat, alpha=False)
    dest = output_dir / f"screenshot_{page_num:03d}.png"
    pix.save(str(dest))
    return str(dest)


def _get_ocr_reader() -> "easyocr.Reader":
    """单例：EasyOCR Reader 首次调用时初始化，后续复用，避免重复加载模型。"""
    import easyocr  # 延迟导入，仅在实际调用时加载
    import tempfile
    
    # 使用临时目录存储模型，避免权限问题
    if not hasattr(_get_ocr_reader, "_instance"):
        model_storage_dir = Path(tempfile.gettempdir()) / "easyocr_models"
        model_storage_dir.mkdir(parents=True, exist_ok=True)
        _get_ocr_reader._instance = easyocr.Reader(
            ["en"], 
            gpu=False,
            model_storage_directory=str(model_storage_dir)
        )
    return _get_ocr_reader._instance


def _ocr_text(image_path: str) -> str:
    """
    使用 EasyOCR 对图片进行本地文字识别，零 Token / 零网络成本。
    返回识别出的纯文本（每行一条结果）。
    """
    try:
        reader = _get_ocr_reader()
        results = reader.readtext(image_path, detail=0)
        return "\n".join(results)
    except Exception as e:
        print(f"OCR 识别失败: {e}")
        return ""


# ── 公开 API：PDF 解析 ────────────────────────────────────────────────────────

def parse_pdf(pdf_path: str | Path, output_dir: str | Path) -> dict:
    """
    解析 PDF，将截图和 result.json 写入 output_dir。

    Parameters
    ----------
    pdf_path   : PDF 文件路径
    output_dir : 输出目录（自动创建）

    Returns
    -------
    dict  与写出的 result.json 内容完全一致

    页面处理规则
    ------------
    文字页
      - 全量提取文本 → text 字段
      - screenshot_path = null（无需截图）
      - 若角色推断为 answer → 同时抽取 answers 列表

    扫描页
      - 必须保存截图 → screenshot_path（交卷后前端展示原图）
      - 尝试 OCR → 抽取基础答案 → answers 列表
      - text 字段保留 OCR 原始结果（OCR 启用后填充）
    """
    pdf_path = Path(pdf_path).resolve()
    output_dir = Path(output_dir).resolve()
    output_dir.mkdir(parents=True, exist_ok=True)

    # 读取文件内容到内存，避免文件锁定问题
    with open(pdf_path, 'rb') as f:
        pdf_content = f.read()
    
    # 使用字节数据打开 PDF
    doc = fitz.open("pdf", pdf_content)
    pages: list[PageResult] = []

    for idx in range(len(doc)):
        page = doc[idx]
        page_num = idx + 1

        if _is_scan_page(page):
            # ── 扫描页处理 ──────────────────────────────────────────────────
            # 1. 必须保存截图（交卷后核查专家解释的唯一依据）
            screenshot_path = _render_screenshot(page, output_dir, page_num)

            # 2. 尝试 OCR 抽取文字（当前为预留接口）
            ocr_text = _ocr_text(screenshot_path)
            answers = _extract_answers(ocr_text)
            role = _infer_role(ocr_text, "scan")

            pages.append(PageResult(
                page_num=page_num,
                role=role,
                page_type="scan",
                text=ocr_text,           # OCR 启用后有内容；否则为 ""
                screenshot_path=screenshot_path,
                answers=answers,
            ))

        else:
            # ── 文字页处理 ──────────────────────────────────────────────────
            text = _extract_clean_text(page)
            role = _infer_role(text, "text")
            # 答案页：抽取基础答案；内容页：answers 为空
            answers = _extract_answers(text) if role == "answer" else []

            pages.append(PageResult(
                page_num=page_num,
                role=role,
                page_type="text",
                text=text,
                screenshot_path=None,   # 文字页无需截图
                answers=answers,
            ))

    doc.close()

    result = ParseResult(
        source=str(pdf_path),
        stem=pdf_path.stem,
        total_pages=len(pages),
        has_scan=any(p.page_type == "scan" for p in pages),
        pages=pages,
    )
    result_dict = asdict(result)

    json_path = output_dir / "result.json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(result_dict, f, ensure_ascii=False, indent=2)

    return result_dict


# ── 公开 API：图片上传解析 ────────────────────────────────────────────────────

def parse_images(image_paths: list[str | Path], output_dir: str | Path) -> dict:
    """
    将用户上传的图片列表通过本地 OCR 转化为练习 JSON。

    Parameters
    ----------
    image_paths : 图片文件路径列表（jpg / png / webp 均可）
    output_dir  : 输出目录

    Returns
    -------
    dict  结构与 parse_pdf 输出一致，page_type 统一为 "scan"

    注意
    ----
    - OCR 识别失败时，text 字段为空，answers 为空列表。
    - 若某张图片无答案，前端应提示用户"仅显示文章/题目，不进行判分"。
    """
    output_dir = Path(output_dir).resolve()
    output_dir.mkdir(parents=True, exist_ok=True)

    pages: list[PageResult] = []

    for idx, img_path in enumerate(image_paths):
        img_path = Path(img_path).resolve()
        page_num = idx + 1

        # 将原图复制（或直接引用）作为截图
        screenshot_path = str(img_path)

        # OCR 识别
        ocr_text = _ocr_text(str(img_path))
        answers = _extract_answers(ocr_text)
        role = _infer_role(ocr_text, "scan")

        pages.append(PageResult(
            page_num=page_num,
            role=role,
            page_type="scan",
            text=ocr_text,
            screenshot_path=screenshot_path,
            answers=answers,
        ))

    result = {
        "source": "image_upload",
        "stem": "uploaded_images",
        "total_pages": len(pages),
        "has_scan": True,
        "has_answers": any(len(p.answers) > 0 for p in pages),
        # has_answers=False 时前端应提示用户"仅显示题目，不判分"
        "pages": [asdict(p) for p in pages],
    }

    json_path = output_dir / "result.json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    return result


# ── CLI 快速验证 ──────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import sys

    if len(sys.argv) < 3:
        print("PDF 解析:   python -m app.parser pdf  <pdf路径>    <输出目录>")
        print("图片解析:   python -m app.parser img  <图片1> [图片2 ...] <输出目录>")
        sys.exit(1)

    mode = sys.argv[1]

    if mode == "pdf":
        out = parse_pdf(sys.argv[2], sys.argv[3])
        scan_pages = [p for p in out["pages"] if p["page_type"] == "scan"]
        print(f"解析完成：共 {out['total_pages']} 页，扫描页 {len(scan_pages)} 页")
        if scan_pages:
            print("截图路径示例：", scan_pages[0]["screenshot_path"])
        print(f"JSON 已写入：{sys.argv[3]}/result.json")

    elif mode == "img":
        *imgs, out_dir = sys.argv[2:]
        out = parse_images(imgs, out_dir)
        print(f"图片解析完成：共 {out['total_pages']} 张")
        print(f"含答案：{'是' if out['has_answers'] else '否（前端不判分）'}")
        print(f"JSON 已写入：{out_dir}/result.json")
