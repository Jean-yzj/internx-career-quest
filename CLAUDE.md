# internx-career-quest

職涯闖關島：測驗方向 → 分析履歷 → 每日任務 → 投遞戰情室 → 16 職涯公會。規格在 `~/Desktop/實習通/職涯闖關島/07-闖關島獨立站v1.md`（00–05 為 v2 主站整合藍圖）。

## Zeabur Deployment
- Project ID: 69c8c6d4a972bb88a7635060（InternX 專案）
- Service ID: 6a4b51c97e05aa801c1a5646
- 部署：直傳 `npx zeabur@latest deploy --project-id 69c8c6d4a972bb88a7635060 --service-id 6a4b51c97e05aa801c1a5646 --json`（直傳只上傳已 commit 內容）
- Env：OPENAI_API_KEY、OPENAI_MODEL、DATABASE_URL（公會 PG：postgresql-unbed，同專案內網）、ADMIN_KEY（公會管理 API）
- 建置一律在 /tmp（Desktop 是 iCloud 目錄）

## 架構鐵則
- 個人資料（進度/點數/戰情室卡）只存瀏覽器 localStorage（quest.v1 / warroom.v1）；伺服器不儲存使用者輸入的履歷與職缺文字
- 唯一共享後端＝公會（PostgreSQL：guild_members / guild_posts / guild_reports；lazy init＋種子冪等）
- runtime 依賴：next react react-dom openai zod pg——不再加
- 介面繁中、無 emoji、icon inline SVG；截止日解析寧缺勿錯
- 公會管理：`POST /api/guild/admin` header `x-admin-key`（值見 Zeabur 環境變數）

## 待辦（接手者注意）
- 9 職位能力題庫與 roles checklist 為草稿（lib/ability-quiz.ts、lib/roles.ts 檔頭有標註），待人資校準
- postgresql-unbed 尚未加入 ~/dev-backups/db 的每日備份排程
