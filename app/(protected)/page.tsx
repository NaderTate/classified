import prisma from "@/lib/prisma";
import New from "@/components/New";
import RecordsList from "@/components/RecordsList";
async function page() {
  const records = await prisma.record.findMany({
    orderBy: {
      id: "desc",
    },
  });
  return (
    <div className="my-5">
      <RecordsList records={records} />
    </div>
  );
}

export default page;
