"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type DocumentItem = {
  id: number;
  title: string;
  description: string | null;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  category: {
    id: number;
    title: string;
  } | null;
  department: {
    id: number;
    name: string;
  } | null;
  uploaded_by_user: {
    id: number;
    name: string;
    email: string;
  } | null;
  access_level: string;
  download_count: number;
  created_at: string;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000/api";

export default function DocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [doc, setDoc] = useState<DocumentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchDoc = async () => {
      try {
        setLoading(true);
        setError(null);

        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("token")
            : null;

        const res = await fetch(`${API_BASE_URL}/documents/${id}`, {
          headers: {
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!res.ok) {
          throw new Error(`Gagal dapatkan document (status ${res.status})`);
        }

        const data = await res.json();
        // Kalau API balas { data: { ... } } tukar kat sini:
        const docData = data.data ?? data;

        setDoc(docData);
      } catch (err: any) {
        setError(err.message || "Ralat tidak diketahui");
      } finally {
        setLoading(false);
      }
    };

    fetchDoc();
  }, [id]);

  const handleDownload = () => {
    if (!doc) return;

    // Kalau backend ada endpoint khas download, tukar URL kat sini
    const downloadUrl =
      doc.file_path.startsWith("http") || doc.file_path.startsWith("/")
        ? doc.file_path
        : `${API_BASE_URL}/storage/${doc.file_path}`;

    window.open(downloadUrl, "_blank");
  };

  if (loading) {
    return (
      <div className="p-6">
        <p className="animate-pulse text-gray-500">Loading document...</p>
      </div>
    );
  }

  if (error || !doc) {
    return (
      <div className="p-6">
        <button
          onClick={() => router.back()}
          className="mb-4 rounded-md border px-3 py-1 text-sm hover:bg-gray-50"
        >
          ← Kembali
        </button>
        <p className="text-red-600">
          {error || "Dokumen tidak ditemui atau tiada akses."}
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb + Back */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs text-gray-400 uppercase tracking-wide">
            Documents
          </p>
          <h1 className="text-2xl font-semibold">{doc.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="rounded-md border px-3 py-1 text-sm hover:bg-gray-50"
          >
            ← Kembali
          </button>
          <button
            onClick={handleDownload}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Download
          </button>
        </div>
      </div>

      {/* Overview card */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-white p-4 shadow-sm md:col-span-2">
          <h2 className="mb-2 text-sm font-semibold text-gray-700">
            Description
          </h2>
          <p className="text-sm text-gray-700">
            {doc.description || "Tiada description."}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">Document Info</h2>

          <div className="text-xs text-gray-500 space-y-1">
            <p>
              <span className="font-medium text-gray-700">File name:</span>{" "}
              {doc.file_name}
            </p>
            <p>
              <span className="font-medium text-gray-700">Type:</span>{" "}
              {doc.file_type}
            </p>
            <p>
              <span className="font-medium text-gray-700">Size:</span>{" "}
              {(doc.file_size / 1024).toFixed(1)} KB
            </p>
            <p>
              <span className="font-medium text-gray-700">Category:</span>{" "}
              {doc.category?.title ?? "-"}
            </p>
            <p>
              <span className="font-medium text-gray-700">Department:</span>{" "}
              {doc.department?.name ?? "-"}
            </p>
            <p>
              <span className="font-medium text-gray-700">Access level:</span>{" "}
              <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium uppercase">
                {doc.access_level}
              </span>
            </p>
            <p>
              <span className="font-medium text-gray-700">Uploaded by:</span>{" "}
              {doc.uploaded_by_user?.name ?? "-"}
            </p>
            <p>
              <span className="font-medium text-gray-700">Downloads:</span>{" "}
              {doc.download_count}
            </p>
            <p>
              <span className="font-medium text-gray-700">Created at:</span>{" "}
              {new Date(doc.created_at).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}