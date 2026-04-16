import { Modal, Button, Input, toast } from "@heroui/react";
import { useState, useEffect } from "react";
import { FaEye, FaEyeSlash, FaSync } from "react-icons/fa";
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
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">Site / Service</span>
              <Input value={site} onChange={(e) => setSite(e.target.value)} autoFocus />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">Username</span>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">Email</span>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">Password</span>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-20"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-default-400 hover:text-foreground"
                  >
                    {showPassword ? <FaEye size={14} /> : <FaEyeSlash size={14} />}
                  </button>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="text-default-400 hover:text-foreground"
                  >
                    <FaSync size={14} className={isGenerating ? "animate-spin" : ""} />
                  </button>
                </div>
              </div>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">Icon URL</span>
              <Input value={icon} onChange={(e) => setIcon(e.target.value)} />
              <span className="text-xs text-default-400">Optional</span>
            </label>
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
