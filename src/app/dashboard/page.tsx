"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { allJobAnalysis, type JobAnalysis } from "@/lib/jobData";

/* ============ SVG Tab Icons ============ */
const IconHome = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#1D1D1F" : "#86868B"} strokeWidth={active ? 2 : 1.5}>
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9,22 9,12 15,12 15,22" />
  </svg>
);
const IconBriefcase = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#1D1D1F" : "#86868B"} strokeWidth={active ? 2 : 1.5}>
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
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
    { icon: IconHome, label: "首页", badge: pendingCount > 0 ? pendingCount : undefined },
    { icon: IconBriefcase, label: "机会" },
    { icon: IconMessage, label: "消息" },
    { icon: IconUserTab, label: "我的" },
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
type TaskType = "NEED_REPLY" | "URGENT_DECISION" | "AGENT_SUGGESTION";
interface InboxTask {
  id: number;
  type: TaskType;
  company: string;
  team: string;
  salary: string;
  // NEED_REPLY: AI 信息缺失，需用户决策怎么回
  hrQuestion?: string;
  agentDraft?: string;
  // URGENT_DECISION: 涉及关键推进（如面试邀请）
  alert?: string;
  // AGENT_SUGGESTION: 不符合意图但 AI 认为有价值
  conflictPoint?: string;
  agentReason?: string;
  time?: string;
  // 完成态
  resolved?: boolean;
  resolvedAction?: string;
}

const initialInboxTasks: InboxTask[] = [
  {
    id: 1, type: "URGENT_DECISION", company: "字节跳动", team: "商业化团队", salary: "28-35k",
    alert: "对方想发起面试：下周二 14:00 线上技术面",
    time: "2 分钟前",
  },
  {
    id: 2, type: "NEED_REPLY", company: "蚂蚁集团", team: "支付安全", salary: "30-40k",
    hrQuestion: "你上一段经历为什么只待了半年？团队管理遇到了什么问题？",
    agentDraft: "上一段经历主要因为团队战略调整，原项目被合并到其他 BU，非个人原因离开。期间我主导了支付网关的微服务拆分，日均交易量从 50 万笔提升到 200 万笔。",
    time: "1 小时前",
  },
  {
    id: 3, type: "AGENT_SUGGESTION", company: "美团", team: "到店事业群", salary: "23k×16薪",
    conflictPoint: "月 Base 低于底线 25k，但年包有竞争力",
    agentReason: "按 16 薪折算月均 30.7k，年总包 ≈ 44 万，溢价 12%。另有签字费 5 万。综合性价比高，建议继续推进。",
    time: "15 分钟前",
  },
];

/* ============ Timeline for Overview Chat ============ */
type TimelineItem =
  | { kind: "msg"; id: number; role: "agent" | "user"; text: string }
  | { kind: "task"; id: number; taskId: number }
  | { kind: "time"; id: number; text: string };

const initialTimeline: TimelineItem[] = [
  // ── 入驻欢迎 ──
  { kind: "time", id: -100, text: "昨天 09:00" },
  { kind: "msg", id: -99, role: "agent", text: "你好！我是你的 AI 求职经纪人 ✌️" },
  { kind: "msg", id: -98, role: "agent", text: "接下来我会帮你浏览海量岗位、跟 HR 沟通、帮你谈薪资。你只需要在关键节点做个决策就好，其他的交给我。" },
  { kind: "msg", id: -97, role: "user", text: "好的，那就拜托了" },
  { kind: "msg", id: -96, role: "agent", text: "放心交给我 💪 先帮你看看有哪些好机会。" },

  // ── 开始工作 ──
  { kind: "time", id: -90, text: "昨天 11:30" },
  { kind: "msg", id: -89, role: "agent", text: "跑了一圈，初步筛了 1200 多个岗位，帮你圈出了几个不错的。" },
  { kind: "msg", id: -88, role: "agent", text: "字节跳动商业化团队、蚂蚁集团支付安全、京东零售技术，都在招你这个方向的人，而且 HC 比较急。" },
  { kind: "msg", id: -87, role: "agent", text: "我先帮你聊着，有进展随时同步你。" },
  { kind: "msg", id: -86, role: "user", text: "好的 字节那个优先级高一些" },
  { kind: "msg", id: -85, role: "agent", text: "收到，字节已标为最高优先级，我重点推。" },

  // ── 今天 ──
  { kind: "time", id: -80, text: "今天 08:15" },
  { kind: "msg", id: -79, role: "agent", text: "早上好！昨晚和几家 HR 都聊上了，有几个事需要你看一下 👇" },

  // 审批卡片 1: 字节面试邀请
  { kind: "msg", id: -78, role: "agent", text: "字节那边推进很快，HR 直接发面试邀请了：" },
  { kind: "task", id: -77, taskId: 1 },

  // 审批卡片 2: 蚂蚁待回复
  { kind: "msg", id: -76, role: "agent", text: "蚂蚁那边 HR 问了个敏感问题，我拟了个回复你看看合不合适：" },
  { kind: "task", id: -75, taskId: 2 },

  // 审批卡片 3: 美团建议
  { kind: "msg", id: -74, role: "agent", text: "美团那个机会有点意思，虽然月 base 低了点，但我算了一下总包其实不错。" },
  { kind: "msg", id: -73, role: "agent", text: "要不要我继续帮你谈谈？" },
  { kind: "task", id: -72, taskId: 3 },

  // 收尾的闲聊
  { kind: "msg", id: -71, role: "agent", text: "对了，你对远程办公有偏好吗？" },
  { kind: "msg", id: -70, role: "agent", text: "有几个不错的机会支持 remote，要不要也帮你留意一下？" },
];

/* ============ Recommended Jobs (Tab 1) ============ */
type JobStatus = "new" | "progressing" | "ended";
interface RecommendedJob extends JobAnalysis {
  headcount: number;
  chatHistory: { role: "agent" | "hr"; text: string }[];
  suggestedMessages: string[];
  status: JobStatus;
  viewed: boolean;
  endReason?: string;
  endBy?: "ai" | "user";
  companiesScanned: number;
}

const initialRecommendedJobs: RecommendedJob[] = [
  {
    ...allJobAnalysis[1], headcount: 3, companiesScanned: 186,
    chatHistory: [
      { role: "agent", text: "你好，我这边有一位候选人，5年 Java 后端经验，擅长微服务架构和高并发处理，目前在看新机会。" },
      { role: "hr", text: "可以的，我们商业化团队正在招高级后端，能发一份简历过来看看吗？" },
      { role: "agent", text: "简历稍后发送。想先确认一下，贵团队的作息制度和薪资范围方便透露吗？" },
      { role: "hr", text: "双休弹性工时，薪资 28-35k，具体面试后定级。我们 HC 比较多，流程会快。" },
    ],
    suggestedMessages: ["你好，我对这个岗位很感兴趣，方便聊聊具体的技术栈和团队情况吗？", "我有丰富的高并发和微服务经验，希望能进一步了解岗位细节。"],
    status: "new", viewed: false,
  },
  {
    ...allJobAnalysis[2], headcount: 2, companiesScanned: 203,
    chatHistory: [
      { role: "agent", text: "您好，推荐一位在支付领域有深厚经验的候选人，曾主导支付网关微服务拆分，日均交易量从 50 万提升到 200 万。" },
      { role: "hr", text: "经历很匹配！我们支付安全团队正缺这样的人。方便安排线上聊一下吗？" },
      { role: "agent", text: "非常乐意。候选人比较关注团队的技术方向和薪资结构，能先介绍一下吗？" },
      { role: "hr", text: "我们专注交易链路安全，技术栈是 Java + 自研中间件。薪资 30-40k，年终 4-6 个月。" },
    ],
    suggestedMessages: ["我在支付网关领域有很多实战经验，想深入了解贵团队的安全架构。", "请问团队目前在做哪些方向的技术升级？"],
    status: "new", viewed: false,
  },
  {
    ...allJobAnalysis[7], headcount: 5, companiesScanned: 186,
    chatHistory: [
      { role: "agent", text: "你好，推荐一位高级 Java 后端工程师，5年经验，擅长分布式架构，对电商和交易系统有深入理解。" },
      { role: "hr", text: "我们正在扩招，这个方向很需要人。简历发过来我们快速看一下。" },
    ],
    suggestedMessages: ["到店业务的架构升级具体在做什么方向？", "团队目前的技术栈和基础设施是怎样的？"],
    status: "ended", viewed: true, endReason: "你选择了不合适", endBy: "user",
  },
  {
    ...allJobAnalysis[3], headcount: 2, companiesScanned: 186,
    chatHistory: [
      { role: "agent", text: "推荐一位在支付和交易系统方面经验丰富的候选人，曾主导过网关微服务拆分。" },
      { role: "hr", text: "太好了，我们交易中台重构正需要这样的人。经验匹配的话可以直接定高级别。" },
      { role: "agent", text: "候选人目前在北京，期望薪资 30k+，对大型系统重构很有兴趣。" },
      { role: "hr", text: "没问题，我们预算 28-38k，表现好的话上限还能谈。约个时间聊聊？" },
    ],
    suggestedMessages: ["交易中台重构目前到什么阶段了？", "团队的技术选型和架构方向是怎样的？"],
    status: "progressing", viewed: true,
  },
  {
    ...allJobAnalysis[4], headcount: 2, companiesScanned: 152,
    chatHistory: [
      { role: "agent", text: "推荐一位全栈能力强的 Java 后端工程师，对内容分发和推荐系统有兴趣。" },
      { role: "hr", text: "可以先投简历，我们筛选后安排面试。请问候选人对远程办公有偏好吗？" },
      { role: "agent", text: "候选人对混合办公模式很感兴趣，这也是考虑贵司的一个重要因素。" },
    ],
    suggestedMessages: ["我对社区内容分发很感兴趣，想了解一下团队的技术架构。", "请问远程办公的具体政策是怎样的？"],
    status: "new", viewed: false,
  },
  {
    ...allJobAnalysis[6], headcount: 3, companiesScanned: 186,
    chatHistory: [
      { role: "agent", text: "这边有一位候选人，支付领域经验丰富，微服务架构能力强，期望薪资 30k 起。" },
      { role: "hr", text: "背景不错，我们微信支付团队需要这样的人。预算 30-42k 区间，面试后定级。" },
    ],
    suggestedMessages: ["微信支付的技术栈和架构是怎样的？", "团队的工作节奏和加班情况如何？"],
    status: "ended", viewed: true, endReason: "AI 判定：需跨城搬迁，与你偏好的城市不符", endBy: "ai",
  },
];

/* ============ Chat Threads (Tab 2 - Messages) ============ */
// agent_handling = Agent在代理（①②合并），need_reply = HR等你回复（③），waiting_hr = 你回了等HR（④），ended = 已结束（⑤）
type ThreadStatus = "agent_handling" | "need_reply" | "waiting_hr" | "ended";
interface ChatThread {
  id: number;
  company: string;
  team: string;
  avatar: string;           // HR person avatar URL
  lastTime: string;
  unread: number;           // message count
  hasHumanMessage: boolean;  // true=真人HR发来消息(红点), false=等待决策指示(橙点)
  status: ThreadStatus;
  agentNote: string;
}

const initialChatThreads: ChatThread[] = [
  { id: 1, company: "字节跳动", team: "商业化团队", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=96&h=96&fit=crop&crop=face", lastTime: "2分钟前", unread: 2, hasHumanMessage: true, status: "need_reply", agentNote: "HR 发来面试邀请，等待你确认" },
  { id: 2, company: "蚂蚁集团", team: "支付安全", avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=96&h=96&fit=crop&crop=face", lastTime: "1小时前", unread: 1, hasHumanMessage: false, status: "need_reply", agentNote: "Agent 建议调整薪资预期，等待你指示" },
  { id: 3, company: "京东", team: "零售技术", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=96&h=96&fit=crop&crop=face", lastTime: "3小时前", unread: 0, hasHumanMessage: false, status: "agent_handling", agentNote: "经纪人正在对齐薪资细节" },
  { id: 4, company: "小红书", team: "社区技术", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop&crop=face", lastTime: "5小时前", unread: 0, hasHumanMessage: false, status: "agent_handling", agentNote: "经纪人正在确认远程政策" },
  { id: 5, company: "快手", team: "商业化中台", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=96&h=96&fit=crop&crop=face", lastTime: "昨天", unread: 0, hasHumanMessage: false, status: "waiting_hr", agentNote: "你已回复，等待 HR 反馈" },
  { id: 6, company: "腾讯", team: "微信支付", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=96&h=96&fit=crop&crop=face", lastTime: "昨天", unread: 0, hasHumanMessage: false, status: "agent_handling", agentNote: "经纪人初步沟通中" },
  { id: 401, company: "百度", team: "搜索技术", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=96&h=96&fit=crop&crop=face", lastTime: "3天前", unread: 0, hasHumanMessage: false, status: "ended", agentNote: "已结束" },
];

/* ============ Mini Counter (inline count-up for stats subtitle) ============ */
function MiniCounter({ target }: { target: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const duration = 800;
    const steps = 20;
    const increment = target / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      setDisplay(Math.min(Math.round(increment * step), target));
      if (step >= steps) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target]);
  return <span style={{ fontFeatureSettings: "'tnum'", fontWeight: 600 }}>{display.toLocaleString()}</span>;
}

/* ============ Animated Number (smooth count-up on mount) ============ */
function AnimatedNumber({ value, color }: { value: string; color: string }) {
  const target = parseInt(value.replace(/,/g, ""));
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const duration = 1200;
    const steps = 30;
    const increment = target / steps;
    let current = 0;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      current = Math.min(Math.round(increment * step), target);
      setDisplay(current);
      if (step >= steps) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target]);
  return (
    <motion.span
      className={`text-[17px] font-bold tracking-tight ${color} mx-1`}
      style={{ fontFeatureSettings: "'tnum'" }}
    >
      {display.toLocaleString()}
    </motion.span>
  );
}

/* ============ Tab 0: Overview — Agent Workbench ============ */
function WaterFill({ percent }: { percent: number }) {
  const clampedPercent = Math.min(Math.max(percent, 0), 100);
  return (
    <div className="relative w-[120px] h-[120px] mx-auto">
      <svg width="120" height="120" viewBox="0 0 120 120">
        {/* Circle border */}
        <circle cx="60" cy="60" r="56" fill="none" stroke="rgba(0,0,0,0.04)" strokeWidth="2" />
        {/* Clipping circle */}
        <defs>
          <clipPath id="circleClip"><circle cx="60" cy="60" r="55" /></clipPath>
        </defs>
        {/* Water fill */}
        <g clipPath="url(#circleClip)">
          <motion.rect
            x="0" width="120" height="120" fill="url(#waterGrad)"
            initial={{ y: 120 }}
            animate={{ y: 120 - (clampedPercent / 100) * 120 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
          {/* Wave 1 */}
          <motion.path
            d="M0,0 Q15,-8 30,0 T60,0 T90,0 T120,0 V120 H0 Z"
            fill="rgba(50,215,75,0.15)"
            initial={{ y: 120 }}
            animate={{ y: 120 - (clampedPercent / 100) * 120 - 4, x: [0, -30, 0] }}
            transition={{ y: { duration: 1.5, ease: "easeOut" }, x: { duration: 3, repeat: Infinity, ease: "easeInOut" } }}
          />
          {/* Wave 2 */}
          <motion.path
            d="M0,0 Q15,-6 30,0 T60,0 T90,0 T120,0 V120 H0 Z"
            fill="rgba(50,215,75,0.10)"
            initial={{ y: 120 }}
            animate={{ y: 120 - (clampedPercent / 100) * 120 - 2, x: [0, 20, 0] }}
            transition={{ y: { duration: 1.5, ease: "easeOut" }, x: { duration: 2.5, repeat: Infinity, ease: "easeInOut" } }}
          />
          <defs>
            <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(50,215,75,0.18)" />
              <stop offset="100%" stopColor="rgba(50,215,75,0.08)" />
            </linearGradient>
          </defs>
        </g>
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span className="text-[28px] font-bold text-[#1D1D1F] tracking-tight" style={{ fontFeatureSettings: "'tnum'" }} key={clampedPercent} initial={{ scale: 1.05 }} animate={{ scale: 1 }}>{clampedPercent}%</motion.span>
      </div>
    </div>
  );
}

function OverviewPage({ inboxTasks, onResolveTask }: { inboxTasks: InboxTask[]; onResolveTask: (id: number, action: string) => void }) {
  const router = useRouter();
  const [engineIdx, setEngineIdx] = useState(0);
  const [engineMenuOpen, setEngineMenuOpen] = useState(false);
  const engine = engineStates[engineIdx];
  const [matchRate, setMatchRate] = useState(78);

  const taskRefs = useRef<Record<number, HTMLDivElement | null>>({});

  /* ── timeline + chat state ── */
  const [timeline, setTimeline] = useState<TimelineItem[]>(initialTimeline);
  const [chatInput, setChatInput] = useState("");
  const [chatTyping, setChatTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [timeline, chatTyping]);

  const agentReplies = [
    "收到，我马上帮你处理。",
    "有新进展会第一时间通知你。",
    "明白了，我会重点关注这个方向。",
    "好的，已记录你的偏好，后续筛选会优先考虑。",
    "了解，我现在就去和对方沟通确认。",
  ];

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    setTimeline(prev => [...prev, { kind: "msg", id: Date.now(), role: "user", text: chatInput }]);
    setChatInput("");
    setChatTyping(true);
    setTimeout(() => {
      setChatTyping(false);
      const reply = agentReplies[Math.floor(Math.random() * agentReplies.length)];
      setTimeline(prev => [...prev, { kind: "msg", id: Date.now() + 1, role: "agent", text: reply }]);
      setMatchRate(prev => Math.min(prev + 1, 99));
    }, 1200);
  };

  const pendingTasks = inboxTasks.filter(t => !t.resolved);
  const [pendingScrollIdx, setPendingScrollIdx] = useState(0);
  useEffect(() => {
    if (pendingTasks.length <= 1) return;
    const timer = setInterval(() => setPendingScrollIdx(prev => (prev + 1) % pendingTasks.length), 3000);
    return () => clearInterval(timer);
  }, [pendingTasks.length]);

  const handleResolve = (id: number, actionLabel: string) => {
    onResolveTask(id, actionLabel);
    setMatchRate(prev => Math.min(prev + 2, 99));
  };

  const typeConfig: Record<TaskType, { badge: string; dotColor: string }> = {
    NEED_REPLY: { badge: "待你回复", dotColor: "#007AFF" },
    URGENT_DECISION: { badge: "紧急决策", dotColor: "#FF3B30" },
    AGENT_SUGGESTION: { badge: "经纪人建议", dotColor: "#FF9500" },
  };

  /* ── Agent Avatar ── */
  const AgentAvatar = () => (
    <div className="w-7 h-7 rounded-full bg-[#1D1D1F] flex items-center justify-center flex-shrink-0 mt-0.5" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
      <span className="text-[9px] font-bold text-white tracking-tight">A.</span>
    </div>
  );

  /* ── Render a task card ── */
  const renderTaskCard = (task: InboxTask) => {
    const tc = typeConfig[task.type];
    return (
      <div ref={el => { taskRefs.current[task.id] = el; }} className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.85)", boxShadow: "0 1px 8px rgba(0,0,0,0.05), inset 0 0 0 0.5px rgba(0,0,0,0.04)", opacity: task.resolved ? 0.55 : 1 }}>
        <div className="px-3.5 py-3">
          {/* Badge */}
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <div className="w-[6px] h-[6px] rounded-full" style={{ backgroundColor: task.resolved ? "#AEAEB2" : tc.dotColor }} />
              <span className="text-[11px] font-medium" style={{ color: task.resolved ? "#AEAEB2" : tc.dotColor }}>{tc.badge}</span>
            </div>
            {task.time && <span className="text-[10px] text-[#AEAEB2]">{task.time}</span>}
          </div>
          {/* Company */}
          <p className="text-[14px] font-semibold text-[#1D1D1F] tracking-tight mb-1">
            {task.company}{task.team ? ` · ${task.team}` : ""}{task.salary ? <span className="text-[12px] text-[#8E8E93] font-normal ml-1.5">{task.salary}</span> : null}
          </p>
          {/* Type content */}
          {task.type === "URGENT_DECISION" && task.alert && (
            <p className="text-[13px] text-[#1D1D1F] leading-[1.5] mb-2">{task.alert}</p>
          )}
          {task.type === "NEED_REPLY" && (
            <div className="mb-2">
              {task.hrQuestion && (
                <div className="mb-1.5">
                  <p className="text-[10px] text-[#AEAEB2] mb-0.5">对方提问</p>
                  <p className="text-[13px] text-[#1D1D1F] leading-[1.5]">{task.hrQuestion}</p>
                </div>
              )}
              {task.agentDraft && (
                <div>
                  <p className="text-[10px] text-[#AEAEB2] mb-0.5">参考回复</p>
                  <p className="text-[12px] text-[#8E8E93] leading-[1.6] bg-black/[0.03] rounded-xl px-3 py-2">{task.agentDraft}</p>
                </div>
              )}
            </div>
          )}
          {task.type === "AGENT_SUGGESTION" && (
            <div className="mb-2">
              {task.conflictPoint && <p className="text-[13px] font-medium text-[#1D1D1F] leading-[1.5] mb-1">{task.conflictPoint}</p>}
              {task.agentReason && <p className="text-[12px] text-[#8E8E93] leading-[1.6]">{task.agentReason}</p>}
            </div>
          )}
          {/* Buttons */}
          <div className="flex gap-2 mt-1" onClick={e => e.stopPropagation()}>
            {task.type === "URGENT_DECISION" && (
              <>
                <motion.button className={`flex-1 h-[34px] rounded-xl text-[12px] font-medium ${task.resolved ? (task.resolvedAction === "同意" ? "bg-[#1D1D1F] text-white" : "bg-black/[0.03] text-[#AEAEB2]") : "bg-[#1D1D1F] text-white"}`} style={!task.resolved || task.resolvedAction === "同意" ? { boxShadow: "0 1px 6px rgba(0,0,0,0.1)" } : {}} whileTap={!task.resolved ? { scale: 0.97 } : {}} onClick={() => !task.resolved && handleResolve(task.id, "同意")}>{task.resolved && task.resolvedAction === "同意" ? "已同意" : "同意"}</motion.button>
                <motion.button className={`flex-1 h-[34px] rounded-xl text-[12px] font-medium ${task.resolved ? (task.resolvedAction === "我亲自聊" ? "bg-[#1D1D1F] text-white" : "bg-black/[0.03] text-[#AEAEB2]") : "bg-black/[0.04] text-[#1D1D1F]"}`} style={task.resolved && task.resolvedAction === "我亲自聊" ? { boxShadow: "0 1px 6px rgba(0,0,0,0.1)" } : {}} whileTap={!task.resolved ? { scale: 0.97 } : {}} onClick={() => !task.resolved && handleResolve(task.id, "我亲自聊")}>{task.resolved && task.resolvedAction === "我亲自聊" ? "已选择亲自聊" : "我亲自聊"}</motion.button>
              </>
            )}
            {task.type === "NEED_REPLY" && (
              <>
                <motion.button className={`flex-1 h-[34px] rounded-xl text-[12px] font-medium ${task.resolved ? (task.resolvedAction === "直接发送" ? "bg-[#1D1D1F] text-white" : "bg-black/[0.03] text-[#AEAEB2]") : "bg-[#1D1D1F] text-white"}`} style={!task.resolved || task.resolvedAction === "直接发送" ? { boxShadow: "0 1px 6px rgba(0,0,0,0.1)" } : {}} whileTap={!task.resolved ? { scale: 0.97 } : {}} onClick={() => !task.resolved && handleResolve(task.id, "直接发送")}>{task.resolved && task.resolvedAction === "直接发送" ? "已发送" : "直接发送"}</motion.button>
                <motion.button className={`flex-1 h-[34px] rounded-xl text-[12px] font-medium ${task.resolved ? (task.resolvedAction === "我亲自聊" ? "bg-[#1D1D1F] text-white" : "bg-black/[0.03] text-[#AEAEB2]") : "bg-black/[0.04] text-[#1D1D1F]"}`} style={task.resolved && task.resolvedAction === "我亲自聊" ? { boxShadow: "0 1px 6px rgba(0,0,0,0.1)" } : {}} whileTap={!task.resolved ? { scale: 0.97 } : {}} onClick={() => !task.resolved && handleResolve(task.id, "我亲自聊")}>{task.resolved && task.resolvedAction === "我亲自聊" ? "已选择亲自聊" : "我亲自聊"}</motion.button>
              </>
            )}
            {task.type === "AGENT_SUGGESTION" && (
              <>
                <motion.button className={`flex-1 h-[34px] rounded-xl text-[12px] font-medium ${task.resolved ? (task.resolvedAction === "同意推进" ? "bg-[#1D1D1F] text-white" : "bg-black/[0.03] text-[#AEAEB2]") : "bg-[#1D1D1F] text-white"}`} style={!task.resolved || task.resolvedAction === "同意推进" ? { boxShadow: "0 1px 6px rgba(0,0,0,0.1)" } : {}} whileTap={!task.resolved ? { scale: 0.97 } : {}} onClick={() => !task.resolved && handleResolve(task.id, "同意推进")}>{task.resolved && task.resolvedAction === "同意推进" ? "已同意推进" : "同意推进"}</motion.button>
                <motion.button className={`flex-1 h-[34px] rounded-xl text-[12px] font-medium ${task.resolved ? (task.resolvedAction === "拒绝" ? "bg-[#1D1D1F] text-white" : "bg-black/[0.03] text-[#AEAEB2]") : "bg-black/[0.04] text-[#8E8E93]"}`} style={task.resolved && task.resolvedAction === "拒绝" ? { boxShadow: "0 1px 6px rgba(0,0,0,0.1)" } : {}} whileTap={!task.resolved ? { scale: 0.97 } : {}} onClick={() => !task.resolved && handleResolve(task.id, "拒绝")}>{task.resolved && task.resolvedAction === "拒绝" ? "已拒绝" : "拒绝"}</motion.button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  /* ── Check if prev item is same-role agent msg (for avatar grouping) ── */
  const shouldShowAvatar = (idx: number): boolean => {
    if (idx === 0) return true;
    const cur = timeline[idx];
    const prev = timeline[idx - 1];
    if (cur.kind === "msg" && cur.role === "agent") {
      if (prev.kind === "msg" && prev.role === "agent") return false;
    }
    if (cur.kind === "task") {
      if (prev.kind === "msg" && prev.role === "agent") return false;
      if (prev.kind === "task") return false;
    }
    return true;
  };

  return (
    <div className="flex flex-col h-screen bg-[#F5F5F7]">
      {/* ── Fixed Top: Agent Header ── */}
      <div className="sticky top-0 z-30 flex-shrink-0" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.78) 100%)", backdropFilter: "blur(40px) saturate(180%)", WebkitBackdropFilter: "blur(40px) saturate(180%)" }}>
        <div className="h-14" />
        {/* Row 1: Avatar + Name + Engine Status | Alignment Ring */}
        <div className="px-5 flex items-center gap-3 pb-3">
          <div className="w-10 h-10 rounded-full bg-[#1D1D1F] flex items-center justify-center flex-shrink-0" style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
            <span className="text-[13px] font-bold text-white tracking-tight">A.</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[16px] font-semibold text-[#1D1D1F] tracking-tight leading-tight">我的经纪人</p>
            {/* Engine status as clickable inline */}
            <div className="relative inline-block">
              <motion.button className="flex items-center gap-1.5 mt-0.5" whileTap={{ scale: 0.97 }} onClick={() => setEngineMenuOpen(!engineMenuOpen)}>
                <div className="w-[5px] h-[5px] rounded-full" style={{ backgroundColor: engine.color }} />
                <span className="text-[11px] text-[#6E6E73]">{engine.label}</span>
                <motion.svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="2.5" animate={{ rotate: engineMenuOpen ? 180 : 0 }} transition={{ duration: 0.2 }}><path d="m6 9 6 6 6-6"/></motion.svg>
              </motion.button>
              <AnimatePresence>
                {engineMenuOpen && (
                  <>
                    <motion.div className="fixed inset-0 z-40" onClick={() => setEngineMenuOpen(false)} />
                    <motion.div className="absolute left-0 top-[24px] z-50 min-w-[140px] rounded-2xl overflow-hidden py-1" style={{ background: "rgba(255,255,255,0.88)", backdropFilter: "blur(40px) saturate(180%)", WebkitBackdropFilter: "blur(40px) saturate(180%)", boxShadow: "0 4px 24px rgba(0,0,0,0.1), inset 0 0 0 0.5px rgba(255,255,255,0.5)" }} initial={{ opacity: 0, scale: 0.9, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: -4 }} transition={{ duration: 0.18 }}>
                      {engineStates.map((s, i) => (
                        <motion.button key={s.key} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left" whileTap={{ backgroundColor: "rgba(0,0,0,0.04)" }} onClick={() => { setEngineIdx(i); setEngineMenuOpen(false); }}>
                          <div className="w-[6px] h-[6px] rounded-full" style={{ backgroundColor: s.key === "active" ? "#32D74B" : s.key === "passive" ? "#FF9F0A" : "#8E8E93" }} />
                          <span className={`text-[13px] ${engineIdx === i ? "font-semibold text-[#1D1D1F]" : "text-[#8E8E93]"}`}>{s.label}</span>
                          {engineIdx === i && <svg className="ml-auto" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1D1D1F" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"/></svg>}
                        </motion.button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
          {/* Right: Compact alignment ring */}
          <div className="flex-shrink-0 flex flex-col items-center gap-0.5">
            <div className="relative w-[44px] h-[44px]">
              <svg width="44" height="44" viewBox="0 0 44 44">
                <circle cx="22" cy="22" r="19" fill="none" stroke="rgba(0,0,0,0.04)" strokeWidth="2.5" />
                <defs><clipPath id="miniCircleClip"><circle cx="22" cy="22" r="18" /></clipPath></defs>
                <g clipPath="url(#miniCircleClip)">
                  <motion.rect x="0" width="44" height="44" fill="rgba(50,215,75,0.15)" initial={{ y: 44 }} animate={{ y: 44 - (matchRate / 100) * 44 }} transition={{ duration: 1.5, ease: "easeOut" }} />
                  <motion.path d="M0,0 Q5,-3 11,0 T22,0 T33,0 T44,0 V44 H0 Z" fill="rgba(50,215,75,0.12)" initial={{ y: 44 }} animate={{ y: 44 - (matchRate / 100) * 44 - 2, x: [0, -11, 0] }} transition={{ y: { duration: 1.5, ease: "easeOut" }, x: { duration: 3, repeat: Infinity, ease: "easeInOut" } }} />
                </g>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[12px] font-bold text-[#1D1D1F]" style={{ fontFeatureSettings: "'tnum'" }}>{matchRate}%</span>
              </div>
            </div>
            <span className="text-[9px] text-[#8E8E93]">对齐度</span>
          </div>
        </div>
        <div className="h-[1px] bg-gradient-to-r from-transparent via-black/[0.06] to-transparent" />
        {/* Fixed pending indicator */}
        <AnimatePresence>
          {pendingTasks.length > 0 && (
            <motion.div key="pending" className="flex items-center gap-2.5 px-5 py-2.5 cursor-pointer" style={{ background: "rgba(255,255,255,0.6)" }} whileTap={{ backgroundColor: "rgba(0,0,0,0.02)" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { const first = pendingTasks[0]; taskRefs.current[first?.id]?.scrollIntoView({ behavior: "smooth", block: "center" }); }}>
              <div className="relative flex-shrink-0">
                <motion.div className="w-[22px] h-[22px] rounded-full bg-[#FF3B30] flex items-center justify-center" animate={{ scale: [1, 1.12, 1], opacity: [1, 0.85, 1] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
                  <span className="text-[11px] font-bold text-white">{pendingTasks.length}</span>
                </motion.div>
              </div>
              <span className="text-[13px] font-semibold text-[#1D1D1F]">项待处理</span>
              <div className="flex-1 min-w-0 overflow-hidden h-[16px]">
                <AnimatePresence mode="wait">
                  <motion.p key={pendingTasks[pendingScrollIdx % pendingTasks.length]?.id} className="text-[11px] text-[#8E8E93] truncate leading-[16px]" initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -14, opacity: 0 }} transition={{ duration: 0.35 }}>{pendingTasks[pendingScrollIdx % pendingTasks.length]?.company}{typeConfig[pendingTasks[pendingScrollIdx % pendingTasks.length]?.type]?.badge}需要您处理</motion.p>
                </AnimatePresence>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#AEAEB2" strokeWidth="2" className="flex-shrink-0"><path d="m6 9 6 6 6-6"/></svg>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Scrollable Chat Timeline ── */}
      <div className="flex-1 overflow-y-auto pb-[140px]">
        <div className="px-4 pt-4 space-y-2">
          {timeline.map((item, idx) => {
            /* ── Time Separator ── */
            if (item.kind === "time") {
              return (
                <div key={item.id} className="flex items-center gap-3 py-3">
                  <div className="flex-1 h-px bg-black/[0.06]" />
                  <span className="text-[11px] text-[#C7C7CC] font-medium">{item.text}</span>
                  <div className="flex-1 h-px bg-black/[0.06]" />
                </div>
              );
            }

            /* ── Agent Message ── */
            if (item.kind === "msg" && item.role === "agent") {
              const showAv = shouldShowAvatar(idx);
              return (
                <motion.div key={item.id} className="flex items-start gap-2" initial={item.id >= 0 ? { opacity: 0, y: 8 } : false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                  {showAv ? <AgentAvatar /> : <div className="w-7 flex-shrink-0" />}
                  <div className="rounded-2xl rounded-tl-md px-3.5 py-2.5 max-w-[82%]" style={{ background: "rgba(255,255,255,0.8)", boxShadow: "0 1px 4px rgba(0,0,0,0.03)" }}>
                    <p className="text-[14px] text-[#1D1D1F] leading-relaxed">{item.text}</p>
                  </div>
                </motion.div>
              );
            }

            /* ── User Message ── */
            if (item.kind === "msg" && item.role === "user") {
              return (
                <motion.div key={item.id} className="flex justify-end" initial={item.id >= 0 ? { opacity: 0, y: 8 } : false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                  <div className="bg-[#1D1D1F] rounded-2xl rounded-tr-md px-3.5 py-2.5 max-w-[78%]">
                    <p className="text-[14px] text-white leading-relaxed">{item.text}</p>
                  </div>
                </motion.div>
              );
            }

            /* ── Task Card (agent-sent) ── */
            if (item.kind === "task") {
              const task = inboxTasks.find(t => t.id === item.taskId);
              if (!task) return null;
              const showAv = shouldShowAvatar(idx);
              return (
                <div key={item.id} className="flex items-start gap-2">
                  {showAv ? <AgentAvatar /> : <div className="w-7 flex-shrink-0" />}
                  <div className="flex-1 max-w-[88%]">
                    {renderTaskCard(task)}
                  </div>
                </div>
              );
            }

            return null;
          })}

          {/* Typing indicator */}
          {chatTyping && (
            <div className="flex items-start gap-2">
              <AgentAvatar />
              <div className="rounded-2xl rounded-tl-md px-3.5 py-2.5" style={{ background: "rgba(255,255,255,0.8)" }}>
                <div className="flex gap-1 items-center h-[20px]">
                  <motion.div className="w-1.5 h-1.5 bg-[#AEAEB2] rounded-full" animate={{ y: [0, -3, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
                  <motion.div className="w-1.5 h-1.5 bg-[#AEAEB2] rounded-full" animate={{ y: [0, -3, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }} />
                  <motion.div className="w-1.5 h-1.5 bg-[#AEAEB2] rounded-full" animate={{ y: [0, -3, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }} />
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* ── Fixed Bottom Input ── */}
      <div className="fixed bottom-[68px] left-1/2 -translate-x-1/2 w-[430px] z-30" style={{ background: "linear-gradient(to top, #F5F5F7 80%, transparent)" }}>
        <div className="px-5 pb-3 pt-3">
          <div className="flex items-end gap-2.5">
            <div className="flex-1 flex items-end rounded-2xl px-4 py-2.5" style={{ background: "rgba(255,255,255,0.8)", boxShadow: "0 1px 8px rgba(0,0,0,0.04), inset 0 0 0 0.5px rgba(0,0,0,0.04)", minHeight: "42px" }}>
              <input type="text" placeholder="给经纪人说点什么..." className="flex-1 text-[15px] text-[#1D1D1F] placeholder-[#AEAEB2] bg-transparent outline-none leading-[1.4]" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === "Enter" && chatInput.trim() && handleSendChat()} />
            </div>
            <AnimatePresence mode="wait">
              {chatInput.trim() ? (
                <motion.button key="send" className="flex-shrink-0 w-[38px] h-[38px] rounded-full bg-[#1D1D1F] flex items-center justify-center" style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.12)" }} initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} transition={{ type: "spring", stiffness: 400, damping: 20 }} whileTap={{ scale: 0.85 }} onClick={handleSendChat}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M12 19V5" /><path d="m5 12 7-7 7 7" /></svg>
                </motion.button>
              ) : (
                <motion.button key="voice" className="flex-shrink-0 w-[38px] h-[38px] rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.04)" }} initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} transition={{ type: "spring", stiffness: 400, damping: 20 }} whileTap={{ scale: 0.85, backgroundColor: "rgba(0,0,0,0.08)" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ Tab 1: Recommended Jobs ============ */
function RecommendedJobsFeed({ jobs: initialJobs, onNavigateToChat }: { jobs: RecommendedJob[]; onNavigateToChat: (jobId: number) => void }) {
  const router = useRouter();
  type FilterKey = "NEW" | "PROGRESSING" | "ENDED";
  const [filter, setFilter] = useState<FilterKey>("NEW");
  const [jobs, setJobs] = useState(initialJobs);
  const [selectedJob, setSelectedJob] = useState<RecommendedJob | null>(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackReason, setFeedbackReason] = useState<string | null>(null);
  const [feedbackCustom, setFeedbackCustom] = useState("");

  // Intent params (migrated from overview)
  const [intentExpand, setIntentExpand] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
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
  const startEdit = (category: string, label: string, currentValue: string) => { setEditingKey(`${category}:${label}`); setEditValue(currentValue); };
  const confirmEdit = (category: string, label: string) => {
    if (category === "core") setCoreIntent(editValue);
    else if (category === "hard") setHardReqs(prev => prev.map(r => r.label === label ? { ...r, value: editValue } : r));
    else setSoftReqs(prev => prev.map(r => r.label === label ? { ...r, value: editValue } : r));
    setEditingKey(null);
  };

  const newJobs = jobs.filter(j => j.status === "new");
  const progressingJobs = jobs.filter(j => j.status === "progressing");
  const endedJobs = jobs.filter(j => j.status === "ended");
  const filtered = filter === "NEW" ? newJobs : filter === "PROGRESSING" ? progressingJobs : endedJobs;
  const filters: { key: FilterKey; label: string; count: number }[] = [
    { key: "NEW", label: "新机会", count: newJobs.length },
    { key: "PROGRESSING", label: "推进中", count: progressingJobs.length },
    { key: "ENDED", label: "已结束", count: endedJobs.length },
  ];

  const handleProgress = (id: number) => {
    setJobs(prev => prev.map(j => j.id === id ? { ...j, status: "progressing" as JobStatus, viewed: true } : j));
  };
  const handleEnd = (id: number, reason?: string) => {
    setJobs(prev => prev.map(j => j.id === id ? { ...j, status: "ended" as JobStatus, viewed: true, endReason: reason || "你选择了不合适", endBy: "user" as const } : j));
  };
  const handleView = (job: RecommendedJob) => {
    if (!job.viewed) {
      setJobs(prev => prev.map(j => j.id === job.id ? { ...j, viewed: true } : j));
    }
    setSelectedJob({ ...job, viewed: true });
  };

  // Job detail sheet

  // Job detail sheet
  if (selectedJob) {
    return (
      <div className="fixed inset-0 z-50 bg-[#F5F5F7] flex flex-col" style={{ maxWidth: 430, margin: "0 auto" }}>
        <div className="sticky top-0 z-30 flex-shrink-0" style={{ background: "rgba(255,255,255,0.88)", backdropFilter: "blur(40px) saturate(180%)", WebkitBackdropFilter: "blur(40px) saturate(180%)" }}>
          <div className="h-14" />
          {/* 返回按钮 */}
          <div className="px-5 pb-2">
            <motion.button className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.04)" }} whileTap={{ scale: 0.9 }} onClick={() => setSelectedJob(null)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1D1D1F" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
            </motion.button>
          </div>
          {/* 岗位 + 推荐等级 */}
          <div className="px-5 pb-1 flex items-center justify-between">
            <p className="text-[20px] font-bold text-[#1D1D1F] tracking-tight">{selectedJob.position}</p>
            {(() => { const lv = selectedJob.aiScore >= 90 ? { label: "强烈推荐", color: "#FF3B30", bg: "rgba(255,59,48,0.08)" } : selectedJob.aiScore >= 80 ? { label: "推荐", color: "#FF9F0A", bg: "rgba(255,159,10,0.08)" } : null; return lv ? <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold flex-shrink-0" style={{ color: lv.color, backgroundColor: lv.bg }}>{lv.label}</span> : null; })()}
          </div>
          {/* 公司 · 薪资 */}
          <div className="px-5 pb-3 flex items-center gap-1.5">
            <p className="text-[13px] text-[#8E8E93]">{selectedJob.company} · {selectedJob.team}</p>
            <span className="text-[13px] text-[#8E8E93]">·</span>
            <span className="text-[15px] font-semibold text-[#1D1D1F]">{selectedJob.salary}</span>
          </div>
          <div className="h-[1px] bg-gradient-to-r from-transparent via-black/[0.06] to-transparent" />
        </div>

        <div className="flex-1 overflow-y-auto px-5 pt-4 pb-32 space-y-3">

          {/* 经纪人工作摘要 */}
          <div className="flex items-center gap-3 px-1 pb-1">
            <div className="flex items-center gap-1.5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#AEAEB2" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <span className="text-[12px] text-[#AEAEB2]">沟通 {selectedJob.chatRounds} 轮</span>
            </div>
            <div className="w-[3px] h-[3px] rounded-full bg-[#D1D1D6]" />
            <span className="text-[12px] text-[#AEAEB2]">耗时 {selectedJob.timeSpent}</span>
            <div className="w-[3px] h-[3px] rounded-full bg-[#D1D1D6]" />
            <span className="text-[12px] text-[#AEAEB2]">最近 {selectedJob.discoveredAt}</span>
          </div>

          {/* AI 推荐分析 - 结构化 */}
          <div className="rounded-2xl px-4 py-4" style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(20px)", boxShadow: "0 1px 8px rgba(0,0,0,0.04), inset 0 0 0 0.5px rgba(255,255,255,0.5)" }}>
            <div className="flex items-center gap-2 mb-3">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="2"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.287 1.288L3 12l5.8 1.9a2 2 0 0 1 1.288 1.287L12 21l1.9-5.8a2 2 0 0 1 1.287-1.288L21 12l-5.8-1.9a2 2 0 0 1-1.288-1.287Z" /></svg>
              <span className="text-[13px] font-semibold text-[#1D1D1F]">AI 推荐分析</span>
            </div>
            {/* 一句话总结 */}
            <p className="text-[15px] font-semibold text-[#1D1D1F] leading-[1.5] mb-3">{selectedJob.aiAnalysis.summary}</p>
            {/* 推荐理由 */}
            <div className="space-y-2 mb-3">
              {selectedJob.aiAnalysis.points.map((p, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="w-[18px] h-[18px] rounded-full bg-[#32D74B]/10 flex items-center justify-center flex-shrink-0 mt-[1px]">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#32D74B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <p className="text-[13px] text-[#1D1D1F]/70 leading-[1.6]">{p}</p>
                </div>
              ))}
            </div>
            {/* 注意事项 */}
            {selectedJob.aiAnalysis.notes.length > 0 && (
              <div className="space-y-2 pt-2.5" style={{ borderTop: "0.5px solid rgba(0,0,0,0.06)" }}>
                {selectedJob.aiAnalysis.notes.map((n, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="w-[18px] h-[18px] rounded-full bg-[#FF9500]/10 flex items-center justify-center flex-shrink-0 mt-[1px]">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#FF9500" strokeWidth="3" strokeLinecap="round"><path d="M12 9v4"/><circle cx="12" cy="17" r="0.5" fill="#FF9500"/></svg>
                    </div>
                    <p className="text-[13px] text-[#8E8E93] leading-[1.6]">{n}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 岗位描述 + 岗位要求 */}
          <div className="rounded-2xl px-4 py-4" style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(20px)", boxShadow: "0 1px 8px rgba(0,0,0,0.04), inset 0 0 0 0.5px rgba(255,255,255,0.5)" }}>
            <p className="text-[13px] font-semibold text-[#1D1D1F] mb-2">岗位描述</p>
            <p className="text-[14px] text-[#1D1D1F]/70 leading-[1.6] mb-3">{selectedJob.jdSummary}</p>
            <p className="text-[13px] font-semibold text-[#1D1D1F] mb-2">岗位要求</p>
            <div className="space-y-1.5">
              {selectedJob.requirements.map((r, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-[5px] h-[5px] rounded-full bg-[#8E8E93] mt-[7px] flex-shrink-0" />
                  <p className="text-[13px] text-[#1D1D1F]/70 leading-[1.5]">{r}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 公司主页入口 */}
          <motion.div className="rounded-2xl px-4 py-3.5 flex items-center justify-between cursor-pointer" style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(20px)", boxShadow: "0 1px 8px rgba(0,0,0,0.04), inset 0 0 0 0.5px rgba(255,255,255,0.5)" }} whileTap={{ scale: 0.98 }}>
            <div className="flex items-center gap-3">
              <div className="w-[36px] h-[36px] rounded-xl bg-[#F5F5F7] flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              </div>
              <div>
                <p className="text-[14px] font-medium text-[#1D1D1F]">{selectedJob.company}</p>
                <p className="text-[11px] text-[#8E8E93]">{selectedJob.team} · {selectedJob.location}</p>
              </div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#AEAEB2" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
          </motion.div>
        </div>

        {/* Bottom action */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[430px] px-5 pb-8 pt-3 z-30" style={{ background: "linear-gradient(to top, #F5F5F7 70%, transparent)" }}>
          {selectedJob.status === "new" && (
            <div className="flex gap-2.5">
              <motion.button className="h-[48px] px-5 rounded-2xl text-[15px] font-medium text-[#8E8E93] flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.04)" }} whileTap={{ scale: 0.97 }} onClick={() => setFeedbackOpen(true)}>
                不合适
              </motion.button>
              <motion.button className="flex-1 h-[48px] rounded-2xl bg-[#1D1D1F] text-white text-[15px] font-semibold flex items-center justify-center gap-2" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.12)" }} whileTap={{ scale: 0.97 }} onClick={() => { handleProgress(selectedJob.id); setSelectedJob(null); onNavigateToChat(selectedJob.id); }}>
                继续推进
              </motion.button>
            </div>
          )}
          {selectedJob.status === "progressing" && (
            <div className="flex gap-2.5">
              <motion.button className="h-[48px] px-5 rounded-2xl text-[15px] font-medium text-[#8E8E93] flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.04)" }} whileTap={{ scale: 0.97 }} onClick={() => { handleEnd(selectedJob.id, "你选择了结束推进"); setSelectedJob(null); }}>
                结束
              </motion.button>
              <motion.button className="flex-1 h-[48px] rounded-2xl bg-[#1D1D1F] text-white text-[15px] font-semibold flex items-center justify-center gap-2" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.12)" }} whileTap={{ scale: 0.97 }} onClick={() => { handleProgress(selectedJob.id); setSelectedJob(null); onNavigateToChat(selectedJob.id); }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                接管对话
              </motion.button>
            </div>
          )}
          {selectedJob.status === "ended" && (
            <div className="space-y-2 py-2">
              <p className="text-[13px] text-[#AEAEB2] text-center">{selectedJob.endReason || "该机会已结束"}</p>
              <motion.button className="w-full h-[48px] rounded-2xl text-[15px] font-medium text-[#007AFF] flex items-center justify-center" style={{ backgroundColor: "rgba(0,122,255,0.06)" }} whileTap={{ scale: 0.97 }} onClick={() => { handleProgress(selectedJob.id); setSelectedJob({ ...selectedJob, status: "progressing" as JobStatus }); }}>
                重新推进
              </motion.button>
            </div>
          )}
        </div>

        {/* 不合适原因反馈 Bottom Sheet */}
        <AnimatePresence>
          {feedbackOpen && (
            <>
              <motion.div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setFeedbackOpen(false); setFeedbackReason(null); setFeedbackCustom(""); }} />
              <motion.div className="fixed bottom-0 left-1/2 z-50 w-[430px]" style={{ x: "-50%" }} initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", stiffness: 380, damping: 36 }}>
                <div className="bg-[#F8F8FA] rounded-t-[24px] overflow-hidden" style={{ boxShadow: "0 -8px 50px rgba(0,0,0,0.12)" }}>
                  <div className="flex justify-center pt-3 pb-1"><div className="w-9 h-[4px] rounded-full bg-black/10" /></div>
                  <div className="px-5 pt-2 pb-3">
                    <p className="text-[18px] font-semibold text-[#1D1D1F] tracking-tight">选择不合适的原因</p>
                    <p className="text-[12px] text-[#86868B] mt-0.5">反馈给经纪人，帮助优化后续推荐</p>
                  </div>
                  <div className="px-5 pb-4 space-y-2">
                    {["薪资不符合预期", "地理位置不合适", "岗位方向不匹配", "公司/团队不感兴趣", "其他原因"].map(reason => (
                      <motion.button key={reason} className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-left" style={{ background: feedbackReason === reason ? "rgba(0,122,255,0.06)" : "rgba(255,255,255,0.75)", boxShadow: feedbackReason === reason ? "inset 0 0 0 1.5px rgba(0,122,255,0.3)" : "0 1px 4px rgba(0,0,0,0.03), inset 0 0 0 0.5px rgba(255,255,255,0.5)" }} whileTap={{ scale: 0.98 }} onClick={() => setFeedbackReason(reason)}>
                        <span className={`text-[14px] ${feedbackReason === reason ? "text-[#007AFF] font-medium" : "text-[#1D1D1F]"}`}>{reason}</span>
                        {feedbackReason === reason && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#007AFF" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"/></svg>}
                      </motion.button>
                    ))}
                    {feedbackReason === "其他原因" && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="overflow-hidden">
                        <input type="text" placeholder="请输入具体原因..." className="w-full px-4 py-3 rounded-2xl text-[14px] text-[#1D1D1F] placeholder-[#AEAEB2] bg-white outline-none" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.03), inset 0 0 0 0.5px rgba(0,0,0,0.04)" }} value={feedbackCustom} onChange={e => setFeedbackCustom(e.target.value)} autoFocus />
                      </motion.div>
                    )}
                  </div>
                  <div className="px-5 pt-2 pb-8">
                    <motion.button className={`w-full h-[50px] rounded-2xl text-[15px] font-semibold flex items-center justify-center gap-2 ${feedbackReason ? "bg-[#1D1D1F] text-white" : "bg-black/[0.04] text-[#AEAEB2]"}`} style={feedbackReason ? { boxShadow: "0 2px 12px rgba(0,0,0,0.12)" } : {}} whileTap={feedbackReason ? { scale: 0.97 } : {}} onClick={() => { if (!feedbackReason) return; const reason = feedbackReason === "其他原因" && feedbackCustom.trim() ? feedbackCustom : feedbackReason; handleEnd(selectedJob.id, reason); setFeedbackOpen(false); setFeedbackReason(null); setFeedbackCustom(""); setSelectedJob(null); }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={feedbackReason ? "white" : "#AEAEB2"} strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                      反馈给经纪人
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Job list
  return (
    <div className="flex flex-col h-screen bg-[#F5F5F7]">
      <div className="sticky top-0 z-30 flex-shrink-0" style={{ background: "rgba(255,255,255,0.88)", backdropFilter: "blur(40px) saturate(180%)", WebkitBackdropFilter: "blur(40px) saturate(180%)" }}>
        <div className="h-14" />
        <div className="px-5 pb-3">
          {/* Title + gear icon */}
          <div className="flex items-center justify-between mb-2.5">
            <div>
              <h1 className="text-[22px] font-semibold text-[#1D1D1F] tracking-tight">推荐机会</h1>
              <p className="text-[12px] text-[#8E8E93] mt-0.5">浏览 <MiniCounter target={1247} /> · 沟通 <MiniCounter target={24} /> · 拦截 <MiniCounter target={86} /></p>
            </div>
            <motion.button className="w-[32px] h-[32px] rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.03)" }} whileTap={{ scale: 0.9 }} onClick={() => setIntentExpand(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="1.8"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
            </motion.button>
          </div>
          {/* Filters */}
          <div className="flex items-center gap-1.5">
            {filters.map(f => (
              <motion.button key={f.key} className={`flex items-center justify-center gap-1.5 h-[32px] px-4 rounded-full text-[12px] font-medium transition-all ${filter === f.key ? "bg-[#1D1D1F] text-white" : "text-[#8E8E93]"}`} style={filter !== f.key ? { backgroundColor: "rgba(0,0,0,0.03)" } : {}} whileTap={{ scale: 0.96 }} onClick={() => setFilter(f.key)}>
                <span>{f.label}</span>
                <span className={`text-[10px] ${filter === f.key ? "text-white/50" : "text-[#AEAEB2]"}`}>{f.count}</span>
              </motion.button>
            ))}
          </div>
        </div>
        <div className="h-[1px] bg-gradient-to-r from-transparent via-black/[0.06] to-transparent" />
      </div>

      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-24 space-y-3">
        {filtered.map(job => {
          const level = (job.status === "ended" && job.endBy === "ai")
            ? null
            : job.aiScore >= 90 ? { label: "强烈推荐", color: "#FF3B30", bg: "rgba(255,59,48,0.08)" }
            : job.aiScore >= 80 ? { label: "推荐", color: "#FF9F0A", bg: "rgba(255,159,10,0.08)" }
            : null;
          return (
          <motion.div key={job.id} className={`rounded-2xl overflow-hidden cursor-pointer ${job.status === "ended" ? "opacity-60" : ""}`} style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(20px) saturate(180%)", boxShadow: "0 1px 8px rgba(0,0,0,0.04), inset 0 0 0 0.5px rgba(255,255,255,0.5)" }} layout whileTap={{ scale: 0.98 }} onClick={() => handleView(job)}>
            <div className="px-4 py-4">
              {/* 第一行：岗位名称 + 推荐等级 */}
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {job.status === "new" && !job.viewed && (
                    <div className="w-[8px] h-[8px] rounded-full bg-[#FF3B30] flex-shrink-0" />
                  )}
                  <p className={`text-[17px] font-semibold tracking-tight truncate ${job.status === "ended" ? "text-[#8E8E93]" : "text-[#1D1D1F]"}`}>{job.position}</p>
                </div>
                {level && <span className="flex-shrink-0 ml-3 px-2.5 py-1 rounded-full text-[11px] font-semibold" style={{ color: level.color, backgroundColor: level.bg }}>{level.label}</span>}
              </div>
              {/* 第二行：公司 · 薪资 · 地点 */}
              <div className="flex items-center gap-1.5 mb-2.5">
                <p className="text-[14px] text-[#8E8E93]">{job.company} · {job.salary} · {job.location}</p>
                <span className="text-[11px] text-[#AEAEB2]">· 沟通{job.chatRounds}轮 · {job.discoveredAt}</span>
              </div>
              {/* 第三行：推荐理由 */}
              <p className="text-[14px] leading-[1.6] mb-3 text-[#1D1D1F]/65">{job.aiAnalysis.summary}</p>
              {/* 第四行：关键标签 */}
              {job.aiTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {job.aiTags.map(tag => (
                    <span key={tag.label} className="text-[11px] font-medium px-2 py-0.5 rounded-md" style={{ color: tag.type === "negative" ? "#8E8E93" : "#FF9500", backgroundColor: tag.type === "negative" ? "rgba(0,0,0,0.04)" : "rgba(255,149,0,0.08)" }}>{tag.label}</span>
                  ))}
                </div>
              )}
              {job.status === "ended" && job.endReason && (
                <p className="text-[12px] text-[#AEAEB2] mt-2">{job.endReason}</p>
              )}
            </div>
          </motion.div>
          );
        })}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center py-16"><p className="text-[14px] text-[#AEAEB2]">暂无相关机会</p></div>
        )}
      </div>

      {/* 意图参数 Bottom Sheet */}
      <AnimatePresence>
        {intentExpand && (
          <>
            <motion.div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setIntentExpand(false); setEditingKey(null); }} />
            <motion.div className="fixed bottom-0 left-1/2 z-50 w-[430px]" style={{ x: "-50%" }} initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", stiffness: 380, damping: 36 }}>
              <div className="bg-[#F8F8FA] rounded-t-[24px] overflow-hidden max-h-[80vh] flex flex-col" style={{ boxShadow: "0 -8px 50px rgba(0,0,0,0.12)" }}>
                <div className="flex justify-center pt-3 pb-1"><div className="w-9 h-[4px] rounded-full bg-black/10" /></div>
                <div className="px-5 pt-2 pb-3">
                  <p className="text-[18px] font-semibold text-[#1D1D1F] tracking-tight">意图参数</p>
                  <p className="text-[12px] text-[#86868B] mt-0.5">经纪人按这些条件为你筛选机会</p>
                </div>
                <div className="flex-1 overflow-y-auto px-5 pb-8 space-y-4">
                  {/* 核心意图 */}
                  <div>
                    <p className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-2">核心意图</p>
                    <div className="rounded-2xl px-4 py-3" style={{ background: "rgba(255,255,255,0.75)", boxShadow: "0 1px 4px rgba(0,0,0,0.03), inset 0 0 0 0.5px rgba(255,255,255,0.5)" }}>
                      {editingKey === "core:核心意图" ? (
                        <div className="flex items-center gap-2">
                          <input className="flex-1 text-[14px] text-[#1D1D1F] bg-transparent outline-none" value={editValue} onChange={e => setEditValue(e.target.value)} autoFocus />
                          <motion.button className="text-[12px] text-[#007AFF] font-medium" whileTap={{ scale: 0.95 }} onClick={() => confirmEdit("core", "核心意图")}>保存</motion.button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between cursor-pointer" onClick={() => startEdit("core", "核心意图", coreIntent)}>
                          <p className="text-[14px] text-[#1D1D1F] leading-[1.5]">{coreIntent}</p>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#AEAEB2" strokeWidth="2" className="flex-shrink-0 ml-2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* 确定要求 */}
                  <div>
                    <p className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-2">确定要求</p>
                    <div className="space-y-1.5">
                      {hardReqs.map(r => (
                        <div key={r.label} className="rounded-2xl px-4 py-3 flex items-center justify-between" style={{ background: "rgba(255,255,255,0.75)", boxShadow: "0 1px 4px rgba(0,0,0,0.03), inset 0 0 0 0.5px rgba(255,255,255,0.5)" }}>
                          {editingKey === `hard:${r.label}` ? (
                            <div className="flex items-center gap-2 w-full">
                              <span className="text-[12px] text-[#8E8E93] flex-shrink-0 w-16">{r.label}</span>
                              <input className="flex-1 text-[14px] text-[#1D1D1F] bg-transparent outline-none" value={editValue} onChange={e => setEditValue(e.target.value)} autoFocus />
                              <motion.button className="text-[12px] text-[#007AFF] font-medium" whileTap={{ scale: 0.95 }} onClick={() => confirmEdit("hard", r.label)}>保存</motion.button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between w-full cursor-pointer" onClick={() => startEdit("hard", r.label, r.value)}>
                              <div className="flex items-center gap-2">
                                <span className="text-[12px] text-[#8E8E93]">{r.label}</span>
                                <span className="text-[14px] text-[#1D1D1F]">{r.value}</span>
                              </div>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#AEAEB2" strokeWidth="2" className="flex-shrink-0"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* 弹性偏好 */}
                  <div>
                    <p className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-2">弹性偏好</p>
                    <div className="space-y-1.5">
                      {softReqs.map(r => (
                        <div key={r.label} className="rounded-2xl px-4 py-3 flex items-center justify-between" style={{ background: "rgba(255,255,255,0.75)", boxShadow: "0 1px 4px rgba(0,0,0,0.03), inset 0 0 0 0.5px rgba(255,255,255,0.5)" }}>
                          {editingKey === `soft:${r.label}` ? (
                            <div className="flex items-center gap-2 w-full">
                              <span className="text-[12px] text-[#8E8E93] flex-shrink-0 w-16">{r.label}</span>
                              <input className="flex-1 text-[14px] text-[#1D1D1F] bg-transparent outline-none" value={editValue} onChange={e => setEditValue(e.target.value)} autoFocus />
                              <motion.button className="text-[12px] text-[#007AFF] font-medium" whileTap={{ scale: 0.95 }} onClick={() => confirmEdit("soft", r.label)}>保存</motion.button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between w-full cursor-pointer" onClick={() => startEdit("soft", r.label, r.value)}>
                              <div className="flex items-center gap-2">
                                <span className="text-[12px] text-[#8E8E93]">{r.label}</span>
                                <span className="text-[14px] text-[#1D1D1F]">{r.value}</span>
                              </div>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#AEAEB2" strokeWidth="2" className="flex-shrink-0"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ============ Tab 2: Messages ============ */
function MessageListPage({ threads }: { threads: ChatThread[] }) {
  const router = useRouter();

  return (
    <div className="flex flex-col h-screen bg-[#F5F5F7]">
      <div className="sticky top-0 z-30 flex-shrink-0" style={{ background: "rgba(255,255,255,0.88)", backdropFilter: "blur(40px) saturate(180%)", WebkitBackdropFilter: "blur(40px) saturate(180%)" }}>
        <div className="h-14" />
        <div className="px-5 pb-3">
          <h1 className="text-[22px] font-semibold text-[#1D1D1F] tracking-tight">沟通</h1>
        </div>
        <div className="h-[1px] bg-gradient-to-r from-transparent via-black/[0.06] to-transparent" />
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
        {threads.map((thread, i) => {
          const isEnded = thread.status === "ended";
          const showAgentTag = thread.status === "agent_handling";
          return (
            <motion.button key={thread.id} className={`w-full flex items-center gap-3.5 px-5 py-3.5 text-left ${i < threads.length - 1 ? "border-b border-black/[0.04]" : ""}`} style={{ opacity: isEnded ? 0.45 : 1 }} whileTap={{ backgroundColor: "rgba(0,0,0,0.02)" }} onClick={() => router.push(`/dashboard/chat/${thread.id}`)}>
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <img src={thread.avatar} alt="" className="w-[48px] h-[48px] rounded-2xl object-cover" style={{ filter: isEnded ? "grayscale(1) opacity(0.6)" : "none" }} />
                {thread.status === "need_reply" && thread.hasHumanMessage && (
                  <div className="absolute -top-0.5 -right-0.5 w-[12px] h-[12px] rounded-full bg-[#FF3B30] border-2 border-[#F5F5F7]" />
                )}
                {thread.status === "need_reply" && !thread.hasHumanMessage && (
                  <div className="absolute -top-0.5 -right-0.5 w-[12px] h-[12px] rounded-full bg-[#FF9500] border-2 border-[#F5F5F7]" />
                )}
              </div>
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <p className="text-[15px] font-semibold text-[#1D1D1F] tracking-tight truncate">{thread.company}</p>
                    {showAgentTag && <span className="text-[10px] font-medium text-[#AEAEB2] px-1.5 py-0.5 rounded-md flex-shrink-0 bg-black/[0.03]">代理沟通</span>}
                  </div>
                  <span className="text-[11px] text-[#AEAEB2] flex-shrink-0 ml-2">{thread.lastTime}</span>
                </div>
                <p className="text-[12px] text-[#8E8E93] mb-0.5">{thread.team}</p>
                <div className="flex items-center justify-between">
                  <p className="text-[13px] text-[#8E8E93] truncate flex-1">{thread.agentNote}</p>
                  {thread.unread > 0 && thread.hasHumanMessage && (
                    <span className="flex-shrink-0 ml-2 min-w-[18px] h-[18px] bg-[#FF3B30] rounded-full text-[10px] text-white font-medium flex items-center justify-center px-1">{thread.unread}</span>
                  )}
                </div>
              </div>
            </motion.button>
          );
        })}
        {threads.length === 0 && (
          <div className="flex flex-col items-center py-20"><p className="text-[14px] text-[#AEAEB2]">暂无消息</p></div>
        )}
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
  const [animStep, setAnimStep] = useState(0);
  const [showCTA, setShowCTA] = useState(false);
  const ctaTriggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timers = [
      setTimeout(() => setAnimStep(1), 400),
      setTimeout(() => setAnimStep(2), 900),
      setTimeout(() => setAnimStep(3), 1500),
      setTimeout(() => setAnimStep(4), 2200),
      setTimeout(() => setAnimStep(5), 3000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    const el = ctaTriggerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => setShowCTA(entry.isIntersecting), { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const demoCity = "深圳";
  const demoRole = "前端开发工程师";
  const simStats = { companies: 2847, browsed: 1203, chatted: 89, recommended: 12 };

  const demoRecommendations = [
    { company: "字节跳动", team: "抖音电商 · 前端架构组", salary: "45-65K", score: 95, reason: "技术栈高度匹配，团队正在扩招，面试通过率高", status: "沟通中" as const },
    { company: "蚂蚁集团", team: "支付宝 · 体验技术部", salary: "40-60K", score: 88, reason: "大厂背景加分，base 匹配，晋升空间大", status: "已推荐" as const },
    { company: "美团", team: "外卖 · C端研发组", salary: "35-55K", score: 82, reason: "业务增长快，技术挑战多，期权激励好", status: "等待回复" as const },
    { company: "小红书", team: "社区 · 前端基础架构", salary: "40-55K", score: 79, reason: "增长迅猛，技术氛围好，年终丰厚", status: "等待回复" as const },
    { company: "拼多多", team: "Temu · 海外电商前端", salary: "50-70K", score: 91, reason: "薪资极具竞争力，海外业务高速增长，技术驱动", status: "沟通中" as const },
  ];

  const statusStyles: Record<string, { bg: string; text: string; dot: string }> = {
    "沟通中": { bg: "rgba(52,199,75,0.08)", text: "#34C759", dot: "#34C759" },
    "已推荐": { bg: "rgba(0,122,255,0.08)", text: "#007AFF", dot: "#007AFF" },
    "等待回复": { bg: "rgba(255,149,0,0.08)", text: "#FF9F0A", dot: "#FF9F0A" },
  };

  const demoChatMessages = [
    { role: "agent" as const, text: "您好，我代表候选人跟您了解一下前端架构师岗位。候选人有 5 年 React + TypeScript 经验，目前在某大厂负责 C 端核心模块。" },
    { role: "hr" as const, text: "背景不错。请问候选人期望薪资和到岗时间？" },
    { role: "agent" as const, text: "期望 45-55K，可以一个月内到岗。另外候选人比较关注技术成长空间和团队氛围，方便介绍一下吗？" },
    { role: "hr" as const, text: "我们团队技术氛围很好，每周有 Tech Talk，鼓励开源贡献。薪资范围可以，我们安排一轮技术面？" },
    { role: "agent" as const, text: "太好了，已帮候选人确认时间。面试安排在本周四下午 2 点，候选人已同意 ✅" },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA]" style={{ paddingBottom: "calc(50vh + 80px)" }}>
      {/* 顶部 header */}
      <div className="sticky top-0 z-30 backdrop-blur-xl bg-white/80 border-b border-gray-100 px-5 pt-14 pb-4">
        <h1 className="text-[22px] font-semibold text-[#1D1D1F]">概览</h1>
      </div>

      {/* 模拟场景头部 */}
      <div className="px-5 pt-5">
        <motion.div
          className="rounded-[20px] overflow-hidden"
          style={{ background: "linear-gradient(135deg, #1D1D1F 0%, #2C2C2E 100%)", boxShadow: "0 4px 24px rgba(0,0,0,0.12)" }}
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        >
          <div className="px-5 pt-5 pb-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.287 1.288L3 12l5.8 1.9a2 2 0 0 1 1.288 1.287L12 21l1.9-5.8a2 2 0 0 1 1.287-1.288L21 12l-5.8-1.9a2 2 0 0 1-1.288-1.287Z" /></svg>
              </div>
              <div>
                <p className="text-[13px] text-white/50">模拟演示</p>
                <p className="text-[15px] font-medium text-white">{demoCity} · {demoRole}</p>
              </div>
            </div>

            {/* 漏斗数据 */}
            <div className="flex items-stretch gap-0">
              {[
                { label: "家企业招聘中", value: simStats.companies, delay: 0.2 },
                { label: "个岗位已浏览", value: simStats.browsed, delay: 0.5 },
                { label: "家已主动沟通", value: simStats.chatted, delay: 0.8 },
                { label: "个值得推荐", value: simStats.recommended, delay: 1.1 },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  className="flex-1 flex flex-col items-center py-2"
                  style={i < 3 ? { borderRight: "1px solid rgba(255,255,255,0.06)" } : {}}
                  initial={{ opacity: 0, y: 10 }}
                  animate={animStep >= 1 ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: item.delay, duration: 0.4 }}
                >
                  <span className="text-[20px] font-bold text-white tracking-tight" style={{ fontFeatureSettings: "'tnum'" }}>
                    {animStep >= 2 ? item.value.toLocaleString() : "—"}
                  </span>
                  <span className="text-[10px] text-white/40 mt-0.5">{item.label}</span>
                </motion.div>
              ))}
            </div>

            {/* 连接线 */}
            <motion.div
              className="flex items-center justify-center gap-1 mt-3"
              initial={{ opacity: 0 }} animate={animStep >= 2 ? { opacity: 1 } : {}} transition={{ delay: 0.3 }}
            >
              {[0,1,2].map(i => (
                <motion.div key={i} className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/15 to-transparent"
                  initial={{ scaleX: 0 }} animate={animStep >= 2 ? { scaleX: 1 } : {}} transition={{ delay: 0.4 + i * 0.15, duration: 0.5 }} />
              ))}
            </motion.div>

            {/* 结论摘要 */}
            <motion.div
              className="mt-4 rounded-xl px-4 py-3"
              style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(10px)" }}
              initial={{ opacity: 0, y: 8 }} animate={animStep >= 3 ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.4 }}
            >
              <p className="text-[12px] text-white/40 mb-1.5">AI 经纪人沟通结论</p>
              <p className="text-[13px] text-white/80 leading-relaxed">
                {demoCity}前端岗位活跃度高，当前有 <span className="text-white font-medium">{simStats.recommended} 个优质机会</span> 值得关注。
                其中字节跳动、蚂蚁集团技术栈匹配度最高，建议优先沟通。
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* AI 推荐岗位 */}
      <div className="px-5 pt-5">
        <motion.p className="text-[11px] font-medium text-[#86868B] uppercase tracking-wider mb-3"
          initial={{ opacity: 0 }} animate={animStep >= 3 ? { opacity: 1 } : {}} transition={{ delay: 0.2 }}>
          AI 已筛选 · {demoRecommendations.length} 个推荐
        </motion.p>
        <div className="space-y-3">
          {demoRecommendations.map((rec, idx) => {
            const ss = statusStyles[rec.status];
            return (
              <motion.div
                key={idx}
                className="bg-white/70 backdrop-blur-xl rounded-[16px] overflow-hidden"
                style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.04), 0 0 0 0.5px rgba(0,0,0,0.04)" }}
                initial={{ opacity: 0, y: 12 }}
                animate={animStep >= 4 ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: idx * 0.12, duration: 0.4 }}
              >
                <div className="px-4 py-3.5">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-[15px] font-semibold text-[#1D1D1F] tracking-tight">{rec.company}</p>
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: "rgba(255,149,10,0.08)" }}>
                          <span className="text-[11px] font-bold text-[#FF9F0A]" style={{ fontFeatureSettings: "'tnum'" }}>TOP {rec.score}</span>
                        </div>
                      </div>
                      <p className="text-[12px] text-[#86868B]">{rec.team}</p>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full flex-shrink-0" style={{ background: ss.bg }}>
                      <div className="w-[5px] h-[5px] rounded-full" style={{ background: ss.dot }} />
                      <span className="text-[11px] font-medium" style={{ color: ss.text }}>{rec.status}</span>
                    </div>
                  </div>
                  <p className="text-[14px] font-medium text-[#1D1D1F] mb-1.5">{rec.salary}</p>
                  <div className="flex items-start gap-1.5">
                    <svg className="w-3 h-3 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="#FF9F0A" strokeWidth="2"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.287 1.288L3 12l5.8 1.9a2 2 0 0 1 1.288 1.287L12 21l1.9-5.8a2 2 0 0 1 1.287-1.288L21 12l-5.8-1.9a2 2 0 0 1-1.288-1.287Z" /></svg>
                    <p className="text-[12px] text-[#86868B] leading-relaxed">{rec.reason}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 模拟对话预览 */}
      <div className="px-5 pt-6">
        <motion.p className="text-[11px] font-medium text-[#86868B] uppercase tracking-wider mb-3"
          initial={{ opacity: 0 }} animate={animStep >= 5 ? { opacity: 1 } : {}} transition={{ delay: 0.1 }}>
          AI 经纪人正在替你谈
        </motion.p>
        <motion.div
          className="rounded-[20px] overflow-hidden"
          style={{ background: "rgba(255,255,255,0.75)", boxShadow: "0 2px 16px rgba(0,0,0,0.04), 0 0 0 0.5px rgba(0,0,0,0.04)" }}
          initial={{ opacity: 0, y: 12 }} animate={animStep >= 5 ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }}
        >
          <div className="px-4 pt-3.5 pb-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-[#1D1D1F] flex items-center justify-center">
                <span className="text-[8px] font-bold text-white">A.</span>
              </div>
              <span className="text-[13px] font-semibold text-[#1D1D1F]">你的经纪人</span>
              <span className="text-[11px] text-[#86868B]">×</span>
              <span className="text-[13px] font-semibold text-[#1D1D1F]">字节跳动 HR</span>
              <div className="flex items-center gap-1 ml-auto px-1.5 py-0.5 rounded-full" style={{ background: "rgba(52,199,89,0.08)" }}>
                <div className="w-[5px] h-[5px] rounded-full bg-[#34C759]" />
                <span className="text-[10px] text-[#34C759] font-medium">进行中</span>
              </div>
            </div>
          </div>
          <div className="px-4 pb-4 space-y-2.5">
            {demoChatMessages.map((msg, i) => (
              <motion.div
                key={i}
                className={`flex ${msg.role === "agent" ? "justify-start" : "justify-end"}`}
                initial={{ opacity: 0, y: 6 }}
                animate={animStep >= 5 ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.2 + i * 0.15, duration: 0.3 }}
              >
                <div className={`max-w-[82%] px-3.5 py-2.5 text-[13px] leading-[1.6] ${
                  msg.role === "agent"
                    ? "bg-[#F5F5F7] text-[#1D1D1F] rounded-2xl rounded-tl-md"
                    : "bg-[#1D1D1F] text-white rounded-2xl rounded-tr-md"
                }`}>
                  {msg.text}
                </div>
              </motion.div>
            ))}
            <motion.div
              className="flex items-center justify-center gap-1.5 pt-2 pb-1"
              initial={{ opacity: 0 }} animate={animStep >= 5 ? { opacity: 1 } : {}} transition={{ delay: 1 }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#34C759" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"/></svg>
              <span className="text-[12px] text-[#34C759] font-medium">面试已安排 · 全程无需你介入</span>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* 数据亮点 */}
      <div className="px-5 pt-6">
        <motion.div
          className="rounded-[20px] px-5 py-5"
          style={{ background: "linear-gradient(135deg, rgba(0,122,255,0.06) 0%, rgba(88,86,214,0.06) 100%)", border: "0.5px solid rgba(0,122,255,0.1)" }}
          initial={{ opacity: 0, y: 12 }} animate={animStep >= 5 ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.5, duration: 0.5 }}
        >
          <p className="text-[15px] font-semibold text-[#1D1D1F] mb-4">创建经纪人后，你将获得</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#007AFF" strokeWidth="1.8"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>, title: "24h 自动寻找", desc: "全网岗位实时扫描，不错过任何机会" },
              { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5856D6" strokeWidth="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>, title: "AI 替你沟通", desc: "自动与 HR 初步沟通，筛掉不靠谱的" },
              { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF9500" strokeWidth="1.8"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>, title: "智能谈薪", desc: "基于市场数据帮你争取最优薪资" },
              { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#34C759" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>, title: "隐私保护", desc: "匿名沟通，不暴露在职状态" },
            ].map((item) => (
              <div key={item.title} className="bg-white/60 rounded-xl px-3 py-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-2" style={{ background: "rgba(0,0,0,0.03)" }}>
                  {item.icon}
                </div>
                <p className="text-[13px] font-semibold text-[#1D1D1F] mb-0.5">{item.title}</p>
                <p className="text-[11px] text-[#86868B] leading-[1.5]">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* 社会证明 */}
      <div className="px-5 pt-5 pb-4">
        <motion.div
          className="flex items-center justify-center gap-6 py-3"
          initial={{ opacity: 0 }} animate={animStep >= 5 ? { opacity: 1 } : {}} transition={{ delay: 0.8 }}
        >
          {[
            { value: "23,847", label: "人已创建" },
            { value: "94%", label: "满意度" },
            { value: "3.2天", label: "平均拿面试" },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center">
              <span className="text-[18px] font-bold text-[#1D1D1F]" style={{ fontFeatureSettings: "'tnum'" }}>{s.value}</span>
              <span className="text-[10px] text-[#AEAEB2] mt-0.5">{s.label}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* 滚动触发点：当此处进入视口时浮现遮罩 */}
      <div ref={ctaTriggerRef} className="h-px" />

      {/* 浮动遮罩 CTA（滚动到底部时浮现） */}
      <AnimatePresence>
        {showCTA && (
          <motion.div
            className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[430px] z-30"
            style={{ height: "50vh" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="absolute inset-0 flex flex-col" style={{ background: "linear-gradient(to bottom, rgba(250,250,250,0) 0%, rgba(250,250,250,0.85) 20%, rgba(250,250,250,0.98) 40%, rgba(250,250,250,1) 50%)" }}>
              <div className="flex-1" />
              <div className="px-8 pb-8 flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1D1D1F] to-[#3A3A3C] flex items-center justify-center mb-5"
                  style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.15)" }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                    <path d="m12 3-1.9 5.8a2 2 0 0 1-1.287 1.288L3 12l5.8 1.9a2 2 0 0 1 1.288 1.287L12 21l1.9-5.8a2 2 0 0 1 1.287-1.288L21 12l-5.8-1.9a2 2 0 0 1-1.288-1.287Z" />
                  </svg>
                </div>
                <p className="text-[12px] text-[#AEAEB2] mb-1">以上为模拟演示数据</p>
                <h3 className="text-[20px] font-bold text-[#1D1D1F] tracking-tight mb-2">创建你的经纪人</h3>
                <p className="text-[14px] text-[#86868B] text-center leading-relaxed mb-5">获取真实推荐，让 AI 经纪人替你谈</p>
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
                  创建 AI 经纪人
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
  const [inboxTasks, setInboxTasks] = useState<InboxTask[]>(initialInboxTasks);

  const pendingCount = inboxTasks.filter(t => !t.resolved).length;

  const handleContinueSetup = () => {
    router.push("/onboarding/upload");
  };

  const handleResolveTask = (id: number, action: string) => {
    setInboxTasks(prev => prev.map(t => t.id === id ? { ...t, resolved: true, resolvedAction: action } : t));
  };

  const content = () => {
    if (incomplete) {
      switch (activeTab) {
        case 0: return <IncompleteOverview onContinue={handleContinueSetup} />;
        case 1: return <IncompleteOpportunities onContinue={handleContinueSetup} />;
        case 2: return <MessageListPage threads={initialChatThreads} />;
        case 3: return <IncompleteAssets onContinue={handleContinueSetup} />;
        default: return <IncompleteOverview onContinue={handleContinueSetup} />;
      }
    }
    switch (activeTab) {
      case 0: return <OverviewPage inboxTasks={inboxTasks} onResolveTask={handleResolveTask} />;
      case 1: return <RecommendedJobsFeed jobs={initialRecommendedJobs} onNavigateToChat={(jobId) => { setActiveTab(2); setTimeout(() => router.push(`/dashboard/chat/${jobId}`), 100); }} />;
      case 2: return <MessageListPage threads={initialChatThreads} />;
      case 3: return <AssetPage />;
      default: return <OverviewPage inboxTasks={inboxTasks} onResolveTask={handleResolveTask} />;
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
