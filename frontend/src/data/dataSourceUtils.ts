import axios from "axios";

let runtimeMockEnabled = false;

function envForcesMockMode(): boolean {
  return import.meta.env.VITE_USE_MOCK === "true";
}

export function isMockModeEnabled(): boolean {
  return envForcesMockMode() || runtimeMockEnabled;
}

function isFallbackError(error: unknown): boolean {
  if (!axios.isAxiosError(error)) {
    return false;
  }

  const statusCode = error.response?.status;

  if (typeof statusCode !== "number") {
    return true;
  }

  return statusCode === 401 || statusCode >= 500;
}

export async function simulateMockLatency(): Promise<void> {
  const durationMs = 500 + Math.floor(Math.random() * 301);
  await new Promise((resolve) => window.setTimeout(resolve, durationMs));
}

export async function runWithFallback<T>(apiCall: () => Promise<T>, mockCall: () => Promise<T>): Promise<T> {
  if (isMockModeEnabled()) {
    await simulateMockLatency();
    return mockCall();
  }

  try {
    return await apiCall();
  } catch (error) {
    if (!isFallbackError(error)) {
      throw error;
    }

    runtimeMockEnabled = true;
    await simulateMockLatency();
    return mockCall();
  }
}
