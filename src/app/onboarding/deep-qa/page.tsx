"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const msgs = [
  { role: "ai", text: "现在我需要了解一些简历里没有的信息。" },
  { role: "ai", text: "你的薪资底线是多少？有没有绝对不能接受的条件？" },
  { role: "user", text: "薪资底线 25k，绝对不接受大小周和 996，最好能带团队。" },
  { role: "ai", text: "明白了。关于工作地点有偏好吗？能接受出差吗？" },
  { role: "user", text: "北京优先，上海也行。短期出差可以，长期驻场不行。" },
  { role: "ai", text: "了解。最后一个：你离职的真实原因是什么？这个信息只有我知道，不会透露给任何企业。" },
  { role: "user", text: "现在的公司晋升通道堵死了，上面的人不走我就没机会。" },
  { role: "ai", text: "信息收集完毕。让我为你生成「职业镜像」——" },
];

export default function OBDeepQAPage() {
  const router = useRouter();
  const [vis, setVis] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timers = msgs.map((_, i) => setTimeout(() => {
      setVis(c => c + 1);
      if (i === msgs.length - 1) setTimeout(() => router.push("/aha"), 1500);
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
            <p className="text-[15px] font-medium text-[#1D1D1F]">深度了解</p>
            <p className="text-[12px] text-[#34C759]">经纪人提问中</p>
          </div>
        </div>
        <motion.button className="text-[14px] text-[#86868B] font-medium px-3 py-1" whileTap={{ scale: 0.95 }} onClick={() => router.push("/dashboard?incomplete=1")}>
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
