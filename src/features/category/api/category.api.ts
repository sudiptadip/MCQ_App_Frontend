import api from "../../../lib/axios";
import { API_ROUTES } from "../../../constants/apiRoute";
import type { Category } from "../../../types/database/Category";
import type apiResponse from "../../../types/apiResponse";

export const getCategories = async (): Promise<Category[]> => {
  const response = await api.post(API_ROUTES.GET_CATEGORY_LIST, {});
  if (response.data.isSuccess) {
    return (response.data?.data || []) as Category[];
  }
  throw new Error(response.data.message || "Failed to fetch categories");
};

export const upsertCategory = async (payload: Partial<Category>): Promise<apiResponse<Category>> => {
  const response = await api.post(API_ROUTES.UPSERT_CATEGORY, payload);
  return response.data;
};


export const deleteCategory = async (id: number): Promise<apiResponse<string>> => {
  const response = await api.post(API_ROUTES.DELETE_CATEGORY, { id: id });
  return response.data;
};
