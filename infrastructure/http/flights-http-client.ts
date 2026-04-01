import axios from "axios";

import { ENV } from "@/config/environment";

export const FlightsHttpClient = axios.create({
  baseURL: ENV.flightsApiBaseUrl,
  /** Large active-flights payloads can exceed 10s; short timeouts show as (canceled) in DevTools. */
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});
