"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import RecordForm from "@/components/record/RecordForm";

function NewRecord() {
  return (
    <Dialog>
      <DialogTrigger className="mt-5">
        <div className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 px-5 py-3">
          New
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Record</DialogTitle>
        </DialogHeader>
        <RecordForm />
      </DialogContent>
    </Dialog>
  );
}

export default NewRecord;
