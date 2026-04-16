import { Button, Input, Modal, Switch, TextField, Label, toast } from "@heroui/react";
import { useState, useEffect } from "react";
import { useUser, useUpdateSettings } from "@/hooks/use-user";

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
      toast.danger(err instanceof Error ? err.message : "Failed to update settings");
    }
  };

  if (!isOpen) return null;

  return (
    <Modal defaultOpen onOpenChange={(open) => !open && onClose()}>
      <Modal.Backdrop>
        <Modal.Container size="lg">
        <Modal.Dialog>
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>Settings</Modal.Heading>
          </Modal.Header>
          <Modal.Body className="flex flex-col gap-4">
            <TextField>
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </TextField>
            {!user?.isOAuth && (
              <>
                <TextField>
                  <Label>Email</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </TextField>
                <TextField>
                  <Label>Current Password</Label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </TextField>
                <TextField>
                  <Label>New Password</Label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </TextField>
              </>
            )}
            <Switch isSelected={isTwoFactorEnabled} onChange={(val) => setIsTwoFactorEnabled(val)}>
              <Switch.Control><Switch.Thumb /></Switch.Control>
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
      </Modal.Backdrop>
    </Modal>
  );
}
