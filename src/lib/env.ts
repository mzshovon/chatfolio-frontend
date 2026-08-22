const rawBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!rawBaseUrl) {
  throw new Error(
    "NEXT_PUBLIC_API_BASE_URL is not set. Copy .env.example to .env.local and configure it."
  );
}

export const env = {
  apiBaseUrl: rawBaseUrl.replace(/\/+$/, ""),
};
