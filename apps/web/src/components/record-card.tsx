import { Card, Button, Tooltip } from "@heroui/react";
import { FaCopy, FaEdit, FaTrash } from "react-icons/fa";
import toast from "react-hot-toast";
import type { Record as RecordType } from "@classified/shared";

interface RecordCardProps {
  record: RecordType;
  onEdit: (record: RecordType) => void;
  onDelete: (record: RecordType) => void;
}

export default function RecordCard({ record, onEdit, onDelete }: RecordCardProps) {
  const copyPassword = () => {
    if (record.password) {
      navigator.clipboard.writeText(record.password);
      toast.success("Password copied!");
    }
  };

  return (
    <Card className="w-full">
      <Card.Content className="flex flex-row items-center gap-4">
        {record.icon ? (
          <img
            src={record.icon}
            alt={record.site || ""}
            className="w-10 h-10 rounded-lg object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-default-100 flex items-center justify-center text-lg font-bold text-default-500">
            {record.site?.charAt(0).toUpperCase() || "?"}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{record.site || "Untitled"}</p>
          <p className="text-sm text-default-500 truncate">
            {record.email || record.username || "—"}
          </p>
        </div>

        <div className="flex gap-1">
          {record.password && (
            <Tooltip>
              <Tooltip.Trigger>
                <Button isIconOnly size="sm" variant="ghost" onPress={copyPassword}>
                  <FaCopy />
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Content>Copy password</Tooltip.Content>
            </Tooltip>
          )}
          <Tooltip>
            <Tooltip.Trigger>
              <Button isIconOnly size="sm" variant="ghost" onPress={() => onEdit(record)}>
                <FaEdit />
              </Button>
            </Tooltip.Trigger>
            <Tooltip.Content>Edit</Tooltip.Content>
          </Tooltip>
          <Tooltip>
            <Tooltip.Trigger>
              <Button
                isIconOnly
                size="sm"
                variant="ghost"
                className="text-danger"
                onPress={() => onDelete(record)}
              >
                <FaTrash />
              </Button>
            </Tooltip.Trigger>
            <Tooltip.Content>Delete</Tooltip.Content>
          </Tooltip>
        </div>
      </Card.Content>
    </Card>
  );
}
