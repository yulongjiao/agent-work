"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { User, Building2, ArrowRight, MapPin, Briefcase, Send } from "lucide-react";

/* ── 类型 ── */
type Msg = { id: number; role: "agent" | "user"; text: string };

/* ── 常量 ── */
const cityChips = ["北京", "上海", "广州", "深圳", "杭州", "成都", "武汉", "南京", "远程"];
const posChips  = ["Java 后端", "前端工程师", "全栈工程师", "产品经理", "数据工程师", "架构师", "设计师"];

/* ── 打字动画 ── */
function TypingDots() {
  return (
    <div className="flex justify-start">
      <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
        <div className="flex gap-1 items-center h-[22px]">
          {[0, 0.15, 0.3].map((d, i) => (
            <motion.div key={i} className="w-1.5 h-1.5 bg-[#86868B] rounded-full"
              animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: d }} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── 主页面 ── */
export default function SetupPage() {
  const router = useRouter();
  const mid = useRef(0);
  const nextId = () => ++mid.current;

  /* state */
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [typing, setTyping] = useState(true);
  const [step, setStep] = useState<"init" | "role" | "city" | "position" | "welcome">("init");
  const [cityInput, setCityInput] = useState("");
  const [posInput, setPosInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const navigated = useRef(false);

  /* scroll to bottom */
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, typing]);

  /* helper: agent sends messages */
  const agentSay = useCallback((texts: string[], then?: () => void) => {
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMsgs(prev => [...prev, ...texts.map(t => ({ id: nextId(), role: "agent" as const, text: t }))]);
      then?.();
    }, 900);
  }, []);

  /* ── 开场 ── */
  useEffect(() => {
    const t1 = setTimeout(() => {
      setTyping(false);
      setMsgs([{ id: nextId(), role: "agent", text: "你好！我是你的 AI 职业经纪人 👋" }]);
    }, 700);
    const t2 = setTimeout(() => {
      agentSay(["在开始之前，我需要快速了解你几个问题。", "首先，你的身份是？"], () => setStep("role"));
    }, 1800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [agentSay]);

  /* ── handlers ── */
  const handleRole = (role: "candidate" | "recruiter") => {
    const label = role === "candidate" ? "我是求职者" : "我是招聘方";
    setMsgs(prev => [...prev, { id: nextId(), role: "user", text: label }]);
    setStep("init"); // hide role cards immediately
    agentSay(["好的！你希望在哪个城市工作？"], () => setStep("city"));
  };

  const handleCitySubmit = (value: string) => {
    const v = value.trim();
    if (!v) return;
    setCityInput("");
    setMsgs(prev => [...prev, { id: nextId(), role: "user", text: v }]);
    setStep("init");
    agentSay([`${v}，了解。最后一个问题——你期望的职位方向是？`], () => setStep("position"));
  };

  const handlePosSubmit = (value: string) => {
    const v = value.trim();
    if (!v) return;
    setPosInput("");
    setMsgs(prev => [...prev, { id: nextId(), role: "user", text: v }]);
    setStep("init");
    agentSay(["太好了！基本信息已收到，正在为你启动专属服务…"], () => {
      setStep("welcome");
      setTimeout(() => {
        if (navigated.current) return;
        navigated.current = true;
        router.push("/dashboard?incomplete=1");
      }, 2400);
    });
  };

  /* ── render ── */
  return (
    <div className="flex flex-col h-screen bg-[#FAFAFA]">

      {/* ── Header ── */}
      <div className="backdrop-blur-xl bg-white/80 border-b border-gray-100 px-5 py-4 flex items-center gap-3 flex-shrink-0 z-10">
        <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center">
          <span className="text-[13px] font-semibold text-white">A.</span>
        </div>
        <div>
          <p className="text-[16px] font-semibold text-[#1D1D1F]">Agent.Work</p>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-[#34C759] rounded-full" />
            <span className="text-[12px] text-[#34C759]">正在为你服务</span>
          </div>
        </div>
      </div>

      {/* ── Chat area ── */}
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-3">
        <AnimatePresence>
          {msgs.map(m => (
            <motion.div key={m.id}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
            >
              {m.role === "agent" ? (
                <div className="bg-white text-[#1D1D1F] rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]"
                  style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
                  <p className="text-[15px] leading-relaxed">{m.text}</p>
                </div>
              ) : (
                <div className="bg-[#1D1D1F] text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%]">
                  <p className="text-[15px] leading-relaxed">{m.text}</p>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {typing && <TypingDots />}

        {/* ── Role selection cards ── */}
        {step === "role" && (
          <motion.div className="flex flex-col gap-3 pt-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
            <motion.div
              className="bg-white rounded-2xl border border-gray-100 p-4 cursor-pointer"
              style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleRole("candidate")}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F5F5F7] flex items-center justify-center flex-shrink-0">
                  <User size={18} strokeWidth={1.5} className="text-[#1D1D1F]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-[15px] font-semibold text-[#1D1D1F]">我是求职者</h3>
                  <p className="text-[13px] text-[#86868B] mt-0.5">托管职业机会，让 AI 经纪人替你谈</p>
                </div>
                <ArrowRight size={16} className="text-[#C7C7CC] flex-shrink-0" strokeWidth={1.5} />
              </div>
            </motion.div>

            <motion.div
              className="bg-white rounded-2xl border border-gray-100 p-4 cursor-pointer"
              style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleRole("recruiter")}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F5F5F7] flex items-center justify-center flex-shrink-0">
                  <Building2 size={18} strokeWidth={1.5} className="text-[#1D1D1F]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-[15px] font-semibold text-[#1D1D1F]">我是招聘方</h3>
                  <p className="text-[13px] text-[#86868B] mt-0.5">发布用人意图，获取精准人才镜像</p>
                </div>
                <ArrowRight size={16} className="text-[#C7C7CC] flex-shrink-0" strokeWidth={1.5} />
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* ── City chips ── */}
        {step === "city" && (
          <motion.div className="pt-2" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
            <div className="flex items-center gap-1.5 mb-3">
              <MapPin size={14} className="text-[#86868B]" />
              <span className="text-[12px] text-[#86868B]">快速选择或输入城市</span>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {cityChips.map(c => (
                <motion.button key={c}
                  className="px-3.5 py-2 bg-white rounded-full text-[14px] text-[#1D1D1F] border border-gray-100"
                  style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.03)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleCitySubmit(c)}
                >{c}</motion.button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                className="flex-1 bg-white rounded-2xl px-4 py-3 text-[15px] text-[#1D1D1F] outline-none border border-gray-100 placeholder-[#C7C7CC]"
                placeholder="输入其他城市…"
                value={cityInput}
                onChange={e => setCityInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleCitySubmit(cityInput)}
                autoFocus
              />
              <motion.button
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${cityInput.trim() ? "bg-[#1D1D1F]" : "bg-[#E5E5EA]"}`}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleCitySubmit(cityInput)}
              >
                <Send size={16} className={cityInput.trim() ? "text-white" : "text-[#C7C7CC]"} />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ── Position chips ── */}
        {step === "position" && (
          <motion.div className="pt-2" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
            <div className="flex items-center gap-1.5 mb-3">
              <Briefcase size={14} className="text-[#86868B]" />
              <span className="text-[12px] text-[#86868B]">快速选择或输入职位</span>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {posChips.map(p => (
                <motion.button key={p}
                  className="px-3.5 py-2 bg-white rounded-full text-[14px] text-[#1D1D1F] border border-gray-100"
                  style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.03)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePosSubmit(p)}
                >{p}</motion.button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                className="flex-1 bg-white rounded-2xl px-4 py-3 text-[15px] text-[#1D1D1F] outline-none border border-gray-100 placeholder-[#C7C7CC]"
                placeholder="输入其他职位…"
                value={posInput}
                onChange={e => setPosInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handlePosSubmit(posInput)}
                autoFocus
              />
              <motion.button
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${posInput.trim() ? "bg-[#1D1D1F]" : "bg-[#E5E5EA]"}`}
                whileTap={{ scale: 0.9 }}
                onClick={() => handlePosSubmit(posInput)}
              >
                <Send size={16} className={posInput.trim() ? "text-white" : "text-[#C7C7CC]"} />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ── Welcome animation ── */}
        {step === "welcome" && (
          <motion.div className="flex flex-col items-center py-8"
            initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
            <motion.div className="w-16 h-16 rounded-full bg-[#34C759]/10 flex items-center justify-center mb-4"
              animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#34C759" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </motion.div>
            <p className="text-[17px] font-semibold text-[#1D1D1F]">欢迎加入 Agent.Work</p>
            <p className="text-[14px] text-[#86868B] mt-1">正在进入工作台…</p>
          </motion.div>
        )}

        <div ref={endRef} />
      </div>
    </div>
  );
}
