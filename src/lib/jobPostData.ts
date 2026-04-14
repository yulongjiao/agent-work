/* ============ Job Post Mock Data for Employer Dashboard ============ */

export interface JobPost {
  id: number;
  title: string;
  department: string;
  status: "active" | "paused" | "closed";
  funnel: { applied: number; screened: number; interview: number };
  daysOpen: number;
  estimatedDays: number;
  salary: string;
  competitiveness: number;  // 1-100
  jdSummary: string;
  agentUnderstanding: string;
  createdAt: string;
}

export const allJobPosts: JobPost[] = [
  {
    id: 1, title: "高级Java后端工程师", department: "商业化技术部",
    status: "active",
    funnel: { applied: 187, screened: 35, interview: 8 },
    daysOpen: 14, estimatedDays: 7,
    salary: "30-45K",
    competitiveness: 78,
    jdSummary: "负责广告投放系统的后端架构设计与核心模块开发，支撑日均千万级广告请求。",
    agentUnderstanding: "核心需求：系统设计能力 + 5年以上Java经验 + 微服务架构。候选人需有高并发实战经验，有支付或交易系统背景加分。",
    createdAt: "2周前",
  },
  {
    id: 2, title: "前端架构师", department: "产品技术部",
    status: "active",
    funnel: { applied: 124, screened: 18, interview: 4 },
    daysOpen: 21, estimatedDays: 14,
    salary: "35-50K",
    competitiveness: 65,
    jdSummary: "负责前端基础架构建设，包括组件库、构建工具链和性能优化方案。",
    agentUnderstanding: "核心需求：React/Vue深度经验 + 工程化能力 + 性能优化。需有大型项目架构经验，微前端经验优先。",
    createdAt: "3周前",
  },
  {
    id: 3, title: "数据工程师", department: "数据智能部",
    status: "paused",
    funnel: { applied: 89, screened: 12, interview: 3 },
    daysOpen: 30, estimatedDays: 0,
    salary: "28-40K",
    competitiveness: 72,
    jdSummary: "负责数据仓库建设和实时数据流处理，支撑业务分析和AI模型训练。",
    agentUnderstanding: "核心需求：Spark/Flink经验 + 数据仓库建模 + SQL优化。有实时数据处理经验优先。",
    createdAt: "1个月前",
  },
  {
    id: 4, title: "产品经理", department: "用户增长部",
    status: "closed",
    funnel: { applied: 256, screened: 42, interview: 12 },
    daysOpen: 45, estimatedDays: 0,
    salary: "25-35K",
    competitiveness: 85,
    jdSummary: "负责用户增长策略制定和产品方案设计，提升用户留存和转化。",
    agentUnderstanding: "已招满3人，岗位关闭。",
    createdAt: "1.5个月前",
  },
];
