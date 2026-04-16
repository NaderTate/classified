import { createRootRoute, Outlet } from "@tanstack/react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toast } from "@heroui/react";
import { queryClient } from "@/lib/query-client";
import { AuthProvider } from "@/hooks/use-auth";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="min-h-screen text-foreground">
          <Outlet />
          <Toast.Provider placement="bottom end" />
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}
