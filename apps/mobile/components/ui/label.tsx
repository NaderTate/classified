import { Text, TextProps } from "react-native";
import { cn } from "@/lib/cn";

export function Label({ className, ...props }: TextProps) {
  return (
    <Text
      {...props}
      className={cn("text-sm font-medium text-muted-foreground mb-2", className)}
    />
  );
}
