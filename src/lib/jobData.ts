/* ============ Shared Job Analysis Data ============ */
/* 机会 Tab 和 消息 Tab 共用同一份数据源 */

export interface JobAnalysis {
  id: number;
  company: string;
  position: string;
  team: string;
  salary: string;
  location: string;
  aiScore: number;
  aiReason: string;
  aiAnalysis: {
    summary: string;
    points: string[];
    notes: string[];
  };
  jdSummary: string;
  requirements: string[];
  chatRounds: number;
  timeSpent: string;
  discoveredAt: string;
  aiTags: { label: string; type: "positive" | "negative" }[];
}

export const allJobAnalysis: Record<number, JobAnalysis> = {
  1: {
    id: 1, company: "字节跳动", position: "高级后端工程师", team: "商业化团队", salary: "28-35k", location: "北京",
    aiScore: 95, aiReason: "他们 leader 点名要有支付经验的人，你主导过网关拆分，正好是他最想见的那类候选人",
    aiAnalysis: {
      summary: "精准匹配 leader 核心诉求，HC 紧迫谈判空间大，建议优先推进。",
      points: [
        "团队 leader 上季度面了 20+ 人都不满意，核心痛点是缺少做过交易链路的人，你主导的支付网关拆分精准命中",
        "HR 私下透露本季度必须招满 3 人，流程会压缩到两周内",
        "薪资 28-35k 覆盖你的预期上限，HC 紧迫意味着谈判空间比平时大",
      ],
      notes: ["岗位要求「了解广告投放或推荐系统优先」，你没有直接经验，但 HR 说交易系统经验更重要，可以放心冲"],
    },
    jdSummary: "负责商业化广告投放系统的后端架构设计与核心模块开发，支撑日均千万级广告请求。",
    requirements: ["5年以上 Java 后端经验", "熟悉微服务架构和分布式系统", "有高并发场景实战经验", "了解广告投放或推荐系统优先"],
    chatRounds: 4, timeSpent: "2天", discoveredAt: "今天 09:12",
    aiTags: [{ label: "HC紧迫", type: "positive" }, { label: "Leader点名要", type: "positive" }, { label: "岗位匹配度高", type: "positive" }],
  },
  2: {
    id: 2, company: "蚂蚁集团", position: "支付安全架构师", team: "支付安全", salary: "30-40k", location: "杭州",
    aiScore: 85, aiReason: "HR 听完你的支付网关经历，当场说「这就是我们要的人」，主动把薪资上限透露了",
    aiAnalysis: {
      summary: "HR 反应极其强烈，年包 60 万+，杭州生活成本低，综合性价比最高。",
      points: [
        "HR 听到你的支付网关经历后原话是「这就是我们一直在找的人」，匹配度极高",
        "薪资 base 30-40k，年终稳定 4-6 个月，年包可到 60 万+",
        "杭州房价是北京的 6 折，同样薪资生活质量高一档",
      ],
      notes: ["需要从北京搬到杭州，蚂蚁有搬迁补贴政策，但搬迁成本和适应期需要考虑"],
    },
    jdSummary: "负责支付安全核心链路的架构升级，保障亿级日交易的资金安全与合规。",
    requirements: ["5年以上后端开发经验", "有支付/金融系统开发经验", "熟悉风控体系和安全合规", "优秀的系统设计能力"],
    chatRounds: 4, timeSpent: "1.5天", discoveredAt: "今天 08:47",
    aiTags: [{ label: "年包60万+", type: "positive" }, { label: "福利待遇好", type: "positive" }, { label: "有搬迁补贴", type: "positive" }],
  },
  3: {
    id: 3, company: "京东", position: "交易系统架构师", team: "零售技术", salary: "28-38k", location: "北京",
    aiScore: 87, aiReason: "他们正在重构交易中台，你做过的网关拆分经验是核心需求，HR 说可以跳级定岗",
    aiAnalysis: {
      summary: "交易中台大重构核心岗位，可跳级定 T8，北京本地通勤方便。",
      points: [
        "零售技术团队正做交易中台大重构，急需有实际微服务拆分经验的人",
        "HR 主动提到经验匹配可以跳级定 T8，薪资 28-38k 弹性大",
        "年终 4 个月起步，北京本地通勤方便，亦庄总部有班车",
      ],
      notes: ["已约了技术负责人做初步沟通，对方反馈积极，建议尽快推进"],
    },
    jdSummary: "负责零售交易中台核心链路的架构重构与性能优化，支撑亿级订单处理。",
    requirements: ["5年以上 Java 后端经验", "有交易系统或支付系统经验", "熟悉微服务拆分与治理", "有大型系统重构经验优先"],
    chatRounds: 4, timeSpent: "1.5天", discoveredAt: "昨天 16:45",
    aiTags: [{ label: "可跳级定岗", type: "positive" }, { label: "通勤距离近", type: "positive" }, { label: "岗位匹配度高", type: "positive" }],
  },
  4: {
    id: 4, company: "小红书", position: "内容分发后端工程师", team: "社区技术", salary: "27-34k", location: "上海",
    aiScore: 72, aiReason: "每周可以 2 天远程，HR 说团队从不强制加班——我核实过脉脉评价确实如此",
    aiAnalysis: {
      summary: "work-life balance 最好的选择，远程写进制度，脉脉口碑验证不卷。",
      points: [
        "每周 1-2 天远程写进制度，不是画饼，HR 确认过",
        "脉脉交叉验证社区技术团队口碑好，「不内卷」出现频率最高",
        "技术栈 Go + Java，你的 Java 背景无缝衔接，业务增长快不用担心优化",
      ],
      notes: [
        "岗位要求 3 年以上经验，你 2 年多差一点，但业务增长快对人急需，可以冲一下",
        "上海通勤需要考虑，但远程混合模式下实际到岗天数不多",
      ],
    },
    jdSummary: "负责社区内容分发系统的后端服务开发和优化，提升内容推荐的质量和效率。",
    requirements: ["3年以上后端开发经验", "熟悉 Java 或 Go", "了解推荐系统或内容分发优先", "有社区产品开发经验优先"],
    chatRounds: 3, timeSpent: "1天", discoveredAt: "今天 10:05",
    aiTags: [{ label: "可远程上班", type: "positive" }, { label: "脉脉验证不卷", type: "positive" }, { label: "岗位匹配度高", type: "positive" }],
  },
  5: {
    id: 5, company: "快手", position: "后端工程师", team: "商业化中台", salary: "26-33k", location: "北京",
    aiScore: 78, aiReason: "弹性双休制已确认，一面通过，面试推进顺利",
    aiAnalysis: {
      summary: "已确认弹性双休，一面通过等待二面，推进速度快。",
      points: [
        "弹性双休制度确认，无大小周",
        "一面已通过，二面预计本周内安排",
        "广告计费和投放策略方向，有一定技术深度",
      ],
      notes: ["薪资中位偏低，但有期权补充"],
    },
    jdSummary: "负责商业化中台广告计费和投放策略的后端开发。",
    requirements: ["3 年以上后端经验", "有广告系统经验优先", "熟悉高并发场景"],
    chatRounds: 4, timeSpent: "2天", discoveredAt: "昨天 14:00",
    aiTags: [{ label: "弹性双休", type: "positive" }, { label: "一面已过", type: "positive" }],
  },
  6: {
    id: 6, company: "腾讯", position: "支付系统高级工程师", team: "微信支付", salary: "30-42k", location: "深圳",
    aiScore: 82, aiReason: "薪资天花板 42k 是目前所有机会里最高的，但要搬去深圳，帮你算了笔账不太划算",
    aiAnalysis: {
      summary: "薪资天花板最高但需跨城，算完账性价比不如北京的几个机会。",
      points: [
        "薪资上限 42k 是所有机会里最高的，年包可能破 70 万",
        "微信支付团队技术深度毋庸置疑，履历含金量高",
      ],
      notes: [
        "需要搬去深圳，租房比北京贵 15%，搬迁成本约 3-5 万",
        "HR 提到近期加班多，正在赶一个大版本",
        "除非本来就想去深圳发展，否则前半年额外支出会吃掉薪资涨幅",
      ],
    },
    jdSummary: "参与微信支付核心交易链路的设计与开发，保障亿级用户的支付体验。",
    requirements: ["5年以上后端开发经验", "有支付或金融系统经验", "熟悉高可用架构设计", "良好的抗压能力"],
    chatRounds: 2, timeSpent: "半天", discoveredAt: "昨天 11:20",
    aiTags: [{ label: "需跨城搬迁", type: "negative" }, { label: "薪资天花板高", type: "positive" }],
  },
  7: {
    id: 7, company: "美团", position: "平台架构工程师", team: "到店事业群", salary: "25-33k", location: "北京",
    aiScore: 88, aiReason: "招 5 个人只收到 8 份简历，HR 说「只要过了一面基本就能定」，确定性极高",
    aiAnalysis: {
      summary: "确定性极高的保底选择，拿到 offer 还能反向撬动其他家谈判。",
      points: [
        "HC 有 5 个但简历池很浅，HR 原话「过了一面基本就定了」",
        "你的分布式架构经验正好是他们架构升级急需的",
        "北京本地不用搬迁，美团年终 3-5 个月，性价比不错",
      ],
      notes: [
        "薪资下限 25k 偏低，但我试探过面试表现好可以直接定 30k 起步",
        "适合当保底 offer，拿到后可以反向撬动字节和蚂蚁的谈判",
      ],
    },
    jdSummary: "负责到店商家平台核心系统的架构设计和性能优化，支撑百万级商家的日常运营。",
    requirements: ["4年以上 Java 开发经验", "分布式系统设计经验", "良好的沟通协作能力", "有电商或 O2O 经验优先"],
    chatRounds: 2, timeSpent: "1天", discoveredAt: "昨天 14:30",
    aiTags: [{ label: "一面即定", type: "positive" }, { label: "通勤距离近", type: "positive" }, { label: "可做谈判筹码", type: "positive" }],
  },
  401: {
    id: 401, company: "百度", position: "高级后端", team: "搜索技术", salary: "25-30k", location: "北京",
    aiScore: 50, aiReason: "C++ 要求不匹配，薪资上限偏低",
    aiAnalysis: {
      summary: "C++ 要求不匹配，薪资上限偏低。",
      points: [],
      notes: ["候选人主技术栈为 Java，C++ 经验不足", "薪资上限 30k 低于预期"],
    },
    jdSummary: "负责搜索排序引擎优化。",
    requirements: ["精通 C++", "有搜索引擎经验"],
    chatRounds: 2, timeSpent: "半天", discoveredAt: "4天前",
    aiTags: [{ label: "技术栈不匹配", type: "negative" }],
  },
  402: {
    id: 402, company: "网易", position: "高级工程师", team: "云音乐后端", salary: "22-28k", location: "杭州",
    aiScore: 40, aiReason: "脉脉风评差，Agent 自动拦截",
    aiAnalysis: {
      summary: "脉脉风评差，Agent 自动拦截。",
      points: [],
      notes: ["脉脉查到团队加班严重", "薪资偏低"],
    },
    jdSummary: "负责播放器及推荐系统。",
    requirements: ["有音视频经验优先"],
    chatRounds: 1, timeSpent: "半天", discoveredAt: "3天前",
    aiTags: [{ label: "风评差", type: "negative" }, { label: "薪资偏低", type: "negative" }],
  },
  403: {
    id: 403, company: "拼多多", position: "高级后端", team: "社交电商", salary: "30-45k", location: "上海",
    aiScore: 60, aiReason: "二面未通过，算法题表现不佳",
    aiAnalysis: {
      summary: "二面未通过，算法题表现不佳。",
      points: ["薪资范围好"],
      notes: ["二面算法题未通过"],
    },
    jdSummary: "负责社交裂变业务。",
    requirements: ["有电商系统经验", "算法基础扎实"],
    chatRounds: 4, timeSpent: "3天", discoveredAt: "2天前",
    aiTags: [{ label: "面试未通过", type: "negative" }],
  },
};
