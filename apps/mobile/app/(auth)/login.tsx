import { ScrollView, Alert } from "react-native";
import { Button, Card, Input, TextField, Label, Separator } from "heroui-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import type { LoginResponse } from "@classified/shared";

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return;
    setIsLoading(true);

    try {
      const result: LoginResponse = await login({ email, password });
      if ("twoFactor" in result) {
        router.push({ pathname: "/(auth)/two-factor", params: { email: result.email } });
      }
      // If tokens returned, auth context handles redirect via AuthRedirect
    } catch (err) {
      Alert.alert("Login Failed", err instanceof Error ? err.message : "Invalid credentials");
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
          <Card.Title>Welcome Back</Card.Title>
          <Card.Description>Sign in to Classified</Card.Description>
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

          <TextField>
            <Label>Password</Label>
            <Input
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              textContentType="password"
            />
          </TextField>

          <Button variant="primary" onPress={handleLogin} isDisabled={isLoading}>
            <Button.Label>{isLoading ? "Signing in..." : "Sign In"}</Button.Label>
          </Button>

          <Separator />

          <Button variant="ghost" onPress={() => router.push("/(auth)/signup")}>
            <Button.Label>Don't have an account? Sign up</Button.Label>
          </Button>

          <Button variant="ghost" onPress={() => router.push("/(auth)/reset-password")}>
            <Button.Label>Forgot password?</Button.Label>
          </Button>
        </Card.Body>
      </Card>
    </ScrollView>
  );
}
