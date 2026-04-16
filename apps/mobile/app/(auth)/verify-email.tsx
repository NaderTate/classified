import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { Button } from "heroui-native";
import { useLocalSearchParams, useRouter } from "expo-router";
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
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
        backgroundColor: "#000",
      }}
    >
      {status === "loading" && <ActivityIndicator size="large" color="#3b82f6" />}
      {status === "success" && (
        <>
          <Text style={{ color: "#22c55e", fontSize: 18, marginBottom: 16 }}>{message}</Text>
          <Button variant="primary" onPress={() => router.replace("/(auth)/login")}>
            <Button.Label>Go to Login</Button.Label>
          </Button>
        </>
      )}
      {status === "error" && (
        <>
          <Text style={{ color: "#ef4444", fontSize: 18, marginBottom: 16 }}>{message}</Text>
          <Button variant="ghost" onPress={() => router.replace("/(auth)/login")}>
            <Button.Label>Back to Login</Button.Label>
          </Button>
        </>
      )}
    </View>
  );
}
