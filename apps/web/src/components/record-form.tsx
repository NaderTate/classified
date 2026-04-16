import { Modal, Button, Input, toast } from "@heroui/react";
import { useState, useEffect } from "react";
import { useCreateRecord, useUpdateRecord } from "@/hooks/use-records";
import PasswordGenerator from "./password-generator";
import type { Record as RecordType } from "@classified/shared";

interface RecordFormProps {
  isOpen: boolean;
  onClose: () => void;
  record?: RecordType | null;
}

export default function RecordForm({ isOpen, onClose, record }: RecordFormProps) {
  const [site, setSite] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [icon, setIcon] = useState("");
  const [showGenerator, setShowGenerator] = useState(false);

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
    setShowGenerator(false);
  }, [record, isOpen]);

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
              <span className="text-sm font-medium">Email</span>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">Username</span>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">Password</span>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            <Button size="sm" variant="secondary" onPress={() => setShowGenerator(!showGenerator)}>
              {showGenerator ? "Hide" : "Generate"} Password
            </Button>
            {showGenerator && <PasswordGenerator onSelect={setPassword} />}
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
