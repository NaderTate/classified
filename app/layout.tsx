import "./globals.css";
import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import SessionProv from "@/components/SessionProvider";
import { ThemeProvider } from "@/components/theme-porvider";
import { Toaster } from "@/components/ui/toaster";

const inter = Nunito();

export const metadata: Metadata = {
  title: "Password Manager",
  description: "Keep your passwords safe and secure",
};

export default function RootLayout({
  children,
  session,
}: {
  children: React.ReactNode;
  session: any;
}) {
  return (
    <html lang="en">
      <SessionProv session={session}>
        <body className={inter.className}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
            <Toaster />
          </ThemeProvider>
        </body>
      </SessionProv>
    </html>
  );
}
