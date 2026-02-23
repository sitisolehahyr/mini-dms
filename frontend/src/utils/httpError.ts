import axios from "axios";

export function getErrorMessage(error: unknown, fallback = "Request failed") {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.error?.message;
    if (typeof message === "string") {
      return message;
    }
  }
  return fallback;
}
