# 楽天証券ポートフォリオ分析 LAB

楽天証券で保有する投資信託・資産を **中長期で効率よく増やす** ための、
現状分析 → 改善案 → 自動分析環境 → 運用ルールまでを一気通貫でカバーする教育用ツールキットです。

> ⚠️ **免責**: 本ツールと同梱ドキュメントは *教育・情報提供* を目的としたものであり、
> 特定銘柄の売買を勧める **投資助言ではありません**。数値はすべて前提値に基づく試算です。
> 実際の投資判断はご自身の責任で、最新の目論見書・税制をご確認ください。

## 何ができるか（STEP1〜5に対応）

| STEP | 内容 | 対応する成果物 |
| --- | --- | --- |
| STEP1 現状分析 | 年齢・年収・保有銘柄などのヒアリング | `docs/interview_template.md` に記入 → `data/holdings.csv` |
| STEP2 ポートフォリオ診断 | 信託報酬 / 純資産 / ベンチマーク / リターン / リスク / 重複 / 地域・通貨分散、オルカン・S&P500・NASDAQ100・新興国・高配当との比較 | `portfolio_lab/analytics.py` + `docs/analysis_report.md` |
| STEP3 改善提案 | 守備型 / バランス型 / 攻撃型（期待リターン・想定ボラ・投資比率） | `config.MODEL_PORTFOLIOS` + レポートの3モデル比較 |
| STEP4 自動分析環境 | データ取得・資産管理・リバランス提案・月次レポート・資産推移グラフ、Streamlit / CSV / PDF 出力 | `portfolio_lab/` + `app/streamlit_app.py` |
| STEP5 運用ルール | 積立・暴落時買増し・利確・リバランス・NISA優先・感情チェックリスト | `docs/operation_rules.md` |

さらに **経営者のキャッシュアロケーション**（本業再投資・法人内部留保・現金比率）まで広げた
分析フレームは `docs/analysis_report.md` の付録にあります。

## セットアップ

```bash
cd portfolio-analysis
# コア分析（CSV / Markdown）は追加インストール不要（Python 3.10+ 標準ライブラリのみ）
# グラフ・PDF・ダッシュボードを使う場合のみ:
pip install -r requirements.txt
```

## 使い方

### 1. 自分の保有データを用意

`data/holdings_sample.csv` をコピーして `data/holdings.csv` を作り、実データに置き換えます。
（保有銘柄のスクショしかない場合は、`docs/interview_template.md` の手順で書き起こしてください。）

### 2. コマンドラインで分析＋レポート生成

```bash
python -m portfolio_lab.cli --holdings data/holdings.csv --target balanced --out reports
```

生成物（`reports/`）:
- `monthly_report.md` … 月次レポート（サマリー・配分・重複・リバランス・NISA・3モデル比較）
- `holdings_enriched.csv` / `allocation_by_asset.csv` / `rebalance_plan.csv`
- `allocation_pie.png` / `growth_projection.png` / `monthly_report.pdf`（matplotlibがある場合）

`--target` は `defensive` / `balanced` / `aggressive`。`--threshold` でリバランス許容乖離、
`--years` で資産推移の投影年数を調整できます。

### 3. ダッシュボード（Streamlit）

```bash
streamlit run app/streamlit_app.py
```

CSVをアップロードして、配分・重複・リバランス・資産推移の投影・NISA活用状況を対話的に確認できます。

## ディレクトリ構成

```
portfolio-analysis/
├── README.md
├── requirements.txt
├── data/
│   ├── asset_class_assumptions.csv   # 資産クラス別の想定リターン/ボラ（前提値・要更新）
│   ├── fund_reference.csv            # 代表的な楽天証券取扱い投信の信託報酬/ベンチマーク/分類
│   └── holdings_sample.csv           # 保有データのサンプル（★実データに差し替え★）
├── portfolio_lab/                    # 分析ロジック（標準ライブラリのみで動作）
│   ├── config.py                     # 地域/通貨マップ・相関・NISA定数・3モデル配分
│   ├── models.py  data_sources.py  analytics.py  rebalance.py  reports.py  cli.py
├── app/streamlit_app.py              # ダッシュボード
└── docs/
    ├── analysis_report.md            # STEP1〜5の解説 + 経営者視点の付録（出力形式1〜6）
    ├── operation_rules.md            # 運用ルール + 感情売買チェックリスト
    └── interview_template.md         # STEP1ヒアリングの記入テンプレート
```

## 前提値のカスタマイズ

想定リターン・ボラは `data/asset_class_assumptions.csv`、相関・モデル配分は `portfolio_lab/config.py`
で変更できます。**前提を変えれば結論も変わります**。数値の出所と根拠は `docs/analysis_report.md` を参照。
