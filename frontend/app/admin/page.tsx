"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formStatusApi, applicationsApi } from "@/lib/api";
import type { FormStatus, Application } from "@/types";
// import Notification from "@/components/Notification";

import Swal from "sweetalert2";

export default function AdminPanel() {
  const router = useRouter();
  const [formStatus, setFormStatus] = useState<FormStatus | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Check auth first
    const token = sessionStorage.getItem("adminPassword");
    if (!token) {
      router.push("/admin/login");
      return;
    }
    loadData();
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("adminPassword");
    router.push("/admin/login");
  };

  const loadData = async () => {
    try {
      const [status, apps] = await Promise.all([
        formStatusApi.get(),
        applicationsApi.getAll(),
      ]);
      setFormStatus(status);
      setApplications(apps);
    } catch (error: any) {
      if (error.response?.status === 401) {
        router.push("/admin/login");
      } else {
        showNotification("error", "Failed to load data");
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = applications.filter((app) => {
    const query = searchQuery.toLowerCase();
    return (
      app.first_name.toLowerCase().includes(query) ||
      app.last_name.toLowerCase().includes(query) ||
      app.staff_number.toLowerCase().includes(query) ||
      (app.email || "").toLowerCase().includes(query)
    );
  });

  const showNotification = (
    type: "success" | "error" | "info",
    message: string
  ) => {
    Swal.fire({
      icon: type,
      title: type.charAt(0).toUpperCase() + type.slice(1),
      text: message,
      timer: 3000,
      showConfirmButton: false,
      background: "#1a1a1a",
      color: "#ffffff",
    });
  };

  const toggleFormStatus = async () => {
    if (!formStatus) return;

    setUpdating(true);
    try {
      const newStatus = await formStatusApi.update({
        is_open: !formStatus.is_open,
        updated_by: "Admin",
      });
      setFormStatus(newStatus);
      showNotification(
        "success",
        `Form ${newStatus.is_open ? "opened" : "closed"} successfully`
      );
    } catch (error) {
      showNotification("error", "Failed to update form status");
    } finally {
      setUpdating(false);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await applicationsApi.export();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "applications.csv";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showNotification("success", "Applications exported successfully");
    } catch (error) {
      showNotification("error", "Failed to export applications");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-effect rounded-2xl p-8">
          <div className="flex items-center gap-3">
            <svg
              className="animate-spin h-8 w-8 text-primary-500"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="text-white text-lg">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 py-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold text-gray-900">Admin Panel</h1>
            <div className="flex gap-4">
              <button
                onClick={handleLogout}
                className="text-red-500 hover:text-red-600 font-semibold px-4 py-2"
              >
                Logout
              </button>
              <button
                onClick={handleExport}
                className="btn-secondary flex items-center gap-2"
                disabled={applications.length === 0}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Export CSV
              </button>
              <Link href="/" className="btn-secondary">
                ← Back to Form
              </Link>
            </div>
          </div>
          <p className="text-gray-600">
            Manage application form and view submissions
          </p>
        </div>

        {/* Form Status Control */}
        <div className="glass-effect rounded-2xl p-6 mb-8 animate-slide-up">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Form Status</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-700 mb-2">
                Current Status:
                <span
                  className={`ml-2 font-bold ${
                    formStatus?.is_open ? "text-accent-400" : "text-red-400"
                  }`}
                >
                  {formStatus?.is_open ? "OPEN" : "CLOSED"}
                </span>
              </p>
              <p className="text-gray-500 text-sm">
                Last updated:{" "}
                {formStatus?.updated_at
                  ? new Date(formStatus.updated_at).toLocaleString()
                  : "N/A"}
              </p>
            </div>
            <button
              onClick={toggleFormStatus}
              disabled={updating}
              className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 ${
                formStatus?.is_open
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
              } disabled:opacity-50`}
            >
              {updating
                ? "Updating..."
                : formStatus?.is_open
                ? "Close Form"
                : "Open Form"}
            </button>
          </div>
        </div>

        {/* Applications List */}
        <div
          className="glass-effect rounded-2xl p-6 animate-slide-up"
          style={{ animationDelay: "0.1s" }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Applications</h2>

            <div className="flex flex-col md:flex-row gap-4 items-center">
              {/* Search Bar */}
              <div className="relative w-full md:w-64">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search applicants..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                />
                <svg
                  className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              <div className="bg-primary-100 px-4 py-2 rounded-lg whitespace-nowrap">
                <span className="text-primary-700 font-semibold">
                  Total: {filteredApplications.length}
                </span>
              </div>
            </div>
          </div>

          {filteredApplications.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">
                {searchQuery
                  ? "No matching applications found"
                  : "No applications submitted yet"}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">
                      Staff #
                    </th>
                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">
                      First Name
                    </th>
                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">
                      Last Name
                    </th>
                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">
                      Email
                    </th>
                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">
                      Designation
                    </th>
                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">
                      Division
                    </th>
                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">
                      Course
                    </th>
                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">
                      Category
                    </th>
                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">
                      Mode
                    </th>
                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.map((app, index) => (
                    <tr
                      key={app.id}
                      className="border-b border-gray-200 hover:bg-white/50 transition-colors"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <td className="py-3 px-4 text-gray-900 font-mono">
                        {app.staff_number}
                      </td>
                      <td className="py-3 px-4 text-gray-900">
                        {app.first_name}
                      </td>
                      <td className="py-3 px-4 text-gray-900">
                        {app.last_name}
                      </td>
                      <td className="py-3 px-4 text-gray-600 font-mono text-sm">
                        {app.email || "-"}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {app.designation}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {app.division}
                      </td>
                      <td className="py-3 px-4 text-gray-900">
                        {app.course.name}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            app.course_category === "short_professional"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-purple-100 text-purple-700"
                          }`}
                        >
                          {app.course_category === "short_professional"
                            ? "Short Prof."
                            : "Academic"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-accent-100 text-accent-700">
                          {app.mode_of_study}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-500 text-sm">
                        {new Date(app.application_date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
