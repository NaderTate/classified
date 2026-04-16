import { Modal, Button, Input, Switch, useOverlayState } from "@heroui/react";
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

  const state = useOverlayState({
    isOpen,
    onOpenChange: (open) => {
      if (!open) onClose();
    },
  });

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setIsTwoFactorEnabled(user.isTwoFactorEnabled);
      setPassword("");
      setNewPassword("");
    }
  }, [user, isOpen]);

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
    <Modal state={state}>
      <Modal.Backdrop />
      <Modal.Container size="lg">
        <Modal.Dialog>
          <Modal.Header>
            <Modal.Heading>Settings</Modal.Heading>
          </Modal.Header>
          <Modal.Body className="flex flex-col gap-4">
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
                  <span className="text-xs text-default-400">Required to change password</span>
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
            <Switch isSelected={isTwoFactorEnabled} onChange={setIsTwoFactorEnabled}>
              <Switch.Control>
                <Switch.Thumb />
              </Switch.Control>
              <Switch.Content>Two-Factor Authentication</Switch.Content>
            </Switch>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="ghost" onPress={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onPress={handleSave} isDisabled={updateSettings.isPending}>
              Save
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal>
  );
}
