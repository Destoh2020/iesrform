"use client";

import { useState, useEffect } from "react";
import ApplicationForm from "@/components/ApplicationForm";
import FormClosedBanner from "@/components/FormClosedBanner";
import { formStatusApi } from "@/lib/api";
import type { FormStatus } from "@/types";

export default function Home() {
  const [formStatus, setFormStatus] = useState<FormStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkFormStatus();
  }, []);

  const checkFormStatus = async () => {
    try {
      const status = await formStatusApi.get();
      setFormStatus(status);
    } catch (error) {
      console.error("Failed to check form status:", error);
    } finally {
      setLoading(false);
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

  if (!formStatus?.is_open) {
    return <FormClosedBanner />;
  }

  return <ApplicationForm />;
}
