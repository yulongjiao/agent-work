"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function OBAgentHelloPage() {
  const router = useRouter();
  const [phase, setPhase] = useState(0);
  const skipRef = { current: false };

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 800);
    const t2 = setTimeout(() => setPhase(2), 2200);
    const t3 = setTimeout(() => setPhase(3), 3500);
    const t4 = setTimeout(() => { if (!skipRef.current) router.push("/onboarding/deep-qa"); }, 5500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [router]);

  const handleSkip = () => {
    skipRef.current = true;
    router.push("/onboarding/deep-qa");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#FAFAFA] px-8 cursor-pointer" onClick={handleSkip}>
      <motion.div className="relative w-24 h-24 mb-10" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}>
        <div className="w-24 h-24 rounded-full bg-black flex items-center justify-center">
          <span className="text-white text-[28px] font-semibold">A</span>
        </div>
        {phase >= 1 && (
          <motion.div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#34C759] border-[3px] border-[#FAFAFA] flex items-center justify-center" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
            <div className="w-2.5 h-2.5 rounded-full bg-white" />
          </motion.div>
        )}
      </motion.div>
      {phase >= 1 && (
        <motion.p className="text-[13px] text-[#34C759] font-medium mb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>在线</motion.p>
      )}
      {phase >= 2 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-[22px] font-semibold text-[#1D1D1F] text-center mb-2">你的专属经纪人</h2>
          <p className="text-[14px] text-[#86868B] text-center">已上线，正在初始化...</p>
        </motion.div>
      )}
      {phase >= 3 && (
        <motion.div className="flex gap-1.5 mt-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="w-2 h-2 bg-[#86868B] rounded-full typing-dot-1" />
          <div className="w-2 h-2 bg-[#86868B] rounded-full typing-dot-2" />
          <div className="w-2 h-2 bg-[#86868B] rounded-full typing-dot-3" />
        </motion.div>
      )}
      <motion.p
        className="absolute bottom-16 text-[12px] text-[#C7C7CC]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        点击任意位置跳过
      </motion.p>
    </div>
  );
}
