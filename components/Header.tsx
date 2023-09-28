import { ModeToggle } from "./ModeToggle";
import { AiFillLock } from "react-icons/ai";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { Input } from "@/components/ui/input";

function Header({
  showSearch = false,
  setSearch,
}: {
  showSearch?: boolean;
  setSearch?: (search: string) => void;
}) {
  return (
    <div id="top">
      <div className="flex justify-between">
        <div className="items-center hidden md:flex">
          <AiFillLock className="w-10 h-10" />
          <h1 className="text-4xl font-bold tracking-wide">Classified</h1>
        </div>
        {showSearch && (
          <Input
            onChange={(e) => {
              setSearch?.(e.target.value);
            }}
            className="w-56"
            placeholder="Search..."
          />
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
