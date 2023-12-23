"use client";

import { Session } from "next-auth";
import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import { NextUIProvider } from "@nextui-org/react";
import { createContext, useContext, useState } from "react";

const isAddingContext = createContext({
  isAddingRecord: false,
  setIsAddingRecord: (isAddingRecord: boolean) => {},
});
type Props = { children: React.ReactNode; session: Session | null };

const ClientProviders = ({ children, session }: Props) => {
  const [isAddingRecord, setIsAddingRecord] = useState<boolean>(false);

  return (
    <SessionProvider
      // set the interval to 1/4 hour
      refetchInterval={1000 * 60 * 15}
      refetchOnWindowFocus={false}
      session={session}
    >
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <NextUIProvider>
          <isAddingContext.Provider
            value={{ isAddingRecord, setIsAddingRecord }}
          >
            {children}
          </isAddingContext.Provider>
        </NextUIProvider>
      </ThemeProvider>
    </SessionProvider>
  );
};
export const useIsAddingContext = () => {
  return useContext(isAddingContext);
};
export default ClientProviders;
