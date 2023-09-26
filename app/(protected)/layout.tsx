"use client";
import Header from "@/components/Header";
import ProtectedRoute from "@/components/ProtectedRoute";
const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    // @ts-ignore
    <ProtectedRoute>
      <div>
        <Header />
        {children}
      </div>
    </ProtectedRoute>
  );
};
export default Layout;
