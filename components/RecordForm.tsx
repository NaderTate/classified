"use client";
import { Record } from "@prisma/client";
import Image from "next/image";
import { ChangeEvent, MouseEvent, useState } from "react";
import { BiImageAdd } from "react-icons/bi";
import { FiUploadCloud } from "react-icons/fi";
import { GiCancel } from "react-icons/gi";
import { Input } from "./ui/input";
import { TfiReload } from "react-icons/tfi";
import { Button } from "./ui/button";
function RecordForm({ record }: { record?: Record }) {
  const [id, setId] = useState<string | null>(record?.id || null);
  const [site, setSite] = useState<string>(record?.site || "");
  const [username, setUsername] = useState<string>(record?.username || "");
  const [email, setEmail] = useState<string>(record?.email || "");
  const [password, setPassword] = useState<string>(record?.password || "");
  const [image, setImage] = useState<string | null>(record?.icon || null);
  const [generatingPassword, setGeneratingPassword] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
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
      formData.append("source", file);
      formData.append("nsfw", "1");
      setUploading(true);
      const res = await fetch("/api/lensdump", {
        method: "POST",
        body: formData,
      });
      setUploading(false);
      const data = await res.json();
      if (data.status == 200) {
        setImage(data.url);
      }
    } catch (error) {
      console.error(error);
      alert("Sorry! something went wrong.");
    }
  };
  return (
    <div className="space-y-5">
      <div>
        {image ? (
          <div className="flex flex-col items-center">
            <Image
              src={image}
              alt={imageName || ""}
              width={100}
              height={100}
              className="rounded-md"
            />
            <p className="line-clamp-1">{imageName}</p>
            <div className="flex gap-5">
              <button onClick={onCancelFile}>
                <GiCancel size={20} />
              </button>
              <button disabled={uploading} onClick={onUploadFile}>
                <FiUploadCloud
                  className={`${
                    uploading && "animate-pulse cursor-not-allowed"
                  }`}
                  size={20}
                />
              </button>
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
      <Input type="text" placeholder="Site name" value={site || ""} />
      <Input type="text" placeholder="Username" value={username || ""} />
      <Input type="email" placeholder="Email" value={email || ""} />
      <div className="relative">
        <Input type="text" placeholder="Password" value={password || ""} />
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
        <Button variant="default">{id ? "Update" : "Create"}</Button>
      </div>
    </div>
  );
}

export default RecordForm;
