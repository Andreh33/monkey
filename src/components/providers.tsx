"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster
        position="top-right"
        theme="dark"
        richColors
        toastOptions={{
          style: {
            background: "#131316",
            border: "1px solid #27272A",
            color: "#FAFAFA",
          },
        }}
      />
    </SessionProvider>
  );
}
