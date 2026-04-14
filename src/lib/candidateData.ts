/* ============ Candidate Mock Data for Employer Dashboard ============ */

export interface CandidateAnalysis {
  id: number;
  name: string;          // 脱敏姓名
  currentCompany: string;
  currentPosition: string;
  experience: string;
  matchScore: number;
  recommendLevel: "strong" | "normal" | "consider";
  tags: { label: string; type: "positive" | "negative" }[];
  aiReason: string;
  aiAnalysis: {
    summary: string;
    strengths: string[];
    risks: string[];
  };
  salary: { current: string; expected: string };
  skills: { name: string; level: number }[];  // 1-5
  status: "new" | "ongoing" | "ended";
  avatar: string;
  lastActive: string;
}

export const allCandidates: Record<number, CandidateAnalysis> = {
  1: {
    id: 1, name: "张**", currentCompany: "字节跳动", currentPosition: "高级Java工程师",
    experience: "5年", matchScore: 95, recommendLevel: "strong",
    tags: [{ label: "系统设计强", type: "positive" }, { label: "大厂背景", type: "positive" }, { label: "5年经验", type: "positive" }],
    aiReason: "系统设计能力突出，主导过亿级交易系统重构，与岗位核心需求高度匹配",
    aiAnalysis: {
      summary: "候选人在分布式系统和高并发处理方面经验丰富，曾主导支付网关微服务拆分，日均交易量提升4倍。",
      strengths: ["主导过支付网关微服务拆分，日均交易量从50万提升到200万", "熟悉Spring Cloud全家桶，有完整的微服务治理经验", "有3人小团队管理经验，技术和管理兼备"],
      risks: ["上一段经历只待了半年，需要确认离职原因", "薪资期望略高于预算中位数"],
    },
    salary: { current: "32K", expected: "35-45K" },
    skills: [{ name: "系统设计", level: 5 }, { name: "微服务架构", level: 5 }, { name: "高并发", level: 4 }, { name: "团队管理", level: 3 }],
    status: "new", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop&crop=face", lastActive: "2分钟前",
  },
  2: {
    id: 2, name: "李**", currentCompany: "蚂蚁集团", currentPosition: "支付安全架构师",
    experience: "6年", matchScore: 88, recommendLevel: "strong",
    tags: [{ label: "支付领域专家", type: "positive" }, { label: "架构能力强", type: "positive" }],
    aiReason: "支付安全领域深耕6年，架构设计能力出色",
    aiAnalysis: {
      summary: "候选人在支付安全领域有深厚积累，负责过亿级日交易的风控系统设计。",
      strengths: ["6年支付安全领域经验，风控系统从0到1搭建", "有SOX合规审计经验，对金融监管熟悉", "带过5人团队，项目管理能力强"],
      risks: ["目前base在杭州，需确认搬迁意愿", "期望薪资偏高"],
    },
    salary: { current: "38K", expected: "40-50K" },
    skills: [{ name: "风控系统", level: 5 }, { name: "支付安全", level: 5 }, { name: "架构设计", level: 4 }, { name: "合规审计", level: 4 }],
    status: "ongoing", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=96&h=96&fit=crop&crop=face", lastActive: "1小时前",
  },
  3: {
    id: 3, name: "王**", currentCompany: "京东", currentPosition: "交易系统工程师",
    experience: "4年", matchScore: 82, recommendLevel: "normal",
    tags: [{ label: "交易系统经验", type: "positive" }, { label: "成长性好", type: "positive" }, { label: "经验偏少", type: "negative" }],
    aiReason: "交易系统实战经验丰富，成长潜力大，但经验年限略不足",
    aiAnalysis: {
      summary: "4年交易系统经验，参与过中台重构，技术成长快，但独立架构经验不足。",
      strengths: ["参与京东交易中台重构，熟悉大型系统改造", "编码能力强，多次获得内部代码评审优秀", "学习能力强，半年内掌握了Go和Rust"],
      risks: ["独立架构设计经验不足，需要mentor带", "年限4年，距离高级岗位要求有差距"],
    },
    salary: { current: "25K", expected: "28-35K" },
    skills: [{ name: "交易系统", level: 4 }, { name: "Go/Rust", level: 3 }, { name: "微服务", level: 4 }, { name: "性能优化", level: 3 }],
    status: "ongoing", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=96&h=96&fit=crop&crop=face", lastActive: "3小时前",
  },
  4: {
    id: 4, name: "赵**", currentCompany: "美团", currentPosition: "后端技术负责人",
    experience: "7年", matchScore: 91, recommendLevel: "strong",
    tags: [{ label: "技术负责人", type: "positive" }, { label: "7年经验", type: "positive" }, { label: "管理经验", type: "positive" }],
    aiReason: "技术管理双料人才，带过15人团队，符合核心岗位所有要求",
    aiAnalysis: {
      summary: "7年后端经验，3年管理经验，技术深度和广度兼备，是高级岗位的理想人选。",
      strengths: ["带过15人后端团队，有成熟的管理方法论", "主导过到店业务核心系统从单体到微服务的全面重构", "连续3年绩效S，在美团晋升速度快"],
      risks: ["期望薪资50K+，超出预算上限", "可能对岗位级别有更高要求"],
    },
    salary: { current: "45K", expected: "50-60K" },
    skills: [{ name: "技术管理", level: 5 }, { name: "系统架构", level: 5 }, { name: "微服务", level: 5 }, { name: "团队建设", level: 4 }],
    status: "ongoing", avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=96&h=96&fit=crop&crop=face", lastActive: "昨天",
  },
  5: {
    id: 5, name: "陈**", currentCompany: "快手", currentPosition: "后端工程师",
    experience: "3年", matchScore: 68, recommendLevel: "consider",
    tags: [{ label: "广告系统经验", type: "positive" }, { label: "经验不足", type: "negative" }],
    aiReason: "有广告系统后端经验但年限偏短，适合作为备选",
    aiAnalysis: {
      summary: "3年广告系统后端经验，技术功底扎实但独立性不足。",
      strengths: ["快手商业化中台核心开发，熟悉广告计费", "算法基础好，有ACM竞赛经验"],
      risks: ["仅3年经验，未达到岗位5年要求", "没有带人经验"],
    },
    salary: { current: "22K", expected: "25-30K" },
    skills: [{ name: "广告系统", level: 3 }, { name: "算法", level: 4 }, { name: "Java", level: 4 }, { name: "分布式", level: 3 }],
    status: "ended", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=96&h=96&fit=crop&crop=face", lastActive: "2天前",
  },
};

export const candidateList = Object.values(allCandidates);
