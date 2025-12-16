import React from "react";

export const TrackerDefinitions: React.FC = () => {
  return (
    <div className="pt-3 pb-6">
      <h2 className="text-lg font-semibold">Definitions</h2>

      <div className="mt-2">
        <h3 className="font-medium text-sm">Embedded Tracker</h3>
        <p className="text-sm text-muted-foreground">
          Trackers that automatically send data when the website is loaded
          without the user clicking.
        </p>
        <ul className="list-disc list-inside text-sm text-muted-foreground">
          <li>Examples: tracking pixels, scripts, iframes, social widgets.</li>
          <li>
            Purpose: Analyze user behavior, measure advertising, record social
            media interactions.
          </li>
        </ul>
      </div>

      <div className="mt-2">
        <h3 className="font-medium text-sm">Click-based Tracker</h3>
        <p className="text-sm text-muted-foreground">
          Trackers that are actively triggered by user clicks.
        </p>
        <ul className="list-disc list-inside text-sm text-muted-foreground">
          <li>Examples: Affiliate links, campaign links, redirects. </li>
          <li>Purpose: Record clicks, conversions, and campaign success.</li>
        </ul>
      </div>
    </div>
  );
};
