import { Button, Avatar } from "@heroui/react";
import { useState } from "react";
import { FaCog } from "react-icons/fa";
import { useAuth } from "@/hooks/use-auth";
import { useUser } from "@/hooks/use-user";
import ThemeSwitch from "./theme-switch";
import SettingsModal from "./settings-modal";

export default function Header() {
  const { logout } = useAuth();
  const { data: user } = useUser();
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <header className="border-b border-divider px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold">Classified</h1>
        <div className="flex items-center gap-2">
          <ThemeSwitch />
          <Button isIconOnly size="sm" variant="ghost" onPress={() => setShowSettings(true)}>
            <FaCog />
          </Button>
          {user && (
            <Avatar size="sm">
              {user.image ? (
                <Avatar.Image src={user.image} />
              ) : (
                <Avatar.Fallback>{user.name.charAt(0).toUpperCase()}</Avatar.Fallback>
              )}
            </Avatar>
          )}
          <Button size="sm" variant="ghost" onPress={() => logout()}>
            Logout
          </Button>
        </div>
      </header>
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </>
  );
}
