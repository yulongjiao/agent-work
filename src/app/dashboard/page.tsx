"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";

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

/* ============ Bottom Tab Bar ============ */
function BottomTabBar({ activeTab, onTabChange, pendingCount = 0 }: { activeTab: number; onTabChange: (i: number) => void; pendingCount?: number }) {
  const tabs = [
    { icon: IconHome, label: "概览", badge: pendingCount },
    { icon: IconSparkles, label: "机会" },
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

/* ============ Engine Status Types ============ */
const engineStates = [
  { key: "active", label: "积极推进", color: "#34C759", dotAnim: "animate-glow-dot" },
  { key: "passive", label: "被动等待", color: "#FF9500", dotAnim: "animate-slow-blink" },
  { key: "stopped", label: "已停止", color: "#86868B", dotAnim: "" },
] as const;

/* ============ Task Types (Overview / Inbox) ============ */
type TaskType = "P0_HARD_DECISION" | "P1_TRADE_OFF" | "P2_KNOWLEDGE_GAP" | "INFO_REPORT";
interface InboxTask {
  id: number;
  type: TaskType;
  company: string;
  team: string;
  salary: string;
  match: number;
  // P0
  alert?: string;
  actions: { label: string; primary?: boolean; danger?: boolean }[];
  // P1
  conflictPoint?: string;
  agentCalc?: string;
  // P2
  hrQuestion?: string;
  agentDraft?: string;
  // INFO
  infoTitle?: string;
  infoBody?: string;
  time?: string;
}

const initialInboxTasks: InboxTask[] = [
  {
    id: 1, type: "P0_HARD_DECISION", company: "字节跳动", team: "商业化团队", salary: "28-35k", match: 95,
    alert: "HR 发送面试邀请：下周二 14:00 线上技术面",
    actions: [{ label: "同意并发送简历", primary: true }, { label: "改时间" }, { label: "拒绝", danger: true }],
    time: "2 分钟前",
  },
  {
    id: 2, type: "P1_TRADE_OFF", company: "美团", team: "到店事业群", salary: "23k×16薪", match: 88,
    conflictPoint: "Base 薪资不符：底线 25k，HR 咬死 23k",
    agentCalc: "按 16 薪折算，实际月均 30.7k，年总包 ≈ 44 万，已溢价 12%。签字费另计 5 万。建议继续推进。",
    actions: [{ label: "同意降标推进", primary: true }, { label: "坚守 25k 底线" }],
    time: "15 分钟前",
  },
  {
    id: 3, type: "P2_KNOWLEDGE_GAP", company: "蚂蚁集团", team: "支付安全", salary: "30-40k", match: 91,
    hrQuestion: "你上一段经历为什么只待了半年？团队管理遇到了什么问题？",
    agentDraft: "上一段经历主要因为团队战略调整，原项目被合并到其他 BU，非个人原因离开。期间我主导了支付网关的微服务拆分，日均交易量从 50 万笔提升到 200 万笔。",
    actions: [{ label: "直接发送该草稿", primary: true }, { label: "我要修改再发" }],
    time: "1 小时前",
  },
  {
    id: 4, type: "INFO_REPORT", company: "", team: "", salary: "", match: 0,
    infoTitle: "昨日战报",
    infoBody: "新增沟通 12 家 · 自动拦截风评差企业 3 家 · 收到 2 份主动邀约",
    actions: [{ label: "我知道了" }],
    time: "今天 08:00",
  },
];

/* ============ Opportunity Pipeline States (Tab 1) ============ */
type OppState = "SCOUTING" | "NEGOTIATING" | "SUSPENDED" | "HUMAN_TAKEOVER" | "DEAD_END";
interface Opportunity {
  id: number;
  company: string;
  team: string;
  salary: string;
  match: number;
  state: OppState;
  // SCOUTING - aggregated, not individual
  // NEGOTIATING
  progress?: string;
  lastUpdate?: string;
  chatPreview?: string;
  // SUSPENDED
  suspendReason?: string;
  linkedTaskId?: number; // maps to InboxTask
  // HUMAN_TAKEOVER
  milestone?: string;
  agentTip?: string;
  // DEAD_END
  deathCause?: string;
}

const scoutingCount = 45;
const initialOpps: Opportunity[] = [
  // NEGOTIATING (L1)
  { id: 101, company: "腾讯", team: "微信支付", salary: "30-42k", match: 82, state: "NEGOTIATING",
    progress: "已确认作息匹配 → 正在拉扯薪资期望", lastUpdate: "Agent 10:30 回复，等待 HR 确认边界",
    chatPreview: "C-Agent：我们候选人期望 30k 起，贵方预算范围？\nB-Agent：28-42k 弹性区间，需面试后定级。" },
  { id: 102, company: "快手", team: "商业化中台", salary: "26-33k", match: 80, state: "NEGOTIATING",
    progress: "初筛通过 → 技术栈匹配 → 薪资初步对齐", lastUpdate: "HR 确认一面通过，二面安排中",
    chatPreview: "C-Agent：候选人对大小周有顾虑。\nB-Agent：我们已转为弹性双休制。" },
  { id: 103, company: "小红书", team: "社区技术", salary: "27-34k", match: 85, state: "NEGOTIATING",
    progress: "远程办公政策确认中", lastUpdate: "Agent 正在与 HR 沟通混合办公细节" },
  // SUSPENDED (L2)
  { id: 201, company: "美团", team: "到店事业群", salary: "23k×16薪", match: 88, state: "SUSPENDED",
    suspendReason: "薪资 Base 低于底线，待用户决策是否降标", linkedTaskId: 2 },
  { id: 202, company: "蚂蚁集团", team: "支付安全", salary: "30-40k", match: 91, state: "SUSPENDED",
    suspendReason: "HR 提问超出预设档案，待用户审核回复草稿", linkedTaskId: 3 },
  // HUMAN_TAKEOVER (L3)
  { id: 301, company: "字节跳动", team: "商业化团队", salary: "28-35k", match: 95, state: "HUMAN_TAKEOVER",
    milestone: "线上技术面：下周二 14:00", agentTip: "该团队近半年扩招 40%，面试通过率约 35%。建议重点准备系统设计题，面试官偏好先画架构图。" },
  // DEAD_END
  { id: 401, company: "百度", team: "搜索技术", salary: "25-30k", match: 70, state: "DEAD_END",
    deathCause: "薪资上限无法满足 · 用户主动放弃" },
  { id: 402, company: "网易", team: "云音乐后端", salary: "22-28k", match: 65, state: "DEAD_END",
    deathCause: "脉脉风评过差 · Agent 自动拦截" },
  { id: 403, company: "拼多多", team: "社交电商", salary: "30-45k", match: 60, state: "DEAD_END",
    deathCause: "二面未通过 · 算法题表现不佳" },
];

/* ============ Animated Number (ticking effect) ============ */
function AnimatedNumber({ value, color }: { value: string; color: string }) {
  const numericPart = parseInt(value.replace(/,/g, ""));
  const [display, setDisplay] = useState(value);
  useEffect(() => {
    // 每隔几秒随机微增，给持续工作感
    const interval = setInterval(() => {
      const bump = Math.floor(Math.random() * 3) + 1;
      const newVal = numericPart + bump;
      setDisplay(newVal.toLocaleString());
      setTimeout(() => setDisplay(value), 800); // 闪回原值
    }, 4000 + Math.random() * 3000);
    return () => clearInterval(interval);
  }, [numericPart, value]);
  return (
    <motion.span
      className={`text-[17px] font-bold tracking-tight ${color} mx-1`}
      style={{ fontFeatureSettings: "'tnum'" }}
      key={display}
      initial={{ y: -2, opacity: 0.6 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {display}
    </motion.span>
  );
}

/* ============ Tab 0: Overview ============ */
function OverviewPage({ onSwitchToChat, inboxTasks, onDismissTask }: { onSwitchToChat: (prefill?: string) => void; inboxTasks: InboxTask[]; onDismissTask: (id: number) => void }) {
  const router = useRouter();
  const [intentExpand, setIntentExpand] = useState(false);
  const [engineIdx, setEngineIdx] = useState(0);
  const [engineMenuOpen, setEngineMenuOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [resolvingId, setResolvingId] = useState<number | null>(null);
  const engine = engineStates[engineIdx];

  const [coreIntent, setCoreIntent] = useState('寻找北京/广州的高级 Java 后端或架构师岗位');
  const [hardReqs, setHardReqs] = useState([
    { label: "目标城市", value: "北京、广州" },
    { label: "目标岗位", value: "高级 Java 后端 / 架构师" },
    { label: "薪资底线", value: "≥ 25k" },
    { label: "工作制度", value: "双休" },
    { label: "屏蔽企业", value: "当前公司（已设置不可见）" },
  ]);
  const [softReqs, setSoftReqs] = useState([
    { label: "行业偏好", value: "优先 AI 行业、AI 产品方向" },
    { label: "加班弹性", value: "不接受大小周，除非薪资 ≥ 30k" },
    { label: "城市补充", value: "上海可接受，深圳也可考虑" },
    { label: "管理意愿", value: "希望带团队，3-8 人规模" },
    { label: "出差态度", value: "短期出差可接受，拒绝长期驻场" },
    { label: "远程办公", value: "支持混合办公优先" },
    { label: "技术栈", value: "Spring Cloud / 微服务优先" },
  ]);

  const startEdit = (category: string, label: string, currentValue: string) => {
    const key = `${category}:${label}`;
    setEditingKey(key);
    setEditValue(currentValue);
  };

  const confirmEdit = (category: string, label: string) => {
    if (category === "core") {
      setCoreIntent(editValue);
    } else if (category === "hard") {
      setHardReqs(prev => prev.map(r => r.label === label ? { ...r, value: editValue } : r));
    } else {
      setSoftReqs(prev => prev.map(r => r.label === label ? { ...r, value: editValue } : r));
    }
    setEditingKey(null);
  };

  const handleChatAdjust = () => {
    setIntentExpand(false);
    setTimeout(() => {
      onSwitchToChat("我想调整一下意图参数，帮我优化当前的求职条件");
    }, 200);
  };

  const actionableTasks = inboxTasks.filter(t => t.type !== "INFO_REPORT");
  const infoTasks = inboxTasks.filter(t => t.type === "INFO_REPORT");

  const handleResolve = (id: number) => {
    setResolvingId(id);
    setTimeout(() => {
      onDismissTask(id);
      setResolvingId(null);
    }, 700);
  };

  const typeConfig: Record<TaskType, { badge: string; dotColor: string }> = {
    P0_HARD_DECISION: { badge: "紧急决策", dotColor: "#FF3B30" },
    P1_TRADE_OFF: { badge: "薪资博弈", dotColor: "#FF9500" },
    P2_KNOWLEDGE_GAP: { badge: "待你回复", dotColor: "#007AFF" },
    INFO_REPORT: { badge: "简报", dotColor: "#86868B" },
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-24">
      <div className="sticky top-0 z-30 backdrop-blur-xl bg-white/80 border-b border-gray-100 px-5 pt-14 pb-4">
        <h1 className="text-[22px] font-semibold text-[#1D1D1F]">概览</h1>
      </div>

      {/* 模块一：当前执行意图 Intent Control */}
      <div className="px-5 pt-5">
        <motion.div className="bg-white/70 backdrop-blur-xl rounded-[20px] border border-white/80 relative z-10" style={{ boxShadow: "0 2px 20px rgba(0,0,0,0.04), 0 0 0 0.5px rgba(0,0,0,0.03)" }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="px-5 pt-4 pb-4">
            {/* 顶部行：引擎状态 */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-[11px] font-medium text-[#86868B] uppercase tracking-wider">执行意图</p>
              {/* 引擎状态胶囊 */}
              <div className="relative">
                <motion.button
                  className="flex items-center gap-1.5 h-[26px] px-2.5 rounded-full backdrop-blur-sm"
                  style={{ backgroundColor: `${engine.color}0D`, border: `0.5px solid ${engine.color}25` }}
                  onClick={() => setEngineMenuOpen(!engineMenuOpen)}
                  whileTap={{ scale: 0.94 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  <div className="relative flex items-center justify-center w-[7px] h-[7px]">
                    <div className="w-[5px] h-[5px] rounded-full" style={{ backgroundColor: engine.color }} />
                    {engine.dotAnim && <div className={`absolute w-[7px] h-[7px] rounded-full ${engine.dotAnim}`} style={{ backgroundColor: engine.color }} />}
                  </div>
                  <span className="text-[11px] font-medium tracking-tight" style={{ color: engine.color }}>{engine.label}</span>
                  <motion.svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke={engine.color} strokeWidth="3" animate={{ rotate: engineMenuOpen ? 180 : 0 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}><path d="m6 9 6 6 6-6"/></motion.svg>
                </motion.button>
                <AnimatePresence>
                  {engineMenuOpen && (
                    <>
                      <motion.div className="fixed inset-0 z-40" onClick={() => setEngineMenuOpen(false)} />
                      <motion.div
                        className="absolute right-0 top-full mt-1.5 w-[140px] bg-white/90 backdrop-blur-2xl rounded-[14px] overflow-hidden z-50"
                        style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.14), 0 0 0 0.5px rgba(0,0,0,0.06)" }}
                        initial={{ opacity: 0, scale: 0.9, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -4 }}
                        transition={{ type: "spring", stiffness: 500, damping: 28 }}
                      >
                        {engineStates.map((s, i) => (
                          <motion.button
                            key={s.key}
                            className={`w-full flex items-center gap-2.5 px-3.5 py-[10px] ${i < engineStates.length - 1 ? "border-b border-black/[0.04]" : ""}`}
                            style={{ backgroundColor: engineIdx === i ? `${s.color}08` : "transparent" }}
                            onClick={() => { setEngineIdx(i); setEngineMenuOpen(false); }}
                            whileTap={{ scale: 0.97 }}
                          >
                            <div className="w-[6px] h-[6px] rounded-full" style={{ backgroundColor: s.color }} />
                            <span className={`text-[13px] ${engineIdx === i ? "font-semibold text-[#1D1D1F]" : "font-normal text-[#86868B]"}`}>{s.label}</span>
                            {engineIdx === i && (
                              <svg className="ml-auto" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={s.color} strokeWidth="2.5"><path d="M20 6 9 17l-5-5"/></svg>
                            )}
                          </motion.button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
            {/* 意图描述 + 调整按钮 */}
            <div className="flex items-start justify-between gap-3">
              <p className="text-[16px] font-semibold text-[#1D1D1F] leading-[1.4] tracking-tight flex-1">{coreIntent}</p>
              <motion.button
                className="flex-shrink-0 mt-0.5 flex items-center gap-1 text-[13px] text-[#007AFF] font-medium"
                onClick={() => setIntentExpand(true)}
                whileTap={{ scale: 0.95 }}
              >
                <span>调整</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#007AFF" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 意图参数 Bottom Sheet */}
      <AnimatePresence>
        {intentExpand && (
          <>
            {/* 遮罩层 */}
            <motion.div
              className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIntentExpand(false)}
            />
            {/* 弹出卡片 */}
            <motion.div
              className="fixed bottom-0 left-1/2 z-50 w-[430px]"
              style={{ x: "-50%" }}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 36 }}
            >
              <div className="bg-[#F8F8FA] rounded-t-[24px] overflow-hidden" style={{ boxShadow: "0 -8px 50px rgba(0,0,0,0.12)" }}>
                {/* 拖拽把手 */}
                <div className="flex justify-center pt-3 pb-1">
                  <div className="w-9 h-[4px] rounded-full bg-black/10" />
                </div>
                {/* 标题栏 */}
                <div className="flex items-center justify-between px-6 pt-2 pb-3">
                  <div>
                    <p className="text-[18px] font-semibold text-[#1D1D1F] tracking-tight">意图参数</p>
                    <p className="text-[12px] text-[#86868B] mt-0.5">修改后 Agent 将按新条件执行</p>
                  </div>
                  <motion.button
                    className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center"
                    onClick={() => setIntentExpand(false)}
                    whileTap={{ scale: 0.9 }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#86868B" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
                  </motion.button>
                </div>

                {/* 可滚动内容区 */}
                <div className="overflow-y-auto px-5 pb-2" style={{ maxHeight: "60vh" }}>
                  {/* 核心意图 */}
                  <motion.div
                    className="bg-white rounded-[16px] p-4 mb-3"
                    style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.04), 0 0 0 0.5px rgba(0,0,0,0.03)" }}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.03, type: "spring", stiffness: 500, damping: 32 }}
                  >
                    <p className="text-[11px] font-medium text-[#86868B] uppercase tracking-wider mb-2">核心意图</p>
                    {editingKey === "core:intent" ? (
                      <div className="space-y-2">
                        <input
                          className="w-full text-[16px] font-semibold text-[#1D1D1F] leading-[1.45] tracking-tight bg-[#F5F5F7] rounded-[10px] px-3 py-2 outline-none focus:ring-2 focus:ring-[#007AFF]/30"
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          autoFocus
                        />
                        <div className="flex gap-2 justify-end">
                          <button className="text-[13px] text-[#86868B] px-3 py-1" onClick={() => setEditingKey(null)}>取消</button>
                          <button className="text-[13px] text-[#007AFF] font-medium px-3 py-1" onClick={() => confirmEdit("core", "intent")}>确定</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-[16px] font-semibold text-[#1D1D1F] leading-[1.45] tracking-tight flex-1">{coreIntent}</p>
                        <motion.button whileTap={{ scale: 0.95 }} onClick={() => startEdit("core", "intent", coreIntent)}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#007AFF" strokeWidth="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                        </motion.button>
                      </div>
                    )}
                  </motion.div>

                  {/* 确定要求 */}
                  <motion.div
                    className="mb-3"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.06, type: "spring", stiffness: 500, damping: 32 }}
                  >
                    <div className="flex items-center gap-1.5 px-1 mb-2">
                      <div className="w-[5px] h-[5px] rounded-full bg-[#FF3B30]" />
                      <p className="text-[11px] font-medium text-[#86868B] uppercase tracking-wider">确定要求</p>
                      <p className="text-[11px] text-[#C7C7CC]">·</p>
                      <p className="text-[11px] text-[#C7C7CC]">不满足则直接过滤</p>
                    </div>
                    <div className="bg-white rounded-[16px] overflow-hidden" style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.04), 0 0 0 0.5px rgba(0,0,0,0.03)" }}>
                      {hardReqs.map((p, i) => (
                        <div key={p.label} style={{ borderBottom: i < hardReqs.length - 1 ? "0.5px solid rgba(0,0,0,0.06)" : "none" }}>
                          <AnimatePresence mode="wait">
                            {editingKey === `hard:${p.label}` ? (
                              <motion.div className="px-4 py-[10px]" key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <p className="text-[12px] text-[#86868B] mb-1.5">{p.label}</p>
                                <input
                                  className="w-full text-[14px] text-[#1D1D1F] font-medium bg-[#F5F5F7] rounded-[8px] px-3 py-2 outline-none focus:ring-2 focus:ring-[#007AFF]/30"
                                  value={editValue}
                                  onChange={e => setEditValue(e.target.value)}
                                  autoFocus
                                />
                                <div className="flex gap-2 justify-end mt-2">
                                  <button className="text-[13px] text-[#86868B] px-3 py-1" onClick={() => setEditingKey(null)}>取消</button>
                                  <button className="text-[13px] text-[#007AFF] font-medium px-3 py-1" onClick={() => confirmEdit("hard", p.label)}>确定</button>
                                </div>
                              </motion.div>
                            ) : (
                              <motion.button
                                key="display"
                                className="w-full flex items-center justify-between px-4 py-[13px]"
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ delay: 0.08 + i * 0.025, type: "spring", stiffness: 500, damping: 32 }}
                                whileTap={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                                onClick={() => startEdit("hard", p.label, p.value)}
                              >
                                <span className="text-[14px] text-[#86868B] flex-shrink-0">{p.label}</span>
                                <div className="flex items-center gap-1.5 ml-3">
                                  <span className="text-[14px] text-[#1D1D1F] font-medium text-right">{p.value}</span>
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#C7C7CC" strokeWidth="2" className="flex-shrink-0"><path d="m9 18 6-6-6-6"/></svg>
                                </div>
                              </motion.button>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* 弹性偏好 */}
                  <motion.div
                    className="mb-2"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12, type: "spring", stiffness: 500, damping: 32 }}
                  >
                    <div className="flex items-center gap-1.5 px-1 mb-2">
                      <div className="w-[5px] h-[5px] rounded-full bg-[#FF9500]" />
                      <p className="text-[11px] font-medium text-[#86868B] uppercase tracking-wider">弹性偏好</p>
                      <p className="text-[11px] text-[#C7C7CC]">·</p>
                      <p className="text-[11px] text-[#C7C7CC]">优先考虑，可协商</p>
                    </div>
                    <div className="bg-white rounded-[16px] overflow-hidden" style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.04), 0 0 0 0.5px rgba(0,0,0,0.03)" }}>
                      {softReqs.map((p, i) => (
                        <div key={p.label} style={{ borderBottom: i < softReqs.length - 1 ? "0.5px solid rgba(0,0,0,0.06)" : "none" }}>
                          <AnimatePresence mode="wait">
                            {editingKey === `soft:${p.label}` ? (
                              <motion.div className="px-4 py-[10px]" key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <p className="text-[12px] text-[#86868B] mb-1.5">{p.label}</p>
                                <input
                                  className="w-full text-[14px] text-[#1D1D1F] font-medium bg-[#F5F5F7] rounded-[8px] px-3 py-2 outline-none focus:ring-2 focus:ring-[#007AFF]/30"
                                  value={editValue}
                                  onChange={e => setEditValue(e.target.value)}
                                  autoFocus
                                />
                                <div className="flex gap-2 justify-end mt-2">
                                  <button className="text-[13px] text-[#86868B] px-3 py-1" onClick={() => setEditingKey(null)}>取消</button>
                                  <button className="text-[13px] text-[#007AFF] font-medium px-3 py-1" onClick={() => confirmEdit("soft", p.label)}>确定</button>
                                </div>
                              </motion.div>
                            ) : (
                              <motion.button
                                key="display"
                                className="w-full flex items-center justify-between px-4 py-[13px]"
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ delay: 0.15 + i * 0.025, type: "spring", stiffness: 500, damping: 32 }}
                                whileTap={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                                onClick={() => startEdit("soft", p.label, p.value)}
                              >
                                <span className="text-[14px] text-[#86868B] flex-shrink-0">{p.label}</span>
                                <div className="flex items-center gap-1.5 ml-3">
                                  <span className="text-[14px] text-[#1D1D1F] font-medium text-right">{p.value}</span>
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#C7C7CC" strokeWidth="2" className="flex-shrink-0"><path d="m9 18 6-6-6-6"/></svg>
                                </div>
                              </motion.button>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>
                {/* 底部操作 */}
                <div className="px-5 pt-4 pb-8 flex gap-2.5">
                  <motion.button
                    className="flex-1 h-[50px] rounded-[14px] text-[15px] font-medium text-[#007AFF] flex items-center justify-center gap-2"
                    style={{ backgroundColor: "rgba(0,122,255,0.08)" }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    onClick={handleChatAdjust}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#007AFF" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    对话调整
                  </motion.button>
                  <motion.button
                    className="flex-1 h-[50px] bg-[#1D1D1F] rounded-[14px] text-[15px] font-medium text-white flex items-center justify-center"
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    onClick={() => setIntentExpand(false)}
                  >
                    完成
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 模块二：工作简报 */}
      <div className="px-5 pt-3">
        <div className="bg-white/70 backdrop-blur-xl rounded-[16px] px-5 py-4" style={{ boxShadow: "0 1px 10px rgba(0,0,0,0.03), 0 0 0 0.5px rgba(0,0,0,0.03)" }}>
          <p className="text-[13px] text-[#86868B] mb-2">你的经纪人替你</p>
          <div className="flex items-baseline gap-0">
            <span className="text-[13px] text-[#86868B]">浏览了</span>
            <AnimatedNumber value="1,247" color="text-[#1D1D1F]" />
            <span className="text-[13px] text-[#86868B] ml-0.5">个岗位</span>
            <span className="text-[#E5E5EA] mx-2">|</span>
            <span className="text-[13px] text-[#86868B]">沟通</span>
            <AnimatedNumber value="24" color="text-[#1D1D1F]" />
            <span className="text-[#E5E5EA] mx-2">|</span>
            <span className="text-[13px] text-[#86868B]">拦截</span>
            <AnimatedNumber value="86" color="text-[#1D1D1F]" />
          </div>
        </div>
      </div>

      {/* 模块三：收件箱 Action Center */}
      <div className="px-5 pt-5 pb-2">
        <div className="flex items-center gap-2 mb-3">
          <p className="text-[11px] font-medium text-[#86868B] uppercase tracking-wider">待处理</p>
          {actionableTasks.length > 0 && (
            <span className="w-5 h-5 bg-[#FF3B30] rounded-full text-[10px] text-white font-bold flex items-center justify-center">{actionableTasks.length}</span>
          )}
        </div>
        <div className="space-y-3">
          <AnimatePresence>
            {actionableTasks.map((task) => {
              const tc = typeConfig[task.type];
              return (
              <motion.div
                key={task.id}
                layout
                className="bg-white rounded-2xl overflow-hidden relative cursor-pointer"
                style={{ boxShadow: resolvingId === task.id ? "0 0 30px rgba(0,200,255,0.4), 0 0 60px rgba(0,200,255,0.2)" : "0 2px 16px rgba(0,0,0,0.04), 0 0 0 0.5px rgba(0,0,0,0.04)" }}
                onClick={() => task.company && router.push(`/dashboard/chat/${task.id}`)}
                initial={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.3, y: 200, x: 50, transition: { duration: 0.6, ease: [0.32, 0, 0.67, 0] } }}
                animate={resolvingId === task.id ? {
                  scale: [1, 1.02, 0.3],
                  opacity: [1, 1, 0],
                  y: [0, -8, 200],
                  x: [0, 0, 50],
                  transition: { duration: 0.7, ease: [0.32, 0, 0.67, 0] }
                } : { scale: 1, opacity: 1 }}
              >
                {resolvingId === task.id && (
                  <motion.div
                    className="absolute inset-0 z-10 rounded-2xl"
                    style={{ background: "linear-gradient(135deg, rgba(0,200,255,0.3), rgba(0,122,255,0.2), rgba(0,200,255,0.1))" }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0.5] }}
                    transition={{ duration: 0.5 }}
                  />
                )}
                <div className="px-5 py-4">
                  {/* 头部 */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-[6px] h-[6px] rounded-full" style={{ backgroundColor: tc.dotColor }} />
                      <span className="text-[12px] text-[#86868B] font-medium">{tc.badge}</span>
                    </div>
                    {task.time && <span className="text-[11px] text-[#C7C7CC]">{task.time}</span>}
                  </div>

                  {/* 公司信息 */}
                  {task.company && (
                    <div className="mb-3">
                      <p className="text-[16px] font-semibold text-[#1D1D1F] tracking-tight">{task.company}</p>
                      {task.team && <p className="text-[13px] text-[#86868B] mt-0.5">{task.team} · {task.salary}</p>}
                    </div>
                  )}

                  {/* P0: 警报 */}
                  {task.type === "P0_HARD_DECISION" && task.alert && (
                    <p className="text-[14px] text-[#1D1D1F] leading-[1.5] mb-4">{task.alert}</p>
                  )}

                  {/* P1: 冲突 + 分析 */}
                  {task.type === "P1_TRADE_OFF" && (
                    <div className="mb-4">
                      {task.conflictPoint && (
                        <p className="text-[14px] font-medium text-[#1D1D1F] leading-[1.5] mb-1.5">{task.conflictPoint}</p>
                      )}
                      {task.agentCalc && (
                        <p className="text-[13px] text-[#86868B] leading-[1.6]">{task.agentCalc}</p>
                      )}
                    </div>
                  )}

                  {/* P2: 提问 + 草稿 */}
                  {task.type === "P2_KNOWLEDGE_GAP" && (
                    <div className="mb-4">
                      {task.hrQuestion && (
                        <div className="mb-2.5">
                          <p className="text-[11px] text-[#C7C7CC] mb-1">对方提问</p>
                          <p className="text-[14px] text-[#1D1D1F] leading-[1.5]">{task.hrQuestion}</p>
                        </div>
                      )}
                      {task.agentDraft && (
                        <div>
                          <p className="text-[11px] text-[#C7C7CC] mb-1">Agent 拟定草稿</p>
                          <p className="text-[13px] text-[#86868B] leading-[1.6] bg-[#F5F5F7] rounded-[10px] px-3.5 py-2.5">{task.agentDraft}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 操作按钮 */}
                  <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                    {task.actions.map((act) => (
                      <motion.button
                        key={act.label}
                        className={`h-[40px] rounded-[10px] text-[13px] font-medium px-4 ${act.primary ? "flex-1 bg-[#1D1D1F] text-white" : act.danger ? "text-[#86868B]" : "flex-1 bg-[#F5F5F7] text-[#1D1D1F]"}`}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => act.primary && handleResolve(task.id)}
                      >
                        {act.label}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
              );
            })}
          </AnimatePresence>

          {/* INFO 战报（轻量级，可整体清除） */}
          {infoTasks.map((task) => (
            <motion.div
              key={task.id}
              layout
              className="bg-white/50 backdrop-blur-xl rounded-[14px] px-4 py-3 flex items-center justify-between"
              style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.03)" }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 100 }}
            >
              <div className="flex-1">
                <p className="text-[13px] font-medium text-[#1D1D1F]">{task.infoTitle}</p>
                <p className="text-[12px] text-[#86868B] mt-0.5">{task.infoBody}</p>
              </div>
              <motion.button
                className="text-[12px] text-[#007AFF] font-medium ml-3 flex-shrink-0"
                whileTap={{ scale: 0.95 }}
                onClick={() => onDismissTask(task.id)}
              >
                清除
              </motion.button>
            </motion.div>
          ))}

          {actionableTasks.length === 0 && infoTasks.length === 0 && (
            <div className="bg-white/70 backdrop-blur-xl rounded-[18px] p-6 flex flex-col items-center" style={{ boxShadow: "0 2px 20px rgba(0,0,0,0.04)" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#34C759" strokeWidth="2" className="mb-2"><path d="M20 6 9 17l-5-5"/></svg>
              <p className="text-[14px] text-[#86868B]">全部处理完毕，暂无待办</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============ Tab 1: Opportunities (Pipeline) ============ */
function OpportunitiesFeed({ opps, inboxTasks, onDismissTask }: { opps: Opportunity[]; inboxTasks: InboxTask[]; onDismissTask: (id: number) => void }) {
  const router = useRouter();
  type TabKey = "ALL" | "KEY_PROGRESS" | "NEGOTIATION" | "ENDED";
  const [activeTab, setActiveTab] = useState<TabKey>("ALL");
  const [sortByMatch, setSortByMatch] = useState(false);

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

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-24">
      <div className="sticky top-0 z-30 backdrop-blur-xl bg-white/80 border-b border-gray-100 px-5 pt-14 pb-3">
        <h1 className="text-[22px] font-semibold text-[#1D1D1F] mb-3">机会</h1>

        {/* 嗅探统计 */}
        <div className="flex items-center gap-2 mb-3">
          <div className="relative">
            <div className="w-[5px] h-[5px] rounded-full bg-[#007AFF]" />
            <div className="absolute inset-0 w-[5px] h-[5px] rounded-full bg-[#007AFF] animate-ping opacity-40" />
          </div>
          <span className="text-[12px] text-[#86868B]">正在与 <span className="font-medium text-[#1D1D1F]">{scoutingCount}</span> 位 HR 探索中</span>
        </div>

        {/* 管道标签 */}
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
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            {filtered.length === 0 && (
              <div className="flex flex-col items-center py-16">
                <p className="text-[14px] text-[#C7C7CC]">暂无相关机会</p>
              </div>
            )}

            {filtered.map((opp) => {
              /* ── NEGOTIATING ── */
              if (opp.state === "NEGOTIATING") return (
                <motion.div key={opp.id} className="bg-white rounded-2xl overflow-hidden mb-3 cursor-pointer" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.04), 0 0 0 0.5px rgba(0,0,0,0.04)" }} layout whileTap={{ scale: 0.98 }} onClick={() => router.push(`/dashboard/chat/${opp.id}`)}>
                  <div className="px-5 py-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[16px] font-semibold text-[#1D1D1F] tracking-tight">{opp.company}</p>
                      <div className="flex items-center gap-3">
                        {opp.match >= 90 ? (
                          <span className="text-[11px] font-semibold text-[#FF9500] bg-[#FF9500]/10 px-2 py-0.5 rounded-full">TOP {opp.match}%</span>
                        ) : (
                          <span className="text-[12px] text-[#86868B] font-medium">{opp.match}%</span>
                        )}
                        <div className="flex items-center gap-1.5">
                          <div className="relative">
                            <div className="w-[6px] h-[6px] rounded-full bg-[#34C759]" />
                            <div className="absolute inset-0 w-[6px] h-[6px] rounded-full bg-[#34C759] animate-ping opacity-60" />
                          </div>
                          <span className="text-[12px] text-[#34C759] font-medium">沟通中</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-[13px] text-[#86868B] mb-3">{opp.team} · {opp.salary}</p>
                    {opp.progress && <p className="text-[14px] text-[#1D1D1F] leading-[1.5] mb-1">{opp.progress}</p>}
                    {opp.lastUpdate && <p className="text-[12px] text-[#C7C7CC]">{opp.lastUpdate}</p>}
                  </div>
                </motion.div>
              );

              /* ── SUSPENDED ── */
              if (opp.state === "SUSPENDED") {
                const linkedTask = inboxTasks.find(t => t.id === opp.linkedTaskId);
                return (
                  <motion.div key={opp.id} className="bg-white rounded-2xl overflow-hidden mb-3 cursor-pointer" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.04), 0 0 0 0.5px rgba(0,0,0,0.04)" }} layout whileTap={{ scale: 0.98 }} onClick={() => router.push(`/dashboard/chat/${opp.id === 201 ? 2 : opp.id === 202 ? 3 : opp.id}`)}>
                    <div className="px-5 py-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-[16px] font-semibold text-[#1D1D1F] tracking-tight">{opp.company}</p>
                        <div className="flex items-center gap-3">
                          {opp.match >= 90 ? (
                            <span className="text-[11px] font-semibold text-[#FF9500] bg-[#FF9500]/10 px-2 py-0.5 rounded-full">TOP {opp.match}%</span>
                          ) : (
                            <span className="text-[12px] text-[#86868B] font-medium">{opp.match}%</span>
                          )}
                          <div className="flex items-center gap-1.5">
                            <div className="w-[6px] h-[6px] rounded-full bg-[#FF9500]" />
                            <span className="text-[12px] text-[#FF9500] font-medium">等待指示</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-[13px] text-[#86868B] mb-2">{opp.team} · {opp.salary}</p>
                      <p className="text-[13px] text-[#86868B] mb-4">{opp.suspendReason}</p>
                      {linkedTask && (
                        <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                          {linkedTask.actions.map((act) => (
                            <motion.button
                              key={act.label}
                              className={`h-[40px] rounded-[10px] text-[13px] font-medium px-4 ${act.primary ? "flex-1 bg-[#1D1D1F] text-white" : act.danger ? "text-[#86868B]" : "flex-1 bg-[#F5F5F7] text-[#1D1D1F]"}`}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => act.primary && onDismissTask(linkedTask.id)}
                            >
                              {act.label}
                            </motion.button>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              }

              /* ── HUMAN_TAKEOVER ── */
              if (opp.state === "HUMAN_TAKEOVER") return (
                <motion.div key={opp.id} className="bg-white rounded-2xl overflow-hidden mb-3 cursor-pointer" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.04), 0 0 0 0.5px rgba(0,0,0,0.04)" }} layout whileTap={{ scale: 0.98 }} onClick={() => router.push(`/dashboard/chat/${opp.id === 301 ? 1 : opp.id}`)}>
                  <div className="px-5 py-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[16px] font-semibold text-[#1D1D1F] tracking-tight">{opp.company}</p>
                      <div className="flex items-center gap-3">
                        {opp.match >= 90 ? (
                          <span className="text-[11px] font-semibold text-[#FF9500] bg-[#FF9500]/10 px-2 py-0.5 rounded-full">TOP {opp.match}%</span>
                        ) : (
                          <span className="text-[12px] text-[#86868B] font-medium">{opp.match}%</span>
                        )}
                        <div className="flex items-center gap-1.5">
                          <div className="w-[6px] h-[6px] rounded-full bg-[#007AFF]" />
                          <span className="text-[12px] text-[#007AFF] font-medium">真人接管</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-[13px] text-[#86868B] mb-3">{opp.team} · {opp.salary}</p>
                    {opp.milestone && (
                      <p className="text-[14px] font-medium text-[#1D1D1F] leading-[1.5] mb-2">{opp.milestone}</p>
                    )}
                    {opp.agentTip && (
                      <div>
                        <p className="text-[11px] text-[#C7C7CC] mb-1">Agent 参谋</p>
                        <p className="text-[13px] text-[#86868B] leading-[1.6]">{opp.agentTip}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              );

              /* ── DEAD_END ── */
              if (opp.state === "DEAD_END") return (
                <motion.div key={opp.id} className="bg-white rounded-2xl overflow-hidden mb-3 opacity-55 cursor-pointer" style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.03)" }} whileTap={{ scale: 0.98 }} onClick={() => router.push(`/dashboard/chat/${opp.id}`)}>
                  <div className="px-5 py-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[16px] font-medium text-[#86868B] tracking-tight">{opp.company}</p>
                      <div className="flex items-center gap-1.5">
                        <div className="w-[6px] h-[6px] rounded-full bg-[#C7C7CC]" />
                        <span className="text-[12px] text-[#C7C7CC] font-medium">已出局</span>
                      </div>
                    </div>
                    <p className="text-[13px] text-[#C7C7CC] mb-2">{opp.team} · {opp.salary}</p>
                    <p className="text-[13px] text-[#86868B] leading-[1.5]">{opp.deathCause}</p>
                  </div>
                </motion.div>
              );

              return null;
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ============ Tab 2: Agent Chat ============ */
function AgentChatPage({ prefillMessage = "", onClearPrefill }: { prefillMessage?: string; onClearPrefill?: () => void }) {
  const [msgs] = useState<{ id: number; role: string; text: string }[]>([
    { id: 1, role: "agent", text: "你好，我是你的数字分身经纪人。目前已经在 4 个平台上帮你搜索和沟通了。有什么需要我特别注意的吗？" },
    { id: 2, role: "user", text: "字节那个岗位怎么样？帮我重点跟进一下。" },
    { id: 3, role: "agent", text: "字节商业化团队那个岗位匹配度 95%，我已经和 HR 聊了两轮。对方很积极，确认双休和弹性工时。下一步建议安排线上面试，你看可以吗？" },
    { id: 4, role: "user", text: "可以，帮我安排吧。另外薪资谈判的时候，不要低于 28k。" },
    { id: 5, role: "agent", text: "收到。我已更新你的薪资底线为 28k（针对字节这个岗位）。面试已授权安排，我会协调具体时间并通知你。" },
    { id: 6, role: "agent", text: "给你汇报一下美团的情况：对方 base 上限给到 23k，和你的预期有差距。我整理了一份市场对标分析，建议用「同级别 offer 竞争」策略争取，你觉得可以这样推进吗？" },
    { id: 7, role: "user", text: "可以试试，如果谈不上来就算了。" },
    { id: 8, role: "agent", text: "明白，我会先试一轮。另外蚂蚁那边 HR 追问了离职原因，我帮你拟了一版回复草稿，放在概览页了，你有空审核一下。" },
    { id: 9, role: "user", text: "好的，我去看看。" },
  ]);
  const [inputValue, setInputValue] = useState(prefillMessage);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);
  useEffect(() => {
    if (prefillMessage) {
      setInputValue(prefillMessage);
      onClearPrefill?.();
    }
  }, [prefillMessage, onClearPrefill]);

  return (
    <div className="flex flex-col h-screen bg-[#FAFAFA] relative">
      <div className="sticky top-0 z-30 backdrop-blur-xl bg-white/80 border-b border-gray-100 px-5 pt-14 pb-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center"><span className="text-[13px] font-semibold text-white">A</span></div>
        <div>
          <p className="text-[16px] font-semibold text-[#1D1D1F]">我的经纪人</p>
          <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-[#34C759] rounded-full" /><span className="text-[12px] text-[#34C759]">在线 · 正在处理 3 个任务</span></div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-5 pt-5 pb-36 space-y-4">
        {msgs.map((msg) => {
          return (
            <motion.div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              {msg.role === "agent" ? (
                <div className="bg-[#F5F5F7] text-[#1D1D1F] rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]"><p className="text-[15px] leading-relaxed">{msg.text}</p></div>
              ) : (
                <div className="bg-black text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%]"><p className="text-[15px] leading-relaxed">{msg.text}</p></div>
              )}
            </motion.div>
          );
        })}
        <div ref={endRef} />
      </div>
      {/* Input - 固定在底部 Tab 栏上方 */}
      <div className="absolute bottom-[68px] left-0 right-0 px-4 pb-2 pt-3 bg-gradient-to-t from-[#FAFAFA] via-[#FAFAFA]/95 to-transparent z-30">
        <div className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 px-4 py-3" style={{ boxShadow: "0 8px 30px rgb(0,0,0,0.04)" }}>
          <input type="text" placeholder="给经纪人下达指令..." className="flex-1 text-[15px] text-[#1D1D1F] placeholder-[#86868B] bg-transparent outline-none" value={inputValue} onChange={e => setInputValue(e.target.value)} />
          <button className="w-8 h-8 bg-black rounded-full flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M12 19V5" /><path d="m5 12 7-7 7 7" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============ Tab 3: Assets (Personal Archive) ============ */
function AssetPage() {
  const router = useRouter();
  const completeness = 78;
  const cs = { boxShadow: "0 2px 16px rgba(0,0,0,0.04), 0 0 0 0.5px rgba(0,0,0,0.04)" };

  return (
    <div className="min-h-screen bg-[#F5F5F7] pb-24">
      <div className="sticky top-0 z-30 backdrop-blur-xl bg-white/80 border-b border-black/[0.04] px-5 pt-14 pb-4">
        <h1 className="text-[22px] font-semibold text-[#1D1D1F] tracking-tight">我的档案</h1>
      </div>

      <div className="px-5 pt-5 space-y-3">

        {/* ── 身份卡：深色英雄区 ── */}
        <motion.div className="bg-[#1D1D1F] rounded-2xl px-5 pt-5 pb-5 relative overflow-hidden" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/[0.03]" />
          <div className="absolute -bottom-16 -left-8 w-32 h-32 rounded-full bg-white/[0.02]" />
          <div className="relative flex items-center gap-4 mb-5">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center flex-shrink-0 ring-1 ring-white/10">
              <span className="text-white text-[22px] font-bold">张</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[18px] font-semibold text-white tracking-tight">张明远</p>
              <p className="text-[13px] text-white/50 mt-0.5">高级 Java 后端 · 5 年 · 北京</p>
            </div>
            <span className="text-[10px] text-white/30 bg-white/[0.08] px-2 py-0.5 rounded-md font-medium flex-shrink-0">v3.2</span>
          </div>
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] text-white/40 font-medium">Agent 理解度</span>
              <span className="text-[12px] text-white/70 font-semibold">{completeness}%</span>
            </div>
            <div className="w-full h-[3px] rounded-full bg-white/[0.08]">
              <motion.div className="h-full rounded-full bg-gradient-to-r from-[#34C759] to-[#30D158]" initial={{ width: 0 }} animate={{ width: `${completeness}%` }} transition={{ duration: 0.8, delay: 0.3 }} />
            </div>
            <p className="text-[11px] text-white/25 mt-2">补充「项目经历细节」和「管理风格」可提升至 92%</p>
          </div>
        </motion.div>

        {/* ── 简历原件 ── */}
        <motion.div className="bg-white rounded-2xl px-5 py-4" style={cs} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#007AFF]/[0.08] flex items-center justify-center flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#007AFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-medium text-[#1D1D1F]">张明远_简历_2024.pdf</p>
              <p className="text-[11px] text-[#C7C7CC]">3 天前上传 · 2.1 MB</p>
            </div>
            <motion.button className="text-[12px] text-[#007AFF] font-medium px-3 py-1.5 rounded-full bg-[#007AFF]/[0.06]" whileTap={{ scale: 0.95 }}>更新</motion.button>
          </div>
        </motion.div>

        {/* ── Agent 对你的理解 ── */}
        <motion.div className="bg-white rounded-2xl px-5 py-5" style={cs} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.08 }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-[15px] font-semibold text-[#1D1D1F] tracking-tight">Agent 对你的理解</p>
            <span className="text-[11px] text-[#C7C7CC]">今天 10:30 更新</span>
          </div>

          <div className="mb-4">
            <p className="text-[11px] text-[#86868B] mb-2 font-medium tracking-wide">核心竞争力</p>
            <div className="flex flex-wrap gap-1.5">
              {[{ label: "微服务架构", level: 5 }, { label: "高并发处理", level: 4 }, { label: "系统设计", level: 4 }, { label: "团队管理", level: 3 }].map((s) => (
                <span key={s.label} className="flex items-center gap-1 px-2.5 py-1 bg-[#F5F5F7] rounded-lg text-[12px] text-[#1D1D1F] font-medium">
                  {s.label}<span className="text-[10px] text-[#86868B]">L{s.level}</span>
                </span>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <p className="text-[11px] text-[#86868B] mb-2 font-medium tracking-wide">行业认知 & 特质</p>
            <div className="flex flex-wrap gap-1.5">
              {["互联网广告", "电商交易", "支付安全", "结果导向", "逻辑清晰"].map((t) => (
                <span key={t} className="px-2.5 py-1 rounded-lg text-[12px] text-[#86868B] border border-black/[0.05]">{t}</span>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-black/[0.04]">
            <p className="text-[11px] text-[#86868B] mb-3 font-medium tracking-wide">求职底线</p>
            <div className="space-y-2.5">
              {[
                { label: "薪资", value: "≥ 25k（字节特批 28k）" },
                { label: "作息", value: "严格双休，拒绝 996 / 大小周" },
                { label: "城市", value: "北京优先，上海可谈" },
                { label: "方向", value: "希望带团队，技术管理方向" },
              ].map((p) => (
                <div key={p.label} className="flex items-start gap-2.5">
                  <span className="text-[12px] text-[#C7C7CC] w-8 flex-shrink-0 pt-px">{p.label}</span>
                  <span className="text-[13px] text-[#1D1D1F] font-medium">{p.value}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── 成长轨迹 ── */}
        <motion.div className="bg-white rounded-2xl px-5 py-4" style={cs} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.11 }}>
          {/* 工作经历 */}
          <p className="text-[14px] font-semibold text-[#1D1D1F] tracking-tight mb-3">工作经历</p>
          <div className="relative pl-4 mb-5">
            <div className="absolute left-[3px] top-1 bottom-1 w-px bg-black/[0.06]" />
            {[
              { period: "2022.6 - 至今", org: "某互联网大厂", role: "高级 Java 后端 · 技术组长", highlight: true },
              { period: "2020.4 - 2022.5", org: "某电商平台", role: "Java 后端工程师", highlight: false },
              { period: "2019.7 - 2020.3", org: "某创业公司", role: "初级后端开发", highlight: false },
            ].map((v, i) => (
              <div key={i} className="relative flex gap-3 pb-4 last:pb-0">
                <div className={`absolute -left-4 top-[5px] w-[7px] h-[7px] rounded-full ${v.highlight ? "bg-[#34C759] ring-2 ring-[#34C759]/20" : "bg-[#C7C7CC]"}`} />
                <div>
                  <p className={`text-[13px] leading-[1.5] ${v.highlight ? "text-[#1D1D1F] font-medium" : "text-[#1D1D1F]"}`}>{v.org}</p>
                  <p className="text-[12px] text-[#86868B] mt-0.5">{v.role}</p>
                  <p className="text-[10px] text-[#C7C7CC] mt-0.5">{v.period}</p>
                </div>
              </div>
            ))}
          </div>
          {/* 教育背景 */}
          <div className="pt-4 border-t border-black/[0.04]">
            <p className="text-[14px] font-semibold text-[#1D1D1F] tracking-tight mb-3">教育背景</p>
            <div className="relative pl-4">
              <div className="absolute left-[3px] top-1 bottom-1 w-px bg-black/[0.06]" />
              {[
                { period: "2015.9 - 2019.6", org: "XX 大学（985）", role: "计算机科学与技术 · 本科" },
              ].map((v, i) => (
                <div key={i} className="relative flex gap-3 pb-0">
                  <div className="absolute -left-4 top-[5px] w-[7px] h-[7px] rounded-full bg-[#007AFF]" />
                  <div>
                    <p className="text-[13px] text-[#1D1D1F] leading-[1.5]">{v.org}</p>
                    <p className="text-[12px] text-[#86868B] mt-0.5">{v.role}</p>
                    <p className="text-[10px] text-[#C7C7CC] mt-0.5">{v.period}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── 设置 ── */}
        <motion.div className="bg-white rounded-2xl overflow-hidden" style={cs} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.14 }}>
          {[
            { label: "通知设置", onClick: () => {} },
            { label: "隐私与安全", onClick: () => router.push("/privacy") },
            { label: "关于我们", onClick: () => {} },
          ].map((item, i, arr) => (
            <motion.button key={item.label} className={`w-full flex items-center justify-between px-5 py-3.5 ${i < arr.length - 1 ? "border-b border-black/[0.04]" : ""}`} whileTap={{ scale: 0.98, backgroundColor: "rgba(0,0,0,0.02)" }} onClick={item.onClick}>
              <span className="text-[14px] text-[#1D1D1F]">{item.label}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C7C7CC" strokeWidth="2"><path d="m9 18 6-6-6-6" /></svg>
            </motion.button>
          ))}
        </motion.div>

        <motion.button className="w-full bg-white rounded-2xl py-3.5" style={cs} whileTap={{ scale: 0.98 }} onClick={() => router.push("/login")} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.17 }}>
          <span className="text-[14px] text-[#FF3B30] font-medium">退出登录</span>
        </motion.button>

        <p className="text-[11px] text-[#C7C7CC] text-center pt-4 pb-4">App.Work v1.0.0</p>
      </div>
    </div>
  );
}

/* ============ Incomplete State: Overview ============ */
function IncompleteOverview({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-24">
      <div className="sticky top-0 z-30 backdrop-blur-xl bg-white/80 border-b border-gray-100 px-5 pt-14 pb-4">
        <h1 className="text-[22px] font-semibold text-[#1D1D1F]">概览</h1>
      </div>

      {/* 意图未确认提示 */}
      <div className="px-5 pt-5">
        <motion.div
          className="bg-white/70 backdrop-blur-xl rounded-[20px] border border-[#FF9500]/20 relative z-10"
          style={{ boxShadow: "0 2px 20px rgba(255,149,0,0.08), 0 0 0 0.5px rgba(255,149,0,0.1)" }}
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        >
          <div className="px-5 pt-4 pb-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-[#FF9500] animate-slow-blink" />
              <p className="text-[11px] font-medium text-[#FF9500] uppercase tracking-wider">意图未确认</p>
            </div>
            <p className="text-[16px] font-semibold text-[#1D1D1F] leading-[1.4] tracking-tight mb-2">经纪人尚未启动</p>
            <p className="text-[14px] text-[#86868B] leading-relaxed mb-4">需要完善你的档案，告诉经纪人你在找什么样的工作，才能开始帮你寻找机会。</p>
            <motion.button
              className="w-full h-[44px] bg-[#1D1D1F] text-white rounded-[12px] text-[15px] font-medium"
              whileTap={{ scale: 0.97 }}
              onClick={onContinue}
            >
              继续完善档案
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* 空数据工作简报 */}
      <div className="px-5 pt-3">
        <div className="bg-white/70 backdrop-blur-xl rounded-[16px] px-5 py-4" style={{ boxShadow: "0 1px 10px rgba(0,0,0,0.03), 0 0 0 0.5px rgba(0,0,0,0.03)" }}>
          <p className="text-[13px] text-[#86868B] mb-2">你的经纪人替你</p>
          <div className="flex items-baseline gap-0 flex-wrap">
            <span className="text-[13px] text-[#86868B]">浏览了</span>
            <span className="text-[17px] font-bold tracking-tight text-[#E5E5EA] mx-1" style={{ fontFeatureSettings: "'tnum'" }}>—</span>
            <span className="text-[13px] text-[#86868B] ml-0.5">个岗位</span>
            <span className="text-[#E5E5EA] mx-2">|</span>
            <span className="text-[13px] text-[#86868B]">沟通</span>
            <span className="text-[17px] font-bold tracking-tight text-[#E5E5EA] mx-1" style={{ fontFeatureSettings: "'tnum'" }}>—</span>
            <span className="text-[#E5E5EA] mx-2">|</span>
            <span className="text-[13px] text-[#86868B]">拦截</span>
            <span className="text-[17px] font-bold tracking-tight text-[#E5E5EA] mx-1" style={{ fontFeatureSettings: "'tnum'" }}>—</span>
          </div>
        </div>
      </div>

      {/* 空待处理 */}
      <div className="px-5 pt-5 pb-2">
        <p className="text-[11px] font-medium text-[#86868B] uppercase tracking-wider mb-3">待处理</p>
        <div className="bg-white/70 backdrop-blur-xl rounded-[18px] p-6 flex flex-col items-center" style={{ boxShadow: "0 2px 20px rgba(0,0,0,0.04), 0 0 0 0.5px rgba(0,0,0,0.03)" }}>
          <p className="text-[14px] text-[#C7C7CC]">完善档案后，经纪人将为你处理任务</p>
        </div>
      </div>
    </div>
  );
}

/* ============ Incomplete State: Opportunities (with overlay) ============ */
function IncompleteOpportunities({ onContinue }: { onContinue: () => void }) {
  const placeholderOpps = [
    { id: 1, company: "某知名互联网企业", salary: "***", match: "—", state: "NEGOTIATING" as const },
    { id: 2, company: "某上市科技公司", salary: "***", match: "—", state: "SUSPENDED" as const },
    { id: 3, company: "某独角兽企业", salary: "***", match: "—", state: "DEAD_END" as const },
  ];

  const stateConfig: Record<string, { label: string; color: string; dot?: boolean }> = {
    NEGOTIATING: { label: "沟通中", color: "#34C759", dot: true },
    SUSPENDED: { label: "等待指示", color: "#FF9500" },
    DEAD_END: { label: "已出局", color: "#C7C7CC" },
  };

  type TabKey = "ALL" | "KEY_PROGRESS" | "NEGOTIATION" | "ENDED";
  const tabs: { key: TabKey; label: string; count: number; color?: string }[] = [
    { key: "ALL", label: "总览", count: 3 },
    { key: "KEY_PROGRESS", label: "关键推进", count: 1, color: "#FF9500" },
    { key: "NEGOTIATION", label: "沟通谈判", count: 1, color: "#34C759" },
    { key: "ENDED", label: "拦截结束", count: 1, color: "#86868B" },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-24 relative">
      <div className="sticky top-0 z-30 backdrop-blur-xl bg-white/80 border-b border-gray-100 px-5 pt-14 pb-3">
        <h1 className="text-[22px] font-semibold text-[#1D1D1F] mb-3">机会</h1>

        {/* 嗅探统计 */}
        <div className="flex items-center gap-2 mb-3">
          <div className="relative">
            <div className="w-[5px] h-[5px] rounded-full bg-[#C7C7CC]" />
          </div>
          <span className="text-[12px] text-[#C7C7CC]">经纪人尚未启动</span>
        </div>

        {/* 标签栏 */}
        <div className="flex items-center gap-1.5">
          {tabs.map((tab, i) => (
            <div
              key={tab.key}
              className={`flex-1 flex items-center justify-center gap-1 h-[32px] rounded-full text-[12px] font-medium ${i === 0 ? "bg-[#1D1D1F] text-white" : "bg-[#F5F5F7] text-[#86868B]"}`}
            >
              {tab.color && i !== 0 && <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: tab.color }} />}
              <span>{tab.label}</span>
              <span className={`text-[10px] ${i === 0 ? "text-white/50" : "text-[#C7C7CC]"}`}>{tab.count}</span>
            </div>
          ))}
          <div className="w-[32px] h-[32px] flex items-center justify-center rounded-full flex-shrink-0 bg-[#F5F5F7] text-[#86868B]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M6 12h12M9 18h6" /></svg>
          </div>
        </div>
      </div>

      <div className="px-5 pt-4 space-y-3">
        {placeholderOpps.map((opp, idx) => {
          const sc = stateConfig[opp.state];
          const isDead = opp.state === "DEAD_END";
          return (
            <div key={opp.id} className={`bg-white rounded-2xl overflow-hidden ${isDead ? "opacity-55" : ""}`} style={{ boxShadow: isDead ? "0 1px 8px rgba(0,0,0,0.03)" : "0 2px 16px rgba(0,0,0,0.04), 0 0 0 0.5px rgba(0,0,0,0.04)" }}>
              <div className="px-5 py-4">
                <div className="flex items-center justify-between mb-3">
                  <p className={`text-[16px] font-semibold tracking-tight ${isDead ? "text-[#86868B]" : "text-[#E5E5EA]"}`}>{opp.company}</p>
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
                <p className={`text-[13px] ${isDead ? "text-[#C7C7CC]" : "text-[#E5E5EA]"}`}>薪资 {opp.salary} · 匹配度 {opp.match}</p>
              </div>
            </div>
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
            <h3 className="text-[20px] font-bold text-[#1D1D1F] tracking-tight mb-2">经纪人尚未启动</h3>
            <p className="text-[14px] text-[#86868B] text-center leading-relaxed mb-5">完成档案创建后，经纪人将自动为你寻找机会</p>
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
              onClick={onContinue}
              style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}
            >
              继续创建经纪人
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ Incomplete State: Assets ============ */
function IncompleteAssets({ onContinue }: { onContinue: () => void }) {
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
        <p className="text-[14px] text-[#86868B] text-center leading-relaxed mb-8">完善档案后，Agent 将基于你的简历和偏好<br/>构建专属职业档案</p>
        <motion.button
          className="w-full h-[52px] bg-[#1D1D1F] text-white rounded-2xl text-[16px] font-semibold"
          whileTap={{ scale: 0.97 }}
          onClick={onContinue}
        >
          继续完善档案
        </motion.button>
      </div>
    </div>
  );
}

/* ============ Dashboard Main ============ */
function DashboardInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const incomplete = searchParams.get("incomplete") === "1";

  const [activeTab, setActiveTab] = useState(0);
  const [chatPrefill, setChatPrefill] = useState("");
  const [inboxTasks, setInboxTasks] = useState<InboxTask[]>(initialInboxTasks);
  const [opps] = useState<Opportunity[]>(initialOpps);

  const pendingCount = inboxTasks.filter(t => t.type !== "INFO_REPORT").length;

  const handleSwitchToChat = (prefill?: string) => {
    if (prefill) setChatPrefill(prefill);
    setActiveTab(2);
  };

  const handleContinueSetup = () => {
    router.push("/preview/assign");
  };

  const handleDismissTask = (id: number) => {
    setInboxTasks(prev => prev.filter(t => t.id !== id));
  };

  const content = () => {
    if (incomplete) {
      switch (activeTab) {
        case 0: return <IncompleteOverview onContinue={handleContinueSetup} />;
        case 1: return <IncompleteOpportunities onContinue={handleContinueSetup} />;
        case 2: return <AgentChatPage prefillMessage={chatPrefill} onClearPrefill={() => setChatPrefill("")} />;
        case 3: return <IncompleteAssets onContinue={handleContinueSetup} />;
        default: return <IncompleteOverview onContinue={handleContinueSetup} />;
      }
    }
    switch (activeTab) {
      case 0: return <OverviewPage onSwitchToChat={handleSwitchToChat} inboxTasks={inboxTasks} onDismissTask={handleDismissTask} />;
      case 1: return <OpportunitiesFeed opps={opps} inboxTasks={inboxTasks} onDismissTask={handleDismissTask} />;
      case 2: return <AgentChatPage prefillMessage={chatPrefill} onClearPrefill={() => setChatPrefill("")} />;
      case 3: return <AssetPage />;
      default: return <OverviewPage onSwitchToChat={handleSwitchToChat} inboxTasks={inboxTasks} onDismissTask={handleDismissTask} />;
    }
  };
  return (
    <div className="relative">
      {content()}
      <BottomTabBar activeTab={activeTab} onTabChange={setActiveTab} pendingCount={pendingCount} />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAFAFA]" />}>
      <DashboardInner />
    </Suspense>
  );
}
