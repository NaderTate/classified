import { ScrollView, Alert } from "react-native";
import { Button, Card, Input, TextField, Label } from "heroui-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

export default function TwoFactorScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const router = useRouter();
  const { loginWithTwoFactor } = useAuth();
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async () => {
    if (!code || code.length !== 6) return;
    setIsLoading(true);

    try {
      await loginWithTwoFactor({ email: email!, code });
      // Auth context will redirect to tabs via AuthRedirect
    } catch (err) {
      Alert.alert("Invalid Code", err instanceof Error ? err.message : "Please try again");
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
          <Card.Title>Two-Factor Authentication</Card.Title>
          <Card.Description>Enter the 6-digit code sent to your email</Card.Description>
        </Card.Header>
        <Card.Body style={{ gap: 16 }}>
          <TextField>
            <Label>Code</Label>
            <Input
              placeholder="000000"
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              maxLength={6}
              textContentType="oneTimeCode"
            />
          </TextField>

          <Button variant="primary" onPress={handleVerify} isDisabled={isLoading}>
            <Button.Label>{isLoading ? "Verifying..." : "Verify"}</Button.Label>
          </Button>

          <Button variant="ghost" onPress={() => router.back()}>
            <Button.Label>Back to login</Button.Label>
          </Button>
        </Card.Body>
      </Card>
    </ScrollView>
  );
}
