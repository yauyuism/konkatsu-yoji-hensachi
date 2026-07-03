"""CSVの読み込みと投信の分類解決（標準ライブラリのみ）。

任意でオンラインの基準価額取得も試みるが、ネットワーク不可なら静かにフォールバックする。
"""
from __future__ import annotations

import csv
import os
from typing import Iterable

from .models import AssetAssumption, FundRef, Holding

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")


def _rows(path: str) -> Iterable[dict]:
    with open(path, newline="", encoding="utf-8") as f:
        # 先頭が # の行はコメントとして無視
        lines = [ln for ln in f if not ln.lstrip().startswith("#")]
    reader = csv.DictReader(lines)
    for row in reader:
        if row and any((v or "").strip() for v in row.values()):
            yield {k: (v.strip() if isinstance(v, str) else v) for k, v in row.items()}


def load_assumptions(path: str | None = None) -> dict[str, AssetAssumption]:
    path = path or os.path.join(DATA_DIR, "asset_class_assumptions.csv")
    out: dict[str, AssetAssumption] = {}
    for r in _rows(path):
        out[r["asset_class"]] = AssetAssumption(
            asset_class=r["asset_class"],
            label_ja=r["label_ja"],
            expected_return=float(r["expected_return"]),
            volatility=float(r["volatility"]),
        )
    return out


def load_fund_reference(path: str | None = None) -> list[FundRef]:
    path = path or os.path.join(DATA_DIR, "fund_reference.csv")
    out: list[FundRef] = []
    for r in _rows(path):
        out.append(FundRef(
            fund_name=r["fund_name"],
            expense_ratio=float(r["expense_ratio"]),
            benchmark=r.get("benchmark", ""),
            asset_class=r["asset_class"],
            region_hint=r.get("region_hint", ""),
            currency_hint=r.get("currency_hint", ""),
        ))
    return out


def _norm(s: str) -> str:
    return "".join(s.split()).replace("　", "").lower()


def match_fund(fund_name: str, refs: list[FundRef]) -> FundRef | None:
    """完全一致 → 部分一致（長い名前優先）で参照データを引く。"""
    n = _norm(fund_name)
    for ref in refs:
        if _norm(ref.fund_name) == n:
            return ref
    # 部分一致: 保有名に参照名が含まれる/参照名に保有名が含まれる。より長い一致を優先。
    candidates = []
    for ref in refs:
        rn = _norm(ref.fund_name)
        if rn in n or n in rn:
            candidates.append((len(rn), ref))
    if candidates:
        candidates.sort(key=lambda x: x[0], reverse=True)
        return candidates[0][1]
    return None


def load_holdings(path: str, refs: list[FundRef] | None = None) -> list[Holding]:
    refs = refs if refs is not None else load_fund_reference()
    out: list[Holding] = []
    for r in _rows(path):
        h = Holding(
            fund_name=r["fund_name"],
            account_type=r.get("account_type", "taxable"),
            book_value=float(r.get("book_value") or 0),
            market_value=float(r.get("market_value") or 0),
            monthly_contribution=float(r.get("monthly_contribution") or 0),
        )
        ref = match_fund(h.fund_name, refs)
        if ref:
            h.asset_class = ref.asset_class
            h.expense_ratio = ref.expense_ratio
            h.benchmark = ref.benchmark
            h.matched_ref = ref.fund_name
        else:
            h.asset_class = "UNKNOWN"
        out.append(h)
    return out
