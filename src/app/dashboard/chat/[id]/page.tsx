"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { allJobAnalysis, type JobAnalysis } from "@/lib/jobData";

/* ============ Types ============ */
type Sender = "enterprise" | "candidate";
type SenderType = "ai" | "human";

interface ChatMessage {
  id: number;
  sender: Sender;
  senderType: SenderType;
  text: string;
}

interface SystemPrompt {
  id: number;
  text: string;
  type?: "info" | "warning" | "takeover";
}

interface TimeSeparator {
  id: number;
  text: string;
}

type ChatItem = (ChatMessage & { kind: "msg" }) | (SystemPrompt & { kind: "sys" }) | (TimeSeparator & { kind: "time" });

interface ChatContext {
  status: string;
  statusColor: string;
  items: ChatItem[];
}

/* ============ Mock Data ============ */
const chatData: Record<string, ChatContext> = {
  // 字节跳动 - P0 面试邀请 / HUMAN_TAKEOVER
  "1": {
    status: "真人接管", statusColor: "#007AFF",
    items: [
      { kind: "time", id: 100, text: "昨天" },
      { kind: "msg", id: 1, sender: "enterprise", senderType: "ai", text: "你好，我这边是字节跳动商业化团队，目前有一个高级 Java 后端岗位开放，想了解下你的候选人情况。" },
      { kind: "msg", id: 2, sender: "candidate", senderType: "ai", text: "你好，我的候选人对商业化方向很感兴趣。方便了解下具体技术栈和团队规模吗？" },
      { kind: "msg", id: 3, sender: "enterprise", senderType: "ai", text: "主要是 Java + Spring Cloud 微服务架构，团队 30 人，负责广告投放引擎核心模块。日均处理请求 5 亿次。" },
      { kind: "msg", id: 4, sender: "candidate", senderType: "ai", text: "技术栈匹配度很高。关于工作制度，候选人比较在意双休，请确认。" },
      { kind: "msg", id: 5, sender: "enterprise", senderType: "ai", text: "确认双休和弹性工时，核心工作时间 10:00-19:00。" },
      { kind: "sys", id: 6, text: "初筛通过", type: "info" },
      { kind: "time", id: 101, text: "今天" },
      { kind: "msg", id: 7, sender: "enterprise", senderType: "ai", text: "初筛已通过。薪资范围 28-35k，具体面议。请问候选人方便安排面试吗？" },
      { kind: "msg", id: 8, sender: "candidate", senderType: "ai", text: "薪资范围符合预期。候选人可以安排面试，请发送具体时间。" },
      { kind: "msg", id: 9, sender: "enterprise", senderType: "human", text: "HR 已发出面试邀请：下周二 14:00 线上技术面。请确认是否可以参加。" },
      { kind: "sys", id: 10, text: "需要你决策：面试邀请待确认", type: "warning" },
      { kind: "msg", id: 11, sender: "candidate", senderType: "human", text: "时间可以，帮我确认。" },
      { kind: "msg", id: 12, sender: "candidate", senderType: "ai", text: "好的，已确认面试时间。同时已准备好技术面试相关资料供你参考。" },
      { kind: "sys", id: 13, text: "你已接管对话", type: "takeover" },
    ],
  },
  // 蚂蚁集团 - P2 知识盲区 / SUSPENDED
  "2": {
    status: "等待指示", statusColor: "#FF9500",
    items: [
      { kind: "msg", id: 1, sender: "enterprise", senderType: "ai", text: "支付安全团队在招高级后端，主要做风控引擎和实时反欺诈。" },
      { kind: "msg", id: 2, sender: "candidate", senderType: "ai", text: "候选人有支付网关经验，技术栈高度匹配。薪资期望 30k+，请确认。" },
      { kind: "msg", id: 3, sender: "enterprise", senderType: "ai", text: "薪资 30-40k，具体定级面议。请提供候选人详细项目经历。" },
      { kind: "msg", id: 4, sender: "candidate", senderType: "ai", text: "已发送项目经历摘要。候选人主导过支付网关微服务拆分，日均交易量从 50 万笔提升到 200 万笔。" },
      { kind: "msg", id: 5, sender: "enterprise", senderType: "human", text: "经历很不错。有个问题想确认：你上一段经历为什么只待了半年？团队管理遇到了什么问题？" },
      { kind: "sys", id: 6, text: "Agent 等待你审核回复草稿", type: "warning" },
    ],
  },
  // 京东 - NEGOTIATING
  "3": {
    status: "沟通中", statusColor: "#34C759",
    items: [
      { kind: "msg", id: 1, sender: "enterprise", senderType: "ai", text: "零售技术团队在招交易系统架构师，负责交易中台核心链路重构。" },
      { kind: "msg", id: 2, sender: "candidate", senderType: "ai", text: "候选人有微服务拆分经验，和岗位需求高度匹配。薪资期望 28k 起。" },
      { kind: "msg", id: 3, sender: "enterprise", senderType: "ai", text: "薪资 28-38k，经验匹配可跳级定 T8。已约技术负责人做初步沟通。" },
      { kind: "msg", id: 4, sender: "candidate", senderType: "ai", text: "技术负责人反馈积极，正在推进后续面试安排。" },
    ],
  },
  // 小红书 - NEGOTIATING
  "4": {
    status: "沟通中", statusColor: "#34C759",
    items: [
      { kind: "time", id: 100, text: "今天" },
      { kind: "msg", id: 1, sender: "enterprise", senderType: "ai", text: "社区技术团队招高级后端，负责内容推荐和社区互动。" },
      { kind: "msg", id: 2, sender: "candidate", senderType: "ai", text: "候选人感兴趣，想了解是否支持远程或混合办公？" },
      { kind: "msg", id: 3, sender: "enterprise", senderType: "ai", text: "目前支持每周 2 天远程，其余到岗。正在推进更灵活的政策。" },
      { kind: "msg", id: 4, sender: "candidate", senderType: "ai", text: "收到，候选人可以接受。正在确认混合办公的具体细节。" },
    ],
  },
  // 快手 - NEGOTIATING
  "5": {
    status: "沟通中", statusColor: "#34C759",
    items: [
      { kind: "msg", id: 1, sender: "enterprise", senderType: "ai", text: "商业化中台在招后端，主要做广告计费和投放策略。" },
      { kind: "msg", id: 2, sender: "candidate", senderType: "ai", text: "候选人对大小周有顾虑，请确认工作制度。" },
      { kind: "msg", id: 3, sender: "enterprise", senderType: "ai", text: "我们已转为弹性双休制，无大小周。" },
      { kind: "msg", id: 4, sender: "candidate", senderType: "ai", text: "收到，候选人对此满意。初筛已通过，等待安排面试。" },
      { kind: "msg", id: 5, sender: "enterprise", senderType: "human", text: "一面已通过，正在安排二面，预计本周内。" },
      { kind: "sys", id: 6, text: "面试流程推进中", type: "info" },
    ],
  },
  // 腾讯 - NEGOTIATING
  "6": {
    status: "沟通中", statusColor: "#34C759",
    items: [
      { kind: "msg", id: 1, sender: "enterprise", senderType: "ai", text: "微信支付团队有高级 Java 后端岗位，负责支付核心链路优化。" },
      { kind: "msg", id: 2, sender: "candidate", senderType: "ai", text: "你好，我的候选人对微信支付方向有兴趣。薪资期望 30k 起，贵方预算范围？" },
      { kind: "msg", id: 3, sender: "enterprise", senderType: "ai", text: "28-42k 弹性区间，需面试后定级。工作地点深圳，双休。" },
      { kind: "msg", id: 4, sender: "candidate", senderType: "ai", text: "候选人已确认作息匹配。正在对齐薪资期望细节。" },
      { kind: "msg", id: 5, sender: "enterprise", senderType: "ai", text: "好的，等候选人确认后安排面试。" },
    ],
  },
  // 美团 - P1 薪资博弈 / SUSPENDED
  "7": {
    status: "等待指示", statusColor: "#FF9500",
    items: [
      { kind: "msg", id: 1, sender: "enterprise", senderType: "ai", text: "你好，到店事业群有高级 Java 岗位，负责本地生活交易系统。" },
      { kind: "msg", id: 2, sender: "candidate", senderType: "ai", text: "候选人对本地生活赛道有兴趣，薪资期望 25k 起，请确认预算。" },
      { kind: "msg", id: 3, sender: "enterprise", senderType: "ai", text: "Base 薪资 23k，16 薪，年终另有绩效奖金和签字费。" },
      { kind: "msg", id: 4, sender: "candidate", senderType: "ai", text: "Base 低于候选人底线 25k。按 16 薪折算月均 30.7k，年总包约 44 万，是否有调整空间？" },
      { kind: "msg", id: 5, sender: "enterprise", senderType: "human", text: "Base 23k 是这个级别的上限，但签字费可以谈到 5 万，年终系数通常 1.5-3 个月。" },
      { kind: "sys", id: 6, text: "Agent 暂停沟通，等待你的薪资决策", type: "warning" },
    ],
  },
  // 百度 - DEAD_END
  "401": {
    status: "已出局", statusColor: "#C7C7CC",
    items: [
      { kind: "time", id: 100, text: "3 天前" },
      { kind: "msg", id: 1, sender: "enterprise", senderType: "ai", text: "搜索技术部在招高级后端，主要负责搜索排序引擎优化。" },
      { kind: "msg", id: 2, sender: "candidate", senderType: "ai", text: "候选人对搜索方向有一定兴趣，薪资期望 25k 起，请确认预算。" },
      { kind: "msg", id: 3, sender: "enterprise", senderType: "ai", text: "薪资范围 25-30k，L5 级别。不过需要确认候选人的 C++ 能力。" },
      { kind: "msg", id: 4, sender: "candidate", senderType: "ai", text: "候选人主要技术栈是 Java，C++ 经验较少。薪资上限也低于期望。" },
      { kind: "sys", id: 5, text: "薪资上限无法满足 · 用户主动放弃", type: "info" },
    ],
  },
  // 网易 - DEAD_END
  "402": {
    status: "已出局", statusColor: "#C7C7CC",
    items: [
      { kind: "time", id: 100, text: "2 天前" },
      { kind: "msg", id: 1, sender: "enterprise", senderType: "ai", text: "云音乐后端团队招聘高级工程师，负责播放器及推荐系统。" },
      { kind: "msg", id: 2, sender: "candidate", senderType: "ai", text: "候选人暂时跳过此岗位。在脉脉查到该团队风评较差，加班严重。" },
      { kind: "sys", id: 3, text: "脉脉风评过差 · Agent 自动拦截", type: "warning" },
    ],
  },
  // 拼多多 - DEAD_END
  "403": {
    status: "已出局", statusColor: "#C7C7CC",
    items: [
      { kind: "time", id: 100, text: "昨天" },
      { kind: "msg", id: 1, sender: "enterprise", senderType: "ai", text: "社交电商团队在招高级后端，薪资 30-45k，负责社交裂变业务。" },
      { kind: "msg", id: 2, sender: "candidate", senderType: "ai", text: "候选人对薪资范围满意，但对工作制度有顾虑。请确认是否大小周？" },
      { kind: "msg", id: 3, sender: "enterprise", senderType: "ai", text: "目前为弹性双休，但业务高峰期偶尔需要加班。" },
      { kind: "msg", id: 4, sender: "candidate", senderType: "ai", text: "收到，候选人可以接受。已通过初筛，安排了一面和二面。" },
      { kind: "sys", id: 5, text: "一面通过", type: "info" },
      { kind: "msg", id: 6, sender: "enterprise", senderType: "human", text: "二面结束，算法题部分表现不太理想，未能通过。感谢参与。" },
      { kind: "sys", id: 7, text: "二面未通过 · 算法题表现不佳", type: "warning" },
    ],
  },
};

/* ============ Page Component ============ */
export default function ChatDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const data = chatData[id];
  const [inputText, setInputText] = useState("");
  const [isVoice, setIsVoice] = useState(false);
  const [localItems, setLocalItems] = useState<ChatItem[]>([]);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">
        <p className="text-[14px] text-[#86868B]">对话不存在</p>
      </div>
    );
  }

  const job = allJobAnalysis[parseInt(id)];
  if (!job) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">
        <p className="text-[14px] text-[#86868B]">岗位不存在</p>
      </div>
    );
  }

  const { status, statusColor, items } = data;
  const allItems = [...items, ...localItems];

  const handleSend = () => {
    if (!inputText.trim()) return;
    const newMsg: ChatItem = {
      kind: "msg",
      id: Date.now(),
      sender: "candidate",
      senderType: "human",
      text: inputText,
    };
    setLocalItems(prev => [...prev, newMsg]);
    setInputText("");
    setTimeout(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, 50);
  };

  /* ---- 分析详情全屏覆盖 ---- */
  if (showAnalysis) {
    return (
      <div className="fixed inset-0 z-50 bg-[#F5F5F7] flex flex-col" style={{ maxWidth: 430, margin: "0 auto" }}>
        {/* Header */}
        <div className="flex-shrink-0" style={{ background: "rgba(255,255,255,0.88)", backdropFilter: "blur(40px) saturate(180%)", WebkitBackdropFilter: "blur(40px) saturate(180%)" }}>
          <div className="h-14" />
          <div className="px-5 pb-2">
            <motion.button className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.04)" }} whileTap={{ scale: 0.9 }} onClick={() => setShowAnalysis(false)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1D1D1F" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
            </motion.button>
          </div>
          {/* 岗位 + 状态 */}
          <div className="px-5 pb-1 flex items-center justify-between">
            <p className="text-[20px] font-bold text-[#1D1D1F] tracking-tight">{job.position}</p>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold flex-shrink-0" style={{ color: statusColor, backgroundColor: statusColor + "15" }}>{status}</span>
          </div>
          <div className="px-5 pb-3 flex items-center gap-1.5">
            <p className="text-[13px] text-[#8E8E93]">{job.company} · {job.team}</p>
            <span className="text-[13px] text-[#8E8E93]">·</span>
            <span className="text-[15px] font-semibold text-[#1D1D1F]">{job.salary}</span>
          </div>
          <div className="h-[1px] bg-gradient-to-r from-transparent via-black/[0.06] to-transparent" />
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 pt-4 pb-32 space-y-3">
          {/* 匹配度 */}
          <div className="flex items-center gap-3 px-1 pb-1">
            <span className="text-[12px] text-[#AEAEB2]">匹配度 {job.aiScore}%</span>
          </div>

          {/* AI 推荐分析 */}
          <div className="rounded-2xl px-4 py-4" style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(20px)", boxShadow: "0 1px 8px rgba(0,0,0,0.04), inset 0 0 0 0.5px rgba(255,255,255,0.5)" }}>
            <div className="flex items-center gap-2 mb-3">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="2"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.287 1.288L3 12l5.8 1.9a2 2 0 0 1 1.288 1.287L12 21l1.9-5.8a2 2 0 0 1 1.287-1.288L21 12l-5.8-1.9a2 2 0 0 1-1.288-1.287Z" /></svg>
              <span className="text-[13px] font-semibold text-[#1D1D1F]">AI 推荐分析</span>
            </div>
            <p className="text-[15px] font-semibold text-[#1D1D1F] leading-[1.5] mb-3">{job.aiAnalysis.summary}</p>
            {job.aiAnalysis.points.length > 0 && (
              <div className="space-y-2 mb-3">
                {job.aiAnalysis.points.map((p: string, i: number) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="w-[18px] h-[18px] rounded-full bg-[#32D74B]/10 flex items-center justify-center flex-shrink-0 mt-[1px]">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#32D74B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <p className="text-[13px] text-[#1D1D1F]/70 leading-[1.6]">{p}</p>
                  </div>
                ))}
              </div>
            )}
            {job.aiAnalysis.notes.length > 0 && (
              <div className="space-y-2 pt-2.5" style={{ borderTop: "0.5px solid rgba(0,0,0,0.06)" }}>
                {job.aiAnalysis.notes.map((n: string, i: number) => (
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

          {/* 岗位描述 */}
          <div className="rounded-2xl px-4 py-4" style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(20px)", boxShadow: "0 1px 8px rgba(0,0,0,0.04), inset 0 0 0 0.5px rgba(255,255,255,0.5)" }}>
            <p className="text-[13px] font-semibold text-[#1D1D1F] mb-2">岗位描述</p>
            <p className="text-[14px] text-[#1D1D1F]/70 leading-[1.6] mb-3">{job.jdSummary}</p>
            <p className="text-[13px] font-semibold text-[#1D1D1F] mb-2">岗位要求</p>
            <div className="space-y-1.5">
              {job.requirements.map((r, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-[5px] h-[5px] rounded-full bg-[#8E8E93] mt-[7px] flex-shrink-0" />
                  <p className="text-[13px] text-[#1D1D1F]/70 leading-[1.5]">{r}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom actions - 不合适 / 继续推进 */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[430px] px-5 pb-8 pt-3 z-30" style={{ background: "linear-gradient(to top, #F5F5F7 70%, transparent)" }}>
          <div className="flex gap-2.5">
            <motion.button className="h-[48px] px-5 rounded-2xl text-[15px] font-medium text-[#8E8E93] flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.04)" }} whileTap={{ scale: 0.97 }} onClick={() => setShowAnalysis(false)}>
              不合适
            </motion.button>
            <motion.button className="flex-1 h-[48px] rounded-2xl bg-[#1D1D1F] text-white text-[15px] font-semibold flex items-center justify-center gap-2" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.12)" }} whileTap={{ scale: 0.97 }} onClick={() => setShowAnalysis(false)}>
              继续推进
            </motion.button>
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
          <motion.button
            className="w-8 h-8 flex items-center justify-center rounded-full bg-black/[0.04]"
            whileTap={{ scale: 0.9 }}
            onClick={() => router.back()}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1D1D1F" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
          </motion.button>
          <div className="flex-1 min-w-0">
            <p className="text-[16px] font-semibold text-[#1D1D1F] truncate">{job.company}</p>
            <p className="text-[12px] text-[#86868B] truncate">{job.team}</p>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <div className="w-[6px] h-[6px] rounded-full" style={{ backgroundColor: statusColor }} />
            <span className="text-[12px] text-[#86868B] font-medium">{status}</span>
          </div>
        </div>
      </div>

      {/* 滚动内容区 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto pb-28">
        {/* 可点击的岗位信息卡片 → 跳到分析详情 */}
        <div className="px-5 pt-4">
          <motion.div
            className="bg-white rounded-2xl px-5 py-4 cursor-pointer"
            style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.04), 0 0 0 0.5px rgba(0,0,0,0.04)" }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAnalysis(true)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-[#1D1D1F] truncate">{job.position}</p>
                <p className="text-[12px] text-[#8E8E93] mt-0.5 truncate">{job.salary} · 匹配 {job.aiScore}%</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0 ml-3">
                <span className="text-[12px] text-[#AEAEB2]">推荐分析</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#AEAEB2" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 对话区域 */}
        <div className="px-5 pt-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 h-px bg-black/[0.06]" />
            <p className="text-[11px] text-[#C7C7CC] font-medium">沟通记录</p>
            <div className="flex-1 h-px bg-black/[0.06]" />
          </div>

          <div className="space-y-3">
            {allItems.map((item, i) => {
              if (item.kind === "time") {
                return (
                  <div key={`time-${item.id}`} className="flex items-center gap-3 py-2">
                    <div className="flex-1 h-px bg-black/[0.06]" />
                    <span className="text-[11px] text-[#C7C7CC] font-medium">{item.text}</span>
                    <div className="flex-1 h-px bg-black/[0.06]" />
                  </div>
                );
              }

              if (item.kind === "sys") {
                const sysColors = {
                  info: { bg: "rgba(0,0,0,0.03)", text: "#86868B" },
                  warning: { bg: "rgba(255,149,0,0.06)", text: "#FF9500" },
                  takeover: { bg: "rgba(0,122,255,0.06)", text: "#007AFF" },
                };
                const c = sysColors[item.type || "info"];
                return (
                  <motion.div
                    key={`sys-${item.id}`}
                    className="flex justify-center py-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <span
                      className="text-[11px] font-medium px-3 py-1 rounded-full"
                      style={{ backgroundColor: c.bg, color: c.text }}
                    >
                      {item.text}
                    </span>
                  </motion.div>
                );
              }

              if (item.kind !== "msg") return null;
              const isEnterprise = item.sender === "enterprise";
              const isHuman = item.senderType === "human";

              return (
                <motion.div
                  key={`msg-${item.id}`}
                  className={`flex ${isEnterprise ? "justify-start" : "justify-end"}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.25 }}
                >
                  <div className="max-w-[80%]">
                    {/* 气泡 */}
                    <div
                      className={`px-4 py-3 text-[14px] leading-[1.6] ${
                        isEnterprise
                          ? "bg-white text-[#1D1D1F] rounded-2xl rounded-tl-sm"
                          : "bg-[#1D1D1F] text-white rounded-2xl rounded-tr-sm"
                      }`}
                      style={isEnterprise ? { boxShadow: "0 1px 6px rgba(0,0,0,0.04)" } : {}}
                    >
                      {item.text}
                    </div>
                    {/* 发送者标识 */}
                    <div className={`flex items-center gap-1 mt-1 ${isEnterprise ? "pl-1" : "pr-1 justify-end"}`}>
                      {isHuman && (
                        <div className="w-[4px] h-[4px] rounded-full bg-[#FF9500]" />
                      )}
                      <span className="text-[10px] text-[#C7C7CC]">
                        {isEnterprise
                          ? (isHuman ? "HR" : "B-Agent")
                          : (isHuman ? "你" : "C-Agent")
                        }
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 底部输入栏 */}
      <div className="fixed bottom-0 z-40 w-[430px] left-1/2 -translate-x-1/2">
        <div className="backdrop-blur-xl bg-white/90 border-t border-black/[0.06] px-4 pb-8 pt-3">
          <div className="flex items-end gap-2.5">
            {/* 语音/键盘切换 */}
            <motion.button
              className="w-9 h-9 flex items-center justify-center rounded-full bg-black/[0.04] flex-shrink-0"
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsVoice(!isVoice)}
            >
              {isVoice ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1D1D1F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="2" width="16" height="20" rx="2" /><path d="M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h8M8 18h5" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1D1D1F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="22" />
                </svg>
              )}
            </motion.button>

            {isVoice ? (
              /* 语音按钮 */
              <motion.button
                className="flex-1 h-9 rounded-full bg-[#F5F5F7] text-[14px] text-[#86868B] font-medium active:bg-[#E8E8ED] transition-colors"
                whileTap={{ scale: 0.98 }}
              >
                按住说话
              </motion.button>
            ) : (
              /* 文本输入 */
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="真人介入，发送消息..."
                  className="w-full h-9 bg-[#F5F5F7] rounded-full px-4 text-[14px] text-[#1D1D1F] placeholder:text-[#C7C7CC] outline-none focus:ring-2 focus:ring-[#007AFF]/20 transition-shadow"
                />
              </div>
            )}

            {/* 发送按钮 */}
            {!isVoice && inputText.trim() && (
              <motion.button
                className="w-9 h-9 flex items-center justify-center rounded-full bg-[#1D1D1F] flex-shrink-0"
                whileTap={{ scale: 0.9 }}
                onClick={handleSend}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
