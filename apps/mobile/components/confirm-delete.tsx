import { Alert, Platform, ToastAndroid } from "react-native";
import { useEffect } from "react";
import * as Haptics from "expo-haptics";
import { useDeleteRecord } from "@/hooks/use-records";
import type { Record as RecordType } from "@classified/shared";

interface ConfirmDeleteProps {
  isOpen: boolean;
  onClose: () => void;
  record: RecordType | null;
}

function flash(message: string) {
  if (Platform.OS === "android") {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  }
}

export default function ConfirmDelete({ isOpen, onClose, record }: ConfirmDeleteProps) {
  const deleteRecord = useDeleteRecord();

  useEffect(() => {
    if (!isOpen || !record) return;

    Alert.alert(
      "Delete record",
      `Are you sure you want to delete ${record.site || "this record"}? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel", onPress: onClose },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteRecord.mutateAsync(record.id);
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              flash("Record deleted");
            } catch (err) {
              Alert.alert("Error", err instanceof Error ? err.message : "Failed to delete");
            }
            onClose();
          },
        },
      ],
      { onDismiss: onClose },
    );
  }, [isOpen, record]);

  return null;
}
