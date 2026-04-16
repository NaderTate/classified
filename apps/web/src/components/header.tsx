import { Button } from "@heroui/react";
import { useAuth } from "@/hooks/use-auth";

export default function Header() {
  const { logout } = useAuth();

  return (
    <header className="border-b border-divider px-4 py-3 flex items-center justify-between">
      <h1 className="text-xl font-bold">Classified</h1>
      <Button size="sm" variant="flat" onPress={() => logout()}>
        Logout
      </Button>
    </header>
  );
}
