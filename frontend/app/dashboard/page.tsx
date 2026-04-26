'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  name: string;
  email: string;
  avatar?: string;
}

interface PracticeRecord {
  id: string;
  title: string;
  score: number;
  total: number;
  time: string;
  date: string;
}

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
}

export default function Dashboard() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(true);
  const [showRecords, setShowRecords] = useState(false);
  const [showFiles, setShowFiles] = useState(false);
  const [showAvatarUpload, setShowAvatarUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [practiceRecords] = useState<PracticeRecord[]>([
    {
      id: '1',
      title: '机经10 Passage 1',
      score: 15,
      total: 20,
      time: '15:32',
      date: '2026-04-20 14:30'
    },
    {
      id: '2',
      title: '机经22 Passage 2',
      score: 18,
      total: 20,
      time: '17:45',
      date: '2026-04-19 10:15'
    },
    {
      id: '3',
      title: '机经23 Passage 2',
      score: 12,
      total: 20,
      time: '14:20',
      date: '2026-04-18 16:45'
    }
  ]);

  const [uploadedFiles] = useState<UploadedFile[]>([
    {
      id: '1',
      name: 'Star Performers.pdf',
      type: 'PDF',
      size: '643 KB',
      uploadDate: '2026-04-20'
    },
    {
      id: '2',
      name: 'Recent research.pdf',
      type: 'PDF',
      size: '1.5 MB',
      uploadDate: '2026-04-19'
    }
  ]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setIsGuest(false);
      
      // 加载保存的头像
      const savedAvatar = localStorage.getItem('userAvatar');
      if (savedAvatar) {
        setAvatarPreview(savedAvatar);
      }
    } else {
      setIsGuest(true);
    }
  }, []);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    const fileType = file.type;

    if (!fileType.includes('pdf') && !fileType.includes('image')) {
      alert('只支持 PDF 和图片格式！');
      return;
    }

    setUploading(true);

    try {
      // 创建 FormData
      const formData = new FormData();
      formData.append('file', file);

      // 获取 API 地址（优先使用环境变量，开发环境使用本地地址）
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
      
      // 调用后端 API
      const response = await fetch(`${apiUrl}/api/v1/upload/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('上传失败');
      }

      const result = await response.json();
      console.log('解析结果:', result);
      
      // 将解析结果保存到 localStorage，供练习页面使用
      localStorage.setItem('parsedResult', JSON.stringify(result));
      
      setUploading(false);
      alert('文件上传并解析成功！');
      router.push('/practice');
    } catch (error) {
      console.error('上传失败:', error);
      setUploading(false);
      alert('上传失败，请重试');
    }
  };

  const handleAvatarUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件！');
      return;
    }

    // 验证文件大小（最大 5MB）
    if (file.size > 5 * 1024 * 1024) {
      alert('图片大小不能超过 5MB！');
      return;
    }

    // 读取文件并预览
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setAvatarPreview(result);
      
      // 保存到 localStorage
      localStorage.setItem('userAvatar', result);
      
      // 更新用户信息
      if (user) {
        const updatedUser = { ...user, avatar: result };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      alert('头像上传成功！');
      setShowAvatarUpload(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userAvatar');
      router.push('/auth');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Bar */}
      <div className="h-20 bg-white border-b border-black/[0.08] flex items-center justify-center px-12">
        <h1 className="text-[26px] font-bold text-black tracking-tight">
          IELTS Reading Practice · 雅思阅读机考平台
        </h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center px-16 py-10 overflow-y-auto">
        
        {/* User Info & Actions Row */}
        <div className="w-full max-w-[1000px] flex items-center justify-between mb-12">
          
          {/* Left - User Info */}
          <div className="flex items-center gap-3.5">
            {isGuest ? (
              <>
                <div className="w-12 h-12 bg-black/[0.08] rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-black/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <div className="text-base font-semibold text-black/60">游客模式</div>
                  <div className="text-sm text-black/40">未登录</div>
                </div>
              </>
            ) : (
              <>
                <div 
                  className="relative w-12 h-12 rounded-full cursor-pointer group"
                  onClick={() => setShowAvatarUpload(true)}
                >
                  {avatarPreview ? (
                    <img 
                      src={avatarPreview} 
                      alt="Avatar" 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                      <span className="text-white text-lg font-semibold">
                        {user?.name?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <div className="text-base font-semibold text-black">{user?.name}</div>
                  <div className="text-sm text-black/50">已登录</div>
                </div>
              </>
            )}
          </div>

          {/* Right - Action Buttons */}
          <div className="flex items-center gap-3">
            {!isGuest && (
              <>
                <button
                  onClick={() => setShowRecords(true)}
                  className="flex items-center gap-2.5 px-5 py-3 bg-black/[0.04] hover:bg-black/[0.08] rounded-lg transition-all hover:-translate-y-0.5"
                >
                  <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span className="text-[15px] font-medium">做题记录</span>
                </button>

                <button
                  onClick={() => setShowFiles(true)}
                  className="flex items-center gap-2.5 px-5 py-3 bg-black/[0.04] hover:bg-black/[0.08] rounded-lg transition-all hover:-translate-y-0.5"
                >
                  <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-[15px] font-medium">我的文件</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-5 py-3 border border-black/10 hover:bg-black/[0.05] hover:border-black/20 rounded-lg transition-all"
                >
                  <svg className="w-[18px] h-[18px] text-black/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="text-sm font-medium text-black/70">退出登录</span>
                </button>
              </>
            )}

            {isGuest && (
              <button
                onClick={() => router.push('/auth')}
                className="flex items-center gap-2 px-5 py-3 bg-black text-white rounded-lg hover:-translate-y-0.5 transition-all"
              >
                <span className="text-sm font-medium">立即登录</span>
              </button>
            )}
          </div>
        </div>

        {/* Upload Section */}
        <div className="w-full max-w-[680px]">
          
          {/* Welcome Text */}
          <div className="text-center mb-10">
            <h2 className="text-[28px] font-semibold text-black mb-2">开始新的练习</h2>
            <p className="text-[15px] text-black/50">上传 PDF 或图片文件开始练习</p>
          </div>

          {/* Upload Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-[20px] p-12 transition-all cursor-pointer ${
              dragActive
                ? 'border-black bg-black/[0.02]'
                : 'border-black/[0.15] hover:border-black/[0.3] hover:bg-black/[0.01] bg-black/[0.005]'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,image/*"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
            />

            {uploading ? (
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 border-3 border-black/[0.1] border-t-black rounded-full animate-spin"></div>
                <p className="text-base font-medium text-black">上传中...</p>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-5 bg-black/[0.04] rounded-[14px] flex items-center justify-center">
                  <svg className="w-8 h-8 text-black/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>

                <h3 className="text-lg font-semibold text-black mb-1.5">上传练习材料</h3>
                <p className="text-[13px] text-black/50 mb-6">
                  支持 PDF 和图片格式（JPG, PNG）
                </p>

                <button className="px-7 py-3 bg-black text-white rounded-lg text-sm font-medium hover:-translate-y-0.5 hover:shadow-lg transition-all">
                  选择文件
                </button>

                <p className="text-xs text-black/35 mt-4">
                  或拖拽文件到此区域
                </p>
              </div>
            )}
          </div>

          {/* Guest Notice */}
          {isGuest && (
            <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="text-[13px] font-semibold text-amber-900 mb-1">游客模式提醒</p>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    当前为游客模式，做题记录和上传文件不会被保存。
                    <button
                      onClick={() => router.push('/auth')}
                      className="ml-1 underline font-medium hover:text-amber-900"
                    >
                      立即登录
                    </button>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Stats */}
          {!isGuest && (
            <div className="mt-12 grid grid-cols-3 gap-4">
              <div className="text-center p-5 bg-black/[0.02] rounded-xl hover:bg-black/[0.04] hover:-translate-y-0.5 transition-all cursor-pointer">
                <div className="text-[28px] font-bold text-black mb-1">12</div>
                <div className="text-xs text-black/50 font-medium">练习次数</div>
              </div>
              <div className="text-center p-5 bg-black/[0.02] rounded-xl hover:bg-black/[0.04] hover:-translate-y-0.5 transition-all cursor-pointer">
                <div className="text-[28px] font-bold text-black mb-1">78%</div>
                <div className="text-xs text-black/50 font-medium">平均正确率</div>
              </div>
              <div className="text-center p-5 bg-black/[0.02] rounded-xl hover:bg-black/[0.04] hover:-translate-y-0.5 transition-all cursor-pointer">
                <div className="text-[28px] font-bold text-black mb-1">5</div>
                <div className="text-xs text-black/50 font-medium">上传文件</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Avatar Upload Modal */}
      {showAvatarUpload && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-black/[0.08] flex items-center justify-between">
              <h3 className="text-xl font-semibold text-black">上传头像</h3>
              <button
                onClick={() => setShowAvatarUpload(false)}
                className="p-2 hover:bg-black/[0.05] rounded-lg transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              {/* Preview */}
              <div className="flex justify-center mb-6">
                {avatarPreview ? (
                  <img 
                    src={avatarPreview} 
                    alt="Avatar Preview" 
                    className="w-32 h-32 rounded-full object-cover border-4 border-black/[0.08]"
                  />
                ) : (
                  <div className="w-32 h-32 bg-black rounded-full flex items-center justify-center border-4 border-black/[0.08]">
                    <span className="text-white text-4xl font-semibold">
                      {user?.name?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
              </div>

              {/* Upload Button */}
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleAvatarUpload(e.target.files)}
                className="hidden"
              />

              <button
                onClick={() => avatarInputRef.current?.click()}
                className="w-full px-6 py-3 bg-black text-white rounded-lg font-medium hover:-translate-y-0.5 hover:shadow-lg transition-all mb-3"
              >
                选择图片
              </button>

              {avatarPreview && (
                <button
                  onClick={() => {
                    setAvatarPreview(null);
                    localStorage.removeItem('userAvatar');
                    if (user) {
                      const updatedUser = { ...user };
                      delete updatedUser.avatar;
                      setUser(updatedUser);
                      localStorage.setItem('user', JSON.stringify(updatedUser));
                    }
                  }}
                  className="w-full px-6 py-3 border border-black/10 text-black/70 rounded-lg font-medium hover:bg-black/[0.05] transition-all"
                >
                  移除头像
                </button>
              )}

              <p className="text-xs text-black/40 text-center mt-4">
                支持 JPG、PNG 格式，最大 5MB
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Practice Records Modal */}
      {showRecords && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-black/[0.08] flex items-center justify-between">
              <h3 className="text-xl font-semibold text-black">做题记录</h3>
              <button
                onClick={() => setShowRecords(false)}
                className="p-2 hover:bg-black/[0.05] rounded-lg transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
              {practiceRecords.map((record) => (
                <div
                  key={record.id}
                  className="p-4 bg-black/[0.02] hover:bg-black/[0.04] border border-black/[0.06] rounded-xl mb-3 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-black">{record.title}</h4>
                    <span className="text-sm text-black/60">{record.date}</span>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-black/50">得分:</span>
                      <span className="font-semibold text-black">
                        {record.score}/{record.total}
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                        {Math.round((record.score / record.total) * 100)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-black/50">用时:</span>
                      <span className="font-medium text-black">{record.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Uploaded Files Modal */}
      {showFiles && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-black/[0.08] flex items-center justify-between">
              <h3 className="text-xl font-semibold text-black">我的文件</h3>
              <button
                onClick={() => setShowFiles(false)}
                className="p-2 hover:bg-black/[0.05] rounded-lg transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className="p-4 bg-black/[0.02] hover:bg-black/[0.04] border border-black/[0.06] rounded-xl mb-3 flex items-center justify-between transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-black text-sm">{file.name}</h4>
                      <p className="text-xs text-black/50">
                        {file.size} · {file.uploadDate}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => router.push('/practice')}
                      className="px-3 py-1.5 bg-black text-white rounded-lg text-xs font-medium hover:bg-black/80 transition-all"
                    >
                      开始练习
                    </button>
                    <button className="p-2 hover:bg-black/[0.05] rounded-lg transition-all">
                      <svg className="w-4 h-4 text-black/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
