# 婚活診断LAB by やうゆ

婚活・マッチングアプリ向けの診断シリーズです。現在は主に以下を含みます。

- `/diagnoses/deai-fit`: あなたに合う出会い方診断
- `/diagnoses/konkatsu-fatigue`: 婚活疲れ・マチアプ疲れの理由診断
- `/prof`: プロフィール偏差値診断
- `/prof/stats`: 匿名化された統計ページ
- `/conditions`: 条件リアリティチェック
- `/check`: この人、大丈夫？チェッカー
- `/market`: 婚活スペック年収換算
- `/`: 婚活・恋愛の癖を知る無料診断メディア
- `/yoji`: 婚活四字熟語診断

プロフィール偏差値診断は、プロフィール文を Claude で分析して、偏差値、5軸スコア、ハイライト、刺さる相手、改善案まで返します。条件リアリティチェックは、年齢・年収・身長・学歴・エリア条件から、未婚者全体の何%に当たるかと人数を即時計算します。婚活スペック年収換算は、年齢・年収・身長・学歴・居住地の希少性を年収相当に置き換えて見せます。スクショ読み取りを使う場合のみ Claude を使います。

## 技術スタック

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Anthropic Claude API
- Vercel KV
- Recharts
- html2canvas
- Playwright

## ローカル開発

```bash
npm install
cp .env.example .env.local
npm run dev
```

- ホーム: [http://localhost:3000/](http://localhost:3000/)
- 婚活疲れ・マチアプ疲れの理由診断: [http://localhost:3000/diagnoses/konkatsu-fatigue](http://localhost:3000/diagnoses/konkatsu-fatigue)
- あなたに合う出会い方診断: [http://localhost:3000/diagnoses/deai-fit](http://localhost:3000/diagnoses/deai-fit)
- 条件リアリティチェック: [http://localhost:3000/conditions](http://localhost:3000/conditions)
- 婚活スペック年収換算: [http://localhost:3000/market](http://localhost:3000/market)
- プロフィール偏差値診断: [http://localhost:3000/prof](http://localhost:3000/prof)
- 統計: [http://localhost:3000/prof/stats](http://localhost:3000/prof/stats)

## 環境変数

`.env.local` に設定します。

- `ANTHROPIC_API_KEY`
  - 必須
  - `/api/analyze` `/api/analyze-check` `/api/read-filter` で使用
- `CHECK_ANALYZE_MOCK`
  - 任意
  - `1` を入れると、`/check` だけはローカルでモック判定を返せる
  - UI 調整用。本番では使わない
- `ANALYZE_TOKEN_SECRET`
  - 任意
  - staged analysis token の署名用。未設定時は API key を代用
- `NEXT_PUBLIC_SITE_URL`
  - 本番URL
  - canonical / OGP / sitemap の基準URL
- `NEXT_PUBLIC_URL`
  - 互換用エイリアス。通常は不要
- `NEXT_PUBLIC_GA_ID`
  - 任意
  - GA4 Measurement ID
- `NEXT_PUBLIC_CLARITY_PROJECT_ID`
  - 任意
  - Microsoft Clarity Project ID
  - 未設定時は `vx5e0sqmpt` を使って `shindanlab.jp` 用に読み込み
- `NEXT_PUBLIC_X_URL`
  - X プロフィールURL
- `NEXT_PUBLIC_NOTE_URL`
  - note プロフィールURL
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `KV_REST_API_READ_ONLY_TOKEN`
  - 任意
  - Upstash / Vercel KV 用
- `MAX_DAILY_REQUESTS`
  - 任意
  - 1日の診断数上限
- `STATS_RECORD_RETENTION`
  - 任意
  - 匿名統計の生レコード保持件数。`0` で無効
- `CONDITIONS_STATS_RECORD_RETENTION`
  - 任意
  - 条件リアリティチェックの匿名スナップショット保持件数。`0` で無効
- `MARKET_STATS_RECORD_RETENTION`
  - 任意
  - 婚活スペック年収換算の匿名スナップショット保持件数。`0` で無効
- `MY9SPECS_STATS_RECORD_RETENTION`
  - 任意
  - My 9 Specs の匿名スナップショット保持件数。`0` で無効

## 本番投入前チェック

```bash
npm run lint
npm run build
npm run test:e2e
```

Playwright 初回のみ:

```bash
npx playwright install chromium
```

## E2E テスト

Playwright は `tests/e2e` にあります。

- `/conditions` の基本フロー
- `/check` の基本フロー
- `/diagnoses/konkatsu-fatigue` の基本フローとMOSH導線
- `/diagnoses/deai-fit` の基本フロー
- `/prof` の基本フロー
- 入力バリデーション
- 初回分析エラー表示
- `/prof/stats` の主要導線

ローカルで既存サーバーを使う場合:

```bash
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3000 npm run test:e2e
```

## Vercel デプロイ

1. GitHub リポジトリを Vercel に Import
2. Environment Variables を設定
3. Production Domain を設定
4. `/conditions`、`/prof`、`/prof/stats` を本番確認

最低限必要な本番環境変数:

```bash
ANTHROPIC_API_KEY=
CHECK_ANALYZE_MOCK=
ANALYZE_TOKEN_SECRET=
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_GA_ID=
NEXT_PUBLIC_CLARITY_PROJECT_ID=
KV_REST_API_URL=
KV_REST_API_TOKEN=
MAX_DAILY_REQUESTS=
STATS_RECORD_RETENTION=500
CONDITIONS_STATS_RECORD_RETENTION=3000
MARKET_STATS_RECORD_RETENTION=3000
MY9SPECS_STATS_RECORD_RETENTION=3000
```

## 運用メモ

- `/api/analyze` は初回分析と詳細分析の2段階
- `/api/read-filter` は条件スクショの読み取り専用
- `/api/conditions-stats` は条件リアリティチェックの匿名スナップショット保存
- `/api/market-stats` は婚活スペック年収換算の匿名スナップショット保存
- `/api/my9specs-stats` は My 9 Specs の匿名スナップショット保存
- レスポンスには `X-Analyze-Request-Id` と `Server-Timing` を付与
- Vercel logs には構造化ログを出すので、遅延・失敗率の確認に使える
- 統計ページは KV 未設定でもゼロ件表示で動く
- 匿名統計にはプロフィール原文を保存しない
- 条件リアリティチェックの匿名統計にはスクショ画像そのものを保存しない
- 婚活スペック年収換算の匿名統計には入力スペックのスナップショットだけを保存し、個人識別情報は保存しない
