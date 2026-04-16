import { ScrollView, Alert } from "react-native";
import { Button, Card, Input, TextField, Label } from "heroui-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { api } from "@/lib/api-client";
import { useToast } from "heroui-native";

export default function SignupScreen() {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password) return;
    setIsLoading(true);

    try {
      const result = await api.auth.signup({ name, email, password });
      toast.show({ variant: "success", label: "Success", description: result.success });
      router.back();
    } catch (err) {
      Alert.alert("Signup Failed", err instanceof Error ? err.message : "Something went wrong");
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
          <Card.Title>Create Account</Card.Title>
          <Card.Description>Sign up for Classified</Card.Description>
        </Card.Header>
        <Card.Body style={{ gap: 16 }}>
          <TextField>
            <Label>Name</Label>
            <Input placeholder="Your name" value={name} onChangeText={setName} textContentType="name" />
          </TextField>

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
              placeholder="Min 6 characters"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              textContentType="newPassword"
            />
          </TextField>

          <Button variant="primary" onPress={handleSignup} isDisabled={isLoading}>
            <Button.Label>{isLoading ? "Creating..." : "Sign Up"}</Button.Label>
          </Button>

          <Button variant="ghost" onPress={() => router.back()}>
            <Button.Label>Already have an account? Sign in</Button.Label>
          </Button>
        </Card.Body>
      </Card>
    </ScrollView>
  );
}
