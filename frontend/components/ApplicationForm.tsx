"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { coursesApi, applicationsApi } from "@/lib/api";
import type {
  Course,
  ApplicationCreate,
  CourseCategoryEnum,
  ModeOfStudyEnum,
} from "@/types";
import Swal from "sweetalert2";

export default function ApplicationForm() {
  const [formData, setFormData] = useState<Partial<ApplicationCreate>>({
    application_date: format(new Date(), "yyyy-MM-dd"),
    course_category: undefined,
    mode_of_study: undefined,
    email: "",
  });

  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isEditing, setIsEditing] = useState(false);

  // Load all courses on mount
  useEffect(() => {
    loadCourses();
  }, []);

  // Filter courses when category changes
  useEffect(() => {
    if (formData.course_category) {
      const filtered = courses.filter(
        (c) => c.category === formData.course_category
      );
      setFilteredCourses(filtered);
      // Reset course selection if current course doesn't match new category
      if (formData.course_id) {
        const currentCourse = courses.find((c) => c.id === formData.course_id);
        if (
          currentCourse &&
          currentCourse.category !== formData.course_category
        ) {
          setFormData((prev) => ({ ...prev, course_id: undefined }));
        }
      }
    } else {
      setFilteredCourses([]);
      setFormData((prev) => ({ ...prev, course_id: undefined }));
    }
  }, [formData.course_category, courses]);

  const loadCourses = async () => {
    try {
      const data = await coursesApi.getAll();
      setCourses(data);
    } catch (error) {
      showNotification(
        "error",
        "Failed to load courses. Please refresh the page."
      );
    }
  };

  const showNotification = (
    type: "success" | "error" | "info",
    message: string
  ) => {
    Swal.fire({
      icon: type,
      title:
        type === "success" ? "Success!" : type === "error" ? "Error!" : "Info",
      text: message,
      timer: 3000,
      showConfirmButton: false,
      background: "#1e1e1e",
      color: "#ffffff",
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.staff_number?.trim()) {
      newErrors.staff_number = "Staff number is required";
    }
    if (!formData.first_name?.trim()) {
      newErrors.first_name = "First name is required";
    }
    if (!formData.last_name?.trim()) {
      newErrors.last_name = "Last name is required";
    }
    if (!formData.designation?.trim()) {
      newErrors.designation = "Designation is required";
    }
    if (!formData.division?.trim()) {
      newErrors.division = "Division is required";
    }
    if (!formData.course_category) {
      newErrors.course_category = "Course category is required";
    }
    if (!formData.course_id) {
      newErrors.course_id = "Please select a course";
    }
    if (!formData.mode_of_study) {
      newErrors.mode_of_study = "Mode of study is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showNotification("error", "Please fill in all required fields");
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      if (isEditing) {
        // Update application
        await applicationsApi.update(
          formData.staff_number!,
          formData as ApplicationCreate
        );
        showNotification("success", "Application updated successfully!");
      } else {
        // Check if staff has already applied
        const validation = await applicationsApi.validateStaffNumber(
          formData.staff_number!
        );
        if (validation.has_applied) {
          // Ask user if they want to edit
          const result = await Swal.fire({
            title: "Already Applied",
            text: `Staff number ${formData.staff_number} has already applied. Do you want to edit the existing application?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Yes, edit it",
            cancelButtonText: "No",
            background: "#1e1e1e",
            color: "#ffffff",
          });

          if (result.isConfirmed) {
            const app = validation.application!;
            setFormData({
              ...app,
              course_id: app.course_id, // Ensure IDs match
            });
            setIsEditing(true);
            setLoading(false);
            return;
          } else {
            showNotification(
              "error",
              `Staff number ${formData.staff_number} has already submitted an application.`
            );
            setLoading(false);
            return;
          }
        }

        // Submit application
        await applicationsApi.submit(formData as ApplicationCreate);
        showNotification("success", "Application submitted successfully!");
      }

      // Reset form if submitted (not just switched to edit mode)
      setFormData({
        application_date: format(new Date(), "yyyy-MM-dd"),
        course_category: undefined,
        mode_of_study: undefined,
      });
      setFilteredCourses([]);
      setIsEditing(false);
    } catch (error) {
      const errorMessage =
        (error as any).response?.data?.detail ||
        `Failed to ${
          isEditing ? "update" : "submit"
        } application. Please try again.`;
      showNotification("error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleStaffNumberBlur = async () => {
    if (!formData.staff_number?.trim()) return;

    try {
      const validation = await applicationsApi.validateStaffNumber(
        formData.staff_number
      );
      if (validation.has_applied) {
        const result = await Swal.fire({
          title: "Already Applied",
          text: `Staff number ${formData.staff_number} has already applied. Do you want to edit the existing application?`,
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Yes, edit it",
          cancelButtonText: "No",
          background: "#1e1e1e",
          color: "#ffffff",
        });

        if (result.isConfirmed) {
          const app = validation.application!;
          setFormData({
            ...app,
            course_id: app.course.id,
          });
          setIsEditing(true);
          // Trigger category change effect to load courses
          if (app.course_category) {
            const filtered = courses.filter(
              (c) => c.category === app.course_category
            );
            setFilteredCourses(filtered);
          }
        }
      }
    } catch {
      // Ignore validation errors on blur (connection issues etc)
    }
  };

  const handleInputChange = (
    field: keyof ApplicationCreate,
    value: string | number | null | undefined
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-[1400px]">
        {/* Header - Compact */}
        <div className="text-center mb-6 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
            Kenya Power Staff Application Form
          </h1>
          <p className="text-gray-600">
            Apply for professional development courses
          </p>
        </div>

        {/* Form - Compact */}
        <form
          onSubmit={handleSubmit}
          className="glass-effect rounded-2xl p-8 lg:p-10 animate-slide-up"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
            {/* Application Date */}
            <div>
              <label className="label-text text-gray-700 text-sm mb-1 block">
                Application Date
              </label>
              <input
                type="date"
                value={formData.application_date}
                readOnly
                disabled
                className="input-field py-2.5 text-base opacity-70 cursor-not-allowed bg-gray-50"
                required
              />
            </div>

            {/* Staff Number */}
            <div>
              <label className="label-text text-gray-700 text-sm mb-1 block">
                Staff Number *
              </label>
              <input
                type="text"
                value={formData.staff_number || ""}
                onChange={(e) =>
                  handleInputChange("staff_number", e.target.value)
                }
                onBlur={handleStaffNumberBlur}
                className={`input-field py-2.5 text-base ${
                  errors.staff_number ? "border-red-500 shadow-sm" : ""
                }`}
                placeholder="Enter staff number"
                required
              />
              {errors.staff_number && (
                <p className="error-text text-xs mt-1 text-red-500">
                  {errors.staff_number}
                </p>
              )}
            </div>

            {/* First Name */}
            <div>
              <label className="label-text text-gray-700 text-sm mb-1 block">
                First Name *
              </label>
              <input
                type="text"
                value={formData.first_name || ""}
                onChange={(e) =>
                  handleInputChange("first_name", e.target.value)
                }
                className={`input-field py-2.5 text-base ${
                  errors.first_name ? "border-red-500 shadow-sm" : ""
                }`}
                placeholder="Enter first name"
                required
              />
              {errors.first_name && (
                <p className="error-text text-xs mt-1 text-red-500">
                  {errors.first_name}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="label-text text-gray-700 text-sm mb-1 block">
                Last Name *
              </label>
              <input
                type="text"
                value={formData.last_name || ""}
                onChange={(e) => handleInputChange("last_name", e.target.value)}
                className={`input-field py-2.5 text-base ${
                  errors.last_name ? "border-red-500 shadow-sm" : ""
                }`}
                placeholder="Enter last name"
                required
              />
              {errors.last_name && (
                <p className="error-text text-xs mt-1 text-red-500">
                  {errors.last_name}
                </p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label className="label-text text-gray-700 text-sm mb-1 block">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email || ""}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={`input-field py-2.5 text-base ${
                  errors.email ? "border-red-500 shadow-sm" : ""
                }`}
                placeholder="Enter email address"
              />
              {errors.email && (
                <p className="error-text text-xs mt-1 text-red-500">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Designation */}
            <div>
              <label className="label-text text-gray-700 text-sm mb-1 block">
                Designation *
              </label>
              <input
                type="text"
                value={formData.designation || ""}
                onChange={(e) =>
                  handleInputChange("designation", e.target.value)
                }
                className={`input-field py-2.5 text-base ${
                  errors.designation ? "border-red-500 shadow-sm" : ""
                }`}
                placeholder="e.g., Senior Engineer"
                required
              />
              {errors.designation && (
                <p className="error-text text-xs mt-1 text-red-500">
                  {errors.designation}
                </p>
              )}
            </div>

            {/* Division */}
            <div>
              <label className="label-text text-gray-700 text-sm mb-1 block">
                Division *
              </label>
              <input
                type="text"
                value={formData.division || ""}
                onChange={(e) => handleInputChange("division", e.target.value)}
                className={`input-field py-2.5 text-base ${
                  errors.division ? "border-red-500 shadow-sm" : ""
                }`}
                placeholder="e.g., Transmission"
                required
              />
              {errors.division && (
                <p className="error-text text-xs mt-1 text-red-500">
                  {errors.division}
                </p>
              )}
            </div>

            {/* Course Category */}
            <div>
              <label className="label-text text-gray-700 text-sm mb-1 block">
                Course Category *
              </label>
              <select
                value={formData.course_category || ""}
                onChange={(e) =>
                  handleInputChange(
                    "course_category",
                    e.target.value as CourseCategoryEnum
                  )
                }
                className={`select-field py-2.5 text-base ${
                  errors.course_category ? "border-red-500 shadow-sm" : ""
                }`}
                required
              >
                <option value="">Select category</option>
                <option value="short_professional">Short Professional</option>
                <option value="academic">Academic</option>
              </select>
              {errors.course_category && (
                <p className="error-text text-xs mt-1 text-red-500">
                  {errors.course_category}
                </p>
              )}
            </div>

            {/* Course Selection - Spans 2 cols */}
            <div className="md:col-span-2">
              <label className="label-text text-gray-700 text-sm mb-1 block">
                Course *
              </label>
              <select
                value={formData.course_id || ""}
                onChange={(e) =>
                  handleInputChange("course_id", parseInt(e.target.value))
                }
                className={`select-field py-2.5 text-base ${
                  errors.course_id ? "border-red-500 shadow-sm" : ""
                }`}
                disabled={!formData.course_category}
                required
              >
                <option value="">
                  {formData.course_category
                    ? "Select a course"
                    : "Select category first"}
                </option>
                {filteredCourses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
              {errors.course_id && (
                <p className="error-text text-xs mt-1 text-red-500">
                  {errors.course_id}
                </p>
              )}
            </div>

            {/* Mode of Study - Spans 2 cols */}
            <div className="md:col-span-2">
              <label className="label-text text-gray-700 text-sm mb-1 block">
                Mode of Study *
              </label>
              <div className="flex gap-4 h-[44px]">
                {[
                  { value: "online", label: "Online", icon: "💻" },
                  { value: "blended", label: "Blend", icon: "🔄" },
                  { value: "physical", label: "Physical", icon: "🏢" },
                ].map((mode) => (
                  <button
                    key={mode.value}
                    type="button"
                    onClick={() =>
                      handleInputChange(
                        "mode_of_study",
                        mode.value as ModeOfStudyEnum
                      )
                    }
                    className={`flex-1 rounded-lg border flex items-center justify-center gap-2 transition-all duration-200 ${
                      formData.mode_of_study === mode.value
                        ? "border-primary-500 bg-primary-50 shadow-md"
                        : "border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300"
                    }`}
                  >
                    <span>{mode.icon}</span>
                    <span
                      className={`font-medium text-sm ${
                        formData.mode_of_study === mode.value
                          ? "text-primary-700"
                          : "text-gray-700"
                      }`}
                    >
                      {mode.label}
                    </span>
                  </button>
                ))}
              </div>
              {errors.mode_of_study && (
                <p className="error-text text-xs mt-1 text-red-500">
                  {errors.mode_of_study}
                </p>
              )}
            </div>
          </div>

          {/* Submit Button - Compact */}
          <div className="mt-8 flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full md:w-auto px-10 py-3 text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 rounded-xl"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
                  {isEditing ? "Updating..." : "Submitting..."}
                </span>
              ) : isEditing ? (
                "Update Application"
              ) : (
                "Submit Application"
              )}
            </button>
          </div>
        </form>

        {/* Footer Note */}
        <div className="mt-6 text-center text-gray-500 text-xs animate-fade-in">
          <p>* Required fields. One application per staff number.</p>
        </div>
      </div>
    </div>
  );
}
