"use client";

import { z } from "zod";
import { useState } from "react";

import { Record } from "@prisma/client";

import { RecordSchema } from "@/schemas";
import { addRecord, updateRecord } from "@/actions/records";

export const useHandleRecordData = (record?: Record) => {
  const [isUploadingImage, setUploadingImage] = useState(false);

  const [isGeneratingPassword, setGeneratingPassword] = useState(false);

  const handleUploadImage = async (images: File[]) => {
    const image = images[0];
    if (!image || !image.type.startsWith("image")) {
      alert("Please select a valid image");
      return;
    }

    setUploadingImage(true);
    const formData = new FormData();
    formData.append("file", image);
    formData.append("upload_preset", "classified");
    const req = await fetch("/api/cloudinary", {
      method: "POST",
      body: formData,
    });
    const res = await req.json();
    setUploadingImage(false);
    return { icon: res.Image as string };
  };

  function generatePassword() {
    setGeneratingPassword(true);
    const length = Math.floor(Math.random() * 10) + 25;
    const charset =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
    let password = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
      password += charset.charAt(Math.floor(Math.random() * n));
    }

    setTimeout(() => {
      setGeneratingPassword(false);
    }, 500);
    return password;
  }

  const submit = async (values: z.infer<typeof RecordSchema>) => {
    if (record) {
      const res = await updateRecord(record.id, values);
      return res;
    } else {
      const res = await addRecord(values);
      return res;
    }
  };

  return {
    handleUploadImage,
    isUploadingImage,
    generatePassword,
    isGeneratingPassword,
    submit,
  };
};
