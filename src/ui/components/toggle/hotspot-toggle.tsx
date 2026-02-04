import { useEffect, useState } from "react";
import { Switch } from "./switch";

export function HotspotToggle() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    chrome.storage.local.get("hotspotsVisible", (result) => {
      if (typeof result.hotspotsVisible === "boolean") {
        setVisible(result.hotspotsVisible);
      }
    });
  }, []);

  const toggleVisibility = async (newValue: boolean) => {
    setVisible(newValue);

    chrome.storage.local.set({ hotspotsVisible: newValue });

    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (tab?.id && tab.url && !tab.url.startsWith("chrome://")) {
        await chrome.tabs.sendMessage(tab.id, {
          type: "TOGGLE_HOTSPOTS",
          visible: newValue,
        });
      }
    } catch {
      console.warn("Could not send message to content script");
    }
  };

  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md min-[401px]:border               
  min-[401px]:border-gray-300 
  min-[401px]:dark:border-gray-600  hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
    >
      <Switch
        checked={visible}
        onCheckedChange={toggleVisibility}
        className="data-[state=checked]:bg-[#4caf2a] data-[state=unchecked]:bg-gray-400"
      />
      <span className="text-xs min-[401px]:text-sm">
        {visible ? "Hotspots visible" : "Hotspots hidden"}
      </span>
    </div>
  );
}
