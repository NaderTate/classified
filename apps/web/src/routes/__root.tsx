import { createRootRoute, Outlet } from "@tanstack/react-router";
import { HeroUIProvider } from "@heroui/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { queryClient } from "@/lib/query-client";
import { AuthProvider } from "@/hooks/use-auth";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <HeroUIProvider>
        <AuthProvider>
          <div className="min-h-screen bg-background text-foreground dark">
            <Outlet />
            <Toaster
              position="bottom-right"
              toastOptions={{
                className: "!bg-content1 !text-foreground !border-divider",
              }}
            />
          </div>
        </AuthProvider>
      </HeroUIProvider>
    </QueryClientProvider>
  );
}
