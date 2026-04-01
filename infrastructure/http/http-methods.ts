// infrastructure/api/httpMethods.ts
import { HttpClient } from "./http-client";

export const httpGet = async <T>(url: string, params?: object): Promise<T> => {
  const response = await HttpClient.get<T>(url, { params });
  return response.data;
};

export const httpPost = async <T, B = unknown>(
  url: string,
  body: B,
): Promise<T> => {
  const response = await HttpClient.post<T>(url, body);
  return response.data;
};

export const httpPut = async <T, B = unknown>(
  url: string,
  body: B,
): Promise<T> => {
  const response = await HttpClient.put<T>(url, body);
  return response.data;
};

export const httpDelete = async <T>(url: string): Promise<T> => {
  const response = await HttpClient.delete<T>(url);
  return response.data;
};
