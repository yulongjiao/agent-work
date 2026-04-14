"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { allCandidates, type CandidateAnalysis } from "@/lib/candidateData";

/* ============ Types ============ */
type Sender = "employer" | "candidate";
type SenderType = "ai" | "human";

interface ChatMessage { id: number; sender: Sender; senderType: SenderType; text: string; }
interface SystemPrompt { id: number; text: string; type?: "info" | "warning" | "takeover"; }
interface TimeSeparator { id: number; text: string; }
type ChatItem = (ChatMessage & { kind: "msg" }) | (SystemPrompt & { kind: "sys" }) | (TimeSeparator & { kind: "time" });

interface ChatContext { status: string; statusColor: string; items: ChatItem[]; approval?: ApprovalInfo; }

/* ============ Approval Types ============ */
interface ApprovalInfo {
  type: "URGENT_DECISION" | "NEED_REPLY" | "AGENT_SUGGESTION";
  badge: string;
  dotColor: string;
  summary: string;
  detail?: string;
  agentDraft?: string;
  actions: { label: string; primary: boolean }[];
}

/* ============ Mock Data ============ */
const chatData: Record<string, ChatContext> = {
  "1": {
    status: "紧急决策", statusColor: "#FF3B30",
    approval: {
      type: "URGENT_DECISION", badge: "紧急决策", dotColor: "#FF3B30",
      summary: "候选人正在被竞品抢人，需要在24小时内决定是否推进",
      actions: [{ label: "帮我推进", primary: true }, { label: "我亲自谈", primary: false }],
    },
    items: [
      { kind: "time", id: 100, text: "昨天" },
      { kind: "msg", id: 1, sender: "employer", senderType: "ai", text: "你好，我们是XX科技商业化技术部，目前有高级Java后端岗位开放，看到您的背景非常匹配。" },
      { kind: "msg", id: 2, sender: "candidate", senderType: "ai", text: "你好，我目前确实在看新机会。方便了解下具体技术栈和团队情况吗？" },
      { kind: "msg", id: 3, sender: "employer", senderType: "ai", text: "主要是Java + Spring Cloud微服务架构，团队30人，负责广告投放引擎核心模块。薪资30-45K。" },
      { kind: "msg", id: 4, sender: "candidate", senderType: "ai", text: "技术栈和薪资都挺匹配的。请问工作制度如何？我比较在意双休。" },
      { kind: "msg", id: 5, sender: "employer", senderType: "ai", text: "确认双休弹性工时，核心工作时间10:00-19:00。" },
      { kind: "sys", id: 6, text: "初筛通过", type: "info" },
      { kind: "time", id: 101, text: "今天" },
      { kind: "msg", id: 7, sender: "employer", senderType: "ai", text: "候选人一面表现很好，面试官反馈正面。已安排二面。" },
      { kind: "msg", id: 8, sender: "candidate", senderType: "ai", text: "二面也通过了，但我同时收到了另一家的面试邀请，需要尽快确认。" },
      { kind: "sys", id: 9, text: "候选人正在被竞品抢人，建议尽快推进真人沟通", type: "warning" },
      { kind: "msg", id: 10, sender: "employer", senderType: "ai", text: "已将情况上报给你，建议尽快安排你们直接沟通。" },
    ],
  },
  "2": {
    status: "等待决策", statusColor: "#FF9500",
    approval: {
      type: "NEED_REPLY", badge: "待处理", dotColor: "#007AFF",
      summary: "候选人提出希望Base不低于42K，且需要搬迁补贴3万",
      agentDraft: "建议同意42K的Base要求（在预算范围内），搬迁补贴可作为签字费的一部分覆盖，整体成本可控。",
      actions: [{ label: "帮我推进", primary: true }, { label: "我亲自谈", primary: false }],
    },
    items: [
      { kind: "msg", id: 1, sender: "employer", senderType: "ai", text: "您好，我们在招支付安全方向的架构师，看到您在蚂蚁的经历非常匹配。" },
      { kind: "msg", id: 2, sender: "candidate", senderType: "ai", text: "感兴趣。不过我目前base在杭州，搬迁的话需要一些支持。" },
      { kind: "msg", id: 3, sender: "employer", senderType: "ai", text: "理解。我们有搬迁补贴政策，具体可以面试后详谈。薪资范围40-50K。" },
      { kind: "msg", id: 4, sender: "candidate", senderType: "human", text: "坦白说，我期望Base不低于42K，另外搬迁补贴希望至少3万。这两点能满足的话，我愿意尽快推进。" },
      { kind: "sys", id: 5, text: "候选人提出薪资要求，等待你审核", type: "warning" },
    ],
  },
  "3": {
    status: "面试中", statusColor: "#34C759",
    items: [
      { kind: "msg", id: 1, sender: "employer", senderType: "ai", text: "您好，我们交易系统正在重构，看到您在京东的中台经验很匹配。" },
      { kind: "msg", id: 2, sender: "candidate", senderType: "ai", text: "对中台重构很感兴趣，方便了解具体的技术方向吗？" },
      { kind: "msg", id: 3, sender: "employer", senderType: "ai", text: "主要是将单体系统拆分为微服务架构，涉及交易链路全链路改造。薪资28-35K。" },
      { kind: "msg", id: 4, sender: "candidate", senderType: "ai", text: "方向很好。我在京东参与过类似的中台重构项目，有实际经验。" },
      { kind: "sys", id: 5, text: "Agent正在安排二面", type: "info" },
    ],
  },
  "4": {
    status: "等待回复", statusColor: "#007AFF",
    items: [
      { kind: "msg", id: 1, sender: "employer", senderType: "ai", text: "赵总您好，我们在招后端技术负责人，看到您在美团的管理经验非常出色。" },
      { kind: "msg", id: 2, sender: "candidate", senderType: "ai", text: "你好。确实在考虑新的机会，特别是有更大管理空间的岗位。" },
      { kind: "msg", id: 3, sender: "employer", senderType: "ai", text: "我们团队目前20人，计划扩到40人。负责人直接向CTO汇报。" },
      { kind: "msg", id: 4, sender: "candidate", senderType: "human", text: "听起来不错。我的期望是50K以上，另外需要有明确的晋升路径。" },
      { kind: "msg", id: 5, sender: "employer", senderType: "human", text: "我们非常看重您的背景。已安排直接沟通，期待与您进一步交流。" },
      { kind: "sys", id: 6, text: "已安排真人对接，等待候选人确认", type: "info" },
    ],
  },
  "5": {
    status: "助理建议", statusColor: "#FF9500",
    approval: {
      type: "AGENT_SUGGESTION", badge: "助理建议", dotColor: "#FF9500",
      summary: "经验年限不达标（3年 vs 要求5年），但有特殊亮点",
      agentDraft: "虽然年限不足，但有ACM竞赛金牌背景，快手商业化核心开发经验。薪资预期也在预算下限以下，性价比极高。",
      actions: [{ label: "帮我推进", primary: true }, { label: "跳过", primary: false }],
    },
    items: [
      { kind: "msg", id: 1, sender: "employer", senderType: "ai", text: "你好，我们在招后端工程师，看到您在快手的广告系统经验。" },
      { kind: "msg", id: 2, sender: "candidate", senderType: "ai", text: "感兴趣，不过我经验只有3年，不知道是否符合要求？" },
      { kind: "msg", id: 3, sender: "employer", senderType: "ai", text: "坦诚讲，我们岗位要求5年以上经验。但您的ACM背景很突出，建议先聊聊看。" },
      { kind: "sys", id: 4, text: "经验年限不足，未通过筛选", type: "warning" },
    ],
  },
};

/* ============ Page Component ============ */
export default function EmployerChatDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const data = chatData[id];
  const [inputText, setInputText] = useState("");
  const [isVoice, setIsVoice] = useState(false);
  const [localItems, setLocalItems] = useState<ChatItem[]>([]);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [approved, setApproved] = useState(false);
  const [approvedAction, setApprovedAction] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, []);

  if (!data) {
    return <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center"><p className="text-[14px] text-[#86868B]">对话不存在</p></div>;
  }

  const candidate = allCandidates[parseInt(id)];
  if (!candidate) {
    return <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center"><p className="text-[14px] text-[#86868B]">候选人不存在</p></div>;
  }

  const { status, statusColor, items } = data;
  const allItems = [...items, ...localItems];

  const handleSend = () => {
    if (!inputText.trim()) return;
    const newMsg: ChatItem = { kind: "msg", id: Date.now(), sender: "employer", senderType: "human", text: inputText };
    setLocalItems(prev => [...prev, newMsg]);
    setInputText("");
    setTimeout(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, 50);
  };

  /* ---- 候选人分析详情 ---- */
  if (showAnalysis) {
    return (
      <div className="fixed inset-0 z-50 bg-[#F5F5F7] flex flex-col" style={{ maxWidth: 430, margin: "0 auto" }}>
        <div className="flex-shrink-0" style={{ background: "rgba(255,255,255,0.88)", backdropFilter: "blur(40px)" }}>
          <div className="h-14" />
          <div className="px-5 pb-2"><motion.button className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.04)" }} whileTap={{ scale: 0.9 }} onClick={() => setShowAnalysis(false)}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1D1D1F" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg></motion.button></div>
          <div className="px-5 pb-1 flex items-center justify-between">
            <div className="flex items-center gap-3"><img src={candidate.avatar} className="w-10 h-10 rounded-xl object-cover" /><p className="text-[20px] font-bold text-[#1D1D1F]">{candidate.name}</p></div>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold" style={{ color: statusColor, backgroundColor: statusColor + "15" }}>{status}</span>
          </div>
          <div className="px-5 pb-3"><p className="text-[13px] text-[#8E8E93]">{candidate.currentCompany} · {candidate.currentPosition} · {candidate.experience}经验</p></div>
          <div className="h-[1px] bg-gradient-to-r from-transparent via-black/[0.06] to-transparent" />
        </div>
        <div className="flex-1 overflow-y-auto px-5 pt-4 pb-32 space-y-3">
          <div className="flex items-center gap-3 px-1 pb-1"><span className="text-[12px] text-[#AEAEB2]">匹配度 {candidate.matchScore}%</span><span className="text-[12px] text-[#AEAEB2]">·</span><span className="text-[12px] text-[#AEAEB2]">期望 {candidate.salary.expected}</span></div>
          <div className="rounded-2xl px-4 py-4" style={{ background: "rgba(255,255,255,0.75)", boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}>
            <div className="flex items-center gap-2 mb-3"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="2"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.287 1.288L3 12l5.8 1.9a2 2 0 0 1 1.288 1.287L12 21l1.9-5.8a2 2 0 0 1 1.287-1.288L21 12l-5.8-1.9a2 2 0 0 1-1.288-1.287Z" /></svg><span className="text-[13px] font-semibold text-[#1D1D1F]">AI 匹配分析</span></div>
            <p className="text-[15px] font-semibold text-[#1D1D1F] leading-[1.5] mb-3">{candidate.aiAnalysis.summary}</p>
            <div className="space-y-2 mb-3">{candidate.aiAnalysis.strengths.map((s, i) => <div key={i} className="flex items-start gap-2.5"><div className="w-[18px] h-[18px] rounded-full bg-[#32D74B]/10 flex items-center justify-center flex-shrink-0 mt-[1px]"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#32D74B" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg></div><p className="text-[13px] text-[#1D1D1F]/70 leading-[1.6]">{s}</p></div>)}</div>
            {candidate.aiAnalysis.risks.length > 0 && <div className="space-y-2 pt-2.5" style={{ borderTop: "0.5px solid rgba(0,0,0,0.06)" }}>{candidate.aiAnalysis.risks.map((r, i) => <div key={i} className="flex items-start gap-2.5"><div className="w-[18px] h-[18px] rounded-full bg-[#FF9500]/10 flex items-center justify-center flex-shrink-0 mt-[1px]"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#FF9500" strokeWidth="3"><path d="M12 9v4"/><circle cx="12" cy="17" r="0.5" fill="#FF9500"/></svg></div><p className="text-[13px] text-[#8E8E93] leading-[1.6]">{r}</p></div>)}</div>}
          </div>
          {/* Skills */}
          <div className="rounded-2xl px-4 py-4" style={{ background: "rgba(255,255,255,0.75)", boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}>
            <p className="text-[13px] font-semibold text-[#1D1D1F] mb-3">能力评估</p>
            <div className="space-y-3">{candidate.skills.map(s => <div key={s.name} className="flex items-center gap-3"><span className="text-[12px] text-[#8E8E93] w-16 flex-shrink-0">{s.name}</span><div className="flex-1 h-[6px] bg-black/[0.04] rounded-full overflow-hidden"><motion.div className="h-full rounded-full bg-[#007AFF]" initial={{ width: 0 }} animate={{ width: `${(s.level / 5) * 100}%` }} transition={{ duration: 0.8 }} /></div><span className="text-[11px] text-[#AEAEB2] w-6 text-right">L{s.level}</span></div>)}</div>
          </div>
        </div>
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[430px] px-5 pb-8 pt-3 z-30" style={{ background: "linear-gradient(to top, #F5F5F7 70%, transparent)" }}>
          <div className="flex gap-2.5">
            <motion.button className="h-[48px] px-5 rounded-2xl text-[15px] font-medium text-[#8E8E93]" style={{ backgroundColor: "rgba(0,0,0,0.04)" }} whileTap={{ scale: 0.97 }} onClick={() => setShowAnalysis(false)}>不合适</motion.button>
            <motion.button className="flex-1 h-[48px] rounded-2xl bg-[#1D1D1F] text-white text-[15px] font-semibold" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.12)" }} whileTap={{ scale: 0.97 }} onClick={() => setShowAnalysis(false)}>推进到下一轮</motion.button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-30 backdrop-blur-xl bg-white/80 border-b border-black/[0.04]">
        <div className="flex items-center gap-3 px-4 pt-14 pb-3">
          <motion.button className="w-8 h-8 flex items-center justify-center rounded-full bg-black/[0.04]" whileTap={{ scale: 0.9 }} onClick={() => router.back()}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1D1D1F" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
          </motion.button>
          <div className="flex-1 min-w-0">
            <p className="text-[16px] font-semibold text-[#1D1D1F] truncate">{candidate.name}</p>
            <p className="text-[12px] text-[#86868B] truncate">{candidate.currentCompany} · {candidate.currentPosition}</p>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <div className="w-[6px] h-[6px] rounded-full" style={{ backgroundColor: statusColor }} />
            <span className="text-[12px] text-[#86868B] font-medium">{status}</span>
          </div>
        </div>
      </div>

      {/* 滚动内容区 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto pb-28">
        {/* 候选人信息卡片 */}
        <div className="px-5 pt-4">
          <motion.div className="bg-white rounded-2xl px-5 py-4 cursor-pointer" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.04)" }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} whileTap={{ scale: 0.98 }} onClick={() => setShowAnalysis(true)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={candidate.avatar} className="w-8 h-8 rounded-lg object-cover" />
                <div><p className="text-[14px] font-semibold text-[#1D1D1F]">{candidate.name} · {candidate.currentPosition}</p><p className="text-[12px] text-[#8E8E93]">匹配 {candidate.matchScore}% · 期望 {candidate.salary.expected}</p></div>
              </div>
              <div className="flex items-center gap-1"><span className="text-[12px] text-[#AEAEB2]">详情</span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#AEAEB2" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg></div>
            </div>
          </motion.div>
        </div>

        {/* 对话区域 */}
        <div className="px-5 pt-5">
          <div className="flex items-center gap-2 mb-4"><div className="flex-1 h-px bg-black/[0.06]" /><p className="text-[11px] text-[#C7C7CC] font-medium">沟通记录</p><div className="flex-1 h-px bg-black/[0.06]" /></div>
          <div className="space-y-3">
            {allItems.map((item, i) => {
              if (item.kind === "time") return <div key={`time-${item.id}`} className="flex items-center gap-3 py-2"><div className="flex-1 h-px bg-black/[0.06]" /><span className="text-[11px] text-[#C7C7CC] font-medium">{item.text}</span><div className="flex-1 h-px bg-black/[0.06]" /></div>;
              if (item.kind === "sys") {
                const c = { info: { bg: "rgba(0,0,0,0.03)", text: "#86868B" }, warning: { bg: "rgba(255,149,0,0.06)", text: "#FF9500" }, takeover: { bg: "rgba(0,122,255,0.06)", text: "#007AFF" } }[item.type || "info"]!;
                return <motion.div key={`sys-${item.id}`} className="flex justify-center py-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><span className="text-[11px] font-medium px-3 py-1 rounded-full" style={{ backgroundColor: c.bg, color: c.text }}>{item.text}</span></motion.div>;
              }
              if (item.kind !== "msg") return null;
              const isEmployer = item.sender === "employer";
              const isHuman = item.senderType === "human";
              return (
                <motion.div key={`msg-${item.id}`} className={`flex ${isEmployer ? "justify-end" : "justify-start"}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03, duration: 0.25 }}>
                  <div className="max-w-[80%]">
                    <div className={`px-4 py-3 text-[14px] leading-[1.6] ${isEmployer ? "bg-[#1D1D1F] text-white rounded-2xl rounded-tr-sm" : "bg-white text-[#1D1D1F] rounded-2xl rounded-tl-sm"}`} style={!isEmployer ? { boxShadow: "0 1px 6px rgba(0,0,0,0.04)" } : {}}>
                      {item.text}
                    </div>
                    <div className={`flex items-center gap-1 mt-1 ${isEmployer ? "pr-1 justify-end" : "pl-1"}`}>
                      {isHuman && <div className="w-[4px] h-[4px] rounded-full bg-[#FF9500]" />}
                      <span className="text-[10px] text-[#C7C7CC]">
                        {isEmployer ? (isHuman ? "你" : "B-Agent") : (isHuman ? "候选人" : "C-Agent")}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 底部区域：审批面板 or 输入栏 */}
      <div className="fixed bottom-0 z-40 w-[430px] left-1/2 -translate-x-1/2">
        {data.approval && !approved ? (
          /* ===== 审批面板 ===== */
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="backdrop-blur-xl border-t border-black/[0.06] px-4 pb-8 pt-4"
            style={{ background: "rgba(255,255,255,0.92)" }}
          >
            {/* Badge + 摘要 */}
            <div className="flex items-start gap-2.5 mb-3">
              <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
                <div className="w-[6px] h-[6px] rounded-full" style={{ backgroundColor: data.approval.dotColor }} />
                <span className="text-[11px] font-semibold" style={{ color: data.approval.dotColor }}>{data.approval.badge}</span>
              </div>
              <p className="text-[14px] font-semibold text-[#1D1D1F] leading-[1.5] flex-1">{data.approval.summary}</p>
            </div>

            {/* AI 建议（如果有） */}
            {data.approval.agentDraft && (
              <div className="rounded-xl px-3.5 py-3 mb-3" style={{ background: "rgba(0,122,255,0.04)", border: "0.5px solid rgba(0,122,255,0.1)" }}>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="w-[18px] h-[18px] rounded-full bg-[#1D1D1F] flex items-center justify-center">
                    <span className="text-[7px] font-bold text-white">A.</span>
                  </div>
                  <span className="text-[11px] font-medium text-[#8E8E93]">助理建议</span>
                </div>
                <p className="text-[13px] text-[#1D1D1F]/75 leading-[1.6]">{data.approval.agentDraft}</p>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex gap-2.5">
              {data.approval.actions.map((action) => (
                <motion.button
                  key={action.label}
                  className={`h-[44px] rounded-2xl text-[15px] font-semibold ${
                    action.primary
                      ? "flex-1 bg-[#1D1D1F] text-white"
                      : "px-5 text-[#8E8E93]"
                  }`}
                  style={action.primary ? { boxShadow: "0 2px 12px rgba(0,0,0,0.12)" } : { backgroundColor: "rgba(0,0,0,0.04)" }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setApproved(true);
                    setApprovedAction(action.label);
                  }}
                >
                  {action.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : approved && approvedAction ? (
          /* ===== 审批完成确认 ===== */
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="backdrop-blur-xl border-t border-black/[0.06] px-4 pb-8 pt-4"
            style={{ background: "rgba(255,255,255,0.92)" }}
          >
            <div className="flex items-center justify-center gap-2 py-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#34C759" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"/></svg>
              </motion.div>
              <span className="text-[14px] font-medium text-[#1D1D1F]">已处理：{approvedAction}</span>
            </div>
            <div className="mt-2">
              <div className="flex items-end gap-2.5">
                <div className="flex-1 relative">
                  <input type="text" value={inputText} onChange={e => setInputText(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSend()} placeholder="真人介入，发送消息..." className="w-full h-9 bg-[#F5F5F7] rounded-full px-4 text-[14px] text-[#1D1D1F] placeholder:text-[#C7C7CC] outline-none focus:ring-2 focus:ring-[#007AFF]/20" />
                </div>
                {inputText.trim() && (
                  <motion.button className="w-9 h-9 flex items-center justify-center rounded-full bg-[#1D1D1F] flex-shrink-0" whileTap={{ scale: 0.9 }} onClick={handleSend} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 30 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          /* ===== 普通输入栏 ===== */
          <div className="backdrop-blur-xl bg-white/90 border-t border-black/[0.06] px-4 pb-8 pt-3">
            <div className="flex items-end gap-2.5">
              <motion.button className="w-9 h-9 flex items-center justify-center rounded-full bg-black/[0.04] flex-shrink-0" whileTap={{ scale: 0.9 }} onClick={() => setIsVoice(!isVoice)}>
                {isVoice ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1D1D1F" strokeWidth="1.8"><rect x="4" y="2" width="16" height="20" rx="2" /><path d="M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h8M8 18h5" /></svg>
                  : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1D1D1F" strokeWidth="1.8"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="22" /></svg>}
              </motion.button>
              {isVoice ? (
                <motion.button className="flex-1 h-9 rounded-full bg-[#F5F5F7] text-[14px] text-[#86868B] font-medium active:bg-[#E8E8ED]" whileTap={{ scale: 0.98 }}>按住说话</motion.button>
              ) : (
                <div className="flex-1 relative">
                  <input type="text" value={inputText} onChange={e => setInputText(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSend()} placeholder="真人介入，发送消息..." className="w-full h-9 bg-[#F5F5F7] rounded-full px-4 text-[14px] text-[#1D1D1F] placeholder:text-[#C7C7CC] outline-none focus:ring-2 focus:ring-[#007AFF]/20" />
                </div>
              )}
              {!isVoice && inputText.trim() && (
                <motion.button className="w-9 h-9 flex items-center justify-center rounded-full bg-[#1D1D1F] flex-shrink-0" whileTap={{ scale: 0.9 }} onClick={handleSend} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 30 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                </motion.button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
