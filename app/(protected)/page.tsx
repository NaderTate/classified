import Pagination from "@/components/Pagination";
import RecordsList from "@/components/record/RecordsList";

import { getRecords } from "@/actions/records";

type Props = {
  searchParams: { page: number; search?: string };
};

async function page({ searchParams }: Props) {
  const { page, search } = searchParams || 1;
  const { records, resultsCount, totalCount } = await getRecords(page, search);

  return (
    <div className=" flex flex-col min-h-[95vh]">
      <div className="grow">
        <RecordsList records={records} totalRecords={totalCount} />
      </div>
      <Pagination
        currentPage={page}
        total={resultsCount}
        queries={{ search }}
      />
    </div>
  );
}

export default page;
