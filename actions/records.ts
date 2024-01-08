"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export const getRecords = async (page = 1, search = "") => {
  const session = await auth();
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
  site?: string | undefined;
  icon?: string | undefined;
  username?: string | undefined;
  email?: string | undefined;
  password?: string | undefined;
}) => {
  try {
    const session = await auth();
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
    return { error };
  }
};

export const updateRecord = async (
  id: string,
  recordData: {
    site?: string | undefined;
    icon?: string | undefined;
    username?: string | undefined;
    email?: string | undefined;
    password?: string | undefined;
  }
) => {
  try {
    const session = await auth();
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
    return { error };
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
    return { error };
  }
};
