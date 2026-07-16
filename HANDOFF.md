# 職涯闖關島完整交接報告

更新日期：2026-07-17

## 1. 一分鐘掌握現況

- 正式站：`https://quest.lazybearlife.com`
- GitHub：`Jean-yzj/internx-career-quest`
- 技術棧：Next.js 15、React 19、TypeScript、OpenAI、Zod、PostgreSQL
- 產品主流程：快速分流或測驗方向 -> 職位圖鑑 -> 履歷分析 -> 每日闖關與 7 天計畫 -> 投遞戰情室 -> 公會與排行榜
- 目前有 10 個職位圖鑑、16 個職涯公會。
- 個人求職內容以瀏覽器 localStorage 為主；公會、公開 Profile 摘要、職缺雷達與 Google 綁定資料使用 PostgreSQL。
- Google 登入是可選功能；未設定環境變數時，登入入口會自動隱藏，不影響本機功能。
- 本次版本新增 7 天計畫、戰情室週報、履歷與職缺準備吻合度、分享 PNG、職位 FAQ/OG 圖及手機導覽修正。
- 本次版本沒有新增資料庫表，也沒有新增匿名追蹤，避免未經批准突破既有後端與隱私邊界。

## 2. 先讀文件

1. Repo 內規則：`AGENTS.md`、`CLAUDE.md`
2. 產品規格：`~/Desktop/實習通/職涯闖關島/07-闖關島獨立站v1.md`
3. 舊版完整交接：`~/Desktop/實習通/職涯闖關島/10-交接給下一個AI.md`
4. 全域網站標準：`~/.claude/standards/README.md`
5. 專案記憶：`~/.claude/projects/-Users-jean/memory/project_internx_career_quest.md`
6. PostgreSQL 備份說明：`~/dev-backups/db/README.md`

## 3. 功能盤點

### 3.1 入口與探索

- `/`：產品首頁與進站入口。
- `/quick-start`：依「探索方向、強化履歷、開始投遞」快速分流。
- `/onboarding`：建立角色、年級、經歷與目標職位。
- `/quiz/interest`：RIASEC 興趣測驗，產出 Holland Code 與推薦職位。
- `/report`：興趣探索報告、三個推薦方向、職缺數與公會入口。
- `/quiz/ability`：10 題職位能力自評，產出準備階段與優先補強面向。

### 3.2 職位與內容入口

- `/roles`：10 個職位圖鑑列表。
- `/roles/[id]`：工作內容、能力權重、入行路徑、準備清單、作品證據、公會、即時實習與 FAQ。
- 每個職位頁都有獨立 canonical、FAQPage JSON-LD 與 1200x630 動態 Open Graph PNG。
- 角色頁主 CTA 是「建立我的 7 天計畫」，次 CTA 是能力測驗。

### 3.3 履歷與任務

- `/analysis`：履歷文字即時送 OpenAI 分析；伺服器不持久化履歷原文。
- 分析完成會寫入 `quest.v1`，並即時重建關卡線、插入需要的特訓任務。
- `/island`：依年級、履歷、社團、投遞與目標職位產生個人關卡線。
- 關卡有點數、等級、連續天數、徽章、階段資源與公會入口。
- `/plan`：依目標職位、最近履歷缺口與作品建議產生 7 個可執行任務；完成狀態存在 `action-plan.v1`。
- `/plan/task/[day]`：7 個任務都有專屬工作台，涵蓋職位觀察、STAR 經歷、能力證據、小作品規劃、履歷句子、三職缺比較與週回顧；草稿即時存在 `action-plan-work.v1`，不是只連到泛用頁面。

### 3.4 投遞戰情室

- `/war-room`：貼上職缺 AI 解析、手動建立、實習雷達匯入、日曆與清單檢視。
- 支援截止日、面試、Offer 期限、狀態、星等、技能、履歷備註、JSON 備份與 ICS 匯出。
- 戰情室操作會即時同步闖關點數，狀態更新會持久化到 `warroom.v1`。
- 新增「本週投遞回顧」：最近 7 天新增、投遞、面試、回覆率與下一步行動。
- 新增每週日 19:00 的 recurring ICS 回顧提醒。
- 編輯職缺時會用最近一次目標職位履歷分析，顯示準備吻合度、已有證據、缺口與三個動作。
- 吻合度是職位層級的確定性估算，不會讀取或上傳履歷原文，也不是公司錄取機率。

### 3.5 公會、Profile 與登入

- `/guilds`、`/guilds/[id]`：16 個公會、加入、貼文、回覆、檢舉與管理隱藏。
- `/profile`：本機角色資料、引繼碼、公開點數摘要、Google 登入。
- Google 登入使用 OAuth 2.0 authorization code flow、HMAC state、HttpOnly session cookie。
- 已綁定 Google 的使用者可跨裝置找回 canonical `device_id` 對應的 Profile。
- 登入目前只同步 Profile 與點數摘要；履歷分析、戰情室卡片與 7 天計畫仍只在原瀏覽器，不會因登入跨裝置同步。

### 3.6 分享、SEO 與 PWA

- 測驗與履歷分析結果可用 Web Share、複製文字或下載 1200x630 PNG。
- `robots.txt`、`sitemap.xml`、canonical、Open Graph 與 PWA manifest 已存在。
- 手機主導覽改為可橫向捲動的第二列，390px viewport 已確認沒有頁面級水平溢位。

## 4. 本次新增與修改

- `app/plan/`、`lib/action-plan.ts`、`components/PlanStarter.tsx`：持久化 7 天行動計畫。
- `lib/weekly-review.ts`、`components/WeeklyReview.tsx`、`lib/ics.ts`：週報與每週提醒。
- `lib/resume-match.ts`、`components/ResumeMatchPanel.tsx`、`components/EditDrawer.tsx`：職缺卡內的履歷準備吻合度。
- `components/ShareCard.tsx`：Canvas 產生 1200x630 PNG。
- `app/roles/[id]/opengraph-image.tsx`：每個職位的動態 OG 圖。
- `app/roles/[id]/page.tsx`：FAQ、FAQPage JSON-LD、7 天計畫主 CTA。
- `components/SiteNav.tsx`、`app/globals.css`：新增計畫入口與手機導覽修正。
- `app/privacy/page.tsx`：正式網址、實際本地/伺服器資料邊界與 7 天計畫說明。

## 5. 資料邊界

| 資料 | 儲存位置 | 說明 |
| --- | --- | --- |
| `quest.v1` | localStorage | 測驗、分析結果、關卡、點數、徽章、連續天數 |
| `profile.v1` | localStorage | 角色、年級、經歷、目標職位、device ID、引繼碼 |
| `warroom.v1` | localStorage | 所有投遞卡、JD、面試、截止日與備註 |
| `action-plan.v1` | localStorage | 7 天計畫與完成狀態 |
| `action-plan-work.v1` | localStorage | 7 天任務工作台草稿與產出物 |
| `guild.deviceId` | localStorage | 未建立 Profile 前的匿名裝置 ID |
| `profiles` | PostgreSQL | 公開 Profile 摘要、點數、引繼碼、Google ID、Email |
| `guild_members/posts/reports` | PostgreSQL | 公會加入、貼文、回覆與檢舉 |
| `jobs` | PostgreSQL | 實習雷達快取 |

不可把履歷原文、完整職缺文字、戰情室卡或 7 天計畫直接寫入 PostgreSQL，除非先更新產品規格、隱私政策與遷移方案。

## 6. 重要環境變數

既有必要變數：

- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `DATABASE_URL`
- `ADMIN_KEY`

Google 登入全部存在才啟用：

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `SESSION_SECRET`
- `GOOGLE_REDIRECT_URI`，正式站建議固定為 `https://quest.lazybearlife.com/api/auth/google/callback`

不要把任何值寫進 Git。正式站在 Zeabur/Cloudflare 代理後方，登入跳轉必須使用 `resolvePublicOrigin()`，不能直接信任容器內的 `req.nextUrl.origin`。

## 7. 驗證證據

本次 release candidate 已通過：

- `npx tsc --noEmit`：PASS
- `npm run build`：PASS，46 個頁面成功產出
- `node scripts/verify.mjs`：8 PASS / 0 FAIL
- `node scripts/verify-questline.mjs`：33 PASS / 0 FAIL
- `node scripts/verify-resources.mjs`：12 PASS / 0 FAIL
- Playwright/Chrome：角色頁建立計畫 -> `/plan` -> 完成任務 -> reload，狀態保留
- Playwright/Chrome：7 個任務工作台逐頁可達；Day 1 草稿重整保留、Day 5 產出履歷句子、Day 6 從職缺 API 加入三筆比較並完成
- 390x844：計畫、角色頁、戰情室 drawer 均無頁面級水平溢位
- 戰情室：未來 30 天的面試不會被誤算成本週面試
- 履歷配對：測試資料顯示 72% 與三項優先行動
- 分享 PNG：`data:image/png`、1200x630、約 82KB
- 職位 OG endpoint：HTTP 200、`image/png`、1200x630

`npm audit --omit=dev` 目前回報 2 個 moderate，來源是 Next 內含的 PostCSS `<8.5.10`。npm 提供的自動修正會錯誤降級到 Next 9.3.3，禁止執行 `npm audit fix --force`；應等 Next 官方相容更新後正常升版並重跑 build。

## 8. 部署與回滾

Zeabur：

- Project ID：`69c8c6d4a972bb88a7635060`
- App Service ID：`6a4b51c97e05aa801c1a5646`
- PostgreSQL：`postgresql-unbed`
- 模式：直傳部署，只有已 commit 檔案會上傳

部署指令必須在 `/tmp` 工作樹執行：

```bash
npx zeabur@latest deploy \
  --project-id 69c8c6d4a972bb88a7635060 \
  --service-id 6a4b51c97e05aa801c1a5646 \
  --json
```

部署前：

1. 確認 Git 工作樹乾淨、目標 commit 已在 `main`。
2. 先看 `~/dev-backups/db/state/history.tsv`，若會觸發 Profile schema migration，先取得 `internx-career-quest` 新鮮備份。
3. 在 `/tmp` 執行 `npm install`、測試與 `npm run build`。

部署後：

1. `GET /api/health`
2. 檢查 `/`、`/quick-start`、`/roles/product_manager`、`/plan`、`/war-room`、`/profile`
3. 檢查 `/roles/product_manager/opengraph-image`
4. 檢查公會 feed 與排行榜，避免 DB lazy init 退化
5. 若 Google 環境變數已設，實際走一次登入、callback、登出與跨裝置找回

回滾時不要動資料庫。把上一個已知正常 commit 重新直傳即可；localStorage schema 與本次 `action-plan.v1` 是新增且向後相容。

## 9. 已知風險與待辦

### P0

1. `lib/ability-quiz.ts` 只有 PM 題目已依規格，其餘 9 職位仍標註「草稿，待人資校準」。
2. `lib/roles.ts` 的職位能力權重與 checklist 也需要人資逐職位校準。
3. Google 登入要做正式環境端到端測試；目前本機無法完整模擬 Google callback。
4. Google ID token 目前由可信 token endpoint 取得後直接解 payload；建議下一輪補官方 JWKS/issuer/audience/expiry 驗證與 nonce 驗證。
5. PostgreSQL 備份排程常被大型 `couponshare` 卡住；部署任何會觸發 schema migration 的版本前，應手動確認本產品的最新成功備份。

### P1

1. 建立漏斗量測：quick start -> 測驗 -> 計畫 -> 履歷分析 -> 第一張投遞卡 -> 回訪。這需要先批准新的後端資料邊界、保存期限與隱私文字；不要直接新增 analytics table。
2. 讓 7 天計畫可選開始日、重建週次、保留歷史週與匯出提醒。
3. 讓職缺吻合度加入 JD 技能語意映射；現在分數主要是目標職位能力證據，不是逐家公司模型。
4. 補 Google 登入後的明確同步清單，避免使用者誤以為戰情室與履歷分析已跨裝置同步。
5. 依 Search Console 資料補職位長尾內容與內部連結，優先擴寫有實際曝光的職位頁。

### P2

1. 分享圖片加入職位顏色、能力圖與 QR code，但不要把個人履歷內容畫進圖片。
2. 加入可選的 PWA 每週提醒；需先處理通知授權與退訂 UX。
3. 建立管理端漏斗報表與內容成效看板，前提仍是 P1 的資料治理決策完成。

## 10. 接手禁區

- 不要在 Desktop/iCloud 目錄跑 build；一律複製或 worktree 到 `/tmp`。
- 不要把舊 `/prep` 頁重新做一份；準備內容已併入 `/roles/[id]`。
- 不要刪除或覆寫 `app/api/guild/join/route.ts`。
- 不要把 canonical 改回 Zeabur 生成網域。
- 不要新增 runtime 依賴，除非現有框架與標準庫確實無法完成。
- 不要用 `npm audit fix --force`。
- 不要未備份就碰 PostgreSQL schema，也不要把個人求職原文上傳到資料庫。
