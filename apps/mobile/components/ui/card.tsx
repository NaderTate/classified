import { View, ViewProps } from "react-native";
import { cn } from "@/lib/cn";

export function Card({ className, ...props }: ViewProps) {
  return (
    <View
      {...props}
      className={cn("rounded-2xl bg-card border border-border p-5", className)}
    />
  );
}
