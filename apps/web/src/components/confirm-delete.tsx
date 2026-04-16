import { Modal, Button, toast } from "@heroui/react";
import { useDeleteRecord } from "@/hooks/use-records";
import type { Record as RecordType } from "@classified/shared";

interface ConfirmDeleteProps {
  isOpen: boolean;
  onClose: () => void;
  record: RecordType | null;
}

export default function ConfirmDelete({ isOpen, onClose, record }: ConfirmDeleteProps) {
  const deleteRecord = useDeleteRecord();

  const handleDelete = async () => {
    if (!record) return;

    try {
      await deleteRecord.mutateAsync(record.id);
      toast.success("Record deleted");
      onClose();
    } catch (err) {
      toast.danger(err instanceof Error ? err.message : "Failed to delete record");
    }
  };

  if (!isOpen) return null;

  return (
    <Modal defaultOpen onOpenChange={(open) => !open && onClose()}>
      <Modal.Backdrop>
        <Modal.Container size="sm">
        <Modal.Dialog>
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>Delete Record</Modal.Heading>
          </Modal.Header>
          <Modal.Body>
            <p>
              Are you sure you want to delete <strong>{record?.site || "this record"}</strong>? This
              action cannot be undone.
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Button slot="close" variant="outline">
              Cancel
            </Button>
            <Button variant="danger" onPress={handleDelete} isDisabled={deleteRecord.isPending}>
              Delete
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
