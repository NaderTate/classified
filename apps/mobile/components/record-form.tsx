import { ScrollView, Alert } from "react-native";
import { Dialog, Button, Input, TextField, Label } from "heroui-native";
import { useState, useEffect } from "react";
import { useCreateRecord, useUpdateRecord } from "@/hooks/use-records";
import { useToast } from "heroui-native";
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
  const { toast } = useToast();

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

  const handleSave = async () => {
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
        toast.show({ variant: "success", label: "Record updated" });
      } else {
        await createRecord.mutateAsync(data);
        toast.show({ variant: "success", label: "Record created" });
      }
      onClose();
    } catch (err) {
      Alert.alert("Error", err instanceof Error ? err.message : "Failed to save");
    }
  };

  const isPending = createRecord.isPending || updateRecord.isPending;

  return (
    <Dialog isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content>
          <Dialog.Title>{isEditing ? "Edit Record" : "Add Record"}</Dialog.Title>
          <ScrollView style={{ maxHeight: 400 }} keyboardShouldPersistTaps="handled">
            <TextField>
              <Label>Site / Service</Label>
              <Input placeholder="e.g. GitHub" value={site} onChangeText={setSite} />
            </TextField>
            <TextField>
              <Label>Email</Label>
              <Input
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </TextField>
            <TextField>
              <Label>Username</Label>
              <Input placeholder="Username" value={username} onChangeText={setUsername} />
            </TextField>
            <TextField>
              <Label>Password</Label>
              <Input
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </TextField>
            <Button size="sm" variant="ghost" onPress={() => setShowGenerator(!showGenerator)}>
              <Button.Label>{showGenerator ? "Hide" : "Generate"} Password</Button.Label>
            </Button>
            {showGenerator && <PasswordGenerator onSelect={setPassword} />}
            <TextField>
              <Label>Icon URL (optional)</Label>
              <Input placeholder="https://..." value={icon} onChangeText={setIcon} />
            </TextField>
          </ScrollView>
          <Dialog.Close />
          <Button variant="primary" onPress={handleSave} isDisabled={isPending}>
            <Button.Label>{isPending ? "Saving..." : isEditing ? "Save" : "Create"}</Button.Label>
          </Button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}
