import { FlightsHttpClient } from "./flights-http-client";

export const flightsHttpGet = async <T>(
  url: string,
  params?: object,
): Promise<T> => {
  const response = await FlightsHttpClient.get<T>(url, { params });
  return response.data;
};

export const flightsHttpPost = async <T, B = unknown>(
  url: string,
  body: B,
): Promise<T> => {
  const response = await FlightsHttpClient.post<T>(url, body);
  return response.data;
};

export const flightsHttpPut = async <T, B = unknown>(
  url: string,
  body: B,
): Promise<T> => {
  const response = await FlightsHttpClient.put<T>(url, body);
  return response.data;
};

export const flightsHttpPatch = async <T, B = unknown>(
  url: string,
  body: B,
): Promise<T> => {
  const response = await FlightsHttpClient.patch<T>(url, body);
  return response.data;
};

export const flightsHttpDelete = async <T>(url: string): Promise<T> => {
  const response = await FlightsHttpClient.delete<T>(url);
  return response.data;
};
