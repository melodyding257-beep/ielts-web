'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      router.push('/dashboard');
    }, 1000);
  };

  const handleGuestMode = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 relative overflow-hidden">
      <div 
        className="absolute w-[400px] h-[400px] rounded-full -top-[100px] -right-[100px] float-animation"
        style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,0.03) 0%, rgba(0,0,0,0.01) 100%)',
        }}
      />
      <div 
        className="absolute w-[300px] h-[300px] rounded-full -bottom-[80px] -left-[80px] float-animation"
        style={{
          background: 'linear-gradient(225deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.01) 100%)',
        }}
      />

      <div className="w-full max-w-[440px] relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-[72px] h-[72px] bg-black/[0.04] backdrop-blur-[10px] border border-black/[0.08] rounded-[20px] mb-6 transition-all duration-300 hover:bg-black/[0.06]">
            <svg className="w-9 h-9 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-[32px] font-semibold text-black mb-3 tracking-tight">IELTS Reading</h1>
          <p className="text-black/50 text-[15px]">专业雅思阅读机考平台</p>
        </div>

        <div className="bg-white/70 backdrop-blur-[20px] backdrop-saturate-[180%] rounded-[24px] border border-black/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="flex p-2 bg-black/[0.02] border-b border-black/[0.06]">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 text-sm font-medium rounded-xl transition-all duration-300 ${
                isLogin
                  ? 'bg-black text-white'
                  : 'bg-transparent text-black/50 hover:text-black/70'
              }`}
            >
              登录
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 text-sm font-medium rounded-xl transition-all duration-300 ml-2 ${
                !isLogin
                  ? 'bg-black text-white'
                  : 'bg-transparent text-black/50 hover:text-black/70'
              }`}
            >
              注册
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-10">
            {!isLogin && (
              <div className="mb-6">
                <label className="block text-[13px] font-medium text-black/70 mb-2 tracking-wide">
                  姓名
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3.5 border border-black/10 bg-black/[0.02] rounded-xl text-[15px] text-black transition-all duration-300 focus:outline-none focus:border-black/30 focus:bg-black/[0.04]"
                  placeholder="输入姓名"
                  required={!isLogin}
                />
              </div>
            )}

            <div className="mb-6">
              <label className="block text-[13px] font-medium text-black/70 mb-2 tracking-wide">
                邮箱地址
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 border border-black/10 bg-black/[0.02] rounded-xl text-[15px] text-black transition-all duration-300 focus:outline-none focus:border-black/30 focus:bg-black/[0.04]"
                placeholder="your@email.com"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-[13px] font-medium text-black/70 mb-2 tracking-wide">
                密码
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 border border-black/10 bg-black/[0.02] rounded-xl text-[15px] text-black transition-all duration-300 focus:outline-none focus:border-black/30 focus:bg-black/[0.04]"
                placeholder="••••••••"
                required
              />
            </div>

            {!isLogin && (
              <div className="mb-8">
                <label className="block text-[13px] font-medium text-black/70 mb-2 tracking-wide">
                  确认密码
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3.5 border border-black/10 bg-black/[0.02] rounded-xl text-[15px] text-black transition-all duration-300 focus:outline-none focus:border-black/30 focus:bg-black/[0.04]"
                  placeholder="••••••••"
                  required={!isLogin}
                />
              </div>
            )}

            {isLogin && (
              <div className="flex items-center justify-between mb-8">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-[18px] h-[18px] cursor-pointer accent-black"
                  />
                  <span className="ml-2 text-sm text-black/60">记住登录</span>
                </label>
                <button type="button" className="text-sm text-black/60 font-medium hover:text-black transition-colors">
                  忘记密码
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3.5 px-4 rounded-xl font-medium transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(0,0,0,0.15)] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mb-4"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  处理中...
                </span>
              ) : (
                isLogin ? '登录' : '创建账户'
              )}
            </button>

            <div className="my-8 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-black/[0.08]"></div>
              </div>
              <div className="relative flex justify-center text-[13px]">
                <span className="px-4 bg-white/90 text-black/40">或</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGuestMode}
              className="w-full bg-black/[0.04] text-black/80 py-3.5 px-4 rounded-xl font-medium border border-black/10 transition-all duration-300 hover:bg-black/[0.08] hover:border-black/20 focus:outline-none"
            >
              游客模式
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-black/50 mt-8">
          {isLogin ? (
            <>
              还没有账户？{' '}
              <button
                onClick={() => setIsLogin(false)}
                className="text-black font-medium hover:opacity-70 transition-opacity"
              >
                立即注册
              </button>
            </>
          ) : (
            <>
              已有账户？{' '}
              <button
                onClick={() => setIsLogin(true)}
                className="text-black font-medium hover:opacity-70 transition-opacity"
              >
                立即登录
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}