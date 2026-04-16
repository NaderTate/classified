import { Modal, Button, Input, InputGroup, TextField, Label, toast } from "@heroui/react";
import { useState, useEffect, useCallback } from "react";
import { FaEye, FaEyeSlash, FaSync, FaCloudUploadAlt, FaTimes } from "react-icons/fa";
import { useCreateRecord, useUpdateRecord } from "@/hooks/use-records";
import type { Record as RecordType } from "@classified/shared";

interface RecordFormProps {
  isOpen: boolean;
  onClose: () => void;
  record?: RecordType | null;
}

function generatePassword(length = 20): string {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|:;<>?,./~";
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => charset[byte % charset.length]).join("");
}

export default function RecordForm({ isOpen, onClose, record }: RecordFormProps) {
  const [site, setSite] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [icon, setIcon] = useState("");
  const [showPassword, setShowPassword] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const createRecord = useCreateRecord();
  const updateRecord = useUpdateRecord();
  const isEditing = !!record;

  useEffect(() => {
    if (record) {
      setSite(record.site || "");
      setEmail(record.email || "");
      setUsername(record.username || "");
      setPassword(record.password || "");
      setIcon(record.icon || "");
    } else {
      setSite("");
      setEmail("");
      setUsername("");
      setPassword("");
      setIcon("");
    }
    setShowPassword(true);
    setIsGenerating(false);
  }, [record, isOpen]);

  const handleGeneratePassword = () => {
    setIsGenerating(true);
    setPassword(generatePassword());
    setShowPassword(true);
    setTimeout(() => setIsGenerating(false), 600);
  };

  const handleImageUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.danger("Please upload an image file");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "classified");

      const cloudinaryUrl = import.meta.env.VITE_CLOUDINARY_URL || "https://api.cloudinary.com/v1_1/dqkyatgoy/image/upload";
      const res = await fetch(cloudinaryUrl, { method: "POST", body: formData });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      setIcon(data.secure_url || data.url);
      toast.success("Image uploaded!");
    } catch {
      toast.danger("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageUpload(file);
  }, [handleImageUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleSubmit = async () => {
    const data = {
      site: site || undefined,
      email: email || undefined,
      username: username || undefined,
      password: password || undefined,
      icon: icon || undefined,
    };

    try {
      if (isEditing && record) {
        await updateRecord.mutateAsync({ id: record.id, data });
        toast.success("Record updated");
      } else {
        await createRecord.mutateAsync(data);
        toast.success("Record created");
      }
      onClose();
    } catch (err) {
      toast.danger(err instanceof Error ? err.message : "Failed to save record");
    }
  };

  const isLoading = createRecord.isPending || updateRecord.isPending;

  if (!isOpen) return null;

  return (
    <Modal defaultOpen onOpenChange={(open) => !open && onClose()}>
      <Modal.Backdrop>
        <Modal.Container size="lg">
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>{isEditing ? "Edit Record" : "Add Record"}</Modal.Heading>
            </Modal.Header>
            <Modal.Body className="flex flex-col gap-4">
              {/* Image upload / preview */}
              {icon ? (
                <div className="relative w-fit p-4 border-2 border-border rounded-lg">
                  <button
                    type="button"
                    onClick={() => setIcon("")}
                    className="absolute top-1 right-1 text-default-400 hover:text-foreground"
                  >
                    <FaTimes size={14} />
                  </button>
                  <img src={icon} alt={site} className="w-14 h-14 rounded-md object-contain" />
                </div>
              ) : (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "image/*";
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) handleImageUpload(file);
                    };
                    input.click();
                  }}
                  className={`flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                    isDragging
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-default-400"
                  }`}
                >
                  {isUploading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                  ) : (
                    <>
                      <FaCloudUploadAlt size={24} className="text-default-400" />
                      <p className="text-sm text-default-400">
                        Drop an image here or click to upload
                      </p>
                    </>
                  )}
                </div>
              )}

              <TextField>
                <Label>Site / Service</Label>
                <Input value={site} onChange={(e) => setSite(e.target.value)} autoFocus />
              </TextField>
              <TextField>
                <Label>Username</Label>
                <Input value={username} onChange={(e) => setUsername(e.target.value)} />
              </TextField>
              <TextField>
                <Label>Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </TextField>
              <TextField>
                <Label>Password</Label>
                <InputGroup>
                  <InputGroup.Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    placeholder="Password"
                  />
                  <InputGroup.Suffix className="flex gap-2 border-none bg-transparent">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`${showPassword ? "text-primary" : "text-default-400"} hover:text-foreground`}
                    >
                      {showPassword ? <FaEye size={16} /> : <FaEyeSlash size={16} />}
                    </button>
                    <button
                      type="button"
                      onClick={handleGeneratePassword}
                      title="Generate Password"
                      className="text-default-400 hover:text-foreground"
                    >
                      <FaSync size={16} className={isGenerating ? "animate-spin" : ""} />
                    </button>
                  </InputGroup.Suffix>
                </InputGroup>
              </TextField>
            </Modal.Body>
            <Modal.Footer>
              <Button slot="close" variant="outline">
                Cancel
              </Button>
              <Button variant="primary" onPress={handleSubmit} isDisabled={isLoading}>
                {isEditing ? "Save" : "Create"}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
