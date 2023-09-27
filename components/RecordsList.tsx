"use client";
import { Record } from "@prisma/client";
import RecordCard from "./RecordCard";
import Header from "./Header";
import New from "./New";
import { useState } from "react";

function RecordsList({ records }: { records: Record[] }) {
  const [search, setSearch] = useState<string>("");
  const filteredRecords = records.filter((record) =>
    record.site.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Header
        setSearch={(search) => {
          setSearch(search);
        }}
        showSearch
      />
      <New />
      <h1 className="text-3xl font-bold mt-5">Records</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5 mt-5">
        {filteredRecords.map((record) => (
          <RecordCard key={record.id} record={record} />
        ))}
      </div>
    </>
  );
}

export default RecordsList;
