"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { progressHaptic, launch, tap } from "@/lib/haptics";

export default function DispatchPage() {
  const router = useRouter();
  const [launched, setLaunched] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const startHold = () => {
    tap();
    let p = 0;
    progressTimer.current = setInterval(() => {
      p += 2;
      setHoldProgress(p);
      progressHaptic(p);
      if (p >= 100) {
        clearInterval(progressTimer.current!);
        launch();
        setLaunched(true);
        setTimeout(() => router.push("/dashboard"), 3000);
      }
    }, 30);
  };

  const endHold = () => {
    if (progressTimer.current) clearInterval(progressTimer.current);
    setHoldProgress(0);
  };

  if (launched) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black px-8">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }} className="mb-8">
          <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><path d="M19.07 4.93A10 10 0 0 0 6.99 3.34" /><path d="M4 6h.01" /><path d="M2.29 9.62A10 10 0 1 0 21.31 8.35" /><path d="M16.24 7.76A6 6 0 1 0 8.23 16.67" /><path d="M12 18h.01" /><circle cx="12" cy="12" r="2" /></svg>
            </div>
          </div>
        </motion.div>
        <motion.h2 className="text-[22px] font-semibold text-white text-center mb-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>Agent 已出发</motion.h2>
        <motion.p className="text-[15px] text-white/60 text-center leading-relaxed max-w-[280px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>你的经纪人正在全网搜寻机会。<br />有进展时会立即通知你。</motion.p>
        <motion.div className="mt-10 flex items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
          <div className="w-2 h-2 bg-[#34C759] rounded-full animate-ripple" />
          <span className="text-[13px] text-[#34C759]">正在扫描 1,247 个岗位...</span>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAFA] relative">
      <motion.button
        className="absolute top-14 left-5 w-8 h-8 flex items-center justify-center rounded-full bg-black/[0.04] z-20"
        whileTap={{ scale: 0.9 }}
        onClick={() => router.back()}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1D1D1F" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
      </motion.button>
      {/* 上半部：状态确认 */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 pt-16 pb-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center w-full">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="w-20 h-20 rounded-full bg-black flex items-center justify-center animate-float">
              <span className="text-white text-[24px] font-semibold">A</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#34C759] border-2 border-[#FAFAFA] flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6 9 17l-5-5" /></svg>
            </div>
          </div>
          <h2 className="text-[22px] font-semibold text-[#1D1D1F] mb-1.5">经纪人已就绪</h2>
          <p className="text-[14px] text-[#86868B]">所有策略配置完毕，随时可以开工</p>
        </motion.div>
      </div>

      {/* 中部：核心价值卡片 */}
      <motion.div className="px-5 pb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="bg-white rounded-2xl border border-black/[0.04] overflow-hidden" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.04)" }}>
          {[
            { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1D1D1F" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>, title: "代理沟通", desc: "与 HR 直接对话，摸清真实薪资和条件" },
            { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1D1D1F" strokeWidth="1.5"><path d="M22 3 2 12l9 2 2 9z" /></svg>, title: "精准筛选", desc: "拦截不达标岗位，只推送值得你看的机会" },
            { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1D1D1F" strokeWidth="1.5"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><path d="m9 12 2 2 4-4" /></svg>, title: "全程辅助", desc: "辅助谈判，以最高概率拿下目标 Offer" },
          ].map((item, i) => (
            <motion.div key={i} className={`flex items-center gap-4 px-5 py-4 ${i < 2 ? "border-b border-black/[0.04]" : ""}`} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }}>
              <div className="w-10 h-10 rounded-xl bg-[#F5F5F7] flex items-center justify-center shrink-0">
                {item.icon}
              </div>
              <div className="min-w-0">
                <p className="text-[14px] font-medium text-[#1D1D1F] mb-0.5">{item.title}</p>
                <p className="text-[12px] text-[#86868B] leading-[1.4]">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* 底部：长按按钮 */}
      <motion.div className="px-8 pb-10 pt-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <div className="relative w-full max-w-[300px] mx-auto">
          <div className="h-[56px] bg-white rounded-full border border-gray-200 overflow-hidden relative shadow-[0_4px_20px_rgb(0,0,0,0.06)]">
            <motion.div className="absolute inset-0 bg-black rounded-full" style={{ width: holdProgress + "%" }} />
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <span className={`text-[14px] font-medium transition-colors duration-300 ${holdProgress > 50 ? "text-white" : "text-[#1D1D1F]"}`}>
                {holdProgress > 0 && holdProgress < 100 ? `${holdProgress}%` : "长按启动 Agent"}
              </span>
            </div>
          </div>
          <div
            className="absolute inset-0 z-20 cursor-pointer rounded-full"
            onMouseDown={startHold}
            onMouseUp={endHold}
            onMouseLeave={endHold}
            onTouchStart={startHold}
            onTouchEnd={endHold}
          />
        </div>
        <p className="text-[11px] text-[#C7C7CC] text-center mt-4">长按上方按钮直到 100% 即可启动 · 启动后 24/7 持续运转</p>
      </motion.div>
    </div>
  );
}
