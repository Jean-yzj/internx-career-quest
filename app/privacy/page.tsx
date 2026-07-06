import type { Metadata } from 'next';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: '隱私權政策 | 職涯闖關島',
  robots: { index: false },
};

export default function PrivacyPage() {
  return (
    <div className="site-wrapper">
      <header className="site-header">
        <div className="site-header-inner">
          <a href="/" className="site-logo">職涯闖關島</a>
        </div>
      </header>

      <main className="static-page">
        <h1>隱私權政策</h1>
        <p className="page-meta">生效日期：2026-07-06｜版本：1.0</p>

        <p>InternX 投遞戰情室（網址：https://internx-war-room.zeabur.app）由職途有限公司（下稱「我們」）經營。我們重視你的個人資料，本政策說明我們如何處理你的資訊，以及你擁有的權利。本政策依中華民國《個人資料保護法》第 8 條規定撰寫，用字盡量白話。</p>

        <h2>1. 我們蒐集哪些資料</h2>

        <p><strong>本服務不蒐集帳號資料。</strong>本站不提供帳號登入功能，你在本站的所有申請記錄均儲存在你自己的瀏覽器（localStorage），不上傳至我們的伺服器。</p>

        <p><strong>AI 解析請求：</strong>當你使用「貼上辨識」功能時，你貼上的職缺文字會透過加密連線傳送至我們的伺服器，即時交由 AI（OpenAI GPT 模型）解析後立即丟棄，不寫入任何記錄檔或資料庫。我們僅在系統日誌中記錄請求長度、耗時、解析引擎及成功與否等數字指標，不記錄文字內容。</p>

        <p><strong>基本連線紀錄：</strong>伺服器自動記錄 IP 位址、請求路徑、HTTP 狀態碼與時間戳，用於系統安全與防濫用。這是網路服務的必要行為，無法關閉。</p>

        <h2>2. 我們為什麼蒐集（蒐集目的）</h2>
        <ul>
          <li>提供 AI 職缺辨識服務（法定特定目的：契約履行）</li>
          <li>維護系統安全、偵測並防止濫用（速率限制）</li>
          <li>服務品質監測（僅數字指標，無文字內容）</li>
        </ul>

        <h2>3. 個資的利用期間、地區、對象與方式</h2>
        <ul>
          <li><strong>期間：</strong>請求生命週期內（解析完畢即丟棄）；IP 連線日誌依伺服器設定約 30 天後滾動刪除。</li>
          <li><strong>地區：</strong>本服務架設於 Zeabur 新加坡節點，AI 解析透過 OpenAI API 傳至美國。你的申請記錄資料存在你的裝置，不跨境傳輸。</li>
          <li><strong>對象：</strong>我們，以及提供 AI 解析的 OpenAI（僅解析請求的即時處理）。我們不出售個人資料。</li>
          <li><strong>方式：</strong>電腦系統自動化處理；司法或主管機關依法要求時，我們可能依法提供。</li>
        </ul>

        <h2>4. 第三方服務</h2>
        <ul>
          <li><strong>OpenAI：</strong>AI 職缺辨識的底層模型提供者。職缺文字在解析時傳送至 OpenAI API，適用其隱私政策（platform.openai.com/privacy）。若你選擇「基本規則解析」路徑，文字不傳送至 OpenAI。</li>
          <li><strong>Zeabur：</strong>伺服器代管服務，提供基礎設施（新加坡節點）。</li>
        </ul>

        <h2>4a. 個人檔案與排行榜功能</h2>
        <p><strong>個人檔案功能須使用後端資料庫：</strong>當你完成闖關啟程（onboarding）時，以下資訊會儲存至我們的伺服器（PostgreSQL 資料庫）：</p>
        <ul>
          <li><strong>暱稱與頭像：</strong>你在設定個人檔案時自訂的暱稱（2–12 字）與頭像編號。</li>
          <li><strong>年級與目標職位：</strong>你填寫的年級與目標職位，用於推薦關卡路線。</li>
          <li><strong>點數摘要：</strong>累積點數（totalPoints）、等級（level）、連續天數（streak）與徽章數，用於排行榜顯示。點數明細存在你的裝置，不上傳至伺服器。</li>
          <li><strong>裝置識別碼：</strong>瀏覽器產生的隨機 ID（deviceId），僅用於識別你的操作裝置，不對應真實身分。</li>
        </ul>
        <p><strong>排行榜公開顯示：</strong>你的暱稱、頭像、等級與點數對所有使用者公開顯示於排行榜頁面（/profile）。</p>
        <p><strong>刪除請求：</strong>若你希望刪除個人檔案與排行榜資料，請寄信至 <a href="mailto:internx.me@gmail.com">internx.me@gmail.com</a>，說明你的暱稱及請求內容，我們將於合理期間內處理。</p>

        <h2>4b. 公會功能的資料處理</h2>
        <p><strong>公會功能須使用後端資料庫：</strong>當你使用公會功能時，以下資訊會儲存至我們的伺服器（PostgreSQL 資料庫）：</p>
        <ul>
          <li><strong>暱稱：</strong>你在設定公會身分時自訂的暱稱（2–12 字）。</li>
          <li><strong>貼文內容：</strong>你在公會發表的討論文字，對所有使用者公開顯示。</li>
          <li><strong>加入紀錄：</strong>你加入哪些公會的紀錄（與暱稱綁定）。</li>
          <li><strong>裝置識別碼：</strong>瀏覽器產生的隨機 ID（deviceId），僅用於識別你的操作裝置，不對應真實身分。</li>
        </ul>
        <p>上述資料不與其他個人身分資訊（如真實姓名、Email）綁定。公會功能目前無帳號制，所有身分均為匿名暱稱制。</p>
        <p><strong>刪除請求：</strong>若你希望刪除公會內的貼文或相關資料，請寄信至 <a href="mailto:internx.me@gmail.com">internx.me@gmail.com</a>，說明你的暱稱及請求內容，我們將於合理期間內處理。</p>

        <h2>5. Cookie 與本地儲存</h2>
        <p>本服務不使用追蹤性 Cookie。我們使用瀏覽器 localStorage 在你的裝置本地儲存申請記錄（key：warroom.v1），這是服務的核心功能。你可隨時透過瀏覽器清除 localStorage 刪除全部資料；清除後資料無法復原，建議先使用「JSON 備份」功能匯出。</p>

        <h2>6. 你的資料在哪裡，你完全掌控</h2>
        <p>你的申請記錄存在你的瀏覽器，我們無法讀取。你可以透過以下方式管理：</p>
        <ul>
          <li><strong>匯出：</strong>使用「備份」功能下載 JSON 檔案，自行保管。</li>
          <li><strong>刪除：</strong>清除瀏覽器 localStorage 或在清單頁個別刪除卡片。</li>
          <li><strong>搬移：</strong>匯出 JSON 後可在另一台裝置「還原」匯入。</li>
        </ul>

        <h2>7. 你的權利（個資法第 3 條）</h2>
        <p>對於我們所持有的少量個人資料（主要為 IP 連線紀錄），你擁有以下權利，來信行使：</p>
        <ol>
          <li>查詢或閱覽</li>
          <li>請求複製本</li>
          <li>請求補充或更正</li>
          <li>請求停止蒐集、處理或利用</li>
          <li>請求刪除</li>
        </ol>
        <p>我們會在收到請求後 15–30 日內回覆。</p>

        <h2>8. 資料安全</h2>
        <ul>
          <li>全站 HTTPS（TLS）加密傳輸</li>
          <li>速率限制（Rate Limiting）防止 API 濫用</li>
          <li>AI 解析不記錄文字內容，僅記錄數字指標</li>
          <li>若不幸發生個資事故，我們將依法查明並以站內公告通知受影響的使用者</li>
        </ul>

        <h2>9. 未成年人</h2>
        <p>本服務不以未滿 13 歲者為服務對象。若我們發現在未經法定代理人同意下蒐集了未滿 13 歲者的個人資料，將儘速刪除。</p>

        <h2>10. 政策更新</h2>
        <p>我們可能因功能或法令調整本政策，更新後會修改本頁的版本與生效日期。重大變更會於網站顯著位置公告。</p>

        <h2>11. 聯絡我們</h2>
        <ul>
          <li>經營者：職途有限公司，統一編號：60640342</li>
          <li>客服信箱：<a href="mailto:internx.me@gmail.com">internx.me@gmail.com</a></li>
          <li>服務網址：https://internx-war-room.zeabur.app</li>
        </ul>
        <p>對本政策有任何疑問，或認為我們的處理侵害你的權益，歡迎來信；你也可以向個人資料保護主管機關（國家發展委員會）申訴。</p>
      </main>

      <Footer />
    </div>
  );
}
