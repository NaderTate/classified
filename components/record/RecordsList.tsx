"use client";

import { Record } from "@prisma/client";

import Header from "../Header";
import RecordCard from "./RecordCard";
import { RecordForm } from "./RecordForm";

type Props = {
  records: Record[];
  totalRecords: number;
};

function RecordsList({ records, totalRecords }: Props) {
  return (
    <>
      <Header showSearchInput />
      <RecordForm />
      <h1 className="text-3xl font-bold mt-5">
        Records <span className="text-sm text-gray-500">({totalRecords})</span>
      </h1>
      <div className="flex flex-wrap gap-5 mt-5">
        {records.length > 0 ? (
          records.map((record) => (
            <RecordCard key={record.id} record={record} />
          ))
        ) : (
          <p className="">
            No records yet, click the{" "}
            <span className="border-divider border rounded-md px-1">New</span>{" "}
            button to add your first record.
          </p>
        )}
      </div>
    </>
  );
}

export default RecordsList;
