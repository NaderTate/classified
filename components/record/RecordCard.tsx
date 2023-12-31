"use client";

import { Record } from "@prisma/client";

import Image from "next/image";
import { Snippet, Image as NUIImage, Button } from "@nextui-org/react";

import {
  DropdownItem,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
} from "@nextui-org/react";
import ConfirmDeleteRecord from "./ConfirmDeleteRecord";

import { SlOptions } from "react-icons/sl";
import { AiOutlineUser } from "react-icons/ai";
import { RiLockPasswordFill } from "react-icons/ri";
import { MdOutlineAlternateEmail } from "react-icons/md";
import { RecordForm } from "./RecordForm";

type Props = {
  record: Record;
};

function RecordCard({ record }: Props) {
  return (
    <div className="border-divider border rounded-md p-5 space-y-5 w-[420px]">
      <div className="flex items-center gap-5">
        {record.icon ? (
          <NUIImage
            as={Image}
            src={record.icon}
            alt={record?.site || "icon"}
            width={50}
            height={50}
            className="rounded-md object-contain"
          />
        ) : (
          <div className="w-12 h-12 rounded-md bg-gray-300" />
        )}
        <h1 className="font-bold text-xl">{record.site}</h1>

        <Dropdown placement="bottom-end">
          <DropdownTrigger className="m-auto mr-0">
            <Button isIconOnly size="sm" variant="light">
              <SlOptions />
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            hideSelectedIcon
            closeOnSelect={false}
            aria-label="Record actions"
            variant="flat"
          >
            <DropdownItem className="p-0" key="edit">
              <RecordForm record={record} />
            </DropdownItem>
            <DropdownItem className="p-0" key="delete">
              <ConfirmDeleteRecord id={record.id} />
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
      <div className="flex items-center gap-5">
        <AiOutlineUser size={25} />
        {record.username ? (
          <Snippet size="sm" symbol={null} className="w-full" variant="flat">
            {record.username}
          </Snippet>
        ) : (
          <span className="text-sm text-default-500">No username</span>
        )}
      </div>
      <div className="flex items-center gap-5">
        <MdOutlineAlternateEmail size={25} />

        {record.email ? (
          <Snippet size="sm" symbol={null} className="w-full" variant="flat">
            {record.email}
          </Snippet>
        ) : (
          <span className="text-sm text-default-500">no email</span>
        )}
      </div>
      <div className="flex items-center gap-5">
        <RiLockPasswordFill size={25} className="flex-shrink-0" />
        {record.password ? (
          <Snippet
            size="sm"
            symbol={null}
            className="w-full"
            variant="flat"
            codeString={record.password}
          >
            {record.password.substring(0, 4) +
              record.password.replace(/./g, "*").substring(4, 25)}
          </Snippet>
        ) : (
          <span className="text-sm text-default-500">no password</span>
        )}
      </div>
    </div>
  );
}

export default RecordCard;
