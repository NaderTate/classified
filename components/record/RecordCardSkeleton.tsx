import { Skeleton } from "@nextui-org/react";
import { AiOutlineUser } from "react-icons/ai";
import { RiLockPasswordFill } from "react-icons/ri";
import { MdOutlineAlternateEmail } from "react-icons/md";

const RecordCardSkeleton = () => {
  return (
    <div className="flex flex-col w-[420px] p-5 rounded-md border border-divider">
      <div className="flex items-center gap-5">
        <Skeleton disableAnimation className="w-12 h-12 rounded-md" />
        <Skeleton disableAnimation className="h-2 w-20 rounded-md" />
        <Skeleton disableAnimation className="h-2 w-6 rounded-md m-auto mr-0" />
      </div>
      <div className="grow flex place-items-end">
        <div>
          <div className="flex items-center gap-5 mt-5">
            <AiOutlineUser size={25} />
            <Skeleton disableAnimation className="h-6 w-40 rounded-md" />
          </div>
          <div className="flex items-center gap-5 mt-5">
            <MdOutlineAlternateEmail size={25} />

            <Skeleton disableAnimation className="h-6 w-52 rounded-md" />
          </div>
          <div className="flex items-center gap-5 mt-5">
            <RiLockPasswordFill size={25} />
            <Skeleton disableAnimation className="h-6 w-60 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecordCardSkeleton;
