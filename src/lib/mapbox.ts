import type { MapboxSearchResponse } from "@/types/mapbox";

const MAPBOX_API_URL = "https://api.mapbox.com/search/searchbox/v1/suggest";
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

// Vienna coordinates as default proximity
const DEFAULT_PROXIMITY = "16.3738,48.2082";

export interface MapboxSearchParams {
  query: string;
  sessionToken?: string;
  proximity?: string;
  country?: string;
  language?: string;
  types?: string;
}

export async function searchMapbox({
  query,
  sessionToken,
  proximity = DEFAULT_PROXIMITY,
  country = "at",
  language = "de",
  types = "place,region,district,locality,neighborhood,address,postcode,street",
}: MapboxSearchParams): Promise<MapboxSearchResponse> {
  if (!MAPBOX_TOKEN) {
    throw new Error("Mapbox token not found");
  }

  if (!query.trim()) {
    return { suggestions: [], attribution: "", response_id: "" };
  }

  const params = new URLSearchParams({
    q: query,
    access_token: MAPBOX_TOKEN,
    language,
    country,
    proximity,
    types,
  });

  if (sessionToken) {
    params.append("session_token", sessionToken);
  }

  const response = await fetch(`${MAPBOX_API_URL}?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Mapbox API error: ${response.statusText}`);
  }

  return response.json();
}

// Generate a simple session token
export function generateSessionToken(): string {
  return `${crypto.randomUUID()}.0`;
}
