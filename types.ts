
import { GroundingChunk } from '@google/genai';

export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface RestaurantInfo {
  text: string;
  sources: GroundingChunk[];
}
