"""ポートフォリオ分析（標準ライブラリのみ）。"""
from __future__ import annotations

import math

from . import config
from .models import AssetAssumption, Holding, PortfolioMetrics


def alloc_by_asset(holdings: list[Holding]) -> dict[str, float]:
    total = sum(h.market_value for h in holdings)
    if total <= 0:
        return {}
    out: dict[str, float] = {}
    for h in holdings:
        out[h.asset_class] = out.get(h.asset_class, 0.0) + h.market_value
    return {k: v / total for k, v in out.items()}


def _lookthrough(weights: dict[str, float], mapping: dict[str, dict[str, float]]) -> dict[str, float]:
    """資産クラス比率を地域/通貨などにルックスルー展開する。"""
    out: dict[str, float] = {}
    for ac, w in weights.items():
        dist = mapping.get(ac, {"その他": 1.0})
        for k, share in dist.items():
            out[k] = out.get(k, 0.0) + w * share
    total = sum(out.values())
    if total > 0:
        out = {k: v / total for k, v in out.items()}
    return dict(sorted(out.items(), key=lambda x: x[1], reverse=True))


def portfolio_expected_return(weights: dict[str, float], assumptions: dict[str, AssetAssumption]) -> float:
    er = 0.0
    for ac, w in weights.items():
        a = assumptions.get(ac)
        if a:
            er += w * a.expected_return
    return er


def portfolio_volatility(weights: dict[str, float], assumptions: dict[str, AssetAssumption]) -> float:
    """分散共分散法: sqrt(w^T Σ w), Σ_ij = corr_ij * vol_i * vol_j。"""
    classes = [ac for ac in weights if ac in assumptions]
    var = 0.0
    for i in classes:
        for j in classes:
            wi, wj = weights[i], weights[j]
            vi, vj = assumptions[i].volatility, assumptions[j].volatility
            var += wi * wj * config.correlation(i, j) * vi * vj
    return math.sqrt(var) if var > 0 else 0.0


def weighted_expense_ratio(holdings: list[Holding]) -> float:
    total = sum(h.market_value for h in holdings)
    if total <= 0:
        return 0.0
    return sum(h.expense_ratio * h.market_value for h in holdings) / total


def find_overlaps(holdings: list[Holding]) -> list[dict]:
    """同一資産クラス/同一ベンチマークに重複投資している銘柄を検出。"""
    total = sum(h.market_value for h in holdings) or 1.0
    by_class: dict[str, list[Holding]] = {}
    for h in holdings:
        by_class.setdefault(h.asset_class, []).append(h)
    overlaps = []
    for ac, group in by_class.items():
        if len(group) >= 2:
            overlaps.append({
                "type": "asset_class",
                "key": ac,
                "funds": [h.fund_name for h in group],
                "weight": sum(h.market_value for h in group) / total,
            })
    # ベンチマーク重複（例: NASDAQ100を2本など）
    by_bench: dict[str, list[Holding]] = {}
    for h in holdings:
        if h.benchmark:
            by_bench.setdefault(h.benchmark, []).append(h)
    for bench, group in by_bench.items():
        if len({h.fund_name for h in group}) >= 2:
            overlaps.append({
                "type": "benchmark",
                "key": bench,
                "funds": [h.fund_name for h in group],
                "weight": sum(h.market_value for h in group) / total,
            })
    return overlaps


def analyze(holdings: list[Holding], assumptions: dict[str, AssetAssumption]) -> PortfolioMetrics:
    total_mv = sum(h.market_value for h in holdings)
    total_bv = sum(h.book_value for h in holdings)
    gain = total_mv - total_bv
    weights = alloc_by_asset(holdings)
    wer = weighted_expense_ratio(holdings)

    by_account: dict[str, float] = {}
    for h in holdings:
        by_account[h.account_type] = by_account.get(h.account_type, 0.0) + h.market_value
    if total_mv > 0:
        by_account = {k: v / total_mv for k, v in by_account.items()}

    return PortfolioMetrics(
        total_market_value=total_mv,
        total_book_value=total_bv,
        total_gain=gain,
        total_gain_pct=(gain / total_bv) if total_bv else 0.0,
        weighted_expense_ratio=wer,
        annual_fee_cost=total_mv * wer / 100.0,
        expected_return=portfolio_expected_return(weights, assumptions),
        expected_volatility=portfolio_volatility(weights, assumptions),
        alloc_by_asset=dict(sorted(weights.items(), key=lambda x: x[1], reverse=True)),
        alloc_by_region=_lookthrough(weights, config.REGION_MAP),
        alloc_by_currency=_lookthrough(weights, config.CURRENCY_MAP),
        alloc_by_account=dict(sorted(by_account.items(), key=lambda x: x[1], reverse=True)),
        overlaps=find_overlaps(holdings),
    )


def model_portfolio_metrics(name: str, assumptions: dict[str, AssetAssumption]) -> dict:
    """3モデルの想定リターン/ボラ/配分を返す。"""
    weights = config.MODEL_PORTFOLIOS[name]
    er = portfolio_expected_return(weights, assumptions)
    vol = portfolio_volatility(weights, assumptions)
    return {
        "name": name,
        "label_ja": config.MODEL_LABELS_JA[name],
        "weights": weights,
        "expected_return": er,
        "expected_volatility": vol,
        # 正規分布近似の目安（教育目的）: 95%下方 = er - 1.65*vol
        "downside_1y_95": er - 1.65 * vol,
        # 過去実績ベースの目安ドローダウン係数（株式比率から粗く推定）
    }


def equity_weight(weights: dict[str, float]) -> float:
    eq = {"GLOBAL_EQUITY", "DEV_EQUITY", "US_EQUITY", "US_TECH", "EM_EQUITY", "JP_EQUITY", "HIGH_DIV", "REIT"}
    return sum(w for ac, w in weights.items() if ac in eq)


def estimated_max_drawdown(weights: dict[str, float]) -> float:
    """株式比率から最大ドローダウンの目安を粗く推定（教育目的）。
    100%株式で約-55%、100%現金で約0%を線形補間した保守的な目安。"""
    return -0.55 * equity_weight(weights)
