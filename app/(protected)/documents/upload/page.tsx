"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type SelectOption = {
  id: number;
  name?: string; // untuk department
  title?: string; // untuk category
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000/api";

export default function UploadDocumentPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [accessLevel, setAccessLevel] = useState("public");
  const [file, setFile] = useState<File | null>(null);

  const [categories, setCategories] = useState<SelectOption[]>([]);
  const [departments, setDepartments] = useState<SelectOption[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Fetch categories & departments once
  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const fetchOptions = async () => {
      try {
        const [catRes, depRes] = await Promise.all([
          fetch(`${API_BASE_URL}/document-categories`, {
            headers: {
              Accept: "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }),
          fetch(`${API_BASE_URL}/departments`, {
            headers: {
              Accept: "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }),
        ]);

        const catData = await catRes.json();
        const depData = await depRes.json();

        setCategories(catData.data ?? catData);
        setDepartments(depData.data ?? depData);
      } catch (err) {
        console.error(err);
      }
    };

    fetchOptions();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!file) {
      setError("Sila pilih fail sebelum upload.");
      return;
    }

    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (!token) {
      setError("Token tidak ditemui. Sila login semula.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    if (description) formData.append("description", description);
    formData.append("category_id", categoryId);
    formData.append("department_id", departmentId);
    formData.append("access_level", accessLevel);
    formData.append("file", file);

    try {
      setSubmitting(true);

      const res = await fetch(`${API_BASE_URL}/documents`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          // NOTE: JANGAN set "Content-Type" sendiri, biar browser handle (multipart boundary)
        },
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const msg =
          data?.message ||
          `Gagal upload document (status ${res.status}). Sila semak validation.`;
        throw new Error(msg);
      }

      const data = await res.json();
      const created = data.data ?? data;

      setSuccessMsg("Dokumen berjaya diupload.");
      // Clear form
      setTitle("");
      setDescription("");
      setCategoryId("");
      setDepartmentId("");
      setAccessLevel("public");
      setFile(null);

      // Optional: redirect ke detail page
      if (created?.id) {
        setTimeout(() => {
          router.push(`/documents/${created.id}`);
        }, 800);
      } else {
        setTimeout(() => {
          router.push("/documents");
        }, 800);
      }
    } catch (err: any) {
      setError(err.message || "Ralat tidak diketahui.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide">
            Documents
          </p>
          <h1 className="text-2xl font-semibold">Upload Document</h1>
        </div>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border px-3 py-1 text-sm hover:bg-gray-50"
        >
          ← Kembali
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-xl border bg-white p-5 shadow-sm"
      >
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
            {successMsg}
          </div>
        )}

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              <option value="">-- Pilih Category --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title ?? c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Department <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              required
            >
              <option value="">-- Pilih Department --</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name ?? d.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
            Access Level <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={accessLevel}
            onChange={(e) => setAccessLevel(e.target.value)}
            required
          >
            <option value="public">Public</option>
            <option value="department">Department</option>
            <option value="restricted">Restricted</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
            File <span className="text-red-500">*</span>
          </label>
          <input
            type="file"
            className="w-full text-sm"
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null;
              setFile(f);
            }}
            required
          />
          <p className="text-xs text-gray-500">
            Max 10MB. Types: PDF, DOCX, XLSX, JPG, PNG (ikut validation backend
            kau).
          </p>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => router.push("/documents")}
            className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Uploading..." : "Upload"}
          </button>
        </div>
      </form>
    </div>
  );
}