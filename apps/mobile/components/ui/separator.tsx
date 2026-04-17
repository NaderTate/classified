import { View } from "react-native";
import { cn } from "@/lib/cn";

export function Separator({ className }: { className?: string }) {
  return <View className={cn("h-px bg-border my-3", className)} />;
}
