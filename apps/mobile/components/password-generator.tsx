import { View } from "react-native";
import { Button, Input, TextField, Label } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useCallback } from "react";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { useToast } from "heroui-native";

interface PasswordGeneratorProps {
  onSelect: (password: string) => void;
}

function generatePassword(length = 20): string {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|:;<>?,./~";
  const array = new Uint8Array(length);
  globalThis.crypto.getRandomValues(array);
  return Array.from(array, (byte) => charset[byte % charset.length]).join("");
}

export default function PasswordGenerator({ onSelect }: PasswordGeneratorProps) {
  const [generated, setGenerated] = useState(() => generatePassword());
  const { toast } = useToast();

  const regenerate = useCallback(() => setGenerated(generatePassword()), []);

  const copy = async () => {
    await Clipboard.setStringAsync(generated);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    toast.show({ variant: "success", label: "Copied!" });
  };

  return (
    <View style={{ gap: 8 }}>
      <TextField>
        <Label>Generated Password</Label>
        <Input value={generated} editable={false} />
      </TextField>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <Button size="sm" variant="ghost" onPress={regenerate}>
          <Ionicons name="dice" size={16} color="#a1a1aa" />
          <Button.Label>Regenerate</Button.Label>
        </Button>
        <Button size="sm" variant="ghost" onPress={copy}>
          <Ionicons name="copy-outline" size={16} color="#a1a1aa" />
          <Button.Label>Copy</Button.Label>
        </Button>
        <Button size="sm" variant="primary" onPress={() => onSelect(generated)}>
          <Button.Label>Use</Button.Label>
        </Button>
      </View>
    </View>
  );
}
