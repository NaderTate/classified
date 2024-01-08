"use client";

import { Session } from "next-auth";
import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import { NextUIProvider } from "@nextui-org/react";

type Props = { children: React.ReactNode; session: Session | null };

const ClientProviders = ({ children, session }: Props) => {
  return (
    <SessionProvider
      // set the interval to 1/4 hour
      refetchInterval={1000 * 60 * 15}
      refetchOnWindowFocus={false}
      session={session}
    >
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <NextUIProvider>{children}</NextUIProvider>
      </ThemeProvider>
    </SessionProvider>
  );
};

export default ClientProviders;
