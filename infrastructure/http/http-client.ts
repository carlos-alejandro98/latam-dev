// infrastructure/api/httpClient.ts
import axios from "axios";

import { ENV } from "@/config/environment";

export const HttpClient = axios.create({
  baseURL: ENV.apiBaseUrl,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});
