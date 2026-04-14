"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

const industryChips = ["互联网", "金融", "制造", "医疗", "教育", "消费", "其他"];
const scaleChips = ["初创 <50人", "成长期 50-200", "中型 200-1000", "大型 1000+"];
const teamSizeChips = ["5人以下", "5-15人", "15-30人", "30-50人", "50人以上"];
const levelChips = ["总监/VP", "高级经理", "经理", "组长/主管", "其他"];
const jobTypeChips = ["技术", "产品", "设计", "运营", "销售", "其他"];
const urgencyChips = ["1周内", "2周内", "1个月内", "不急"];

const pageVariants = {
  enter: { opacity: 0, x: 60 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -60 },
};
const pageTrans = { duration: 0.4, ease: [0.32, 0.72, 0, 1] as const };

export default function EmployerSetupPage() {
  const router = useRouter();
  const [step, setStep] = useState<"company" | "team" | "urgency" | "welcome">("company");
  const [companyName, setCompanyName] = useState("");
  const navigated = useRef(false);

  const handleCompanySelect = (industry: string) => {
    setStep("team");
  };

  const handleTeamSubmit = () => {
    setStep("urgency");
  };

  const handleUrgencySubmit = () => {
    setStep("welcome");
    setTimeout(() => {
      if (navigated.current) return;
      navigated.current = true;
      router.push("/employer/onboarding/upload");
    }, 2200);
  };

  return (
    <div className="relative h-screen bg-[#FAFAFA] overflow-hidden">
      <AnimatePresence mode="wait">
        {/* Step 1: 公司信息 */}
        {step === "company" && (
          <motion.div key="company" className="absolute inset-0 flex flex-col" variants={pageVariants} initial="enter" animate="center" exit="exit" transition={pageTrans}>
            <div className="px-6 pt-14 pb-2 flex items-center gap-2">
              {[0,1,2].map(i => (
                <div key={i} className="flex-1 h-[3px] rounded-full" style={{ background: i === 0 ? "#1D1D1F" : "#E5E5EA" }} />
              ))}
            </div>
            <div className="flex-1 flex flex-col px-6 pt-10 overflow-y-auto pb-20">
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.4 }}>
                <p className="text-[13px] text-[#86868B] mb-2">第 1 步</p>
                <h1 className="text-[28px] font-bold text-[#1D1D1F] tracking-tight leading-tight mb-3">公司信息</h1>
                <p className="text-[15px] text-[#86868B] leading-relaxed mb-8">告诉我们你的公司，Agent 将为你定制招聘策略</p>
              </motion.div>

              <motion.div className="space-y-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }}>
                {/* 公司名称 */}
                <div>
                  <label className="text-[12px] text-[#86868B] font-medium mb-2 block">公司名称</label>
                  <div className="bg-white rounded-2xl px-4 py-3.5" style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.04), 0 0 0 0.5px rgba(0,0,0,0.04)" }}>
                    <input
                      className="w-full text-[15px] text-[#1D1D1F] outline-none placeholder-[#C7C7CC] bg-transparent"
                      placeholder="输入公司名称…" value={companyName} onChange={e => setCompanyName(e.target.value)} autoFocus
                    />
                  </div>
                </div>
                {/* 行业 */}
                <div>
                  <label className="text-[12px] text-[#86868B] font-medium mb-2 block">所属行业</label>
                  <div className="flex flex-wrap gap-2.5">
                    {industryChips.map(c => (
                      <motion.button key={c} className="px-4 py-2.5 bg-white rounded-full text-[15px] text-[#1D1D1F] font-medium"
                        style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.04), 0 0 0 0.5px rgba(0,0,0,0.04)" }}
                        whileTap={{ scale: 0.95 }} onClick={() => handleCompanySelect(c)}
                      >{c}</motion.button>
                    ))}
                  </div>
                </div>
                {/* 规模 */}
                <div>
                  <label className="text-[12px] text-[#86868B] font-medium mb-2 block">公司规模</label>
                  <div className="flex flex-wrap gap-2.5">
                    {scaleChips.map(c => (
                      <motion.button key={c} className="px-4 py-2.5 bg-white rounded-full text-[14px] text-[#1D1D1F] font-medium"
                        style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.04), 0 0 0 0.5px rgba(0,0,0,0.04)" }}
                        whileTap={{ scale: 0.95 }} onClick={() => handleCompanySelect(c)}
                      >{c}</motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Step 2: 团队信息 */}
        {step === "team" && (
          <motion.div key="team" className="absolute inset-0 flex flex-col" variants={pageVariants} initial="enter" animate="center" exit="exit" transition={pageTrans}>
            <div className="px-6 pt-14 pb-2 flex items-center gap-2">
              {[0,1,2].map(i => (
                <div key={i} className="flex-1 h-[3px] rounded-full" style={{ background: i <= 1 ? "#1D1D1F" : "#E5E5EA" }} />
              ))}
            </div>
            <div className="flex-1 flex flex-col px-6 pt-10 overflow-y-auto pb-20">
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.4 }}>
                <p className="text-[13px] text-[#86868B] mb-2">第 2 步</p>
                <h1 className="text-[28px] font-bold text-[#1D1D1F] tracking-tight leading-tight mb-3">团队信息</h1>
                <p className="text-[15px] text-[#86868B] leading-relaxed mb-8">帮助 Agent 理解你的团队结构</p>
              </motion.div>

              <motion.div className="space-y-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }}>
                <div>
                  <label className="text-[12px] text-[#86868B] font-medium mb-2 block">团队/部门名称</label>
                  <div className="bg-white rounded-2xl px-4 py-3.5" style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.04), 0 0 0 0.5px rgba(0,0,0,0.04)" }}>
                    <input className="w-full text-[15px] text-[#1D1D1F] outline-none placeholder-[#C7C7CC] bg-transparent" placeholder="如：技术部 / 产品中心…" autoFocus />
                  </div>
                </div>
                <div>
                  <label className="text-[12px] text-[#86868B] font-medium mb-2 block">团队规模</label>
                  <div className="flex flex-wrap gap-2.5">
                    {teamSizeChips.map(c => (
                      <motion.button key={c} className="px-4 py-2.5 bg-white rounded-full text-[14px] text-[#1D1D1F] font-medium"
                        style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.04), 0 0 0 0.5px rgba(0,0,0,0.04)" }}
                        whileTap={{ scale: 0.95 }} onClick={handleTeamSubmit}
                      >{c}</motion.button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[12px] text-[#86868B] font-medium mb-2 block">汇报对象</label>
                  <div className="flex flex-wrap gap-2.5">
                    {levelChips.map(c => (
                      <motion.button key={c} className="px-4 py-2.5 bg-white rounded-full text-[14px] text-[#1D1D1F] font-medium"
                        style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.04), 0 0 0 0.5px rgba(0,0,0,0.04)" }}
                        whileTap={{ scale: 0.95 }} onClick={handleTeamSubmit}
                      >{c}</motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
            <div className="px-6 pb-10">
              <motion.button className="text-[14px] text-[#86868B]" whileTap={{ scale: 0.97 }} onClick={() => setStep("company")}>← 上一步</motion.button>
            </div>
          </motion.div>
        )}

        {/* Step 3: 招聘紧迫度 */}
        {step === "urgency" && (
          <motion.div key="urgency" className="absolute inset-0 flex flex-col" variants={pageVariants} initial="enter" animate="center" exit="exit" transition={pageTrans}>
            <div className="px-6 pt-14 pb-2 flex items-center gap-2">
              {[0,1,2].map(i => (
                <div key={i} className="flex-1 h-[3px] rounded-full bg-[#1D1D1F]" />
              ))}
            </div>
            <div className="flex-1 flex flex-col px-6 pt-10 overflow-y-auto pb-20">
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.4 }}>
                <p className="text-[13px] text-[#86868B] mb-2">第 3 步</p>
                <h1 className="text-[28px] font-bold text-[#1D1D1F] tracking-tight leading-tight mb-3">招聘紧迫度</h1>
                <p className="text-[15px] text-[#86868B] leading-relaxed mb-8">Agent 将根据紧迫度调整搜寻策略</p>
              </motion.div>

              <motion.div className="space-y-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }}>
                <div>
                  <label className="text-[12px] text-[#86868B] font-medium mb-2 block">最紧急的岗位类型</label>
                  <div className="flex flex-wrap gap-2.5">
                    {jobTypeChips.map(c => (
                      <motion.button key={c} className="px-4 py-2.5 bg-white rounded-full text-[15px] text-[#1D1D1F] font-medium"
                        style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.04), 0 0 0 0.5px rgba(0,0,0,0.04)" }}
                        whileTap={{ scale: 0.95 }} onClick={handleUrgencySubmit}
                      >{c}</motion.button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[12px] text-[#86868B] font-medium mb-2 block">期望到岗时间</label>
                  <div className="flex flex-wrap gap-2.5">
                    {urgencyChips.map(c => (
                      <motion.button key={c} className="px-4 py-2.5 bg-white rounded-full text-[15px] text-[#1D1D1F] font-medium"
                        style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.04), 0 0 0 0.5px rgba(0,0,0,0.04)" }}
                        whileTap={{ scale: 0.95 }} onClick={handleUrgencySubmit}
                      >{c}</motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
            <div className="px-6 pb-10">
              <motion.button className="text-[14px] text-[#86868B]" whileTap={{ scale: 0.97 }} onClick={() => setStep("team")}>← 上一步</motion.button>
            </div>
          </motion.div>
        )}

        {/* Welcome */}
        {step === "welcome" && (
          <motion.div key="welcome" className="absolute inset-0 flex flex-col items-center justify-center px-8"
            variants={pageVariants} initial="enter" animate="center" exit="exit" transition={pageTrans}>
            <motion.div className="w-20 h-20 rounded-full bg-[#34C759]/10 flex items-center justify-center mb-6"
              animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#34C759" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </motion.div>
            <h2 className="text-[22px] font-bold text-[#1D1D1F] tracking-tight mb-2">信息已收到</h2>
            <p className="text-[15px] text-[#86868B] text-center leading-relaxed">正在为你配置 AI 招聘助理…</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
