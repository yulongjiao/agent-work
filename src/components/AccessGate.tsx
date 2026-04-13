'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'agent-work-access-granted';

export default function AccessGate({ children }: { children: React.ReactNode }) {
  const [granted, setGranted] = useState<boolean | null>(null);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    setGranted(stored === 'true');
  }, []);

  const handleSubmit = () => {
    if (answer.trim() === '无天') {
      sessionStorage.setItem(STORAGE_KEY, 'true');
      setGranted(true);
      setError(false);
    } else {
      setError(true);
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  // 初始加载中
  if (granted === null) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  // 已验证
  if (granted) {
    return <>{children}</>;
  }

  // 验证界面
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-8">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-12 text-center"
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/10 flex items-center justify-center">
          <span className="text-2xl font-bold text-white">A.</span>
        </div>
        <p className="text-white/40 text-xs tracking-widest uppercase">Access Verification</p>
      </motion.div>

      {/* 问题 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="w-full max-w-[300px]"
      >
        <p className="text-white/80 text-[15px] text-center mb-6 font-medium">
          你在公司里的名字叫什么？
        </p>

        <motion.div
          animate={shaking ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}}
          transition={{ duration: 0.4 }}
        >
          <input
            type="text"
            value={answer}
            onChange={(e) => { setAnswer(e.target.value); setError(false); }}
            onKeyDown={handleKeyDown}
            placeholder="请输入"
            autoFocus
            className={`w-full bg-white/[0.08] border ${
              error ? 'border-red-500/60' : 'border-white/[0.12]'
            } rounded-xl px-4 py-3.5 text-white text-[15px] placeholder:text-white/25 
            focus:outline-none focus:border-white/30 transition-colors text-center`}
          />
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-red-400/80 text-xs text-center mt-3"
            >
              回答不正确
            </motion.p>
          )}
        </AnimatePresence>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSubmit}
          className="w-full mt-5 bg-white text-black font-medium text-[15px] py-3.5 rounded-xl 
          active:bg-white/90 transition-colors"
        >
          验证
        </motion.button>
      </motion.div>

      <p className="text-white/15 text-[11px] mt-16">仅限内部访问</p>
    </div>
  );
}
