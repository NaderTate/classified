import Header from "@/components/Header";
import NewRecord from "@/components/record/NewRecord";
import RecordCardSkeleton from "@/components/record/RecordCardSkeleton";
type Props = {};

const loading = (props: Props) => {
  return (
    <>
      <Header showSearch />
      <h1 className="text-3xl font-bold mt-5">Records</h1>
      <NewRecord />
      <div className="flex flex-wrap gap-5 mt-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <RecordCardSkeleton key={i} />
        ))}
      </div>
    </>
  );
};

export default loading;
