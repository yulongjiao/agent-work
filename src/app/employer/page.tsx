"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const smooth = { duration: 1, ease: [0.32, 0.72, 0, 1] as const };

export default function EmployerLandingPage() {
  const router = useRouter();
  const [phase, setPhase] = useState(0);
  const navigated = useRef(false);

  const goLogin = () => {
    if (navigated.current) return;
    navigated.current = true;
    router.push("/employer/login");
  };

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 2000);
    const t2 = setTimeout(() => goLogin(), 3500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const skipToLogin = () => {
    setPhase(1);
    setTimeout(() => goLogin(), 200);
  };

  const landed = phase >= 1;

  return (
    <div className="relative min-h-screen overflow-hidden" onClick={skipToLogin}>
      <motion.div
        className="absolute inset-0"
        initial={{ backgroundColor: "#1D1D1F" }}
        animate={{ backgroundColor: landed ? "#FAFAFA" : "#1D1D1F" }}
        transition={{ ...smooth }}
      />
      <motion.div
        className="absolute top-[280px] left-1/2 -translate-x-1/2 w-[320px] h-[320px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(0,122,255,0.15) 0%, transparent 70%)" }}
        animate={{
          scale: landed ? 3 : [1, 1.15, 1],
          opacity: landed ? 0 : [0.5, 0.9, 0.5],
        }}
        transition={landed ? { ...smooth } : { duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="relative z-10 flex flex-col items-center min-h-screen px-6">
        <motion.div
          className="flex flex-col items-center w-full"
          initial={{ paddingTop: 280 }}
          animate={{ paddingTop: landed ? 200 : 280 }}
          transition={{ ...smooth }}
        >
          <motion.div
            className="flex items-center justify-center overflow-hidden"
            initial={{ scale: 0, rotate: -180, width: 80, height: 80, borderRadius: 22 }}
            animate={{
              scale: 1, rotate: 0,
              width: landed ? 60 : 80, height: landed ? 60 : 80,
              borderRadius: landed ? 18 : 22,
              backgroundColor: landed ? "#1D1D1F" : "rgba(255,255,255,0.07)",
              boxShadow: landed ? "0 6px 24px rgba(0,0,0,0.15)" : "0 0px 0px rgba(0,0,0,0)",
            }}
            transition={phase === 0 ? { type: "spring", stiffness: 180, damping: 18, delay: 0.15 } : { ...smooth }}
          >
            <motion.span
              className="font-bold tracking-tighter text-white"
              initial={{ opacity: 0, fontSize: "32px" }}
              animate={{ opacity: 1, fontSize: landed ? "24px" : "32px" }}
              transition={{ delay: phase === 0 ? 0.45 : 0, ...smooth }}
            >
              A.
            </motion.span>
          </motion.div>
          <motion.h1
            className="font-semibold tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: 1, y: 0,
              fontSize: landed ? "28px" : "24px",
              color: landed ? "#1D1D1F" : "#ffffff",
              marginTop: landed ? 16 : 24,
            }}
            transition={{ delay: phase === 0 ? 0.55 : 0, ...smooth }}
          >
            Agent.Work
          </motion.h1>
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
            AI 招聘助理 · 精准锁定人才
          </motion.p>
        </motion.div>
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
