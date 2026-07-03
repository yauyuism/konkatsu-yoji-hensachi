"""リバランス提案とNISA優先活用アドバイス（標準ライブラリのみ）。"""
from __future__ import annotations

from . import config
from .models import Holding


def rebalance_plan(holdings: list[Holding], target_name: str, threshold: float = 0.05) -> dict:
    """現在配分とターゲット配分の乖離、および売買（増減）額の提案を返す。

    threshold: この幅を超えて乖離しているクラスのみ「要調整」とする（ノーセル・ノーバイ帯）。
    """
    target = config.MODEL_PORTFOLIOS[target_name]
    total = sum(h.market_value for h in holdings)
    current: dict[str, float] = {}
    for h in holdings:
        current[h.asset_class] = current.get(h.asset_class, 0.0) + h.market_value
    current_w = {k: (v / total if total else 0.0) for k, v in current.items()}

    classes = sorted(set(current_w) | set(target))
    rows = []
    for ac in classes:
        cw = current_w.get(ac, 0.0)
        tw = target.get(ac, 0.0)
        drift = cw - tw
        target_value = tw * total
        current_value = current.get(ac, 0.0)
        delta_value = target_value - current_value  # +なら買い増し, -なら売却
        rows.append({
            "asset_class": ac,
            "current_weight": cw,
            "target_weight": tw,
            "drift": drift,
            "current_value": current_value,
            "target_value": target_value,
            "delta_value": delta_value,
            "action": _action(drift, threshold),
        })
    rows.sort(key=lambda r: abs(r["drift"]), reverse=True)
    return {
        "target_name": target_name,
        "target_label": config.MODEL_LABELS_JA[target_name],
        "total_value": total,
        "threshold": threshold,
        "rows": rows,
        "needs_rebalance": any(abs(r["drift"]) > threshold for r in rows),
    }


def _action(drift: float, threshold: float) -> str:
    if drift > threshold:
        return "減らす（またはこのクラスへの積立を止める）"
    if drift < -threshold:
        return "増やす（新規資金・積立を優先配分）"
    return "許容帯（そのまま）"


def nisa_advice(holdings: list[Holding]) -> dict:
    """NISA枠の使用状況と、新規資金のNISA優先配分アドバイス（年額ベースの概算）。"""
    annual_contrib = sum(h.monthly_contribution for h in holdings) * 12
    tsumitate_now = sum(h.monthly_contribution for h in holdings
                        if h.account_type == "NISA_tsumitate") * 12
    growth_now = sum(h.monthly_contribution for h in holdings
                     if h.account_type == "NISA_growth") * 12
    taxable_now = sum(h.monthly_contribution for h in holdings
                      if h.account_type == "taxable") * 12

    tsumitate_room = max(0.0, config.NISA_TSUMITATE_ANNUAL - tsumitate_now)
    growth_room = max(0.0, config.NISA_GROWTH_ANNUAL - growth_now)

    tips = []
    if taxable_now > 0 and (tsumitate_room > 0 or growth_room > 0):
        tips.append(
            f"特定口座での年間積立 約{taxable_now:,.0f}円 のうち、"
            f"つみたて枠の空き 約{tsumitate_room:,.0f}円 / 成長枠の空き 約{growth_room:,.0f}円 を"
            "先に埋めると非課税メリットが大きい。"
        )
    if tsumitate_room > 0:
        tips.append(f"つみたて投資枠（年{config.NISA_TSUMITATE_ANNUAL:,.0f}円）に 約{tsumitate_room:,.0f}円 の余裕あり。")
    if growth_room > 0:
        tips.append(f"成長投資枠（年{config.NISA_GROWTH_ANNUAL:,.0f}円）に 約{growth_room:,.0f}円 の余裕あり。")
    tips.append("原則: コア（オルカン/S&P500）はNISA優先、値動きの大きいサテライトや利確予定分を特定口座に。")

    return {
        "annual_contribution": annual_contrib,
        "nisa_tsumitate_annual": tsumitate_now,
        "nisa_growth_annual": growth_now,
        "taxable_annual": taxable_now,
        "tsumitate_room": tsumitate_room,
        "growth_room": growth_room,
        "annual_limit_total": config.NISA_ANNUAL_TOTAL,
        "lifetime_limit": config.NISA_LIFETIME_TOTAL,
        "tips": tips,
    }
