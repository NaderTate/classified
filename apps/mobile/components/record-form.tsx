import { View, Alert, Pressable, Image, Modal, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { Button, Input, InputGroup, useToast } from "heroui-native";
import { useState, useEffect, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
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
  let result = "";
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
}

export default function RecordForm({ isOpen, onClose, record }: RecordFormProps) {
  const [site, setSite] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [icon, setIcon] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
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

  const handlePickImage = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]) return;

    setIsUploading(true);
    try {
      const asset = result.assets[0];
      const formData = new FormData();
      formData.append("file", {
        uri: asset.uri,
        type: asset.mimeType || "image/jpeg",
        name: "icon.jpg",
      } as unknown as Blob);
      formData.append("upload_preset", "classified");

      const res = await fetch("https://api.cloudinary.com/v1_1/dqkyatgoy/image/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setIcon(data.secure_url || data.url);
      toast.show({ variant: "success", label: "Image uploaded" });
    } catch {
      toast.show({ variant: "danger", label: "Upload failed" });
    } finally {
      setIsUploading(false);
    }
  }, [toast]);

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
    <Modal visible={isOpen} animationType="slide" transparent={false} onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, backgroundColor: "#000" }}
      >
        {/* Header */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: Platform.OS === "ios" ? 56 : 16, paddingBottom: 12 }}>
          <Pressable onPress={onClose}>
            <Ionicons name="close" size={28} color="#a1a1aa" />
          </Pressable>
          <Button variant="primary" size="sm" onPress={handleSave} isDisabled={isPending}>
            <Button.Label>{isPending ? "Saving..." : isEditing ? "Save" : "Create"}</Button.Label>
          </Button>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, gap: 12 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Icon picker */}
          <Pressable
            onPress={handlePickImage}
            style={{
              alignSelf: "center",
              marginBottom: 8,
              width: 72,
              height: 72,
              borderRadius: 16,
              backgroundColor: "#18181b",
              justifyContent: "center",
              alignItems: "center",
              overflow: "hidden",
            }}
          >
            {icon ? (
              <Image source={{ uri: icon }} style={{ width: 72, height: 72, borderRadius: 16 }} />
            ) : isUploading ? (
              <Ionicons name="cloud-upload" size={28} color="#3b82f6" />
            ) : (
              <Ionicons name="camera" size={28} color="#71717a" />
            )}
          </Pressable>

          {/* Form fields */}
          <Input variant="secondary" placeholder="Site / Service" value={site} onChangeText={setSite} />
          <Input variant="secondary" placeholder="Username" value={username} onChangeText={setUsername} />
          <Input variant="secondary" placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <InputGroup>
            <InputGroup.Input
              variant="secondary"
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <InputGroup.Suffix style={{ gap: 8, flexDirection: "row", alignItems: "center", paddingRight: 8 }}>
              <Pressable onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? "eye" : "eye-off"} size={18} color={showPassword ? "#3b82f6" : "#71717a"} />
              </Pressable>
              <Pressable onPress={() => { setPassword(generatePassword()); setShowPassword(true); }}>
                <Ionicons name="refresh" size={18} color="#71717a" />
              </Pressable>
            </InputGroup.Suffix>
          </InputGroup>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
