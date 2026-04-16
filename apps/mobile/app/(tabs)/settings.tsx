import { useState } from "react";
import { ScrollView, View, Text, Image, Alert } from "react-native";
import { Button, Card, Input, TextField, Label, Switch } from "heroui-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/lib/auth-context";
import { useUser, useUpdateSettings } from "@/hooks/use-user";
import { useToast } from "heroui-native";

export default function SettingsScreen() {
  const { logout } = useAuth();
  const { data: user } = useUser();
  const updateSettings = useUpdateSettings();
  const { toast } = useToast();

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(user?.isTwoFactorEnabled ?? false);
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPasswordChange, setShowPasswordChange] = useState(false);

  // Sync state when user loads (only when fields are still at default)
  if (user && name === "" && user.name) {
    setName(user.name);
    setEmail(user.email);
    setIsTwoFactorEnabled(user.isTwoFactorEnabled);
  }

  const handleSave = async () => {
    const data: Record<string, unknown> = {};

    if (name !== user?.name) data.name = name;
    if (email !== user?.email) data.email = email;
    if (isTwoFactorEnabled !== user?.isTwoFactorEnabled) data.isTwoFactorEnabled = isTwoFactorEnabled;
    if (password && newPassword) {
      data.password = password;
      data.newPassword = newPassword;
    }

    if (Object.keys(data).length === 0) {
      toast.show({ label: "No changes" });
      return;
    }

    try {
      await updateSettings.mutateAsync(data);
      toast.show({ variant: "success", label: "Settings updated" });
      setPassword("");
      setNewPassword("");
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
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 24, paddingBottom: 48 }}>
        <Text style={{ color: "#fff", fontSize: 28, fontWeight: "bold" }}>Settings</Text>

        {/* Profile */}
        <Card>
          <Card.Header>
            <Card.Title>Profile</Card.Title>
          </Card.Header>
          <Card.Body style={{ gap: 16 }}>
            {user?.image && (
              <View style={{ alignItems: "center" }}>
                <Image
                  source={{ uri: user.image }}
                  style={{ width: 64, height: 64, borderRadius: 32 }}
                />
              </View>
            )}
            <TextField>
              <Label>Name</Label>
              <Input value={name} onChangeText={setName} />
            </TextField>
            {!user?.isOAuth && (
              <TextField>
                <Label>Email</Label>
                <Input
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </TextField>
            )}
          </Card.Body>
        </Card>

        {/* Security */}
        <Card>
          <Card.Header>
            <Card.Title>Security</Card.Title>
          </Card.Header>
          <Card.Body style={{ gap: 16 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ color: "#fff" }}>Two-Factor Authentication</Text>
              <Switch isSelected={isTwoFactorEnabled} onSelectedChange={setIsTwoFactorEnabled} />
            </View>

            {!user?.isOAuth && (
              <>
                <Button variant="ghost" onPress={() => setShowPasswordChange(!showPasswordChange)}>
                  <Button.Label>{showPasswordChange ? "Cancel" : "Change Password"}</Button.Label>
                </Button>
                {showPasswordChange && (
                  <>
                    <TextField>
                      <Label>Current Password</Label>
                      <Input value={password} onChangeText={setPassword} secureTextEntry />
                    </TextField>
                    <TextField>
                      <Label>New Password</Label>
                      <Input value={newPassword} onChangeText={setNewPassword} secureTextEntry />
                    </TextField>
                  </>
                )}
              </>
            )}
          </Card.Body>
        </Card>

        {/* Save */}
        <Button variant="primary" onPress={handleSave} isDisabled={updateSettings.isPending}>
          <Button.Label>{updateSettings.isPending ? "Saving..." : "Save Changes"}</Button.Label>
        </Button>

        {/* Divider */}
        <View style={{ height: 1, backgroundColor: "#27272a" }} />

        {/* Logout */}
        <Button variant="danger" onPress={handleLogout}>
          <Button.Label>Logout</Button.Label>
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}
