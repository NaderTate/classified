"use client";

import { Route } from "next";
import { useRouter, usePathname } from "next/navigation";
import { Pagination as NUIPagination } from "@nextui-org/pagination";

type Props = {
  currentPage: number;
  total: number;
  queries?: Record<string, string | number | undefined>;
};

function Pagination({ total, queries, currentPage }: Props) {
  const router = useRouter();
  const pathname = usePathname() as Route;

  // This function converts the object to a query format for exmple:
  // {search:"hello",page:1} to search=hello&page=1
  function objectToQueryString(
    obj: Record<string, string | number | undefined>
  ): string {
    return Object.entries(obj)
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(
            value?.toString() || ""
          )}`
      )
      .join("&");
  }

  const formattedQueries = queries ? objectToQueryString(queries) : "";

  return (
    <div className="flex justify-center my-5">
      <NUIPagination
        initialPage={currentPage || 1}
        total={Math.ceil(total / 10)}
        onChange={(e) => {
          setTimeout(() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }, 200);
          router.push(`${pathname}?page=${e}&${formattedQueries}`);
        }}
      />
    </div>
  );
}

export default Pagination;
