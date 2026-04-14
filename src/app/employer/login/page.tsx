"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { success, tap } from "@/lib/haptics";

export default function EmployerLoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);

  const canSendCode = phone.length === 11 && countdown === 0;
  const canLogin = phone.length === 11 && code.length >= 4;

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const sendCode = useCallback(() => {
    if (!canSendCode) return;
    tap();
    setCountdown(60);
    setCodeSent(true);
  }, [canSendCode]);

  const handleLogin = () => {
    if (!canLogin || loading) return;
    setLoading(true);
    success();
    setTimeout(() => {
      router.push("/employer/onboarding/setup");
    }, 1000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white px-7">
      <motion.div
        className="pt-24 pb-8"
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-[14px] bg-[#1D1D1F] flex items-center justify-center"
            style={{ boxShadow: "0 4px 15px rgba(0,0,0,0.15)" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
              <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
              <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
              <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
              <path d="M10 6h4" /><path d="M10 10h4" /><path d="M10 14h4" /><path d="M10 18h4" />
            </svg>
          </div>
          <div>
            <h1 className="text-[22px] font-bold text-[#1D1D1F] tracking-tight">Agent.Work</h1>
          </div>
        </div>
        <p className="text-[16px] text-[#86868B] leading-relaxed">让 AI 招聘助理为你工作<br/>智能筛选、主动触达、面试协调</p>
      </motion.div>

      <motion.div
        className="flex-1"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <div className="mb-4">
          <label className="text-[13px] font-medium text-[#86868B] mb-2 block">手机号</label>
          <div className="flex items-center bg-[#F5F5F7] rounded-2xl px-4 h-[56px]" style={{ border: "0.5px solid rgba(0,0,0,0.04)" }}>
            <span className="text-[16px] text-[#1D1D1F] font-medium mr-3">+86</span>
            <div className="w-px h-5 bg-[#E5E5EA] mr-3" />
            <input
              type="tel" placeholder="输入手机号" maxLength={11}
              className="flex-1 text-[17px] text-[#1D1D1F] bg-transparent outline-none placeholder-[#C7C7CC] tracking-wide"
              style={{ fontFeatureSettings: "'tnum'" }}
              value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ""))}
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="text-[13px] font-medium text-[#86868B] mb-2 block">验证码</label>
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center bg-[#F5F5F7] rounded-2xl px-4 h-[56px]" style={{ border: "0.5px solid rgba(0,0,0,0.04)" }}>
              <input
                type="text" placeholder="输入验证码" maxLength={6}
                className="flex-1 text-[17px] text-[#1D1D1F] bg-transparent outline-none placeholder-[#C7C7CC] tracking-[0.3em]"
                style={{ fontFeatureSettings: "'tnum'" }}
                value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ""))}
              />
            </div>
            <motion.button
              className={`h-[56px] px-5 rounded-2xl text-[15px] font-medium flex-shrink-0 whitespace-nowrap ${canSendCode ? "bg-[#1D1D1F] text-white" : "bg-[#F5F5F7] text-[#C7C7CC]"}`}
              whileTap={canSendCode ? { scale: 0.97 } : {}}
              onClick={sendCode} disabled={!canSendCode}
            >
              {countdown > 0 ? `${countdown}s` : codeSent ? "重新获取" : "获取验证码"}
            </motion.button>
          </div>
        </div>

        <motion.button
          className={`w-full h-[56px] rounded-2xl text-[17px] font-semibold tracking-tight flex items-center justify-center ${canLogin && !loading ? "bg-[#1D1D1F] text-white" : "bg-[#F5F5F7] text-[#C7C7CC]"}`}
          whileTap={canLogin ? { scale: 0.97 } : {}}
          onClick={handleLogin} disabled={!canLogin || loading}
          style={canLogin && !loading ? { boxShadow: "0 4px 20px rgba(0,0,0,0.15)" } : {}}
        >
          {loading ? (
            <motion.div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} />
          ) : "登录"}
        </motion.button>

        {codeSent && (
          <motion.p className="text-[13px] text-[#34C759] text-center mt-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            验证码已发送，请查看短信
          </motion.p>
        )}

        <motion.button
          className="w-full h-[44px] text-[15px] text-[#86868B] font-medium mt-3"
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push("/employer/dashboard")}
        >
          暂不登录，先看看
        </motion.button>
      </motion.div>

      <motion.div className="pb-10 pt-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        <p className="text-[12px] text-[#C7C7CC] text-center leading-relaxed">
          登录即同意{" "}
          <Link href="/privacy" className="text-[#007AFF]">《用户协议》</Link>
          {" "}和{" "}
          <Link href="/privacy" className="text-[#007AFF]">《隐私政策》</Link>
        </p>
        <p className="text-[11px] text-[#E5E5EA] text-center mt-2">未注册的手机号将自动创建账号</p>
      </motion.div>
    </div>
  );
}
