"use client";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status }: any = useSession();
  if (status === "loading") {
    return null;
  }
  const checkIfLoggedIn = () => {
    if (!session?.user) {
      redirect("/login");
    }
  };
  checkIfLoggedIn();
  return children;
};

export default ProtectedRoute;
