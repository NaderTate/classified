"use client";

import { SessionProvider } from "next-auth/react";

export default function SessionProv({
  children,
  session,
}: {
  children: React.ReactNode;
  session: any;
}) {
  return (
    <SessionProvider
      // set the interval to 1/4 hour
      refetchInterval={1000 * 60 * 15}
      refetchOnWindowFocus={false}
      session={session}
    >
      {children}
    </SessionProvider>
  );
}
