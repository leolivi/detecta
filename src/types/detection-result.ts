import {TrackerPurpose, TrackingMethod} from "@/types/tracking-enums";

// assignment of methods and purpose
export interface DetectionResult {
  element: HTMLElement;
  url: string;
  method: TrackingMethod | null;
  purpose: TrackerPurpose | null;
  params: Record<string, string>;
}
