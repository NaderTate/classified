import { View, Image, Text } from "react-native";
import { Card, Button } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { useToast } from "heroui-native";
import type { Record as RecordType } from "@classified/shared";

interface RecordCardProps {
  record: RecordType;
  onEdit: (record: RecordType) => void;
  onDelete: (record: RecordType) => void;
}

export default function RecordCard({ record, onEdit, onDelete }: RecordCardProps) {
  const { toast } = useToast();

  const copyPassword = async () => {
    if (record.password) {
      await Clipboard.setStringAsync(record.password);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      toast.show({
        variant: "success",
        label: "Copied!",
        description: "Password copied to clipboard",
      });
    }
  };

  return (
    <Card>
      <Card.Body style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        {record.icon ? (
          <Image source={{ uri: record.icon }} style={{ width: 40, height: 40, borderRadius: 8 }} />
        ) : (
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              backgroundColor: "#27272a",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#71717a", fontSize: 18, fontWeight: "bold" }}>
              {record.site?.charAt(0).toUpperCase() || "?"}
            </Text>
          </View>
        )}

        <View style={{ flex: 1 }}>
          <Text style={{ color: "#fff", fontWeight: "600" }} numberOfLines={1}>
            {record.site || "Untitled"}
          </Text>
          <Text style={{ color: "#71717a", fontSize: 13 }} numberOfLines={1}>
            {record.email || record.username || "—"}
          </Text>
        </View>

        <View style={{ flexDirection: "row", gap: 4 }}>
          {record.password && (
            <Button isIconOnly size="sm" variant="ghost" onPress={copyPassword}>
              <Ionicons name="copy-outline" size={18} color="#a1a1aa" />
            </Button>
          )}
          <Button isIconOnly size="sm" variant="ghost" onPress={() => onEdit(record)}>
            <Ionicons name="pencil" size={18} color="#a1a1aa" />
          </Button>
          <Button isIconOnly size="sm" variant="ghost" onPress={() => onDelete(record)}>
            <Ionicons name="trash-outline" size={18} color="#ef4444" />
          </Button>
        </View>
      </Card.Body>
    </Card>
  );
}
