"""データモデル（標準ライブラリのみ）。"""
from __future__ import annotations

from dataclasses import dataclass, field


@dataclass
class AssetAssumption:
    asset_class: str
    label_ja: str
    expected_return: float
    volatility: float


@dataclass
class FundRef:
    fund_name: str
    expense_ratio: float          # 信託報酬（税込・年率, 小数。例: 0.0937 は 0.0937%）
    benchmark: str
    asset_class: str
    region_hint: str = ""
    currency_hint: str = ""


@dataclass
class Holding:
    fund_name: str
    account_type: str             # NISA_growth / NISA_tsumitate / taxable
    book_value: float             # 取得金額（円）
    market_value: float           # 評価額（円）
    monthly_contribution: float = 0.0
    # 分類解決後に埋められる
    asset_class: str = ""
    expense_ratio: float = 0.0
    benchmark: str = ""
    matched_ref: str = ""

    @property
    def gain(self) -> float:
        return self.market_value - self.book_value

    @property
    def gain_pct(self) -> float:
        return (self.market_value / self.book_value - 1.0) if self.book_value else 0.0


@dataclass
class PortfolioMetrics:
    total_market_value: float
    total_book_value: float
    total_gain: float
    total_gain_pct: float
    weighted_expense_ratio: float          # 加重平均信託報酬（%）
    annual_fee_cost: float                 # 年間コスト概算（円）
    expected_return: float                 # 想定リターン（年率, 小数）
    expected_volatility: float             # 想定ボラティリティ（年率, 小数）
    alloc_by_asset: dict[str, float] = field(default_factory=dict)     # 資産クラス -> 比率
    alloc_by_region: dict[str, float] = field(default_factory=dict)
    alloc_by_currency: dict[str, float] = field(default_factory=dict)
    alloc_by_account: dict[str, float] = field(default_factory=dict)
    overlaps: list[dict] = field(default_factory=list)
