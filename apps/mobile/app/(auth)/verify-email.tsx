import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";

export default function VerifyEmailScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Missing verification token");
      return;
    }

    api.auth
      .verifyEmail({ token })
      .then((res: { success: string }) => {
        setStatus("success");
        setMessage(res.success);
      })
      .catch((err: unknown) => {
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "Verification failed");
      });
  }, [token]);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 justify-center items-center px-6">
        {status === "loading" && <ActivityIndicator size="large" color="#3b82f6" />}
        {status === "success" && (
          <>
            <Text className="text-green-500 text-lg mb-6 text-center">{message}</Text>
            <Button label="Go to Login" onPress={() => router.replace("/(auth)/login")} />
          </>
        )}
        {status === "error" && (
          <>
            <Text className="text-destructive text-lg mb-6 text-center">{message}</Text>
            <Button
              label="Back to Login"
              variant="ghost"
              onPress={() => router.replace("/(auth)/login")}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
