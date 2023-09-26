import { ModeToggle } from "./ModeToggle";
import { AiFillLock } from "react-icons/ai";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { Input } from "@/components/ui/input";

function Header() {
  return (
    <div>
      <div className="flex justify-between">
        <div className="flex items-center ">
          <AiFillLock className="w-10 h-10" />
          <h1 className="text-4xl font-bold tracking-wide">Classified</h1>
        </div>
        <Input className="w-56" placeholder="Search..." />

        <div className="flex items-center gap-3">
          <ModeToggle />
          <Button
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
