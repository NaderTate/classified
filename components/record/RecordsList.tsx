"use client";

import { Record } from "@prisma/client";

import { useIsAddingContext } from "../ClientProviders";

import NewRecord from "./NewRecord";
import Header from "../Header";
import RecordCard from "./RecordCard";
import RecordCardSkeleton from "./RecordCardSkeleton";

type Props = {
  records: Record[];
  totalRecords: number;
};

function RecordsList({ records, totalRecords }: Props) {
  const { isAddingRecord } = useIsAddingContext();

  return (
    <>
      <Header showSearch />
      <NewRecord />
      <h1 className="text-3xl font-bold mt-5">
        Records{" "}
        {records.length > 0 && (
          <span className="text-sm text-gray-500">({totalRecords})</span>
        )}
      </h1>
      <div className="flex flex-wrap gap-5 mt-5">
        {isAddingRecord && <RecordCardSkeleton />}
        {records.map((record) => (
          <RecordCard key={record.id} record={record} />
        ))}
      </div>
    </>
  );
}

export default RecordsList;
