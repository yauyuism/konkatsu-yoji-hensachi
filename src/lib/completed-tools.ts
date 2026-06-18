"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";

import type { ToolId } from "@/data/tools";
import {
  COMPLETED_TOOLS_COOKIE,
  COMPLETED_TOOLS_EVENT,
  COMPLETED_TOOLS_STORAGE_KEY,
} from "@/lib/completed-tools-keys";

function isToolId(value: string): value is ToolId {
  return (
    value === "deaiFit" ||
    value === "prof" ||
    value === "weight" ||
    value === "my9specs" ||
    value === "conditions" ||
    value === "market" ||
    value === "hensachi" ||
    value === "type"
  );
}

function normalizeCompletedTools(value: unknown) {
  if (Array.isArray(value)) {
    return value.filter((item): item is ToolId => typeof item === "string" && isToolId(item));
  }

  if (typeof value === "string") {
    if (!value.trim()) {
      return [];
    }

    try {
      const parsed = JSON.parse(value) as unknown;
      if (Array.isArray(parsed)) {
        return normalizeCompletedTools(parsed);
      }
    } catch {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(isToolId);
    }
  }

  return [];
}

export function readCompletedTools() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    return normalizeCompletedTools(window.localStorage.getItem(COMPLETED_TOOLS_STORAGE_KEY));
  } catch {
    return [];
  }
}

export function markToolCompleted(toolId: ToolId) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const next = Array.from(new Set([...readCompletedTools(), toolId]));
    window.localStorage.setItem(COMPLETED_TOOLS_STORAGE_KEY, JSON.stringify(next));
    document.cookie = `${COMPLETED_TOOLS_COOKIE}=1; path=/; max-age=31536000; samesite=lax`;
    window.dispatchEvent(new Event(COMPLETED_TOOLS_EVENT));
  } catch {
    // Ignore storage failures.
  }
}

function subscribe(callback: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleStorage = () => callback();
  window.addEventListener(COMPLETED_TOOLS_EVENT, handleStorage);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(COMPLETED_TOOLS_EVENT, handleStorage);
    window.removeEventListener("storage", handleStorage);
  };
}

function getSnapshot() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage.getItem(COMPLETED_TOOLS_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function useCompletedTools() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, () => null);

  return useMemo(() => normalizeCompletedTools(snapshot), [snapshot]);
}

export function useMarkCompletedTool(toolId: ToolId, enabled = true) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    markToolCompleted(toolId);
  }, [enabled, toolId]);
}
