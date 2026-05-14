function getRequiredEnv(name: string, value: string | undefined) {
  if (!value) {
    throw new Error(`${name} is required.`);
  }

  return value;
}

function normalizeUrl(value: string) {
  const url = new URL(value);

  return url.toString().replace(/\/$/, "");
}

export const env = {
  apiBaseUrl: normalizeUrl(
    getRequiredEnv(
      "NEXT_PUBLIC_API_BASE_URL",
      process.env.NEXT_PUBLIC_API_BASE_URL,
    ),
  ),
} as const;
