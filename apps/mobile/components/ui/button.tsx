import { Pressable, PressableProps, Text, View, ActivityIndicator } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  "flex-row items-center justify-center rounded-xl active:opacity-70",
  {
    variants: {
      variant: {
        primary: "bg-primary",
        secondary: "bg-muted",
        destructive: "bg-destructive",
        ghost: "bg-transparent",
        outline: "bg-transparent border border-border",
      },
      size: {
        sm: "h-9 px-3",
        md: "h-12 px-5",
        lg: "h-14 px-6",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

const textVariants = cva("font-semibold text-base", {
  variants: {
    variant: {
      primary: "text-primary-foreground",
      secondary: "text-foreground",
      destructive: "text-destructive-foreground",
      ghost: "text-foreground",
      outline: "text-foreground",
    },
  },
  defaultVariants: { variant: "primary" },
});

type ButtonProps = PressableProps &
  VariantProps<typeof buttonVariants> & {
    label?: string;
    loading?: boolean;
    className?: string;
    labelClassName?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    children?: React.ReactNode;
  };

export function Button({
  variant,
  size,
  label,
  loading,
  disabled,
  className,
  labelClassName,
  leftIcon,
  rightIcon,
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      {...props}
      disabled={isDisabled}
      android_ripple={{ color: "rgba(255,255,255,0.1)" }}
      className={cn(
        buttonVariants({ variant, size }),
        isDisabled && "opacity-50",
        className,
      )}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" || variant === "destructive" ? "#fff" : "#3b82f6"} />
      ) : (
        <View className="flex-row items-center gap-2">
          {leftIcon}
          {label ? (
            <Text className={cn(textVariants({ variant }), labelClassName)}>{label}</Text>
          ) : (
            children
          )}
          {rightIcon}
        </View>
      )}
    </Pressable>
  );
}
