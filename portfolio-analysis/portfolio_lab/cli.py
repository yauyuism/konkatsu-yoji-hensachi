"""コマンドライン実行:

    python -m portfolio_lab.cli --holdings data/holdings_sample.csv --target balanced --out reports

CSVとMarkdownは標準ライブラリだけで生成。matplotlibがあればグラフ/PDFも出力。
"""
from __future__ import annotations

import argparse
import os

from . import analytics, data_sources, rebalance, reports


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description="楽天証券ポートフォリオ分析（教育目的）")
    ap.add_argument("--holdings", default=None, help="保有CSVのパス")
    ap.add_argument("--target", default="balanced",
                    choices=["defensive", "balanced", "aggressive"], help="ターゲットモデル")
    ap.add_argument("--out", default="reports", help="出力ディレクトリ")
    ap.add_argument("--as-of", default="latest", help="レポート日付ラベル（例 2026-07）")
    ap.add_argument("--threshold", type=float, default=0.05, help="リバランス許容乖離")
    ap.add_argument("--years", type=int, default=20, help="資産推移の投影年数")
    args = ap.parse_args(argv)

    holdings_path = args.holdings or os.path.join(data_sources.DATA_DIR, "holdings_sample.csv")
    assumptions = data_sources.load_assumptions()
    refs = data_sources.load_fund_reference()
    holdings = data_sources.load_holdings(holdings_path, refs)

    unknown = [h.fund_name for h in holdings if h.asset_class == "UNKNOWN"]
    if unknown:
        print("⚠️ 参照データに未登録の銘柄（UNKNOWN扱い）:")
        for u in unknown:
            print(f"   - {u}  → data/fund_reference.csv に追加すると分類されます")

    metrics = analytics.analyze(holdings, assumptions)
    plan = rebalance.rebalance_plan(holdings, args.target, threshold=args.threshold)
    nisa = rebalance.nisa_advice(holdings)

    os.makedirs(args.out, exist_ok=True)

    md = reports.monthly_report_md(holdings, metrics, plan, nisa, assumptions,
                                   as_of=args.as_of, target_name=args.target)
    md_path = os.path.join(args.out, "monthly_report.md")
    with open(md_path, "w", encoding="utf-8") as f:
        f.write(md)

    csvs = reports.export_csvs(args.out, holdings, metrics, plan)

    monthly_total = sum(h.monthly_contribution for h in holdings)
    projection = reports.project_growth(metrics.total_market_value, monthly_total,
                                        metrics.expected_return, metrics.expected_volatility,
                                        years=args.years)
    charts = reports.try_build_charts_and_pdf(args.out, metrics, projection, assumptions)

    print("\n===== 分析サマリー =====")
    print(f"評価額合計 : {metrics.total_market_value:,.0f} 円")
    print(f"評価損益   : {metrics.total_gain:,.0f} 円 ({metrics.total_gain_pct*100:.1f}%)")
    print(f"加重信託報酬: {metrics.weighted_expense_ratio:.4f}% / 年 "
          f"(年間コスト概算 {metrics.annual_fee_cost:,.0f} 円)")
    print(f"想定リターン: {metrics.expected_return*100:.1f}% / 想定ボラ: {metrics.expected_volatility*100:.1f}%")
    print(f"想定最大DD  : {analytics.estimated_max_drawdown(metrics.alloc_by_asset)*100:.1f}% (目安)")
    if metrics.overlaps:
        print(f"重複投資    : {len(metrics.overlaps)} 件検出")
    print(f"要リバランス: {'はい' if plan['needs_rebalance'] else 'いいえ'} (ターゲット {plan['target_label']})")

    print("\n===== 生成物 =====")
    for p in [md_path, *csvs, *charts]:
        print(f" - {p}")
    print("\n※ 教育目的の試算です。投資助言ではありません。")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
