import api from "../../../lib/axios";
import { API_ROUTES } from "../../../constants/apiRoute";
import type { User as Student } from "../../../types/database/User";
import type RegisterStudentDto from "../types/RegisterStudentDto";
import type { UpdateStudentDetailsDto } from "../types/UpdateStudentDetailsDto";
import type apiResponse from "../../../types/apiResponse";

import type { Category } from "../../../types/database/Category";

export interface StudentCategory extends Category {
  is_assigned: boolean;
}

export const getStudents = async (): Promise<Student[]> => {
  const response = await api.post(API_ROUTES.GET_STUDENT_LIST, {});
  if (response.data.isSuccess) {
    return (response.data.data as Student[]) || [];
  }
  throw new Error(response.data.message || "Failed to fetch students");
};

export const registerStudent = async (payload: RegisterStudentDto): Promise<apiResponse<string>> => {
  const response = await api.post(API_ROUTES.REGISTER_STUDENT, payload);
  return response.data;
};

export const getStudentDetailsByUserId = async (userId: number): Promise<Student | null> => {
  const response = await api.post(API_ROUTES.GET_STUDENT_DETAILS, { user_id: userId });
  if (response.data.isSuccess) {
    // Returning first item if it's an array, or just data if object
    const data = response.data.data;
    if (Array.isArray(data)) return data[0] as Student;
    return data as Student;
  }
  return null;
};

export const updateStudentDetails = async (payload: UpdateStudentDetailsDto): Promise<apiResponse<Student>> => {
  const response = await api.post(API_ROUTES.UPSERT_STUDENT_DETAILS, payload);
  return response.data;
};

export const resetUserDevice = async (userId: number): Promise<apiResponse<any>> => {
  const response = await api.post(API_ROUTES.RESET_USER_DEVICE, {
    user_id: userId
  });
  return response.data;
};

export const getStudentCategories = async (studentUserId: number): Promise<StudentCategory[]> => {
  const response = await api.post(API_ROUTES.GET_STUDENT_CATEGORIES, {
    student_user_id: studentUserId
  });
  if (response.data.isSuccess) {
    return (response.data.data as StudentCategory[]) || [];
  }
  throw new Error(response.data.message || "Failed to fetch student categories");
};

export const toggleStudentCategory = async (payload: {
  student_user_id: number;
  category_id: number;
}): Promise<apiResponse<any>> => {
  const response = await api.post(API_ROUTES.TOGGLE_STUDENT_CATEGORY, payload);
  return response.data;
};


