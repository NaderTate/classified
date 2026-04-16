import { ScrollView, Alert } from "react-native";
import { Button, Card, Input, TextField, Label } from "heroui-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { api } from "@/lib/api-client";
import { useToast } from "heroui-native";

export default function NewPasswordScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!password || !token) return;
    setIsLoading(true);

    try {
      const result = await api.auth.newPassword({ password, token });
      toast.show({ variant: "success", label: "Success", description: result.success });
      router.replace("/(auth)/login");
    } catch (err) {
      Alert.alert("Error", err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24 }}
      keyboardShouldPersistTaps="handled"
    >
      <Card>
        <Card.Header style={{ alignItems: "center" }}>
          <Card.Title>New Password</Card.Title>
          <Card.Description>Enter your new password</Card.Description>
        </Card.Header>
        <Card.Body style={{ gap: 16 }}>
          <TextField>
            <Label>New Password</Label>
            <Input
              placeholder="Min 6 characters"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              textContentType="newPassword"
            />
          </TextField>

          <Button variant="primary" onPress={handleSubmit} isDisabled={isLoading}>
            <Button.Label>{isLoading ? "Resetting..." : "Reset Password"}</Button.Label>
          </Button>
        </Card.Body>
      </Card>
    </ScrollView>
  );
}
