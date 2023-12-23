import "./globals.css";

import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { getServerSession } from "next-auth";

import ClientProviders from "@/components/ClientProviders";

import { authOptions } from "@/lib/authOptions";

const inter = Nunito({ subsets: ["latin-ext"] });

export const metadata: Metadata = {
  title: "Password Manager",
  description: "Keep your passwords safe and secure",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientProviders session={session}>{children}</ClientProviders>
      </body>
    </html>
  );
}
