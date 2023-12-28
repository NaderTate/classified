"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export const getRecords = async (page = 1, search = "") => {
  const session = await getServerSession(authOptions);

  const records = await prisma.record.findMany({
    where: {
      userId: session?.user?.id,
      site: {
        contains: search,
        mode: "insensitive",
      },
    },
    orderBy: {
      id: "desc",
    },
    take: 12,
    skip: (page - 1) * 12,
  });

  const resultsCount = await prisma.record.count({
    where: {
      userId: session?.user?.id,
      site: {
        contains: search,
        mode: "insensitive",
      },
    },
  });

  const totalCount = await prisma.record.count({
    where: { userId: session?.user?.id },
  });

  return { records, resultsCount, totalCount };
};

export const addRecord = async (recordData: {
  site: string;
  icon: string;
  username: string;
  email: string;
  password: string;
}) => {
  try {
    const session = await getServerSession(authOptions);
    await prisma.record.create({
      data: {
        ...recordData,
        user: {
          connect: {
            id: session?.user?.id,
          },
        },
      },
    });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return error;
  }
};

export const updateRecord = async (
  id: string,
  recordData: {
    site: string;
    icon: string;
    username: string;
    email: string;
    password: string;
  }
) => {
  try {
    const session = await getServerSession(authOptions);
    await prisma.record.update({
      where: { id },
      data: {
        ...recordData,
        user: {
          connect: {
            id: session?.user?.id,
          },
        },
      },
    });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return error;
  }
};

export const deleteRecord = async (id: string) => {
  try {
    await prisma.record.delete({
      where: { id },
    });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return error;
  }
};
