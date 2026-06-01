"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export type SidebarState = "open" | "collapsed";

export async function toggleSidebar() {
  const jar = await cookies();
  const current = (jar.get("admin_sidebar")?.value as SidebarState) || "open";
  const next: SidebarState = current === "open" ? "collapsed" : "open";
  jar.set("admin_sidebar", next, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  revalidatePath("/admin", "layout");
}

export async function getSidebarState(): Promise<SidebarState> {
  const jar = await cookies();
  return (jar.get("admin_sidebar")?.value as SidebarState) || "open";
}
