export interface Property {
  roll_number: string;
  street_number?: string;
  unit_number?: string;
  street_name?: string;
  street_type?: string;
  street_suffix?: string;
  street_direction?: string;
  full_address: string;
  neighbourhood_area?: string;
  market_region?: string;
  total_living_area?: string;
  building_type?: string;
  basement?: string;
  basement_finish?: string;
  year_built?: string;
  rooms?: string;
  air_conditioning?: string;
  fire_place?: string;
  attached_garage?: string;
  detached_garage?: string;
  pool?: string;
  property_use_code?: string;
  assessed_land_area?: string;
  zoning?: string;
  total_assessed_value?: string;
  total_proposed_assessment_value?: string;
  assessment_date?: string;
  detail_url?: { url: string };
  current_assessment_year?: string;
  property_class_1?: string;
  status_1?: string;
  assessed_value_1?: string;
  multiple_residences?: string;
  dwelling_units?: string;
  centroid_lat?: string;
  centroid_lon?: string;
  gisid?: string;
}

export interface Evaluation {
  roll_number: string;
  rating: number;
  comment: string;
}

export interface PropertyWithEvaluation extends Property {
  evaluation?: Evaluation;
}
