"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getToken,
  getCurrentUser,
  AuthUser,
} from "../../(_lib)/apiClient";

type DocumentItem = {
  id: number;
  title: string;
  description?: string | null;
  access_level: "public" | "department" | "private";
  file_type?: string | null;
  file_size?: number | null;
  created_at?: string;
  category?: {
    id: number;
    title?: string;
    name?: string;
  } | null;
  department?: {
    id: number;
    name: string;
  } | null;
  uploader?: {
    id: number;
    name: string;
  } | null;
};

export default function DocumentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  useEffect(() => {
    const token = getToken();
    const u = getCurrentUser();

    if (!token || !u) {
      router.push("/login");
      return;
    }

    setUser(u);

    const fetchDocs = async () => {
      try {
        const baseUrl =
          process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

        const res = await fetch(`${baseUrl}/api/v1/documents`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        const json = await res.json();
        if (!res.ok) {
          setError(json.message ?? "Gagal memuatkan dokumen.");
          return;
        }

        const docs = (json.data ?? json) as DocumentItem[];
        setDocuments(docs);
      } catch (err) {
        console.error(err);
        setError("Gagal memuatkan dokumen.");
      } finally {
        setLoading(false);
      }
    };

    fetchDocs();
  }, [router]);

  const filteredDocuments = useMemo(() => {
    if (!search.trim()) return documents;

    const term = search.toLowerCase();
    return documents.filter((doc) => {
      const title = doc.title?.toLowerCase() ?? "";
      const desc = doc.description?.toLowerCase() ?? "";
      return title.includes(term) || desc.includes(term);
    });
  }, [documents, search]);

  const formatSize = (bytes?: number | null) => {
    if (!bytes || bytes <= 0) return "-";
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(2)} MB`;
  };

  const formatDate = (iso?: string) => {
    if (!iso) return "-";
    const d = new Date(iso);
    return d.toLocaleDateString();
  };

  return (
    <div className="p-6">
      {/* HEADER + BUTTON HIJAU */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Documents List</h1>
        <Link
          href="/documents/upload"
          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
        >
          + Upload Document
        </Link>
      </div>

      {/* SEARCH BAR */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by title or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-80 border rounded px-3 py-2 text-sm"
        />
      </div>

      {error && <p className="text-red-600 mb-3">{error}</p>}
      {loading && <p>Loading...</p>}

      {!loading && filteredDocuments.length === 0 && (
        <p className="text-gray-600">Tiada dokumen.</p>
      )}

      {!loading && filteredDocuments.length > 0 && (
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Title</th>
                <th className="px-4 py-2 text-left">Department</th>
                <th className="px-4 py-2 text-left">Category</th>
                <th className="px-4 py-2 text-left">Access</th>
                <th className="px-4 py-2 text-left">Type / Size</th>
                <th className="px-4 py-2 text-left">Uploaded By</th>
                <th className="px-4 py-2 text-left">Created</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.map((doc) => (
                <tr key={doc.id} className="border-t">
                  <td className="px-4 py-2">
                    <div className="font-medium">{doc.title}</div>
                    {doc.description && (
                      <div className="text-xs text-gray-500">
                        {doc.description}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {doc.department?.name ?? "-"}
                  </td>
                  <td className="px-4 py-2">
                    {doc.category?.name ??
                      doc.category?.title ??
                      "-"}
                  </td>
                  <td className="px-4 py-2">
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-gray-700">
                      {doc.access_level.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <div>{doc.file_type ?? "-"}</div>
                    <div className="text-xs text-gray-500">
                      {formatSize(doc.file_size)}
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    {doc.uploader?.name ?? "-"}
                  </td>
                  <td className="px-4 py-2">
                    {formatDate(doc.created_at)}
                  </td>
                  <td className="px-4 py-2 text-right space-x-2">
                    <Link
                      href={`/documents/${doc.id}`}
                      className="border border-gray-300 rounded px-2 py-1 text-xs hover:bg-gray-50"
                    >
                      View
                    </Link>
                    <Link
                      href={`/documents/${doc.id}/edit`}
                      className="border border-gray-300 rounded px-2 py-1 text-xs hover:bg-gray-50"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}