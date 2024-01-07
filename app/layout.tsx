import "./globals.css";

import type { Metadata } from "next";
import { Nunito } from "next/font/google";

import ClientProviders from "@/components/ClientProviders";

import { auth } from "@/auth";
import { Image } from "@nextui-org/react";

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
  const session = await auth();
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientProviders session={session}>
          <div className="relative flex flex-col">
            {children}
            <div
              aria-hidden="true"
              className="fixed hidden dark:md:block dark:opacity-70 -bottom-[40%] -left-[20%] z-0"
            >
              <Image
                disableSkeleton
                className="relative z-10 opacity-0 shadow-black/5 data-[loaded=true]:opacity-100 shadow-none transition-transform-opacity motion-reduce:transition-none !duration-300 rounded-large"
                src="/docs-left.png"
              />
            </div>
            <div
              aria-hidden="true"
              className="fixed hidden dark:md:block dark:opacity-70 -top-[80%] -right-[60%] 2xl:-top-[60%] 2xl:-right-[45%] z-0 rotate-12"
            >
              <Image
                disableSkeleton
                src="/docs-right.png"
                className="relative z-10 opacity-0 shadow-black/5 data-[loaded=true]:opacity-100 shadow-none transition-transform-opacity motion-reduce:transition-none !duration-300 rounded-large"
                alt="docs right background"
              />
            </div>
          </div>
        </ClientProviders>
      </body>
    </html>
  );
}
