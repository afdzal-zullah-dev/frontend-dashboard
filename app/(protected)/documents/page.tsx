"use client";

import { useEffect, useState } from "react";
import { getDocuments, DocumentItem } from "../../(_lib)/apiClient";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const loadDocuments = async (searchTerm?: string) => {
    setIsLoading(true);
    setError("");
    try {
      const items = await getDocuments(
        searchTerm ? { search: searchTerm } : undefined
      );
      setDocuments(items);
    } catch (err: any) {
      setError(err.message || "Gagal memuatkan senarai dokumen.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // load kali pertama
    loadDocuments();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadDocuments(search);
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return "0 KB";
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  const formatDate = (value?: string) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Documents</h1>
          <p className="text-sm text-slate-500">
            Senarai dokumen yang anda boleh akses.
          </p>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
          onClick={() => alert("sorry under maintenance")}
        >
          + Upload Document
        </button>
      </div>

      {/* Search bar */}
      <form
        onSubmit={handleSearchSubmit}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col md:flex-row md:items-center gap-3"
      >
        <div className="flex-1">
          <label className="block text-xs font-medium text-slate-500 mb-1">
            Search
          </label>
          <input
            type="text"
            placeholder="Cari ikut title atau description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
          >
            Search
          </button>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              loadDocuments();
            }}
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Reset
          </button>
        </div>
      </form>

      {/* Error / loading */}
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 px-4 py-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">
            Documents List
          </h2>
          <span className="text-xs text-slate-500">
            {isLoading
              ? "Loading..."
              : `${documents.length} document${
                  documents.length !== 1 ? "s" : ""
                }`}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-2">Title</th>
                <th className="px-4 py-2">Department</th>
                <th className="px-4 py-2">Category</th>
                <th className="px-4 py-2">Access</th>
                <th className="px-4 py-2">Type / Size</th>
                <th className="px-4 py-2">Uploaded By</th>
                <th className="px-4 py-2">Created</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.length === 0 && !isLoading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-6 text-center text-sm text-slate-500"
                  >
                    Tiada dokumen ditemui.
                  </td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr
                    key={doc.id}
                    className="border-t border-slate-100 hover:bg-slate-50/70"
                  >
                    <td className="px-4 py-2 align-top">
                      <div className="font-medium text-slate-800">
                        {doc.title}
                      </div>
                      {doc.description && (
                        <div className="text-xs text-slate-500 line-clamp-2">
                          {doc.description}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2 align-top text-xs text-slate-600">
                      {doc.department?.name || "-"}
                    </td>
                    <td className="px-4 py-2 align-top text-xs text-slate-600">
                      {doc.category?.title || "-"}
                    </td>
                    <td className="px-4 py-2 align-top">
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium uppercase text-slate-700">
                        {doc.access_level}
                      </span>
                    </td>
                    <td className="px-4 py-2 align-top text-xs text-slate-600">
                      <div>{doc.file_type}</div>
                      <div className="text-slate-400">
                        {formatSize(doc.file_size)}
                      </div>
                    </td>
                    <td className="px-4 py-2 align-top text-xs text-slate-600">
                      {doc.uploaded_by_user?.name || "-"}
                    </td>
                    <td className="px-4 py-2 align-top text-xs text-slate-600">
                      {formatDate(doc.created_at)}
                    </td>
                    <td className="px-4 py-2 align-top text-right text-xs">
                      <button
                        type="button"
                        className="rounded-lg border border-slate-300 px-2.5 py-1 hover:bg-slate-50 mr-1"
                        onClick={() =>
                          alert(`View detail doc ID ${doc.id} (coming soon)`)
                        }
                      >
                        View
                      </button>
                      <button
                        type="button"
                        className="rounded-lg border border-slate-300 px-2.5 py-1 hover:bg-slate-50"
                        onClick={() =>
                          alert(`Edit doc ID ${doc.id} (coming soon)`)
                        }
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}