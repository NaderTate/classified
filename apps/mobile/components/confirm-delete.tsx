import { Alert } from "react-native";
import { Dialog, Button } from "heroui-native";
import { useDeleteRecord } from "@/hooks/use-records";
import { useToast } from "heroui-native";
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
    <Dialog isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content>
          <Dialog.Title>Delete Record</Dialog.Title>
          <Dialog.Description>
            Are you sure you want to delete {record?.site || "this record"}? This cannot be undone.
          </Dialog.Description>
          <Dialog.Close />
          <Button variant="ghost" onPress={onClose}>
            <Button.Label>Cancel</Button.Label>
          </Button>
          <Button variant="danger" onPress={handleDelete} isDisabled={deleteRecord.isPending}>
            <Button.Label>{deleteRecord.isPending ? "Deleting..." : "Delete"}</Button.Label>
          </Button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}
