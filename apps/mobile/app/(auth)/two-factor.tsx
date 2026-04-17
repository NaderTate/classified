import { ScrollView, Alert, View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
    } catch (err) {
      Alert.alert("Invalid Code", err instanceof Error ? err.message : "Please try again");
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
          <Text className="text-3xl font-bold mb-2">Two-factor auth</Text>
          <Text className="text-muted-foreground text-center">
            Enter the 6-digit code sent to your email
          </Text>
        </View>

        <View className="gap-4">
          <View>
            <Label>Code</Label>
            <Input
              placeholder="000000"
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              maxLength={6}
              textContentType="oneTimeCode"
              className="text-center text-2xl tracking-widest"
            />
          </View>

          <Button
            label={isLoading ? "Verifying..." : "Verify"}
            onPress={handleVerify}
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
