import api from "../../../lib/axios";
import { API_ROUTES } from "../../../constants/apiRoute";
import type { User as Student } from "../../../types/database/User";
import type RegisterStudentDto from "../types/RegisterStudentDto";
import type apiResponse from "../../../types/apiResponse";

export const getStudents = async (): Promise<Student[]> => {
  const response = await api.post(API_ROUTES.GET_STUDENT_LIST, {});
  if (response.data.isSuccess) {
    return response.data.data as Student[];
  }
  throw new Error(response.data.message || "Failed to fetch students");
};

export const registerStudent = async (payload: RegisterStudentDto): Promise<apiResponse<string>> => {
  const response = await api.post(API_ROUTES.REGISTER_STUDENT, payload);
  return response.data;
};
