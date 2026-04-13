"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

const companies = [
  { name: "字节跳动", jobs: "1,247" },
  { name: "阿里巴巴", jobs: "2,356" },
  { name: "美团", jobs: "892" },
  { name: "腾讯", jobs: "1,834" },
  { name: "蚂蚁集团", jobs: "567" },
  { name: "小红书", jobs: "423" },
  { name: "京东", jobs: "1,102" },
  { name: "快手", jobs: "678" },
  { name: "网易", jobs: "534" },
  { name: "拼多多", jobs: "891" },
  { name: "百度", jobs: "712" },
  { name: "滴滴", jobs: "345" },
];

export default function AssignAgentPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [visibleCompanies, setVisibleCompanies] = useState<number[]>([]);

  // 步骤3：依次显示企业
  useEffect(() => {
    if (step !== 2) return;
    setVisibleCompanies([]);
    const timers: NodeJS.Timeout[] = [];
    companies.forEach((_, i) => {
      timers.push(setTimeout(() => {
        setVisibleCompanies(prev => [...prev, i]);
      }, 300 + i * 200));
    });
    return () => timers.forEach(clearTimeout);
  }, [step]);

  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      router.push("/login");
    }
  };

  const handleSkip = () => {
    router.push("/login");
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* 顶部跳过 */}
      <div className="flex justify-end px-6 pt-14">
        <motion.button
          className="text-[14px] text-[#86868B] font-medium px-3 py-1"
          onClick={handleSkip}
          whileTap={{ scale: 0.95 }}
        >
          跳过
        </motion.button>
      </div>

      {/* 内容区 */}
      <div className="flex-1 flex flex-col px-7">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step0"
              className="flex-1 flex flex-col justify-center"
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* 插图 */}
              <div className="mb-10 flex justify-center">
                <div className="relative w-48 h-48">
                  {/* 中心经纪人 */}
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
                  >
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#1D1D1F] to-[#3A3A3C] flex items-center justify-center"
                      style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.15)" }}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                        <path d="m12 3-1.9 5.8a2 2 0 0 1-1.287 1.288L3 12l5.8 1.9a2 2 0 0 1 1.288 1.287L12 21l1.9-5.8a2 2 0 0 1 1.287-1.288L21 12l-5.8-1.9a2 2 0 0 1-1.288-1.287Z" />
                      </svg>
                    </div>
                  </motion.div>
                  {/* 环绕光圈 */}
                  <motion.div
                    className="absolute inset-0 rounded-full border border-[#007AFF]/20"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                  <motion.div
                    className="absolute inset-4 rounded-full border border-[#007AFF]/15"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0, 0.2] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                  />
                </div>
              </div>
              <h1 className="text-[26px] font-bold text-[#1D1D1F] tracking-tight leading-[1.3]">
                让你的 AI 经纪人<br/>帮你找工作。
              </h1>
              <p className="text-[16px] text-[#86868B] mt-4 leading-relaxed">
                告别手动海投和重复对话，由经纪人替你筛选最匹配的岗位。
              </p>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step1"
              className="flex-1 flex flex-col justify-center"
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* 插图 - 24h 时钟 */}
              <div className="mb-10 flex justify-center">
                <motion.div
                  className="relative w-40 h-40"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                >
                  <div className="absolute inset-0 rounded-full bg-[#F5F5F7] flex items-center justify-center"
                    style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
                    <span className="text-[42px] font-bold text-[#1D1D1F] tracking-tighter" style={{ fontFeatureSettings: "'tnum'" }}>24h</span>
                  </div>
                  {/* 旋转指针 */}
                  <motion.div
                    className="absolute top-1/2 left-1/2 w-0.5 h-14 bg-[#007AFF] rounded-full origin-bottom"
                    style={{ x: "-50%", y: "-100%" }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  />
                  <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-[#007AFF] rounded-full -translate-x-1/2 -translate-y-1/2" />
                </motion.div>
              </div>
              <h1 className="text-[26px] font-bold text-[#1D1D1F] tracking-tight leading-[1.3]">
                24 小时自动沟通。
              </h1>
              <p className="text-[16px] text-[#86868B] mt-4 leading-relaxed">
                把时间留给自己，把找工作交给经纪人，全网自动沟通，为你谈判最佳薪资。
              </p>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              className="flex-1 flex flex-col justify-center"
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* 企业瀑布流 */}
              <div className="mb-8">
                <div className="flex flex-wrap gap-2 justify-center">
                  {companies.map((c, i) => (
                    <AnimatePresence key={c.name}>
                      {visibleCompanies.includes(i) && (
                        <motion.div
                          className="flex items-center gap-2 bg-[#F5F5F7] rounded-full px-3.5 py-2"
                          initial={{ opacity: 0, scale: 0.6, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        >
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#1D1D1F] to-[#3A3A3C] flex items-center justify-center">
                            <span className="text-[10px] font-bold text-white">{c.name[0]}</span>
                          </div>
                          <span className="text-[13px] font-medium text-[#1D1D1F]">{c.name}</span>
                          <span className="text-[11px] text-[#86868B]">{c.jobs}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  ))}
                </div>
              </div>
              <h1 className="text-[26px] font-bold text-[#1D1D1F] tracking-tight leading-[1.3]">
                10,000+ 优质企业<br/>意向寻找中。
              </h1>
              <p className="text-[16px] text-[#86868B] mt-4 leading-relaxed">
                直接与企业对话，准备好唤醒你的专属职业经纪人了吗？
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 底部按钮 + 指示器 */}
      <div className="px-7 pb-12">
        {/* 分页指示器 */}
        <div className="flex justify-center gap-2 mb-6">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="h-[3px] rounded-full"
              animate={{
                width: step === i ? 24 : 8,
                backgroundColor: step === i ? "#1D1D1F" : "#E5E5EA",
              }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          ))}
        </div>

        <motion.button
          className="w-full h-[56px] bg-[#1D1D1F] text-white rounded-2xl text-[17px] font-semibold tracking-tight"
          whileTap={{ scale: 0.97 }}
          onClick={handleNext}
          style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}
        >
          {step < 2 ? "继续" : "唤醒经纪人"}
        </motion.button>
      </div>
    </div>
  );
}
