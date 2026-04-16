import { Button, Input } from "@heroui/react";
import { useState, useEffect } from "react";
import { useUser, useUpdateSettings } from "@/hooks/use-user";
import toast from "react-hot-toast";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { data: user } = useUser();
  const updateSettings = useUpdateSettings();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(false);
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    if (user && isOpen) {
      setName(user.name);
      setEmail(user.email);
      setIsTwoFactorEnabled(user.isTwoFactorEnabled);
      setPassword("");
      setNewPassword("");
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    const data: Record<string, unknown> = {};

    if (name !== user?.name) data.name = name;
    if (email !== user?.email) data.email = email;
    if (isTwoFactorEnabled !== user?.isTwoFactorEnabled) {
      data.isTwoFactorEnabled = isTwoFactorEnabled;
    }
    if (password && newPassword) {
      data.password = password;
      data.newPassword = newPassword;
    }

    if (Object.keys(data).length === 0) {
      onClose();
      return;
    }

    try {
      await updateSettings.mutateAsync(data);
      toast.success("Settings updated");
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update settings");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-surface rounded-2xl p-6 w-full max-w-lg mx-4 shadow-xl border border-border">
        <h2 className="text-xl font-bold mb-4">Settings</h2>
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Name</span>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          {!user?.isOAuth && (
            <>
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium">Email</span>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium">Current Password</span>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium">New Password</span>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </label>
            </>
          )}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isTwoFactorEnabled}
              onChange={(e) => setIsTwoFactorEnabled(e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm">Two-Factor Authentication</span>
          </label>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onPress={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onPress={handleSave} isDisabled={updateSettings.isPending}>
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
