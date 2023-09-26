"use client";
import { useState } from "react";
import { Record } from "@prisma/client";
import { AiFillEye, AiOutlineUser, AiTwotoneCopy } from "react-icons/ai";
import { MdOutlineAlternateEmail } from "react-icons/md";
import { RiLockPasswordFill } from "react-icons/ri";
import { SlOptions } from "react-icons/sl";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CopyToClipboard } from "react-copy-to-clipboard";
import Image from "next/image";
import { Button } from "./ui/button";
import { DialogClose } from "@radix-ui/react-dialog";
import RecordForm from "./RecordForm";
function RecordCard({ record }: { record: Record }) {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="border-input border rounded-md p-5 space-y-5">
      <div className="flex items-center gap-5">
        {record.icon.length > 0 ? (
          <Image
            src={record.icon}
            alt={record.site}
            width={50}
            height={50}
            className="rounded-md"
          />
        ) : (
          <div className="w-12 h-12 rounded-md bg-gray-300" />
        )}
        <h1 className="font-bold text-xl">{record.site}</h1>

        <DropdownMenu>
          <DropdownMenuTrigger className="m-auto mr-0">
            <SlOptions />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <Dialog>
              <DialogTrigger asChild>
                <DropdownMenuItem
                  onSelect={(e: { preventDefault: () => any }) =>
                    e.preventDefault()
                  }
                >
                  Edit
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Record</DialogTitle>
                </DialogHeader>
                <RecordForm record={record} />
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <DropdownMenuItem
                  onSelect={(e: { preventDefault: () => any }) =>
                    e.preventDefault()
                  }
                >
                  Delete
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Are you sure about that?</DialogTitle>
                </DialogHeader>
                <div className="flex gap-5">
                  <DialogClose asChild>
                    <Button variant="destructive" onClick={() => {}}>
                      Yes
                    </Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button variant="outline" onClick={() => {}}>
                      No
                    </Button>
                  </DialogClose>
                </div>
              </DialogContent>
            </Dialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex items-center gap-5">
        <AiOutlineUser className="w-12 h-7" />
        <p className="">
          {record.username.length > 0 ? record.username : "No username"}
        </p>
        {record.username.length > 0 && (
          <CopyToClipboard text={record.username}>
            <AiTwotoneCopy
              className="m-auto mr-0 cursor-pointer"
              onClick={() => {
                toast({
                  title: "Username copied to clipboard",
                });
              }}
            />
          </CopyToClipboard>
        )}
      </div>
      <div className="flex items-center gap-5">
        <MdOutlineAlternateEmail className="w-12 h-7" />
        <p className="">
          {record.email.length > 1 ? record.email : "No email"}
        </p>
        {record.email.length > 0 && (
          <CopyToClipboard text={record.email}>
            <AiTwotoneCopy
              className="m-auto mr-0 cursor-pointer"
              onClick={() => {
                toast({
                  title: "Email copied to clipboard",
                });
              }}
            />
          </CopyToClipboard>
        )}
      </div>
      <div className="flex items-center gap-5">
        <RiLockPasswordFill className="w-12 h-7" />
        <p className="line-clamp-1">
          {record.password.length > 0
            ? showPassword
              ? record.password
              : record.password.replace(/./g, "*")
            : "No password"}
        </p>
        <div className="flex m-auto mr-0 gap-5">
          <AiFillEye
            className="cursor-pointer"
            onClick={() => {
              setShowPassword(!showPassword);
            }}
          />

          {record.password.length > 0 && (
            <CopyToClipboard text={record.password}>
              <AiTwotoneCopy
                className="m-auto mr-0 cursor-pointer"
                onClick={() => {
                  toast({
                    title: "Password copied to clipboard",
                  });
                }}
              />
            </CopyToClipboard>
          )}
        </div>
      </div>
    </div>
  );
}

export default RecordCard;
