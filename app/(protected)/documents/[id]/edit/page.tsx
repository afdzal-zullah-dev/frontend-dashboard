"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getToken } from "@/app/(_lib)/apiClient";

type Category = {
  id: number | string;
  title: string;
};

type Department = {
  id: number | string;
  name: string;
};

export default function EditDocumentPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category_id: "",
    department_id: "",
    access_level: "public",
  });

  // Helper untuk pastikan dapat array
  const extractArray = (raw: any) => {
    if (Array.isArray(raw)) return raw;
    if (raw && Array.isArray(raw.data)) return raw.data;
    if (raw && raw.data && Array.isArray(raw.data.data)) return raw.data.data;
    return [];
  };

  useEffect(() => {
    const token = getToken();
    const baseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [docRes, catRes, depRes] = await Promise.all([
          fetch(`${baseUrl}/api/v1/documents/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }),
          fetch(`${baseUrl}/api/v1/document-categories`, {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }),
          fetch(`${baseUrl}/api/v1/departments`, {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }),
        ]);

        if (!docRes.ok) throw new Error("Failed to load document");

        const docData = await docRes.json();
        const catData = await catRes.json();
        const depData = await depRes.json();

        setCategories(extractArray(catData));
        setDepartments(extractArray(depData));

        const doc = docData.data ?? docData;

        setForm({
          title: doc.title ?? "",
          description: doc.description ?? "",
          category_id: doc.category_id?.toString() ?? "",
          department_id: doc.department_id?.toString() ?? "",
          access_level: doc.access_level ?? "public",
        });
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = getToken();
    const baseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

    try {
      setLoading(true);
      setError("");

      const formData = new FormData();
      formData.append("_method", "PUT");
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("category_id", form.category_id);
      formData.append("department_id", form.department_id);
      formData.append("access_level", form.access_level);

      const res = await fetch(`${baseUrl}/api/v1/documents/${id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Update failed");
      }

      router.push(`/documents/${id}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  // 🔽 Download file
  const handleDownload = async () => {
    const token = getToken();
    const baseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

    try {
      setError("");

      // ikut naming typical API: /documents/{id}/download
      const res = await fetch(
        `${baseUrl}/api/v1/documents/${id}/download`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Download failed");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = form.title || `document-${id}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Download failed");
    }
  };

  // 🗑 Delete document
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    const token = getToken();
    const baseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${baseUrl}/api/v1/documents/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Delete failed");
      }

      // lepas delete, balik ke senarai dokumen
      router.push("/documents");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (error)
    return (
      <div className="p-6">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Retry
        </button>
      </div>
    );

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-2xl font-bold mb-4">Edit Document</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Title</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-1">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block mb-1">Category</label>
          <select
            name="category_id"
            value={form.category_id}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">Select Category</option>
            {Array.isArray(categories) &&
              categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.title}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="block mb-1">Department</label>
          <select
            name="department_id"
            value={form.department_id}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">Select Department</option>
            {Array.isArray(departments) &&
              departments.map((dep) => (
                <option key={dep.id} value={dep.id}>
                  {dep.name}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="block mb-1">Access Level</label>
          <select
            name="access_level"
            value={form.access_level}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="public">Public</option>
            <option value="department">Department</option>
            <option value="private">Private</option>
          </select>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Update Document
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Download
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Delete
          </button>
        </div>
      </form>
    </div>
  );
}