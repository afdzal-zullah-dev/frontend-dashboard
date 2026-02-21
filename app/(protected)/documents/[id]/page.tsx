
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getToken,
  getCurrentUser,
  AuthUser,
} from "../../../(_lib)/apiClient";

type DocumentItem = {
  id: number;
  title: string;
  description?: string | null;
  access_level: "public" | "department" | "private";
  file_type?: string | null;
  file_size?: number | null;
  created_at?: string;
  category?: { id: number; title?: string; name?: string } | null;
  department?: { id: number; name: string } | null;
  uploader?: { id: number; name: string } | null;
};

type PageProps = {
  params: { id: string };
};

export default function DocumentDetailPage({ params }: PageProps) {
  const { id } = params; // <-- ini akan ada, takkan undefined
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [doc, setDoc] = useState<DocumentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getToken();
    const u = getCurrentUser();

    if (!token || !u) {
      router.push("/login");
      return;
    }

    setUser(u);

    const fetchDoc = async () => {
      try {
        const baseUrl =
          process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

        const res = await fetch(`${baseUrl}/api/v1/documents/${id}`, {
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

        const d = (json.data ?? json) as DocumentItem;
        setDoc(d);
      } catch (err) {
        console.error(err);
        setError("Gagal memuatkan dokumen.");
      } finally {
        setLoading(false);
      }
    };

    fetchDoc();
  }, [id, router]);

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
    return d.toLocaleString();
  };

  const handleDownload = async () => {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
    const url = `${baseUrl}/api/v1/documents/${id}/download?token=${encodeURIComponent(
      token
    )}`;

    window.open(url, "_blank");
  };

  return (
    <div className="p-6">
      <Link
        href="/documents"
        className="text-sm text-blue-600 hover:underline"
      >
        ← Back to Documents
      </Link>

      <h1 className="text-xl font-semibold mt-4 mb-4">Document Detail</h1>

      {error && <p className="text-red-600 mb-3">{error}</p>}
      {loading && <p>Loading...</p>}

      {!loading && doc && (
        <div className="max-w-xl space-y-3">
          <div>
            <div className="text-xs text-gray-500">Title</div>
            <div className="font-semibold">{doc.title}</div>
          </div>

          {doc.description && (
            <div>
              <div className="text-xs text-gray-500">Description</div>
              <div>{doc.description}</div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-500">Department</div>
              <div>{doc.department?.name ?? "-"}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Category</div>
              <div>
                {doc.category?.name ?? doc.category?.title ?? "-"}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Access</div>
              <div className="uppercase text-xs font-semibold">
                {doc.access_level}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Type / Size</div>
              <div>{doc.file_type ?? "-"}</div>
              <div className="text-xs text-gray-500">
                {formatSize(doc.file_size)}
              </div>
            </div>
          </div>

          <div>
            <div className="text-xs text-gray-500">Uploaded By</div>
            <div>{doc.uploader?.name ?? "-"}</div>
          </div>

          <div>
            <div className="text-xs text-gray-500">Created At</div>
            <div>{formatDate(doc.created_at)}</div>
          </div>

          <button
            type="button"
            onClick={handleDownload}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
          >
            Download File
          </button>
        </div>
      )}
    </div>
  );
}