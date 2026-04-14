"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { candidateList, allCandidates, type CandidateAnalysis } from "@/lib/candidateData";
import { allJobPosts, type JobPost } from "@/lib/jobPostData";

/* ============ SVG Tab Icons ============ */
const IconHome = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#1D1D1F" : "#86868B"} strokeWidth={active ? 2 : 1.5}>
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9,22 9,12 15,12 15,22" />
  </svg>
);
const IconUsers = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#1D1D1F" : "#86868B"} strokeWidth={active ? 2 : 1.5}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const IconMessage = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#1D1D1F" : "#86868B"} strokeWidth={active ? 2 : 1.5}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
const IconBriefcase = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#1D1D1F" : "#86868B"} strokeWidth={active ? 2 : 1.5}>
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

/* ============ Bottom Tab Bar ============ */
function BottomTabBar({ activeTab, onTabChange, pendingCount = 0 }: { activeTab: number; onTabChange: (i: number) => void; pendingCount?: number }) {
  const tabs = [
    { icon: IconHome, label: "首页", badge: pendingCount > 0 ? pendingCount : undefined },
    { icon: IconUsers, label: "候选人" },
    { icon: IconMessage, label: "沟通" },
    { icon: IconBriefcase, label: "岗位" },
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

/* ============ Task Types (Overview / Inbox) ============ */
type TaskType = "URGENT_DECISION" | "NEED_REPLY" | "AGENT_SUGGESTION";
interface InboxTask {
  id: number; type: TaskType; candidateName: string; position: string; salary: string;
  chatId: number;
  alert?: string; hrQuestion?: string; agentDraft?: string;
  conflictPoint?: string; agentReason?: string; time?: string;
  resolved?: boolean; resolvedAction?: string;
}

const initialInboxTasks: InboxTask[] = [
  { id: 1, type: "URGENT_DECISION", candidateName: "张**", position: "高级Java后端", salary: "35-45K", chatId: 1,
    alert: "候选人正在被竞品抢人，需要在24小时内决定是否推进", time: "5 分钟前" },
  { id: 2, type: "NEED_REPLY", candidateName: "李**", position: "支付安全架构师", salary: "40-50K", chatId: 2,
    hrQuestion: "候选人提出希望Base不低于42K，且需要搬迁补贴3万",
    agentDraft: "建议同意42K的Base要求（在预算范围内），搬迁补贴可作为签字费的一部分覆盖，整体成本可控。",
    time: "1 小时前" },
  { id: 3, type: "AGENT_SUGGESTION", candidateName: "陈**", position: "后端工程师", salary: "25-30K", chatId: 5,
    conflictPoint: "经验年限不达标（3年 vs 要求5年），但有特殊亮点",
    agentReason: "虽然年限不足，但有ACM竞赛金牌背景，快手商业化核心开发经验。薪资预期也在预算下限以下，性价比极高。建议作为备选推进。",
    time: "30 分钟前" },
];

/* ============ Timeline ============ */
type TimelineItem =
  | { kind: "msg"; id: number; role: "agent" | "user"; text: string }
  | { kind: "task"; id: number; taskId: number }
  | { kind: "time"; id: number; text: string };

const initialTimeline: TimelineItem[] = [
  { kind: "time", id: -100, text: "昨天 09:00" },
  { kind: "msg", id: -99, role: "agent", text: "你好！我是你的 AI 招聘助理 ✌️" },
  { kind: "msg", id: -98, role: "agent", text: "接下来我会帮你筛选候选人、主动触达、协调面试。你只需要在关键节点做个决策就好。" },
  { kind: "msg", id: -97, role: "user", text: "好的，优先找系统设计能力强的候选人" },
  { kind: "msg", id: -96, role: "agent", text: "收到，已将「系统设计能力」标记为最高优先级筛选条件 💪" },
  { kind: "time", id: -90, text: "昨天 14:30" },
  { kind: "msg", id: -89, role: "agent", text: "初步扫描了 12,847 份简历，筛出 187 份符合硬性要求。" },
  { kind: "msg", id: -88, role: "agent", text: "其中有 5 位候选人匹配度超过 80%，已经在主动沟通了。" },
  { kind: "msg", id: -87, role: "agent", text: "张**（字节跳动）特别突出，系统设计和微服务经验都很强，建议重点推进。" },
  { kind: "time", id: -80, text: "今天 08:15" },
  { kind: "msg", id: -79, role: "agent", text: "早上好！昨晚跟几位候选人都聊上了，有几个事需要你决策 👇" },
  { kind: "msg", id: -78, role: "agent", text: "张**（字节跳动）面试表现很好，但竞品也在抢人：" },
  { kind: "task", id: -77, taskId: 1 },
  { kind: "msg", id: -76, role: "agent", text: "李**（蚂蚁集团）提出了薪资要求，我拟了个方案你看看：" },
  { kind: "task", id: -75, taskId: 2 },
  { kind: "msg", id: -74, role: "agent", text: "另外发现一个不完全匹配但有亮点的候选人，看看要不要推进？" },
  { kind: "task", id: -72, taskId: 3 },
];

/* ============ Chat Threads ============ */
type ThreadStatus = "agent_handling" | "need_reply" | "waiting_candidate" | "ended";
interface ChatThread {
  id: number; candidateName: string; position: string; avatar: string;
  lastTime: string; unread: number; hasUrgent: boolean;
  status: ThreadStatus; agentNote: string;
}
const initialChatThreads: ChatThread[] = [
  { id: 1, candidateName: "张**", position: "高级Java后端", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop&crop=face", lastTime: "5分钟前", unread: 2, hasUrgent: true, status: "need_reply", agentNote: "候选人正在被竞品抢人，急需推进" },
  { id: 2, candidateName: "李**", position: "支付安全架构师", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=96&h=96&fit=crop&crop=face", lastTime: "1小时前", unread: 1, hasUrgent: false, status: "need_reply", agentNote: "候选人提出薪资要求，等待你审核" },
  { id: 3, candidateName: "王**", position: "交易系统工程师", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=96&h=96&fit=crop&crop=face", lastTime: "3小时前", unread: 0, hasUrgent: false, status: "agent_handling", agentNote: "Agent正在安排二面时间" },
  { id: 4, candidateName: "赵**", position: "后端技术负责人", avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=96&h=96&fit=crop&crop=face", lastTime: "昨天", unread: 0, hasUrgent: false, status: "waiting_candidate", agentNote: "已安排真人对接，等待候选人回复" },
  { id: 5, candidateName: "陈**", position: "后端工程师", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=96&h=96&fit=crop&crop=face", lastTime: "2天前", unread: 0, hasUrgent: false, status: "ended", agentNote: "经验不足，已淘汰" },
];

/* ============ MiniCounter ============ */
function MiniCounter({ target }: { target: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const steps = 20; const inc = target / steps; let s = 0;
    const t = setInterval(() => { s++; setDisplay(Math.min(Math.round(inc * s), target)); if (s >= steps) clearInterval(t); }, 40);
    return () => clearInterval(t);
  }, [target]);
  return <span style={{ fontFeatureSettings: "'tnum'", fontWeight: 600 }}>{display.toLocaleString()}</span>;
}

/* ============ WaterFill ============ */
function WaterFill({ percent, label }: { percent: number; label: string }) {
  const p = Math.min(Math.max(percent, 0), 100);
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="relative w-[44px] h-[44px]">
        <svg width="44" height="44" viewBox="0 0 44 44">
          <circle cx="22" cy="22" r="19" fill="none" stroke="rgba(0,0,0,0.04)" strokeWidth="2.5" />
          <defs><clipPath id={`wc-${label}`}><circle cx="22" cy="22" r="18" /></clipPath></defs>
          <g clipPath={`url(#wc-${label})`}>
            <motion.rect x="0" width="44" height="44" fill="rgba(0,122,255,0.15)" initial={{ y: 44 }} animate={{ y: 44 - (p / 100) * 44 }} transition={{ duration: 1.5, ease: "easeOut" }} />
            <motion.path d="M0,0 Q5,-3 11,0 T22,0 T33,0 T44,0 V44 H0 Z" fill="rgba(0,122,255,0.12)" initial={{ y: 44 }} animate={{ y: 44 - (p / 100) * 44 - 2, x: [0, -11, 0] }} transition={{ y: { duration: 1.5, ease: "easeOut" }, x: { duration: 3, repeat: Infinity, ease: "easeInOut" } }} />
          </g>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[12px] font-bold text-[#1D1D1F]" style={{ fontFeatureSettings: "'tnum'" }}>{p}%</span>
        </div>
      </div>
      <span className="text-[9px] text-[#8E8E93]">{label}</span>
    </div>
  );
}

/* ============ Tab 0: Overview ============ */
function OverviewPage({ inboxTasks, onResolveTask }: { inboxTasks: InboxTask[]; onResolveTask: (id: number, action: string) => void }) {
  const router = useRouter();
  const [engineIdx, setEngineIdx] = useState(0);
  const [engineMenuOpen, setEngineMenuOpen] = useState(false);
  const engineStates = [
    { key: "active", label: "积极筛选中", color: "#34C759" },
    { key: "passive", label: "被动等待", color: "#FF9500" },
    { key: "stopped", label: "已停止", color: "#86868B" },
  ];
  const engine = engineStates[engineIdx];
  const [progress, setProgress] = useState(62);
  const taskRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const [timeline, setTimeline] = useState<TimelineItem[]>(initialTimeline);
  const [chatInput, setChatInput] = useState("");
  const [chatTyping, setChatTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [timeline, chatTyping]);

  const agentReplies = [
    "收到，我马上调整筛选策略。", "有新进展会第一时间通知你。", "明白了，已更新候选人评估标准。",
    "好的，我会重点关注这个方向的候选人。", "了解，正在联系候选人确认。",
  ];
  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    setTimeline(prev => [...prev, { kind: "msg", id: Date.now(), role: "user", text: chatInput }]);
    setChatInput(""); setChatTyping(true);
    setTimeout(() => { setChatTyping(false); setTimeline(prev => [...prev, { kind: "msg", id: Date.now() + 1, role: "agent", text: agentReplies[Math.floor(Math.random() * agentReplies.length)] }]); setProgress(prev => Math.min(prev + 1, 99)); }, 1200);
  };

  const pendingTasks = inboxTasks.filter(t => !t.resolved);
  const [pendingScrollIdx, setPendingScrollIdx] = useState(0);
  useEffect(() => { if (pendingTasks.length <= 1) return; const t = setInterval(() => setPendingScrollIdx(p => (p + 1) % pendingTasks.length), 3000); return () => clearInterval(t); }, [pendingTasks.length]);

  const typeConfig: Record<TaskType, { badge: string; dotColor: string }> = {
    URGENT_DECISION: { badge: "紧急决策", dotColor: "#FF3B30" },
    NEED_REPLY: { badge: "待处理", dotColor: "#007AFF" },
    AGENT_SUGGESTION: { badge: "助理建议", dotColor: "#FF9500" },
  };

  const AgentAvatar = () => (
    <div className="w-7 h-7 rounded-full bg-[#1D1D1F] flex items-center justify-center flex-shrink-0 mt-0.5" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
      <span className="text-[9px] font-bold text-white tracking-tight">A.</span>
    </div>
  );

  const handleResolve = (id: number, action: string) => {
    onResolveTask(id, action);
  };

  const renderTaskCard = (task: InboxTask) => {
    const tc = typeConfig[task.type];
    return (
      <div
        ref={el => { taskRefs.current[task.id] = el; }}
        className="rounded-2xl overflow-hidden cursor-pointer"
        style={{ background: "rgba(255,255,255,0.85)", boxShadow: "0 1px 8px rgba(0,0,0,0.05), inset 0 0 0 0.5px rgba(0,0,0,0.04)", opacity: task.resolved ? 0.55 : 1 }}
        onClick={() => router.push(`/employer/dashboard/chat/${task.chatId}`)}
      >
        <div className="px-3.5 py-3">
          {/* Badge */}
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <div className="w-[6px] h-[6px] rounded-full" style={{ backgroundColor: task.resolved ? "#AEAEB2" : tc.dotColor }} />
              <span className="text-[11px] font-medium" style={{ color: task.resolved ? "#AEAEB2" : tc.dotColor }}>{tc.badge}</span>
            </div>
            {task.time && <span className="text-[10px] text-[#AEAEB2]">{task.time}</span>}
          </div>
          {/* Candidate info */}
          <p className="text-[14px] font-semibold text-[#1D1D1F] tracking-tight mb-1">
            {task.candidateName} · {task.position}{task.salary ? <span className="text-[12px] text-[#8E8E93] font-normal ml-1.5">{task.salary}</span> : null}
          </p>
          {/* Type content */}
          {task.type === "URGENT_DECISION" && task.alert && (
            <p className="text-[13px] text-[#1D1D1F] leading-[1.5] mb-2">{task.alert}</p>
          )}
          {task.type === "NEED_REPLY" && (
            <div className="mb-2">
              {task.hrQuestion && (
                <div className="mb-1.5">
                  <p className="text-[10px] text-[#AEAEB2] mb-0.5">候选人诉求</p>
                  <p className="text-[13px] text-[#1D1D1F] leading-[1.5]">{task.hrQuestion}</p>
                </div>
              )}
              {task.agentDraft && (
                <div>
                  <p className="text-[10px] text-[#AEAEB2] mb-0.5">助理建议</p>
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
                <motion.button className={`flex-1 h-[34px] rounded-xl text-[12px] font-medium ${task.resolved ? (task.resolvedAction === "帮我推进" ? "bg-[#1D1D1F] text-white" : "bg-black/[0.03] text-[#AEAEB2]") : "bg-[#1D1D1F] text-white"}`} style={!task.resolved || task.resolvedAction === "帮我推进" ? { boxShadow: "0 1px 6px rgba(0,0,0,0.1)" } : {}} whileTap={!task.resolved ? { scale: 0.97 } : {}} onClick={() => !task.resolved && handleResolve(task.id, "帮我推进")}>{task.resolved && task.resolvedAction === "帮我推进" ? "已推进" : "帮我推进"}</motion.button>
                <motion.button className={`flex-1 h-[34px] rounded-xl text-[12px] font-medium ${task.resolved ? (task.resolvedAction === "我亲自谈" ? "bg-[#1D1D1F] text-white" : "bg-black/[0.03] text-[#AEAEB2]") : "bg-black/[0.04] text-[#1D1D1F]"}`} style={task.resolved && task.resolvedAction === "我亲自谈" ? { boxShadow: "0 1px 6px rgba(0,0,0,0.1)" } : {}} whileTap={!task.resolved ? { scale: 0.97 } : {}} onClick={() => !task.resolved && handleResolve(task.id, "我亲自谈")}>{task.resolved && task.resolvedAction === "我亲自谈" ? "已选择亲自谈" : "我亲自谈"}</motion.button>
              </>
            )}
            {task.type === "NEED_REPLY" && (
              <>
                <motion.button className={`flex-1 h-[34px] rounded-xl text-[12px] font-medium ${task.resolved ? (task.resolvedAction === "帮我推进" ? "bg-[#1D1D1F] text-white" : "bg-black/[0.03] text-[#AEAEB2]") : "bg-[#1D1D1F] text-white"}`} style={!task.resolved || task.resolvedAction === "帮我推进" ? { boxShadow: "0 1px 6px rgba(0,0,0,0.1)" } : {}} whileTap={!task.resolved ? { scale: 0.97 } : {}} onClick={() => !task.resolved && handleResolve(task.id, "帮我推进")}>{task.resolved && task.resolvedAction === "帮我推进" ? "已推进" : "帮我推进"}</motion.button>
                <motion.button className={`flex-1 h-[34px] rounded-xl text-[12px] font-medium ${task.resolved ? (task.resolvedAction === "我亲自谈" ? "bg-[#1D1D1F] text-white" : "bg-black/[0.03] text-[#AEAEB2]") : "bg-black/[0.04] text-[#1D1D1F]"}`} style={task.resolved && task.resolvedAction === "我亲自谈" ? { boxShadow: "0 1px 6px rgba(0,0,0,0.1)" } : {}} whileTap={!task.resolved ? { scale: 0.97 } : {}} onClick={() => !task.resolved && handleResolve(task.id, "我亲自谈")}>{task.resolved && task.resolvedAction === "我亲自谈" ? "已选择亲自谈" : "我亲自谈"}</motion.button>
              </>
            )}
            {task.type === "AGENT_SUGGESTION" && (
              <>
                <motion.button className={`flex-1 h-[34px] rounded-xl text-[12px] font-medium ${task.resolved ? (task.resolvedAction === "帮我推进" ? "bg-[#1D1D1F] text-white" : "bg-black/[0.03] text-[#AEAEB2]") : "bg-[#1D1D1F] text-white"}`} style={!task.resolved || task.resolvedAction === "帮我推进" ? { boxShadow: "0 1px 6px rgba(0,0,0,0.1)" } : {}} whileTap={!task.resolved ? { scale: 0.97 } : {}} onClick={() => !task.resolved && handleResolve(task.id, "帮我推进")}>{task.resolved && task.resolvedAction === "帮我推进" ? "已推进" : "帮我推进"}</motion.button>
                <motion.button className={`flex-1 h-[34px] rounded-xl text-[12px] font-medium ${task.resolved ? (task.resolvedAction === "跳过" ? "bg-[#1D1D1F] text-white" : "bg-black/[0.03] text-[#AEAEB2]") : "bg-black/[0.04] text-[#8E8E93]"}`} style={task.resolved && task.resolvedAction === "跳过" ? { boxShadow: "0 1px 6px rgba(0,0,0,0.1)" } : {}} whileTap={!task.resolved ? { scale: 0.97 } : {}} onClick={() => !task.resolved && handleResolve(task.id, "跳过")}>{task.resolved && task.resolvedAction === "跳过" ? "已跳过" : "跳过"}</motion.button>
              </>
            )}
          </div>
          {task.resolved && (
            <p className="text-[12px] text-[#AEAEB2] mt-1.5">已处理：{task.resolvedAction}</p>
          )}
        </div>
      </div>
    );
  };

  const shouldShowAvatar = (idx: number): boolean => {
    if (idx === 0) return true;
    const cur = timeline[idx]; const prev = timeline[idx - 1];
    if (cur.kind === "msg" && cur.role === "agent" && prev.kind === "msg" && prev.role === "agent") return false;
    if (cur.kind === "task" && (prev.kind === "msg" && prev.role === "agent" || prev.kind === "task")) return false;
    return true;
  };

  return (
    <div className="flex flex-col h-screen bg-[#F5F5F7]">
      {/* Header */}
      <div className="sticky top-0 z-30 flex-shrink-0" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.78) 100%)", backdropFilter: "blur(40px) saturate(180%)" }}>
        <div className="h-14" />
        <div className="px-5 flex items-center gap-3 pb-3">
          <div className="w-10 h-10 rounded-full bg-[#1D1D1F] flex items-center justify-center flex-shrink-0" style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
            <span className="text-[13px] font-bold text-white tracking-tight">A.</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[16px] font-semibold text-[#1D1D1F] tracking-tight leading-tight">招聘助理</p>
            <div className="relative inline-block">
              <motion.button className="flex items-center gap-1.5 mt-0.5" whileTap={{ scale: 0.97 }} onClick={() => setEngineMenuOpen(!engineMenuOpen)}>
                <div className="w-[5px] h-[5px] rounded-full" style={{ backgroundColor: engine.color }} />
                <span className="text-[11px] text-[#6E6E73]">{engine.label}</span>
                <motion.svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="2.5" animate={{ rotate: engineMenuOpen ? 180 : 0 }}><path d="m6 9 6 6 6-6"/></motion.svg>
              </motion.button>
              <AnimatePresence>
                {engineMenuOpen && (
                  <>
                    <motion.div className="fixed inset-0 z-40" onClick={() => setEngineMenuOpen(false)} />
                    <motion.div className="absolute left-0 top-[24px] z-50 min-w-[140px] rounded-2xl overflow-hidden py-1" style={{ background: "rgba(255,255,255,0.88)", backdropFilter: "blur(40px)", boxShadow: "0 4px 24px rgba(0,0,0,0.1)" }} initial={{ opacity: 0, scale: 0.9, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: -4 }}>
                      {engineStates.map((s, i) => (
                        <motion.button key={s.key} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left" whileTap={{ backgroundColor: "rgba(0,0,0,0.04)" }} onClick={() => { setEngineIdx(i); setEngineMenuOpen(false); }}>
                          <div className="w-[6px] h-[6px] rounded-full" style={{ backgroundColor: s.color }} />
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
          <WaterFill percent={progress} label="招聘进度" />
        </div>
        <div className="h-[1px] bg-gradient-to-r from-transparent via-black/[0.06] to-transparent" />
        <AnimatePresence>
          {pendingTasks.length > 0 && (
            <motion.div className="flex items-center gap-2.5 px-5 py-2.5 cursor-pointer" style={{ background: "rgba(255,255,255,0.6)" }} whileTap={{ backgroundColor: "rgba(0,0,0,0.02)" }} onClick={() => { const f = pendingTasks[0]; taskRefs.current[f?.id]?.scrollIntoView({ behavior: "smooth", block: "center" }); }}>
              <motion.div className="w-[22px] h-[22px] rounded-full bg-[#FF3B30] flex items-center justify-center" animate={{ scale: [1, 1.12, 1] }} transition={{ duration: 2, repeat: Infinity }}><span className="text-[11px] font-bold text-white">{pendingTasks.length}</span></motion.div>
              <span className="text-[13px] font-semibold text-[#1D1D1F]">项待处理</span>
              <div className="flex-1 min-w-0 overflow-hidden h-[16px]">
                <AnimatePresence mode="wait">
                  <motion.p key={pendingTasks[pendingScrollIdx % pendingTasks.length]?.id} className="text-[11px] text-[#8E8E93] truncate leading-[16px]" initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -14, opacity: 0 }}>{pendingTasks[pendingScrollIdx % pendingTasks.length]?.candidateName} {typeConfig[pendingTasks[pendingScrollIdx % pendingTasks.length]?.type]?.badge}</motion.p>
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto pb-[140px]">
        <div className="px-4 pt-4 space-y-2">
          {timeline.map((item, idx) => {
            if (item.kind === "time") return <div key={item.id} className="flex items-center gap-3 py-3"><div className="flex-1 h-px bg-black/[0.06]" /><span className="text-[11px] text-[#C7C7CC] font-medium">{item.text}</span><div className="flex-1 h-px bg-black/[0.06]" /></div>;
            if (item.kind === "msg" && item.role === "agent") { const sa = shouldShowAvatar(idx); return <motion.div key={item.id} className="flex items-start gap-2" initial={item.id >= 0 ? { opacity: 0, y: 8 } : false} animate={{ opacity: 1, y: 0 }}>{sa ? <AgentAvatar /> : <div className="w-7 flex-shrink-0" />}<div className="rounded-2xl rounded-tl-md px-3.5 py-2.5 max-w-[82%]" style={{ background: "rgba(255,255,255,0.8)", boxShadow: "0 1px 4px rgba(0,0,0,0.03)" }}><p className="text-[14px] text-[#1D1D1F] leading-relaxed">{item.text}</p></div></motion.div>; }
            if (item.kind === "msg" && item.role === "user") return <motion.div key={item.id} className="flex justify-end" initial={item.id >= 0 ? { opacity: 0, y: 8 } : false} animate={{ opacity: 1, y: 0 }}><div className="bg-[#1D1D1F] rounded-2xl rounded-tr-md px-3.5 py-2.5 max-w-[78%]"><p className="text-[14px] text-white leading-relaxed">{item.text}</p></div></motion.div>;
            if (item.kind === "task") { const task = inboxTasks.find(t => t.id === item.taskId); if (!task) return null; const sa = shouldShowAvatar(idx); return <div key={item.id} className="flex items-start gap-2">{sa ? <AgentAvatar /> : <div className="w-7 flex-shrink-0" />}<div className="flex-1 max-w-[88%]">{renderTaskCard(task)}</div></div>; }
            return null;
          })}
          {chatTyping && <div className="flex items-start gap-2"><AgentAvatar /><div className="rounded-2xl rounded-tl-md px-3.5 py-2.5" style={{ background: "rgba(255,255,255,0.8)" }}><div className="flex gap-1 items-center h-[20px]"><motion.div className="w-1.5 h-1.5 bg-[#AEAEB2] rounded-full" animate={{ y: [0, -3, 0] }} transition={{ duration: 0.6, repeat: Infinity }} /><motion.div className="w-1.5 h-1.5 bg-[#AEAEB2] rounded-full" animate={{ y: [0, -3, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }} /><motion.div className="w-1.5 h-1.5 bg-[#AEAEB2] rounded-full" animate={{ y: [0, -3, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }} /></div></div></div>}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="fixed bottom-[68px] left-1/2 -translate-x-1/2 w-[430px] z-30" style={{ background: "linear-gradient(to top, #F5F5F7 80%, transparent)" }}>
        <div className="px-5 pb-3 pt-3">
          <div className="flex items-end gap-2.5">
            <div className="flex-1 flex items-end rounded-2xl px-4 py-2.5" style={{ background: "rgba(255,255,255,0.8)", boxShadow: "0 1px 8px rgba(0,0,0,0.04), inset 0 0 0 0.5px rgba(0,0,0,0.04)", minHeight: "42px" }}>
              <input type="text" placeholder="给招聘助理说点什么..." className="flex-1 text-[15px] text-[#1D1D1F] placeholder-[#AEAEB2] bg-transparent outline-none leading-[1.4]" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === "Enter" && chatInput.trim() && handleSendChat()} />
            </div>
            <AnimatePresence mode="wait">
              {chatInput.trim() ? (
                <motion.button key="send" className="flex-shrink-0 w-[38px] h-[38px] rounded-full bg-[#1D1D1F] flex items-center justify-center" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} transition={{ type: "spring", stiffness: 400, damping: 20 }} whileTap={{ scale: 0.85 }} onClick={handleSendChat}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M12 19V5" /><path d="m5 12 7-7 7 7" /></svg>
                </motion.button>
              ) : (
                <motion.button key="voice" className="flex-shrink-0 w-[38px] h-[38px] rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.04)" }} initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ Tab 1: Candidates ============ */
function CandidatesPage() {
  type FilterKey = "new" | "ongoing" | "ended";
  const [filter, setFilter] = useState<FilterKey>("new");
  const [selected, setSelected] = useState<CandidateAnalysis | null>(null);

  const stats = { screened: candidateList.filter(c => c.status !== "ended").length, ongoing: candidateList.filter(c => c.status === "ongoing").length };

  const filtered = candidateList.filter(c => c.status === filter);
  const filters: { key: FilterKey; label: string; count: number }[] = [
    { key: "new", label: "新推荐", count: candidateList.filter(c => c.status === "new").length },
    { key: "ongoing", label: "推进中", count: candidateList.filter(c => c.status === "ongoing").length },
    { key: "ended", label: "已结束", count: candidateList.filter(c => c.status === "ended").length },
  ];

  const levelConfig = (score: number) => score >= 90 ? { label: "强烈推荐", color: "#FF3B30", bg: "rgba(255,59,48,0.08)" } : score >= 80 ? { label: "推荐", color: "#FF9F0A", bg: "rgba(255,159,10,0.08)" } : { label: "可考虑", color: "#8E8E93", bg: "rgba(0,0,0,0.04)" };

  if (selected) {
    const lv = levelConfig(selected.matchScore);
    return (
      <div className="fixed inset-0 z-50 bg-[#F5F5F7] flex flex-col" style={{ maxWidth: 430, margin: "0 auto" }}>
        <div className="sticky top-0 z-30 flex-shrink-0" style={{ background: "rgba(255,255,255,0.88)", backdropFilter: "blur(40px)" }}>
          <div className="h-14" />
          <div className="px-5 pb-2"><motion.button className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.04)" }} whileTap={{ scale: 0.9 }} onClick={() => setSelected(null)}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1D1D1F" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg></motion.button></div>
          <div className="px-5 pb-1 flex items-center justify-between">
            <div className="flex items-center gap-3"><img src={selected.avatar} className="w-10 h-10 rounded-xl object-cover" /><div><p className="text-[18px] font-bold text-[#1D1D1F]">{selected.name}</p><p className="text-[12px] text-[#8E8E93]">{selected.currentCompany} · {selected.currentPosition}</p></div></div>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold" style={{ color: lv.color, backgroundColor: lv.bg }}>{lv.label}</span>
          </div>
          <div className="px-5 pb-3"><p className="text-[12px] text-[#AEAEB2]">{selected.experience}经验 · 匹配 {selected.matchScore}% · 期望 {selected.salary.expected}</p></div>
          <div className="h-[1px] bg-gradient-to-r from-transparent via-black/[0.06] to-transparent" />
        </div>
        <div className="flex-1 overflow-y-auto px-5 pt-4 pb-32 space-y-3">
          <div className="rounded-2xl px-4 py-4" style={{ background: "rgba(255,255,255,0.75)", boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}>
            <div className="flex items-center gap-2 mb-3"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="2"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.287 1.288L3 12l5.8 1.9a2 2 0 0 1 1.288 1.287L12 21l1.9-5.8a2 2 0 0 1 1.287-1.288L21 12l-5.8-1.9a2 2 0 0 1-1.288-1.287Z" /></svg><span className="text-[13px] font-semibold text-[#1D1D1F]">AI 匹配分析</span></div>
            <p className="text-[15px] font-semibold text-[#1D1D1F] leading-[1.5] mb-3">{selected.aiAnalysis.summary}</p>
            <div className="space-y-2 mb-3">{selected.aiAnalysis.strengths.map((s, i) => <div key={i} className="flex items-start gap-2.5"><div className="w-[18px] h-[18px] rounded-full bg-[#32D74B]/10 flex items-center justify-center flex-shrink-0 mt-[1px]"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#32D74B" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg></div><p className="text-[13px] text-[#1D1D1F]/70 leading-[1.6]">{s}</p></div>)}</div>
            {selected.aiAnalysis.risks.length > 0 && <div className="space-y-2 pt-2.5" style={{ borderTop: "0.5px solid rgba(0,0,0,0.06)" }}>{selected.aiAnalysis.risks.map((r, i) => <div key={i} className="flex items-start gap-2.5"><div className="w-[18px] h-[18px] rounded-full bg-[#FF9500]/10 flex items-center justify-center flex-shrink-0 mt-[1px]"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#FF9500" strokeWidth="3"><path d="M12 9v4"/><circle cx="12" cy="17" r="0.5" fill="#FF9500"/></svg></div><p className="text-[13px] text-[#8E8E93] leading-[1.6]">{r}</p></div>)}</div>}
          </div>
          {/* Skills */}
          <div className="rounded-2xl px-4 py-4" style={{ background: "rgba(255,255,255,0.75)", boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}>
            <p className="text-[13px] font-semibold text-[#1D1D1F] mb-3">能力评估</p>
            <div className="space-y-3">{selected.skills.map(s => <div key={s.name} className="flex items-center gap-3"><span className="text-[12px] text-[#8E8E93] w-16 flex-shrink-0">{s.name}</span><div className="flex-1 h-[6px] bg-black/[0.04] rounded-full overflow-hidden"><motion.div className="h-full rounded-full bg-[#007AFF]" initial={{ width: 0 }} animate={{ width: `${(s.level / 5) * 100}%` }} transition={{ duration: 0.8, delay: 0.2 }} /></div><span className="text-[11px] text-[#AEAEB2] w-6 text-right">L{s.level}</span></div>)}</div>
          </div>
          <div className="flex flex-wrap gap-1.5 px-1">{selected.tags.map(t => <span key={t.label} className="text-[11px] font-medium px-2 py-0.5 rounded-md" style={{ color: t.type === "negative" ? "#8E8E93" : "#FF9500", backgroundColor: t.type === "negative" ? "rgba(0,0,0,0.04)" : "rgba(255,149,0,0.08)" }}>{t.label}</span>)}</div>
        </div>
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[430px] px-5 pb-8 pt-3 z-30" style={{ background: "linear-gradient(to top, #F5F5F7 70%, transparent)" }}>
          <div className="flex gap-2.5">
            <motion.button className="h-[48px] px-5 rounded-2xl text-[15px] font-medium text-[#8E8E93]" style={{ backgroundColor: "rgba(0,0,0,0.04)" }} whileTap={{ scale: 0.97 }} onClick={() => setSelected(null)}>不合适</motion.button>
            <motion.button className="flex-1 h-[48px] rounded-2xl bg-[#1D1D1F] text-white text-[15px] font-semibold" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.12)" }} whileTap={{ scale: 0.97 }} onClick={() => setSelected(null)}>推进到下一轮</motion.button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#F5F5F7]">
      <div className="sticky top-0 z-30 flex-shrink-0" style={{ background: "rgba(255,255,255,0.88)", backdropFilter: "blur(40px)" }}>
        <div className="h-14" />
        <div className="px-5 pb-3">
          <h1 className="text-[22px] font-semibold text-[#1D1D1F] tracking-tight mb-1">候选人</h1>
          <p className="text-[12px] text-[#8E8E93] mb-2.5">有效 <MiniCounter target={stats.screened} /> · 推进中 <MiniCounter target={stats.ongoing} /></p>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {filters.map(f => (
              <motion.button key={f.key} className={`flex items-center gap-1.5 h-[32px] px-3 rounded-full text-[12px] font-medium whitespace-nowrap ${filter === f.key ? "bg-[#1D1D1F] text-white" : "text-[#8E8E93]"}`} style={filter !== f.key ? { backgroundColor: "rgba(0,0,0,0.03)" } : {}} whileTap={{ scale: 0.96 }} onClick={() => setFilter(f.key)}><span>{f.label}</span><span className={`text-[10px] ${filter === f.key ? "text-white/50" : "text-[#AEAEB2]"}`}>{f.count}</span></motion.button>
            ))}
          </div>
        </div>
        <div className="h-[1px] bg-gradient-to-r from-transparent via-black/[0.06] to-transparent" />
      </div>
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-24 space-y-3">
        {filtered.map(c => {
          const lv = levelConfig(c.matchScore);
          return (
            <motion.div key={c.id} className="rounded-2xl overflow-hidden cursor-pointer" style={{ background: "rgba(255,255,255,0.75)", boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }} whileTap={{ scale: 0.98 }} onClick={() => setSelected(c)}>
              <div className="px-4 py-4">
                <div className="flex items-center gap-3 mb-2">
                  <img src={c.avatar} className="w-10 h-10 rounded-xl object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between"><p className="text-[15px] font-semibold text-[#1D1D1F]">{c.name}</p><span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ color: lv.color, backgroundColor: lv.bg }}>{lv.label}</span></div>
                    <p className="text-[12px] text-[#8E8E93]">{c.currentCompany} · {c.currentPosition} · {c.experience}</p>
                  </div>
                </div>
                <p className="text-[13px] text-[#1D1D1F]/65 leading-[1.5] mb-2">{c.aiReason}</p>
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1.5">{c.tags.slice(0, 3).map(t => <span key={t.label} className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ color: t.type === "negative" ? "#8E8E93" : "#FF9500", backgroundColor: t.type === "negative" ? "rgba(0,0,0,0.04)" : "rgba(255,149,0,0.08)" }}>{t.label}</span>)}</div>
                  <span className="text-[11px] text-[#AEAEB2]">匹配 {c.matchScore}%</span>
                </div>
              </div>
            </motion.div>
          );
        })}
        {filtered.length === 0 && <div className="flex flex-col items-center py-16"><p className="text-[14px] text-[#AEAEB2]">暂无候选人</p></div>}
      </div>
    </div>
  );
}

/* ============ Tab 2: Messages ============ */
function MessageListPage() {
  const router = useRouter();
  return (
    <div className="flex flex-col h-screen bg-[#F5F5F7]">
      <div className="sticky top-0 z-30 flex-shrink-0" style={{ background: "rgba(255,255,255,0.88)", backdropFilter: "blur(40px)" }}>
        <div className="h-14" />
        <div className="px-5 pb-3"><h1 className="text-[22px] font-semibold text-[#1D1D1F] tracking-tight">沟通</h1></div>
        <div className="h-[1px] bg-gradient-to-r from-transparent via-black/[0.06] to-transparent" />
      </div>
      <div className="flex-1 overflow-y-auto pb-24">
        {initialChatThreads.map((thread, i) => {
          const isEnded = thread.status === "ended";
          return (
            <motion.button key={thread.id} className={`w-full flex items-center gap-3.5 px-5 py-3.5 text-left ${i < initialChatThreads.length - 1 ? "border-b border-black/[0.04]" : ""}`} style={{ opacity: isEnded ? 0.45 : 1 }} whileTap={{ backgroundColor: "rgba(0,0,0,0.02)" }} onClick={() => router.push(`/employer/dashboard/chat/${thread.id}`)}>
              <div className="relative flex-shrink-0">
                <img src={thread.avatar} alt="" className="w-[48px] h-[48px] rounded-2xl object-cover" style={{ filter: isEnded ? "grayscale(1) opacity(0.6)" : "none" }} />
                {thread.status === "need_reply" && thread.hasUrgent && <div className="absolute -top-0.5 -right-0.5 w-[12px] h-[12px] rounded-full bg-[#FF3B30] border-2 border-[#F5F5F7]" />}
                {thread.status === "need_reply" && !thread.hasUrgent && <div className="absolute -top-0.5 -right-0.5 w-[12px] h-[12px] rounded-full bg-[#FF9500] border-2 border-[#F5F5F7]" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <p className="text-[15px] font-semibold text-[#1D1D1F] truncate">{thread.candidateName}</p>
                    {thread.status === "agent_handling" && <span className="text-[10px] font-medium text-[#AEAEB2] px-1.5 py-0.5 rounded-md bg-black/[0.03]">代理沟通</span>}
                  </div>
                  <span className="text-[11px] text-[#AEAEB2] flex-shrink-0 ml-2">{thread.lastTime}</span>
                </div>
                <p className="text-[12px] text-[#8E8E93] mb-0.5">{thread.position}</p>
                <div className="flex items-center justify-between">
                  <p className="text-[13px] text-[#8E8E93] truncate flex-1">{thread.agentNote}</p>
                  {thread.unread > 0 && <span className="flex-shrink-0 ml-2 min-w-[18px] h-[18px] bg-[#FF3B30] rounded-full text-[10px] text-white font-medium flex items-center justify-center px-1">{thread.unread}</span>}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/* ============ Tab 3: Jobs ============ */
function JobsPage() {
  const [selectedJob, setSelectedJob] = useState<JobPost | null>(null);
  const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    active: { label: "招聘中", color: "#34C759", bg: "rgba(52,199,89,0.08)" },
    paused: { label: "已暂停", color: "#FF9500", bg: "rgba(255,149,0,0.08)" },
    closed: { label: "已关闭", color: "#8E8E93", bg: "rgba(0,0,0,0.04)" },
  };

  if (selectedJob) {
    const sc = statusConfig[selectedJob.status];
    const { funnel } = selectedJob;
    return (
      <div className="fixed inset-0 z-50 bg-[#F5F5F7] flex flex-col" style={{ maxWidth: 430, margin: "0 auto" }}>
        <div className="sticky top-0 z-30" style={{ background: "rgba(255,255,255,0.88)", backdropFilter: "blur(40px)" }}>
          <div className="h-14" />
          <div className="px-5 pb-2"><motion.button className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.04)" }} whileTap={{ scale: 0.9 }} onClick={() => setSelectedJob(null)}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1D1D1F" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg></motion.button></div>
          <div className="px-5 pb-1 flex items-center justify-between"><p className="text-[20px] font-bold text-[#1D1D1F]">{selectedJob.title}</p><span className="px-2.5 py-1 rounded-full text-[11px] font-semibold" style={{ color: sc.color, backgroundColor: sc.bg }}>{sc.label}</span></div>
          <div className="px-5 pb-3"><p className="text-[13px] text-[#8E8E93]">{selectedJob.department} · {selectedJob.salary} · {selectedJob.createdAt}发布</p></div>
          <div className="h-[1px] bg-gradient-to-r from-transparent via-black/[0.06] to-transparent" />
        </div>
        <div className="flex-1 overflow-y-auto px-5 pt-4 pb-32 space-y-3">
          {/* Funnel */}
          <div className="rounded-2xl px-4 py-4" style={{ background: "rgba(255,255,255,0.75)", boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}>
            <p className="text-[13px] font-semibold text-[#1D1D1F] mb-3">候选人漏斗</p>
            <div className="space-y-3">
              {[
                { label: "投递", value: funnel.applied, color: "#007AFF", width: 100 },
                { label: "筛选", value: funnel.screened, color: "#5856D6", width: (funnel.screened / funnel.applied) * 100 },
                { label: "面试", value: funnel.interview, color: "#FF9500", width: (funnel.interview / funnel.applied) * 100 },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-3">
                  <span className="text-[12px] text-[#8E8E93] w-8">{s.label}</span>
                  <div className="flex-1 h-[8px] bg-black/[0.04] rounded-full overflow-hidden"><motion.div className="h-full rounded-full" style={{ backgroundColor: s.color }} initial={{ width: 0 }} animate={{ width: `${Math.max(s.width, 3)}%` }} transition={{ duration: 0.8 }} /></div>
                  <span className="text-[12px] font-semibold text-[#1D1D1F] w-8 text-right">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Agent理解 */}
          <div className="rounded-2xl px-4 py-4" style={{ background: "rgba(255,255,255,0.75)", boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}>
            <p className="text-[13px] font-semibold text-[#1D1D1F] mb-2">Agent 理解</p>
            <p className="text-[13px] text-[#1D1D1F]/70 leading-[1.6]">{selectedJob.agentUnderstanding}</p>
          </div>
          {/* JD原文 */}
          <div className="rounded-2xl px-4 py-4" style={{ background: "rgba(255,255,255,0.75)", boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}>
            <p className="text-[13px] font-semibold text-[#1D1D1F] mb-2">岗位描述</p>
            <p className="text-[13px] text-[#1D1D1F]/70 leading-[1.6]">{selectedJob.jdSummary}</p>
          </div>
          <div className="flex items-center gap-4 px-1">
            <div className="flex items-center gap-1.5"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#AEAEB2" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg><span className="text-[12px] text-[#AEAEB2]">已开放 {selectedJob.daysOpen} 天</span></div>
            {selectedJob.estimatedDays > 0 && <><div className="w-[3px] h-[3px] rounded-full bg-[#D1D1D6]" /><span className="text-[12px] text-[#AEAEB2]">预计还需 {selectedJob.estimatedDays} 天</span></>}
            <div className="w-[3px] h-[3px] rounded-full bg-[#D1D1D6]" /><span className="text-[12px] text-[#AEAEB2]">竞争力 {selectedJob.competitiveness}%</span>
          </div>
        </div>
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[430px] px-5 pb-8 pt-3 z-30" style={{ background: "linear-gradient(to top, #F5F5F7 70%, transparent)" }}>
          <div className="flex gap-2.5">
            <motion.button className="h-[48px] px-5 rounded-2xl text-[15px] font-medium text-[#8E8E93]" style={{ backgroundColor: "rgba(0,0,0,0.04)" }} whileTap={{ scale: 0.97 }} onClick={() => setSelectedJob(null)}>{selectedJob.status === "active" ? "暂停招聘" : "关闭岗位"}</motion.button>
            <motion.button className="flex-1 h-[48px] rounded-2xl bg-[#1D1D1F] text-white text-[15px] font-semibold" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.12)" }} whileTap={{ scale: 0.97 }} onClick={() => setSelectedJob(null)}>编辑 JD</motion.button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#F5F5F7]">
      <div className="sticky top-0 z-30" style={{ background: "rgba(255,255,255,0.88)", backdropFilter: "blur(40px)" }}>
        <div className="h-14" />
        <div className="px-5 pb-3"><h1 className="text-[22px] font-semibold text-[#1D1D1F] tracking-tight">岗位管理</h1><p className="text-[12px] text-[#8E8E93] mt-0.5">共 {allJobPosts.length} 个岗位</p></div>
        <div className="h-[1px] bg-gradient-to-r from-transparent via-black/[0.06] to-transparent" />
      </div>
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-24 space-y-3">
        {allJobPosts.map(job => {
          const sc = statusConfig[job.status];
          const { funnel } = job;
          return (
            <motion.div key={job.id} className={`rounded-2xl overflow-hidden cursor-pointer ${job.status === "closed" ? "opacity-60" : ""}`} style={{ background: "rgba(255,255,255,0.75)", boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }} whileTap={{ scale: 0.98 }} onClick={() => setSelectedJob(job)}>
              <div className="px-4 py-4">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[16px] font-semibold text-[#1D1D1F] tracking-tight">{job.title}</p>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ color: sc.color, backgroundColor: sc.bg }}>{sc.label}</span>
                </div>
                <p className="text-[12px] text-[#8E8E93] mb-3">{job.department} · {job.salary}</p>
                {/* Mini funnel */}
                <div className="flex items-center gap-2 mb-2">
                  {[{ label: "投递", v: funnel.applied }, { label: "筛选", v: funnel.screened }, { label: "面试", v: funnel.interview }].map((s, i) => (
                    <div key={s.label} className="flex items-center gap-1">
                      <span className="text-[11px] text-[#AEAEB2]">{s.label}</span>
                      <span className="text-[11px] font-semibold text-[#1D1D1F]">{s.v}</span>
                      {i < 3 && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#D1D1D6" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#AEAEB2]">已开放 {job.daysOpen} 天</span>
                  {job.estimatedDays > 0 && <><span className="text-[11px] text-[#AEAEB2]">·</span><span className="text-[11px] text-[#AEAEB2]">预计还需 {job.estimatedDays} 天</span></>}
                </div>
              </div>
            </motion.div>
          );
        })}
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

  const handleResolveTask = (id: number, action: string) => {
    setInboxTasks(prev => prev.map(t => t.id === id ? { ...t, resolved: true, resolvedAction: action } : t));
  };

  const content = () => {
    if (incomplete) {
      return <OverviewPage inboxTasks={inboxTasks} onResolveTask={handleResolveTask} />;
    }
    switch (activeTab) {
      case 0: return <OverviewPage inboxTasks={inboxTasks} onResolveTask={handleResolveTask} />;
      case 1: return <CandidatesPage />;
      case 2: return <MessageListPage />;
      case 3: return <JobsPage />;
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

export default function EmployerDashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAFAFA]" />}>
      <DashboardInner />
    </Suspense>
  );
}
