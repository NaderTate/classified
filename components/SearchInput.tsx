import { Input } from "@nextui-org/input";
import { useRouter } from "next/navigation";
import { KeyboardEvent, useState } from "react";

import { RxCross2 } from "react-icons/rx";
import { IoSearchOutline } from "react-icons/io5";

type Props = {};

const SearchInput = ({}: Props) => {
  const router = useRouter();

  const [searchKeywords, setSearchKeywords] = useState<string>("");

  const handleSubmit = () => {
    router.push(`/?search=${searchKeywords}`);
  };

  const resetSearch = () => {
    router.push("/");
    setSearchKeywords("");
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <Input
      value={searchKeywords}
      onValueChange={(e) => {
        setSearchKeywords(e);
        router.push(`/?search=${e}`);
      }}
      className="w-56"
      classNames={{
        inputWrapper: "border",
      }}
      label="Search..."
      variant="bordered"
      size="sm"
      endContent={
        <div className="flex items-center gap-3 m-auto">
          {searchKeywords !== "" && (
            <>
              <RxCross2
                onClick={resetSearch}
                className=" cursor-pointer opacity-70 ring-offset-background transition-opacity hover:opacity-100 "
                size={18}
              />
              <IoSearchOutline
                onClick={handleSubmit}
                className="cursor-pointer"
                size={18}
              />
            </>
          )}
        </div>
      }
      onKeyDown={handleKeyPress}
    />
  );
};

export default SearchInput;
