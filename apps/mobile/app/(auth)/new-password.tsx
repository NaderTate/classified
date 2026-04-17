import { ScrollView, Alert, View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api-client";

export default function NewPasswordScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!password || !token) return;
    setIsLoading(true);
    try {
      const result = await api.auth.newPassword({ password, token });
      Alert.alert("Success", result.success, [
        { text: "OK", onPress: () => router.replace("/(auth)/login") },
      ]);
    } catch (err) {
      Alert.alert("Error", err instanceof Error ? err.message : "Failed to reset password");
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
          <Text className="text-3xl font-bold mb-2">New password</Text>
          <Text className="text-muted-foreground">Enter your new password</Text>
        </View>

        <View className="gap-4">
          <View>
            <Label>New Password</Label>
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
            label={isLoading ? "Resetting..." : "Reset Password"}
            onPress={handleSubmit}
            loading={isLoading}
            className="mt-2"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
