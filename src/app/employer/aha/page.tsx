"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { confirm, success } from "@/lib/haptics";

export default function EmployerAhaPage() {
  const router = useRouter();
  const [phase, setPhase] = useState(0);
  const [strategy1, setStrategy1] = useState<"pending" | "accepted" | "rejected">("pending");
  const [strategy2, setStrategy2] = useState<"pending" | "accepted" | "rejected">("pending");

  useEffect(() => { const t = setTimeout(() => setPhase(1), 2800); return () => clearTimeout(t); }, []);

  if (phase === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#FAFAFA] px-8">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 rounded-full border-2 border-[#1D1D1F]/10" />
            <div className="absolute inset-2 rounded-full border-2 border-[#1D1D1F]/20 animate-ripple" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center"><span className="text-white text-[18px] font-semibold">A</span></div>
            </div>
          </div>
          <p className="text-[18px] font-medium text-[#1D1D1F] mb-2">正在生成人才市场洞察</p>
          <p className="text-[14px] text-[#86868B]">分析 JD · 扫描人才库 · 交叉比对...</p>
          <div className="mt-8 w-48 h-1 bg-[#F5F5F7] rounded-full overflow-hidden mx-auto">
            <motion.div className="h-full bg-[#1D1D1F] rounded-full" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 2.5, ease: "easeInOut" }} />
          </div>
        </motion.div>
      </div>
    );
  }

  const allDecided = strategy1 !== "pending" && strategy2 !== "pending";

  return (
    <div className="min-h-screen bg-[#FAFAFA] px-5 pt-16 pb-28 relative">
      <motion.button
        className="absolute top-14 left-5 w-8 h-8 flex items-center justify-center rounded-full bg-black/[0.04] z-20"
        whileTap={{ scale: 0.9 }} onClick={() => router.back()}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1D1D1F" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
      </motion.button>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, type: "spring" }}>
        <div className="text-center mb-8">
          <motion.p className="text-[11px] text-[#86868B] font-medium uppercase tracking-wider mb-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>TALENT MIRROR</motion.p>
          <motion.h1 className="text-[26px] font-semibold text-[#1D1D1F] leading-tight" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>人才市场洞察<br />已生成</motion.h1>
        </div>

        {/* 模块一：人才供需分析 */}
        <motion.div className="bg-white rounded-2xl border border-black/[0.04] p-5 mb-3" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.04)" }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <p className="text-[11px] text-[#86868B] font-medium uppercase tracking-wider mb-4">人才供需分析</p>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-[#86868B]">活跃简历库</span>
              <span className="text-[14px] font-medium text-[#1D1D1F]">2,836 份</span>
            </div>
            <div className="w-full h-px bg-black/[0.04]" />
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-[#86868B]">符合硬性要求</span>
              <span className="text-[14px] font-medium text-[#1D1D1F]">187 人</span>
            </div>
            <div className="w-full h-px bg-black/[0.04]" />
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-[#86868B]">市场薪资中位数</span>
              <span className="text-[14px] font-medium text-[#1D1D1F]">35k</span>
            </div>
            <div className="w-full h-px bg-black/[0.04]" />
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-[#86868B]">你的预算 vs 市场</span>
              <span className="text-[14px] font-medium text-[#34C759]">前 30% 竞争力</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-black/[0.04]">
            <div className="flex items-center gap-2">
              <div className="w-[6px] h-[6px] rounded-full bg-[#34C759]" />
              <span className="text-[13px] text-[#86868B]">供需判断</span>
            </div>
            <p className="text-[14px] font-medium text-[#1D1D1F] mt-1">供不应求 — 优质候选人有多家争抢</p>
            <p className="text-[12px] text-[#C7C7CC] mt-1">基于 2,836 份活跃简历和 423 个同类岗位分析</p>
          </div>
        </motion.div>

        {/* 模块二：岗位竞争力诊断 */}
        <motion.div className="mb-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <p className="text-[11px] text-[#86868B] font-medium uppercase tracking-wider mb-3 px-1">岗位竞争力诊断</p>
          <div className="space-y-3">
            <div className="bg-white rounded-2xl border border-black/[0.04] p-5" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.04)" }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-[6px] h-[6px] rounded-full bg-[#34C759]" />
                <span className="text-[12px] text-[#86868B] font-medium">薪资竞争力</span>
              </div>
              <p className="text-[14px] text-[#1D1D1F] leading-[1.65] tracking-tight">你的薪资范围 30-45K 处于市场前 30%，对优质候选人有较强吸引力。建议在首轮沟通中主动展示薪资上限，可有效提升候选人的沟通意愿。</p>
            </div>
            <div className="bg-white rounded-2xl border border-black/[0.04] p-5" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.04)" }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-[6px] h-[6px] rounded-full bg-[#007AFF]" />
                <span className="text-[12px] text-[#86868B] font-medium">岗位吸引力</span>
              </div>
              <p className="text-[14px] text-[#1D1D1F] leading-[1.65] tracking-tight">基于 JD 内容、公司品牌和福利分析，岗位综合吸引力评分 82/100。「技术负责人」定位和「带团队」机会是最大加分项，建议在触达候选人时重点突出。</p>
            </div>
          </div>
        </motion.div>

        {/* 模块三：Agent 策略确认 */}
        <motion.div className="mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
          <p className="text-[11px] text-[#86868B] font-medium uppercase tracking-wider mb-3 px-1">策略确认</p>
          <div className="space-y-3">
            {/* 策略 1 */}
            <div className="bg-white rounded-2xl border border-black/[0.04] overflow-hidden" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.04)" }}>
              <div className="px-5 py-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-[6px] h-[6px] rounded-full bg-[#FF9500]" />
                    <span className="text-[12px] text-[#86868B] font-medium">招聘助理建议</span>
                  </div>
                  {strategy1 !== "pending" && (
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${strategy1 === "accepted" ? "text-[#34C759] bg-[#34C759]/10" : "text-[#86868B] bg-[#F5F5F7]"}`}>
                      {strategy1 === "accepted" ? "已开启主动触达" : "仅等待投递"}
                    </span>
                  )}
                </div>
                <p className="text-[14px] font-medium text-[#1D1D1F] leading-[1.5] mb-2">主动触达策略</p>
                <p className="text-[13px] text-[#86868B] leading-[1.6]">建议主动联系 TOP 20% 的被动候选人，而非仅等待投递。这类候选人虽不主动看机会，但往往是最优质的人选。主动触达可将候选人池扩大 3 倍。</p>
                {strategy1 === "pending" && (
                  <div className="flex gap-2 mt-4">
                    <motion.button className="flex-1 h-[40px] bg-[#1D1D1F] text-white rounded-[10px] text-[13px] font-medium" whileTap={{ scale: 0.97 }} onClick={() => { confirm(); setStrategy1("accepted"); }}>开启主动触达</motion.button>
                    <motion.button className="h-[40px] px-4 bg-[#F5F5F7] text-[#86868B] rounded-[10px] text-[13px] font-medium" whileTap={{ scale: 0.97 }} onClick={() => { confirm(); setStrategy1("rejected"); }}>仅等待投递</motion.button>
                  </div>
                )}
              </div>
            </div>

            {/* 策略 2 */}
            <div className="bg-white rounded-2xl border border-black/[0.04] overflow-hidden" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.04)" }}>
              <div className="px-5 py-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-[6px] h-[6px] rounded-full bg-[#FF9500]" />
                    <span className="text-[12px] text-[#86868B] font-medium">招聘助理建议</span>
                  </div>
                  {strategy2 !== "pending" && (
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${strategy2 === "accepted" ? "text-[#34C759] bg-[#34C759]/10" : "text-[#86868B] bg-[#F5F5F7]"}`}>
                      {strategy2 === "accepted" ? "展示薪资上限" : "展示薪资范围"}
                    </span>
                  )}
                </div>
                <p className="text-[14px] font-medium text-[#1D1D1F] leading-[1.5] mb-2">薪资展示策略</p>
                <p className="text-[13px] text-[#86868B] leading-[1.6]">建议初始阶段展示薪资范围上限 45K，吸引更优质候选人。数据显示，展示上限的岗位收到的优质简历量提升 47%。具体薪资可在面试后根据能力定级。</p>
                {strategy2 === "pending" && (
                  <div className="flex gap-2 mt-4">
                    <motion.button className="flex-1 h-[40px] bg-[#1D1D1F] text-white rounded-[10px] text-[13px] font-medium" whileTap={{ scale: 0.97 }} onClick={() => { confirm(); setStrategy2("accepted"); }}>展示上限</motion.button>
                    <motion.button className="h-[40px] px-4 bg-[#F5F5F7] text-[#86868B] rounded-[10px] text-[13px] font-medium" whileTap={{ scale: 0.97 }} onClick={() => { confirm(); setStrategy2("rejected"); }}>展示范围</motion.button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* 底部按钮 */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[430px] px-5 pb-8 pt-4 bg-gradient-to-t from-[#FAFAFA] via-[#FAFAFA] to-transparent z-10">
        <motion.button
          className={`w-full h-14 rounded-2xl text-[16px] font-medium transition-colors ${allDecided ? "bg-[#1D1D1F] text-white" : "bg-[#F5F5F7] text-[#C7C7CC]"}`}
          whileTap={allDecided ? { scale: 0.98 } : {}}
          onClick={() => { if (allDecided) { success(); router.push("/employer/privacy"); } }}
          disabled={!allDecided}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}
          style={allDecided ? { boxShadow: "0 4px 20px rgba(0,0,0,0.15)" } : {}}
        >
          {allDecided ? "继续" : "请先确认以上策略"}
        </motion.button>
      </div>
    </div>
  );
}
