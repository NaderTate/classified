"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import RecordForm from "@/components/RecordForm";
import { Button } from "./ui/button";
import { useState } from "react";

function New() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-5">
      <Dialog
        open={open}
        onOpenChange={(open) => {
          setOpen(open);
        }}
      >
        <DialogTrigger asChild>
          <Button
            variant="secondary"
            onClick={() => {
              setOpen(true);
            }}
          >
            New
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Record</DialogTitle>
          </DialogHeader>
          <RecordForm
            setOpen={(open: boolean) => {
              setOpen(open);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default New;
