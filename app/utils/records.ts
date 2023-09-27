"use server";
import prisma from "@/lib/prisma";
import { Record } from "@prisma/client";
import { revalidatePath } from "next/cache";

export const addRecord = async (
  site: string,
  username: string,
  icon: string,
  email: string,
  password: string,
  userId: string
) => {
  const newRecord = await prisma.record.create({
    data: {
      site,
      username,
      icon,
      email,
      password,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
  revalidatePath("/");
  return newRecord;
};

export const updateRecord = async (
  id: string,
  site: string,
  username: string,
  icon: string,
  email: string,
  password: string,
  userId: string
) => {
  const updatedRecord = await prisma.record.update({
    where: { id },
    data: {
      site,
      username,
      icon,
      email,
      password,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
  revalidatePath("/");
  return updatedRecord;
};

export const deleteRecord = async (id: string) => {
  const deletedRecord = await prisma.record.delete({
    where: { id },
  });
  revalidatePath("/");
  return deletedRecord;
};
