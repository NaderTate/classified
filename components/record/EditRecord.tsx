"use client";

import { Record } from "@prisma/client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import RecordForm from "@/components/record/RecordForm";

type Props = {
  record: Record;
};

function EditRecord({ record }: Props) {
  return (
    <Dialog>
      <DialogTrigger className="w-full text-left">Edit</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Record</DialogTitle>
        </DialogHeader>
        <RecordForm record={record} />
      </DialogContent>
    </Dialog>
  );
}

export default EditRecord;
