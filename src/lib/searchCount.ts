import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "./api";

interface SearchCountParams {
  type: number[];
  rentType: string[];
  subType?: number[];
  showPriceOnRequest: boolean;
  sort: string;
  withinId?: string[];
  rent?: [number, number];
  price?: [number, number];
}

interface SearchCountResponse {
  count: number;
}

export interface HistogramParams {
  type: number[];
  rentType: string[];
  subType?: number[];
  showPriceOnRequest: boolean;
  sort: string;
  withinId?: string[];
}

export interface HistogramResponse {
  range: [number, number];
  histogram: number[];
}

export async function fetchSearchCount(
  params: SearchCountParams,
): Promise<SearchCountResponse> {
  return apiRequest<SearchCountResponse>("/tenement/search/count", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export async function fetchHistogram(
  params: HistogramParams,
): Promise<HistogramResponse> {
  return apiRequest<HistogramResponse>("/tenement/search/histogram", {
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

export function useHistogram(params: HistogramParams | null) {
  return useQuery({
    queryKey: ["histogram", params],
    queryFn: () => fetchHistogram(params!),
    enabled: params !== null,
  });
}
