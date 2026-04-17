import { View, Image, Pressable, ToastAndroid, Platform, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { Text } from "@/components/ui/text";
import type { Record as RecordType } from "@classified/shared";

interface RecordCardProps {
  record: RecordType;
  onEdit: (record: RecordType) => void;
  onDelete: (record: RecordType) => void;
}

function flash(message: string) {
  if (Platform.OS === "android") {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    Alert.alert(message);
  }
}

export default function RecordCard({ record, onEdit, onDelete }: RecordCardProps) {
  const copyPassword = async () => {
    if (record.password) {
      await Clipboard.setStringAsync(record.password);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      flash("Password copied");
    }
  };

  return (
    <View className="flex-row items-center bg-card border border-border rounded-2xl px-4 py-3 gap-3">
      {record.icon ? (
        <Image source={{ uri: record.icon }} className="h-10 w-10 rounded-lg" />
      ) : (
        <View className="h-10 w-10 rounded-lg bg-muted items-center justify-center">
          <Text className="text-muted-foreground text-lg font-bold">
            {record.site?.charAt(0).toUpperCase() || "?"}
          </Text>
        </View>
      )}

      <View className="flex-1">
        <Text className="font-semibold" numberOfLines={1}>
          {record.site || "Untitled"}
        </Text>
        <Text className="text-muted-foreground text-xs mt-0.5" numberOfLines={1}>
          {record.email || record.username || "—"}
        </Text>
      </View>

      <View className="flex-row items-center">
        {record.password && (
          <Pressable
            onPress={copyPassword}
            hitSlop={8}
            className="h-9 w-9 items-center justify-center rounded-lg active:bg-muted"
            android_ripple={{ color: "rgba(255,255,255,0.08)", borderless: true }}
          >
            <Ionicons name="copy-outline" size={18} color="#a3a3a3" />
          </Pressable>
        )}
        <Pressable
          onPress={() => onEdit(record)}
          hitSlop={8}
          className="h-9 w-9 items-center justify-center rounded-lg active:bg-muted"
          android_ripple={{ color: "rgba(255,255,255,0.08)", borderless: true }}
        >
          <Ionicons name="pencil" size={18} color="#a3a3a3" />
        </Pressable>
        <Pressable
          onPress={() => onDelete(record)}
          hitSlop={8}
          className="h-9 w-9 items-center justify-center rounded-lg active:bg-muted"
          android_ripple={{ color: "rgba(239,68,68,0.15)", borderless: true }}
        >
          <Ionicons name="trash-outline" size={18} color="#ef4444" />
        </Pressable>
      </View>
    </View>
  );
}
