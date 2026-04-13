"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

/* ============ SVG Tab Icons ============ */
const IconHome = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#1D1D1F" : "#86868B"} strokeWidth={active ? 2 : 1.5}>
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9,22 9,12 15,12 15,22" />
  </svg>
);
const IconSparkles = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#1D1D1F" : "#86868B"} strokeWidth={active ? 2 : 1.5}>
    <path d="m12 3-1.9 5.8a2 2 0 0 1-1.287 1.288L3 12l5.8 1.9a2 2 0 0 1 1.288 1.287L12 21l1.9-5.8a2 2 0 0 1 1.287-1.288L21 12l-5.8-1.9a2 2 0 0 1-1.288-1.287Z" />
  </svg>
);
const IconMessage = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#1D1D1F" : "#86868B"} strokeWidth={active ? 2 : 1.5}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
const IconUserTab = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#1D1D1F" : "#86868B"} strokeWidth={active ? 2 : 1.5}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

/* ============ Bottom Tab Bar (4 tabs, consistent with logged-in) ============ */
function PreviewTabBar({ activeTab, onTabChange }: { activeTab: number; onTabChange: (i: number) => void }) {
  const tabs = [
    { icon: IconHome, label: "概览", badge: 2 },
    { icon: IconSparkles, label: "机会", badge: 3 },
    { icon: IconMessage, label: "经纪人" },
    { icon: IconUserTab, label: "资产" },
  ];
  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[430px] h-20 backdrop-blur-xl bg-white/80 border-t border-gray-100 flex items-start pt-2 px-4 z-40">
      {tabs.map((tab, i) => {
        const Icon = tab.icon;
        const isA = activeTab === i;
        return (
          <button key={tab.label} className="flex-1 flex flex-col items-center gap-1 pt-1" onClick={() => onTabChange(i)}>
            <div className="relative">
              <Icon active={isA} />
              {tab.badge && tab.badge > 0 && (
                <span className="absolute -top-1.5 -right-2.5 w-4 h-4 bg-[#FF3B30] rounded-full text-[10px] text-white font-medium flex items-center justify-center">{tab.badge}</span>
              )}
            </div>
            <span className={`text-[10px] ${isA ? "text-[#1D1D1F] font-medium" : "text-[#86868B]"}`}>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ============ Engine Status ============ */
const engineStates = [
  { key: "active", label: "积极推进", color: "#34C759", dotAnim: "animate-glow-dot" },
] as const;

/* ============ Preview Overview (Tab 0) ============ */
function PreviewOverview({ onLogin }: { onLogin: () => void }) {
  const [showToast1, setShowToast1] = useState(false);
  const [showToast2, setShowToast2] = useState(false);
  const engine = engineStates[0];

  useEffect(() => {
    const t1 = setTimeout(() => setShowToast1(true), 2000);
    const t2 = setTimeout(() => setShowToast2(true), 4000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const tasks = [
    {
      id: 1, type: "P0" as const, dotColor: "#FF3B30", badge: "紧急决策",
      company: "字节跳动", team: "商业化团队", salary: "28-35k",
      alert: "HR 发送面试邀请：下周三 4/16 14:00 线上技术面",
      time: "2 分钟前",
      actions: [{ label: "确认参加", primary: true }, { label: "换个时间", primary: false }],
    },
    {
      id: 2, type: "P1" as const, dotColor: "#FF9500", badge: "薪资博弈",
      company: "美团", team: "到店事业群", salary: "23k×16薪",
      conflictPoint: "Base 薪资不符：底线 25k，HR 咬死 23k",
      agentCalc: "按 16 薪折算，实际月均 30.7k，年总包 ≈ 44 万，已溢价 12%。签字费另计 5 万。建议继续推进。",
      time: "10 分钟前",
      actions: [{ label: "同意继续推进", primary: true }, { label: "坚守底线", primary: false }],
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-24 relative">
      <div className="sticky top-0 z-30 backdrop-blur-xl bg-white/80 border-b border-gray-100 px-5 pt-14 pb-4">
        <h1 className="text-[22px] font-semibold text-[#1D1D1F]">概览</h1>
      </div>

      {/* 模块一：当前执行意图 */}
      <div className="px-5 pt-5">
        <motion.div className="bg-white/70 backdrop-blur-xl rounded-[20px] border border-white/80 relative z-10" style={{ boxShadow: "0 2px 20px rgba(0,0,0,0.04), 0 0 0 0.5px rgba(0,0,0,0.03)" }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="px-5 pt-4 pb-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[11px] font-medium text-[#86868B] uppercase tracking-wider">执行意图</p>
              <div className="flex items-center gap-1.5 h-[26px] px-2.5 rounded-full backdrop-blur-sm"
                style={{ backgroundColor: `${engine.color}0D`, border: `0.5px solid ${engine.color}25` }}>
                <div className="relative flex items-center justify-center w-[7px] h-[7px]">
                  <div className="w-[5px] h-[5px] rounded-full" style={{ backgroundColor: engine.color }} />
                  <div className={`absolute w-[7px] h-[7px] rounded-full ${engine.dotAnim}`} style={{ backgroundColor: engine.color }} />
                </div>
                <span className="text-[11px] font-medium tracking-tight" style={{ color: engine.color }}>{engine.label}</span>
              </div>
            </div>
            <div className="flex items-start justify-between gap-3">
              <p className="text-[16px] font-semibold text-[#1D1D1F] leading-[1.4] tracking-tight flex-1">寻找北京/广州的高级 Java 后端或架构师岗位</p>
              <motion.button
                className="flex-shrink-0 mt-0.5 flex items-center gap-1 text-[13px] text-[#007AFF] font-medium"
                onClick={onLogin}
                whileTap={{ scale: 0.95 }}
              >
                <span>调整</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#007AFF" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 模块二：工作简报 */}
      <div className="px-5 pt-3">
        <div className="bg-white/70 backdrop-blur-xl rounded-[16px] px-5 py-4" style={{ boxShadow: "0 1px 10px rgba(0,0,0,0.03), 0 0 0 0.5px rgba(0,0,0,0.03)" }}>
          <p className="text-[13px] text-[#86868B] mb-2">你的经纪人替你</p>
          <div className="flex items-baseline gap-0 flex-wrap">
            <span className="text-[13px] text-[#86868B]">浏览了</span>
            <span className="text-[17px] font-bold tracking-tight text-[#1D1D1F] mx-1" style={{ fontFeatureSettings: "'tnum'" }}>1,240</span>
            <span className="text-[13px] text-[#86868B] ml-0.5">个岗位</span>
            <span className="text-[#E5E5EA] mx-2">|</span>
            <span className="text-[13px] text-[#86868B]">沟通</span>
            <span className="text-[17px] font-bold tracking-tight text-[#1D1D1F] mx-1" style={{ fontFeatureSettings: "'tnum'" }}>24</span>
            <span className="text-[#E5E5EA] mx-2">|</span>
            <span className="text-[13px] text-[#86868B]">拦截</span>
            <span className="text-[17px] font-bold tracking-tight text-[#1D1D1F] mx-1" style={{ fontFeatureSettings: "'tnum'" }}>86</span>
          </div>
        </div>
      </div>

      {/* 模块三：待处理任务 */}
      <div className="px-5 pt-5 pb-2">
        <p className="text-[11px] font-medium text-[#86868B] uppercase tracking-wider mb-3">待处理</p>
        <div className="space-y-3">
          {tasks.map((task, idx) => (
            <motion.div key={task.id} className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.04), 0 0 0 0.5px rgba(0,0,0,0.04)" }} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + idx * 0.08 }}>
              <div className="px-5 py-4">
                {/* 头部：类型 + 时间 */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-[6px] h-[6px] rounded-full" style={{ backgroundColor: task.dotColor }} />
                    <span className="text-[12px] text-[#86868B] font-medium">{task.badge}</span>
                  </div>
                  {task.time && <span className="text-[11px] text-[#C7C7CC]">{task.time}</span>}
                </div>

                {/* 公司信息 */}
                <div className="mb-3">
                  <p className="text-[16px] font-semibold text-[#1D1D1F] tracking-tight">{task.company}</p>
                  <p className="text-[13px] text-[#86868B] mt-0.5">{task.team} · {task.salary}</p>
                </div>

                {/* P0: 警报 */}
                {task.type === "P0" && task.alert && (
                  <p className="text-[14px] text-[#1D1D1F] leading-[1.5] mb-4">{task.alert}</p>
                )}

                {/* P1: 冲突 + 分析 */}
                {task.type === "P1" && (
                  <div className="mb-4">
                    {task.conflictPoint && (
                      <p className="text-[14px] font-medium text-[#1D1D1F] leading-[1.5] mb-1.5">{task.conflictPoint}</p>
                    )}
                    {task.agentCalc && (
                      <p className="text-[13px] text-[#86868B] leading-[1.6]">{task.agentCalc}</p>
                    )}
                  </div>
                )}

                {/* 操作按钮 */}
                <div className="flex gap-2">
                  {task.actions.map((act) => (
                    <motion.button
                      key={act.label}
                      className={`h-[40px] rounded-[10px] text-[13px] font-medium px-4 ${act.primary ? "flex-1 bg-[#1D1D1F] text-white" : "bg-[#F5F5F7] text-[#86868B]"}`}
                      whileTap={{ scale: 0.97 }}
                      onClick={onLogin}
                    >
                      {act.label}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 引导提示 Toasts */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[430px] px-4 z-50 flex flex-col gap-2">
        <AnimatePresence>
          {showToast1 && (
            <motion.div
              key="toast1"
              className="bg-white rounded-2xl border border-gray-100 p-4"
              style={{ boxShadow: "0 12px 40px rgba(0,0,0,0.12)" }}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-[#FF2D55]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF2D55" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
                </div>
                <div className="flex-1">
                  <p className="text-[14px] font-semibold text-[#1D1D1F]">经纪人已为您争取到面试机会</p>
                  <p className="text-[13px] text-[#86868B] mt-0.5"><span className="text-[#FF2D55] font-medium">字节跳动</span> 已向您发起面试邀约，请及时确认！</p>
                  <motion.button
                    className="mt-2.5 h-[32px] px-4 bg-[#FF2D55] text-white rounded-lg text-[13px] font-medium"
                    whileTap={{ scale: 0.95 }}
                    onClick={onLogin}
                  >
                    立即确认
                  </motion.button>
                </div>
                <button className="text-[#C7C7CC] mt-0.5" onClick={() => setShowToast1(false)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
                </button>
              </div>
            </motion.div>
          )}
          {showToast2 && (
            <motion.div
              key="toast2"
              className="bg-white rounded-2xl border border-gray-100 p-4"
              style={{ boxShadow: "0 12px 40px rgba(0,0,0,0.12)" }}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-[#34C759]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34C759" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                </div>
                <div className="flex-1">
                  <p className="text-[14px] font-semibold text-[#1D1D1F]">经纪人已为您争取到高薪 Offer</p>
                  <p className="text-[13px] text-[#86868B] mt-0.5">年总包 <span className="text-[#34C759] font-semibold">43 万</span>，请确认是否继续推进</p>
                  <motion.button
                    className="mt-2.5 h-[32px] px-4 bg-[#34C759] text-white rounded-lg text-[13px] font-medium"
                    whileTap={{ scale: 0.95 }}
                    onClick={onLogin}
                  >
                    查看详情
                  </motion.button>
                </div>
                <button className="text-[#C7C7CC] mt-0.5" onClick={() => setShowToast2(false)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ============ Preview Opportunities (Tab 1) with overlay ============ */
function PreviewOpportunities({ onLogin }: { onLogin: () => void }) {
  type TabKey = "ALL" | "KEY_PROGRESS" | "NEGOTIATION" | "ENDED";
  const [activeTab, setActiveTab] = useState<TabKey>("ALL");
  const [sortByMatch, setSortByMatch] = useState(false);

  const opps = [
    { id: 1, company: "字节跳动", team: "商业化团队", match: 95, salary: "28-35k", state: "HUMAN_TAKEOVER" as const },
    { id: 2, company: "蚂蚁集团", team: "支付安全", match: 91, salary: "30-40k", state: "SUSPENDED" as const },
    { id: 3, company: "美团", team: "到店事业群", match: 88, salary: "26-32k", state: "NEGOTIATING" as const },
    { id: 4, company: "小红书", team: "社区技术", match: 85, salary: "27-34k", state: "NEGOTIATING" as const },
    { id: 5, company: "腾讯", team: "微信支付", match: 82, salary: "30-42k", state: "NEGOTIATING" as const },
    { id: 6, company: "百度", team: "搜索技术", match: 70, salary: "25-30k", state: "DEAD_END" as const },
  ];

  const keyProgress = opps.filter(o => o.state === "SUSPENDED" || o.state === "HUMAN_TAKEOVER");
  const negotiation = opps.filter(o => o.state === "NEGOTIATING");
  const ended = opps.filter(o => o.state === "DEAD_END");

  const tabs: { key: TabKey; label: string; count: number; color?: string }[] = [
    { key: "ALL", label: "总览", count: opps.length },
    { key: "KEY_PROGRESS", label: "关键推进", count: keyProgress.length, color: "#FF9500" },
    { key: "NEGOTIATION", label: "沟通谈判", count: negotiation.length, color: "#34C759" },
    { key: "ENDED", label: "拦截结束", count: ended.length, color: "#86868B" },
  ];

  const base = activeTab === "ALL" ? opps
    : activeTab === "KEY_PROGRESS" ? keyProgress
    : activeTab === "NEGOTIATION" ? negotiation
    : ended;
  const filtered = sortByMatch ? [...base].sort((a, b) => b.match - a.match) : base;

  const stateConfig: Record<string, { label: string; color: string; dot?: boolean }> = {
    NEGOTIATING: { label: "沟通中", color: "#34C759", dot: true },
    SUSPENDED: { label: "等待指示", color: "#FF9500" },
    HUMAN_TAKEOVER: { label: "真人接管", color: "#007AFF" },
    DEAD_END: { label: "已出局", color: "#C7C7CC" },
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-24 relative">
      <div className="sticky top-0 z-30 backdrop-blur-xl bg-white/80 border-b border-gray-100 px-5 pt-14 pb-3">
        <h1 className="text-[22px] font-semibold text-[#1D1D1F] mb-3">机会</h1>

        {/* 嗅探统计 */}
        <div className="flex items-center gap-2 mb-3">
          <div className="relative">
            <div className="w-[5px] h-[5px] rounded-full bg-[#007AFF]" />
            <div className="absolute inset-0 w-[5px] h-[5px] rounded-full bg-[#007AFF] animate-ping opacity-40" />
          </div>
          <span className="text-[12px] text-[#86868B]">正在与 <span className="font-medium text-[#1D1D1F]">45</span> 位 HR 探索中</span>
        </div>

        {/* 标签栏 */}
        <div className="flex items-center gap-1.5">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <motion.button
                key={tab.key}
                className={`flex-1 flex items-center justify-center gap-1 h-[32px] rounded-full text-[12px] font-medium transition-colors ${isActive ? "bg-[#1D1D1F] text-white" : "bg-[#F5F5F7] text-[#86868B]"}`}
                whileTap={{ scale: 0.96 }}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.color && !isActive && <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: tab.color }} />}
                <span>{tab.label}</span>
                <span className={`text-[10px] ${isActive ? "text-white/50" : "text-[#C7C7CC]"}`}>{tab.count}</span>
              </motion.button>
            );
          })}
          <motion.button
            className={`w-[32px] h-[32px] flex items-center justify-center rounded-full flex-shrink-0 transition-colors ${sortByMatch ? "bg-[#1D1D1F] text-white" : "bg-[#F5F5F7] text-[#86868B]"}`}
            whileTap={{ scale: 0.96 }}
            onClick={() => setSortByMatch(!sortByMatch)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M6 12h12M9 18h6" /></svg>
          </motion.button>
        </div>
      </div>

      <div className="px-5 pt-4 space-y-3">
        {filtered.map((opp, idx) => {
          const sc = stateConfig[opp.state];
          const isDead = opp.state === "DEAD_END";
          return (
            <motion.div key={opp.id} className={`bg-white rounded-2xl overflow-hidden ${isDead ? "opacity-55" : ""}`} style={{ boxShadow: isDead ? "0 1px 8px rgba(0,0,0,0.03)" : "0 2px 16px rgba(0,0,0,0.04), 0 0 0 0.5px rgba(0,0,0,0.04)" }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: isDead ? 0.55 : 1, y: 0 }} transition={{ delay: idx * 0.06 }}>
              <div className="px-5 py-4">
                <div className="flex items-center justify-between mb-3">
                  <p className={`text-[16px] font-semibold tracking-tight ${isDead ? "text-[#86868B]" : "text-[#1D1D1F]"}`}>{opp.company}</p>
                  <div className="flex items-center gap-3">
                    {!isDead && (opp.match >= 90 ? (
                      <span className="text-[11px] font-semibold text-[#FF9500] bg-[#FF9500]/10 px-2 py-0.5 rounded-full">TOP {opp.match}%</span>
                    ) : (
                      <span className="text-[12px] text-[#86868B] font-medium">{opp.match}%</span>
                    ))}
                    <div className="flex items-center gap-1.5">
                      {sc.dot ? (
                        <div className="relative">
                          <div className="w-[6px] h-[6px] rounded-full" style={{ backgroundColor: sc.color }} />
                          <div className="absolute inset-0 w-[6px] h-[6px] rounded-full animate-ping opacity-60" style={{ backgroundColor: sc.color }} />
                        </div>
                      ) : (
                        <div className="w-[6px] h-[6px] rounded-full" style={{ backgroundColor: sc.color }} />
                      )}
                      <span className="text-[12px] font-medium" style={{ color: sc.color }}>{sc.label}</span>
                    </div>
                  </div>
                </div>
                <p className={`text-[13px] ${isDead ? "text-[#C7C7CC]" : "text-[#86868B]"}`}>{opp.team} · {opp.salary}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 遮罩层 */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[430px] z-30" style={{ height: "55vh" }}>
        <div className="absolute inset-0 flex flex-col" style={{ background: "linear-gradient(to bottom, rgba(250,250,250,0) 0%, rgba(250,250,250,0.85) 20%, rgba(250,250,250,0.98) 40%, rgba(250,250,250,1) 50%)" }}>
          <div className="flex-1" />
          <div className="px-8 pb-8 flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1D1D1F] to-[#3A3A3C] flex items-center justify-center mb-5"
              style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.15)" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                <path d="m12 3-1.9 5.8a2 2 0 0 1-1.287 1.288L3 12l5.8 1.9a2 2 0 0 1 1.288 1.287L12 21l1.9-5.8a2 2 0 0 1 1.287-1.288L21 12l-5.8-1.9a2 2 0 0 1-1.288-1.287Z" />
              </svg>
            </div>
            <h3 className="text-[20px] font-bold text-[#1D1D1F] tracking-tight mb-2">发现你的隐藏机会</h3>
            <p className="text-[14px] text-[#86868B] text-center leading-relaxed mb-5">创建你的职业经纪人，解锁全部机会详情</p>
            <div className="flex items-center gap-4 mb-6">
              {["24h 全自动寻找", "AI 智能谈判", "隐私安全保障"].map((v) => (
                <div key={v} className="flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34C759" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"/></svg>
                  <span className="text-[12px] text-[#1D1D1F] font-medium">{v}</span>
                </div>
              ))}
            </div>
            <motion.button
              className="w-full h-[52px] bg-[#1D1D1F] text-white rounded-2xl text-[16px] font-semibold tracking-tight"
              whileTap={{ scale: 0.97 }}
              onClick={onLogin}
              style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}
            >
              创建我的职业经纪人
            </motion.button>
            <p className="text-[12px] text-[#C7C7CC] mt-3">已有 12,847 人正在使用</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ Preview Agent Chat (Tab 1) - 2 rounds then login ============ */
function PreviewChat({ onLogin }: { onLogin: () => void }) {
  const [msgs, setMsgs] = useState([
    { id: 1, role: "agent", text: "你好，我是你的专属职业经纪人 Alex。我正在帮你搜索和沟通合适的机会，有什么想了解的？" },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [userMsgCount, setUserMsgCount] = useState(0);
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const agentReplies = [
    "目前已在 4 个平台扫描了 1,240+ 岗位，其中 24 个主动发起了沟通，有 7 家企业主动找来。字节跳动商业化团队匹配度最高 (95%)，HR 已发起面试邀约。",
    "好的，我会重点跟进这个方向。不过要查看详细的沟通记录和做出决策，需要你先完成登录验证哦。",
  ];

  const handleSend = () => {
    if (!inputValue.trim()) return;
    if (userMsgCount >= 2) {
      onLogin();
      return;
    }
    const newUserMsg = { id: msgs.length + 1, role: "user", text: inputValue };
    setMsgs(prev => [...prev, newUserMsg]);
    setInputValue("");
    const count = userMsgCount + 1;
    setUserMsgCount(count);

    // 模拟经纪人回复
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      const reply = agentReplies[count - 1] || agentReplies[1];
      setMsgs(prev => [...prev, { id: prev.length + 1, role: "agent", text: reply }]);
      if (count >= 2) {
        // 第二轮回复后，再次输入将跳登录
      }
    }, 1200);
  };

  return (
    <div className="flex flex-col h-screen bg-[#FAFAFA]">
      <div className="sticky top-0 z-30 backdrop-blur-xl bg-white/80 border-b border-gray-100 px-5 pt-14 pb-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center"><span className="text-[13px] font-semibold text-white">A</span></div>
        <div>
          <p className="text-[16px] font-semibold text-[#1D1D1F]">我的经纪人</p>
          <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-[#34C759] rounded-full" /><span className="text-[12px] text-[#34C759]">在线 · 正在处理 3 个任务</span></div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 pb-28">
        {msgs.map((msg) => (
          <motion.div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            {msg.role === "agent" ? (
              <div className="bg-[#F5F5F7] text-[#1D1D1F] rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]"><p className="text-[15px] leading-relaxed">{msg.text}</p></div>
            ) : (
              <div className="bg-black text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%]"><p className="text-[15px] leading-relaxed">{msg.text}</p></div>
            )}
          </motion.div>
        ))}
        {typing && (
          <motion.div className="flex justify-start" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-[#F5F5F7] rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1 items-center h-[22px]">
                <motion.div className="w-1.5 h-1.5 bg-[#86868B] rounded-full" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
                <motion.div className="w-1.5 h-1.5 bg-[#86868B] rounded-full" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }} />
                <motion.div className="w-1.5 h-1.5 bg-[#86868B] rounded-full" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }} />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={endRef} />
      </div>
      {/* Input */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[430px] px-4 pb-3 pt-2 bg-[#FAFAFA] z-30">
        <div className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 px-4 py-3" style={{ boxShadow: "0 8px 30px rgb(0,0,0,0.04)" }}>
          <input
            type="text"
            placeholder={userMsgCount >= 2 ? "登录后继续对话..." : "和经纪人聊聊..."}
            className="flex-1 text-[15px] text-[#1D1D1F] placeholder-[#86868B] bg-transparent outline-none"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend()}
            onFocus={() => { if (userMsgCount >= 2) onLogin(); }}
          />
          <motion.button
            className="w-8 h-8 bg-black rounded-full flex items-center justify-center flex-shrink-0"
            whileTap={{ scale: 0.9 }}
            onClick={handleSend}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M12 19V5" /><path d="m5 12 7-7 7 7" /></svg>
          </motion.button>
        </div>
      </div>
    </div>
  );
}

/* ============ Preview Asset (Tab 3) - login redirect ============ */
function PreviewAsset({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-24">
      <div className="sticky top-0 z-30 backdrop-blur-xl bg-white/80 border-b border-gray-100 px-5 pt-14 pb-4">
        <h1 className="text-[22px] font-semibold text-[#1D1D1F]">我的档案</h1>
        <p className="text-[13px] text-[#86868B] mt-1">比简历更懂你的职业数字身份</p>
      </div>
      <div className="flex flex-col items-center justify-center px-8 pt-24">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#1D1D1F] to-[#3A3A3C] flex items-center justify-center mb-6"
          style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <h3 className="text-[20px] font-bold text-[#1D1D1F] tracking-tight mb-2">你的职业数字身份</h3>
        <p className="text-[14px] text-[#86868B] text-center leading-relaxed mb-8">登录后，Agent 将基于你的简历和偏好<br/>构建专属职业档案</p>
        <motion.button
          className="w-full h-[52px] bg-[#1D1D1F] text-white rounded-2xl text-[16px] font-semibold"
          whileTap={{ scale: 0.97 }}
          onClick={onLogin}
        >
          登录创建档案
        </motion.button>
      </div>
    </div>
  );
}

/* ============ Preview Dashboard Main ============ */
export default function PreviewDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const goLogin = () => router.push("/login");

  const content = () => {
    switch (activeTab) {
      case 0: return <PreviewOverview onLogin={goLogin} />;
      case 1: return <PreviewOpportunities onLogin={goLogin} />;
      case 2: return <PreviewChat onLogin={goLogin} />;
      case 3: return <PreviewAsset onLogin={goLogin} />;
      default: return <PreviewOverview onLogin={goLogin} />;
    }
  };

  return (
    <div className="relative">
      {content()}
      <PreviewTabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
