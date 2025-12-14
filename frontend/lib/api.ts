import axios from "axios";
import type {
  Course,
  ApplicationCreate,
  Application,
  FormStatus,
  StaffValidation,
  FormStatusUpdate,
  CourseCategoryEnum,
} from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const adminPassword = sessionStorage.getItem("adminPassword");
  if (adminPassword) {
    config.headers["X-Admin-Password"] = adminPassword;
  }
  return config;
});

// Course API
export const coursesApi = {
  getAll: async (category?: CourseCategoryEnum): Promise<Course[]> => {
    const params = category ? { category } : {};
    const response = await apiClient.get<Course[]>("/api/courses/", { params });
    return response.data;
  },

  getById: async (id: number): Promise<Course> => {
    const response = await apiClient.get<Course>(`/api/courses/${id}`);
    return response.data;
  },

  create: async (course: Partial<Course>): Promise<Course> => {
    const response = await apiClient.post<Course>("/api/courses/", course);
    return response.data;
  },
};

// Application API
export const applicationsApi = {
  submit: async (application: ApplicationCreate): Promise<Application> => {
    const response = await apiClient.post<Application>(
      "/api/applications/",
      application
    );
    return response.data;
  },

  update: async (
    staffNumber: string,
    application: ApplicationCreate
  ): Promise<Application> => {
    const response = await apiClient.put<Application>(
      `/api/applications/${staffNumber}`,
      application
    );
    return response.data;
  },

  validateStaffNumber: async (
    staffNumber: string
  ): Promise<StaffValidation> => {
    const response = await apiClient.get<StaffValidation>(
      `/api/applications/validate/${staffNumber}`
    );
    return response.data;
  },

  getAll: async (): Promise<Application[]> => {
    const response = await apiClient.get<Application[]>("/api/applications/");
    return response.data;
  },

  export: async (): Promise<Blob> => {
    const response = await apiClient.get("/api/applications/export", {
      responseType: "blob",
    });
    return response.data;
  },
};

// Form Status API
export const formStatusApi = {
  get: async (): Promise<FormStatus> => {
    const response = await apiClient.get<FormStatus>("/api/form-status/");
    return response.data;
  },

  update: async (status: FormStatusUpdate): Promise<FormStatus> => {
    const response = await apiClient.put<FormStatus>(
      "/api/form-status/",
      status
    );
    return response.data;
  },
};

export default apiClient;
