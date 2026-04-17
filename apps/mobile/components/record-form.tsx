import {
  View,
  Alert,
  Pressable,
  Image,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  PanResponder,
  ToastAndroid,
} from "react-native";
import { useState, useEffect, useCallback, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

function flash(message: string) {
  if (Platform.OS === "android") {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  }
}

export default function RecordForm({ isOpen, onClose, record }: RecordFormProps) {
  const [site, setSite] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [icon, setIcon] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const insets = useSafeAreaInsets();

  const createRecord = useCreateRecord();
  const updateRecord = useUpdateRecord();
  const isEditing = !!record;

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
      flash("Image uploaded");
    } catch {
      Alert.alert("Upload failed", "Could not upload image");
    } finally {
      setIsUploading(false);
    }
  }, []);

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
        flash("Record updated");
      } else {
        await createRecord.mutateAsync(data);
        flash("Record created");
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
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 80,
            friction: 10,
          }).start();
        }
      },
    }),
  ).current;

  useEffect(() => {
    if (isOpen) translateY.setValue(0);
  }, [isOpen]);

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable className="flex-1 bg-black/60" onPress={onClose} />
      <Animated.View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          maxHeight: "90%",
          transform: [{ translateY }],
        }}
        className="bg-card rounded-t-3xl"
      >
        <View {...panResponder.panHandlers} className="items-center py-3">
          <View className="h-1 w-10 rounded-full bg-border" />
        </View>

        <View className="flex-row items-center justify-between px-5 pb-4">
          <Text className="text-lg font-bold">{isEditing ? "Edit record" : "New record"}</Text>
          <Pressable
            hitSlop={8}
            onPress={onClose}
            className="h-9 w-9 items-center justify-center rounded-full active:bg-muted"
          >
            <Ionicons name="close" size={22} color="#a3a3a3" />
          </Pressable>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: (insets.bottom || 16) + 16 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Pressable
              onPress={handlePickImage}
              className="self-center h-16 w-16 rounded-2xl bg-muted items-center justify-center overflow-hidden mb-4"
            >
              {icon ? (
                <Image source={{ uri: icon }} className="h-16 w-16" />
              ) : (
                <Ionicons
                  name={isUploading ? "cloud-upload" : "camera"}
                  size={24}
                  color={isUploading ? "#3b82f6" : "#a3a3a3"}
                />
              )}
            </Pressable>

            <View className="gap-3">
              <Input placeholder="Site / Service" value={site} onChangeText={setSite} />
              <Input placeholder="Username" value={username} onChangeText={setUsername} />
              <Input
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Input
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                rightIcon={
                  <View className="flex-row items-center gap-1">
                    <Pressable
                      onPress={() => setShowPassword(!showPassword)}
                      hitSlop={6}
                      className="h-8 w-8 items-center justify-center rounded-lg"
                    >
                      <Ionicons
                        name={showPassword ? "eye" : "eye-off"}
                        size={18}
                        color={showPassword ? "#3b82f6" : "#a3a3a3"}
                      />
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        setPassword(generatePassword());
                        setShowPassword(true);
                      }}
                      hitSlop={6}
                      className="h-8 w-8 items-center justify-center rounded-lg"
                    >
                      <Ionicons name="refresh" size={18} color="#a3a3a3" />
                    </Pressable>
                  </View>
                }
              />
            </View>

            <View className="flex-row gap-3 mt-5">
              <Button variant="outline" label="Cancel" onPress={onClose} className="flex-1" />
              <Button
                label={isPending ? "Saving..." : isEditing ? "Save" : "Create"}
                onPress={handleSave}
                loading={isPending}
                className="flex-1"
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Animated.View>
    </Modal>
  );
}
