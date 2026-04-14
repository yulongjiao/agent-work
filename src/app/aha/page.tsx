"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { confirm, success } from "@/lib/haptics";

export default function AhaMomentPage() {
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
          <p className="text-[18px] font-medium text-[#1D1D1F] mb-2">正在生成你的职业镜像</p>
          <p className="text-[14px] text-[#86868B]">分析简历 · 交叉比对市场数据...</p>
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
        whileTap={{ scale: 0.9 }}
        onClick={() => router.back()}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1D1D1F" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
      </motion.button>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, type: "spring" }}>
        <div className="text-center mb-8">
          <motion.p className="text-[11px] text-[#86868B] font-medium uppercase tracking-wider mb-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>CAREER MIRROR</motion.p>
          <motion.h1 className="text-[26px] font-semibold text-[#1D1D1F] leading-tight" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>你的职业镜像<br />已生成</motion.h1>
        </div>

        {/* ── 模块一：谈判锚点推演 ── */}
        <motion.div className="bg-white rounded-2xl border border-black/[0.04] p-5 mb-3" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.04)" }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <p className="text-[11px] text-[#86868B] font-medium uppercase tracking-wider mb-4">谈判锚点推演</p>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-[#86868B]">同岗位同年限市场中位数</span>
              <span className="text-[14px] font-medium text-[#1D1D1F]">22k</span>
            </div>
            <div className="w-full h-px bg-black/[0.04]" />
            <div className="flex items-start justify-between">
              <span className="text-[13px] text-[#86868B]">您的溢价维度</span>
              <span className="text-[14px] font-medium text-[#1D1D1F] text-right max-w-[60%]">稀缺的 0-1 架构经验 + 大厂背景</span>
            </div>
            <div className="w-full h-px bg-black/[0.04]" />
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-[#86868B]">综合溢价系数</span>
              <span className="text-[14px] font-medium text-[#1D1D1F]">+27%</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-black/[0.04]">
            <div className="flex items-baseline justify-between">
              <span className="text-[13px] text-[#86868B]">Agent 建议首轮谈判锚点</span>
              <span className="text-[20px] font-bold text-[#1D1D1F] tracking-tight">28k</span>
            </div>
            <p className="text-[12px] text-[#C7C7CC] mt-1">基于 1,247 个同类岗位薪资数据推算</p>
          </div>
        </motion.div>

        {/* ── 模块二：隐性优势提炼 ── */}
        <motion.div className="mb-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <p className="text-[11px] text-[#86868B] font-medium uppercase tracking-wider mb-3 px-1">优势提炼</p>
          <div className="space-y-3">
            {/* 卡片 A */}
            <div className="bg-white rounded-2xl border border-black/[0.04] p-5" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.04)" }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-[6px] h-[6px] rounded-full bg-[#34C759]" />
                <span className="text-[12px] text-[#86868B] font-medium">高稀缺性议价筹码</span>
              </div>
              <p className="text-[14px] text-[#1D1D1F] leading-[1.65] tracking-tight">在整体行业追求降本增效的当下，您简历中「主导核心链路重构并节省 30% 资源」的经历是极具稀缺性的议价筹码。多数候选人只能描述业务开发，而您具备可量化的架构优化成果。</p>
            </div>
            {/* 卡片 B */}
            <div className="bg-white rounded-2xl border border-black/[0.04] p-5" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.04)" }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-[6px] h-[6px] rounded-full bg-[#007AFF]" />
                <span className="text-[12px] text-[#86868B] font-medium">技术-业务双轴驱动</span>
              </div>
              <p className="text-[14px] text-[#1D1D1F] leading-[1.65] tracking-tight">您同时具备带团队和业务选型经验，属于「能向上对话业务、向下落地技术」的复合型人才。在谈判中，这一点可以有效反击 HR 试图压低职级的策略——纯技术标签只值 P7，但技术+管理可以锚定 P8。</p>
            </div>
          </div>
        </motion.div>

        {/* ── 模块三：经纪人出发前策略确认 ── */}
        <motion.div className="mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
          <p className="text-[11px] text-[#86868B] font-medium uppercase tracking-wider mb-3 px-1">策略确认</p>
          <div className="space-y-3">
            {/* 策略 1 */}
            <div className="bg-white rounded-2xl border border-black/[0.04] overflow-hidden" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.04)" }}>
              <div className="px-5 py-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-[6px] h-[6px] rounded-full bg-[#FF9500]" />
                    <span className="text-[12px] text-[#86868B] font-medium">经纪人建议</span>
                  </div>
                  {strategy1 !== "pending" && (
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${strategy1 === "accepted" ? "text-[#34C759] bg-[#34C759]/10" : "text-[#86868B] bg-[#F5F5F7]"}`}>
                      {strategy1 === "accepted" ? "已隐藏 Python 标签" : "保留 Python 标签展示"}
                    </span>
                  )}
                </div>
                <p className="text-[14px] font-medium text-[#1D1D1F] leading-[1.5] mb-2">隐藏边缘技能</p>
                <p className="text-[13px] text-[#86868B] leading-[1.6]">建议在本次寻访中为您隐藏 Python 相关的全栈标签。根据我的经验，保持纯粹的后端专家人设，能有效防止企业借机压低 Base 薪资。</p>
                {strategy1 === "pending" && (
                  <div className="flex gap-2 mt-4">
                    <motion.button
                      className="flex-1 h-[40px] bg-[#1D1D1F] text-white rounded-[10px] text-[13px] font-medium"
                      whileTap={{ scale: 0.97 }}
                      onClick={() => { confirm(); setStrategy1("accepted"); }}
                    >
                      同意隐藏
                    </motion.button>
                    <motion.button
                      className="h-[40px] px-4 bg-[#F5F5F7] text-[#86868B] rounded-[10px] text-[13px] font-medium"
                      whileTap={{ scale: 0.97 }}
                      onClick={() => { confirm(); setStrategy1("rejected"); }}
                    >
                      保留现状
                    </motion.button>
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
                    <span className="text-[12px] text-[#86868B] font-medium">经纪人建议</span>
                  </div>
                  {strategy2 !== "pending" && (
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${strategy2 === "accepted" ? "text-[#34C759] bg-[#34C759]/10" : "text-[#86868B] bg-[#F5F5F7]"}`}>
                      {strategy2 === "accepted" ? "锚点 28k 已生效" : "将使用保守锚点"}
                    </span>
                  )}
                </div>
                <p className="text-[14px] font-medium text-[#1D1D1F] leading-[1.5] mb-2">试探性报价授权</p>
                <p className="text-[13px] text-[#86868B] leading-[1.6]">目前的市场环境下，我计划首轮沟通统一以 28k 作为硬性锚点，借此直接过滤掉预算锁死的低优岗位。您是否授权以此作为试探底线？</p>
                {strategy2 === "pending" && (
                  <div className="flex gap-2 mt-4">
                    <motion.button
                      className="flex-1 h-[40px] bg-[#1D1D1F] text-white rounded-[10px] text-[13px] font-medium"
                      whileTap={{ scale: 0.97 }}
                      onClick={() => { confirm(); setStrategy2("accepted"); }}
                    >
                      授权该锚点
                    </motion.button>
                    <motion.button
                      className="h-[40px] px-4 bg-[#F5F5F7] text-[#86868B] rounded-[10px] text-[13px] font-medium"
                      whileTap={{ scale: 0.97 }}
                      onClick={() => { confirm(); setStrategy2("rejected"); }}
                    >
                      我想再保守一点
                    </motion.button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* ── 底部：确认出发（固定底部） ── */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[430px] px-5 pb-8 pt-4 bg-gradient-to-t from-[#FAFAFA] via-[#FAFAFA] to-transparent z-10">
        <motion.button
          className={`w-full h-14 rounded-2xl text-[16px] font-medium transition-colors ${allDecided ? "bg-[#1D1D1F] text-white" : "bg-[#F5F5F7] text-[#C7C7CC]"}`}
          whileTap={allDecided ? { scale: 0.98 } : {}}
          onClick={() => { if (allDecided) { success(); router.push("/privacy"); } }}
          disabled={!allDecided}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          style={allDecided ? { boxShadow: "0 4px 20px rgba(0,0,0,0.15)" } : {}}
        >
          {allDecided ? "继续" : "请先确认以上策略"}
        </motion.button>
      </div>
    </div>
  );
}
