// 鲲界企业 AI 化诊断 v4 · 题库、评分、场景与案例。
// 权重与阈值是鲲界 v0.4 产品假设，需用真实企业样本校准；不对外宣称为任何机构认证标准。

export const dimensions = [
  { id: 'direction',   name: '目标与责任', weight: 15 },
  { id: 'workflow',    name: '流程与系统', weight: 18 },
  { id: 'knowledge',   name: '数据与知识', weight: 19 },
  { id: 'application', name: 'AI 应用深度', weight: 19 },
  { id: 'people',      name: '团队与采用', weight: 15 },
  { id: 'value',       name: '成效与治理', weight: 14 },
];

// notes[i]：选中第 i 项后出现的“顾问旁注”。gap：低分时报告引用的含义；fix：最小可行动作。
export const questions = [
  { id: 'd1', dim: 'direction', title: '你们为什么要用 AI？', helper: '选最接近真实情况的一项',
    options: ['还没有明确目标', '有想法，但比较笼统', '已选定一个具体业务问题', '目标、负责人和衡量指标都明确'],
    notes: ['很常见。报告会从你后面的回答里，反推最值得先做的一件事。', '“提效”太大，AI 项目需要一个能在 30 天内看到结果的小目标。', '好的起点。具体问题比“全面 AI 化”更容易拿到第一个结果。', '这是多数企业缺的一环，你们已经具备。'],
    gap: '没有具体目标，AI 投入难以判断值不值', fix: '选一个高频、可计量的任务，写下“现在多久 / 目标多久”' },
  { id: 'd2', dim: 'direction', title: 'AI 项目现在由谁推动？', helper: '“有人关注”和“有人负责”差别很大',
    options: ['暂时没人负责', '几位员工自发尝试', '有一位兼任负责人', '有负责人、预算和固定复盘'],
    notes: ['没有负责人时，试点通常停在演示阶段。', '自发尝试是好信号，但经验很难在团队里复制。', '100 人以内的企业，兼任负责人完全够用，关键是有复盘节奏。', '责任链清楚，可以直接进入场景试点。'],
    gap: '没有明确负责人，试点容易停在演示阶段', fix: '指定一位业务负责人（可兼任），每两周复盘 30 分钟' },
  { id: 'd3', dim: 'direction', title: '有多个 AI 想法时，怎么决定先做哪个？', helper: '看是否会同时考虑价值和落地难度',
    options: ['想到什么做什么', '主要由老板拍板', '会比较影响和实施难度', '有统一标准，定期调整'],
    notes: ['报告第二阶段会帮你把想法放进“价值 × 就绪度”矩阵。', '老板判断往往方向对，补上落地难度会更稳。', '这正是排优先级的正确方法。', '你们已经有组合管理能力，适合同时推进 2–3 个场景。'],
    gap: '优先级靠直觉，容易先做“看起来酷”但难落地的项目', fix: '用“每周耗时 × 出错代价 × 数据是否现成”给候选场景打分' },

  { id: 'w1', dim: 'workflow', title: '高频工作有清晰的流程吗？', helper: '例如获客、报价、交付、客服、采购',
    options: ['主要靠口头和个人经验', '部分流程写下来了', '关键流程有步骤和责任人', '流程在线运行，瓶颈和异常可追踪'],
    notes: ['AI 无法接手说不清的流程，这一项会显著影响你的上限。', '先把写下来的那部分做成在线表单，是最便宜的一步。', '有步骤和责任人，AI 就能找到插入点。', '在线运行的流程是数字员工最好的工作台。'],
    gap: '流程依赖个人经验，AI 找不到可以接手的环节', fix: '挑一个高频流程，画出“输入→步骤→交付→异常”四格' },
  { id: 'w2', dim: 'workflow', title: '任务交接时，信息会丢吗？', helper: '想想最近一次任务转交',
    options: ['经常丢，需要反复问', '偶尔丢，靠人补救', '大部分能在统一工具里追踪', '状态、责任和下一步自动同步'],
    notes: ['交接断点是 AI 最容易产生价值、也最容易出错的地方。', '人工补救的成本通常被低估，值得量化一次。', '统一工具里的记录，可以直接作为 AI 的输入。', '你们的协作基础已经接近 AI 原生团队。'],
    gap: '交接靠人记，信息断点多', fix: '把交接改成一张在线表或群机器人通知，先消灭“反复问”' },
  { id: 'w3', dim: 'workflow', title: '业务数据和协作工具连在一起吗？', helper: '不限飞书，也包括 CRM、ERP、电商后台、表格',
    options: ['分散在聊天和个人文件里', '有工具，但彼此割裂', '关键工具之间能同步部分数据', '主要流程贯通，可自动触发下一步'],
    notes: ['数据在个人手里时，AI 只能做“写写文案”。', '割裂的系统是常态，一个多维表格中台就能先连起来。', '部分同步已经够做第一个自动化试点。', '系统贯通意味着可以让 AI 直接触发动作，而不只是给建议。'],
    gap: '数据分散在聊天和个人文件里，AI 拿不到可信上下文', fix: '用一张共享表收拢一个场景的数据，再接 AI' },

  { id: 'k1', dim: 'knowledge', title: '员工找一份准确信息要多久？', helper: '产品资料、报价规则、案例、制度',
    options: ['靠问人，经常找不到', '文件很多，但查找费时', '有统一资料库，基本能搜到', '按权限快速找到最新、有出处的答案'],
    notes: ['“靠问人”说明知识在老员工脑子里——这正是知识问答助手的典型起点。', '资料多但难找，AI 检索能直接解决。', '有资料库，接入 AI 问答的成本已经很低。', '知识层已经可以支撑数字员工对外服务。'],
    gap: '知识在人脑和散落文件里，新人和 AI 都学不会', fix: '收集 50 个最高频的内部问题和标准答案，做成知识库' },
  { id: 'k2', dim: 'knowledge', title: '关键资料多久更新一次？', helper: '过期资料会直接让 AI 给出错误答案',
    options: ['没有固定更新', '出了问题才改', '有人定期维护', '有责任人、版本和更新提醒'],
    notes: ['AI 会自信地复述过期信息，这是最常见的翻车原因。', '被动更新可以接受，但需要一个“谁来改”的约定。', '定期维护已经满足大部分 AI 场景。', '有版本管理，AI 答案可以追溯到具体文件。'],
    gap: '资料没有维护机制，AI 答案会过期', fix: '给每类资料指定一位维护人，每月检查一次' },
  { id: 'k3', dim: 'knowledge', title: '做业务决策时，能拿到可靠数据吗？', helper: '看数据能不能用，而不是报表多不多',
    options: ['主要凭感觉', '能看到零散数据', '核心指标口径统一', '数据及时可信，能回溯原因'],
    notes: ['没有数据基线，就无法证明 AI 带来了什么。', '零散数据先统一 3 个核心指标口径就够了。', '口径统一后，AI 可以帮你“用自然语言问数”。', '可以考虑经营分析类的数字员工。'],
    gap: '缺少统一口径的数据，无法衡量 AI 效果', fix: '为试点场景定义 3 个指标，并记录当前值作为基线' },

  { id: 'a1', dim: 'application', title: '团队现在怎样使用 AI？', helper: '从个人试用到嵌入流程，深度不同',
    options: ['基本不用', '少数人偶尔用聊天工具', '多个岗位经常使用', '已嵌入业务流程并持续优化'],
    notes: ['零起点也有优势：没有坏习惯，可以直接按流程设计。', '个人使用是第一步，但价值无法沉淀给公司。', '使用面已经铺开，下一步是把好用法固化进流程。', '你们已在 AI 原生的路上，重点转向规模化和治理。'],
    gap: 'AI 停留在个人聊天工具，价值没有沉淀', fix: '把个人最好用的 3 个提示词变成团队模板' },
  { id: 'a2', dim: 'application', title: 'AI 承担过真实业务任务吗？', helper: '例如整理线索、写报价初稿、处理工单',
    options: ['还没有', '做过演示或一次性任务', '在一个场景稳定运行', '多个场景稳定运行，有人工接管'],
    notes: ['报告会给你一个 2 周内可以跑起来的试点。', '“演示惊艳、上线即停”是最普遍的现象，原因通常不在 AI 本身。', '一个稳定场景比十个演示更有价值。', '多场景稳定运行，已经具备复制能力。'],
    gap: 'AI 还没有进入真实业务流程', fix: '选一个低风险、每天发生的任务，让 AI 出初稿、人来确认' },
  { id: 'a3', dim: 'application', title: '你们看得清 AI 的用量和成本吗？', helper: '工具席位、模型调用量或 token 消耗',
    options: ['不知道用了多少', '知道大致费用', '能按团队或场景看用量', '能把用量、成本和产出对应起来'],
    notes: ['用量本身不代表成熟，但看不见就无法优化。', '知道总费用后，下一步是按场景拆开。', '按场景看用量，已经可以算单位成本。', '能算单位产出成本，是 AI 规模化的前提。'],
    gap: 'AI 投入是一笔糊涂账', fix: '按场景记录调用量，算出“每完成一单任务的成本”' },

  { id: 'p1', dim: 'people', title: '员工知道怎样把 AI 用在自己的工作上吗？', helper: '不只是“问一句”',
    options: ['大部分不了解', '只有少数人会用', '主要岗位有培训和范例', '能自主改进用法并分享'],
    notes: ['培训不是讲工具，而是给每个岗位一个能直接用的范例。', '少数高手是宝贵资产，让他们带一次内部分享。', '有范例的团队，采用速度通常快很多。', '自主改进的文化，是 AI 原生组织的核心特征。'],
    gap: '员工不知道 AI 能帮自己做什么', fix: '为每个核心岗位准备 1 个“开箱即用”的 AI 工作范例' },
  { id: 'p2', dim: 'people', title: 'AI 结果不理想时，团队会怎么做？', helper: '这决定了工具能不能越用越好',
    options: ['直接放弃或忽略', '个人临时修改', '会记录问题并反馈', '有固定的反馈和优化闭环'],
    notes: ['放弃是理性的，除非有人负责把问题修好。', '个人修改的经验没有回到系统里。', '有反馈记录，AI 才会越用越准。', '闭环是数字员工持续变好的唯一方式。'],
    gap: 'AI 出错没人收集，工具不会变好', fix: '建一个“AI 纠错”群或表，每周集中处理一次' },
  { id: 'p3', dim: 'people', title: '新工具上线后，团队能真正用起来吗？', helper: '关注一线员工的真实使用',
    options: ['通常很难推进', '少数积极者在用', '多数相关人员能持续使用', '使用数据可见，流程持续迭代'],
    notes: ['推不动通常是因为工具没嵌进原来的工作路径。', '从积极者所在的小组开始试点，成功率最高。', '采用基础好，试点能较快扩展。', '团队适应力强，可以承受更快的迭代节奏。'],
    gap: '新工具推不动，一线不买账', fix: '试点放在积极者所在小组，把 AI 嵌进他们现有的群和表' },

  { id: 'v1', dim: 'value', title: '你们怎样判断 AI 有没有带来价值？', helper: '时间、质量、转化、成本',
    options: ['主要靠感觉', '看个别案例', '试点前后会比较指标', '有持续看板、基线和投入产出复盘'],
    notes: ['没有基线，老板和团队对效果的判断往往相反。', '个别案例有说服力，但不够做投入决策。', '前后对比是最实用的衡量方法。', '你们已经具备做 AI 投资决策的数据基础。'],
    gap: '没有效果基线，AI 投入无法被证明', fix: '试点前抽 20–30 个真实任务，记录耗时与错误率' },
  { id: 'v2', dim: 'value', title: 'AI 输出进入业务前，有复核规则吗？', helper: '尤其是对客户、财务和重要决策',
    options: ['没有明确规则', '靠员工自己判断', '关键内容必须人工审核', '分级审核、留痕、可回退'],
    notes: ['对外内容没有复核，是最直接的经营风险。', '个人判断在忙的时候会失效。', '关键内容人工审核，是合理的默认设置。', '分级审核让你可以放心扩大 AI 的权限。'],
    gap: 'AI 输出直接进入业务，缺少复核', fix: '规定：对客户、涉及价格和合同的内容，必须人工确认' },
  { id: 'v3', dim: 'value', title: '公司数据给 AI 用时，边界清楚吗？', helper: '权限、敏感信息、供应商',
    options: ['还没讨论过', '有口头提醒', '有基本规范和权限', '规范、权限、培训和检查都到位'],
    notes: ['员工可能已经在把客户资料贴进公共 AI 工具。', '口头提醒需要落成一页纸的规范。', '基本规范已能支撑大部分试点。', '治理成熟，可以接入更敏感的业务数据。'],
    gap: '数据边界不清，存在客户信息外泄风险', fix: '出一页《AI 使用规范》：哪些数据不能贴、用哪些工具' },
];

export const levels = [
  { id: 'L1', name: '观望',     min: 0,  desc: 'AI 还没有进入工作，主要停留在关注和讨论。', next: ['选定一个具体业务问题', '指定一位负责人（可兼任）', '让 3–5 人每天用起来'] },
  { id: 'L2', name: '个人试用', min: 20, desc: '有人在用，但价值停留在个人，公司层面看不到结果。', next: ['把好用法固化成团队模板', '一个场景让 AI 出初稿、人确认', '记录试点前的耗时基线'] },
  { id: 'L3', name: '局部应用', min: 40, desc: '一两个场景跑通，但依赖少数人推动，难以复制。', next: ['把场景接进统一的数据与协作工具', '建立纠错与复盘闭环', '按场景核算单位成本'] },
  { id: 'L4', name: '体系化',   min: 60, desc: '多个场景稳定运行，有指标、有治理，开始规模化。', next: ['让 AI 直接触发业务动作', '数字员工承担完整岗位任务', '用经营指标管理 AI 组合'] },
  { id: 'L5', name: 'AI 原生',  min: 80, desc: '核心交付由人机协同完成，收入增长不再线性依赖人力。', next: ['持续优化单位产出成本', '把能力产品化对外输出', '保持治理与安全的同步升级'] },
];

export const industries = ['电商零售', '制造', '贸易批发', '专业服务', '软件科技', '其他'];
export const sizes = ['1–10 人', '11–30 人', '31–60 人', '61–100 人'];

export const scenarios = [
  { id: 'service',   name: '客服与售后',   example: '重复咨询、退换货、工单分派',     dims: ['knowledge', 'workflow'],     tags: ['客服', '售后', '知识'] },
  { id: 'sales',     name: '获客与销售',   example: '线索整理、报价、跟进提醒',       dims: ['workflow', 'knowledge'],     tags: ['销售', '商机', '报价'] },
  { id: 'content',   name: '内容与营销',   example: '商品文案、直播话术、合规自检',   dims: ['application', 'knowledge'],  tags: ['内容', '营销', '电商'] },
  { id: 'knowledge', name: '知识与培训',   example: '内部问答、新人带教、制度查询',   dims: ['knowledge', 'people'],       tags: ['知识', '培训'] },
  { id: 'ops',       name: '订单与交付',   example: '订单异常、交付跟踪、项目协同',   dims: ['workflow', 'application'],   tags: ['流程', '交付', '项目'] },
  { id: 'supply',    name: '采购与库存',   example: '补货预测、库存预警、供应商协同', dims: ['knowledge', 'workflow'],     tags: ['库存', '采购', '供应链'] },
  { id: 'quality',   name: '质检与生产',   example: '巡检、质检识别、良率监控',       dims: ['workflow', 'value'],         tags: ['质检', '生产', '巡检'] },
  { id: 'analytics', name: '经营分析',     example: '日报周报、自然语言问数、复盘',   dims: ['knowledge', 'value'],        tags: ['数据', '分析'] },
];
export const freqOptions = [['每天几十次', 150], ['每天几次', 25], ['每周几次', 6], ['偶尔', 1]];
export const durationOptions = [['5 分钟内', 4], ['5–30 分钟', 15], ['半小时以上', 50]];
export const riskOptions = [['低', 0], ['中', 1], ['高', 2]];
export const toolOptions = ['飞书', '企业微信', '钉钉', '电商后台', 'ERP', 'CRM', 'Excel / 表格'];
export const metricOptions = ['处理时长', '响应速度', '错误率', '转化率', '人力成本', '客户满意度'];

// source: 飞书客户案例 / 飞书官网文章 / 飞书产品页 / 媒体报道。所有链接已于 2026-10-23 打开核对。
export const cases = [
  { company: '广州酒家', industry: '电商零售', source: '飞书客户案例', title: '团购报价与电商客服工作流', tags: ['客服', '售后', '报价', '电商'], borrow: '报价规则先沉淀为结构化表格，AI 读表生成报价，客服只做确认。', caution: '前提是报价规则能被写清楚；规则靠经验的先做梳理。', url: 'https://www.feishu.cn/customers/guangzhourestaurant_ai_case' },
  { company: '公牛集团', industry: '制造', source: '飞书产品页', title: '“公牛智服”：面向客户与经销商的客服 Agent', tags: ['客服', '知识', '售后'], borrow: '先覆盖经销商和客户最高频的问题，复杂问题转人工。', caution: '大企业的接待规模不可直接类比，借鉴的是“先问答、后转人工”的结构。', url: 'https://www.feishu.cn/paid/ai-customer-service' },
  { company: '跨境电商团队', industry: '电商零售', source: '飞书官网文章', title: '数据抓取 → AI 分析 → 趋势结合的选品工作流', tags: ['电商', '内容', '营销', '数据'], borrow: '小团队用多维表格把选品信号收进一张表，AI 字段批量分析。', caution: '文章为官方宣传，营收数字未经独立核实。', url: 'https://www.feishu.cn/content/article/7582904528077917408' },
  { company: '电商企业（双十一）', industry: '电商零售', source: '飞书官网文章', title: '多维表格 AI 字段捷径应对大促', tags: ['电商', '内容', '流程'], borrow: '在已有表格里加 AI 列，不改变团队原来的工作方式。', caution: '适合已在用在线表格的团队。', url: 'https://www.feishu.cn/content/article/7576192126120316104' },
  { company: '电商营销团队', industry: '电商零售', source: '飞书官网文章', title: '营销素材违禁词自检', tags: ['内容', '营销', '质检', '电商'], borrow: '图片文字识别 + 违禁词库比对，上线前自动拦截。', caution: '词库需要持续维护，识别结果仍建议抽检。', url: 'https://www.feishu.cn/content/article/7602196595374886088' },
  { company: '影石创新', industry: '制造', source: '飞书客户案例', title: '渠道合作邮件识别与商机漏斗', tags: ['销售', '商机', '渠道'], borrow: 'AI 解析来信、提取意向，自动进入可追踪的商机表。', caution: '需要先有统一的商机记录位置。', url: 'https://www.feishu.cn/customers/insta360_ai_case' },
  { company: '伯杰医疗', industry: '专业服务', source: '飞书客户案例', title: '销售数据自然语言分析', tags: ['数据', '分析', '销售'], borrow: '管理者用自然语言追问销售数据的变化和原因。', caution: '数据口径不统一时，AI 会给出看似合理的错误结论。', url: 'https://www.feishu.cn/customers/biogerm_ai_case' },
  { company: '致欧家居', industry: '电商零售', source: '飞书客户案例', title: '箱标质检：识别、比对、异常闭环', tags: ['质检', '识别', '物流', '电商'], borrow: '图片识别与业务数据自动比对，异常交给人工复核。', caution: '先算清错误成本，再决定识别精度要求。', url: 'https://www.feishu.cn/customers/songmicshome_ai_case' },
  { company: '金鸿曲轴', industry: '制造', source: '飞书官网文章', title: '老牌工厂的现场问答与任务派发', tags: ['生产', '知识', '巡检', '流程'], borrow: '把老师傅经验和现场规范变成随时可问的助手，任务自动派发。', caution: '一线采用是关键，入口要放在工人已经在用的工具里。', url: 'https://www.feishu.cn/content/article/7581687310874414297' },
  { company: '内江金鸿', industry: '制造', source: '飞书客户案例', title: '工厂现场问答与物料预警', tags: ['生产', '库存', '知识'], borrow: '现场上报、物料预警与问答统一入口。', caution: '预警规则需要生产负责人参与制定。', url: 'https://www.feishu.cn/customers/jinhong_ai_case' },
  { company: '舜宇光学 · 吉利汽车研究院', industry: '制造', source: '飞书官网文章', title: '产线良率监测与检测数据语音录入', tags: ['质检', '生产', '数据'], borrow: '用多维表格 + AI 监测良率波动，提前发现异常。', caution: '大企业案例，借鉴“数据先在线、再加 AI 监测”的顺序。', url: 'https://www.feishu.cn/content/article/7592553256321125593' },
  { company: '阿维塔 · 雅迪', industry: '制造', source: '媒体报道', title: '项目交付系统与交付物 AI 预审', tags: ['项目', '交付', '流程', '质检'], borrow: '交付物提交时由智能体先做质量预审，人只看被标记的问题。', caution: '来源为媒体报道，效率数字为企业自述。', url: 'https://www.pingwest.com/w/313114' },
  { company: '龙蟠科技', industry: '制造', source: '媒体报道', title: '行业信息聚合与决策支持', tags: ['数据', '分析', '供应链'], borrow: '用智能体持续采集行业与竞品信息，结构化后推送给决策者。', caution: '信息源质量决定结论质量，需人工抽检。', url: 'https://www.cnfin.com/cmjj-lb/detail/20260924/4475025_1.html' },
  { company: '亿咖通', industry: '制造', source: '飞书客户案例', title: '供应链预测、库存异动与协同', tags: ['采购', '库存', '供应链'], borrow: '需求预测、库存预警和责任人协同放在一个闭环。', caution: '需要较完整的历史数据，小企业可先做库存预警。', url: 'https://www.feishu.cn/customers/ecarx_ai_case' },
  { company: '中国飞鹤', industry: '制造', source: '飞书客户案例', title: '工厂智能巡检与告警处置', tags: ['质检', '巡检', '生产'], borrow: 'AI 识别异常后自动建工单，责任人二次确认。', caution: '借鉴“识别 → 工单 → 人确认”的链路，而非规模。', url: 'https://www.feishu.cn/customers/feihe' },
  { company: '南微医学', industry: '制造', source: '飞书客户案例', title: '客诉收集与跨团队闭环', tags: ['客服', '售后', '质检'], borrow: '统一收集客户反馈，AI 归类并推动处理和复盘。', caution: '需要明确每类问题的处理责任人。', url: 'https://www.feishu.cn/customers/nanweiyixue_ai_case2026' },
  { company: '霸王茶姬', industry: '其他', source: '飞书客户案例', title: '一线反馈结构化为组织知识', tags: ['知识', '培训', '反馈'], borrow: '大量一线建议自动打标，沉淀为可复用的经验库。', caution: '反馈量小的企业，人工整理可能更划算。', url: 'https://www.feishu.cn/customers/chagee_ai_case' },
  { company: '海底捞', industry: '其他', source: '飞书客户案例', title: '一线知识问答助手“大明白”', tags: ['知识', '培训', '客服'], borrow: '制度、案例和岗位经验变成员工随时可问的助手。', caution: '知识库维护责任要先定好。', url: 'https://www.feishu.cn/customers/haidilao_ai_case' },
  { company: '电商售后团队模板', industry: '电商零售', source: '飞书模板', title: '售后话术生成与跟进记录分析', tags: ['客服', '售后', '电商'], borrow: '直接套用模板，AI 生成回复话术并分析跟进记录，一天内可试用。', caution: '模板只是起点，话术需要按自家政策调整。', url: 'https://www.feishu.cn/template/group/ai-template-group' },
];

const clamp = (v, a = 0, b = 100) => Math.max(a, Math.min(b, v));

export function levelOf(score) { return [...levels].reverse().find(l => score >= l.min) || levels[0]; }

export function calculate(answers) {
  const dims = dimensions.map(d => {
    const qs = questions.filter(q => q.dim === d.id);
    const vals = qs.map(q => answers[q.id]).filter(v => Number.isInteger(v) && v >= 0 && v <= 3);
    return { ...d, score: vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / (vals.length * 3) * 100) : null, answered: vals.length, total: qs.length };
  });
  const answered = dims.reduce((n, d) => n + d.answered, 0);
  const scored = dims.filter(d => d.score !== null);
  const w = scored.reduce((n, d) => n + d.weight, 0);
  const score = answered >= 12 && w ? Math.round(scored.reduce((n, d) => n + d.score * d.weight, 0) / w) : null;
  const level = score === null ? null : levelOf(score);
  const ranked = [...scored].sort((a, b) => a.score - b.score);
  const unsure = questions.filter(q => answers[q.id] === -1).length;
  return { score, level, dims, answered, unsure, total: questions.length, weakest: ranked.slice(0, 2), strongest: [...ranked].reverse()[0], confidence: Math.round((answered / questions.length) * 100) };
}

// 发现：直接引用用户选择的原话，避免泛泛而谈。
export function findings(answers) {
  const picked = questions.filter(q => Number.isInteger(answers[q.id]) && answers[q.id] >= 0).map(q => ({ q, v: answers[q.id] }));
  const lows = picked.filter(x => x.v <= 1).sort((a, b) => a.v - b.v || dimWeight(b.q.dim) - dimWeight(a.q.dim));
  const highs = picked.filter(x => x.v >= 2).sort((a, b) => b.v - a.v);
  return {
    bottlenecks: lows.slice(0, 3).map(({ q, v }) => ({ dim: dimName(q.dim), quote: q.options[v], gap: q.gap, fix: q.fix })),
    strengths: highs.slice(0, 2).map(({ q, v }) => ({ dim: dimName(q.dim), quote: q.options[v] })),
    risk: answers.v2 <= 1 || answers.v3 <= 1 ? questions.find(q => q.id === (answers.v3 <= answers.v2 ? 'v3' : 'v2')) : null,
  };
}
const dimName = id => dimensions.find(d => d.id === id).name;
const dimWeight = id => dimensions.find(d => d.id === id).weight;

// 场景机会：价值来自用户填写的频次与耗时，就绪度来自相关维度得分。公式在报告中公开。
export function opportunity(sc, input, dimsById) {
  const weeklyHours = (input.freq * input.minutes) / 60;
  const value = clamp(Math.round(28 * Math.log(weeklyHours + 1) + input.risk * 6));
  const ready = clamp(Math.round(sc.dims.reduce((n, id) => n + (dimsById[id] ?? 30), 0) / sc.dims.length - input.risk * 8));
  return { value, ready, weeklyHours, savedLow: weeklyHours * 0.3 * 4.3, savedHigh: weeklyHours * 0.6 * 4.3 };
}

export function matchCases({ industry, picked = [], weakDims = [] }, limit = 4) {
  const tags = new Set(scenarios.filter(s => picked.includes(s.id)).flatMap(s => s.tags));
  if (!tags.size) { if (weakDims.includes('knowledge')) tags.add('知识'); if (weakDims.includes('workflow')) tags.add('流程'); tags.add('客服'); }
  return cases.map((c, i) => {
    const hit = c.tags.filter(t => tags.has(t));
    const same = industry && c.industry === industry;
    return { ...c, hit, same, rank: hit.length * 2 + (same ? 3 : 0) + (c.source === '飞书客户案例' ? 0.5 : 0), i };
  }).filter(c => c.hit.length).sort((a, b) => b.rank - a.rank || a.i - b.i).slice(0, limit);
}

// 报告示例：匿名化的示例企业，界面以“报告示例”标签呈现。
export const sample = {
  company: '某跨境家居电商', industry: '电商零售', size: '11–30 人', website: '',
  scan: {
    mode: 'sample', business: '主营收纳与小家居类目，通过亚马逊与独立站销售，团队约 25 人。', website: '', reputation: '',
    sources: [], evidence: { deepseek: { status: 'found', discovery: { status: 'found', brandHits: 1, asks: [
      { question: '家居收纳用品哪个牌子好？', top: [{ title: '2026 家居收纳品牌口碑榜', url: '', mine: false }, { title: '收纳盒怎么选：材质、尺寸与清洁', url: '', mine: false }, { title: '小户型收纳好物清单（含跨境新品牌）', url: '', mine: true }, { title: '收纳品类电商趋势观察', url: '', mine: false }] },
      { question: '跨境电商家居小件怎么选品？', top: [{ title: '家居小件选品的五个数据信号', url: '', mine: false }, { title: '亚马逊家居类目新卖家指南', url: '', mine: false }, { title: '独立站家居品牌冷启动复盘', url: '', mine: false }] },
    ] } } },
  },
  answers: { d1: 2, d2: 2, d3: 1, w1: 2, w2: 1, w3: 1, k1: 1, k2: 1, k3: 2, a1: 2, a2: 2, a3: 1, p1: 2, p2: 1, p3: 2, v1: 1, v2: 2, v3: 1 },
  deep: { picked: ['service', 'content'], inputs: { service: { freq: 150, minutes: 4, risk: 1 }, content: { freq: 25, minutes: 50, risk: 1 } }, tools: ['飞书', '电商后台'], metric: '处理时长', owner: '运营负责人' },
};
