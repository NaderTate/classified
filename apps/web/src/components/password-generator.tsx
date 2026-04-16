import { Button, Input, toast } from "@heroui/react";
import { useState, useCallback } from "react";
import { FaDice, FaCopy } from "react-icons/fa";

interface PasswordGeneratorProps {
  onSelect: (password: string) => void;
}

function generatePassword(length = 20): string {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-={}[]|:;<>?,./~";
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => charset[byte % charset.length]).join("");
}

export default function PasswordGenerator({ onSelect }: PasswordGeneratorProps) {
  const [generated, setGenerated] = useState(() => generatePassword());

  const regenerate = useCallback(() => {
    setGenerated(generatePassword());
  }, []);

  return (
    <div className="flex gap-2 items-end">
      <Input value={generated} readOnly className="flex-1" />
      <Button isIconOnly size="sm" variant="secondary" onPress={regenerate}>
        <FaDice />
      </Button>
      <Button
        isIconOnly
        size="sm"
        variant="secondary"
        onPress={() => {
          navigator.clipboard.writeText(generated);
          toast.success("Copied!");
        }}
      >
        <FaCopy />
      </Button>
      <Button size="sm" variant="primary" onPress={() => onSelect(generated)}>
        Use
      </Button>
    </div>
  );
}
