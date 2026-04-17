import { useEffect, useState } from "react";
import { ScrollView, View, Image, Alert, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/auth-context";
import { useUser, useUpdateSettings } from "@/hooks/use-user";

export default function SettingsScreen() {
  const { logout } = useAuth();
  const { data: user } = useUser();
  const updateSettings = useUpdateSettings();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(false);
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPasswordChange, setShowPasswordChange] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name ?? "");
      setEmail(user.email ?? "");
      setIsTwoFactorEnabled(user.isTwoFactorEnabled ?? false);
    }
  }, [user]);

  const handleSave = async () => {
    const data: Record<string, unknown> = {};
    if (name !== user?.name) data.name = name;
    if (email !== user?.email) data.email = email;
    if (isTwoFactorEnabled !== user?.isTwoFactorEnabled)
      data.isTwoFactorEnabled = isTwoFactorEnabled;
    if (password && newPassword) {
      data.password = password;
      data.newPassword = newPassword;
    }

    if (Object.keys(data).length === 0) {
      Alert.alert("No changes", "Nothing to save.");
      return;
    }

    try {
      await updateSettings.mutateAsync(data);
      Alert.alert("Saved", "Settings updated.");
      setPassword("");
      setNewPassword("");
      setShowPasswordChange(false);
    } catch (err) {
      Alert.alert("Error", err instanceof Error ? err.message : "Failed to update settings");
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: () => logout() },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
        <Text className="text-2xl font-bold mb-5">Settings</Text>

        <Card className="mb-4">
          <Text className="text-lg font-semibold mb-4">Profile</Text>
          <View className="gap-4">
            {user?.image && (
              <View className="items-center mb-2">
                <Image source={{ uri: user.image }} className="h-20 w-20 rounded-full" />
              </View>
            )}
            <View>
              <Label>Name</Label>
              <Input value={name} onChangeText={setName} />
            </View>
            {!user?.isOAuth && (
              <View>
                <Label>Email</Label>
                <Input
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            )}
          </View>
        </Card>

        <Card className="mb-4">
          <Text className="text-lg font-semibold mb-4">Security</Text>
          <View className="gap-4">
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="font-medium">Two-Factor Authentication</Text>
                <Text className="text-muted-foreground text-xs mt-1">
                  Require a code sent to email
                </Text>
              </View>
              <Switch
                value={isTwoFactorEnabled}
                onValueChange={setIsTwoFactorEnabled}
                trackColor={{ false: "#262626", true: "#1d4ed8" }}
                thumbColor={isTwoFactorEnabled ? "#3b82f6" : "#737373"}
              />
            </View>

            {!user?.isOAuth && (
              <>
                <Separator />
                <Button
                  variant="ghost"
                  label={showPasswordChange ? "Cancel password change" : "Change password"}
                  onPress={() => setShowPasswordChange(!showPasswordChange)}
                />
                {showPasswordChange && (
                  <>
                    <View>
                      <Label>Current Password</Label>
                      <Input value={password} onChangeText={setPassword} secureTextEntry />
                    </View>
                    <View>
                      <Label>New Password</Label>
                      <Input
                        value={newPassword}
                        onChangeText={setNewPassword}
                        secureTextEntry
                      />
                    </View>
                  </>
                )}
              </>
            )}
          </View>
        </Card>

        <Button
          label={updateSettings.isPending ? "Saving..." : "Save changes"}
          onPress={handleSave}
          loading={updateSettings.isPending}
          className="mb-3"
        />

        <Button label="Logout" variant="destructive" onPress={handleLogout} />
      </ScrollView>
    </SafeAreaView>
  );
}
