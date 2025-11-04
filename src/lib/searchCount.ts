import { useQuery } from "@tanstack/react-query";

interface SearchCountParams {
  type: number[];
  rentType: string[];
  subType: number[];
  showPriceOnRequest: boolean;
  sort: string;
  withinId: string[];
  rent?: [number, number];
  price?: [number, number];
}

interface SearchCountResponse {
  count: number;
}

const API_URL = process.env.NEXT_PUBLIC_LYSTIO_API_URL || "https://api.lystio.at";

export async function fetchSearchCount(params: SearchCountParams): Promise<SearchCountResponse> {
  const response = await fetch(`${API_URL}/tenement/search/count`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch search count");
  }

  return response.json();
}

export function useSearchCount(params: SearchCountParams | null) {
  return useQuery({
    queryKey: ["search-count", params],
    queryFn: () => fetchSearchCount(params!),
    enabled: params !== null,
  });
}
