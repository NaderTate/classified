"use client";
import * as z from "zod";
import { Record } from "@prisma/client";

import Image from "next/image";
import { useState, useTransition } from "react";

import Dropzone from "../DropZone";

import { RxCross2 } from "react-icons/rx";
import { AiFillEye } from "react-icons/ai";
import { TfiReload } from "react-icons/tfi";

import { useHandleRecordData } from "@/hooks/useHandleRecordData";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Input,
  Skeleton,
  Image as NUIImage,
} from "@nextui-org/react";
import { MdOutlineEditNote } from "react-icons/md";
import { Controller, useForm } from "react-hook-form";
import { RecordSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { ErrorMessage } from "@hookform/error-message";
import { FormSuccess } from "../FormSuccess";
import { FormError } from "../FormError";
export const RecordForm = ({ record }: { record?: Record }) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [showPassword, setShowPassword] = useState<boolean>(true);
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();
  const {
    handleUploadImage,
    isUploadingImage,
    generatePassword,
    isGeneratingPassword,
    submit,
  } = useHandleRecordData();
  const {
    reset,
    register,
    handleSubmit,
    control,
    formState: { errors },
    getValues,
    setValue,
  } = useForm<z.infer<typeof RecordSchema>>({
    resolver: zodResolver(RecordSchema),
    defaultValues: {
      site: record?.site || "",
      icon: record?.icon || "",
      email: record?.email || "",
      username: record?.username || "",
      password: record?.password || "",
    },
  });
  const onSubmit = (values: z.infer<typeof RecordSchema>) => {
    setError("");
    setSuccess("");
    startTransition(() => {
      submit(values).then((data) => {
        if (data?.error) {
          setError(data.error as string);
        }
        if (data?.success) {
          reset();
          onOpenChange();
        }
      });
    });
  };
  return (
    <>
      <Button
        fullWidth={!!record}
        variant={record ? "light" : "solid"}
        className={`${record ? " flex justify-start" : " mt-5"}`}
        size={record ? "sm" : "md"}
        color="primary"
        startContent={record ? <MdOutlineEditNote size={20} /> : ""}
        onPress={onOpen}
      >
        {record ? "Edit" : "New"}
      </Button>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        classNames={{
          wrapper: "z-[9999999999]",
          backdrop: "z-[9999999999]",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {record ? "Edit Record" : "New Record"}
              </ModalHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <ModalBody>
                  {getValues("icon") ? (
                    <div className="relative w-fit p-5 border-2 border-divider rounded-md">
                      <RxCross2
                        size={20}
                        className="absolute top-1 right-1 cursor-pointer text-default-500 hover:text-default-700 transition-colors"
                        onClick={() => {
                          reset({ icon: "" });
                        }}
                      />
                      <NUIImage
                        as={Image}
                        src={getValues("icon")}
                        width={50}
                        height={50}
                        alt={getValues("site")}
                        className="rounded-md"
                      />
                    </div>
                  ) : isUploadingImage ? (
                    <div className="w-fit p-5 border-2 border-divider rounded-md">
                      <Skeleton
                        disableAnimation
                        className="w-12 h-12 rounded-md"
                      />
                    </div>
                  ) : (
                    <Controller
                      name="icon"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <Dropzone
                          handleImages={async (images: File[]) => {
                            const res = await handleUploadImage(images);
                            if (res) {
                              onChange(res.icon);
                            }
                          }}
                          maxFiles={1}
                        />
                      )}
                    />
                  )}
                  <Input
                    variant="bordered"
                    size="sm"
                    {...register("site")}
                    label="Site name"
                  />
                  <Input
                    variant="bordered"
                    size="sm"
                    {...register("username")}
                    label="Username"
                    defaultValue={getValues("username")}
                  />
                  <Input
                    variant="bordered"
                    size="sm"
                    {...register("email")}
                    type="email"
                    label="Email"
                    defaultValue={getValues("email")}
                  />
                  <ErrorMessage
                    errors={errors}
                    name="email"
                    render={({ message }) => (
                      <p className="text-red-500 text-sm text-left w-full">
                        {message}
                      </p>
                    )}
                  />
                  <Input
                    md-maxlength="30"
                    ng-model="password"
                    autoComplete="new-password"
                    variant="bordered"
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    label="Password"
                    value={getValues("password")}
                    // defaultValue={getValues("password")}
                    onChange={(e) => {
                      setValue("password", e.target.value, {
                        shouldValidate: true,
                      });
                    }}
                    endContent={
                      <div className="flex items-center gap-4 m-auto">
                        <AiFillEye
                          size={16}
                          className={`cursor-pointer ${
                            showPassword && "text-blue-500"
                          }`}
                          onClick={() => {
                            setShowPassword(!showPassword);
                          }}
                        />
                        <TfiReload
                          size={16}
                          className={`cursor-pointer ${
                            isGeneratingPassword && "animate-spin"
                          }`}
                          title="Generate Password"
                          onClick={() => {
                            setValue("password", generatePassword());
                          }}
                        />
                      </div>
                    }
                  />
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" onPress={onClose}>
                    Cancel
                  </Button>
                  <Button
                    isLoading={isPending}
                    isDisabled={isPending}
                    color="primary"
                    type="submit"
                  >
                    {record ? "Update" : "Create"}
                  </Button>
                </ModalFooter>
                <FormSuccess message={success} />
                <FormError error={error} />
              </form>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};
