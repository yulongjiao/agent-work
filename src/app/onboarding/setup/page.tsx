"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

/* ── 常量 ── */
const cityChips = ["北京", "上海", "广州", "深圳", "杭州", "成都", "武汉", "南京", "远程"];
const posChips  = ["Java 后端", "前端工程师", "全栈工程师", "产品经理", "数据工程师", "架构师", "设计师"];

const pageVariants = {
  enter: { opacity: 0, x: 60 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -60 },
};
const pageTrans = { duration: 0.4, ease: [0.32, 0.72, 0, 1] as const };

/* ── 主页面 ── */
export default function SetupPage() {
  const router = useRouter();
  const [step, setStep] = useState<"role" | "city" | "position" | "welcome">("role");
  const [cityInput, setCityInput] = useState("");
  const [posInput, setPosInput] = useState("");
  const navigated = useRef(false);

  const handleRole = (role: "seeker" | "employer") => {
    if (role === "employer") {
      router.push("/employer/onboarding/setup");
      return;
    }
    setStep("city");
  };

  const handleCitySubmit = (value: string) => {
    const v = value.trim();
    if (!v) return;
    setCityInput("");
    setStep("position");
  };

  const handlePosSubmit = (value: string) => {
    const v = value.trim();
    if (!v) return;
    setPosInput("");
    setStep("welcome");
    setTimeout(() => {
      if (navigated.current) return;
      navigated.current = true;
      router.push("/dashboard?incomplete=1");
    }, 2200);
  };

  return (
    <div className="relative h-screen bg-[#FAFAFA] overflow-hidden">
      <AnimatePresence mode="wait">
        {/* ── Step 1: 身份选择 ── */}
        {step === "role" && (
          <motion.div key="role" className="absolute inset-0 flex flex-col" variants={pageVariants} initial="enter" animate="center" exit="exit" transition={pageTrans}>
            {/* 进度 */}
            <div className="px-6 pt-14 pb-2 flex items-center gap-2">
              {[0,1,2].map(i => (
                <div key={i} className="flex-1 h-[3px] rounded-full" style={{ background: i === 0 ? "#1D1D1F" : "#E5E5EA" }} />
              ))}
            </div>

            <div className="flex-1 flex flex-col px-6 pt-10">
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.4 }}>
                <p className="text-[13px] text-[#86868B] mb-2">第 1 步</p>
                <h1 className="text-[28px] font-bold text-[#1D1D1F] tracking-tight leading-tight mb-3">你的身份是？</h1>
                <p className="text-[15px] text-[#86868B] leading-relaxed mb-10">选择后我们将为你定制专属的 AI 经纪人服务</p>
              </motion.div>

              <motion.div className="space-y-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }}>
                <motion.button
                  className="w-full bg-white rounded-2xl p-5 text-left"
                  style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.04), 0 0 0 0.5px rgba(0,0,0,0.04)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleRole("seeker")}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#F5F5F7] flex items-center justify-center flex-shrink-0">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1D1D1F" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-[16px] font-semibold text-[#1D1D1F]">我是求职者</h3>
                      <p className="text-[13px] text-[#86868B] mt-0.5">托管职业机会，让 AI 经纪人替你谈</p>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C7C7CC" strokeWidth="1.5"><path d="m9 18 6-6-6-6"/></svg>
                  </div>
                </motion.button>

                <motion.button
                  className="w-full bg-white rounded-2xl p-5 text-left"
                  style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.04), 0 0 0 0.5px rgba(0,0,0,0.04)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleRole("employer")}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#F5F5F7] flex items-center justify-center flex-shrink-0">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1D1D1F" strokeWidth="1.5"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-[16px] font-semibold text-[#1D1D1F]">我是招聘方</h3>
                      <p className="text-[13px] text-[#86868B] mt-0.5">发布用人意图，获取精准人才镜像</p>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C7C7CC" strokeWidth="1.5"><path d="m9 18 6-6-6-6"/></svg>
                  </div>
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* ── Step 2: 城市选择 ── */}
        {step === "city" && (
          <motion.div key="city" className="absolute inset-0 flex flex-col" variants={pageVariants} initial="enter" animate="center" exit="exit" transition={pageTrans}>
            <div className="px-6 pt-14 pb-2 flex items-center gap-2">
              {[0,1,2].map(i => (
                <div key={i} className="flex-1 h-[3px] rounded-full" style={{ background: i <= 1 ? "#1D1D1F" : "#E5E5EA" }} />
              ))}
            </div>

            <div className="flex-1 flex flex-col px-6 pt-10">
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.4 }}>
                <p className="text-[13px] text-[#86868B] mb-2">第 2 步</p>
                <h1 className="text-[28px] font-bold text-[#1D1D1F] tracking-tight leading-tight mb-3">你希望在哪个城市工作？</h1>
                <p className="text-[15px] text-[#86868B] leading-relaxed mb-8">经纪人将优先在该城市为你寻找机会</p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }}>
                <div className="flex flex-wrap gap-2.5 mb-6">
                  {cityChips.map(c => (
                    <motion.button key={c}
                      className="px-4 py-2.5 bg-white rounded-full text-[15px] text-[#1D1D1F] font-medium"
                      style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.04), 0 0 0 0.5px rgba(0,0,0,0.04)" }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleCitySubmit(c)}
                    >{c}</motion.button>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-white rounded-2xl px-4 py-3.5"
                    style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.04), 0 0 0 0.5px rgba(0,0,0,0.04)" }}>
                    <input
                      className="w-full text-[15px] text-[#1D1D1F] outline-none placeholder-[#C7C7CC] bg-transparent"
                      placeholder="输入其他城市…"
                      value={cityInput}
                      onChange={e => setCityInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleCitySubmit(cityInput)}
                      autoFocus
                    />
                  </div>
                  <AnimatePresence>
                    {cityInput.trim() && (
                      <motion.button
                        className="w-11 h-11 rounded-full bg-[#1D1D1F] flex items-center justify-center flex-shrink-0"
                        initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleCitySubmit(cityInput)}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="m5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>

            {/* 返回 */}
            <div className="px-6 pb-10">
              <motion.button className="text-[14px] text-[#86868B]" whileTap={{ scale: 0.97 }} onClick={() => setStep("role")}>
                ← 上一步
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ── Step 3: 职位选择 ── */}
        {step === "position" && (
          <motion.div key="position" className="absolute inset-0 flex flex-col" variants={pageVariants} initial="enter" animate="center" exit="exit" transition={pageTrans}>
            <div className="px-6 pt-14 pb-2 flex items-center gap-2">
              {[0,1,2].map(i => (
                <div key={i} className="flex-1 h-[3px] rounded-full bg-[#1D1D1F]" />
              ))}
            </div>

            <div className="flex-1 flex flex-col px-6 pt-10">
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.4 }}>
                <p className="text-[13px] text-[#86868B] mb-2">第 3 步</p>
                <h1 className="text-[28px] font-bold text-[#1D1D1F] tracking-tight leading-tight mb-3">你期望的职位方向？</h1>
                <p className="text-[15px] text-[#86868B] leading-relaxed mb-8">经纪人将根据方向匹配最合适的机会</p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }}>
                <div className="flex flex-wrap gap-2.5 mb-6">
                  {posChips.map(p => (
                    <motion.button key={p}
                      className="px-4 py-2.5 bg-white rounded-full text-[15px] text-[#1D1D1F] font-medium"
                      style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.04), 0 0 0 0.5px rgba(0,0,0,0.04)" }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handlePosSubmit(p)}
                    >{p}</motion.button>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-white rounded-2xl px-4 py-3.5"
                    style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.04), 0 0 0 0.5px rgba(0,0,0,0.04)" }}>
                    <input
                      className="w-full text-[15px] text-[#1D1D1F] outline-none placeholder-[#C7C7CC] bg-transparent"
                      placeholder="输入其他职位…"
                      value={posInput}
                      onChange={e => setPosInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handlePosSubmit(posInput)}
                      autoFocus
                    />
                  </div>
                  <AnimatePresence>
                    {posInput.trim() && (
                      <motion.button
                        className="w-11 h-11 rounded-full bg-[#1D1D1F] flex items-center justify-center flex-shrink-0"
                        initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handlePosSubmit(posInput)}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="m5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>

            <div className="px-6 pb-10">
              <motion.button className="text-[14px] text-[#86868B]" whileTap={{ scale: 0.97 }} onClick={() => setStep("city")}>
                ← 上一步
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ── Welcome ── */}
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
            <p className="text-[15px] text-[#86868B] text-center leading-relaxed">正在为你启动 AI 经纪人…</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
