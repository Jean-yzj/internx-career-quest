// 職位模板常數 — 權重初版，待人資校準
// NOTE: weights sum to 100 per role; checklist items per spec §7

export type RoleId =
  | 'product_manager'
  | 'business_analyst'
  | 'marketing'
  | 'hr'
  | 'business_dev'
  | 'consultant'
  | 'software_eng'
  | 'data_analyst'
  | 'ux_researcher'
  | 'finance';

export interface SkillDef {
  key: string;
  label: string;
  weight: number; // sum to 100
}

export interface RoleTemplate {
  id: RoleId;
  name: string;
  shortName: string;
  description: string;
  skills: SkillDef[];
  checklist: { key: string; label: string }[];
  internxQuery: string; // 心得/活動頁搜尋字串
}

export const ROLES: RoleTemplate[] = [
  {
    id: 'product_manager',
    name: '產品經理',
    shortName: 'PM',
    description: '負責定義產品方向、撰寫需求規格、協調開發與設計，並用數據驗證產品假設。',
    skills: [
      { key: 'project_mgmt',    label: '專案管理',   weight: 20 },
      { key: 'user_research',   label: '使用者研究', weight: 15 },
      { key: 'documentation',   label: 'PRD/文件能力', weight: 15 },
      { key: 'data_analysis',   label: '數據分析',   weight: 15 },
      { key: 'communication',   label: '跨部門溝通', weight: 15 },
      { key: 'business_sense',  label: '商業理解',   weight: 10 },
      { key: 'tech_literacy',   label: '技術理解',   weight: 10 },
    ],
    checklist: [
      { key: 'basics',       label: '基本資料完整' },
      { key: 'education',    label: '教育背景' },
      { key: 'experience',   label: '至少 1 段實習或專案經歷' },
      { key: 'project_role', label: '專案有角色與產出說明' },
      { key: 'skills_list',  label: '技能欄 ≥5 標籤' },
      { key: 'portfolio',    label: '作品集或文件連結' },
      { key: 'quantified',   label: '至少 2 個量化成果' },
      { key: 'pm_xp',        label: '產品相關經驗（功能規劃、流程優化）' },
      { key: 'user_research_trace', label: '使用者研究痕跡（訪談、問卷、回饋分析）' },
      { key: 'data_tools',   label: '數據工具（Excel/SQL/GA 任一）' },
    ],
    internxQuery: '產品經理',
  },
  {
    id: 'business_analyst',
    name: '商業分析師',
    shortName: 'BA',
    description: '透過數據分析與商業洞察協助決策，擅長用 Excel/SQL 拆解問題、製作報告。',
    skills: [
      { key: 'data_analysis',   label: '數據分析',   weight: 25 },
      { key: 'business_sense',  label: '商業理解',   weight: 20 },
      { key: 'presentation',    label: '簡報敘事',   weight: 15 },
      { key: 'excel_sql',       label: 'Excel/SQL',  weight: 15 },
      { key: 'research_method', label: '研究方法',   weight: 15 },
      { key: 'communication',   label: '溝通協作',   weight: 10 },
    ],
    checklist: [
      { key: 'basics',       label: '基本資料完整' },
      { key: 'education',    label: '教育背景' },
      { key: 'experience',   label: '至少 1 段分析相關經歷' },
      { key: 'analysis_work', label: '分析報告或作品連結' },
      { key: 'sql_excel',    label: 'SQL/Excel 操作證據' },
      { key: 'case_comp',    label: '個案競賽或實戰案例' },
      { key: 'quantified',   label: '至少 2 個量化成果' },
      { key: 'skills_list',  label: '工具技能欄（Python/Tableau/Power BI）' },
      { key: 'presentation', label: '簡報或報告作品' },
      { key: 'business_insight', label: '商業洞察描述（不只是數字）' },
    ],
    internxQuery: '商業分析',
  },
  {
    id: 'marketing',
    name: '行銷企劃',
    shortName: '行銷',
    description: '規劃活動與內容、經營社群、分析成效，讓品牌被更多人看見。',
    skills: [
      { key: 'content_creation', label: '內容產製',   weight: 20 },
      { key: 'social_media',    label: '社群操作',   weight: 20 },
      { key: 'data_literacy',   label: '數據判讀',   weight: 15 },
      { key: 'campaign_planning', label: '企劃提案', weight: 15 },
      { key: 'copywriting',     label: '文案撰寫',   weight: 15 },
      { key: 'visual_tools',    label: '視覺工具',   weight: 15 },
    ],
    checklist: [
      { key: 'basics',       label: '基本資料完整' },
      { key: 'social_result', label: '社群帳號成效數字' },
      { key: 'campaign_work', label: '企劃書或活動作品' },
      { key: 'portfolio',    label: '作品集連結' },
      { key: 'quantified',   label: '至少 2 個量化成果（觸及、ROI）' },
      { key: 'tools',        label: '工具熟練度（Canva/Figma/GA）' },
      { key: 'experience',   label: '至少 1 段行銷或活動執行經歷' },
      { key: 'copy_sample',  label: '文案或貼文樣本連結' },
      { key: 'audience_sense', label: '受眾洞察描述' },
      { key: 'skills_list',  label: '技能標籤清單' },
    ],
    internxQuery: '行銷企劃',
  },
  {
    id: 'hr',
    name: '人資',
    shortName: 'HR',
    description: '負責招募、員工關係、教育訓練與雇主品牌，是組織與人才之間的橋梁。',
    skills: [
      { key: 'empathy_comm',    label: '溝通同理',       weight: 25 },
      { key: 'recruit_exec',    label: '招募/活動執行',  weight: 20 },
      { key: 'admin_detail',    label: '行政細心',       weight: 15 },
      { key: 'labor_law',       label: '勞動法規意識',   weight: 15 },
      { key: 'employer_brand',  label: '雇主品牌',       weight: 15 },
      { key: 'data_basic',      label: '數據基礎',       weight: 10 },
    ],
    checklist: [
      { key: 'basics',       label: '基本資料完整' },
      { key: 'recruit_xp',   label: '招募或活動執行經驗' },
      { key: 'club_leader',  label: '社團幹部或帶人經驗' },
      { key: 'detail_proof', label: '細心呈現（無錯字、格式整齊）' },
      { key: 'empathy_case', label: '展現同理心的具體案例' },
      { key: 'tools',        label: 'HR 工具熟悉度（ATS/Excel）' },
      { key: 'quantified',   label: '至少 1 個量化成果' },
      { key: 'skills_list',  label: '技能標籤清單' },
      { key: 'labor_sense',  label: '勞動法規或職場倫理描述' },
      { key: 'communication', label: '對外溝通場景描述' },
    ],
    internxQuery: '人資',
  },
  {
    id: 'business_dev',
    name: '業務開發',
    shortName: 'BD',
    description: '開拓合作夥伴、洽談合約、推動成長，是公司對外最前線的角色。',
    skills: [
      { key: 'sales_negotiation', label: '開發與談判', weight: 25 },
      { key: 'presentation',    label: '簡報提案',   weight: 20 },
      { key: 'market_research', label: '市場研究',   weight: 15 },
      { key: 'resilience',      label: '抗壓目標感', weight: 15 },
      { key: 'network',         label: '人脈經營',   weight: 15 },
      { key: 'crm_tools',       label: 'CRM 工具',   weight: 10 },
    ],
    checklist: [
      { key: 'basics',       label: '基本資料完整' },
      { key: 'sales_result', label: '可量化的業績或開發成果' },
      { key: 'cold_outreach', label: '陌生開發或拜訪經驗' },
      { key: 'proposal',     label: '提案作品或 pitch deck' },
      { key: 'quantified',   label: '至少 2 個量化成果' },
      { key: 'resilience_case', label: '展現抗壓或目標感的案例' },
      { key: 'tools',        label: 'CRM 或業務工具熟悉度' },
      { key: 'skills_list',  label: '技能標籤清單' },
      { key: 'partner_xp',   label: '合作夥伴或客戶關係描述' },
      { key: 'market_sense', label: '產業洞察描述' },
    ],
    internxQuery: '業務開發',
  },
  {
    id: 'consultant',
    name: '顧問',
    shortName: '顧問',
    description: '用結構化方法拆解商業問題，產出可行建議，與客戶協作推動改變。',
    skills: [
      { key: 'structured_thinking', label: '結構化思考', weight: 25 },
      { key: 'presentation',    label: '簡報製作',   weight: 20 },
      { key: 'research',        label: '研究能力',   weight: 20 },
      { key: 'quant_analysis',  label: '量化分析',   weight: 15 },
      { key: 'teamwork',        label: '團隊協作',   weight: 10 },
      { key: 'english',         label: '英文能力',   weight: 10 },
    ],
    checklist: [
      { key: 'basics',       label: '基本資料完整' },
      { key: 'case_comp',    label: '個案競賽經驗（BCG/McKinsey 風格）' },
      { key: 'gpa',          label: 'GPA 或學術成績顯著' },
      { key: 'english_proof', label: '英文能力證明（TOEFL/IELTS/交換）' },
      { key: 'slide_work',   label: '簡報作品連結' },
      { key: 'structure_case', label: '展現結構化思考的案例' },
      { key: 'quantified',   label: '至少 2 個量化成果' },
      { key: 'research_work', label: '研究報告或分析作品' },
      { key: 'skills_list',  label: '技能標籤清單' },
      { key: 'leadership',   label: '專案領導或主導經驗' },
    ],
    internxQuery: '顧問',
  },
  {
    id: 'software_eng',
    name: '軟體工程師',
    shortName: 'SWE',
    description: '設計、開發、測試軟體系統，用程式碼解決實際問題。',
    skills: [
      { key: 'coding',          label: '程式能力',   weight: 30 },
      { key: 'project_work',    label: '專案作品',   weight: 25 },
      { key: 'cs_fundamentals', label: 'CS 基礎',    weight: 15 },
      { key: 'git_collab',      label: 'Git 協作',   weight: 10 },
      { key: 'debug_learn',     label: '除錯學習力', weight: 10 },
      { key: 'communication',   label: '溝通協作',   weight: 10 },
    ],
    checklist: [
      { key: 'basics',       label: '基本資料完整' },
      { key: 'github',       label: 'GitHub 連結（有活躍紀錄）' },
      { key: 'side_project', label: 'Side project 或作品集' },
      { key: 'tech_stack',   label: '技術棧清單（語言/框架/工具）' },
      { key: 'cs_proof',     label: 'CS 基礎展示（演算法/系統設計）' },
      { key: 'quantified',   label: '至少 1 個量化成果（效能/規模）' },
      { key: 'collab_xp',    label: '團隊協作或開源貢獻' },
      { key: 'experience',   label: '至少 1 段開發實習或職位' },
      { key: 'problem_case', label: '解決具體技術問題的案例' },
      { key: 'learning',     label: '持續學習/自學資源展示' },
    ],
    internxQuery: '軟體工程師',
  },
  {
    id: 'data_analyst',
    name: '數據分析師',
    shortName: '數據',
    description: '蒐集、清理、分析數據，用視覺化報告驅動商業決策。',
    skills: [
      { key: 'sql_python',      label: 'SQL/Python', weight: 30 },
      { key: 'statistics',      label: '統計基礎',   weight: 20 },
      { key: 'visualization',   label: '視覺化',     weight: 15 },
      { key: 'business_reading', label: '商業解讀',  weight: 15 },
      { key: 'data_cleaning',   label: '資料清理',   weight: 10 },
      { key: 'presentation',    label: '簡報溝通',   weight: 10 },
    ],
    checklist: [
      { key: 'basics',       label: '基本資料完整' },
      { key: 'project_link', label: '分析專案連結（Kaggle/GitHub/Colab）' },
      { key: 'tool_proof',   label: 'SQL/Python/R 操作證據' },
      { key: 'viz_work',     label: '視覺化作品（Tableau/Power BI/matplotlib）' },
      { key: 'quantified_conclusion', label: '帶有量化結論的分析案例' },
      { key: 'statistics',   label: '統計方法描述' },
      { key: 'experience',   label: '至少 1 段數據相關實習或專案' },
      { key: 'business_context', label: '商業脈絡解讀（不只是技術）' },
      { key: 'skills_list',  label: '工具技能清單' },
      { key: 'cleaning',     label: '資料清理流程描述' },
    ],
    internxQuery: '數據分析',
  },
  {
    id: 'ux_researcher',
    name: 'UX 研究員',
    shortName: 'UXR',
    description: '用訪談、問卷、可用性測試了解使用者，把洞察轉化為設計決策。',
    skills: [
      { key: 'research_method', label: '研究方法',   weight: 30 },
      { key: 'interview_survey', label: '訪談/問卷', weight: 20 },
      { key: 'insight_synthesis', label: '洞察綜合', weight: 15 },
      { key: 'psych_stats',     label: '心理學/統計', weight: 15 },
      { key: 'prototype_tools', label: '原型工具',   weight: 10 },
      { key: 'storytelling',    label: '研究敘事',   weight: 10 },
    ],
    checklist: [
      { key: 'basics',       label: '基本資料完整' },
      { key: 'research_report', label: '研究報告或使用者洞察作品' },
      { key: 'interview_count', label: '訪談場次或研究對象數量' },
      { key: 'method_vocab', label: '研究方法論名詞正確使用' },
      { key: 'prototype_xp', label: 'Figma/Sketch 等原型工具經驗' },
      { key: 'quantified',   label: '至少 1 個研究成果影響設計的案例' },
      { key: 'psych_background', label: '心理學/認知科學背景描述' },
      { key: 'team_collab',  label: '與設計/PM 協作的案例' },
      { key: 'synthesis',    label: '把原始資料轉化為洞察的流程描述' },
      { key: 'skills_list',  label: '工具與方法清單' },
    ],
    internxQuery: 'UX 研究',
  },
  {
    id: 'finance',
    name: '金融實習',
    shortName: '金融',
    description: '協助財務分析、市場研究、投資評估，在金融機構累積實務經驗。',
    skills: [
      { key: 'finance_knowledge', label: '財務知識', weight: 25 },
      { key: 'excel_modeling',  label: 'Excel 建模', weight: 20 },
      { key: 'english',         label: '英文能力',   weight: 15 },
      { key: 'license',         label: '證照進度',   weight: 15 },
      { key: 'industry_research', label: '產業研究', weight: 15 },
      { key: 'detail',          label: '細心度',     weight: 10 },
    ],
    checklist: [
      { key: 'basics',       label: '基本資料完整' },
      { key: 'gpa',          label: 'GPA 或學術成績' },
      { key: 'license',      label: '金融證照（金研院/CFA L1 進度）' },
      { key: 'research_report', label: '研究報告或分析作品' },
      { key: 'excel_proof',  label: 'Excel/財務建模操作證據' },
      { key: 'english_proof', label: '英文能力展示' },
      { key: 'quantified',   label: '至少 1 個量化成果' },
      { key: 'internship_xp', label: '金融相關實習或競賽' },
      { key: 'industry_sense', label: '產業知識描述（股市/總經）' },
      { key: 'detail_case',  label: '細心度展示（無錯字、格式正確）' },
    ],
    internxQuery: '金融',
  },
];

export function getRoleById(id: string): RoleTemplate | undefined {
  return ROLES.find((r) => r.id === id);
}

export const ROLE_IDS: RoleId[] = ROLES.map((r) => r.id);
