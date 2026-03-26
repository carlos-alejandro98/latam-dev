import axios from "axios";

import { ENV } from "@/config/environment";

export const FlightsHttpClient = axios.create({
  baseURL: ENV.flightsApiBaseUrl,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});
