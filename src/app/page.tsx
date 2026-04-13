"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Building2, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

const smooth = { duration: 1, ease: [0.32, 0.72, 0, 1] as const };

export default function LandingPage() {
  const router = useRouter();
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 2000);
    const t2 = setTimeout(() => setPhase(2), 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const landed = phase >= 1;

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* ── 背景 ── */}
      <motion.div
        className="absolute inset-0"
        initial={{ backgroundColor: "#1D1D1F" }}
        animate={{ backgroundColor: landed ? "#FAFAFA" : "#1D1D1F" }}
        transition={{ ...smooth }}
      />

      {/* ── 光晕 ── */}
      <motion.div
        className="absolute top-[280px] left-1/2 -translate-x-1/2 w-[320px] h-[320px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(52,199,89,0.15) 0%, transparent 70%)" }}
        animate={{
          scale: landed ? 3 : [1, 1.15, 1],
          opacity: landed ? 0 : [0.5, 0.9, 0.5],
        }}
        transition={landed ? { ...smooth } : { duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* ── 主内容 ── */}
      <div className="relative z-10 flex flex-col items-center min-h-screen px-6">

        {/* ── Logo + 品牌 ── */}
        <motion.div
          className="flex flex-col items-center w-full"
          initial={{ paddingTop: 280 }}
          animate={{ paddingTop: landed ? 100 : 280 }}
          transition={{ ...smooth }}
        >
          {/* Logo */}
          <motion.div
            className="flex items-center justify-center overflow-hidden"
            initial={{ scale: 0, rotate: -180, width: 80, height: 80, borderRadius: 22 }}
            animate={{
              scale: 1,
              rotate: 0,
              width: landed ? 52 : 80,
              height: landed ? 52 : 80,
              borderRadius: landed ? 15 : 22,
              backgroundColor: landed ? "#1D1D1F" : "rgba(255,255,255,0.07)",
              boxShadow: landed ? "0 6px 24px rgba(0,0,0,0.15)" : "0 0px 0px rgba(0,0,0,0)",
            }}
            transition={phase === 0
              ? { type: "spring", stiffness: 180, damping: 18, delay: 0.15 }
              : { ...smooth }
            }
          >
            <motion.span
              className="font-bold tracking-tighter text-white"
              initial={{ opacity: 0, fontSize: "32px" }}
              animate={{ opacity: 1, fontSize: landed ? "20px" : "32px" }}
              transition={{ delay: phase === 0 ? 0.45 : 0, ...smooth }}
            >
              A.
            </motion.span>
          </motion.div>

          {/* 品牌名 */}
          <motion.h1
            className="font-semibold tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: 1,
              y: 0,
              fontSize: landed ? "28px" : "24px",
              color: landed ? "#1D1D1F" : "#ffffff",
              marginTop: landed ? 16 : 24,
            }}
            transition={{ delay: phase === 0 ? 0.55 : 0, ...smooth }}
          >
            Agent.Work
          </motion.h1>

          {/* Slogan */}
          <motion.p
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              color: landed ? "#86868B" : "rgba(255,255,255,0.28)",
              fontSize: landed ? "14px" : "13px",
              marginTop: landed ? 8 : 10,
              letterSpacing: landed ? "0px" : "1px",
            }}
            transition={{ delay: phase === 0 ? 0.9 : 0, ...smooth }}
          >
            重塑你的职业连接
          </motion.p>
        </motion.div>

        {/* ── 角色选择 ── */}
        <motion.div
          className="w-full flex flex-col gap-4 mt-12"
          initial={{ opacity: 0, y: 60 }}
          animate={{
            opacity: phase >= 2 ? 1 : 0,
            y: phase >= 2 ? 0 : 60,
          }}
          transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
          style={{ pointerEvents: phase >= 2 ? "auto" : "none" }}
        >
          <motion.div
            className="w-full bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 cursor-pointer"
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/preview/assign")}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#F5F5F7] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User size={20} strokeWidth={1.5} className="text-[#1D1D1F]" />
                </div>
                <div>
                  <h3 className="text-[17px] font-semibold text-[#1D1D1F]">我是求职者</h3>
                  <p className="text-[14px] text-[#86868B] mt-1.5 leading-relaxed">托管职业机会，让 AI 经纪人替你谈。</p>
                </div>
              </div>
              <ArrowRight size={18} className="text-[#86868B] mt-2 flex-shrink-0" strokeWidth={1.5} />
            </div>
          </motion.div>

          <motion.div
            className="w-full bg-[#F5F5F7] rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 cursor-pointer"
            whileTap={{ scale: 0.97 }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Building2 size={20} strokeWidth={1.5} className="text-[#1D1D1F]" />
                </div>
                <div>
                  <h3 className="text-[17px] font-semibold text-[#1D1D1F]">我是招聘方</h3>
                  <p className="text-[14px] text-[#86868B] mt-1.5 leading-relaxed">发布用人意图，获取精准人才镜像。</p>
                </div>
              </div>
              <ArrowRight size={18} className="text-[#86868B] mt-2 flex-shrink-0" strokeWidth={1.5} />
            </div>
          </motion.div>
        </motion.div>

        {/* ── 底部加载指示 ── */}
        <motion.div
          className="absolute bottom-16 flex items-center gap-1.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: phase === 0 ? 1 : 0 }}
          transition={{ delay: phase === 0 ? 1.3 : 0, duration: 0.4 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-[5px] h-[5px] rounded-full bg-white/20"
              animate={{ opacity: [0.2, 0.8, 0.2] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
