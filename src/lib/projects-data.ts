export interface Project {
  slug: string;
  title: string;
  description: string;
  fullDescription: string;
  techStack: string[];
  features: string[];
  githubLink?: string;
  demoLink?: string;
  image: string;
  category?: string; // 新增:项目分类
}

export const projectsData: Project[] = [
  {
    slug: "customer-churn-prediction",
    title: "客户流失预测系统",
    description: "基于 Python 构建的机器学习模型,预测客户流失率(准确率 92%),助力市场团队制定留存策略。",
    fullDescription: `
      在当今竞争激烈的市场中,客户留存至关重要。本项目旨在通过分析历史客户数据,识别可能流失的高风险客户,从而采取先发制人的挽留措施。
      
      我们处理了超过 10 万条客户记录,包含人口统计学特征、服务使用模式和交易历史。通过清洗数据、处理缺失值和进行特征工程(如计算客户生命周期价值 CLV),我们构建了一个高质量的数据集。
      
      模型采用 XGBoost 和随机森林算法进行训练,并通过网格搜索(Grid Search)优化超参数。最终模型在测试集上达到了 92% 的准确率和 0.89 的 AUC 值。系统还集成了 SHAP 值分析,为业务部门提供模型的可解释性,指出了导致流失的关键因素(如月度费用过高、合同即将到期等)。
    `,
    techStack: ["Python", "Scikit-learn", "XGBoost", "Pandas", "Flask", "Docker"],
    features: [
      "自动化数据预处理流水线",
      "多模型集成预测",
      "SHAP 模型可解释性分析",
      "REST API 实时预测接口"
    ],
    githubLink: "https://github.com",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800",
    category: "机器学习"
  },
  {
    slug: "real-time-sales-dashboard",
    title: "实时销售监控仪表盘",
    description: "连接实时 SQL 数据库的交互式 Tableau 仪表盘,可视化展示区域销售业绩与 KPI 指标。",
    fullDescription: `
      为解决销售团队数据滞后的痛点,设计并开发了一套实时销售监控系统。该系统直接对接企业数据仓库,通过 SQL 查询实时抽取交易数据。
      
      仪表盘核心功能包括:实时营收追踪、区域销售热力图、产品类别表现分析以及销售人员业绩排名。我们使用了复杂的 SQL 窗口函数来计算同比增长率(YoY)和环比增长率(MoM)。
      
      前端采用 Tableau 制作,设计了直观的交互式界面,支持多维度下钻分析。系统上线后,报表生成时间从每周缩短至实时,帮助管理层将决策效率提升了 40%。
    `,
    techStack: ["Tableau", "SQL (PostgreSQL)", "ETL", "Data Warehousing"],
    features: [
      "实时数据流接入",
      "动态交互式过滤",
      "自动化邮件报表订阅",
      "移动端适配视图"
    ],
    githubLink: "https://github.com",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800",
    category: "数据可视化"
  },
  {
    slug: "sentiment-analysis-engine",
    title: "品牌舆情情感分析引擎",
    description: "NLP 处理流水线,分析 5万+ 社交媒体评论以评估品牌舆情,通过 Streamlit 应用进行可视化。",
    fullDescription: `
      针对社交媒体上海量的用户评论,本项目构建了一个自然语言处理(NLP)引擎,旨在量化品牌声誉并挖掘用户痛点。
      
      系统通过 API 抓取了 Twitter 和 Reddit 上关于品牌提及的 50,000+ 条评论。使用 NLTK 和 SpaCy 进行文本清洗、停用词去除和词形还原。核心模型基于 BERT 微调,能够精准识别评论的情感倾向(正面、负面、中性)以及具体的情感类别(愤怒、喜悦、失望)。
      
      分析结果通过 Streamlit 构建的 Web 应用进行展示,包含情感趋势时间轴、高频词云以及负面评论预警功能。
    `,
    techStack: ["Python", "PyTorch", "Hugging Face Transformers (BERT)", "Streamlit", "NLTK"],
    features: [
      "多平台数据采集",
      "基于 Transformer 的深度学习模型",
      "实时舆情监控大屏",
      "关键词提取与聚类"
    ],
    githubLink: "https://github.com",
    image: "https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?q=80&w=800",
    category: "自然语言处理"
  },
  {
    slug: "ecommerce-recommendation",
    title: "电商个性化推荐系统",
    description: "协同过滤算法分析用户购买历史,推荐相关产品,提升交叉销售收入 15%。",
    fullDescription: `
      为了提升电商平台的用户转化率和客单价,开发了一套个性化推荐系统。该系统结合了基于用户的协同过滤(User-based CF)和基于物品的协同过滤(Item-based CF)。
      
      利用 Spark 处理海量用户行为日志(点击、加购、购买),构建用户-物品评分矩阵。通过矩阵分解(Matrix Factorization)技术挖掘潜在特征,解决数据稀疏性问题。
      
      系统还引入了冷启动策略,针对新用户利用热门榜单和人口属性进行推荐。A/B 测试显示,新推荐系统上线后,点击率(CTR)提升了 20%,交叉销售收入增加了 15%。
    `,
    techStack: ["Python", "Apache Spark", "TensorFlow", "Redis", "FastAPI"],
    features: [
      "混合推荐算法引擎",
      "实时用户行为响应",
      "冷启动解决方案",
      "A/B 测试框架集成"
    ],
    githubLink: "https://github.com",
    image: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?q=80&w=800",
    category: "推荐系统"
  },
  {
    slug: "supply-chain-optimization",
    title: "供应链库存优化模型",
    description: "线性规划模型优化仓库库存水平,在维持服务水平的同时降低持有成本。",
    fullDescription: `
      面对供应链波动和库存成本积压的问题,本项目建立了一个库存优化数学模型。目标是在满足 98% 服务水平(Service Level)的前提下,最小化总库存成本(持有成本 + 订货成本 + 缺货成本)。
      
      我们分析了过去两年的历史需求数据,识别出季节性波动和趋势。利用 PuLP 库构建线性规划模型,对安全库存(Safety Stock)和再订货点(Reorder Point)进行动态优化。
      
      模型还考虑了供应商交货期(Lead Time)的不确定性,通过蒙特卡洛模拟进行了鲁棒性验证。实施该方案后,平均库存周转率提升了 25%,年度库存持有成本降低了 18%。
    `,
    techStack: ["Python", "PuLP", "NumPy", "Monte Carlo Simulation", "SciPy"],
    features: [
      "线性规划求解器",
      "需求预测集成",
      "多级库存策略",
      "成本敏感性分析"
    ],
    githubLink: "https://github.com",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=800",
    category: "运筹优化"
  },
  {
    slug: "financial-forecasting",
    title: "企业财务营收预测工具",
    description: "使用 ARIMA 模型进行时间序列预测,基于历史趋势和市场指标预测季度营收。",
    fullDescription: `
      为了辅助管理层进行年度预算规划,开发了这款财务时间序列预测工具。它能够基于历史财务数据和宏观经济指标,预测未来 4 个季度的营收趋势。
      
      项目首先对数据进行平稳性检验(ADF Test)和差分处理。对比了 ARIMA、SARIMA 和 Prophet 三种模型的效果,最终选择 SARIMA 模型以捕捉显著的季节性特征。
      
      工具还集成了外部回归变量(如 GDP 增长率、行业指数),进一步提升了预测精度。最终交付形式为一个自动化 Python 脚本,每月自动更新预测报告。
    `,
    techStack: ["Python", "Statsmodels", "Prophet", "Matplotlib", "Excel Automation"],
    features: [
      "时间序列分解",
      "季节性模式识别",
      "自动化报告生成",
      "置信区间评估"
    ],
    githubLink: "https://github.com",
    image: "https://images.unsplash.com/photo-1543286386-713bdd548da4?q=80&w=800",
    category: "时间序列分析"
  }
];

// 获取所有项目分类
export function getAllCategories(): string[] {
  const categories = new Set<string>();
  projectsData.forEach((project) => {
    if (project.category) {
      categories.add(project.category);
    }
  });
  return Array.from(categories).sort();
}

// 根据分类筛选项目
export function getProjectsByCategory(category: string): Project[] {
  return projectsData.filter((project) => project.category === category);
}

// 根据技术栈筛选项目
export function getProjectsByTech(tech: string): Project[] {
  return projectsData.filter((project) =>
    project.techStack.some((t) => t.toLowerCase().includes(tech.toLowerCase()))
  );
}
