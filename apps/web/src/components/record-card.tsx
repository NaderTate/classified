import { Card, Button, Dropdown, toast } from "@heroui/react";
import { FaCopy, FaUser, FaEnvelope, FaLock, FaEllipsisV } from "react-icons/fa";
import type { Record as RecordType } from "@classified/shared";

interface RecordCardProps {
  record: RecordType;
  onEdit: (record: RecordType) => void;
  onDelete: (record: RecordType) => void;
}

export default function RecordCard({ record, onEdit, onDelete }: RecordCardProps) {
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  const maskPassword = (pw: string) => {
    if (pw.length <= 4) return "•".repeat(pw.length);
    return pw.substring(0, 4) + "•".repeat(Math.min(pw.length - 4, 20));
  };

  return (
    <Card className="w-full ">
      <Card.Content className="p-5 space-y-4">
        {/* Header: icon + site + menu */}
        <div className="flex items-center gap-4">
          {record.icon ? (
            <img
              src={record.icon}
              alt={record.site || "icon"}
              className="w-12 h-12 rounded-md object-contain"
            />
          ) : (
            <div className="w-12 h-12 rounded-md bg-default flex items-center justify-center text-lg font-bold">
              {record.site?.charAt(0).toUpperCase() || "?"}
            </div>
          )}
          <h3 className="font-bold text-lg flex-1">{record.site || "Untitled"}</h3>
          <Dropdown>
            <Dropdown.Trigger>
              <Button isIconOnly size="sm" variant="ghost">
                <FaEllipsisV />
              </Button>
            </Dropdown.Trigger>
            <Dropdown.Popover>
              <Dropdown.Menu
                onAction={(key) => {
                  if (key === "edit") onEdit(record);
                  if (key === "delete") onDelete(record);
                }}
              >
                <Dropdown.Item id="edit" textValue="Edit">
                  Edit
                </Dropdown.Item>
                <Dropdown.Item id="delete" textValue="Delete" variant="danger">
                  Delete
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>
        </div>

        {/* Username row */}
        <div className="flex items-center gap-3">
          <FaUser className="text-default-400 shrink-0" />
          {record.username ? (
            <div
              className="flex-1 bg-default/40 rounded-lg px-3 py-1.5 text-sm font-mono flex items-center justify-between cursor-pointer hover:bg-default/60"
              onClick={() => copyToClipboard(record.username!, "Username")}
            >
              <span className="truncate">{record.username}</span>
              <FaCopy className="text-default-400 shrink-0 ml-2" size={12} />
            </div>
          ) : (
            <span className="text-sm text-default-400">No username</span>
          )}
        </div>

        {/* Email row */}
        <div className="flex items-center gap-3">
          <FaEnvelope className="text-default-400 shrink-0" />
          {record.email ? (
            <div
              className="flex-1 bg-default/40 rounded-lg px-3 py-1.5 text-sm font-mono flex items-center justify-between cursor-pointer hover:bg-default/60"
              onClick={() => copyToClipboard(record.email!, "Email")}
            >
              <span className="truncate">{record.email}</span>
              <FaCopy className="text-default-400 shrink-0 ml-2" size={12} />
            </div>
          ) : (
            <span className="text-sm text-default-400">No email</span>
          )}
        </div>

        {/* Password row */}
        <div className="flex items-center gap-3">
          <FaLock className="text-default-400 shrink-0" />
          {record.password ? (
            <div
              className="flex-1 bg-default/40 rounded-lg px-3 py-1.5 text-sm font-mono flex items-center justify-between cursor-pointer hover:bg-default/60"
              onClick={() => copyToClipboard(record.password!, "Password")}
            >
              <span className="truncate">{maskPassword(record.password)}</span>
              <FaCopy className="text-default-400 shrink-0 ml-2" size={12} />
            </div>
          ) : (
            <span className="text-sm text-default-400">No password</span>
          )}
        </div>
      </Card.Content>
    </Card>
  );
}
