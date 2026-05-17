'use client';

import { useState, useEffect, useCallback, type ReactNode } from 'react';
import QuestionNav from './components/QuestionNav';

type QuestionType = 'mc' | 'tfng' | 'matching_sentence' | 'matching_table' | 'fill_in';

interface Question {
  id: number;
  type: QuestionType;
  text: string;
  options?: string[];
  correctAnswer?: number | string | { [key: string]: string };
  userAnswer?: number | string;
  optionsPool?: { letter: string; text: string }[];
  tableColumns?: string[];
  tableRows?: { id?: number; question?: string; text?: string; correctColumn?: string; correctAnswer?: string }[];
  fillBlanks?: { id: number; textBefore?: string; textAfter?: string }[];
  instruction?: string;
}

interface PracticeData {
  passage: string;
  questions: Question[];
  keep_screenshot: boolean;
  screenshot_path: string;
}

interface Highlight {
  id: string;
  text: string;
  startOffset: number;
  endOffset: number;
  paragraphIndex: number;
}

interface Note {
  id: string;
  selectedText: string;
  content: string;
}

// Mock 数据（作为后备）
const defaultMockData: PracticeData = {
  passage: `Reading Passage

You should spend about 20 minutes on Questions 1-20, which are based on Reading Passage below.

Howler Monkeys in La Pacifica

A. The howler monkey, known for its distinctive loud call that can be heard up to three miles away, is one of the most common primates found in the forests of Central America. In the La Pacifica region of Costa Rica, howler monkeys have shown remarkable adaptability compared to other primate species such as spider monkeys and capuchin monkeys.

B. Research conducted over the past decade has revealed interesting survival strategies employed by howler monkeys. Unlike spider monkeys that rely heavily on ripe fruit, howlers have a more flexible diet that includes leaves, fruits, and flowers. This dietary flexibility allows them to thrive even when fruit is scarce.

C. One key factor in their survival is their ability to digest mature leaves that contain toxins. Howler monkeys possess a specialized digestive system that neutralizes these toxins, enabling them to feed on vegetation that other primates cannot consume. This gives them a competitive advantage during times of food scarcity.

D. The rate of reduction in forest habitats has been alarming, with deforestation affecting primate populations across Central America. However, howler monkeys have demonstrated greater resilience compared to spider and capuchin monkeys, showing higher population stability in fragmented habitats.

E. Another contributing factor is their relatively faster reproductive rate. Howler monkeys reach sexual maturity at around three years of age and typically produce offspring every two years, compared to spider monkeys which have longer interbirth intervals.

F. Farmers' changing attitudes toward wildlife have also played a role. Increasingly, landowners are recognizing the ecological importance of primates and are implementing measures to protect habitats and create wildlife corridors.

G. Howler monkeys' ability to survive away from open streams and water holes is another advantage. The leaves they consume contain high water content, reducing their dependence on standing water sources.

H. In conclusion, the howler monkey's dietary flexibility, efficient digestive system, and adaptable behavior have positioned it as a survivor in the changing landscapes of Central America. While challenges remain, their ability to thrive in fragmented habitats offers hope for their continued existence.`,
  questions: [
    {
      id: 1,
      type: 'mc',
      text: 'What is the main reason howler monkeys can survive better than other primates in La Pacifica?',
      options: [
        'They have a more attractive appearance',
        'They have a flexible diet including leaves',
        'They are smaller in size',
        'They live in larger groups'
      ],
      correctAnswer: 1
    },
    {
      id: 2,
      type: 'mc',
      text: 'What allows howler monkeys to eat mature leaves that other primates cannot?',
      options: [
        'Stronger teeth',
        'A specialized digestive system',
        'Better eyesight',
        'Longer limbs'
      ],
      correctAnswer: 1
    },
    {
      id: 3,
      type: 'tfng',
      text: 'Howler monkeys can be heard from more than five miles away.',
      correctAnswer: 'FALSE'
    },
    {
      id: 4,
      type: 'tfng',
      text: 'Spider monkeys have a more varied diet than howler monkeys.',
      correctAnswer: 'FALSE'
    },
    {
      id: 5,
      type: 'tfng',
      text: 'Farmers in Costa Rica are becoming more aware of wildlife conservation.',
      correctAnswer: 'TRUE'
    },
    {
      id: 6,
      type: 'tfng',
      text: 'Howler monkeys prefer to live near water sources.',
      correctAnswer: 'NOT GIVEN'
    },
    {
      id: 7,
      type: 'matching_sentence',
      text: 'Questions 7-10\nComplete each sentence with the correct ending, A-E, below.\nWrite the correct letter, A-E, in boxes 7-10 on your answer sheet.',
      fillBlanks: [
        { id: 7, textBefore: 'Howler monkeys can survive when fruit is scarce because', textAfter: '' },
        { id: 8, textBefore: 'The specialized digestive system of howlers allows them to', textAfter: '' },
        { id: 9, textBefore: 'Compared to spider monkeys, howlers have', textAfter: '' },
        { id: 10, textBefore: 'Farmers are helping primate conservation by', textAfter: '' }
      ],
      optionsPool: [
        { letter: 'A', text: 'neutralize toxins in mature leaves' },
        { letter: 'B', text: 'implementing habitat protection measures' },
        { letter: 'C', text: 'they can eat leaves and flowers' },
        { letter: 'D', text: 'a faster reproductive rate' },
        { letter: 'E', text: 'living in smaller social groups' }
      ],
      correctAnswer: { '7': 'C', '8': 'A', '9': 'D', '10': 'B' }
    },
    {
      id: 11,
      type: 'matching_table',
      text: 'Questions 11-16\nThe reading passage has eight paragraphs A-H.\nWhich paragraph contains the following information?\nWrite the correct letter A-H, in boxes 11-16 on your answer sheet.',
      tableColumns: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
      tableRows: [
        { question: 'A description of howler monkey feeding habits', correctColumn: 'B' },
        { question: 'Reference to the rate of habitat destruction', correctColumn: 'D' },
        { question: 'Comparison of reproductive rates', correctColumn: 'E' },
        { question: 'Farmers changing attitudes', correctColumn: 'F' },
        { question: 'Water conservation abilities', correctColumn: 'G' },
        { question: 'Conclusion summarizing findings', correctColumn: 'H' }
      ]
    },
    {
      id: 17,
      type: 'fill_in',
      text: 'Complete the sentences below.\nChoose NO MORE THAN TWO WORDS from the passage for each answer.\nWrite your answers in boxes 17-20 on your answer sheet.\n\nThe reasons why howler monkeys survive better in local region than other two species:',
      fillBlanks: [
        { id: 17, textBefore: 'Howlers can feed themselves with leaves when ', textAfter: 'is not easily found.' },
        { id: 18, textBefore: 'They have better ability to alleviate the ', textAfter: 'in leaves.' },
        { id: 19, textBefore: 'Compared to spider monkeys, the ', textAfter: 'rate of howlers is relatively faster.' },
        { id: 20, textBefore: 'The leaves howlers eat hold high content of ', textAfter: '.' }
      ],
      correctAnswer: { '17': 'fruit', '18': 'toxins', '19': 'reproductive', '20': 'water' }
    }
  ],
  keep_screenshot: true,
  screenshot_path: "/samples/UI图片/屏幕截图 2026-04-17 150004.png"
};

// ── IELTS 题目解析工具 ────────────────────────────────────────────────────────

/**
 * 将所有内容页的文本按"Questions X-Y"标记分割为文章和题目两段。
 * 若找不到标记，则将前半段作为文章，后半段作为题目。
 */
function splitPassageAndQuestions(allText: string): { passage: string; questionsText: string } {
  const markerMatch = allText.match(/\bQuestions?\s+\d+[-–]\d+/i);
  if (markerMatch && markerMatch.index !== undefined && markerMatch.index > 100) {
    return {
      passage: allText.slice(0, markerMatch.index).trim(),
      questionsText: allText.slice(markerMatch.index).trim(),
    };
  }
  // fallback: 按段落数量对半分
  const paras = allText.split('\n\n');
  const mid = Math.ceil(paras.length / 2);
  return {
    passage: paras.slice(0, mid).join('\n\n').trim(),
    questionsText: paras.slice(mid).join('\n\n').trim(),
  };
}

/** 从指令文本推断题型 */
function detectQuestionType(instruction: string): QuestionType {
  const lower = instruction.toLowerCase();
  if (/true\s*[/|]\s*false\s*[/|]\s*not given/i.test(instruction) ||
      /yes\s*[/|]\s*no\s*[/|]\s*not given/i.test(instruction)) {
    return 'tfng';
  }
  if (/choose the correct letter|a,\s*b,\s*c\s*(or\s*d)?/i.test(instruction)) {
    return 'mc';
  }
  if (/complete the|no more than|from the passage/i.test(instruction)) {
    return 'fill_in';
  }
  if (/which paragraph|which section/i.test(instruction)) {
    return 'matching_table';
  }
  if (/correct ending|match each/i.test(instruction)) {
    return 'matching_sentence';
  }
  return 'fill_in';
}

/**
 * 真正解析 PDF 题目文本，提取带序号的问题。
 * 支持 TFNG、MC（含选项）、fill_in（默认）三种常见类型。
 */
function parseIELTSQuestions(questionsText: string, answerPages: any[]): Question[] {
  if (!questionsText.trim()) return defaultMockData.questions;

  const allAnswers: Record<number, string> = {};
  answerPages.forEach((page: any) => {
    (page.answers || []).forEach((a: { num: number; ans: string }) => {
      allAnswers[a.num] = a.ans;
    });
  });

  const questions: Question[] = [];
  // 按段（双换行）切分，再识别题号
  const segments = questionsText.split(/\n{2,}/);

  let currentType: QuestionType = 'fill_in';
  let currentInstruction = '';
  let mcOptions: string[] = [];
  let pendingQuestion: { id: number; text: string } | null = null;
  // 用于收集段落匹配题的表格行和选项池
  let matchingTableRows: { id: number; text: string }[] = [];
  let matchingTableInstruction = '';
  let matchingOptionsPool: { letter: string; text: string }[] = [];

  const pushPending = () => {
    if (!pendingQuestion) return;
    const { id, text } = pendingQuestion;
    if (currentType === 'mc' && mcOptions.length > 0) {
      questions.push({
        id,
        type: 'mc',
        text,
        options: [...mcOptions],
        correctAnswer: typeof allAnswers[id] === 'string'
          ? 'ABCD'.indexOf(allAnswers[id])
          : undefined,
      });
    } else if (currentType === 'tfng') {
      questions.push({
        id,
        type: 'tfng',
        text,
        correctAnswer: allAnswers[id] || 'NOT GIVEN',
      });
    } else if (currentType === 'fill_in') {
      questions.push({
        id,
        type: 'fill_in',
        text,
        fillBlanks: [{ id, textBefore: text, textAfter: '' }],
        correctAnswer: allAnswers[id] ? { [id]: allAnswers[id] } : undefined,
      });
    } else {
      // 其他类型作为填空题处理
      questions.push({
        id,
        type: 'fill_in',
        text,
        fillBlanks: [{ id, textBefore: text, textAfter: '' }],
        correctAnswer: allAnswers[id] ? { [id]: allAnswers[id] } : undefined,
      });
    }
    pendingQuestion = null;
    mcOptions = [];
  };

  const pushMatchingTable = () => {
    if (matchingTableRows.length === 0) return;
    const firstId = matchingTableRows[0].id;

    // 如果没有选项池，使用默认的 A-H
    if (matchingOptionsPool.length === 0) {
      matchingOptionsPool = [
        { letter: 'A', text: 'Option A' },
        { letter: 'B', text: 'Option B' },
        { letter: 'C', text: 'Option C' },
        { letter: 'D', text: 'Option D' },
        { letter: 'E', text: 'Option E' },
        { letter: 'F', text: 'Option F' },
        { letter: 'G', text: 'Option G' },
        { letter: 'H', text: 'Option H' },
      ];
    }

    questions.push({
      id: firstId,
      type: 'matching_table',
      text: matchingTableInstruction,
      optionsPool: [...matchingOptionsPool],
      tableRows: matchingTableRows.map(row => ({
        question: row.text,
        correctColumn: allAnswers[row.id] || undefined,
      })),
    });
    matchingTableRows = [];
    matchingTableInstruction = '';
    matchingOptionsPool = [];
  };

  for (const seg of segments) {
    const trimmed = seg.trim();
    if (!trimmed) continue;

    // 检测 "Questions X-Y" 标记行 → 更新指令上下文
    if (/^Questions?\s+\d+/i.test(trimmed)) {
      // 先处理之前的段落匹配题
      pushMatchingTable();
      // 处理之前的待处理问题
      pushPending();
      currentInstruction = trimmed;
      currentType = detectQuestionType(trimmed);
      continue;
    }

    const lines = trimmed.split('\n');
    for (const line of lines) {
      const stripped = line.trim();
      if (!stripped) continue;

      // MC 选项行：以 A. B. C. D. 开头
      const optionMatch = stripped.match(/^([A-D])\s*[.)]\s+(.+)/);
      if (optionMatch && currentType === 'mc' && pendingQuestion) {
        mcOptions.push(stripped.replace(/^[A-D]\s*[.)]\s+/, '').trim());
        continue;
      }

      // matching_table 选项池：以 A-Z 字母开头
      const poolMatch = stripped.match(/^([A-Z])\s+(.+)/);
      if (poolMatch && currentType === 'matching_table' && matchingTableRows.length === 0) {
        const letter = poolMatch[1];
        const text = poolMatch[2].trim();
        matchingOptionsPool.push({ letter, text });
        continue;
      }

      // 支持格式: 27 text, 27. text, 27) text
      const questionMatch = stripped.match(/^(\d{1,2})[.):]?\s+(.+)/);
      if (questionMatch) {
        const id = parseInt(questionMatch[1], 10);
        const text = questionMatch[2].trim();
        
        // 如果当前是段落匹配题型，收集表格行
        if (currentType === 'matching_table') {
          matchingTableRows.push({ id, text });
        } else {
          // 其他题型，正常处理
          pushPending();
          pendingQuestion = { id, text };
        }
      } else if (stripped.length > 20) {
        // 指令行：更新当前类型
        currentInstruction = stripped;
        currentType = detectQuestionType(stripped);
        // 如果是段落匹配题，保存指令
        if (currentType === 'matching_table') {
          matchingTableInstruction = matchingTableInstruction 
            ? matchingTableInstruction + '\n' + stripped 
            : stripped;
        }
      }
    }
  }
  // 处理最后的段落匹配题
  pushMatchingTable();
  // 处理最后的待处理问题
  pushPending();

  if (questions.length === 0) return defaultMockData.questions;
  return questions;
}

// ── 从 localStorage 获取解析结果 ────────────────────────────────────────────

function getPracticeData(): PracticeData {
  if (typeof window === 'undefined') return defaultMockData;

  try {
    const parsedResult = localStorage.getItem('parsedResult');
    if (parsedResult) {
      const result = JSON.parse(parsedResult);
      console.log('=== 解析结果数据 ===', result);
      
      if (result.pages && result.pages.length > 0) {
        const contentPages = result.pages.filter((p: any) => p.role === 'content');
        const answerPages = result.pages.filter((p: any) => p.role === 'answer');
        const scanPages = result.pages.filter((p: any) => p.page_type === 'scan');

        console.log('内容页数:', contentPages.length);
        console.log('答案页数:', answerPages.length);
        console.log('扫描页数:', scanPages.length);

        // 文章只从 content 页提取
        const passage = contentPages.map((p: any) => p.text).join('\n\n').trim();
        console.log('文章长度:', passage.length);

        // 题目只从 answer 页提取
        const questionsText = answerPages.map((p: any) => p.text).join('\n\n').trim();
        console.log('题目文本长度:', questionsText.length);
        console.log('题目文本前500字符:', questionsText.slice(0, 500));

        // 真正解析题目
        const questions = parseIELTSQuestions(questionsText, answerPages);

        console.log('解析出的题目数量:', questions.length);
        if (questions.length > 0) {
          console.log('第一题:', questions[0]);
        }

        return {
          passage,
          questions,
          keep_screenshot: scanPages.length > 0,
          screenshot_path: scanPages.length > 0 ? scanPages[0].screenshot_path : '',
        };
      }
    }
  } catch (error) {
    console.error('Failed to parse practice data:', error);
  }
  console.log('使用默认 mockData');
  return defaultMockData;
}

function BookmarkIcon({ isBookmarked, onClick }: { isBookmarked: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`ml-2 p-1 hover:bg-gray-100 rounded transition-colors ${
        isBookmarked ? 'text-yellow-500' : 'text-gray-400'
      }`}
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
        <path d="M16 3h6v6h-6zm0 18h6v-6h-6zM4 21h6v-6H4zm0-18h6v6H4z"/>
      </svg>
    </button>
  );
}

function MultipleChoiceQuestion({ question, userAnswers, onAnswerSelect }: { 
  question: Question; 
  userAnswers: (number | string)[]; 
  onAnswerSelect: (questionId: number, answer: number | string) => void 
}) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const selectedAnswer = userAnswers[question.id - 1];

  if (!question.options) return null;

  return (
    <div className="mb-8">
      <div className="flex items-start mb-4">
        <span className="font-bold text-lg mr-3 min-w-[24px]">{question.id}.</span>
        <p className="text-lg font-medium flex-1">{question.text}</p>
        <BookmarkIcon isBookmarked={isBookmarked} onClick={() => setIsBookmarked(!isBookmarked)} />
      </div>
      
      <div className="space-y-2 ml-7">
        {question.options.map((option, index) => (
          <label 
            key={index}
            className={`flex items-center space-x-3 p-2 rounded cursor-pointer transition-colors ${
              selectedAnswer === index
                ? 'bg-[#e6f4ff] border-l-4 border-blue-600'
                : 'hover:bg-gray-50'
            }`}
          >
            <input
              type="radio"
              name={`question-${question.id}`}
              checked={selectedAnswer === index}
              onChange={() => onAnswerSelect(question.id, index)}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-gray-700">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function TrueFalseNotGivenQuestion({ question, userAnswers, onAnswerSelect }: { 
  question: Question; 
  userAnswers: (number | string)[]; 
  onAnswerSelect: (questionId: number, answer: number | string) => void 
}) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const selectedAnswer = userAnswers[question.id - 1];
  const options = ['TRUE', 'FALSE', 'NOT GIVEN'];

  return (
    <div className="mb-8">
      <div className="flex items-start mb-4">
        <span className="font-bold text-lg mr-3 min-w-[24px]">{question.id}.</span>
        <p className="text-lg font-medium flex-1">{question.text}</p>
        <BookmarkIcon isBookmarked={isBookmarked} onClick={() => setIsBookmarked(!isBookmarked)} />
      </div>
      
      <div className="space-y-2 ml-7">
        {options.map((option, index) => (
          <label 
            key={index}
            className={`flex items-center space-x-3 p-2 rounded cursor-pointer transition-colors ${
              selectedAnswer === index
                ? 'bg-[#e6f4ff] border-l-4 border-blue-600'
                : 'hover:bg-gray-50'
            }`}
          >
            <input
              type="radio"
              name={`question-${question.id}`}
              checked={selectedAnswer === index}
              onChange={() => onAnswerSelect(question.id, index)}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-gray-700">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function MatchingSentenceQuestion({ question, userAnswers, onAnswerSelect }: { 
  question: Question; 
  userAnswers: (number | string)[]; 
  onAnswerSelect: (questionId: number, answer: number | string) => void 
}) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  if (!question.fillBlanks || !question.optionsPool) return null;

  const getAnswer = (blankId: number) => {
    return userAnswers[blankId - 1] as string || '';
  };

  const setAnswer = (blankId: number, value: string) => {
    onAnswerSelect(blankId, value.toUpperCase());
  };

  return (
    <div className="mb-8">
      <div className="mb-4">
        <p className="text-base text-gray-700 mb-4 whitespace-pre-line">{question.text}</p>
      </div>
      
      <div className="space-y-2">
        {question.fillBlanks.map((blank) => (
          <div key={blank.id} className="flex items-center flex-wrap gap-2">
            {blank.textBefore && <span className="text-gray-700">{blank.textBefore}</span>}
            <div className="relative">
              <span className="absolute -left-8 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">
                {blank.id}
              </span>
              <input
                type="text"
                value={getAnswer(blank.id)}
                onChange={(e) => setAnswer(blank.id, e.target.value)}
                className="w-40 h-10 border border-gray-300 rounded px-3 text-center focus:outline-none focus:border-blue-500"
                placeholder="输入选项字母"
                maxLength={1}
              />
            </div>
            {blank.textAfter && <span className="text-gray-700">{blank.textAfter}</span>}
          </div>
        ))}
      </div>
      
      <div className="mt-6 bg-gray-100 p-4 rounded">
        <p className="text-sm text-gray-500 mb-3">选项池</p>
        <div className="space-y-2">
          {question.optionsPool.map((option) => (
            <div 
              key={option.letter}
              className="bg-white border border-gray-200 rounded px-3 py-2 cursor-pointer hover:bg-gray-50"
              onClick={() => {
                const emptyBlank = question.fillBlanks?.find(b => !getAnswer(b.id));
                if (emptyBlank) {
                  setAnswer(emptyBlank.id, option.letter);
                }
              }}
            >
              <span className="font-medium text-gray-700">{option.letter}.</span>
              <span className="text-gray-600 ml-2">{option.text}</span>
            </div>
          ))}
        </div>
      </div>
      
      <BookmarkIcon isBookmarked={isBookmarked} onClick={() => setIsBookmarked(!isBookmarked)} />
    </div>
  );
}

function MatchingTableQuestion({ question, userAnswers, onAnswerSelect }: { 
  question: Question; 
  userAnswers: (number | string)[]; 
  onAnswerSelect: (questionId: number, answer: number | string) => void 
}) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  // 支持两种格式：tableColumns/tableRows（旧格式）和 optionsPool（新格式）
  const columns = question.tableColumns || question.optionsPool || [];
  const rows = question.tableRows || [{ id: question.id, text: question.text }];

  if (columns.length === 0 || rows.length === 0) return null;

  const getRowAnswer = (rowIndex: number) => {
    const baseId = question.id + rowIndex;
    return userAnswers[baseId - 1] as string || '';
  };

  const setRowAnswer = (rowIndex: number, column: string) => {
    const baseId = question.id + rowIndex;
    onAnswerSelect(baseId, column);
  };

  // 如果是新格式（单个题目），不需要显示指令文本
  const showInstruction = !!question.tableRows;

  return (
    <div className="mb-8">
      {showInstruction && (
        <div className="mb-4">
          <p className="text-base text-gray-700 whitespace-pre-line">{question.text}</p>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium">Question</th>
              {columns.map((column, index) => {
                const columnKey = typeof column === 'string' ? column : column.letter;
                const columnText = typeof column === 'string' ? column : column.letter;
                return (
                  <th key={columnKey || index} className="border border-gray-300 px-4 py-2 text-center text-sm font-medium w-16">
                    {columnText}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => {
              const selectedColumn = getRowAnswer(rowIndex);
              return (
                <tr 
                  key={rowIndex} 
                  className={selectedColumn ? 'bg-[#e6f4ff]' : 'hover:bg-gray-50'}
                >
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                    <span className="font-medium">{question.id + rowIndex} </span>
                    {row.question || row.text}
                  </td>
                  {columns.map((column, colIndex) => {
                    const columnValue = typeof column === 'string' ? column : column.letter;
                    return (
                      <td key={colIndex} className="border border-gray-300 px-4 py-3">
                        <label className="flex justify-center">
                          <input
                            type="radio"
                            name={`question-${question.id}-row-${rowIndex}`}
                            checked={selectedColumn === columnValue}
                            onChange={() => setRowAnswer(rowIndex, columnValue)}
                            className="w-4 h-4 text-blue-600"
                          />
                        </label>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 选项池显示 */}
      {question.optionsPool && question.optionsPool.length > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-3">
          {question.optionsPool.map((option) => (
            <div key={option.letter} className="flex gap-3 text-sm">
              <span className="font-bold text-gray-900 min-w-[2rem]">{option.letter}</span>
              <span className="text-gray-700">{option.text}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end mt-2">
        <BookmarkIcon isBookmarked={isBookmarked} onClick={() => setIsBookmarked(!isBookmarked)} />
      </div>
    </div>
  );
}

function FillInQuestion({ question, userAnswers, onAnswerSelect }: { 
  question: Question; 
  userAnswers: (number | string)[]; 
  onAnswerSelect: (questionId: number, answer: number | string) => void 
}) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  if (!question.fillBlanks) return null;

  const getAnswer = (blankId: number) => {
    return userAnswers[blankId - 1] as string || '';
  };

  const setAnswer = (blankId: number, value: string) => {
    onAnswerSelect(blankId, value);
  };

  return (
    <div className="mb-8">
      <div className="mb-4">
        <p className="text-base text-gray-700 whitespace-pre-line">{question.text}</p>
      </div>
      
      <div className="border border-gray-300 rounded p-4 bg-white">
        {question.fillBlanks.map((blank, index) => (
          <span key={blank.id} className="inline-block">
            {blank.textBefore && <span className="text-gray-700">{blank.textBefore}</span>}
            <span className="inline-block border border-gray-300 rounded px-2 py-1 min-w-[200px]">
              <span className="text-xs text-gray-500 font-medium mr-2">{blank.id}</span>
              <input
                type="text"
                value={getAnswer(blank.id)}
                onChange={(e) => setAnswer(blank.id, e.target.value)}
                className="bg-transparent text-gray-700 focus:outline-none border-none"
                placeholder=""
              />
            </span>
            {blank.textAfter && <span className="text-gray-700">{blank.textAfter}</span>}
            {index < question.fillBlanks!.length - 1 && <br />}
          </span>
        ))}
      </div>
      
      <div className="flex justify-end mt-2">
        <BookmarkIcon isBookmarked={isBookmarked} onClick={() => setIsBookmarked(!isBookmarked)} />
      </div>
    </div>
  );
}

export default function PracticePage() {
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20 * 60);
  const [userAnswers, setUserAnswers] = useState<(number | string)[]>([]);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [showNoteDrawer, setShowNoteDrawer] = useState(false);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [floatingMenu, setFloatingMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    selectedText: '',
    paragraphIndex: 0,
    startOffset: 0,
    endOffset: 0
  });
  
  // 动态获取练习数据 - 初始使用 mockData（服务端渲染）
  const [practiceData, setPracticeData] = useState<PracticeData>(defaultMockData);
  const [isLoading, setIsLoading] = useState(true);

  // 在客户端初始化数据（避免 SSR Hydration Mismatch）
  useEffect(() => {
    const data = getPracticeData();
    setPracticeData(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isFinished && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isFinished, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionId: number, answer: number | string) => {
    if (!isFinished) {
      setUserAnswers(prev => {
        const newAnswers = [...prev];
        newAnswers[questionId - 1] = answer;
        return newAnswers;
      });
    }
  };

  const handleFinishSection = () => {
    setIsFinished(true);
  };

  const getCorrectCount = () => {
    let count = 0;
    practiceData.questions.forEach((question) => {
      if (question.type === 'matching_sentence' || question.type === 'fill_in') {
        if (question.fillBlanks) {
          question.fillBlanks.forEach((blank) => {
            const userAnswer = userAnswers[blank.id - 1];
            if (typeof question.correctAnswer === 'object' && question.correctAnswer[blank.id.toString()] === userAnswer) {
              count++;
            }
          });
        }
      } else if (question.type === 'matching_table') {
        if (question.tableRows) {
          question.tableRows.forEach((row, index) => {
            const baseId = question.id + index;
            const userAnswer = userAnswers[baseId - 1];
            if (row.correctColumn === userAnswer) {
              count++;
            }
          });
        }
      } else {
        const userAnswer = userAnswers[question.id - 1];
        if (question.correctAnswer === userAnswer) {
          count++;
        }
      }
    });
    return count;
  };

  const handleRetry = () => {
    setUserAnswers([]);
    setIsFinished(false);
    setTimeLeft(20 * 60);
    setHighlights([]);
    setNotes([]);
  };

  const handleExit = () => {
    window.location.href = '/';
  };

  const handlePause = () => {
    alert('Pause functionality would be implemented here');
  };

  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.toString().trim() === '') {
      setFloatingMenu(prev => ({ ...prev, visible: false }));
      return;
    }

    const selectedText = selection.toString().trim();
    if (selectedText.length < 2) {
      setFloatingMenu(prev => ({ ...prev, visible: false }));
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    const passageElement = document.getElementById('reading-passage');
    if (!passageElement) return;

    const paragraphs = passageElement.querySelectorAll('p');
    let paragraphIndex = 0;
    let found = false;
    
    paragraphs.forEach((p, index) => {
      if (p.contains(range.commonAncestorContainer) && !found) {
        paragraphIndex = index;
        found = true;
      }
    });

    setFloatingMenu({
      visible: true,
      x: rect.left + rect.width / 2 - 50,
      y: rect.top - 60,
      selectedText,
      paragraphIndex,
      startOffset: range.startOffset,
      endOffset: range.endOffset
    });
  }, []);

  useEffect(() => {
    document.addEventListener('mouseup', handleTextSelection);
    return () => document.removeEventListener('mouseup', handleTextSelection);
  }, [handleTextSelection]);

  const handleHighlight = () => {
    const newHighlight: Highlight = {
      id: Date.now().toString(),
      text: floatingMenu.selectedText,
      startOffset: floatingMenu.startOffset,
      endOffset: floatingMenu.endOffset,
      paragraphIndex: floatingMenu.paragraphIndex
    };
    setHighlights(prev => [...prev, newHighlight]);
    setFloatingMenu(prev => ({ ...prev, visible: false }));
    window.getSelection()?.removeAllRanges();
  };

  const handleNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      selectedText: floatingMenu.selectedText,
      content: ''
    };
    setNotes(prev => [...prev, newNote]);
    setCurrentNote(newNote);
    setShowNoteDrawer(true);
    setFloatingMenu(prev => ({ ...prev, visible: false }));
    window.getSelection()?.removeAllRanges();
  };

  const handleNoteChange = (content: string) => {
    if (currentNote) {
      setCurrentNote(prev => prev ? { ...prev, content } : null);
      setNotes(prev => prev.map(n => n.id === currentNote.id ? { ...n, content } : n));
    }
  };

  const deleteNote = (noteId: string) => {
    setNotes(prev => prev.filter(n => n.id !== noteId));
    if (currentNote?.id === noteId) {
      setCurrentNote(null);
      setShowNoteDrawer(false);
    }
  };

  const renderHighlightedText = (text: string, paragraphIndex: number) => {
    const paragraphHighlights = highlights.filter(h => h.paragraphIndex === paragraphIndex);
    
    if (paragraphHighlights.length === 0) {
      return text;
    }

    paragraphHighlights.sort((a, b) => a.startOffset - b.startOffset);
    
    let result: ReactNode[] = [];
    let lastIndex = 0;

    paragraphHighlights.forEach((highlight, idx) => {
      if (highlight.startOffset > lastIndex) {
        result.push(<span key={`text-${idx}`}>{text.substring(lastIndex, highlight.startOffset)}</span>);
      }
      result.push(
        <mark 
          key={`highlight-${highlight.id}`} 
          className="bg-[#c08457] text-white px-0.5 rounded"
        >
          {highlight.text}
        </mark>
      );
      lastIndex = highlight.endOffset;
    });

    if (lastIndex < text.length) {
      result.push(<span key="text-end">{text.substring(lastIndex)}</span>);
    }

    return result;
  };

  const formatElapsedTime = () => {
    const elapsed = 20 * 60 - timeLeft;
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderQuestion = (question: Question) => {
    switch (question.type) {
      case 'mc':
        return (
          <MultipleChoiceQuestion 
            question={question} 
            userAnswers={userAnswers} 
            onAnswerSelect={handleAnswerSelect} 
          />
        );
      case 'tfng':
        return (
          <TrueFalseNotGivenQuestion 
            question={question} 
            userAnswers={userAnswers} 
            onAnswerSelect={handleAnswerSelect} 
          />
        );
      case 'matching_sentence':
        return (
          <MatchingSentenceQuestion 
            question={question} 
            userAnswers={userAnswers} 
            onAnswerSelect={handleAnswerSelect} 
          />
        );
      case 'matching_table':
        return (
          <MatchingTableQuestion 
            question={question} 
            userAnswers={userAnswers} 
            onAnswerSelect={handleAnswerSelect} 
          />
        );
      case 'fill_in':
        return (
          <FillInQuestion 
            question={question} 
            userAnswers={userAnswers} 
            onAnswerSelect={handleAnswerSelect} 
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-xl text-gray-500">加载中...</div>
        </div>
      ) : (
        <div className="flex-1 overflow-hidden flex">
          {/* Left Column - Reading Passage */}
          <div className="flex-1 overflow-y-auto p-6 border-r border-gray-300">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-2xl font-bold text-center mb-6 font-serif">Reading Passage</h1>
              <div
                id="reading-passage"
                className="text-lg leading-relaxed font-serif"
                style={{ fontFamily: 'Times New Roman, serif' }}
              >
                {practiceData.passage.split('\n\n').filter(p => p.trim()).map((paragraph, index) => {
                  const trimmed = paragraph.trim();

                  // 检测段落标记（A, B, C... 开头，后面跟空格和段落内容）
                  const paragraphMarkerMatch = trimmed.match(/^([A-Z])(\s+)(.+)$/);
                  if (paragraphMarkerMatch && paragraphMarkerMatch[1].length === 1 && paragraphMarkerMatch[2].length >= 1) {
                    return (
                      <p key={index} className="mb-4">
                        <strong className="font-bold mr-2">{paragraphMarkerMatch[1]}</strong>
                        {renderHighlightedText(paragraphMarkerMatch[3], index)}
                      </p>
                    );
                  }

                  // 检测标题（全大写或加粗文字，较短）
                  if (trimmed.length < 80 && trimmed === trimmed.toUpperCase() && /^[A-Z\s\d]+$/.test(trimmed)) {
                    return (
                      <h3 key={index} className="text-xl font-bold mb-3 mt-6">
                        {trimmed}
                      </h3>
                    );
                  }

                  // 检测副标题（斜体或较短的描述性文字）
                  if (trimmed.length < 100 && !trimmed.match(/^[A-Z]\s/) && index > 0) {
                    const prevPara = practiceData.passage.split('\n\n')[index - 1];
                    if (prevPara && prevPara.length < 80) {
                      return (
                        <p key={index} className="mb-4 italic text-gray-700">
                          {renderHighlightedText(trimmed, index)}
                        </p>
                      );
                    }
                  }

                  // 普通段落
                  return (
                    <p key={index} className="mb-4">
                      {renderHighlightedText(trimmed, index)}
                    </p>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column - Questions */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-3xl mx-auto">
              {/* 动态显示题号范围 */}
              {practiceData.questions.length > 0 && (
                <h2 className="text-xl font-bold mb-6">
                  Questions {practiceData.questions[0].id}-{practiceData.questions[practiceData.questions.length - 1].id}
                </h2>
              )}
              
              {practiceData.questions.map((question) => (
                <div key={question.id}>
                  {renderQuestion(question)}
                </div>
              ))}

            {/* Original Image Analysis */}
            {isFinished && practiceData.keep_screenshot && practiceData.screenshot_path && (
              <div className="mt-8 border-t border-gray-300 pt-6">
                <h3 className="text-lg font-semibold mb-4">解析</h3>
                <img
                  src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'}${practiceData.screenshot_path}`}
                  alt="Original analysis"
                  className="max-w-full h-auto rounded border border-gray-200"
                  onError={(e) => {
                    console.error('截图加载失败:', practiceData.screenshot_path);
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Note Drawer */}
        {showNoteDrawer && (
          <div className="w-80 bg-gray-50 border-l border-gray-300 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-300">
              <span className="font-semibold text-gray-700">NOTE</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowNoteDrawer(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
                <button
                  onClick={() => setShowNoteDrawer(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            </div>
            {notes.length > 0 ? (
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {notes.map(note => (
                  <div 
                    key={note.id} 
                    className="bg-white border border-gray-200 rounded p-3"
                  >
                    <div className="text-blue-600 text-sm font-medium mb-2 truncate">
                      {note.selectedText}
                    </div>
                    <textarea
                      value={note.content}
                      onChange={(e) => {
                        setCurrentNote(note);
                        handleNoteChange(e.target.value);
                      }}
                      placeholder="Record ideas"
                      className="w-full h-24 border-none resize-none focus:outline-none text-gray-700 placeholder-gray-400"
                    />
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="text-blue-500 text-sm float-right hover:text-blue-700"
                    >
                      DELETE
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                No notes yet
              </div>
            )}
          </div>
        )}
      </div>
      )}

      {/* Floating Menu */}
      {floatingMenu.visible && (
        <div 
          className="fixed bg-white rounded-lg shadow-lg border border-gray-200 p-2 flex items-center space-x-4 z-50"
          style={{ left: floatingMenu.x, top: floatingMenu.y }}
        >
          <button
            onClick={handleNote}
            className="flex flex-col items-center justify-center w-12 h-12 hover:bg-gray-100 rounded transition-colors"
            title="Note"
          >
            <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            <span className="text-xs text-gray-500 mt-1">Note</span>
          </button>
          <button
            onClick={handleHighlight}
            className="flex flex-col items-center justify-center w-12 h-12 hover:bg-gray-100 rounded transition-colors"
            title="Highlight"
          >
            <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
            </svg>
            <span className="text-xs text-gray-500 mt-1">Highlight</span>
          </button>
        </div>
      )}

      {/* Bottom Footer - Practice Mode */}
      {!isFinished && (
        <div className="bg-gray-100 border-t border-gray-200 px-6 py-3 flex justify-between items-center">
          <div className="flex-1 overflow-x-auto">
            <QuestionNav
              passageTitle="P1"
              startNum={1}
              endNum={practiceData.questions.length}
              userAnswers={userAnswers}
            />
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-gray-700 font-medium min-w-[50px] text-right">
              {formatTime(timeLeft)}
            </div>

            <svg className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 10h-2a2 2 0 0 0-2-2v-3a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v3a2 2 0 0 0-2 2h2a2 2 0 0 0 2 2v5a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-5a2 2 0 0 0 2-2z"/>
            </svg>

            <svg className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 20a8 8 0 0 0 0-16 8 8 0 0 0 0 16zm0 0v-2a6 6 0 0 0 0-12 6 6 0 0 0 0 12v2z"/>
              <path d="M12 14.5a3.5 3.5 0 0 0 0-7 3.5 3.5 0 0 0 0 7zm0 0v-1.5a2 2 0 0 0 0-4 2 2 0 0 0 0 4v1.5z"/>
            </svg>

            <div className="flex space-x-2">
              <button
                onClick={handleFinishSection}
                className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Finish section
              </button>
              <button
                onClick={handlePause}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded text-sm font-medium hover:bg-gray-400 transition-colors"
              >
                Pause
              </button>
              <button
                onClick={handleExit}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded text-sm font-medium hover:bg-gray-400 transition-colors"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Footer - Result Mode */}
      {isFinished && (
        <div className="bg-gray-100 border-t border-gray-200">
          <div className="px-6 py-2">
            <QuestionNav
              passageTitle="P1"
              startNum={1}
              endNum={practiceData.questions.length}
              userAnswers={userAnswers}
              isFinished={true}
            />
          </div>

          <div className="px-6 py-3 flex justify-between items-center border-t border-gray-200">
            <div className="text-gray-500 text-sm">
              爱听写 机经24 passage 1
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-gray-600 text-sm">
                <span>正确题数: {getCorrectCount()}</span>
                <span className="mx-2">|</span>
                <span>用时: {formatElapsedTime()}</span>
              </div>

              <button
                onClick={handleRetry}
                className="px-4 py-2 bg-orange-500 text-white rounded text-sm font-medium hover:bg-orange-600 transition-colors"
              >
                再练一次
              </button>
              <button
                onClick={handleExit}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded text-sm font-medium hover:bg-gray-400 transition-colors"
              >
                退出
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}