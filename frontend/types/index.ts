export enum CourseCategoryEnum {
  SHORT_PROFESSIONAL = "short_professional",
  ACADEMIC = "academic",
}

export enum ModeOfStudyEnum {
  ONLINE = "online",
  BLENDED = "blended",
  PHYSICAL = "physical",
}

export interface Course {
  id: number;
  name: string;
  category: CourseCategoryEnum;
  description?: string;
  is_active: boolean;
  created_at: string;
}

export interface ApplicationCreate {
  staff_number: string;
  email?: string;
  application_date: string;
  first_name: string;
  last_name: string;
  designation: string;
  division: string;
  course_category: CourseCategoryEnum;
  course_id: number;
  mode_of_study: ModeOfStudyEnum;
}

export interface Application extends ApplicationCreate {
  id: number;
  created_at: string;
  course: Course;
}

export interface FormStatus {
  id: number;
  is_open: boolean;
  updated_at: string;
  updated_by?: string;
}

export interface StaffValidation {
  staff_number: string;
  has_applied: boolean;
  application?: Application;
}

export interface FormStatusUpdate {
  is_open: boolean;
  updated_by?: string;
}
