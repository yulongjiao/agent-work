"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { tap } from "@/lib/haptics";

const blocked = [
  { name: "竞品公司员工", reason: "Agent 自动识别", detail: "已屏蔽 3 家核心竞品公司在职员工" },
  { name: "已离职本公司员工", reason: "HR 系统关联", detail: "近 2 年内离职的 47 名员工" },
  { name: "黑名单候选人", reason: "历史记录", detail: "曾爽约面试或违反协议的候选人" },
];

export default function EmployerPrivacyPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 800);
    return () => { clearTimeout(t1); };
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] px-5 pt-14 pb-28 relative">
      <motion.button
        className="absolute top-14 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 z-20"
        whileTap={{ scale: 0.9 }}
        onClick={() => router.back()}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
      </motion.button>
      <motion.div className="flex items-center gap-3 mb-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /></svg>
        <h1 className="text-[22px] font-semibold text-white">招聘信息保护</h1>
      </motion.div>
      <motion.p className="text-[14px] text-white/50 mb-8 leading-relaxed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        Talent Shield · 防止招聘信息外泄
      </motion.p>

      {step >= 1 && (
        <motion.div className="bg-white/5 rounded-3xl border border-white/10 p-5 mb-5 backdrop-blur-sm" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-[15px] font-medium text-white">已启用的屏蔽规则</p>
            <span className="text-[12px] text-[#34C759] font-medium bg-[#34C759]/10 px-2.5 py-1 rounded-full">自动生成</span>
          </div>
          <div className="space-y-4">
            {blocked.map((c, i) => (
              <motion.div key={c.name} className="py-2" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.15 }}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-3">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="1.5"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" /><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" /><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" /><path d="m2 2 20 20" /></svg>
                    <span className="text-[14px] text-white/80">{c.name}</span>
                  </div>
                  <span className="text-[12px] text-white/30">{c.reason}</span>
                </div>
                <p className="text-[12px] text-white/40 ml-[28px]">{c.detail}</p>
              </motion.div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-white/10">
            <button className="text-[13px] text-[#007AFF] font-medium">+ 手动添加屏蔽规则</button>
          </div>
        </motion.div>
      )}

      {/* 额外保护说明 */}
      {step >= 1 && (
        <motion.div className="bg-white/5 rounded-3xl border border-white/10 p-5 backdrop-blur-sm" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <p className="text-[15px] font-medium text-white mb-3">信息保护策略</p>
          <div className="space-y-3">
            {[
              { label: "JD 脱敏展示", desc: "对外展示时隐藏薪资上限和团队具体信息" },
              { label: "候选人数据隔离", desc: "不同岗位的候选人信息互不可见" },
              { label: "操作日志审计", desc: "所有招聘操作留痕，支持合规审查" },
            ].map((item, i) => (
              <motion.div key={item.label} className="flex items-start gap-3" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 + i * 0.1 }}>
                <div className="w-5 h-5 rounded-full bg-[#34C759]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#34C759" strokeWidth="3"><path d="M20 6 9 17l-5-5" /></svg>
                </div>
                <div>
                  <p className="text-[13px] text-white/70 font-medium">{item.label}</p>
                  <p className="text-[12px] text-white/40">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* 固定底部按钮 */}
      {step >= 1 && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[430px] px-5 pb-8 pt-4 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A] to-transparent z-10">
          <motion.button className="w-full h-14 bg-white text-black rounded-2xl text-[16px] font-medium" whileTap={{ scale: 0.98 }} onClick={() => { tap(); router.push("/employer/dispatch"); }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.4 }}>
            继续
          </motion.button>
        </div>
      )}
    </div>
  );
}
