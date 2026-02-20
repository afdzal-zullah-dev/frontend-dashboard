"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  getCurrentUser,
  getToken,
  clearAuth,
  AuthUser,
} from "../(_lib)/apiClient";

export default function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const token = getToken();
    const u = getCurrentUser();

    if (!token || !u) {
      clearAuth();
      router.replace("/login");
      return;
    }

    setUser(u);
  }, [router]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  const navItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Documents", href: "/documents" },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col">
        {/* Brand */}
        <div className="px-5 py-4 border-b border-slate-800">
          <div className="text-lg font-semibold">AK Optima Sdn Bhd</div>
          <div className="text-xs text-slate-400">
            Employee Document Portal
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                  active
                    ? "bg-slate-800 text-white"
                    : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User panel + Logout (lebih jelas) */}
        <div className="mt-auto px-4 py-5 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-sky-600 flex items-center justify-center text-white text-sm font-semibold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-medium text-white">
                {user.name}
              </div>
              <div className="text-xs text-slate-400 capitalize">
                {user.role}
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              clearAuth();
              router.replace("/login");
            }}
            className="mt-4 w-full text-center rounded-lg bg-red-600 py-2 text-xs font-medium text-white hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1">
        {/* top bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
          <div className="text-sm text-slate-500">
            Logged in as{" "}
            <span className="font-medium text-slate-800">{user.name}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-sky-100 text-sky-700">
              {user.role.toUpperCase()}
            </span>

            <button
              onClick={() => {
                clearAuth();
                router.replace("/login");
              }}
              className="text-xs font-medium text-slate-600 border border-slate-300 rounded-lg px-3 py-1.5 hover:bg-slate-50"
            >
              Logout
            </button>
          </div>
        </header>

        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}