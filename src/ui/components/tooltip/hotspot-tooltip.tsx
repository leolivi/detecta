import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";
import "../../styles/tracking.css";
import {TrackingMethod, type TrackerPurpose} from "@/types/tracking-enums";
import "./hotspot-tooltip.css";

export function HotspotTooltip({
  sources,
  trackingParams,
  method,
  purpose,
}: {
  sources: string[];
  trackingParams: Record<string, string>;
  method: TrackingMethod;
  purpose?: TrackerPurpose | null;
}) {
  const paramCount = Object.keys(trackingParams).length;
  const trackerCount = sources.length;

  // Helper to get readable method name
  const getMethodLabel = (method: TrackingMethod): string => {
    switch (method) {
      case TrackingMethod.IFRAME:
        return "iFrame";
      case TrackingMethod.PIXEL:
        return "Pixel";
      case TrackingMethod.WIDGET:
        return "Social Widget";
      case TrackingMethod.SCRIPT:
        return "Script";
      case TrackingMethod.URL_DECORATION:
        return "URL Parameter";
      case TrackingMethod.AFFILIATE:
        return "Affiliate";
      case TrackingMethod.SHORTENER:
        return "URL Shortener";
      case TrackingMethod.REDIRECTOR:
        return "Redirector";
      case TrackingMethod.NETWORK_REQUEST:
        return "Network Request";
      default:
        return "Unknown";
    }
  };

  // Helper to get color class based on method
  const getColorClass = (): string => {
    switch (method) {
      case TrackingMethod.WIDGET:
        return "blue";
      case TrackingMethod.IFRAME:
        return "green";
      case TrackingMethod.PIXEL:
        return "red";
      case TrackingMethod.SCRIPT:
        return "yellow";
      default:
        return "";
    }
  };

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`tracking-hotspot ${getColorClass()}`} />
        </TooltipTrigger>
        <TooltipContent className="tooltip-content" side="top" sideOffset={5}>
          <div>
            <p className="tooltip-title">
              ⚠️ {trackerCount > 1 && `${trackerCount}x `}
              {getMethodLabel(method)} Tracking
              {purpose && ` (${purpose})`}
            </p>
            {paramCount > 0 && (
              <div className="param-container">
                <div>Tracking Parameters ({paramCount}):</div>
                {Object.entries(trackingParams).map(([key, value]) => (
                  <p className="param-text" key={key}>
                    <span>{key}</span>: {value}
                  </p>
                ))}
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
