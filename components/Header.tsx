"use client";
import { ModeToggle } from "./ModeToggle";
import { AiFillLock } from "react-icons/ai";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { RxCross2 } from "react-icons/rx";
import { useRef, useState } from "react";
function Header({
  showSearch = false,
  setSearch,
}: {
  showSearch?: boolean;
  setSearch?: (search: string) => void;
}) {
  const searchRef = useRef<HTMLInputElement>(null);
  const [search, setsearch] = useState<string>("");
  return (
    <div id="top">
      <div className="flex justify-between">
        <div className="items-center hidden md:flex">
          <AiFillLock className="w-10 h-10" />
          <h1 className="text-4xl font-bold tracking-wide">Classified</h1>
        </div>
        {showSearch && (
          <div className="relative">
            <Input
              ref={searchRef}
              onChange={(e) => {
                setSearch?.(e.target.value);
                setsearch(e.target.value);
              }}
              className="w-56"
              placeholder="Search..."
            />
            {search.length > 0 && (
              <RxCross2
                onClick={() => {
                  setSearch?.("");
                  setsearch("");
                  searchRef.current?.value && (searchRef.current.value = "");
                }}
                className="absolute right-2 top-0 bottom-0 m-auto cursor-pointer opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                size={18}
              />
            )}
          </div>
        )}

        <div className="flex items-center gap-3">
          <ModeToggle />
          <Button
            className="whitespace-nowrap"
            variant="outline"
            onClick={() => {
              signOut();
            }}
          >
            Log out
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Header;
