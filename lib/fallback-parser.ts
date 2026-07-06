import type { ParsedJob } from './parse-schema';
import type { Industry } from './types';

// Detect current year context for date normalization
function normalizeYear(month: number, day: number): number {
  const now = new Date();
  const currentYear = now.getFullYear();
  const candidate = new Date(currentYear, month - 1, day);
  // If the date has already passed more than 60 days ago, use next year
  if (candidate.getTime() < now.getTime() - 60 * 24 * 60 * 60 * 1000) {
    return currentYear + 1;
  }
  return currentYear;
}

function padTwo(n: number): string {
  return String(n).padStart(2, '0');
}

export function fallbackParse(text: string): ParsedJob {
  const deadlinePatterns = [
    // Near deadline/cutoff keywords; separators tolerate spaces and 年/月/日 forms
    /(?:截止|收件|deadline|apply\s*by|申請截止|報名截止|投遞截止)[^\d]{0,10}(\d{4})\s*[./年-]\s*(\d{1,2})\s*[./月-]\s*(\d{1,2})\s*日?/i,
    /(\d{4})\s*[./年-]\s*(\d{1,2})\s*[./月-]\s*(\d{1,2})\s*日?[^\d]{0,15}(?:截止|收件|deadline)/i,
    /(?:截止|收件|deadline)[^\d]{0,10}(\d{1,2})\s*月\s*(\d{1,2})\s*日/,
    /(\d{1,2})\s*月\s*(\d{1,2})\s*日[^\d]{0,15}(?:截止|收件|deadline)/,
    // Standalone full dates as last resort
    /(\d{4})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日/,
    /(\d{4})[./](\d{1,2})[./](\d{1,2})/,
  ];

  let deadline: string | null = null;

  for (const pat of deadlinePatterns) {
    const m = text.match(pat);
    if (m) {
      let year: number, month: number, day: number;
      if (m.length >= 4 && m[1] && m[2] && m[3]) {
        year = parseInt(m[1]);
        month = parseInt(m[2]);
        day = parseInt(m[3]);
        if (year < 100) year += 2000;
        if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
          deadline = `${year}-${padTwo(month)}-${padTwo(day)}`;
          break;
        }
      } else if (m.length >= 3 && m[1] && m[2]) {
        month = parseInt(m[1]);
        day = parseInt(m[2]);
        if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
          year = normalizeYear(month, day);
          deadline = `${year}-${padTwo(month)}-${padTwo(day)}`;
          break;
        }
      }
    }
  }

  // Salary
  const salaryMatch = text.match(
    /(?:月薪|時薪|薪資|salary)[^\d]{0,5}(NT\$\s*[\d,]+(?:\s*[~–-]\s*[\d,]+)?|[\d,]+(?:\s*[~–-]\s*[\d,]+)?\s*[kK]?)/i
  ) || text.match(/(NT\$\s*[\d,]+|月薪[\d,]+|[\d,]+\s*元\/月)/);
  const salaryText = salaryMatch ? salaryMatch[0].trim() : null;

  // Source guess
  let sourceGuess: ParsedJob['sourceGuess'] = 'other';
  if (/104\.com\.tw/i.test(text)) sourceGuess = '104';
  else if (/cakeresume/i.test(text)) sourceGuess = 'cakeresume';
  else if (/yourator/i.test(text)) sourceGuess = 'yourator';
  else if (/linkedin/i.test(text)) sourceGuess = 'linkedin';

  // Company: line containing company-type keywords
  const companyMatch = text.match(
    /^[^\n]{2,30}(?:股份有限公司|有限公司|Inc\.|Ltd\.|Corp\.|Co\.|集團|控股|Holdings)/m
  );
  // Also try: 【CompanyName ...】 — extract CJK/letter chars right after 【, stopping at space
  const bracketCompanyRaw = !companyMatch ? (text.match(/【(\S+)/) || null) : null;
  // Strip trailing year/season suffixes and brackets
  const bracketCompany = bracketCompanyRaw
    ? bracketCompanyRaw[1].replace(/[\s　]*202\d.*$/, '').replace(/】.*$/, '').trim()
    : null;
  let company: string | null = companyMatch
    ? companyMatch[0].trim()
    : bracketCompany && bracketCompany.length >= 2
    ? bracketCompany
    : null;

  // Title: first short non-company line (heuristic)
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const titleKeywords =
    /(實習|工程師|設計師|分析師|主任|專員|助理|intern|engineer|analyst|designer)/i;
  let title: string | null = null;
  for (const line of lines.slice(0, 5)) {
    if (
      line.length > 2 &&
      line.length < 60 &&
      !/(股份有限公司|有限公司|Inc\.|Ltd\.|Co\.|104|cakeresume|yourator|linkedin)/i.test(line) &&
      !/^https?:/.test(line)
    ) {
      if (!company && /(實習|工程師|設計師|分析師|主任|專員|助理|intern|engineer|analyst|designer)/i.test(line)) {
        title = line;
        break;
      } else if (/(實習|工程師|設計師|分析師|主任|專員|助理|intern|engineer|analyst|designer)/i.test(line)) {
        title = line;
        break;
      }
    }
  }

  // 【活動名】職稱 pattern: prefer the part after 】 if it still looks like a title
  if (title && title.includes('】')) {
    const after = title.split('】').pop()!.trim();
    if (after.length >= 2 && titleKeywords.test(after)) title = after;
  }

  // 無換行的單行貼文（IG 常見）：按標點分段再找一次職稱
  if (!title) {
    const segments = text.split(/[，。,;；\n]/).map((s) => s.trim());
    for (const seg of segments.slice(0, 8)) {
      if (seg.length < 3 || seg.length > 40) continue;
      if (/(股份有限公司|有限公司|Inc\.|Ltd\.)/i.test(seg)) continue;
      const candidate = seg.includes('】') ? seg.split('】').pop()!.trim() : seg;
      if (candidate.length >= 3 && titleKeywords.test(candidate)) {
        title = candidate;
        break;
      }
    }
  }

  // If still no company, try first 1-2 lines
  if (!company && lines.length > 0) {
    const candidate = lines[0];
    if (candidate.length < 40) company = candidate;
  }

  // Industry guess
  let industryGuess: Industry | null = null;
  const industryMap: [Industry, RegExp][] = [
    ['科技', /科技|軟體|資訊|半導體|IC設計|晶圓|台積電|電子|tech|software|semiconductor/i],
    ['金融', /金融|銀行|保險|投資|證券|資產管理|finance|banking|insurance/i],
    ['顧問', /顧問|consulting|麥肯錫|BCG|Bain|德勤|安永|資誠/i],
    ['快消', /快消|FMCG|消費品|食品|飲料|日用品/i],
    ['電商', /電商|電子商務|購物|商城|marketplace/i],
    ['新創', /新創|startup|早期/i],
    ['教育', /教育|學習|補習|培訓|edutech/i],
    ['媒體', /媒體|廣告|行銷|公關|內容|媒體/i],
    ['醫療', /醫療|醫院|生技|製藥|health|biotech|pharma/i],
  ];
  for (const [ind, re] of industryMap) {
    if (re.test(text)) {
      industryGuess = ind;
      break;
    }
  }

  return {
    company,
    title,
    location: null,
    salaryText,
    deadline,
    weeklyDaysText: null,
    gradeRequirement: null,
    skillsRequired: [],
    skillsNice: [],
    industryGuess,
    sourceGuess,
    fieldConfidence: {
      company: 'l',
      title: 'l',
      deadline: deadline ? 'l' : 'l',
    },
  };
}
