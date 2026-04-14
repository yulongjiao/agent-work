"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const msgs = [
  { role: "ai", text: "现在我需要深入了解你的招聘需求，好帮你精准锁定候选人。" },
  { role: "ai", text: "这个岗位最核心的 3 个能力要求是什么？" },
  { role: "user", text: "系统设计能力、业务理解力、团队协作。" },
  { role: "ai", text: "薪资范围可以给到多少？有弹性空间吗？" },
  { role: "user", text: "Base 30-45K，特别优秀可以到 50K。" },
  { role: "ai", text: "之前这个岗位招过人吗？离职原因是什么？" },
  { role: "user", text: "前任去创业了，团队急缺技术负责人。" },
  { role: "ai", text: "有哪些是你绝对不能接受的候选人特征？" },
  { role: "user", text: "频繁跳槽（2年内换3次以上）、纯管理无技术背景。" },
  { role: "ai", text: "需求已充分理解。让我为你生成「人才市场洞察」——" },
];

export default function EmployerDeepQAPage() {
  const router = useRouter();
  const [vis, setVis] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timers = msgs.map((_, i) => setTimeout(() => {
      setVis(c => c + 1);
      if (i === msgs.length - 1) setTimeout(() => router.push("/employer/aha"), 1500);
    }, (i + 1) * 900));
    return () => timers.forEach(clearTimeout);
  }, [router]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [vis]);

  return (
    <div className="flex flex-col h-screen bg-[#FAFAFA]">
      <div className="backdrop-blur-xl bg-white/80 border-b border-gray-100 px-5 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
            <span className="text-[12px] font-semibold text-white">A</span>
          </div>
          <div>
            <p className="text-[15px] font-medium text-[#1D1D1F]">深度需求对齐</p>
            <p className="text-[12px] text-[#34C759]">招聘助理提问中</p>
          </div>
        </div>
        <motion.button className="text-[14px] text-[#86868B] font-medium px-3 py-1" whileTap={{ scale: 0.95 }} onClick={() => router.push("/employer/dashboard")}>
          稍后再说
        </motion.button>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4">
        {msgs.slice(0, vis).map((msg, i) => (
          <motion.div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            {msg.role === "ai" ? (
              <div className="bg-[#F5F5F7] text-[#1D1D1F] rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]"><p className="text-[15px] leading-relaxed">{msg.text}</p></div>
            ) : (
              <div className="bg-black text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%]"><p className="text-[15px] leading-relaxed">{msg.text}</p></div>
            )}
          </motion.div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
}
