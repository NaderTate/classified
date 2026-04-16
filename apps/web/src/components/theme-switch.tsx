import { Button } from "@heroui/react";
import { useEffect, useState } from "react";
import { FaMoon, FaSun } from "react-icons/fa";

export default function ThemeSwitch() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.classList.toggle("light", !isDark);
  }, [isDark]);

  return (
    <Button isIconOnly size="sm" variant="ghost" onPress={() => setIsDark(!isDark)}>
      {isDark ? <FaSun /> : <FaMoon />}
    </Button>
  );
}
