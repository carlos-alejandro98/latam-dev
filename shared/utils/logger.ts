import { ENV } from "@/config/environment";
import { PLATFORM } from "@/config/platform";

export const logger = {
  info: (message: string, context?: unknown) => {
    if (ENV.enableLogs) {
      console.info(`[${PLATFORM}] ${message}`, context);
    }
  },
  error: (message: string, context?: unknown) => {
    console.error(`[${PLATFORM}] ${message}`, context);
  },
};
