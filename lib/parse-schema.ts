import { z } from 'zod';

export const FieldConfidenceSchema = z.object({
  company: z.enum(['h', 'm', 'l']),
  title: z.enum(['h', 'm', 'l']),
  deadline: z.enum(['h', 'm', 'l']),
});

export const ParsedJobSchema = z.object({
  company: z.string().nullable(),
  title: z.string().nullable(),
  location: z.string().nullable(),
  salaryText: z.string().nullable(),
  deadline: z.string().nullable(), // YYYY-MM-DD or null
  weeklyDaysText: z.string().nullable(),
  gradeRequirement: z.string().nullable(),
  skillsRequired: z.array(z.string()),
  skillsNice: z.array(z.string()),
  industryGuess: z
    .enum(['科技', '金融', '顧問', '快消', '電商', '新創', '教育', '媒體', '醫療', '傳產', '非營利', '其他'])
    .nullable(),
  sourceGuess: z
    .enum(['104', 'cakeresume', 'yourator', 'linkedin', 'company_site', 'other'])
    .nullable(),
  fieldConfidence: FieldConfidenceSchema,
});

export type ParsedJob = z.infer<typeof ParsedJobSchema>;

export const ParseRequestSchema = z.object({
  text: z.string().min(30, '職缺內容太短，請貼完整一點').max(15000, '內容超過 15,000 字上限'),
});
