import { Button } from "@heroui/react";
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
      <header className="border-b border-border px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold">Classified</h1>
        <div className="flex items-center gap-2">
          <ThemeSwitch />
          <Button isIconOnly size="sm" variant="outline" onPress={() => setShowSettings(true)}>
            <FaCog />
          </Button>
          {user && (
            <div className="w-8 h-8 rounded-full bg-default flex items-center justify-center text-sm font-medium overflow-hidden">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.parentElement!.textContent = user.name.charAt(0).toUpperCase();
                  }}
                />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>
          )}
          <Button size="sm" variant="outline" onPress={() => logout()}>
            Logout
          </Button>
        </div>
      </header>
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </>
  );
}
