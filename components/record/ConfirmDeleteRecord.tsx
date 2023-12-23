import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { DialogClose, DialogDescription } from "@radix-ui/react-dialog";

import { deleteRecord } from "@/actions/records";

type Props = { id: string };

const ConfirmDeleteRecord = ({ id }: Props) => {
  return (
    <Dialog>
      <DialogTrigger className="w-full text-left">Delete</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure about that?</DialogTitle>
          <DialogDescription>This action cannot be undone.</DialogDescription>
        </DialogHeader>
        <div className="flex gap-5">
          <DialogClose asChild>
            <Button
              variant="destructive"
              onClick={() => {
                deleteRecord(id);
              }}
            >
              Yes
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button variant="outline">No</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDeleteRecord;
