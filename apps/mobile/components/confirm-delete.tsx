import { View, Text, Alert } from "react-native";
import { BottomSheet, Button, useToast } from "heroui-native";
import { useDeleteRecord } from "@/hooks/use-records";
import * as Haptics from "expo-haptics";
import type { Record as RecordType } from "@classified/shared";

interface ConfirmDeleteProps {
  isOpen: boolean;
  onClose: () => void;
  record: RecordType | null;
}

export default function ConfirmDelete({ isOpen, onClose, record }: ConfirmDeleteProps) {
  const deleteRecord = useDeleteRecord();
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!record) return;

    try {
      await deleteRecord.mutateAsync(record.id);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      toast.show({ variant: "success", label: "Record deleted" });
      onClose();
    } catch (err) {
      Alert.alert("Error", err instanceof Error ? err.message : "Failed to delete");
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
      <BottomSheet.Portal>
        <BottomSheet.Overlay />
        <BottomSheet.Content snapPoints={["30%"]}>
          <View style={{ paddingHorizontal: 20, paddingBottom: 40, gap: 16 }}>
            <BottomSheet.Title>Delete Record</BottomSheet.Title>
            <Text style={{ color: "#a1a1aa", fontSize: 15, lineHeight: 22 }}>
              Are you sure you want to delete{" "}
              <Text style={{ fontWeight: "bold", color: "#fff" }}>{record?.site || "this record"}</Text>
              ? This cannot be undone.
            </Text>
            <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
              <View style={{ flex: 1 }}>
                <Button variant="outline" onPress={onClose}>
                  <Button.Label>Cancel</Button.Label>
                </Button>
              </View>
              <View style={{ flex: 1 }}>
                <Button variant="danger" onPress={handleDelete} isDisabled={deleteRecord.isPending}>
                  <Button.Label>{deleteRecord.isPending ? "Deleting..." : "Delete"}</Button.Label>
                </Button>
              </View>
            </View>
          </View>
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
  );
}
