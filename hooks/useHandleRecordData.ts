"use client";

import { useState } from "react";

import { Record } from "@prisma/client";

import { addRecord, updateRecord } from "@/actions/records";

import { useIsAddingContext } from "@/components/ClientProviders";

export const useHandleRecordData = (record?: Record) => {
  const { setIsAddingRecord } = useIsAddingContext();
  const [recordData, setRecordData] = useState({
    site: record?.site || "",
    icon: record?.icon || "",
    username: record?.username || "",
    email: record?.email || "",
    password: record?.password || "",
  });

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
    await fetch("/api/cloudinary", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        setRecordData({ ...recordData, icon: data.Image });
      })
      .catch((error) => {
        alert("error uploading images");
        console.error(error);
      });

    setUploadingImage(false);
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

    setRecordData({ ...recordData, password });
    setTimeout(() => {
      setGeneratingPassword(false);
    }, 500);
  }

  const onSubmit = async () => {
    if (record) {
      await updateRecord(record.id, recordData);
    } else {
      setIsAddingRecord(true);
      await addRecord(recordData);
      setIsAddingRecord(false);
    }
  };

  return {
    recordData,
    setRecordData,
    handleUploadImage,
    isUploadingImage,
    generatePassword,
    isGeneratingPassword,
    onSubmit,
  };
};
