/**
 * lib/guilds.ts — 16 公會常數
 * 包含：id、名稱、一句話定位、兩段介紹、roleId 對映、inline SVG 會徽
 */

export interface GuildDef {
  id: string;
  name: string;
  tagline: string;
  intro1: string;
  intro2: string;
  roleId: string | null;
  badge: string; // inline SVG
  accentColor: string;
  welcomePost: string;
  icebreakerPost: string;
}

export const GUILD_DEFS: GuildDef[] = [
  {
    id: 'pm',
    name: '產品經理公會',
    tagline: '把模糊的問題變成清晰的產品',
    intro1: '這裡是對 PM 職涯有興趣的同學聚集的地方。從第一份實習到正職第一年，大家在這裡交流面試心得、作品集準備方式與職場第一手觀察。',
    intro2: '不需要你已經是 PM，只要你認真想走這條路，就歡迎你。',
    roleId: 'product_manager',
    badge: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="48" height="48" rx="12" fill="#E8F1FF"/>
      <rect x="12" y="14" width="24" height="4" rx="2" fill="#0182FD"/>
      <rect x="12" y="22" width="16" height="3" rx="1.5" fill="#0182FD" opacity=".6"/>
      <rect x="12" y="29" width="20" height="3" rx="1.5" fill="#0182FD" opacity=".4"/>
      <circle cx="36" cy="30" r="6" fill="#0182FD"/>
      <path d="M33 30l2 2 4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>`,
    accentColor: '#0182FD',
    welcomePost: `歡迎來到產品經理公會。\n\n這個公會適合：準備 PM 實習面試、正在做 side project 想累積 PM 經驗、或是剛拿到第一份 PM offer 的你。\n\n版規三條：互相尊重，不在公開版面留個人聯絡方式，廣告或業配請舉報。`,
    icebreakerPost: `破冰話題：你是從哪一刻開始認真想當 PM 的？\n\n是用了某個 app 覺得「這裡可以更好」、還是在某次比賽或社團活動後突然有感覺？說說你的故事。`,
  },
  {
    id: 'ba',
    name: '商業分析師公會',
    tagline: '用數據說話，讓決策更有根據',
    intro1: '商業分析師是少數需要同時跟數字和人打交道的職位。這個公會聚集了想走 BA、資料分析、或諮詢路線的同學，一起交流技能準備與求職經驗。',
    intro2: 'Excel、SQL、簡報——哪個最讓你頭痛？來這裡討論。',
    roleId: 'business_analyst',
    badge: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="48" height="48" rx="12" fill="#EEF4FF"/>
      <rect x="13" y="30" width="5" height="8" rx="2" fill="#3B5FC0"/>
      <rect x="21" y="22" width="5" height="16" rx="2" fill="#3B5FC0" opacity=".7"/>
      <rect x="29" y="16" width="5" height="22" rx="2" fill="#3B5FC0" opacity=".5"/>
      <path d="M15 28 L23 20 L31 24" stroke="#3B5FC0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="31" cy="14" r="3" fill="#3B5FC0"/>
    </svg>`,
    accentColor: '#3B5FC0',
    welcomePost: `歡迎來到商業分析師公會。\n\n這裡是 BA、資料分析師、或想進顧問業的同學交流的地方。適合你的：BA 實習面試準備、Excel 與 SQL 學習心得、case study 討論，以及各類分析工具的比較。\n\n版規三條：互相尊重，不留個人聯絡方式，廣告請舉報。`,
    icebreakerPost: `破冰話題：你做過讓你印象最深的一份數據分析是什麼？\n\n可以是課堂報告、社團活動的成效分析，或只是你自己玩 Spotify 資料好玩。說說你學到什麼。`,
  },
  {
    id: 'marketing',
    name: '行銷企劃公會',
    tagline: '讓對的人在對的時間看到對的內容',
    intro1: '行銷的範圍很廣：社群、內容、活動、數位廣告、品牌策略。不管你想走哪個方向，這裡都有人聊。',
    intro2: '一起研究那些你覺得「這活動怎麼想到的」或「這文案太準了」的案例。',
    roleId: 'marketing',
    badge: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="48" height="48" rx="12" fill="#FFF0F0"/>
      <circle cx="24" cy="24" r="10" stroke="#E03E3E" strokeWidth="2"/>
      <circle cx="24" cy="24" r="5" fill="#E03E3E" opacity=".3"/>
      <path d="M24 14V10M34 24H38M24 34V38M14 24H10" stroke="#E03E3E" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="24" cy="24" r="2" fill="#E03E3E"/>
    </svg>`,
    accentColor: '#E03E3E',
    welcomePost: `歡迎來到行銷企劃公會。\n\n不管你想走社群、內容行銷、品牌策略，還是數位廣告，這裡都有人聊。適合交流的話題：行銷作品集怎麼做、實習面試的案例題準備、好的廣告活動拆解。\n\n版規三條：互相尊重，不留個人聯絡方式，廣告請舉報。`,
    icebreakerPost: `破冰話題：最近有沒有哪個品牌的行銷讓你印象很深，覺得「啊這招好」？\n\n說說你看到什麼，為什麼有感。`,
  },
  {
    id: 'hr',
    name: '人資公會',
    tagline: '讓對的人進對的門',
    intro1: '人力資源聽起來很廣，實際上細分很深：招募、訓練發展、薪酬福利、員工關係。這個公會是想走 HR 路的同學互相交流的地方。',
    intro2: '招募實習特別熱門——來這裡交流面試問的什麼、怎麼準備心理學或組織行為學的概念。',
    roleId: 'hr',
    badge: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="48" height="48" rx="12" fill="#F0FFF4"/>
      <circle cx="24" cy="18" r="6" stroke="#2F9E68" strokeWidth="2"/>
      <path d="M12 38c0-6.6 5.4-12 12-12s12 5.4 12 12" stroke="#2F9E68" strokeWidth="2" strokeLinecap="round"/>
      <path d="M32 22l2 2 4-4" stroke="#2F9E68" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>`,
    accentColor: '#2F9E68',
    welcomePost: `歡迎來到人資公會。\n\n想走 HR 的同學，這裡是你的地方。討論主題包含：招募實習的面試準備、組織行為學與心理學的概念怎麼用在 case、人才發展 vs 薪酬福利哪條路更適合你。\n\n版規三條：互相尊重，不留個人聯絡方式，廣告請舉報。`,
    icebreakerPost: `破冰話題：你為什麼想走人資？\n\n有些人是因為做過招募活動，有些人是因為覺得「選對人比什麼都重要」。說說你的原因。`,
  },
  {
    id: 'bd',
    name: '業務開發公會',
    tagline: '把陌生人變成合作夥伴',
    intro1: 'BD 是少數一進公司就需要獨立面對客戶的職位。這裡聚集了對業務開發、客戶成功、合作夥伴拓展感興趣的同學。',
    intro2: '怎麼開發第一個客戶？怎麼準備 BD 面試的角色扮演？來這裡問。',
    roleId: 'business_dev',
    badge: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="48" height="48" rx="12" fill="#FFF8EC"/>
      <circle cx="16" cy="24" r="5" stroke="#D97706" strokeWidth="2"/>
      <circle cx="32" cy="24" r="5" stroke="#D97706" strokeWidth="2"/>
      <path d="M21 24h6" stroke="#D97706" strokeWidth="2" strokeLinecap="round"/>
      <path d="M12 12l4 4M32 12l4 4M12 36l4-4M32 36l4-4" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>`,
    accentColor: '#D97706',
    welcomePost: `歡迎來到業務開發公會。\n\n BD 面試最常考的是：你有沒有主動開發過什麼、你遇到拒絕怎麼反應。這裡適合交流 BD 實習面試準備、cold outreach 的技巧、以及各產業 BD 工作的差異。\n\n版規三條：互相尊重，不留個人聯絡方式，廣告請舉報。`,
    icebreakerPost: `破冰話題：你有沒有主動去說服別人、談成某件事的經驗？\n\n可以是幫社團找贊助、說服教授讓你加選、或是任何靠溝通達成目標的事。`,
  },
  {
    id: 'consultant',
    name: '顧問公會',
    tagline: '短時間內看懂一個產業',
    intro1: '管顧面試的難度出了名，但準備方法也是出了名的系統化。這裡聚集了準備 MBB 與四大顧問實習的同學，一起做 case、交換情報。',
    intro2: '你一個人練 case 很痛苦，來這裡找練習夥伴、拆解解題框架。',
    roleId: 'consultant',
    badge: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="48" height="48" rx="12" fill="#F3F0FF"/>
      <path d="M24 12L36 18V30L24 36L12 30V18L24 12Z" stroke="#7C3AED" strokeWidth="2" fill="none"/>
      <path d="M24 18L30 21V27L24 30L18 27V21L24 18Z" fill="#7C3AED" opacity=".3"/>
      <circle cx="24" cy="24" r="3" fill="#7C3AED"/>
    </svg>`,
    accentColor: '#7C3AED',
    welcomePost: `歡迎來到顧問公會。\n\n管顧面試需要大量練習，一個人很難走遠。這裡適合：找 case 練習夥伴、分享哪間公司的 case 偏什麼風格、討論 fit interview 怎麼準備 story。\n\n版規三條：互相尊重，不留個人聯絡方式，廣告請舉報。`,
    icebreakerPost: `破冰話題：你第一次做 case interview 是什麼感覺？\n\n第一次通常都是災難，說說你當時卡在哪裡，現在有沒有找到應對方式。`,
  },
  {
    id: 'swe',
    name: '軟體工程師公會',
    tagline: '寫出能跑、能維護、能上線的程式',
    intro1: '這裡聚集了準備軟體工程師實習的同學。從 LeetCode 刷題策略到系統設計，從 GitHub 履歷整理到技術面試的溝通方式，都可以討論。',
    intro2: '刷題的瓶頸通常不是演算法，而是你不知道下一步該練哪個方向。來這裡問。',
    roleId: 'software_eng',
    badge: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="48" height="48" rx="12" fill="#ECFDF5"/>
      <path d="M18 20l-6 4 6 4" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M30 20l6 4-6 4" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M26 16l-4 16" stroke="#059669" strokeWidth="2" strokeLinecap="round"/>
    </svg>`,
    accentColor: '#059669',
    welcomePost: `歡迎來到軟體工程師公會。\n\n準備 SWE 實習的路上，刷題只是一部分。這裡也聊：GitHub 作品集怎麼整理、系統設計的概念怎麼入門、面試時怎麼把思路講清楚。\n\n版規三條：互相尊重，不留個人聯絡方式，廣告請舉報。`,
    icebreakerPost: `破冰話題：你做過讓你最有成就感的一個 side project 或課堂作業是什麼？\n\n說說你做了什麼、遇到什麼困難，以及它現在是否還活著。`,
  },
  {
    id: 'frontend',
    name: '前端工程師公會',
    tagline: '讓設計稿變成使用者真的能用的東西',
    intro1: '前端是視覺與邏輯的交叉口。這裡聚集了想走前端開發的同學：React、Vue、CSS 技巧、效能優化、設計師合作，都可以聊。',
    intro2: '作品集頁面是前端求職的門票，來這裡分享你的想法，聽聽別人怎麼做的。',
    roleId: null,
    badge: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="48" height="48" rx="12" fill="#EFF6FF"/>
      <rect x="10" y="14" width="28" height="20" rx="3" stroke="#2563EB" strokeWidth="2"/>
      <path d="M10 20h28" stroke="#2563EB" strokeWidth="1.5"/>
      <circle cx="15" cy="17" r="1.5" fill="#2563EB" opacity=".6"/>
      <circle cx="20" cy="17" r="1.5" fill="#2563EB" opacity=".4"/>
      <path d="M18 28l-3 3 3 3M26 28l3 3-3 3M22 26l-2 8" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>`,
    accentColor: '#2563EB',
    welcomePost: `歡迎來到前端工程師公會。\n\n前端求職的準備跟後端有點不一樣，作品集的視覺呈現跟程式碼品質同樣重要。這裡聊：React/Vue 的實際用法、CSS 的坑、如何跟設計師有效合作，以及前端面試的特殊題型。\n\n版規三條：互相尊重，不留個人聯絡方式，廣告請舉報。`,
    icebreakerPost: `破冰話題：你做的第一個「真的有上線、真的有人用」的網頁或 app 是什麼？\n\n哪怕只有兩個使用者，說說你當時的感受。`,
  },
  {
    id: 'webdesign',
    name: '網頁設計師公會',
    tagline: '讓每一個像素都有它存在的理由',
    intro1: '網頁設計師在台灣的職稱很混，有時候叫 UI 設計師，有時候叫視覺設計，有時候還需要切版。這裡聚集了想走視覺設計、UI 設計路線的同學。',
    intro2: 'Figma 檔、設計系統概念、與工程師的溝通方式——來這裡一起研究。',
    roleId: null,
    badge: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="48" height="48" rx="12" fill="#FDF4FF"/>
      <circle cx="19" cy="19" r="7" fill="#A855F7" opacity=".2" stroke="#A855F7" strokeWidth="2"/>
      <circle cx="29" cy="19" r="7" fill="#A855F7" opacity=".2"/>
      <circle cx="24" cy="28" r="7" fill="#A855F7" opacity=".2"/>
      <circle cx="24" cy="22" r="4" fill="#A855F7" opacity=".5"/>
    </svg>`,
    accentColor: '#A855F7',
    welcomePost: `歡迎來到網頁設計師公會。\n\n設計師求職的作品集講究的不只是漂亮，還要能說清楚你的設計決策。這裡聊：Figma 的進階用法、如何用設計系統讓工作更有效率、以及台灣設計師求職的實際狀況。\n\n版規三條：互相尊重，不留個人聯絡方式，廣告請舉報。`,
    icebreakerPost: `破冰話題：你做過讓你最驕傲的一個設計稿是什麼？\n\n說說你設計它的過程，以及如果現在重做，你會改哪裡。`,
  },
  {
    id: 'data',
    name: '數據分析師公會',
    tagline: '把雜訊去掉，讓數字說話',
    intro1: '數據分析師的需求在各產業都在增加，但技能要求差異很大。有些偏 SQL 與報表，有些需要 Python 與機器學習基礎。這裡幫你搞清楚你想走哪種。',
    intro2: '從 Google Analytics 到 dbt，從 Tableau 到 Python，怎麼選工具、怎麼學——一起討論。',
    roleId: 'data_analyst',
    badge: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="48" height="48" rx="12" fill="#F0FDF9"/>
      <path d="M12 24c0-6.6 5.4-12 12-12 3.3 0 6.3 1.4 8.5 3.5" stroke="#0D9488" strokeWidth="2" strokeLinecap="round"/>
      <path d="M36 24c0 6.6-5.4 12-12 12-3.3 0-6.3-1.4-8.5-3.5" stroke="#0D9488" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="24" cy="24" r="5" fill="#0D9488" opacity=".2" stroke="#0D9488" strokeWidth="2"/>
      <path d="M24 21v3l2 2" stroke="#0D9488" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>`,
    accentColor: '#0D9488',
    welcomePost: `歡迎來到數據分析師公會。\n\n數據職位的面試通常有技術測驗，SQL 是基本，Python 是加分。這裡適合聊：各公司數據面試的題型、工具怎麼選、分析作品集怎麼呈現，以及資料工程師和數據分析師有什麼差別。\n\n版規三條：互相尊重，不留個人聯絡方式，廣告請舉報。`,
    icebreakerPost: `破冰話題：你目前最熟的數據工具是什麼，你是怎麼學會的？\n\n說說你的學習路徑，以及你覺得這個工具最讓你頭痛的一件事。`,
  },
  {
    id: 'uxr',
    name: 'UX 研究員公會',
    tagline: '把使用者說不出口的需求找出來',
    intro1: 'UX Research 在台灣還算新興的職位，很多公司還在摸索怎麼用好研究員。這裡聚集了對 UX 研究、設計研究、消費者研究感興趣的同學。',
    intro2: '訪談技巧、研究報告怎麼寫、怎麼把洞察轉成設計建議——在這裡一起練。',
    roleId: 'ux_researcher',
    badge: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="48" height="48" rx="12" fill="#FFF7F0"/>
      <circle cx="22" cy="22" r="9" stroke="#EA580C" strokeWidth="2"/>
      <path d="M29 29l7 7" stroke="#EA580C" strokeWidth="2" strokeLinecap="round"/>
      <path d="M18 22h8M22 18v8" stroke="#EA580C" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>`,
    accentColor: '#EA580C',
    welcomePost: `歡迎來到 UX 研究員公會。\n\nUXR 的求職很特別，需要一份能展示研究流程的作品集，而不只是漂亮的截圖。這裡聊：訪談設計與分析的技巧、研究作品集怎麼說故事、以及如何在沒有公司案例的情況下建立研究經驗。\n\n版規三條：互相尊重，不留個人聯絡方式，廣告請舉報。`,
    icebreakerPost: `破冰話題：你做過讓你印象最深的一次使用者研究或訪談嗎？\n\n可以是課堂作業、個人 project，或只是幫朋友測試 app 的非正式訪談。說說你從中學到什麼。`,
  },
  {
    id: 'finance',
    name: '金融公會',
    tagline: '讓資本流向它應該去的地方',
    intro1: '金融產業的實習競爭激烈，但準備方向很清楚：技術題（財務建模、估值）加上市場理解（時事、產業研究）。這裡聚集了準備投行、AM、PE、金控等實習的同學。',
    intro2: '財報拆解、DCF 建模、市場觀察——在這裡找學習夥伴。',
    roleId: 'finance',
    badge: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="48" height="48" rx="12" fill="#F0F9FF"/>
      <path d="M24 12v4M24 32v4" stroke="#0369A1" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="24" cy="24" r="8" stroke="#0369A1" strokeWidth="2"/>
      <path d="M20 22c0-2.2 1.8-4 4-4s4 1.8 4 4" stroke="#0369A1" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M20 26c0 2.2 1.8 4 4 4" stroke="#0369A1" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>`,
    accentColor: '#0369A1',
    welcomePost: `歡迎來到金融公會。\n\n金融實習的準備需要技術與市場感並重。這裡聊：投行、AM、金控各類實習的準備差異、財務建模的入門路徑、市場時事的高效追蹤方式，以及面試中常被問到的「你最近在觀察哪個產業？」要怎麼回答。\n\n版規三條：互相尊重，不留個人聯絡方式，廣告請舉報。`,
    icebreakerPost: `破冰話題：你目前最感興趣的一個產業或公司是什麼，你為什麼開始關注它？\n\n不用太嚴肅，說說你的觀察就好。`,
  },
  {
    id: 'content',
    name: '內容創作者公會',
    tagline: '讓一篇文章、一支影片改變某個人的一天',
    intro1: '內容創作這個職涯路徑很新，但需求正在快速增長。這裡聚集了想走內容策略、內容行銷、影片製作、文案創作的同學。',
    intro2: '作品集、頻道、個人品牌——怎麼在求職前就讓人認識你的創作風格。',
    roleId: null,
    badge: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="48" height="48" rx="12" fill="#FFF0F3"/>
      <path d="M16 32l4-12 4 8 4-8 4 12" stroke="#BE185D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10 36h28" stroke="#BE185D" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="24" cy="16" r="4" stroke="#BE185D" strokeWidth="1.5"/>
    </svg>`,
    accentColor: '#BE185D',
    welcomePost: `歡迎來到內容創作者公會。\n\n內容職涯的求職有個特別的地方：你的作品就是你的履歷。這裡聊：如何建立個人作品集、內容策略的概念、平台演算法的現況觀察，以及如何把個人創作轉化成職涯資本。\n\n版規三條：互相尊重，不留個人聯絡方式，廣告請舉報。`,
    icebreakerPost: `破冰話題：你做過讓你印象最深的一篇文章、一支影片，或一則貼文是什麼？\n\n可以是你自己創作的，也可以是你看到覺得「這個太好了」的別人的作品。說說為什麼。`,
  },
  {
    id: 'pjm',
    name: '專案管理公會',
    tagline: '讓混亂的事情按時、按預算、按品質完成',
    intro1: '專案管理的能力在所有產業都有需求，但 PM（這裡指 Project Manager）實習機會相對少見，進入門檻卻不低。這裡聚集了對專案管理職涯或 PMP 認證有興趣的同學。',
    intro2: '敏捷、瀑布、Scrum——這些不只是術語，而是你需要能說清楚的工作方式。',
    roleId: null,
    badge: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="48" height="48" rx="12" fill="#F0FFF0"/>
      <rect x="12" y="14" width="6" height="4" rx="1" fill="#16A34A" opacity=".7"/>
      <rect x="21" y="14" width="6" height="4" rx="1" fill="#16A34A" opacity=".5"/>
      <rect x="30" y="14" width="6" height="4" rx="1" fill="#16A34A" opacity=".3"/>
      <rect x="12" y="22" width="6" height="4" rx="1" fill="#16A34A" opacity=".7"/>
      <rect x="21" y="22" width="6" height="4" rx="1" fill="#16A34A" opacity=".5"/>
      <rect x="12" y="30" width="6" height="4" rx="1" fill="#16A34A" opacity=".7"/>
      <rect x="21" y="30" width="6" height="4" rx="1" fill="#16A34A"/>
      <rect x="30" y="30" width="6" height="4" rx="1" fill="#16A34A" opacity=".3"/>
    </svg>`,
    accentColor: '#16A34A',
    welcomePost: `歡迎來到專案管理公會。\n\n專案管理的求職相對特別：很多公司不會直接招「PM 實習生」，但幾乎每個工作都需要專案管理的能力。這裡聊：怎麼在實習或社團中積累 PM 經驗、敏捷方法的實際運用、以及 PMP 認證值不值得在學生時期考。\n\n版規三條：互相尊重，不留個人聯絡方式，廣告請舉報。`,
    icebreakerPost: `破冰話題：你有沒有帶領或參與過一個從頭到尾你覺得「管得很好」的專案？\n\n說說那個專案是怎麼組織的，你在其中做了什麼讓它順利進行。`,
  },
  {
    id: 'startup',
    name: '新創冒險家公會',
    tagline: '在混沌中找到方向，從零打造一個東西',
    intro1: '新創公司的實習跟大公司很不一樣：責任大、資源少、學習快。這個公會聚集了對新創環境感興趣、想了解創業生態，或是自己在做 side project 的同學。',
    intro2: '新創求職的策略跟大企業完全不同，來這裡交流怎麼找到對的機會。',
    roleId: null,
    badge: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="48" height="48" rx="12" fill="#FFFAEC"/>
      <path d="M24 10L28 20H38L30 26L33 36L24 30L15 36L18 26L10 20H20L24 10Z" stroke="#CA8A04" strokeWidth="2" fill="none" strokeLinejoin="round"/>
      <path d="M24 20v6" stroke="#CA8A04" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>`,
    accentColor: '#CA8A04',
    welcomePost: `歡迎來到新創冒險家公會。\n\n想進新創、或是自己在做東西的同學，這裡是你的地方。討論主題：新創 vs 大公司實習的差異比較、如何找到早期新創的機會、自己的 side project 遇到的問題，以及台灣的創業生態觀察。\n\n版規三條：互相尊重，不留個人聯絡方式，廣告請舉報。`,
    icebreakerPost: `破冰話題：你有沒有認真想過要做某個 side project 或創業想法，但最後沒做（或正在做）的是什麼？\n\n說說你的想法和你當時的考量。`,
  },
  {
    id: 'explorer',
    name: '還在探索公會',
    tagline: '還不知道想做什麼，也沒關係',
    intro1: '大學裡很多人其實不知道自己想做什麼，但又不敢說出來。這個公會就是給那些「還在想」的人的安全空間。',
    intro2: '在這裡你可以問「我適合什麼工作」、分享你的探索過程，不需要假裝你已經有答案。',
    roleId: null,
    badge: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="48" height="48" rx="12" fill="#F8F0FF"/>
      <circle cx="24" cy="24" r="10" stroke="#8B5CF6" strokeWidth="2"/>
      <path d="M20 20c0-2.2 1.8-4 4-4 1.8 0 3.3.9 3.8 2.3.7 2-1.8 3.5-3.8 3.7v2" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="24" cy="31" r="1.5" fill="#8B5CF6"/>
    </svg>`,
    accentColor: '#8B5CF6',
    welcomePost: `歡迎來到還在探索公會。\n\n不知道自己想做什麼，這不是缺點，是正在認真面對職涯的表現。這裡沒有人會告訴你「你應該知道了」。你可以分享你正在嘗試的事情、對不同工作的好奇、或是你的困惑。\n\n版規三條：互相尊重，不留個人聯絡方式，廣告請舉報。`,
    icebreakerPost: `破冰話題：你最近有沒有做過或接觸過什麼事，讓你覺得「這個感覺還不錯」？\n\n不需要跟工作有關，任何事都可以。說說那是什麼，以及你為什麼有感覺。`,
  },
];

export function getGuildById(id: string): GuildDef | undefined {
  return GUILD_DEFS.find((g) => g.id === id);
}

export function getGuildsByRoleId(roleId: string): GuildDef[] {
  return GUILD_DEFS.filter((g) => g.roleId === roleId);
}
