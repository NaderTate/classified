"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

import { MdOutlineFileUpload } from "react-icons/md";

type Props = {
  handleImages: Function;
  maxFiles?: number;
};

const Dropzone = ({ handleImages, maxFiles }: Props) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles?.length) {
      handleImages(acceptedFiles);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/*": [],
    },
    maxFiles,
    onDrop,
  });

  return (
    <form>
      <div {...getRootProps({})}>
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center gap-4 text-center cursor-pointer">
          <MdOutlineFileUpload size={25} />
          {isDragActive ? (
            <p>Drop the files here ...</p>
          ) : (
            <p>Click to choose a site icon, or drop it here...</p>
          )}
        </div>
      </div>
    </form>
  );
};
export default Dropzone;
