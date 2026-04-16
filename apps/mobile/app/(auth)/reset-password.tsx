import { ScrollView, Alert } from "react-native";
import { Button, Card, Input, TextField, Label } from "heroui-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { api } from "@/lib/api-client";
import { useToast } from "heroui-native";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = async () => {
    if (!email) return;
    setIsLoading(true);

    try {
      await api.auth.resetPassword({ email });
      toast.show({
        variant: "success",
        label: "Email Sent",
        description: "Check your inbox for a reset link",
      });
      router.back();
    } catch (err) {
      Alert.alert("Error", err instanceof Error ? err.message : "Something went wrong");
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
          <Card.Title>Reset Password</Card.Title>
          <Card.Description>We'll send a reset link to your email</Card.Description>
        </Card.Header>
        <Card.Body style={{ gap: 16 }}>
          <TextField>
            <Label>Email</Label>
            <Input
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              textContentType="emailAddress"
            />
          </TextField>

          <Button variant="primary" onPress={handleReset} isDisabled={isLoading}>
            <Button.Label>{isLoading ? "Sending..." : "Send Reset Link"}</Button.Label>
          </Button>

          <Button variant="ghost" onPress={() => router.back()}>
            <Button.Label>Back to login</Button.Label>
          </Button>
        </Card.Body>
      </Card>
    </ScrollView>
  );
}
