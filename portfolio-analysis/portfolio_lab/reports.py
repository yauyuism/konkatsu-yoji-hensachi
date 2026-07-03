"""レポート生成: Markdown / CSV は標準ライブラリのみ。グラフ/PDFは matplotlib があれば生成。"""
from __future__ import annotations

import csv
import os

from . import analytics, config
from .models import Holding, PortfolioMetrics


def _pct(x: float) -> str:
    return f"{x * 100:.1f}%"


def project_growth(current_value: float, monthly: float, annual_return: float,
                   annual_vol: float, years: int = 20) -> list[dict]:
    """毎月積立を続けた場合の資産推移の投影（教育目的の単純複利モデル）。
    ±1σ帯は年率ボラを用いた粗い目安であり、実際の分布ではありません。"""
    r_m = (1 + annual_return) ** (1 / 12) - 1
    out = []
    for y in range(0, years + 1):
        months = y * 12
        # 期待値
        if r_m != 0:
            fv_contrib = monthly * (((1 + r_m) ** months - 1) / r_m)
        else:
            fv_contrib = monthly * months
        fv = current_value * (1 + r_m) ** months + fv_contrib
        # 粗い±1σ帯（累積リターンのブレを sqrt(t) でスケール）
        band = fv * annual_vol * (y ** 0.5)
        out.append({
            "year": y,
            "expected": fv,
            "low": max(0.0, fv - band),
            "high": fv + band,
            "invested": current_value + monthly * months,
        })
    return out


# ---------- CSV ----------

def write_csv(path: str, header: list[str], rows: list[list]) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.writer(f)
        w.writerow(header)
        w.writerows(rows)


def export_csvs(out_dir: str, holdings: list[Holding], metrics: PortfolioMetrics, plan: dict) -> list[str]:
    written = []

    p = os.path.join(out_dir, "holdings_enriched.csv")
    write_csv(p, ["fund_name", "asset_class", "account_type", "expense_ratio_%",
                  "book_value", "market_value", "gain", "gain_%", "monthly_contribution"],
              [[h.fund_name, h.asset_class, h.account_type, f"{h.expense_ratio:.4f}",
                f"{h.book_value:.0f}", f"{h.market_value:.0f}", f"{h.gain:.0f}",
                f"{h.gain_pct * 100:.2f}", f"{h.monthly_contribution:.0f}"] for h in holdings])
    written.append(p)

    p = os.path.join(out_dir, "allocation_by_asset.csv")
    write_csv(p, ["asset_class", "weight_%"],
              [[k, f"{v * 100:.2f}"] for k, v in metrics.alloc_by_asset.items()])
    written.append(p)

    p = os.path.join(out_dir, "rebalance_plan.csv")
    write_csv(p, ["asset_class", "current_%", "target_%", "drift_%", "delta_value_jpy", "action"],
              [[r["asset_class"], f"{r['current_weight'] * 100:.2f}", f"{r['target_weight'] * 100:.2f}",
                f"{r['drift'] * 100:.2f}", f"{r['delta_value']:.0f}", r["action"]] for r in plan["rows"]])
    written.append(p)
    return written


# ---------- Markdown 月次レポート ----------

def _table(headers: list[str], rows: list[list[str]]) -> str:
    line = "| " + " | ".join(headers) + " |\n"
    line += "| " + " | ".join(["---"] * len(headers)) + " |\n"
    for r in rows:
        line += "| " + " | ".join(str(c) for c in r) + " |\n"
    return line


def monthly_report_md(holdings: list[Holding], metrics: PortfolioMetrics, plan: dict,
                      nisa: dict, assumptions, as_of: str, target_name: str) -> str:
    md = []
    md.append(f"# 楽天証券ポートフォリオ 月次レポート（{as_of}）\n")
    md.append("> 本レポートは教育目的の分析であり、投資助言ではありません。数値は前提値に基づく試算です。\n")

    md.append("## 1. サマリー\n")
    md.append(_table(
        ["項目", "値"],
        [
            ["評価額合計", f"{metrics.total_market_value:,.0f} 円"],
            ["取得額合計", f"{metrics.total_book_value:,.0f} 円"],
            ["評価損益", f"{metrics.total_gain:,.0f} 円（{_pct(metrics.total_gain_pct)}）"],
            ["加重平均信託報酬", f"{metrics.weighted_expense_ratio:.4f}% / 年"],
            ["年間コスト概算", f"{metrics.annual_fee_cost:,.0f} 円"],
            ["想定リターン（年率）", _pct(metrics.expected_return)],
            ["想定ボラティリティ（年率）", _pct(metrics.expected_volatility)],
            ["想定最大DD（目安）", _pct(analytics.estimated_max_drawdown(metrics.alloc_by_asset))],
        ],
    ))

    md.append("\n## 2. 資産クラス配分\n")
    md.append(_table(["資産クラス", "比率"],
                     [[assumptions.get(k).label_ja if assumptions.get(k) else k, _pct(v)]
                      for k, v in metrics.alloc_by_asset.items()]))

    md.append("\n## 3. 地域分散（ルックスルー）\n")
    md.append(_table(["地域", "比率"], [[k, _pct(v)] for k, v in metrics.alloc_by_region.items()]))

    md.append("\n## 4. 通貨分散（ルックスルー）\n")
    md.append(_table(["通貨", "比率"], [[k, _pct(v)] for k, v in metrics.alloc_by_currency.items()]))

    md.append("\n## 5. 口座区分\n")
    md.append(_table(["口座", "比率"], [[k, _pct(v)] for k, v in metrics.alloc_by_account.items()]))

    md.append("\n## 6. 重複投資チェック\n")
    if metrics.overlaps:
        for o in metrics.overlaps:
            kind = "資産クラス" if o["type"] == "asset_class" else "ベンチマーク"
            md.append(f"- ⚠️ {kind}「{o['key']}」に {len(o['funds'])} 本が重複（合計 {_pct(o['weight'])}）: "
                      + " / ".join(o["funds"]))
        md.append("")
    else:
        md.append("- 目立った重複はありません。\n")

    md.append(f"\n## 7. リバランス提案（ターゲット: {plan['target_label']}）\n")
    md.append(f"閾値 ±{_pct(plan['threshold'])} を超える乖離のみ調整対象。要リバランス: "
              f"{'はい' if plan['needs_rebalance'] else 'いいえ'}\n")
    md.append(_table(
        ["資産クラス", "現在", "目標", "乖離", "調整額(円)", "アクション"],
        [[r["asset_class"], _pct(r["current_weight"]), _pct(r["target_weight"]),
          _pct(r["drift"]), f"{r['delta_value']:,.0f}", r["action"]] for r in plan["rows"]],
    ))

    md.append("\n## 8. NISA活用状況\n")
    md.append(_table(
        ["項目", "年額"],
        [
            ["つみたて投資枠 積立", f"{nisa['nisa_tsumitate_annual']:,.0f} 円"],
            ["成長投資枠 積立", f"{nisa['nisa_growth_annual']:,.0f} 円"],
            ["特定口座 積立", f"{nisa['taxable_annual']:,.0f} 円"],
            ["つみたて枠 残り", f"{nisa['tsumitate_room']:,.0f} 円"],
            ["成長枠 残り", f"{nisa['growth_room']:,.0f} 円"],
        ],
    ))
    for t in nisa["tips"]:
        md.append(f"- {t}")
    md.append("")

    md.append("\n## 9. 3モデルポートフォリオ比較\n")
    rows = []
    for name in ("defensive", "balanced", "aggressive"):
        m = analytics.model_portfolio_metrics(name, assumptions)
        mdd = analytics.estimated_max_drawdown(m["weights"])
        rows.append([m["label_ja"], _pct(m["expected_return"]), _pct(m["expected_volatility"]),
                     _pct(mdd)])
    md.append(_table(["モデル", "想定リターン", "想定ボラ", "想定最大DD(目安)"], rows))

    md.append("\n---\n※ 想定値は `data/asset_class_assumptions.csv` の前提に基づく試算です。"
              "前提を変えれば結果も変わります。売買判断はご自身の責任で。\n")
    return "\n".join(md)


# ---------- グラフ / PDF（matplotlib があれば） ----------

def try_build_charts_and_pdf(out_dir: str, metrics: PortfolioMetrics, projection: list[dict],
                             assumptions) -> list[str]:
    try:
        import matplotlib
        matplotlib.use("Agg")
        import matplotlib.pyplot as plt
        from matplotlib.backends.backend_pdf import PdfPages
    except Exception as e:  # matplotlib 未インストール等
        return [f"(グラフ/PDFはスキップ: matplotlibが必要です -> pip install matplotlib) [{e}]"]

    # 日本語フォントが無い環境向けにラベルはローマ字化
    def rj(k):
        a = assumptions.get(k)
        return a.asset_class if a else k

    os.makedirs(out_dir, exist_ok=True)
    written = []

    pie_path = os.path.join(out_dir, "allocation_pie.png")
    fig1, ax1 = plt.subplots(figsize=(6, 6))
    labels = [rj(k) for k in metrics.alloc_by_asset]
    ax1.pie(list(metrics.alloc_by_asset.values()), labels=labels, autopct="%1.0f%%", startangle=90)
    ax1.set_title("Asset Allocation")
    fig1.tight_layout()
    fig1.savefig(pie_path, dpi=120)
    written.append(pie_path)

    proj_path = os.path.join(out_dir, "growth_projection.png")
    fig2, ax2 = plt.subplots(figsize=(8, 5))
    yrs = [p["year"] for p in projection]
    ax2.plot(yrs, [p["expected"] for p in projection], label="Expected", color="#2563eb")
    ax2.fill_between(yrs, [p["low"] for p in projection], [p["high"] for p in projection],
                     alpha=0.15, color="#2563eb", label="±1σ (rough)")
    ax2.plot(yrs, [p["invested"] for p in projection], "--", color="#888", label="Invested")
    ax2.set_xlabel("Years"); ax2.set_ylabel("JPY")
    ax2.set_title("Asset Growth Projection (educational)")
    ax2.legend(); ax2.grid(alpha=0.3)
    fig2.tight_layout()
    fig2.savefig(proj_path, dpi=120)
    written.append(proj_path)

    pdf_path = os.path.join(out_dir, "monthly_report.pdf")
    with PdfPages(pdf_path) as pdf:
        pdf.savefig(fig1)
        pdf.savefig(fig2)
        fig3 = plt.figure(figsize=(8, 5))
        fig3.text(0.1, 0.9, "Portfolio Summary", fontsize=16, weight="bold")
        lines = [
            f"Market value : {metrics.total_market_value:,.0f} JPY",
            f"Gain         : {metrics.total_gain:,.0f} JPY ({metrics.total_gain_pct*100:.1f}%)",
            f"Weighted fee : {metrics.weighted_expense_ratio:.4f}% / yr",
            f"Exp. return  : {metrics.expected_return*100:.1f}% / yr",
            f"Exp. vol     : {metrics.expected_volatility*100:.1f}% / yr",
        ]
        for i, ln in enumerate(lines):
            fig3.text(0.1, 0.78 - i * 0.08, ln, fontsize=12, family="monospace")
        pdf.savefig(fig3)
        plt.close("all")
    written.append(pdf_path)
    return written
