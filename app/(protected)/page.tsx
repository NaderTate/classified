import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";
import RecordCard from "@/components/RecordCard";
async function page() {
  const records = await prisma.record.findMany({
    orderBy: {
      id: "desc",
    },
  });
  return (
    <div className="my-5">
      <Button variant="secondary">New</Button>
      <div className="grid grid-cols-3 gap-4 mt-5">
        {records.map((record) => (
          <RecordCard key={record.id} record={record} />
        ))}
      </div>
    </div>
  );
}

export default page;
