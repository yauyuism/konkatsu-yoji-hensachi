"""定数・前提値の定義。

数値はすべて「教育目的の前提値」であり、投資助言ではありません。
地域/通貨の按分は代表的なインデックス構成を丸めた概算です。
"""
from __future__ import annotations

# 資産クラス -> 地域按分（合計1.0）。ルックスルーで地域分散を推定するのに使う。
REGION_MAP: dict[str, dict[str, float]] = {
    "GLOBAL_EQUITY": {"北米": 0.63, "日本": 0.05, "欧州先進": 0.16, "アジア太平洋先進": 0.05, "新興国": 0.11},
    "DEV_EQUITY":    {"北米": 0.74, "日本": 0.00, "欧州先進": 0.18, "アジア太平洋先進": 0.08, "新興国": 0.00},
    "US_EQUITY":     {"北米": 1.00},
    "US_TECH":       {"北米": 1.00},
    "EM_EQUITY":     {"新興国": 1.00},
    "JP_EQUITY":     {"日本": 1.00},
    "HIGH_DIV":      {"北米": 1.00},
    "REIT":          {"北米": 0.65, "日本": 0.10, "欧州先進": 0.15, "アジア太平洋先進": 0.10},
    "DEV_BOND":      {"北米": 0.45, "欧州先進": 0.40, "アジア太平洋先進": 0.15},
    "JP_BOND":       {"日本": 1.00},
    "GOLD":          {"その他": 1.00},
    "CASH":          {"日本": 1.00},
    "BALANCED8":     {"北米": 0.30, "日本": 0.25, "欧州先進": 0.15, "新興国": 0.10, "その他": 0.20},
}

# 資産クラス -> 通貨按分（合計1.0, ヘッジ後の実効通貨エクスポージャーの概算）
CURRENCY_MAP: dict[str, dict[str, float]] = {
    "GLOBAL_EQUITY": {"USD": 0.63, "EUR": 0.12, "JPY": 0.05, "その他": 0.20},
    "DEV_EQUITY":    {"USD": 0.74, "EUR": 0.14, "その他": 0.12},
    "US_EQUITY":     {"USD": 1.00},
    "US_TECH":       {"USD": 1.00},
    "EM_EQUITY":     {"その他": 0.75, "USD": 0.25},
    "JP_EQUITY":     {"JPY": 1.00},
    "HIGH_DIV":      {"USD": 1.00},
    "REIT":          {"USD": 0.65, "JPY": 0.10, "その他": 0.25},
    "DEV_BOND":      {"USD": 0.45, "EUR": 0.40, "その他": 0.15},
    "JP_BOND":       {"JPY": 1.00},
    "GOLD":          {"USD": 1.00},
    "CASH":          {"JPY": 1.00},
    "BALANCED8":     {"USD": 0.35, "JPY": 0.40, "EUR": 0.10, "その他": 0.15},
}

# 相関の既定値。同一クラス=1.0。ペア未定義時はグループ規則でフォールバック。
_EQUITY = {"GLOBAL_EQUITY", "DEV_EQUITY", "US_EQUITY", "US_TECH", "EM_EQUITY", "JP_EQUITY", "HIGH_DIV", "REIT"}
_BOND = {"DEV_BOND", "JP_BOND"}


def correlation(a: str, b: str) -> float:
    """2つの資産クラス間の想定相関係数（教育目的の概算）。"""
    if a == b:
        return 1.0
    pair = frozenset((a, b))
    overrides = {
        frozenset(("US_EQUITY", "US_TECH")): 0.92,
        frozenset(("US_EQUITY", "GLOBAL_EQUITY")): 0.95,
        frozenset(("US_EQUITY", "DEV_EQUITY")): 0.95,
        frozenset(("GLOBAL_EQUITY", "DEV_EQUITY")): 0.98,
        frozenset(("US_EQUITY", "HIGH_DIV")): 0.85,
        frozenset(("EM_EQUITY", "GLOBAL_EQUITY")): 0.80,
        frozenset(("JP_EQUITY", "GLOBAL_EQUITY")): 0.70,
        frozenset(("REIT", "GLOBAL_EQUITY")): 0.70,
        frozenset(("GOLD", "GLOBAL_EQUITY")): 0.10,
        frozenset(("GOLD", "DEV_BOND")): 0.20,
    }
    if pair in overrides:
        return overrides[pair]
    if a in _EQUITY and b in _EQUITY:
        return 0.80
    if a in _BOND and b in _BOND:
        return 0.60
    if (a in _EQUITY and b in _BOND) or (b in _EQUITY and a in _BOND):
        return 0.10
    if "CASH" in (a, b):
        return 0.0
    if "GOLD" in (a, b):
        return 0.10
    return 0.30


# NISA（2024年〜新制度）の枠。円。
NISA_TSUMITATE_ANNUAL = 1_200_000      # つみたて投資枠 年120万
NISA_GROWTH_ANNUAL = 2_400_000         # 成長投資枠 年240万
NISA_ANNUAL_TOTAL = 3_600_000          # 合計 年360万
NISA_LIFETIME_TOTAL = 18_000_000       # 生涯上限 1800万（うち成長枠は1200万まで）
NISA_GROWTH_LIFETIME = 12_000_000

# 3つのモデルポートフォリオ（資産クラス配分, 合計1.0）
MODEL_PORTFOLIOS: dict[str, dict[str, float]] = {
    "defensive": {   # 守備型: 最大ドローダウンを抑える
        "GLOBAL_EQUITY": 0.25,
        "HIGH_DIV": 0.10,
        "DEV_BOND": 0.30,
        "JP_BOND": 0.10,
        "GOLD": 0.10,
        "CASH": 0.15,
    },
    "balanced": {    # バランス型: リスクとリターンの均衡
        "GLOBAL_EQUITY": 0.50,
        "EM_EQUITY": 0.05,
        "HIGH_DIV": 0.10,
        "DEV_BOND": 0.20,
        "GOLD": 0.05,
        "CASH": 0.10,
    },
    "aggressive": {  # 攻撃型: 長期で最大リターンを狙う
        "GLOBAL_EQUITY": 0.50,
        "US_EQUITY": 0.20,
        "US_TECH": 0.15,
        "EM_EQUITY": 0.10,
        "CASH": 0.05,
    },
}

MODEL_LABELS_JA = {
    "defensive": "守備型",
    "balanced": "バランス型",
    "aggressive": "攻撃型",
}
