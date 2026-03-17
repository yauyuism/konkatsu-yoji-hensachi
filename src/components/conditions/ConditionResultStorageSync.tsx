"use client";

import { useEffect } from "react";

import type { CalculationSummary, Conditions } from "@/lib/conditions";

type ConditionResultStorageSyncProps = {
  conditions: Conditions;
  summary: CalculationSummary;
};

export function ConditionResultStorageSync({ conditions, summary }: ConditionResultStorageSyncProps) {
  useEffect(() => {
    try {
      window.sessionStorage.setItem(
        "conditionResult",
        JSON.stringify({
          count: summary.count,
          percentage: summary.percentage,
          conditions,
        })
      );
    } catch {
      // Ignore storage failures.
    }
  }, [conditions, summary.count, summary.percentage]);

  return null;
}
