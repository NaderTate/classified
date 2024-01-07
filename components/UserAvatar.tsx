"use client";

import {
  DropdownItem,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  Avatar,
} from "@nextui-org/react";
import { signOut, useSession } from "next-auth/react";

import Settings from "./Settings";

import { MdOutlineLogout } from "react-icons/md";
import { IoSettingsOutline } from "react-icons/io5";
import { Fragment } from "react";

type UserAvatarProps = {};

export const UserAvatar = ({}: UserAvatarProps) => {
  const session = useSession();
  const user = session?.data?.user;

  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <Avatar
          isBordered
          as="button"
          className="transition-transform"
          color="secondary"
          name={session?.data?.user?.name || "User"}
          size="sm"
          src={
            user?.image ||
            "https://avatars.githubusercontent.com/u/4726 9261?v=4"
          }
          showFallback
          fallback={
            user?.name?.split(" ")?.[0]?.[0] ||
            "" + user?.name?.split(" ")?.[1]?.[0]
          }
        />
      </DropdownTrigger>
      <DropdownMenu
        hideSelectedIcon
        closeOnSelect={false}
        aria-label="Profile Actions"
        variant="flat"
      >
        <DropdownItem key="profile" className="h-14 gap-2 cursor-default">
          <span className="font-semibold">Signed in as</span>
          <p className="font-semibold">{user?.email || ""}</p>
        </DropdownItem>

        <DropdownItem
          className={`${user?.isOAuth && " hidden"}`}
          startContent={<IoSettingsOutline />}
          key="settings"
        >
          <Settings />
        </DropdownItem>

        <DropdownItem
          startContent={<MdOutlineLogout />}
          onClick={() => signOut({ callbackUrl: "/" })}
          key="logout"
          color="danger"
        >
          Log Out
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};
