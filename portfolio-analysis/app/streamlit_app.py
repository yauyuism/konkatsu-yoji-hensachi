"""Streamlit ダッシュボード。

    streamlit run app/streamlit_app.py

保有CSVをアップロード（または同梱サンプル）して、配分・重複・リバランス・
資産推移の投影・NISA活用状況をインタラクティブに確認する。
教育目的の試算であり、投資助言ではありません。
"""
from __future__ import annotations

import io
import os
import sys
import tempfile

# パッケージ解決（app/ から一つ上を import path に追加）
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import streamlit as st  # noqa: E402

from portfolio_lab import analytics, config, data_sources, rebalance, reports  # noqa: E402

st.set_page_config(page_title="楽天証券ポートフォリオLAB", page_icon="📊", layout="wide")

st.title("📊 楽天証券ポートフォリオ分析 LAB")
st.caption("教育目的の試算ツールです。投資助言ではありません。数値は前提値に基づく試算です。")

assumptions = data_sources.load_assumptions()
refs = data_sources.load_fund_reference()

with st.sidebar:
    st.header("入力")
    up = st.file_uploader("保有CSVをアップロード", type=["csv"])
    target = st.selectbox("ターゲットモデル", ["defensive", "balanced", "aggressive"],
                          index=1, format_func=lambda k: config.MODEL_LABELS_JA[k])
    threshold = st.slider("リバランス許容乖離", 0.0, 0.20, 0.05, 0.01)
    years = st.slider("投影年数", 1, 40, 20)
    st.markdown("---")
    st.caption("CSV形式: fund_name, account_type, book_value, market_value, monthly_contribution")

# 保有データ読み込み
if up is not None:
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".csv")
    tmp.write(up.getvalue()); tmp.flush(); tmp.close()
    holdings = data_sources.load_holdings(tmp.name, refs)
else:
    st.info("サンプルデータを表示中。左のサイドバーからご自身のCSVをアップロードしてください。")
    holdings = data_sources.load_holdings(
        os.path.join(data_sources.DATA_DIR, "holdings_sample.csv"), refs)

metrics = analytics.analyze(holdings, assumptions)
plan = rebalance.rebalance_plan(holdings, target, threshold=threshold)
nisa = rebalance.nisa_advice(holdings)

unknown = [h.fund_name for h in holdings if h.asset_class == "UNKNOWN"]
if unknown:
    st.warning("未分類の銘柄: " + ", ".join(unknown) + "（data/fund_reference.csv に追加すると分類されます）")

# サマリー
c1, c2, c3, c4 = st.columns(4)
c1.metric("評価額合計", f"{metrics.total_market_value:,.0f} 円")
c2.metric("評価損益", f"{metrics.total_gain:,.0f} 円", f"{metrics.total_gain_pct*100:.1f}%")
c3.metric("加重信託報酬", f"{metrics.weighted_expense_ratio:.4f}% /年")
c4.metric("想定リターン/ボラ",
          f"{metrics.expected_return*100:.1f}%", f"σ {metrics.expected_volatility*100:.1f}%")

tab1, tab2, tab3, tab4 = st.tabs(["配分", "リバランス", "資産推移の投影", "NISA・3モデル"])

with tab1:
    col_a, col_b = st.columns(2)
    with col_a:
        st.subheader("資産クラス配分")
        st.bar_chart({assumptions[k].label_ja if k in assumptions else k: v * 100
                      for k, v in metrics.alloc_by_asset.items()})
        st.subheader("地域分散（ルックスルー）")
        st.dataframe({"地域": list(metrics.alloc_by_region),
                      "比率%": [round(v * 100, 1) for v in metrics.alloc_by_region.values()]},
                     use_container_width=True)
    with col_b:
        st.subheader("通貨分散（ルックスルー）")
        st.dataframe({"通貨": list(metrics.alloc_by_currency),
                      "比率%": [round(v * 100, 1) for v in metrics.alloc_by_currency.values()]},
                     use_container_width=True)
        st.subheader("重複投資チェック")
        if metrics.overlaps:
            for o in metrics.overlaps:
                kind = "資産クラス" if o["type"] == "asset_class" else "ベンチマーク"
                st.write(f"⚠️ {kind}「{o['key']}」に {len(o['funds'])}本が重複 "
                         f"（{o['weight']*100:.1f}%）: {', '.join(o['funds'])}")
        else:
            st.success("目立った重複はありません。")

with tab2:
    st.subheader(f"リバランス提案（ターゲット: {plan['target_label']}）")
    st.write("要リバランス: " + ("はい" if plan["needs_rebalance"] else "いいえ"))
    st.dataframe({
        "資産クラス": [r["asset_class"] for r in plan["rows"]],
        "現在%": [round(r["current_weight"] * 100, 1) for r in plan["rows"]],
        "目標%": [round(r["target_weight"] * 100, 1) for r in plan["rows"]],
        "乖離%": [round(r["drift"] * 100, 1) for r in plan["rows"]],
        "調整額(円)": [round(r["delta_value"]) for r in plan["rows"]],
        "アクション": [r["action"] for r in plan["rows"]],
    }, use_container_width=True)

with tab3:
    monthly_total = sum(h.monthly_contribution for h in holdings)
    proj = reports.project_growth(metrics.total_market_value, monthly_total,
                                  metrics.expected_return, metrics.expected_volatility, years=years)
    st.subheader("資産推移の投影（教育目的の単純複利モデル）")
    st.line_chart({
        "期待値": {p["year"]: p["expected"] for p in proj},
        "投資元本": {p["year"]: p["invested"] for p in proj},
        "上振れ(+1σ)": {p["year"]: p["high"] for p in proj},
        "下振れ(-1σ)": {p["year"]: p["low"] for p in proj},
    })
    last = proj[-1]
    st.write(f"{years}年後の期待評価額: **{last['expected']:,.0f} 円** "
             f"（投資元本 {last['invested']:,.0f} 円 / 目安レンジ {last['low']:,.0f}〜{last['high']:,.0f} 円）")

with tab4:
    st.subheader("NISA活用状況（年額）")
    st.dataframe({
        "項目": ["つみたて枠 積立", "成長枠 積立", "特定口座 積立", "つみたて枠 残り", "成長枠 残り"],
        "年額(円)": [nisa["nisa_tsumitate_annual"], nisa["nisa_growth_annual"],
                    nisa["taxable_annual"], nisa["tsumitate_room"], nisa["growth_room"]],
    }, use_container_width=True)
    for t in nisa["tips"]:
        st.write("• " + t)

    st.subheader("3モデルポートフォリオ比較")
    rows = {"モデル": [], "想定リターン%": [], "想定ボラ%": [], "想定最大DD%(目安)": []}
    for name in ("defensive", "balanced", "aggressive"):
        m = analytics.model_portfolio_metrics(name, assumptions)
        rows["モデル"].append(m["label_ja"])
        rows["想定リターン%"].append(round(m["expected_return"] * 100, 1))
        rows["想定ボラ%"].append(round(m["expected_volatility"] * 100, 1))
        rows["想定最大DD%(目安)"].append(round(analytics.estimated_max_drawdown(m["weights"]) * 100, 1))
    st.dataframe(rows, use_container_width=True)

st.markdown("---")
st.caption("※ 想定値は data/asset_class_assumptions.csv の前提に基づく試算です。"
           "前提を変えれば結果も変わります。売買判断はご自身の責任で。")
