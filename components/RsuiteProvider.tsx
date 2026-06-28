"use client";

import type { ReactNode } from "react";
import { CustomProvider } from "rsuite";

export default function RsuiteProvider({ children }: { children: ReactNode }) {
  return <CustomProvider>{children}</CustomProvider>;
}
