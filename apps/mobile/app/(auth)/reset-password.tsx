import { ScrollView, Alert, View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api-client";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = async () => {
    if (!email) return;
    setIsLoading(true);
    try {
      await api.auth.resetPassword({ email });
      Alert.alert("Email sent", "Check your inbox for a reset link", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err) {
      Alert.alert("Error", err instanceof Error ? err.message : "Something went wrong");
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
          <Text className="text-3xl font-bold mb-2">Reset password</Text>
          <Text className="text-muted-foreground text-center">
            We'll send a reset link to your email
          </Text>
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

          <Button
            label={isLoading ? "Sending..." : "Send Reset Link"}
            onPress={handleReset}
            loading={isLoading}
            className="mt-2"
          />

          <Pressable onPress={() => router.back()} className="self-center mt-2">
            <Text className="text-primary text-sm">Back to login</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
