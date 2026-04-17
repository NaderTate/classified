import { ScrollView, Alert, View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api-client";

export default function SignupScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password) return;
    setIsLoading(true);
    try {
      const result = await api.auth.signup({ name, email, password });
      Alert.alert("Account created", result.success, [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err) {
      Alert.alert("Signup Failed", err instanceof Error ? err.message : "Something went wrong");
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
          <Text className="text-3xl font-bold mb-2">Create account</Text>
          <Text className="text-muted-foreground">Sign up for Classified</Text>
        </View>

        <View className="gap-4">
          <View>
            <Label>Name</Label>
            <Input placeholder="Your name" value={name} onChangeText={setName} textContentType="name" />
          </View>

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
              placeholder="Min 6 characters"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              textContentType="newPassword"
              rightIcon={
                <Pressable onPress={() => setShowPassword((s) => !s)} hitSlop={8}>
                  <Text className="text-primary text-sm">{showPassword ? "Hide" : "Show"}</Text>
                </Pressable>
              }
            />
          </View>

          <Button
            label={isLoading ? "Creating..." : "Sign Up"}
            onPress={handleSignup}
            loading={isLoading}
            className="mt-2"
          />
        </View>

        <View className="flex-row items-center justify-center mt-8 gap-2">
          <Text className="text-muted-foreground">Already have an account?</Text>
          <Pressable onPress={() => router.back()}>
            <Text className="text-primary font-semibold">Sign in</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
