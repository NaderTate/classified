"use client";
import { Record } from "@prisma/client";
import Image from "next/image";
import { ChangeEvent, MouseEvent, useState } from "react";
import { BiImageAdd } from "react-icons/bi";
import { FiUploadCloud } from "react-icons/fi";
import { Input } from "./ui/input";
import { TfiReload } from "react-icons/tfi";
import { Button } from "./ui/button";
import { addRecord, updateRecord } from "@/app/utils/records";
import { useSession } from "next-auth/react";
import { BeatLoader } from "react-spinners";
import { AiFillEye, AiOutlineCheckCircle } from "react-icons/ai";
import { RxCross2 } from "react-icons/rx";
function RecordForm({
  record,
  setOpen,
}: {
  record?: Record;
  setOpen: (open: boolean) => void;
}) {
  const { data: session }: any = useSession();
  const id = record?.id;
  const [site, setSite] = useState<string>(record?.site || "");
  const [username, setUsername] = useState<string>(record?.username || "");
  const [email, setEmail] = useState<string>(record?.email || "");
  const [password, setPassword] = useState<string>(record?.password || "");
  const [image, setImage] = useState<string | null>(record?.icon || null);
  const [generatingPassword, setGeneratingPassword] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [fetching, setFetching] = useState<boolean>(false);
  function generatePassword(): string {
    setGeneratingPassword(true);
    const length = Math.floor(Math.random() * 10) + 20;
    const charset =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
    let password = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
      password += charset.charAt(Math.floor(Math.random() * n));
    }

    setPassword(password);
    setTimeout(() => {
      setGeneratingPassword(false);
    }, 500);
    return password;
  }
  const onFileUploadChange = (e: ChangeEvent<HTMLInputElement>) => {
    const fileInput = e.target;

    if (!fileInput.files) {
      alert("No file was chosen");
      return;
    }

    if (!fileInput.files || fileInput.files.length === 0) {
      alert("Files list is empty");
      return;
    }

    const file = fileInput.files[0];

    /** File validation */
    if (!file.type.startsWith("image")) {
      alert("Please select a valide image");
      return;
    }

    /** Setting file state */
    setFile(file); // we will use the file state, to send it later to the server
    setImage(URL.createObjectURL(file)); // we will use this to show the preview of the image
    setImageName(file.name);
    /** Reset file input */
    e.currentTarget.type = "text";
    e.currentTarget.type = "file";
  };
  const onCancelFile = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!image && !file) {
      return;
    }
    setFile(null);
    setImage(null);
    setImageName(null);
  };
  const onUploadFile = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!file) {
      return;
    }

    try {
      let formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "classified");
      setUploading(true);
      const res = await fetch(
        "https://api.cloudinary.com/v1_1//dqkyatgoy/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );
      setUploading(false);
      const data = await res.json();
      console.log(data);
      setImage(data.secure_url);
      setImageName(data.original_filename);
    } catch (error) {
      console.error(error);
      alert("Sorry! something went wrong.");
    }
  };
  return (
    <div className="space-y-5">
      <div>
        {image ? (
          <div className="flex flex-col items-center ">
            <div className="relative p-4">
              <Image
                src={image}
                alt={imageName || ""}
                width={100}
                height={100}
                className="rounded-md"
              />

              <RxCross2
                onClick={onCancelFile}
                className="absolute top-0 right-0 cursor-pointer opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                size={18}
              />
            </div>
            <div className="flex gap-5">
              {image.includes("cloudinary") ? (
                <div className="flex items-center gap-2">
                  <AiOutlineCheckCircle size={20} /> <span>Image uploaded</span>
                </div>
              ) : (
                <Button
                  disabled={uploading}
                  onClick={onUploadFile}
                  className="my-2"
                >
                  {uploading ? (
                    <BeatLoader size={10} />
                  ) : (
                    <>
                      <FiUploadCloud size={20} />
                      <span>Upload</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        ) : (
          <label className="flex flex-col items-center h-full transition-colors duration-150 cursor-pointer hover:text-gray-600">
            <BiImageAdd size={35} className="opacity-50" />
            <strong className="text-sm font-medium">Select an image</strong>
            <Input
              className="hidden"
              name="file"
              type="file"
              onChange={onFileUploadChange}
            />
          </label>
        )}
      </div>
      <Input
        onChange={(e) => {
          setSite(e.target.value);
        }}
        type="text"
        placeholder="Site name"
        defaultValue={site || ""}
      />
      <Input
        onChange={(e) => {
          setUsername(e.target.value);
        }}
        type="text"
        placeholder="Username"
        defaultValue={username || ""}
      />
      <Input
        onChange={(e) => {
          setEmail(e.target.value);
        }}
        type="email"
        placeholder="Email"
        defaultValue={email || ""}
      />
      <div className="relative">
        <Input
          onChange={(e) => {
            setPassword(e.target.value);
          }}
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={password}
          defaultValue={password || ""}
        />
        <AiFillEye
          className={`absolute right-10 top-0 bottom-0 m-auto cursor-pointer ${
            showPassword && "text-blue-500"
          }`}
          onClick={() => {
            setShowPassword(!showPassword);
          }}
        />
        <TfiReload
          className={`absolute right-2 top-0 bottom-0 m-auto cursor-pointer ${
            generatingPassword && "animate-spin"
          }`}
          title="Generate Password"
          onClick={() => {
            setPassword(generatePassword());
          }}
        >
          Generate Pass
        </TfiReload>
      </div>
      <div className="flex justify-center">
        <Button
          disabled={
            site.length < 1 ||
            !site ||
            password.length < 1 ||
            !password ||
            fetching
          }
          onClick={async () => {
            setFetching(true);
            if (id) {
              await updateRecord(
                id,
                site,
                username,
                image || "",
                email,
                password,
                session?.user?.id
              );
              setOpen(false);
            } else {
              await addRecord(
                site,
                username,
                image || "",
                email,
                password,
                session?.user?.id
              );
              setOpen(false);
            }
            setFetching(false);
          }}
          variant={"default"}
        >
          {fetching && <BeatLoader size={10} />}
          {!fetching && (id ? "Update" : "Create")}
        </Button>
      </div>
    </div>
  );
}

export default RecordForm;
