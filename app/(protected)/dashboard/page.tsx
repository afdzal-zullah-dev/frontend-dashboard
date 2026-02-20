"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getDocuments,
  DocumentItem,
  getCurrentUser,
  AuthUser,
} from "../../(_lib)/apiClient";

export default function DashboardPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Ambil user dari localStorage
  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  // Load dokumen dari API
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError("");
      try {
        const items = await getDocuments();
        setDocuments(items);
      } catch (err: any) {
        setError(err.message || "Gagal memuatkan dokumen.");
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  // Kira statistik
  const stats = useMemo(() => {
    if (!user) {
      return {
        total: 0,
        department: 0,
        myUploads: 0,
        recent: [] as DocumentItem[],
      };
    }

    const total = documents.length;

    const department = documents.filter(
      (d) => d.department?.id === user.department_id
    ).length;

    const myUploads = documents.filter(
      (d) => d.uploaded_by_user?.id === user.id
    ).length;

    // ambik 5 terbaru
    const recent = [...documents]
      .sort((a, b) => {
        if (a.created_at && b.created_at) {
          return (
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
          );
        }
        return (b.id || 0) - (a.id || 0);
      })
      .slice(0, 5);

    return { total, department, myUploads, recent };
  }, [documents, user]);

  const formatDate = (value?: string) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-500">
          Ringkasan dokumen dan aktiviti sistem.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <p className="text-xs font-medium text-slate-400 uppercase">
            Total Documents
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-800">
            {isLoading ? "…" : stats.total}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Semua dokumen yang boleh diakses.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <p className="text-xs font-medium text-slate-400 uppercase">
            Department Documents
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-800">
            {isLoading ? "…" : stats.department}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Dokumen khusus department anda.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <p className="text-xs font-medium text-slate-400 uppercase">
            My Uploads
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-800">
            {isLoading ? "…" : stats.myUploads}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Dokumen yang anda sendiri upload.
          </p>
        </div>
      </div>

      {/* Recent documents */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-800">
            Recent Documents
          </h2>
          <button
            type="button"
            onClick={() => (window.location.href = "/documents")}
            className="text-xs text-sky-600 cursor-pointer hover:underline"
          >
            View all
          </button>
        </div>

        {isLoading && (
          <p className="text-xs text-slate-500">Loading recent documents…</p>
        )}

        {!isLoading && stats.recent.length === 0 && (
          <p className="text-xs text-slate-500">
            Tiada dokumen untuk dipaparkan.
          </p>
        )}

        {!isLoading && stats.recent.length > 0 && (
          <ul className="divide-y divide-slate-100">
            {stats.recent.map((doc) => (
              <li
                key={doc.id}
                className="py-2 flex items-center justify-between"
              >
                <div>
                  <div className="text-sm font-medium text-slate-800">
                    {doc.title}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {doc.category?.title || "No category"} •{" "}
                    {formatDate(doc.created_at)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => (window.location.href = "/documents")}
                  className="text-[11px] text-sky-600 hover:underline"
                >
                  View
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}