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
    { icon: IconMessage, label: "消息" },
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

/* ============ Recommended Jobs (Tab 1) ============ */
type JobStatus = "new" | "interested" | "chatting" | "passed";
interface RecommendedJob {
  id: number;
  company: string;
  team: string;
  salary: string;
  location: string;
  headcount: number;
  aiScore: number;
  aiReason: string;
  aiAnalysis: string;
  jdSummary: string;
  requirements: string[];
  chatHistory: { role: "agent" | "hr"; text: string }[];
  suggestedMessages: string[];
  status: JobStatus;
}

const initialRecommendedJobs: RecommendedJob[] = [
  {
    id: 1, company: "字节跳动", team: "商业化团队", salary: "28-35k", location: "北京", headcount: 3,
    aiScore: 95, aiReason: "技术栈高度匹配，团队扩招期，面试通过率高",
    aiAnalysis: "该岗位要求的微服务架构和高并发处理与你的核心技能完全吻合。团队近半年扩招 40%，HC 充足，面试流程较快。薪资范围覆盖你的预期上限，谈判空间大。团队 leader 偏好有支付/交易经验的候选人，你的背景非常契合。",
    jdSummary: "负责商业化广告投放系统的后端架构设计与核心模块开发，支撑日均千万级广告请求。",
    requirements: ["5年以上 Java 后端经验", "熟悉微服务架构和分布式系统", "有高并发场景实战经验", "了解广告投放或推荐系统优先"],
    chatHistory: [
      { role: "agent", text: "你好，我这边有一位候选人，5年 Java 后端经验，擅长微服务架构和高并发处理，目前在看新机会。" },
      { role: "hr", text: "可以的，我们商业化团队正在招高级后端，能发一份简历过来看看吗？" },
      { role: "agent", text: "简历稍后发送。想先确认一下，贵团队的作息制度和薪资范围方便透露吗？" },
      { role: "hr", text: "双休弹性工时，薪资 28-35k，具体面试后定级。我们 HC 比较多，流程会快。" },
    ],
    suggestedMessages: ["你好，我对这个岗位很感兴趣，方便聊聊具体的技术栈和团队情况吗？", "我有丰富的高并发和微服务经验，希望能进一步了解岗位细节。", "请问面试流程大概是怎样的？"],
    status: "new",
  },
  {
    id: 2, company: "蚂蚁集团", team: "支付安全", salary: "30-40k", location: "杭州", headcount: 2,
    aiScore: 92, aiReason: "支付领域深度匹配，薪资上限高，技术挑战大",
    aiAnalysis: "你主导过支付网关微服务拆分，日均交易量提升 4 倍的经历和该岗位高度相关。蚂蚁的技术氛围浓厚，团队对安全合规有深入研究。薪资范围在你的预期之上，年终奖系数稳定在 4-6 个月。杭州的生活成本低于北京，实际购买力更强。",
    jdSummary: "负责支付安全核心链路的架构升级，保障亿级日交易的资金安全与合规。",
    requirements: ["5年以上后端开发经验", "有支付/金融系统开发经验", "熟悉风控体系和安全合规", "优秀的系统设计能力"],
    chatHistory: [
      { role: "agent", text: "您好，推荐一位在支付领域有深厚经验的候选人，曾主导支付网关微服务拆分，日均交易量从 50 万提升到 200 万。" },
      { role: "hr", text: "经历很匹配！我们支付安全团队正缺这样的人。方便安排线上聊一下吗？" },
      { role: "agent", text: "非常乐意。候选人比较关注团队的技术方向和薪资结构，能先介绍一下吗？" },
      { role: "hr", text: "我们专注交易链路安全，技术栈是 Java + 自研中间件。薪资 30-40k，年终 4-6 个月。" },
    ],
    suggestedMessages: ["我在支付网关领域有很多实战经验，想深入了解贵团队的安全架构。", "请问团队目前在做哪些方向的技术升级？"],
    status: "new",
  },
  {
    id: 3, company: "美团", team: "到店事业群", salary: "25-33k", location: "北京", headcount: 5,
    aiScore: 88, aiReason: "业务场景丰富，HC 充足，成长空间大",
    aiAnalysis: "美团到店业务日活过亿，技术场景复杂度高。该团队正在做架构升级，需要有分布式经验的高级工程师。HC 充足意味着竞争相对小，入职确定性高。薪资中位数对标市场 75 分位。唯一不足是薪资下限略低于你的预期底线。",
    jdSummary: "负责到店商家平台核心系统的架构设计和性能优化，支撑百万级商家的日常运营。",
    requirements: ["4年以上 Java 开发经验", "分布式系统设计经验", "良好的沟通协作能力", "有电商或 O2O 经验优先"],
    chatHistory: [
      { role: "agent", text: "你好，推荐一位高级 Java 后端工程师，5年经验，擅长分布式架构，对电商和交易系统有深入理解。" },
      { role: "hr", text: "我们正在扩招，这个方向很需要人。简历发过来我们快速看一下。" },
    ],
    suggestedMessages: ["到店业务的架构升级具体在做什么方向？", "团队目前的技术栈和基础设施是怎样的？"],
    status: "interested",
  },
  {
    id: 4, company: "小红书", team: "社区技术", salary: "27-34k", location: "上海", headcount: 2,
    aiScore: 85, aiReason: "技术氛围好，远程友好，年轻化团队",
    aiAnalysis: "小红书社区技术团队以 Go + Java 双语言栈为主，你的 Java 背景可以直接上手。团队支持每周 1-2 天远程办公，work-life balance 较好。业务增长快，但上海的通勤成本需考虑。",
    jdSummary: "负责社区内容分发系统的后端服务开发和优化，提升内容推荐的质量和效率。",
    requirements: ["3年以上后端开发经验", "熟悉 Java 或 Go", "了解推荐系统或内容分发优先", "有社区产品开发经验优先"],
    chatHistory: [
      { role: "agent", text: "推荐一位全栈能力强的 Java 后端工程师，对内容分发和推荐系统有兴趣。" },
      { role: "hr", text: "可以先投简历，我们筛选后安排面试。请问候选人对远程办公有偏好吗？" },
      { role: "agent", text: "候选人对混合办公模式很感兴趣，这也是考虑贵司的一个重要因素。" },
    ],
    suggestedMessages: ["我对社区内容分发很感兴趣，想了解一下团队的技术架构。", "请问远程办公的具体政策是怎样的？"],
    status: "new",
  },
  {
    id: 5, company: "腾讯", team: "微信支付", salary: "30-42k", location: "深圳", headcount: 3,
    aiScore: 82, aiReason: "大平台稳定，薪资天花板高，但需考虑城市",
    aiAnalysis: "腾讯微信支付是国内顶级的支付团队，技术深度和广度都很高。薪资上限 42k 是目前所有机会中最高的。但深圳意味着需要考虑搬迁成本。团队稳定性好，晋升通道清晰。",
    jdSummary: "参与微信支付核心交易链路的设计与开发，保障亿级用户的支付体验。",
    requirements: ["5年以上后端开发经验", "有支付或金融系统经验", "熟悉高可用架构设计", "良好的抗压能力"],
    chatHistory: [
      { role: "agent", text: "这边有一位候选人，支付领域经验丰富，微服务架构能力强，期望薪资 30k 起。" },
      { role: "hr", text: "背景不错，我们微信支付团队需要这样的人。预算 30-42k 区间，面试后定级。" },
    ],
    suggestedMessages: ["微信支付的技术栈和架构是怎样的？", "团队的工作节奏和加班情况如何？"],
    status: "new",
  },
];

/* ============ Chat Threads (Tab 2 - Messages) ============ */
interface ChatThread {
  id: number;
  company: string;
  team: string;
  initial: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  color: string;
}

const initialChatThreads: ChatThread[] = [
  { id: 1, company: "字节跳动", team: "商业化团队", initial: "字", lastMessage: "HR：双休弹性工时，薪资 28-35k，具体面试后定级。", lastTime: "刚刚", unread: 2, color: "#3B82F6" },
  { id: 2, company: "蚂蚁集团", team: "支付安全", initial: "蚂", lastMessage: "HR：你上一段经历为什么只待了半年？", lastTime: "1小时前", unread: 1, color: "#1677FF" },
  { id: 3, company: "美团", team: "到店事业群", initial: "美", lastMessage: "Agent：已发送候选人简历，等待HR反馈。", lastTime: "3小时前", unread: 0, color: "#FBBF24" },
  { id: 4, company: "小红书", team: "社区技术", initial: "小", lastMessage: "HR：可以先投简历，我们筛选后安排面试。", lastTime: "昨天", unread: 0, color: "#EF4444" },
  { id: 5, company: "腾讯", team: "微信支付", initial: "腾", lastMessage: "Agent：已与HR初步沟通，对方反馈积极。", lastTime: "昨天", unread: 0, color: "#22C55E" },
];

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
function OverviewPage({ inboxTasks, onDismissTask }: { inboxTasks: InboxTask[]; onDismissTask: (id: number) => void }) {
  const router = useRouter();
  const [intentExpand, setIntentExpand] = useState(false);
  const [engineIdx, setEngineIdx] = useState(0);
    const [engineMenuOpen, setEngineMenuOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [resolvingId, setResolvingId] = useState<number | null>(null);
  const engine = engineStates[engineIdx];
  const [matchRate, setMatchRate] = useState(78);
  const [matchExpand, setMatchExpand] = useState(false);

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

  /* ── chat state ── */
  const [chatMsgs, setChatMsgs] = useState<{ id: number; role: "agent" | "user"; text: string }[]>([
      { id: -4, role: "agent", text: "上面几个事项帮你整理好了，优先处理字节的面试邀请。" },
      { id: -3, role: "user", text: "字节那个优先级高一些，薪资可以再谈谈" },
      { id: -2, role: "agent", text: "收到，已把字节标为最高优先级。美团那边 16 薪结构其实不错，我帮你算了详细对比。" },
      { id: -1, role: "agent", text: "另外，你对远程办公有偏好吗？有几个不错的机会支持 remote，要不要也帮你留意一下？" },
    ]);
  const [chatInput, setChatInput] = useState("");
    const [voiceMode, setVoiceMode] = useState(false);
  const [chatTyping, setChatTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMsgs, chatTyping, inboxTasks]);

  const agentReplies = [
    "收到，我马上帮你处理。有新进展会第一时间通知你。",
    "明白了，我会重点关注这个方向。",
    "好的，已记录你的偏好，后续筛选会优先考虑。",
    "了解，我现在就去和对方沟通确认。",
  ];

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    setChatMsgs(prev => [...prev, { id: Date.now(), role: "user", text: chatInput }]);
    setChatInput("");
    setChatTyping(true);
    setTimeout(() => {
      setChatTyping(false);
      const reply = agentReplies[Math.floor(Math.random() * agentReplies.length)];
      setChatMsgs(prev => [...prev, { id: Date.now() + 1, role: "agent", text: reply }]);
      setMatchRate(prev => Math.min(prev + 1, 99));
    }, 1200);
  };

  const handleChatAdjust = () => {
    setIntentExpand(false);
  };

  const actionableTasks = inboxTasks.filter(t => t.type !== "INFO_REPORT");
  const infoTasks = inboxTasks.filter(t => t.type === "INFO_REPORT");

  const handleResolve = (id: number, actionLabel?: string) => {
    setResolvingId(id);
    const task = inboxTasks.find(t => t.id === id);
    const confirmText = task?.company
      ? `已执行「${actionLabel || "处理"}」—— ${task.company} 处理完成 ✓`
      : "已处理 ✓";
    setTimeout(() => {
      setChatMsgs(prev => [...prev, { id: Date.now(), role: "agent", text: confirmText }]);
      onDismissTask(id);
      setResolvingId(null);
      setMatchRate(prev => Math.min(prev + 2, 99));
    }, 600);
  };

  const typeConfig: Record<TaskType, { badge: string; dotColor: string; emoji: string }> = {
    P0_HARD_DECISION: { badge: "紧急决策", dotColor: "#FF3B30", emoji: "🔴" },
    P1_TRADE_OFF: { badge: "薪资博弈", dotColor: "#FF9500", emoji: "🟡" },
    P2_KNOWLEDGE_GAP: { badge: "待你回复", dotColor: "#007AFF", emoji: "🔵" },
    INFO_REPORT: { badge: "简报", dotColor: "#86868B", emoji: "📊" },
  };

  return (
    <div className="flex flex-col h-screen bg-[#F5F5F7]">
      {/* ── Fixed Top: Agent Header ── */}
      <div className="sticky top-0 z-30 flex-shrink-0" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.78) 100%)", backdropFilter: "blur(40px) saturate(180%)", WebkitBackdropFilter: "blur(40px) saturate(180%)" }}>
        {/* safe area spacer */}
        <div className="h-14" />

        {/* Row 1: Avatar + Name + Engine Status (top-right) */}
        <div className="px-5 flex items-center gap-3 pb-3">
          <div className="w-10 h-10 rounded-full bg-[#1D1D1F] flex items-center justify-center flex-shrink-0" style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
            <span className="text-[13px] font-bold text-white tracking-tight">A.</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[16px] font-semibold text-[#1D1D1F] tracking-tight leading-tight">我的经纪人</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="relative w-[5px] h-[5px]">
                <div className="w-[5px] h-[5px] rounded-full bg-[#32D74B]/80" />
                <div className="absolute inset-0 w-[5px] h-[5px] rounded-full bg-[#32D74B]/40 animate-ping" />
              </div>
              <span className="text-[11px] text-[#6E6E73]">在线 · 处理中 {inboxTasks.filter(t => t.type !== "INFO_REPORT").length} 项</span>
            </div>
          </div>
          {/* Engine Status — dropdown trigger */}
          <div className="flex-shrink-0 relative">
            <motion.button className="flex items-center gap-1.5 h-[28px] px-3 rounded-full text-[11px] font-medium text-white" style={{ backgroundColor: engineStates[engineIdx].key === "active" ? "#32D74B" : engineStates[engineIdx].key === "passive" ? "#FF9F0A" : "#8E8E93", boxShadow: `0 1px 6px ${engineStates[engineIdx].key === "active" ? "#32D74B" : engineStates[engineIdx].key === "passive" ? "#FF9F0A" : "#8E8E93"}20` }} whileTap={{ scale: 0.95 }} onClick={() => setEngineMenuOpen(!engineMenuOpen)}>
              <span>{engineStates[engineIdx].label}</span>
              <motion.svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" animate={{ rotate: engineMenuOpen ? 180 : 0 }} transition={{ duration: 0.2 }}><path d="m6 9 6 6 6-6"/></motion.svg>
            </motion.button>
            <AnimatePresence>
              {engineMenuOpen && (
                <>
                  <motion.div className="fixed inset-0 z-40" onClick={() => setEngineMenuOpen(false)} />
                  <motion.div className="absolute right-0 top-[34px] z-50 min-w-[140px] rounded-2xl overflow-hidden py-1" style={{ background: "rgba(255,255,255,0.88)", backdropFilter: "blur(40px) saturate(180%)", WebkitBackdropFilter: "blur(40px) saturate(180%)", boxShadow: "0 4px 24px rgba(0,0,0,0.1), inset 0 0 0 0.5px rgba(255,255,255,0.5)" }} initial={{ opacity: 0, scale: 0.9, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: -4 }} transition={{ duration: 0.18 }}>
                    {engineStates.map((s, i) => {
                      const mutedColor = s.key === "active" ? "#32D74B" : s.key === "passive" ? "#FF9F0A" : "#8E8E93";
                      return (
                        <motion.button key={s.key} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left" whileTap={{ backgroundColor: "rgba(0,0,0,0.04)" }} onClick={() => { setEngineIdx(i); setEngineMenuOpen(false); }}>
                          <div className="w-[6px] h-[6px] rounded-full" style={{ backgroundColor: mutedColor }} />
                          <span className={`text-[13px] ${engineIdx === i ? "font-semibold text-[#1D1D1F]" : "text-[#8E8E93]"}`}>{s.label}</span>
                          {engineIdx === i && <svg className="ml-auto" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1D1D1F" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"/></svg>}
                        </motion.button>
                      );
                    })}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Row 2: Stats + Match rate bar (horizontal) */}
        <div className="px-5 flex items-center gap-3 pb-3">
          <div className="flex items-baseline gap-0 flex-1">
            <span className="text-[11px] text-[#8E8E93]">浏览</span>
            <AnimatedNumber value="1,247" color="text-[#1D1D1F]" />
            <span className="text-[11px] text-[#8E8E93]">岗位</span>
            <span className="text-black/[0.06] mx-1.5">|</span>
            <span className="text-[11px] text-[#8E8E93]">沟通</span>
            <AnimatedNumber value="24" color="text-[#1D1D1F]" />
            <span className="text-black/[0.06] mx-1.5">|</span>
            <span className="text-[11px] text-[#8E8E93]">拦截</span>
            <AnimatedNumber value="86" color="text-[#1D1D1F]" />
          </div>
          {/* Match rate — horizontal bar */}
          <div className="flex-shrink-0 flex items-center gap-1.5">
            <span className="text-[10px] text-[#8E8E93]">匹配</span>
            <div className="w-[48px] h-[3px] rounded-full bg-black/[0.04]">
              <motion.div className="h-full rounded-full" style={{ background: "linear-gradient(90deg, #32D74B, #30D158)" }} initial={{ width: 0 }} animate={{ width: `${matchRate}%` }} transition={{ duration: 0.8, ease: "easeOut" }} />
            </div>
            <motion.span className="text-[10px] font-semibold text-[#1D1D1F]" key={matchRate} initial={{ scale: 1.1 }} animate={{ scale: 1 }} style={{ fontFeatureSettings: "'tnum'", minWidth: "20px" }}>{matchRate}%</motion.span>
          </div>
        </div>

        {/* Row 4: Intent — full width, clearly tappable */}
        <div className="px-5 pb-3">
          <motion.button className="w-full flex items-center justify-between rounded-2xl px-4 py-3" style={{ backgroundColor: "rgba(0,0,0,0.03)" }} onClick={() => setIntentExpand(true)} whileTap={{ scale: 0.98 }}>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="2" className="flex-shrink-0"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.287 1.288L3 12l5.8 1.9a2 2 0 0 1 1.288 1.287L12 21l1.9-5.8a2 2 0 0 1 1.287-1.288L21 12l-5.8-1.9a2 2 0 0 1-1.288-1.287Z" /></svg>
              <span className="text-[13px] text-[#1D1D1F] truncate">{coreIntent}</span>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0 ml-3">
              <span className="text-[12px] text-[#007AFF]/80 font-medium">调整</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#007AFF" strokeWidth="2.5" opacity="0.8"><path d="m9 18 6-6-6-6"/></svg>
            </div>
          </motion.button>
        </div>

        {/* Bottom fade edge */}
        <div className="h-[1px] bg-gradient-to-r from-transparent via-black/[0.06] to-transparent" />
      </div>

      {/* ── Scrollable Conversation ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-5 pt-4 space-y-3 pb-36">
          {/* Task cards (current pending items) */}
          <AnimatePresence>
            {inboxTasks.map((task) => {
              const tc = typeConfig[task.type];
              return (
                <motion.div key={task.id} layout className="flex items-start gap-2.5" initial={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9, x: -30, transition: { duration: 0.35 } }} animate={resolvingId === task.id ? { opacity: [1, 0.4], scale: [1, 0.95], transition: { duration: 0.3 } } : {}}>
                  {/* Agent avatar */}
                  <div className="w-7 h-7 rounded-full bg-[#1D1D1F] flex items-center justify-center flex-shrink-0 mt-1" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}>
                    <span className="text-[9px] font-bold text-white">A.</span>
                  </div>
                  {/* Bubble */}
                  <div className="flex-1 min-w-0">
                    <div className="rounded-2xl rounded-tl-md overflow-hidden cursor-pointer" style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(20px) saturate(180%)", WebkitBackdropFilter: "blur(20px) saturate(180%)", boxShadow: "0 1px 8px rgba(0,0,0,0.04), inset 0 0 0 0.5px rgba(255,255,255,0.5)" }} onClick={() => task.company && router.push(`/dashboard/chat/${task.id}`)}>
                      <div className="px-4 py-3">
                        {/* Badge + Time */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5">
                            <div className="w-[6px] h-[6px] rounded-full" style={{ backgroundColor: tc.dotColor }} />
                            <span className="text-[11px] text-[#8E8E93] font-medium">{tc.badge}</span>
                          </div>
                          {task.time && <span className="text-[11px] text-[#AEAEB2]">{task.time}</span>}
                        </div>
                        {/* Company */}
                        {task.company && (
                          <p className="text-[15px] font-semibold text-[#1D1D1F] tracking-tight mb-1">
                            {task.company}{task.team ? ` · ${task.team}` : ""}{task.salary ? <span className="text-[12px] text-[#8E8E93] font-normal ml-1.5">{task.salary}</span> : null}
                          </p>
                        )}
                        {/* P0 */}
                        {task.type === "P0_HARD_DECISION" && task.alert && <p className="text-[14px] text-[#1D1D1F] leading-[1.5] mb-3">{task.alert}</p>}
                        {/* P1 */}
                        {task.type === "P1_TRADE_OFF" && <div className="mb-3">{task.conflictPoint && <p className="text-[14px] font-medium text-[#1D1D1F] leading-[1.5] mb-1">{task.conflictPoint}</p>}{task.agentCalc && <p className="text-[13px] text-[#8E8E93] leading-[1.6]">{task.agentCalc}</p>}</div>}
                        {/* P2 */}
                        {task.type === "P2_KNOWLEDGE_GAP" && <div className="mb-3">{task.hrQuestion && <div className="mb-2"><p className="text-[11px] text-[#AEAEB2] mb-0.5">对方提问</p><p className="text-[14px] text-[#1D1D1F] leading-[1.5]">{task.hrQuestion}</p></div>}{task.agentDraft && <div><p className="text-[11px] text-[#AEAEB2] mb-0.5">我拟的草稿</p><p className="text-[13px] text-[#8E8E93] leading-[1.6] bg-black/[0.03] rounded-xl px-3 py-2">{task.agentDraft}</p></div>}</div>}
                        {/* INFO */}
                        {task.type === "INFO_REPORT" && <div className="mb-2">{task.infoTitle && <p className="text-[14px] font-medium text-[#1D1D1F] mb-0.5">{task.infoTitle}</p>}{task.infoBody && <p className="text-[13px] text-[#8E8E93] leading-[1.5]">{task.infoBody}</p>}</div>}
                        {/* Actions */}
                        <div className="flex gap-2 mt-1" onClick={e => e.stopPropagation()}>
                          {task.actions.map((act) => (
                            <motion.button key={act.label} className={`h-[36px] rounded-xl text-[13px] font-medium px-3 ${act.primary ? "flex-1 bg-[#1D1D1F] text-white" : act.danger ? "text-[#8E8E93]" : "flex-1 bg-black/[0.04] text-[#1D1D1F]"}`} style={act.primary ? { boxShadow: "0 1px 6px rgba(0,0,0,0.1)" } : {}} whileTap={{ scale: 0.97 }} onClick={() => handleResolve(task.id, act.label)}>
                              {act.label}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {inboxTasks.length === 0 && chatMsgs.length === 0 && (
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#1D1D1F] flex items-center justify-center flex-shrink-0 mt-1"><span className="text-[9px] font-bold text-white">A.</span></div>
              <div className="rounded-2xl rounded-tl-md px-4 py-3" style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(20px)", boxShadow: "0 1px 6px rgba(0,0,0,0.03), inset 0 0 0 0.5px rgba(255,255,255,0.5)" }}>
                <p className="text-[14px] text-[#8E8E93] leading-relaxed">全部处理完毕 ✓ 有新进展我会立即通知你。</p>
              </div>
            </div>
          )}

          {chatMsgs.filter(m => m.id < 0).map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "items-start gap-2.5"}`}>
              {msg.role === "agent" && (
                <div className="w-7 h-7 rounded-full bg-[#1D1D1F] flex items-center justify-center flex-shrink-0 mt-1"><span className="text-[9px] font-bold text-white">A.</span></div>
              )}
              {msg.role === "agent" ? (
                <div className="rounded-2xl rounded-tl-md px-4 py-3 max-w-[80%]" style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(20px)", boxShadow: "0 1px 6px rgba(0,0,0,0.03), inset 0 0 0 0.5px rgba(255,255,255,0.5)" }}><p className="text-[14px] text-[#1D1D1F] leading-relaxed">{msg.text}</p></div>
              ) : (
                <div className="bg-[#1D1D1F] rounded-2xl rounded-tr-md px-4 py-3 max-w-[78%]" style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.08)" }}><p className="text-[14px] text-white leading-relaxed">{msg.text}</p></div>
              )}
            </div>
          ))}

          {chatMsgs.filter(m => m.id >= 0).map((msg) => (
            <motion.div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "items-start gap-2.5"}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
              {msg.role === "agent" && (
                <div className="w-7 h-7 rounded-full bg-[#1D1D1F] flex items-center justify-center flex-shrink-0 mt-1"><span className="text-[9px] font-bold text-white">A.</span></div>
              )}
              {msg.role === "agent" ? (
                <div className="rounded-2xl rounded-tl-md px-4 py-3 max-w-[80%]" style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(20px)", boxShadow: "0 1px 6px rgba(0,0,0,0.03), inset 0 0 0 0.5px rgba(255,255,255,0.5)" }}><p className="text-[14px] text-[#1D1D1F] leading-relaxed">{msg.text}</p></div>
              ) : (
                <div className="bg-[#1D1D1F] rounded-2xl rounded-tr-md px-4 py-3 max-w-[78%]" style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.08)" }}><p className="text-[14px] text-white leading-relaxed">{msg.text}</p></div>
              )}
            </motion.div>
          ))}

          {chatTyping && (
            <motion.div className="flex items-start gap-2.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="w-7 h-7 rounded-full bg-[#1D1D1F] flex items-center justify-center flex-shrink-0 mt-1"><span className="text-[9px] font-bold text-white">A.</span></div>
              <div className="rounded-2xl rounded-tl-md px-4 py-3" style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(20px)", boxShadow: "0 1px 6px rgba(0,0,0,0.03)" }}>
                <div className="flex gap-1 items-center h-[20px]">
                  <motion.div className="w-1.5 h-1.5 bg-[#AEAEB2] rounded-full" animate={{ y: [0, -3, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
                  <motion.div className="w-1.5 h-1.5 bg-[#AEAEB2] rounded-full" animate={{ y: [0, -3, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }} />
                  <motion.div className="w-1.5 h-1.5 bg-[#AEAEB2] rounded-full" animate={{ y: [0, -3, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }} />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={chatEndRef} />
        </div>
      </div>

      {/* ── Fixed Input Bar ── */}
      <div className="fixed bottom-[68px] left-1/2 -translate-x-1/2 w-[430px] px-5 pb-3 pt-4 z-30" style={{ background: "linear-gradient(to top, #F5F5F7 65%, transparent)" }}>
        <div className="flex items-end gap-2.5">
          {/* Voice toggle button */}
          <motion.button className="flex-shrink-0 w-[38px] h-[38px] rounded-full flex items-center justify-center" style={{ backgroundColor: voiceMode ? "#1D1D1F" : "rgba(0,0,0,0.04)" }} whileTap={{ scale: 0.9 }} onClick={() => setVoiceMode(!voiceMode)}>
            {voiceMode ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round"><path d="M4 7h3l4-4v18l-4-4H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Z"/><path d="M15 9a3 3 0 0 1 0 6"/></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="1.8" strokeLinecap="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
            )}
          </motion.button>

          {/* Input area */}
          <AnimatePresence mode="wait">
            {voiceMode ? (
              <motion.button key="voice" className="flex-1 h-[42px] rounded-2xl flex items-center justify-center text-[14px] font-medium text-[#8E8E93] active:bg-black/[0.06] transition-colors" style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(30px) saturate(180%)", WebkitBackdropFilter: "blur(30px) saturate(180%)", boxShadow: "0 1px 12px rgba(0,0,0,0.05), inset 0 0 0 0.5px rgba(255,255,255,0.6)" }} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.15 }}>
                按住说话
              </motion.button>
            ) : (
              <motion.div key="text" className="flex-1 flex items-end rounded-2xl px-4 py-2.5" style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(30px) saturate(180%)", WebkitBackdropFilter: "blur(30px) saturate(180%)", boxShadow: "0 1px 12px rgba(0,0,0,0.05), inset 0 0 0 0.5px rgba(255,255,255,0.6)", minHeight: "42px" }} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.15 }}>
                <input type="text" placeholder="给经纪人说点什么..." className="flex-1 text-[15px] text-[#1D1D1F] placeholder-[#AEAEB2] bg-transparent outline-none leading-[1.4]" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === "Enter" && chatInput.trim() && handleSendChat()} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Send button — only visible when has text */}
          <AnimatePresence>
            {chatInput.trim() && !voiceMode && (
              <motion.button className="flex-shrink-0 w-[38px] h-[38px] rounded-full bg-[#1D1D1F] flex items-center justify-center" style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.12)" }} initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} transition={{ type: "spring", stiffness: 400, damping: 20 }} whileTap={{ scale: 0.85 }} onClick={handleSendChat}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M12 19V5" /><path d="m5 12 7-7 7 7" /></svg>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
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
    </div>
  );
}

/* ============ Tab 1: Recommended Jobs ============ */
function RecommendedJobsFeed({ jobs: initialJobs }: { jobs: RecommendedJob[] }) {
  const router = useRouter();
  type FilterKey = "ALL" | "HIGH" | "INTERESTED";
  const [filter, setFilter] = useState<FilterKey>("ALL");
  const [jobs, setJobs] = useState(initialJobs);
  const [selectedJob, setSelectedJob] = useState<RecommendedJob | null>(null);
  const [chatMode, setChatMode] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [userMsgs, setUserMsgs] = useState<{ id: number; role: "user" | "agent" | "hr"; text: string }[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const filtered = filter === "ALL" ? jobs : filter === "HIGH" ? jobs.filter(j => j.aiScore >= 90) : jobs.filter(j => j.status === "interested" || j.status === "chatting");
  const filters: { key: FilterKey; label: string; count: number }[] = [
    { key: "ALL", label: "全部", count: jobs.length },
    { key: "HIGH", label: "高匹配", count: jobs.filter(j => j.aiScore >= 90).length },
    { key: "INTERESTED", label: "已关注", count: jobs.filter(j => j.status === "interested" || j.status === "chatting").length },
  ];

  const handleInterested = (id: number) => {
    setJobs(prev => prev.map(j => j.id === id ? { ...j, status: "interested" as JobStatus } : j));
  };
  const handlePass = (id: number) => {
    setJobs(prev => prev.map(j => j.id === id ? { ...j, status: "passed" as JobStatus } : j));
  };
  const handleStartChat = () => {
    if (selectedJob) {
      setJobs(prev => prev.map(j => j.id === selectedJob.id ? { ...j, status: "chatting" as JobStatus } : j));
      setChatMode(true);
    }
  };
  const handleSendChat = (text?: string) => {
    const msg = text || chatInput;
    if (!msg.trim()) return;
    setUserMsgs(prev => [...prev, { id: Date.now(), role: "user", text: msg }]);
    setChatInput("");
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [userMsgs]);

  // Chat takeover view
  if (chatMode && selectedJob) {
    return (
      <div className="flex flex-col h-screen bg-[#F5F5F7]">
        <div className="sticky top-0 z-30 flex-shrink-0" style={{ background: "rgba(255,255,255,0.88)", backdropFilter: "blur(40px) saturate(180%)", WebkitBackdropFilter: "blur(40px) saturate(180%)" }}>
          <div className="h-14" />
          <div className="px-5 pb-3 flex items-center gap-3">
            <motion.button className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.04)" }} whileTap={{ scale: 0.9 }} onClick={() => setChatMode(false)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1D1D1F" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
            </motion.button>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-semibold text-[#1D1D1F] truncate">{selectedJob.company} · {selectedJob.team}</p>
              <p className="text-[11px] text-[#8E8E93]">Agent 沟通记录 · 你可以接管对话</p>
            </div>
          </div>
          <div className="h-[1px] bg-gradient-to-r from-transparent via-black/[0.06] to-transparent" />
        </div>
        <div className="flex-1 overflow-y-auto px-5 pt-4 pb-44 space-y-3">
          {selectedJob.chatHistory.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "hr" ? "justify-start" : "items-start gap-2.5"}`}>
              {msg.role === "agent" && (
                <div className="w-7 h-7 rounded-full bg-[#1D1D1F] flex items-center justify-center flex-shrink-0 mt-1"><span className="text-[9px] font-bold text-white">A.</span></div>
              )}
              {msg.role === "hr" ? (
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1 text-[10px] font-bold text-white" style={{ backgroundColor: "#8E8E93" }}>HR</div>
                  <div className="rounded-2xl rounded-tl-md px-4 py-3 max-w-[78%]" style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(20px)", boxShadow: "0 1px 6px rgba(0,0,0,0.03), inset 0 0 0 0.5px rgba(255,255,255,0.5)" }}>
                    <p className="text-[14px] text-[#1D1D1F] leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl rounded-tl-md px-4 py-3 max-w-[78%]" style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(20px)", boxShadow: "0 1px 6px rgba(0,0,0,0.03), inset 0 0 0 0.5px rgba(255,255,255,0.5)" }}>
                  <p className="text-[10px] text-[#8E8E93] mb-1">你的经纪人</p>
                  <p className="text-[14px] text-[#1D1D1F] leading-relaxed">{msg.text}</p>
                </div>
              )}
            </div>
          ))}
          {/* Divider */}
          {userMsgs.length === 0 && (
            <div className="flex items-center gap-3 py-2">
              <div className="flex-1 h-[1px] bg-black/[0.06]" />
              <span className="text-[11px] text-[#AEAEB2] flex-shrink-0">你接管对话</span>
              <div className="flex-1 h-[1px] bg-black/[0.06]" />
            </div>
          )}
          {userMsgs.map(msg => (
            <motion.div key={msg.id} className="flex justify-end" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <div className="bg-[#1D1D1F] rounded-2xl rounded-tr-md px-4 py-3 max-w-[78%]" style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.08)" }}>
                <p className="text-[14px] text-white leading-relaxed">{msg.text}</p>
              </div>
            </motion.div>
          ))}
          <div ref={chatEndRef} />
        </div>
        {/* Suggested messages */}
        <div className="fixed bottom-[68px] left-1/2 -translate-x-1/2 w-[430px] z-30" style={{ background: "linear-gradient(to top, #F5F5F7 70%, transparent)" }}>
          <div className="px-5 pb-2 pt-2">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {selectedJob.suggestedMessages.map((msg, i) => (
                <motion.button key={i} className="flex-shrink-0 px-3.5 py-2 rounded-2xl text-[12px] text-[#007AFF]/80 font-medium whitespace-nowrap" style={{ backgroundColor: "rgba(0,122,255,0.06)" }} whileTap={{ scale: 0.95 }} onClick={() => handleSendChat(msg)}>
                  {msg.length > 20 ? msg.slice(0, 20) + "..." : msg}
                </motion.button>
              ))}
            </div>
          </div>
          <div className="px-5 pb-3">
            <div className="flex items-end gap-2.5">
              <div className="flex-1 flex items-end rounded-2xl px-4 py-2.5" style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(30px) saturate(180%)", boxShadow: "0 1px 12px rgba(0,0,0,0.05), inset 0 0 0 0.5px rgba(255,255,255,0.6)", minHeight: "42px" }}>
                <input type="text" placeholder="发送消息给企业..." className="flex-1 text-[15px] text-[#1D1D1F] placeholder-[#AEAEB2] bg-transparent outline-none leading-[1.4]" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === "Enter" && chatInput.trim() && handleSendChat()} />
              </div>
              <AnimatePresence>
                {chatInput.trim() && (
                  <motion.button className="flex-shrink-0 w-[38px] h-[38px] rounded-full bg-[#1D1D1F] flex items-center justify-center" style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.12)" }} initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} transition={{ type: "spring", stiffness: 400, damping: 20 }} whileTap={{ scale: 0.85 }} onClick={() => handleSendChat()}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M12 19V5" /><path d="m5 12 7-7 7 7" /></svg>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Job detail sheet
  if (selectedJob && !chatMode) {
    return (
      <div className="flex flex-col h-screen bg-[#F5F5F7]">
        <div className="sticky top-0 z-30 flex-shrink-0" style={{ background: "rgba(255,255,255,0.88)", backdropFilter: "blur(40px) saturate(180%)", WebkitBackdropFilter: "blur(40px) saturate(180%)" }}>
          <div className="h-14" />
          <div className="px-5 pb-3 flex items-center gap-3">
            <motion.button className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.04)" }} whileTap={{ scale: 0.9 }} onClick={() => setSelectedJob(null)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1D1D1F" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
            </motion.button>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-semibold text-[#1D1D1F] truncate">{selectedJob.company}</p>
              <p className="text-[11px] text-[#8E8E93]">{selectedJob.team} · {selectedJob.location}</p>
            </div>
            <div className="flex-shrink-0 w-[40px] h-[40px] relative">
              <svg width="40" height="40" viewBox="0 0 40 40" className="transform -rotate-90">
                <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(0,0,0,0.04)" strokeWidth="2.5" />
                <circle cx="20" cy="20" r="16" fill="none" stroke={selectedJob.aiScore >= 90 ? "#32D74B" : selectedJob.aiScore >= 80 ? "#FF9F0A" : "#8E8E93"} strokeWidth="2.5" strokeLinecap="round" strokeDasharray={`${(selectedJob.aiScore / 100) * 2 * Math.PI * 16} ${2 * Math.PI * 16}`} />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center"><span className="text-[11px] font-bold text-[#1D1D1F]" style={{ fontFeatureSettings: "'tnum'" }}>{selectedJob.aiScore}</span></div>
            </div>
          </div>
          <div className="h-[1px] bg-gradient-to-r from-transparent via-black/[0.06] to-transparent" />
        </div>

        <div className="flex-1 overflow-y-auto px-5 pt-5 pb-32 space-y-4">
          {/* Salary + meta */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[20px] font-bold text-[#1D1D1F]">{selectedJob.salary}</span>
            <span className="text-[12px] text-[#8E8E93] px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(0,0,0,0.03)" }}>{selectedJob.location}</span>
            <span className="text-[12px] text-[#8E8E93] px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(0,0,0,0.03)" }}>招 {selectedJob.headcount} 人</span>
          </div>

          {/* AI Analysis */}
          <div className="rounded-2xl px-4 py-4" style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(20px)", boxShadow: "0 1px 8px rgba(0,0,0,0.04), inset 0 0 0 0.5px rgba(255,255,255,0.5)" }}>
            <div className="flex items-center gap-2 mb-2.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="2"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.287 1.288L3 12l5.8 1.9a2 2 0 0 1 1.288 1.287L12 21l1.9-5.8a2 2 0 0 1 1.287-1.288L21 12l-5.8-1.9a2 2 0 0 1-1.288-1.287Z" /></svg>
              <span className="text-[13px] font-semibold text-[#1D1D1F]">AI 推荐分析</span>
            </div>
            <p className="text-[14px] text-[#1D1D1F]/80 leading-[1.7]">{selectedJob.aiAnalysis}</p>
          </div>

          {/* JD Summary */}
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

          {/* Agent chat preview */}
          <div className="rounded-2xl px-4 py-4" style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(20px)", boxShadow: "0 1px 8px rgba(0,0,0,0.04), inset 0 0 0 0.5px rgba(255,255,255,0.5)" }}>
            <p className="text-[13px] font-semibold text-[#1D1D1F] mb-3">Agent 已沟通 {selectedJob.chatHistory.length} 轮</p>
            <div className="space-y-2.5">
              {selectedJob.chatHistory.slice(-2).map((msg, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-[11px] text-[#8E8E93] font-medium flex-shrink-0 w-8 pt-0.5">{msg.role === "agent" ? "Agent" : "HR"}</span>
                  <p className="text-[13px] text-[#1D1D1F]/70 leading-[1.5]">{msg.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom action */}
        <div className="fixed bottom-[68px] left-1/2 -translate-x-1/2 w-[430px] px-5 pb-3 pt-3 z-30" style={{ background: "linear-gradient(to top, #F5F5F7 70%, transparent)" }}>
          <motion.button className="w-full h-[48px] rounded-2xl bg-[#1D1D1F] text-white text-[15px] font-semibold flex items-center justify-center gap-2" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.12)" }} whileTap={{ scale: 0.97 }} onClick={handleStartChat}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            开始聊天
          </motion.button>
        </div>
      </div>
    );
  }

  // Job list
  return (
    <div className="flex flex-col h-screen bg-[#F5F5F7]">
      <div className="sticky top-0 z-30 flex-shrink-0" style={{ background: "rgba(255,255,255,0.88)", backdropFilter: "blur(40px) saturate(180%)", WebkitBackdropFilter: "blur(40px) saturate(180%)" }}>
        <div className="h-14" />
        <div className="px-5 pb-3">
          <h1 className="text-[22px] font-semibold text-[#1D1D1F] tracking-tight mb-3">推荐机会</h1>
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
        {filtered.filter(j => j.status !== "passed").map(job => (
          <motion.div key={job.id} className="rounded-2xl overflow-hidden cursor-pointer" style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(20px) saturate(180%)", boxShadow: "0 1px 8px rgba(0,0,0,0.04), inset 0 0 0 0.5px rgba(255,255,255,0.5)" }} layout whileTap={{ scale: 0.98 }} onClick={() => setSelectedJob(job)}>
            <div className="px-4 py-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-[16px] font-semibold text-[#1D1D1F] tracking-tight">{job.company}</p>
                  <p className="text-[12px] text-[#8E8E93] mt-0.5">{job.team} · {job.salary} · {job.location}</p>
                </div>
                <div className={`flex-shrink-0 ml-3 px-2.5 py-1 rounded-full text-[12px] font-bold ${job.aiScore >= 90 ? "text-[#32D74B] bg-[#32D74B]/[0.08]" : job.aiScore >= 80 ? "text-[#FF9F0A] bg-[#FF9F0A]/[0.08]" : "text-[#8E8E93] bg-black/[0.04]"}`}>
                  {job.aiScore}
                </div>
              </div>
              <p className="text-[13px] text-[#1D1D1F]/60 leading-[1.5] mb-3">{job.aiReason}</p>
              <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                {job.status === "new" && (
                  <>
                    <motion.button className="flex-1 h-[36px] rounded-xl bg-[#1D1D1F] text-white text-[13px] font-medium" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.1)" }} whileTap={{ scale: 0.97 }} onClick={() => handleInterested(job.id)}>感兴趣</motion.button>
                    <motion.button className="h-[36px] px-4 rounded-xl text-[13px] font-medium text-[#8E8E93]" style={{ backgroundColor: "rgba(0,0,0,0.03)" }} whileTap={{ scale: 0.97 }} onClick={() => handlePass(job.id)}>跳过</motion.button>
                  </>
                )}
                {job.status === "interested" && (
                  <span className="text-[12px] text-[#32D74B] font-medium flex items-center gap-1"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#32D74B" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"/></svg>已关注</span>
                )}
                {job.status === "chatting" && (
                  <span className="text-[12px] text-[#007AFF] font-medium flex items-center gap-1">
                    <div className="w-[5px] h-[5px] rounded-full bg-[#007AFF]" />沟通中
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
        {filtered.filter(j => j.status !== "passed").length === 0 && (
          <div className="flex flex-col items-center py-16"><p className="text-[14px] text-[#AEAEB2]">暂无相关机会</p></div>
        )}
      </div>
    </div>
  );
}

/* ============ Tab 2: Agent Chat ============ */
/* ============ Tab 2: Messages ============ */
function MessageListPage({ threads }: { threads: ChatThread[] }) {
  const router = useRouter();
  const totalUnread = threads.reduce((s, t) => s + t.unread, 0);

  return (
    <div className="flex flex-col h-screen bg-[#F5F5F7]">
      <div className="sticky top-0 z-30 flex-shrink-0" style={{ background: "rgba(255,255,255,0.88)", backdropFilter: "blur(40px) saturate(180%)", WebkitBackdropFilter: "blur(40px) saturate(180%)" }}>
        <div className="h-14" />
        <div className="px-5 pb-3 flex items-center justify-between">
          <h1 className="text-[22px] font-semibold text-[#1D1D1F] tracking-tight">消息</h1>
          {totalUnread > 0 && <span className="text-[12px] text-[#8E8E93]">{totalUnread} 条未读</span>}
        </div>
        <div className="h-[1px] bg-gradient-to-r from-transparent via-black/[0.06] to-transparent" />
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
        {threads.map((thread, i) => (
          <motion.button key={thread.id} className={`w-full flex items-center gap-3.5 px-5 py-3.5 text-left ${i < threads.length - 1 ? "border-b border-black/[0.04]" : ""}`} whileTap={{ backgroundColor: "rgba(0,0,0,0.02)" }} onClick={() => router.push(`/dashboard/chat/${thread.id}`)}>
            {/* Avatar */}
            <div className="w-[48px] h-[48px] rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: thread.color + "15" }}>
              <span className="text-[18px] font-bold" style={{ color: thread.color }}>{thread.initial}</span>
            </div>
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <p className="text-[15px] font-semibold text-[#1D1D1F] tracking-tight truncate">{thread.company}</p>
                <span className="text-[11px] text-[#AEAEB2] flex-shrink-0 ml-2">{thread.lastTime}</span>
              </div>
              <p className="text-[11px] text-[#8E8E93] mb-0.5">{thread.team}</p>
              <div className="flex items-center justify-between">
                <p className="text-[13px] text-[#8E8E93] truncate flex-1">{thread.lastMessage}</p>
                {thread.unread > 0 && (
                  <span className="flex-shrink-0 ml-2 min-w-[18px] h-[18px] bg-[#FF3B30] rounded-full text-[10px] text-white font-medium flex items-center justify-center px-1">{thread.unread}</span>
                )}
              </div>
            </div>
          </motion.button>
        ))}
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
  const [inboxTasks, setInboxTasks] = useState<InboxTask[]>(initialInboxTasks);

  const pendingCount = inboxTasks.filter(t => t.type !== "INFO_REPORT").length;

  const handleContinueSetup = () => {
    router.push("/onboarding/upload");
  };

  const handleDismissTask = (id: number) => {
    setInboxTasks(prev => prev.filter(t => t.id !== id));
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
      case 0: return <OverviewPage inboxTasks={inboxTasks} onDismissTask={handleDismissTask} />;
      case 1: return <RecommendedJobsFeed jobs={initialRecommendedJobs} />;
      case 2: return <MessageListPage threads={initialChatThreads} />;
      case 3: return <AssetPage />;
      default: return <OverviewPage inboxTasks={inboxTasks} onDismissTask={handleDismissTask} />;
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
