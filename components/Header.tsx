"use client";
import { ModeToggle } from "./ModeToggle";
import { AiFillLock } from "react-icons/ai";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import SearchInput from "./SearchInput";
function Header({ showSearch = false }: { showSearch?: boolean }) {
  return (
    <div className="flex justify-between mt-5">
      <div className="items-center hidden md:flex">
        <AiFillLock className="w-10 h-10" />
        <h1 className="text-4xl font-bold tracking-wide">Classified</h1>
      </div>
      {showSearch && <SearchInput />}

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
  );
}

export default Header;
