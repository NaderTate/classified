import Header from "@/components/Header";
import RecordForm from "@/components/record/RecordForm";
import RecordCardSkeleton from "@/components/record/RecordCardSkeleton";

const loading = () => {
  return (
    <>
      <Header showSearchInput />
      <h1 className="text-3xl font-bold mt-5">Records</h1>
      <RecordForm />
      <div className="flex flex-wrap gap-5 mt-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <RecordCardSkeleton key={i} />
        ))}
      </div>
    </>
  );
};

export default loading;
