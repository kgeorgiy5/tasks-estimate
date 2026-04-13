"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import type { FC, ReactNode } from "react";

interface ReactQueryProviderProps {
  children: ReactNode;
}

export const ReactQueryProvider:FC<ReactQueryProviderProps> = ({ children }) => {
  const [client] = useState(() => new QueryClient());

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

export default ReactQueryProvider;
