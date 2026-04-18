import { TextInput, TextInputProps, View } from "react-native";
import { forwardRef, useState } from "react";
import { cn } from "@/lib/cn";

type InputProps = TextInputProps & {
  className?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
};

export const Input = forwardRef<TextInput, InputProps>(
  ({ className, leftIcon, rightIcon, onFocus, onBlur, ...props }, ref) => {
    const [focused, setFocused] = useState(false);

    return (
      <View
        className={cn(
          "h-12 flex-row items-center rounded-xl bg-input border px-3",
          focused ? "border-primary" : "border-border",
        )}
      >
        {leftIcon ? <View className="mr-2">{leftIcon}</View> : null}
        <TextInput
          ref={ref}
          placeholderTextColor="#737373"
          selectionColor="#3b82f6"
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...props}
          className={cn("flex-1 h-12 text-foreground text-base", className)}
        />
        {rightIcon ? (
          <View className="ml-2 flex-row items-center gap-1">{rightIcon}</View>
        ) : null}
      </View>
    );
  },
);

Input.displayName = "Input";
