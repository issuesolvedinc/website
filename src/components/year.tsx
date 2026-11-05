"use client";

import { useEffect, useState } from "react";

/** The current year. The page is built with `built`; the browser corrects it once a new year has started. */
export function Year({ built }: { built: number }) {
  const [year, setYear] = useState(built);
  useEffect(() => setYear(new Date().getFullYear()), []);
  return <>{year}</>;
}
