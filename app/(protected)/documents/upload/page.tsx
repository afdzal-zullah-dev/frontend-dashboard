
"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getToken,
  getCurrentUser,
  AuthUser,
} from "../../../(_lib)/apiClient";

// --------- Hardcoded options ---------

const CATEGORY_OPTIONS = [
  { id: 1, label: "1 - Policy" },
  { id: 2, label: "2 - Report" },
  { id: 3, label: "3 - Template" },
  { id: 4, label: "4 - Guide" },
  { id: 5, label: "5 - Form" },
  { id: 6, label: "6 - Other" },
];

const DEPARTMENT_OPTIONS = [
  { id: 1, label: "1 - Human Resources (HR)" },
  { id: 2, label: "2 - Finance" },
  { id: 3, label: "3 - Information Technology (IT)" },
  { id: 4, label: "4 - Marketing" },
  { id: 5, label: "5 - Operations" },
];

export default function UploadDocumentPage() {
  const router = useRouter();

  const [user, setUser] = useState<AuthUser | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [departmentId, setDepartmentId] = useState<string>("");
  const [accessLevel, setAccessLevel] = useState<
    "public" | "department" | "private"
  >("public");
  const [file, setFile] = useState<File | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // ---------- Auth check ----------
  useEffect(() => {
    const token = getToken();
    const u = getCurrentUser();

    if (!token || !u) {
      router.push("/login");
      return;
    }

    setUser(u);
  }, [router]);

  // ---------- Submit handler ----------
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const token = getToken();
    if (!token) {
      setError("Token tak jumpa. Sila login semula.");
      return;
    }

    if (!file) {
      setError("Sila pilih fail sebelum upload.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("category_id", categoryId);
      formData.append("department_id", departmentId);
      formData.append("access_level", accessLevel);
      formData.append("file", file);

      const baseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

      const res = await fetch(`${baseUrl}/api/v1/documents`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // JANGAN set Content-Type, FormData akan set sendiri
        },
        body: formData,
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        // kalau bukan JSON, biarkan
      }

      console.log("Upload status:", res.status, data);

      if (!res.ok) {
        if (data && data.errors) {
          const firstField = Object.keys(data.errors)[0];
          const firstMsg = data.errors[firstField][0];
          setError(firstMsg);
        } else if (data && data.message) {
          setError(data.message);
        } else {
          setError("Upload gagal. Sila cuba lagi.");
        }
        return;
      }

      // success
      setSuccess("Dokumen berjaya diupload.");
      setTitle("");
      setDescription("");
      setCategoryId("");
      setDepartmentId("");
      setAccessLevel("public");
      setFile(null);
    } catch (err) {
      console.error(err);
      setError("Upload gagal. Sila cuba lagi.");
    } finally {
      setLoading(false);
    }
  };

  // ---------- UI ----------
  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-semibold mb-4">Upload Document</h1>

      {error && <p className="text-red-600 mb-3">{error}</p>}
      {success && <p className="text-green-600 mb-3">{success}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Description
          </label>
          <textarea
            className="w-full border rounded px-3 py-2"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Category + Department */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Category
            </label>
            <select
              className="w-full border rounded px-3 py-2"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              <option value="">-- Pilih Category --</option>
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Department
            </label>
            <select
              className="w-full border rounded px-3 py-2"
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              required
            >
              <option value="">-- Pilih Department --</option>
              {DEPARTMENT_OPTIONS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Access level */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Access Level
          </label>
          <select
            className="w-full border rounded px-3 py-2"
            value={accessLevel}
            onChange={(e) =>
              setAccessLevel(
                e.target.value as "public" | "department" | "private"
              )
            }
            required
          >
            <option value="public">Public</option>
            <option value="department">Department</option>
            <option value="private">Private</option>
          </select>
        </div>

        {/* File */}
        <div>
          <label className="block text-sm font-medium mb-1">
            File{" "}
            <span className="text-xs text-gray-500">
              (Max 10MB. PDF, DOCX, XLSX, JPG, PNG)
            </span>
          </label>
          <input
            type="file"
            className="w-full"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            required
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded disabled:opacity-60"
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </form>
    </div>
  );
}