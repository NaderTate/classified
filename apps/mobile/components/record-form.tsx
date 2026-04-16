import { View, Alert, ScrollView } from "react-native";
import { BottomSheet, Button, Input, TextField, Label, useToast } from "heroui-native";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
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
  globalThis.crypto.getRandomValues(array);
  return Array.from(array, (byte) => charset[byte % charset.length]).join("");
}

export default function RecordForm({ isOpen, onClose, record }: RecordFormProps) {
  const [site, setSite] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [icon, setIcon] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    setShowPassword(false);
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
    <BottomSheet isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
      <BottomSheet.Portal>
        <BottomSheet.Overlay />
        <BottomSheet.Content snapPoints={["90%"]}>
          <View style={{ paddingHorizontal: 20, paddingBottom: 40, flex: 1 }}>
            {/* Header */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <BottomSheet.Title>{isEditing ? "Edit Record" : "New Record"}</BottomSheet.Title>
              <BottomSheet.Close />
            </View>

            {/* Form */}
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ gap: 16 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <TextField>
                <Label>Site / Service</Label>
                <Input placeholder="e.g. GitHub" value={site} onChangeText={setSite} />
              </TextField>

              <TextField>
                <Label>Username</Label>
                <Input placeholder="Username" value={username} onChangeText={setUsername} />
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
                <Label>Password</Label>
                <Input
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
              </TextField>

              {/* Password actions */}
              <View style={{ flexDirection: "row", gap: 12 }}>
                <Button size="sm" variant="ghost" onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? "eye" : "eye-off"} size={16} color="#a1a1aa" />
                  <Button.Label>{showPassword ? "Hide" : "Show"}</Button.Label>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onPress={() => {
                    setPassword(generatePassword());
                    setShowPassword(true);
                  }}
                >
                  <Ionicons name="refresh" size={16} color="#a1a1aa" />
                  <Button.Label>Generate</Button.Label>
                </Button>
              </View>

              <TextField>
                <Label>Icon URL (optional)</Label>
                <Input placeholder="https://..." value={icon} onChangeText={setIcon} />
              </TextField>
            </ScrollView>

            {/* Footer buttons */}
            <View style={{ flexDirection: "row", gap: 12, marginTop: 16 }}>
              <View style={{ flex: 1 }}>
                <Button variant="outline" onPress={onClose}>
                  <Button.Label>Cancel</Button.Label>
                </Button>
              </View>
              <View style={{ flex: 1 }}>
                <Button variant="primary" onPress={handleSave} isDisabled={isPending}>
                  <Button.Label>{isPending ? "Saving..." : isEditing ? "Save" : "Create"}</Button.Label>
                </Button>
              </View>
            </View>
          </View>
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
  );
}
