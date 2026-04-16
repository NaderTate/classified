import { View, Alert, Pressable, Image, Modal, ScrollView, Text, TextInput, KeyboardAvoidingView, Platform, TouchableOpacity, StyleSheet, InteractionManager, Animated, PanResponder, Dimensions } from "react-native";
import { useToast } from "heroui-native";
import { useState, useEffect, useCallback, useRef } from "react";
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
  const [ready, setReady] = useState(false);
  const { toast } = useToast();
  const insets = useSafeAreaInsets();

  const createRecord = useCreateRecord();
  const updateRecord = useUpdateRecord();
  const isEditing = !!record;

  useEffect(() => {
    if (isOpen) {
      // Wait for modal fade animation to finish before rendering content
      const task = InteractionManager.runAfterInteractions(() => setReady(true));
      return () => task.cancel();
    } else {
      setReady(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
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
    }
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

  const translateY = useRef(new Animated.Value(0)).current;
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, g) => g.dy > 10,
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) translateY.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 80) {
          onClose();
          translateY.setValue(0);
        } else {
          Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (isOpen) translateY.setValue(0);
  }, [isOpen]);

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.65)" }} onPress={onClose} />
      <Animated.View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "#18181b",
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          paddingTop: 12,
          paddingBottom: insets.bottom || 16,
          maxHeight: "75%",
          transform: [{ translateY }],
        }}
      >
        {/* Handle — drag target for swipe to dismiss */}
        <View {...panResponder.panHandlers} style={{ paddingVertical: 8, alignItems: "center" }}>
          <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: "#3f3f46" }} />
        </View>

        {/* Header — always render for instant visual */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, marginBottom: 16 }}>
          <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}>
            {isEditing ? "Edit Record" : "New Record"}
          </Text>
          <Pressable hitSlop={8} onPress={onClose}>
            <Ionicons name="close" size={22} color="#a1a1aa" />
          </Pressable>
        </View>

        {ready ? (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 20, gap: 10, paddingBottom: 16 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Icon */}
            <Pressable onPress={handlePickImage} style={s.iconPicker}>
              {icon ? (
                <Image source={{ uri: icon }} style={{ width: 60, height: 60, borderRadius: 14 }} />
              ) : (
                <Ionicons name={isUploading ? "cloud-upload" : "camera"} size={24} color={isUploading ? "#3b82f6" : "#71717a"} />
              )}
            </Pressable>

            <TextInput style={s.input} placeholder="Site / Service" placeholderTextColor="#52525b" value={site} onChangeText={setSite} />
            <TextInput style={s.input} placeholder="Username" placeholderTextColor="#52525b" value={username} onChangeText={setUsername} />
            <TextInput style={s.input} placeholder="Email" placeholderTextColor="#52525b" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

            {/* Password */}
            <View style={s.passwordRow}>
              <TextInput
                style={[s.input, { flex: 1 }]}
                placeholder="Password"
                placeholderTextColor="#52525b"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <Pressable onPress={() => setShowPassword(!showPassword)} style={s.passIcon}>
                <Ionicons name={showPassword ? "eye" : "eye-off"} size={18} color={showPassword ? "#3b82f6" : "#71717a"} />
              </Pressable>
              <Pressable onPress={() => { setPassword(generatePassword()); setShowPassword(true); }} style={s.passIcon}>
                <Ionicons name="refresh" size={18} color="#71717a" />
              </Pressable>
            </View>

            {/* Buttons */}
            <View style={s.buttons}>
              <TouchableOpacity style={s.cancelBtn} onPress={onClose} activeOpacity={0.7}>
                <Text style={s.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.saveBtn, isPending && { opacity: 0.5 }]} onPress={handleSave} disabled={isPending} activeOpacity={0.7}>
                <Text style={s.saveText}>{isPending ? "Saving..." : isEditing ? "Save" : "Create"}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
        ) : (
          <View style={{ height: 300 }} />
        )}
      </Animated.View>
    </Modal>
  );
}

const s = StyleSheet.create({
  iconPicker: {
    alignSelf: "center",
    marginBottom: 4,
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: "#27272a",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  input: {
    backgroundColor: "#27272a",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: "#fff",
    fontSize: 15,
  },
  passwordRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  passIcon: { padding: 10, backgroundColor: "#27272a", borderRadius: 10 },
  buttons: { flexDirection: "row", gap: 12, marginTop: 8 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: "#3f3f46", alignItems: "center" },
  cancelText: { color: "#a1a1aa", fontSize: 15, fontWeight: "600" },
  saveBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: "#3b82f6", alignItems: "center" },
  saveText: { color: "#fff", fontSize: 15, fontWeight: "600" },
});
