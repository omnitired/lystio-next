export interface MapboxContext {
  country?: {
    id: string;
    name: string;
    country_code: string;
    country_code_alpha_3: string;
  };
  region?: {
    id: string;
    name: string;
    region_code: string;
    region_code_full: string;
  };
  place?: {
    id: string;
    name: string;
  };
}

export interface MapboxSuggestion {
  name: string;
  name_preferred?: string;
  mapbox_id: string;
  feature_type: string;
  place_formatted: string;
  context: MapboxContext;
  language: string;
  maki: string;
  metadata: Record<string, unknown>;
  distance?: number;
}

export interface MapboxSearchResponse {
  suggestions: MapboxSuggestion[];
  attribution: string;
  response_id: string;
}

export type FeatureType =
  | "place"
  | "region"
  | "district"
  | "locality"
  | "neighborhood"
  | "address"
  | "postcode"
  | "street";

export interface GroupedSuggestions {
  places: MapboxSuggestion[];
  localities: MapboxSuggestion[];
  streets: MapboxSuggestion[];
}
