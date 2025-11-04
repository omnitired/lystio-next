import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "./api";

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

export async function fetchSearchCount(params: SearchCountParams): Promise<SearchCountResponse> {
  return apiRequest<SearchCountResponse>("/tenement/search/count", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export function useSearchCount(params: SearchCountParams | null) {
  return useQuery({
    queryKey: ["search-count", params],
    queryFn: () => fetchSearchCount(params!),
    enabled: params !== null,
  });
}
