"use client";

import React from "react";

interface FormClosedBannerProps {
  message?: string;
}

export default function FormClosedBanner({ message }: FormClosedBannerProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-effect rounded-2xl p-12 max-w-2xl text-center animate-fade-in">
        <div className="mb-6">
          <div className="w-24 h-24 mx-auto bg-red-500/20 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">
          Application Form Closed
        </h1>
        <p className="text-gray-300 text-lg">
          {message ||
            "The application form is currently not accepting submissions. Please check back later or contact the administrator."}
        </p>
      </div>
    </div>
  );
}
