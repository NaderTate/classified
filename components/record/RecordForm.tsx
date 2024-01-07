"use client";

import { Record } from "@prisma/client";

import Image from "next/image";
import { useState } from "react";

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
function RecordForm({ record }: { record?: Record }) {
  const {
    recordData,
    setRecordData,
    handleUploadImage,
    isUploadingImage,
    generatePassword,
    isGeneratingPassword,
    onSubmit,
  } = useHandleRecordData(record);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [showPassword, setShowPassword] = useState<boolean>(true);

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
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {record ? "Edit Record" : "New Record"}
              </ModalHeader>
              <ModalBody>
                <div className="space-y-5">
                  {recordData.icon ? (
                    <div className="relative w-fit p-5 border-2 border-divider rounded-md">
                      <RxCross2
                        size={20}
                        className="absolute top-1 right-1 cursor-pointer text-default-500 hover:text-default-700 transition-colors"
                        onClick={() => {
                          setRecordData({ ...recordData, icon: "" });
                        }}
                      />
                      <NUIImage
                        as={Image}
                        src={recordData.icon}
                        width={50}
                        height={50}
                        alt={recordData.site}
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
                    <Dropzone handleImages={handleUploadImage} maxFiles={1} />
                  )}
                  <Input
                    variant="bordered"
                    size="sm"
                    onValueChange={(e) => {
                      setRecordData({ ...recordData, site: e });
                    }}
                    label="Site name"
                    defaultValue={recordData.site || ""}
                  />
                  <Input
                    variant="bordered"
                    size="sm"
                    onValueChange={(e) => {
                      setRecordData({ ...recordData, username: e });
                    }}
                    label="Username"
                    defaultValue={recordData.username || ""}
                  />
                  <Input
                    variant="bordered"
                    size="sm"
                    onValueChange={(e) => {
                      setRecordData({ ...recordData, email: e });
                    }}
                    type="email"
                    label="Email"
                    defaultValue={recordData.email || ""}
                  />
                  <Input
                    md-maxlength="30"
                    name="password"
                    ng-model="password"
                    autoComplete="new-password"
                    variant="bordered"
                    onValueChange={(e) => {
                      setRecordData({ ...recordData, password: e });
                    }}
                    type={showPassword ? "text" : "password"}
                    label="Password"
                    value={recordData.password || ""}
                    defaultValue={recordData.password || ""}
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
                            generatePassword();
                          }}
                        />
                      </div>
                    }
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" type="submit">
                  {record ? "Update" : "Create"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}

export default RecordForm;
