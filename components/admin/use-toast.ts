"use client";

import { createContext, useContext } from "react";

export type ToastKind = "success" | "error" | "info";

export type Toast = {
  id?: string;
  kind: ToastKind;
  message: string;
};

export type ActionResult = {
  ok: boolean;
  message: string;
} | null;

type ToastContextValue = {
  push: (t: Toast) => void;
};

export const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return { push: () => {} } satisfies ToastContextValue;
  }
  return ctx;
}
