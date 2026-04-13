"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { tap } from "@/lib/haptics";

const blocked = [
  { name: "当前就职公司", reason: "自动识别" },
  { name: "前东家（某电商平台）", reason: "简历关联" },
  { name: "关联子公司 × 3", reason: "集团图谱推算" },
];

export default function PrivacyPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 800);
    return () => { clearTimeout(t1); };
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] px-5 pt-14 pb-28">
      <motion.div className="flex items-center gap-3 mb-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /></svg>
        <h1 className="text-[22px] font-semibold text-white">私密空间</h1>
      </motion.div>
      <motion.p className="text-[14px] text-white/50 mb-8 leading-relaxed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        端到端加密 · 仅你和 Agent 可见
      </motion.p>

      {step >= 1 && (
        <motion.div className="bg-white/5 rounded-3xl border border-white/10 p-5 mb-5 backdrop-blur-sm" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-[15px] font-medium text-white">已为你屏蔽的企业</p>
            <span className="text-[12px] text-[#34C759] font-medium bg-[#34C759]/10 px-2.5 py-1 rounded-full">自动生成</span>
          </div>
          <div className="space-y-3">
            {blocked.map((c, i) => (
              <motion.div key={c.name} className="flex items-center justify-between py-2" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.15 }}>
                <div className="flex items-center gap-3">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="1.5"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" /><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" /><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" /><path d="m2 2 20 20" /></svg>
                  <span className="text-[14px] text-white/80">{c.name}</span>
                </div>
                <span className="text-[12px] text-white/30">{c.reason}</span>
              </motion.div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-white/10">
            <button className="text-[13px] text-[#007AFF] font-medium">+ 手动添加</button>
          </div>
        </motion.div>
      )}

      {/* 固定底部按钮 */}
      {step >= 1 && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[430px] px-5 pb-8 pt-4 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A] to-transparent z-10">
          <motion.button className="w-full h-14 bg-white text-black rounded-2xl text-[16px] font-medium" whileTap={{ scale: 0.98 }} onClick={() => { tap(); router.push("/dispatch"); }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.4 }}>
            继续
          </motion.button>
        </div>
      )}
    </div>
  );
}
