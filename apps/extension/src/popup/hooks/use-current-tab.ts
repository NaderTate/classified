import { useEffect, useState } from "react";

export function useCurrentTabHostname(): string | null {
  const [hostname, setHostname] = useState<string | null>(null);
  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      const url = tabs[0]?.url;
      if (!url) return;
      try {
        setHostname(new URL(url).hostname);
      } catch {
        setHostname(null);
      }
    });
  }, []);
  return hostname;
}
