import { View, Alert, Pressable, Image, Modal, ScrollView, Text, KeyboardAvoidingView, Platform } from "react-native";
import { Button, Input, InputGroup, useToast } from "heroui-native";
import { useState, useEffect, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
  const insets = useSafeAreaInsets();

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
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      {/* Backdrop */}
      <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.65)" }} onPress={onClose} />

      {/* Bottom card */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "#18181b",
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          paddingTop: 16,
          paddingBottom: insets.bottom + 16,
          maxHeight: "80%",
        }}
      >
        {/* Handle bar */}
        <View style={{ alignSelf: "center", width: 40, height: 4, borderRadius: 2, backgroundColor: "#3f3f46", marginBottom: 12 }} />

        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, marginBottom: 16 }}>
          <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}>
            {isEditing ? "Edit Record" : "New Record"}
          </Text>
          <Pressable hitSlop={8} onPress={onClose}>
            <Ionicons name="close" size={22} color="#a1a1aa" />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, gap: 10, paddingBottom: 16 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Icon picker */}
          <Pressable
            onPress={handlePickImage}
            style={{
              alignSelf: "center",
              marginBottom: 8,
              width: 64,
              height: 64,
              borderRadius: 14,
              backgroundColor: "#27272a",
              justifyContent: "center",
              alignItems: "center",
              overflow: "hidden",
            }}
          >
            {icon ? (
              <Image source={{ uri: icon }} style={{ width: 64, height: 64, borderRadius: 14 }} />
            ) : isUploading ? (
              <Ionicons name="cloud-upload" size={24} color="#3b82f6" />
            ) : (
              <Ionicons name="camera" size={24} color="#71717a" />
            )}
          </Pressable>

          {/* Form */}
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

          {/* Actions */}
          <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
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
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
