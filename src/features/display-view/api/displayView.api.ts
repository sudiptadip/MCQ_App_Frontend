import api from "../../../lib/axios";
import { API_ROUTES } from "../../../constants/apiRoute";
import type DisplayView from "../../../types/database/DisplayView";
import type apiResponse from "../../../types/apiResponse";

export const getDisplayViews = async (): Promise<DisplayView[]> => {
  const response = await api.post(API_ROUTES.GET_DISPLAY_VIEW_LIST, {});
  if (response.data.isSuccess) {
    return (response.data?.data || []) as DisplayView[];
  }
  throw new Error(response.data.message || "Failed to fetch display views");
};

export const getDisplayViewTree = async (rootId: number): Promise<DisplayView[]> => {
  const response = await api.post(API_ROUTES.GET_DISPLAY_VIEW_CHILDREN, { id: rootId });
  if (response.data.isSuccess) {
    return (response.data?.data || []) as DisplayView[];
  }
  throw new Error(response.data.message || "Failed to fetch display view tree");
};

export const upsertDisplayView = async (
  payload: Partial<DisplayView>
): Promise<apiResponse<DisplayView>> => {
  const response = await api.post(API_ROUTES.UPSERT_DISPLAY_VIEW, payload);
  return response.data;
};

export const deleteDisplayView = async (id: number): Promise<apiResponse<string>> => {
  const response = await api.post(API_ROUTES.DELETE_DISPLAY_VIEW, { id });
  return response.data;
};
