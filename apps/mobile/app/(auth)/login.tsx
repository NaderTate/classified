import { ScrollView, Alert, View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import type { LoginResponse } from "@classified/shared";

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return;
    setIsLoading(true);
    try {
      const result: LoginResponse = await login({ email, password });
      if ("twoFactor" in result) {
        router.push({ pathname: "/(auth)/two-factor", params: { email: result.email } });
      } else {
        router.replace("/(tabs)");
      }
    } catch (err) {
      Alert.alert("Login Failed", err instanceof Error ? err.message : "Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="items-center mb-10">
          <Text className="text-3xl font-bold mb-2">Welcome back</Text>
          <Text className="text-muted-foreground">Sign in to Classified</Text>
        </View>

        <View className="gap-4">
          <View>
            <Label>Email</Label>
            <Input
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              textContentType="emailAddress"
            />
          </View>

          <View>
            <Label>Password</Label>
            <Input
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              textContentType="password"
              rightIcon={
                <Pressable onPress={() => setShowPassword((s) => !s)} hitSlop={8}>
                  <Text className="text-primary text-sm">{showPassword ? "Hide" : "Show"}</Text>
                </Pressable>
              }
            />
          </View>

          <Button
            label={isLoading ? "Signing in..." : "Sign In"}
            onPress={handleLogin}
            loading={isLoading}
            className="mt-2"
          />

          <Pressable onPress={() => router.push("/(auth)/reset-password")} className="self-center mt-2">
            <Text className="text-primary text-sm">Forgot password?</Text>
          </Pressable>
        </View>

        <View className="flex-row items-center justify-center mt-8 gap-2">
          <Text className="text-muted-foreground">Don't have an account?</Text>
          <Pressable onPress={() => router.push("/(auth)/signup")}>
            <Text className="text-primary font-semibold">Sign up</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
