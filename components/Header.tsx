"use client";
import { ThemeSwitch } from "./ThemeSwitch";
import { AiFillLock } from "react-icons/ai";
import SearchInput from "./SearchInput";
import { UserAvatar } from "./UserAvatar";

type HeaderProps = {
  showSearchInput?: boolean;
};

function Header({ showSearchInput = false }: HeaderProps) {
  return (
    <div className="flex justify-between mt-5 gap-x-2">
      <div className="items-center hidden md:flex">
        <AiFillLock className="w-10 h-10" />
        <h1 className="text-4xl font-bold tracking-wide">Classified</h1>
      </div>
      {showSearchInput && <SearchInput />}

      <div className="flex items-center gap-3 z-10">
        <ThemeSwitch />
        <UserAvatar />
      </div>
    </div>
  );
}

export default Header;
