"use client";

import * as React from "react";

export function useMediaQuery(query: string) {
  const [matches, setMatches] = React.useState(false);

  React.useEffect(() => {
    const media = window.matchMedia(query);
    const updateMatch = () => setMatches(media.matches);

    updateMatch();
    media.addEventListener("change", updateMatch);
    return () => media.removeEventListener("change", updateMatch);
  }, [query]);

  return matches;
}

export function useLocale() {
  const [locale, setLocale] = React.useState("en-US");

  React.useEffect(() => {
    setLocale(navigator.language);
  }, []);

  return locale;
}
