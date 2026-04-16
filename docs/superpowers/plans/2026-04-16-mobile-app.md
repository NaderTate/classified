# Mobile App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Classified mobile app with Expo + React Native + HeroUI Native, providing full feature parity with the web app — login, signup, OAuth, 2FA, records CRUD with search and pagination, password copy with haptics, settings, and biometric unlock.

**Architecture:** Expo managed workflow with Expo Router (file-based routing). Auth stack for unauthenticated screens, tab navigator for authenticated screens (Records + Settings). API consumed via `@classified/shared` API client. Tokens stored in `expo-secure-store`. HeroUI Native for all UI components with Uniwind (Tailwind for RN).

**Tech Stack:** Expo SDK 55, React Native, Expo Router, HeroUI Native, Uniwind, TanStack Query, expo-secure-store, expo-haptics, react-native-reanimated

**Spec:** `docs/superpowers/specs/2026-04-16-classified-v2-design.md` — Section 7 (Mobile App)

---

## File Structure

```
apps/mobile/
├── app.json                              # Expo config
├── package.json
├── tsconfig.json
├── metro.config.js                       # Uniwind metro config
├── global.css                            # Tailwind + Uniwind + HeroUI styles
├── app/
│   ├── _layout.tsx                       # Root layout — providers (Query, HeroUI, Auth)
│   ├── (auth)/
│   │   ├── _layout.tsx                   # Auth stack layout
│   │   ├── login.tsx                     # Login screen
│   │   ├── signup.tsx                    # Signup screen
│   │   ├── two-factor.tsx               # 2FA code entry
│   │   ├── verify-email.tsx             # Email verification (deep link)
│   │   ├── reset-password.tsx           # Request password reset
│   │   └── new-password.tsx             # Set new password (deep link)
│   └── (tabs)/
│       ├── _layout.tsx                   # Tab navigator layout
│       ├── index.tsx                     # Records tab — list with search
│       └── settings.tsx                  # Settings tab
├── components/
│   ├── record-card.tsx                   # Single record display
│   ├── record-form.tsx                   # Create/edit record dialog
│   ├── confirm-delete.tsx               # Delete confirmation dialog
│   └── password-generator.tsx           # Password generator
├── lib/
│   ├── api-client.ts                    # API client instance with secure token store
│   ├── query-client.ts                  # TanStack Query client
│   └── auth-context.tsx                 # Auth context provider
└── hooks/
    ├── use-records.ts                    # Records query hooks
    └── use-user.ts                       # User profile query hooks
```

---

### Task 1: Initialize Expo App with HeroUI Native

**Files:**
- Create: `apps/mobile/package.json`
- Create: `apps/mobile/app.json`
- Create: `apps/mobile/tsconfig.json`
- Create: `apps/mobile/metro.config.js`
- Create: `apps/mobile/global.css`
- Create: `apps/mobile/app/_layout.tsx`
- Create: `apps/mobile/app/index.tsx`

- [ ] **Step 1: Create apps/mobile/package.json**

```json
{
  "name": "@classified/mobile",
  "version": "0.0.1",
  "private": true,
  "main": "expo-router/entry",
  "scripts": {
    "dev": "expo start",
    "android": "expo run:android",
    "ios": "expo run:ios",
    "lint": "eslint app/ components/ lib/ hooks/",
    "type-check": "tsc --noEmit",
    "format:check": "prettier --check \"**/*.{ts,tsx}\"",
    "format": "prettier --write \"**/*.{ts,tsx}\""
  },
  "dependencies": {
    "@classified/shared": "workspace:*",
    "@gorhom/bottom-sheet": "^5.2.8",
    "@tanstack/react-query": "^5.75.5",
    "expo": "~55.0.0",
    "expo-haptics": "~14.1.0",
    "expo-linking": "~7.1.6",
    "expo-router": "~5.0.0",
    "expo-secure-store": "~14.2.3",
    "expo-splash-screen": "~0.30.10",
    "expo-status-bar": "~2.2.3",
    "expo-web-browser": "~14.1.6",
    "heroui-native": "latest",
    "react": "^19.1.0",
    "react-native": "~0.79.2",
    "react-native-gesture-handler": "~2.28.0",
    "react-native-reanimated": "~4.1.1",
    "react-native-safe-area-context": "~5.6.0",
    "react-native-screens": "~4.16.0",
    "react-native-svg": "~15.12.1",
    "react-native-worklets": "~0.5.1",
    "tailwind-merge": "^3.4.0",
    "tailwind-variants": "^3.2.2",
    "uniwind": "latest"
  },
  "devDependencies": {
    "@types/react": "^19.1.2",
    "eslint": "^9.26.0",
    "prettier": "^3.5.3",
    "typescript": "^5.8.3"
  }
}
```

- [ ] **Step 2: Create apps/mobile/app.json**

```json
{
  "expo": {
    "name": "Classified",
    "slug": "classified",
    "version": "1.0.0",
    "orientation": "portrait",
    "scheme": "classified",
    "userInterfaceStyle": "dark",
    "newArchEnabled": true,
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.classified.app"
    },
    "android": {
      "package": "com.classified.app",
      "adaptiveIcon": {
        "backgroundColor": "#000000"
      }
    },
    "plugins": [
      "expo-router",
      "expo-secure-store",
      "expo-haptics"
    ]
  }
}
```

- [ ] **Step 3: Create apps/mobile/tsconfig.json**

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts", "expo-env.d.ts"]
}
```

- [ ] **Step 4: Create apps/mobile/metro.config.js**

```javascript
const { getDefaultConfig } = require("expo/metro-config");
const { withUniwindConfig } = require("uniwind/metro");
const path = require("path");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Monorepo support: watch all workspace packages
config.watchFolders = [monorepoRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];

module.exports = withUniwindConfig(config, {
  cssEntryFile: "./global.css",
});
```

- [ ] **Step 5: Create apps/mobile/global.css**

```css
@import "tailwindcss";
@import "uniwind";
@import "heroui-native/styles";

@source "./app/**/*.{ts,tsx}";
@source "./components/**/*.{ts,tsx}";
@source "./node_modules/heroui-native/lib";
```

- [ ] **Step 6: Create apps/mobile/app/_layout.tsx**

Minimal root layout to verify HeroUI Native works:

```tsx
import "../global.css";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { HeroUINativeProvider } from "heroui-native";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <HeroUINativeProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }} />
      </HeroUINativeProvider>
    </GestureHandlerRootView>
  );
}
```

- [ ] **Step 7: Create apps/mobile/app/index.tsx**

Placeholder screen:

```tsx
import { View, Text } from "react-native";
import { Button } from "heroui-native";

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" }}>
      <Text style={{ color: "#fff", fontSize: 24, marginBottom: 16 }}>Classified</Text>
      <Button>
        <Button.Label>Test Button</Button.Label>
      </Button>
    </View>
  );
}
```

- [ ] **Step 8: Install dependencies**

```bash
cd /c/Users/Nader/OneDrive/Documents/Projects/classified
bun install
```

- [ ] **Step 9: Verify the app starts**

```bash
cd apps/mobile
bunx expo start
```

Scan QR code with Expo Go or press `i` for iOS simulator / `a` for Android emulator. Should show "Classified" with a HeroUI button.

- [ ] **Step 10: Commit**

```bash
cd /c/Users/Nader/OneDrive/Documents/Projects/classified
git add apps/mobile/
git commit -m "feat: initialize Expo app with HeroUI Native and Uniwind"
```

---

### Task 2: Auth Context with Secure Token Storage

**Files:**
- Create: `apps/mobile/lib/api-client.ts`
- Create: `apps/mobile/lib/query-client.ts`
- Create: `apps/mobile/lib/auth-context.tsx`

- [ ] **Step 1: Create apps/mobile/lib/api-client.ts**

```typescript
import { createApiClient } from "@classified/shared";
import * as SecureStore from "expo-secure-store";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3001";

const REFRESH_TOKEN_KEY = "classified_refresh_token";

let accessToken: string | null = null;

export const tokenStore = {
  getAccessToken: () => accessToken,
  getRefreshToken: () => {
    try {
      return SecureStore.getItem(REFRESH_TOKEN_KEY);
    } catch {
      return null;
    }
  },
  setTokens: (tokens: { accessToken: string; refreshToken: string }) => {
    accessToken = tokens.accessToken;
    try {
      SecureStore.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    } catch {
      // SecureStore may fail on some devices
    }
  },
  clearTokens: () => {
    accessToken = null;
    try {
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    } catch {
      // ignore
    }
  },
};

export const api = createApiClient(API_URL, tokenStore);
```

- [ ] **Step 2: Create apps/mobile/lib/query-client.ts**

```typescript
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});
```

- [ ] **Step 3: Create apps/mobile/lib/auth-context.tsx**

```tsx
import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { api, tokenStore } from "./api-client";
import { queryClient } from "./query-client";
import type { AuthTokens, LoginInput, LoginResponse, TwoFactorInput } from "@classified/shared";

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginInput) => Promise<LoginResponse>;
  loginWithTwoFactor: (data: TwoFactorInput) => Promise<void>;
  loginWithTokens: (tokens: AuthTokens) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const tryRefresh = async () => {
      const refreshed = await api.auth.refresh();
      setIsAuthenticated(refreshed);
      setIsLoading(false);
    };
    tryRefresh();
  }, []);

  const loginWithTokens = useCallback((tokens: AuthTokens) => {
    tokenStore.setTokens(tokens);
    setIsAuthenticated(true);
  }, []);

  const login = useCallback(
    async (data: LoginInput): Promise<LoginResponse> => {
      const response = await api.auth.login(data);
      if ("accessToken" in response) {
        loginWithTokens(response);
      }
      return response;
    },
    [loginWithTokens],
  );

  const loginWithTwoFactor = useCallback(
    async (data: TwoFactorInput) => {
      const tokens = await api.auth.twoFactor(data);
      loginWithTokens(tokens);
    },
    [loginWithTokens],
  );

  const logout = useCallback(async () => {
    const rt = tokenStore.getRefreshToken();
    if (rt) {
      await api.auth.logout(rt).catch(() => {});
    }
    tokenStore.clearTokens();
    queryClient.clear();
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isLoading, login, loginWithTwoFactor, loginWithTokens, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
```

- [ ] **Step 4: Commit**

```bash
cd /c/Users/Nader/OneDrive/Documents/Projects/classified
git add apps/mobile/lib/
git commit -m "feat: add auth context with secure token storage"
```

---

### Task 3: Expo Router Layout with Auth Routing

**Files:**
- Modify: `apps/mobile/app/_layout.tsx`
- Create: `apps/mobile/app/(auth)/_layout.tsx`
- Create: `apps/mobile/app/(tabs)/_layout.tsx`
- Delete: `apps/mobile/app/index.tsx`
- Create: `apps/mobile/hooks/use-records.ts`
- Create: `apps/mobile/hooks/use-user.ts`

- [ ] **Step 1: Update apps/mobile/app/_layout.tsx**

Replace the placeholder with full provider stack and auth redirect:

```tsx
import "../global.css";
import { useEffect } from "react";
import { Slot, useRouter, useSegments } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { HeroUINativeProvider } from "heroui-native";
import { QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { queryClient } from "@/lib/query-client";

function AuthRedirect() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, isLoading, segments]);

  return <Slot />;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <HeroUINativeProvider config={{ toast: { defaultProps: { placement: "bottom" } } }}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <StatusBar style="light" />
            <AuthRedirect />
          </AuthProvider>
        </QueryClientProvider>
      </HeroUINativeProvider>
    </GestureHandlerRootView>
  );
}
```

- [ ] **Step 2: Create apps/mobile/app/(auth)/_layout.tsx**

```tsx
import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#000" },
        animation: "slide_from_right",
      }}
    />
  );
}
```

- [ ] **Step 3: Create apps/mobile/app/(tabs)/_layout.tsx**

```tsx
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: "#18181b", borderTopColor: "#27272a" },
        tabBarActiveTintColor: "#3b82f6",
        tabBarInactiveTintColor: "#71717a",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Records",
          tabBarIcon: ({ color, size }) => <Ionicons name="key" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => <Ionicons name="settings" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
```

- [ ] **Step 4: Delete apps/mobile/app/index.tsx**

This file is replaced by `(tabs)/index.tsx`.

- [ ] **Step 5: Create apps/mobile/app/(tabs)/index.tsx (placeholder)**

```tsx
import { View, Text } from "react-native";

export default function RecordsScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" }}>
      <Text style={{ color: "#fff" }}>Records — coming soon</Text>
    </View>
  );
}
```

- [ ] **Step 6: Create apps/mobile/app/(tabs)/settings.tsx (placeholder)**

```tsx
import { View, Text } from "react-native";

export default function SettingsScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" }}>
      <Text style={{ color: "#fff" }}>Settings — coming soon</Text>
    </View>
  );
}
```

- [ ] **Step 7: Create apps/mobile/app/(auth)/login.tsx (placeholder)**

```tsx
import { View, Text } from "react-native";

export default function LoginScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" }}>
      <Text style={{ color: "#fff" }}>Login — coming soon</Text>
    </View>
  );
}
```

- [ ] **Step 8: Create query hooks**

Create `apps/mobile/hooks/use-records.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { CreateRecordInput, UpdateRecordInput } from "@classified/shared";

export function useRecords(params?: { page?: number; search?: string; limit?: number }) {
  return useQuery({
    queryKey: ["records", params],
    queryFn: () => api.records.list(params),
  });
}

export function useRecord(id: string) {
  return useQuery({
    queryKey: ["records", id],
    queryFn: () => api.records.get(id),
    enabled: !!id,
  });
}

export function useCreateRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRecordInput) => api.records.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["records"] }),
  });
}

export function useUpdateRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRecordInput }) => api.records.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["records"] }),
  });
}

export function useDeleteRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.records.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["records"] }),
  });
}
```

Create `apps/mobile/hooks/use-user.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export function useUser() {
  return useQuery({
    queryKey: ["user"],
    queryFn: () => api.user.me(),
  });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.user.updateSettings(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user"] }),
  });
}
```

- [ ] **Step 9: Commit**

```bash
cd /c/Users/Nader/OneDrive/Documents/Projects/classified
git add apps/mobile/
git commit -m "feat: set up Expo Router with auth redirect and tab navigation"
```

---

### Task 4: Login and Signup Screens

**Files:**
- Modify: `apps/mobile/app/(auth)/login.tsx`
- Create: `apps/mobile/app/(auth)/signup.tsx`
- Create: `apps/mobile/app/(auth)/two-factor.tsx`

- [ ] **Step 1: Implement apps/mobile/app/(auth)/login.tsx**

```tsx
import { View, ScrollView, Alert } from "react-native";
import { Button, Card, Input, TextField, Label, Separator } from "heroui-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import type { LoginResponse } from "@classified/shared";

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return;
    setIsLoading(true);

    try {
      const result: LoginResponse = await login({ email, password });
      if ("twoFactor" in result) {
        router.push({ pathname: "/(auth)/two-factor", params: { email: result.email } });
      }
      // If tokens returned, auth context handles redirect
    } catch (err) {
      Alert.alert("Login Failed", err instanceof Error ? err.message : "Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24 }}
      keyboardShouldPersistTaps="handled"
    >
      <Card>
        <Card.Header style={{ alignItems: "center" }}>
          <Card.Title>Welcome Back</Card.Title>
          <Card.Description>Sign in to Classified</Card.Description>
        </Card.Header>
        <Card.Body style={{ gap: 16 }}>
          <TextField>
            <Label>Email</Label>
            <Input
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              textContentType="emailAddress"
            />
          </TextField>

          <TextField>
            <Label>Password</Label>
            <Input
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              textContentType="password"
            />
          </TextField>

          <Button variant="primary" onPress={handleLogin} isDisabled={isLoading}>
            <Button.Label>{isLoading ? "Signing in..." : "Sign In"}</Button.Label>
          </Button>

          <Separator />

          <Button variant="ghost" onPress={() => router.push("/(auth)/signup")}>
            <Button.Label>Don't have an account? Sign up</Button.Label>
          </Button>

          <Button variant="ghost" onPress={() => router.push("/(auth)/reset-password")}>
            <Button.Label>Forgot password?</Button.Label>
          </Button>
        </Card.Body>
      </Card>
    </ScrollView>
  );
}
```

- [ ] **Step 2: Create apps/mobile/app/(auth)/signup.tsx**

```tsx
import { View, ScrollView, Alert } from "react-native";
import { Button, Card, Input, TextField, Label } from "heroui-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { api } from "@/lib/api-client";
import { useToast } from "heroui-native";

export default function SignupScreen() {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password) return;
    setIsLoading(true);

    try {
      const result = await api.auth.signup({ name, email, password });
      toast.show({ variant: "success", label: "Success", description: result.success });
      router.back();
    } catch (err) {
      Alert.alert("Signup Failed", err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24 }}
      keyboardShouldPersistTaps="handled"
    >
      <Card>
        <Card.Header style={{ alignItems: "center" }}>
          <Card.Title>Create Account</Card.Title>
          <Card.Description>Sign up for Classified</Card.Description>
        </Card.Header>
        <Card.Body style={{ gap: 16 }}>
          <TextField>
            <Label>Name</Label>
            <Input placeholder="Your name" value={name} onChangeText={setName} textContentType="name" />
          </TextField>

          <TextField>
            <Label>Email</Label>
            <Input
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              textContentType="emailAddress"
            />
          </TextField>

          <TextField>
            <Label>Password</Label>
            <Input
              placeholder="Min 6 characters"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              textContentType="newPassword"
            />
          </TextField>

          <Button variant="primary" onPress={handleSignup} isDisabled={isLoading}>
            <Button.Label>{isLoading ? "Creating..." : "Sign Up"}</Button.Label>
          </Button>

          <Button variant="ghost" onPress={() => router.back()}>
            <Button.Label>Already have an account? Sign in</Button.Label>
          </Button>
        </Card.Body>
      </Card>
    </ScrollView>
  );
}
```

- [ ] **Step 3: Create apps/mobile/app/(auth)/two-factor.tsx**

```tsx
import { ScrollView, Alert } from "react-native";
import { Button, Card, Input, TextField, Label } from "heroui-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

export default function TwoFactorScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const router = useRouter();
  const { loginWithTwoFactor } = useAuth();
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async () => {
    if (!code || code.length !== 6) return;
    setIsLoading(true);

    try {
      await loginWithTwoFactor({ email: email!, code });
      // Auth context will redirect to tabs
    } catch (err) {
      Alert.alert("Invalid Code", err instanceof Error ? err.message : "Please try again");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24 }}
      keyboardShouldPersistTaps="handled"
    >
      <Card>
        <Card.Header style={{ alignItems: "center" }}>
          <Card.Title>Two-Factor Authentication</Card.Title>
          <Card.Description>Enter the 6-digit code sent to your email</Card.Description>
        </Card.Header>
        <Card.Body style={{ gap: 16 }}>
          <TextField>
            <Label>Code</Label>
            <Input
              placeholder="000000"
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              maxLength={6}
              textContentType="oneTimeCode"
            />
          </TextField>

          <Button variant="primary" onPress={handleVerify} isDisabled={isLoading}>
            <Button.Label>{isLoading ? "Verifying..." : "Verify"}</Button.Label>
          </Button>

          <Button variant="ghost" onPress={() => router.back()}>
            <Button.Label>Back to login</Button.Label>
          </Button>
        </Card.Body>
      </Card>
    </ScrollView>
  );
}
```

- [ ] **Step 4: Commit**

```bash
cd /c/Users/Nader/OneDrive/Documents/Projects/classified
git add apps/mobile/app/\(auth\)/
git commit -m "feat: implement login, signup, and 2FA screens"
```

---

### Task 5: Remaining Auth Screens (verify-email, reset-password, new-password)

**Files:**
- Create: `apps/mobile/app/(auth)/verify-email.tsx`
- Create: `apps/mobile/app/(auth)/reset-password.tsx`
- Create: `apps/mobile/app/(auth)/new-password.tsx`

- [ ] **Step 1: Create apps/mobile/app/(auth)/verify-email.tsx**

```tsx
import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { Button } from "heroui-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { api } from "@/lib/api-client";

export default function VerifyEmailScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Missing verification token");
      return;
    }

    api.auth
      .verifyEmail({ token })
      .then((res) => {
        setStatus("success");
        setMessage(res.success);
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "Verification failed");
      });
  }, [token]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24, backgroundColor: "#000" }}>
      {status === "loading" && <ActivityIndicator size="large" color="#3b82f6" />}
      {status === "success" && (
        <>
          <Text style={{ color: "#22c55e", fontSize: 18, marginBottom: 16 }}>{message}</Text>
          <Button variant="primary" onPress={() => router.replace("/(auth)/login")}>
            <Button.Label>Go to Login</Button.Label>
          </Button>
        </>
      )}
      {status === "error" && (
        <>
          <Text style={{ color: "#ef4444", fontSize: 18, marginBottom: 16 }}>{message}</Text>
          <Button variant="ghost" onPress={() => router.replace("/(auth)/login")}>
            <Button.Label>Back to Login</Button.Label>
          </Button>
        </>
      )}
    </View>
  );
}
```

- [ ] **Step 2: Create apps/mobile/app/(auth)/reset-password.tsx**

```tsx
import { ScrollView, Alert } from "react-native";
import { Button, Card, Input, TextField, Label } from "heroui-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { api } from "@/lib/api-client";
import { useToast } from "heroui-native";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = async () => {
    if (!email) return;
    setIsLoading(true);

    try {
      await api.auth.resetPassword({ email });
      toast.show({ variant: "success", label: "Email Sent", description: "Check your inbox for a reset link" });
      router.back();
    } catch (err) {
      Alert.alert("Error", err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24 }}
      keyboardShouldPersistTaps="handled"
    >
      <Card>
        <Card.Header style={{ alignItems: "center" }}>
          <Card.Title>Reset Password</Card.Title>
          <Card.Description>We'll send a reset link to your email</Card.Description>
        </Card.Header>
        <Card.Body style={{ gap: 16 }}>
          <TextField>
            <Label>Email</Label>
            <Input
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </TextField>

          <Button variant="primary" onPress={handleReset} isDisabled={isLoading}>
            <Button.Label>{isLoading ? "Sending..." : "Send Reset Link"}</Button.Label>
          </Button>

          <Button variant="ghost" onPress={() => router.back()}>
            <Button.Label>Back to login</Button.Label>
          </Button>
        </Card.Body>
      </Card>
    </ScrollView>
  );
}
```

- [ ] **Step 3: Create apps/mobile/app/(auth)/new-password.tsx**

```tsx
import { ScrollView, Alert } from "react-native";
import { Button, Card, Input, TextField, Label } from "heroui-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { api } from "@/lib/api-client";
import { useToast } from "heroui-native";

export default function NewPasswordScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!password || !token) return;
    setIsLoading(true);

    try {
      const result = await api.auth.newPassword({ password, token });
      toast.show({ variant: "success", label: "Success", description: result.success });
      router.replace("/(auth)/login");
    } catch (err) {
      Alert.alert("Error", err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24 }}
      keyboardShouldPersistTaps="handled"
    >
      <Card>
        <Card.Header style={{ alignItems: "center" }}>
          <Card.Title>New Password</Card.Title>
          <Card.Description>Enter your new password</Card.Description>
        </Card.Header>
        <Card.Body style={{ gap: 16 }}>
          <TextField>
            <Label>New Password</Label>
            <Input
              placeholder="Min 6 characters"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              textContentType="newPassword"
            />
          </TextField>

          <Button variant="primary" onPress={handleSubmit} isDisabled={isLoading}>
            <Button.Label>{isLoading ? "Resetting..." : "Reset Password"}</Button.Label>
          </Button>
        </Card.Body>
      </Card>
    </ScrollView>
  );
}
```

- [ ] **Step 4: Commit**

```bash
cd /c/Users/Nader/OneDrive/Documents/Projects/classified
git add apps/mobile/app/\(auth\)/
git commit -m "feat: implement verify-email, reset-password, and new-password screens"
```

---

### Task 6: Records Screen with Search, Pull-to-Refresh, and Copy

**Files:**
- Create: `apps/mobile/components/record-card.tsx`
- Modify: `apps/mobile/app/(tabs)/index.tsx`

- [ ] **Step 1: Create apps/mobile/components/record-card.tsx**

```tsx
import { View, Image, Text, Pressable } from "react-native";
import { Card, Button } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { useToast } from "heroui-native";
import type { Record as RecordType } from "@classified/shared";

interface RecordCardProps {
  record: RecordType;
  onEdit: (record: RecordType) => void;
  onDelete: (record: RecordType) => void;
}

export default function RecordCard({ record, onEdit, onDelete }: RecordCardProps) {
  const { toast } = useToast();

  const copyPassword = async () => {
    if (record.password) {
      await Clipboard.setStringAsync(record.password);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      toast.show({ variant: "success", label: "Copied!", description: "Password copied to clipboard" });
    }
  };

  return (
    <Card>
      <Card.Body style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        {record.icon ? (
          <Image source={{ uri: record.icon }} style={{ width: 40, height: 40, borderRadius: 8 }} />
        ) : (
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              backgroundColor: "#27272a",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#71717a", fontSize: 18, fontWeight: "bold" }}>
              {record.site?.charAt(0).toUpperCase() || "?"}
            </Text>
          </View>
        )}

        <View style={{ flex: 1 }}>
          <Text style={{ color: "#fff", fontWeight: "600" }} numberOfLines={1}>
            {record.site || "Untitled"}
          </Text>
          <Text style={{ color: "#71717a", fontSize: 13 }} numberOfLines={1}>
            {record.email || record.username || "—"}
          </Text>
        </View>

        <View style={{ flexDirection: "row", gap: 4 }}>
          {record.password && (
            <Button isIconOnly size="sm" variant="ghost" onPress={copyPassword}>
              <Ionicons name="copy-outline" size={18} color="#a1a1aa" />
            </Button>
          )}
          <Button isIconOnly size="sm" variant="ghost" onPress={() => onEdit(record)}>
            <Ionicons name="pencil" size={18} color="#a1a1aa" />
          </Button>
          <Button isIconOnly size="sm" variant="ghost" onPress={() => onDelete(record)}>
            <Ionicons name="trash-outline" size={18} color="#ef4444" />
          </Button>
        </View>
      </Card.Body>
    </Card>
  );
}
```

- [ ] **Step 2: Implement apps/mobile/app/(tabs)/index.tsx**

```tsx
import { useState, useCallback, useRef } from "react";
import { View, FlatList, Text, RefreshControl } from "react-native";
import { SearchField, Button, Skeleton } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { useRecords } from "@/hooks/use-records";
import RecordCard from "@/components/record-card";
import type { Record as RecordType } from "@classified/shared";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RecordsScreen() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [editRecord, setEditRecord] = useState<RecordType | null>(null);
  const [deleteRecord, setDeleteRecord] = useState<RecordType | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  const { data, isLoading, refetch, isRefetching } = useRecords({
    page,
    search: debouncedSearch,
  });

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setDebouncedSearch(value), 300);
  };

  const handleEndReached = useCallback(() => {
    if (data && data.records.length < data.resultsCount) {
      setPage((p) => p + 1);
    }
  }, [data]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }} edges={["top"]}>
      <View style={{ flex: 1, paddingHorizontal: 16 }}>
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: 12, gap: 12 }}>
          <View style={{ flex: 1 }}>
            <SearchField value={search} onChange={handleSearch}>
              <SearchField.Group>
                <SearchField.SearchIcon />
                <SearchField.Input placeholder="Search records..." />
                <SearchField.ClearButton />
              </SearchField.Group>
            </SearchField>
          </View>
          <Button isIconOnly variant="primary" onPress={() => setShowCreate(true)}>
            <Ionicons name="add" size={24} color="#fff" />
          </Button>
        </View>

        {/* Stats */}
        {data && (
          <Text style={{ color: "#71717a", fontSize: 13, marginBottom: 8 }}>
            {data.totalCount} records total
          </Text>
        )}

        {/* List */}
        {isLoading ? (
          <View style={{ gap: 12 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} style={{ height: 72, borderRadius: 12 }} />
            ))}
          </View>
        ) : (
          <FlatList
            data={data?.records || []}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <RecordCard record={item} onEdit={setEditRecord} onDelete={setDeleteRecord} />
            )}
            contentContainerStyle={{ gap: 8, paddingBottom: 24 }}
            refreshControl={
              <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} tintColor="#3b82f6" />
            }
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={
              <View style={{ alignItems: "center", paddingTop: 48 }}>
                <Text style={{ color: "#71717a" }}>
                  {debouncedSearch ? "No records match your search." : "No records yet. Tap + to add one!"}
                </Text>
              </View>
            }
          />
        )}

        {/* TODO: RecordForm and ConfirmDelete dialogs — wired in Task 7 */}
      </View>
    </SafeAreaView>
  );
}
```

- [ ] **Step 3: Add expo-clipboard dependency**

```bash
cd /c/Users/Nader/OneDrive/Documents/Projects/classified/apps/mobile
bunx expo install expo-clipboard
```

- [ ] **Step 4: Commit**

```bash
cd /c/Users/Nader/OneDrive/Documents/Projects/classified
git add apps/mobile/
git commit -m "feat: implement records screen with search, pull-to-refresh, and copy"
```

---

### Task 7: Record Form, Delete Confirmation, and Password Generator Dialogs

**Files:**
- Create: `apps/mobile/components/password-generator.tsx`
- Create: `apps/mobile/components/record-form.tsx`
- Create: `apps/mobile/components/confirm-delete.tsx`
- Modify: `apps/mobile/app/(tabs)/index.tsx` (wire dialogs)

- [ ] **Step 1: Create apps/mobile/components/password-generator.tsx**

```tsx
import { View } from "react-native";
import { Button, Input, TextField, Label } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useCallback } from "react";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { useToast } from "heroui-native";

interface PasswordGeneratorProps {
  onSelect: (password: string) => void;
}

function generatePassword(length = 20): string {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|:;<>?,./~";
  const array = new Uint8Array(length);
  globalThis.crypto.getRandomValues(array);
  return Array.from(array, (byte) => charset[byte % charset.length]).join("");
}

export default function PasswordGenerator({ onSelect }: PasswordGeneratorProps) {
  const [generated, setGenerated] = useState(() => generatePassword());
  const { toast } = useToast();

  const regenerate = useCallback(() => setGenerated(generatePassword()), []);

  const copy = async () => {
    await Clipboard.setStringAsync(generated);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    toast.show({ variant: "success", label: "Copied!" });
  };

  return (
    <View style={{ gap: 8 }}>
      <TextField>
        <Label>Generated Password</Label>
        <Input value={generated} editable={false} />
      </TextField>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <Button size="sm" variant="ghost" onPress={regenerate}>
          <Ionicons name="dice" size={16} color="#a1a1aa" />
          <Button.Label>Regenerate</Button.Label>
        </Button>
        <Button size="sm" variant="ghost" onPress={copy}>
          <Ionicons name="copy-outline" size={16} color="#a1a1aa" />
          <Button.Label>Copy</Button.Label>
        </Button>
        <Button size="sm" variant="primary" onPress={() => onSelect(generated)}>
          <Button.Label>Use</Button.Label>
        </Button>
      </View>
    </View>
  );
}
```

- [ ] **Step 2: Create apps/mobile/components/record-form.tsx**

```tsx
import { ScrollView, Alert } from "react-native";
import { Dialog, Button, Input, TextField, Label } from "heroui-native";
import { useState, useEffect } from "react";
import { useCreateRecord, useUpdateRecord } from "@/hooks/use-records";
import { useToast } from "heroui-native";
import PasswordGenerator from "./password-generator";
import type { Record as RecordType } from "@classified/shared";

interface RecordFormProps {
  isOpen: boolean;
  onClose: () => void;
  record?: RecordType | null;
}

export default function RecordForm({ isOpen, onClose, record }: RecordFormProps) {
  const [site, setSite] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [icon, setIcon] = useState("");
  const [showGenerator, setShowGenerator] = useState(false);
  const { toast } = useToast();

  const createRecord = useCreateRecord();
  const updateRecord = useUpdateRecord();
  const isEditing = !!record;

  useEffect(() => {
    if (record) {
      setSite(record.site || "");
      setEmail(record.email || "");
      setUsername(record.username || "");
      setPassword(record.password || "");
      setIcon(record.icon || "");
    } else {
      setSite("");
      setEmail("");
      setUsername("");
      setPassword("");
      setIcon("");
    }
    setShowGenerator(false);
  }, [record, isOpen]);

  const handleSave = async () => {
    const data = {
      site: site || undefined,
      email: email || undefined,
      username: username || undefined,
      password: password || undefined,
      icon: icon || undefined,
    };

    try {
      if (isEditing && record) {
        await updateRecord.mutateAsync({ id: record.id, data });
        toast.show({ variant: "success", label: "Record updated" });
      } else {
        await createRecord.mutateAsync(data);
        toast.show({ variant: "success", label: "Record created" });
      }
      onClose();
    } catch (err) {
      Alert.alert("Error", err instanceof Error ? err.message : "Failed to save");
    }
  };

  const isPending = createRecord.isPending || updateRecord.isPending;

  return (
    <Dialog isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content>
          <Dialog.Title>{isEditing ? "Edit Record" : "Add Record"}</Dialog.Title>
          <ScrollView style={{ maxHeight: 400 }} keyboardShouldPersistTaps="handled">
            <TextField>
              <Label>Site / Service</Label>
              <Input placeholder="e.g. GitHub" value={site} onChangeText={setSite} />
            </TextField>
            <TextField>
              <Label>Email</Label>
              <Input placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
            </TextField>
            <TextField>
              <Label>Username</Label>
              <Input placeholder="Username" value={username} onChangeText={setUsername} />
            </TextField>
            <TextField>
              <Label>Password</Label>
              <Input placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
            </TextField>
            <Button size="sm" variant="ghost" onPress={() => setShowGenerator(!showGenerator)}>
              <Button.Label>{showGenerator ? "Hide" : "Generate"} Password</Button.Label>
            </Button>
            {showGenerator && <PasswordGenerator onSelect={setPassword} />}
            <TextField>
              <Label>Icon URL (optional)</Label>
              <Input placeholder="https://..." value={icon} onChangeText={setIcon} />
            </TextField>
          </ScrollView>
          <Dialog.Close />
          <Button variant="primary" onPress={handleSave} isDisabled={isPending}>
            <Button.Label>{isPending ? "Saving..." : isEditing ? "Save" : "Create"}</Button.Label>
          </Button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}
```

- [ ] **Step 3: Create apps/mobile/components/confirm-delete.tsx**

```tsx
import { Alert } from "react-native";
import { Dialog, Button } from "heroui-native";
import { useDeleteRecord } from "@/hooks/use-records";
import { useToast } from "heroui-native";
import * as Haptics from "expo-haptics";
import type { Record as RecordType } from "@classified/shared";

interface ConfirmDeleteProps {
  isOpen: boolean;
  onClose: () => void;
  record: RecordType | null;
}

export default function ConfirmDelete({ isOpen, onClose, record }: ConfirmDeleteProps) {
  const deleteRecord = useDeleteRecord();
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!record) return;

    try {
      await deleteRecord.mutateAsync(record.id);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      toast.show({ variant: "success", label: "Record deleted" });
      onClose();
    } catch (err) {
      Alert.alert("Error", err instanceof Error ? err.message : "Failed to delete");
    }
  };

  return (
    <Dialog isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content>
          <Dialog.Title>Delete Record</Dialog.Title>
          <Dialog.Description>
            Are you sure you want to delete {record?.site || "this record"}? This cannot be undone.
          </Dialog.Description>
          <Dialog.Close />
          <Button variant="ghost" onPress={onClose}>
            <Button.Label>Cancel</Button.Label>
          </Button>
          <Button variant="danger" onPress={handleDelete} isDisabled={deleteRecord.isPending}>
            <Button.Label>{deleteRecord.isPending ? "Deleting..." : "Delete"}</Button.Label>
          </Button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}
```

- [ ] **Step 4: Wire dialogs into records screen**

Update `apps/mobile/app/(tabs)/index.tsx` — add imports and dialog components at the end of the JSX (replace the TODO comment):

```tsx
// Add imports at top:
import RecordForm from "@/components/record-form";
import ConfirmDelete from "@/components/confirm-delete";

// Replace the TODO comment with:
<RecordForm
  isOpen={showCreate || !!editRecord}
  onClose={() => { setShowCreate(false); setEditRecord(null); }}
  record={editRecord}
/>
<ConfirmDelete
  isOpen={!!deleteRecord}
  onClose={() => setDeleteRecord(null)}
  record={deleteRecord}
/>
```

- [ ] **Step 5: Commit**

```bash
cd /c/Users/Nader/OneDrive/Documents/Projects/classified
git add apps/mobile/
git commit -m "feat: add record form, delete confirmation, and password generator dialogs"
```

---

### Task 8: Settings Screen

**Files:**
- Modify: `apps/mobile/app/(tabs)/settings.tsx`

- [ ] **Step 1: Implement apps/mobile/app/(tabs)/settings.tsx**

```tsx
import { useState } from "react";
import { ScrollView, View, Text, Alert } from "react-native";
import { Button, Card, Input, TextField, Label, ListGroup, Switch, Avatar, Separator } from "heroui-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/lib/auth-context";
import { useUser, useUpdateSettings } from "@/hooks/use-user";
import { useToast } from "heroui-native";

export default function SettingsScreen() {
  const { logout } = useAuth();
  const { data: user } = useUser();
  const updateSettings = useUpdateSettings();
  const { toast } = useToast();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(user?.isTwoFactorEnabled || false);
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPasswordChange, setShowPasswordChange] = useState(false);

  // Sync state when user loads
  if (user && name === "" && user.name) {
    setName(user.name);
    setEmail(user.email);
    setIsTwoFactorEnabled(user.isTwoFactorEnabled);
  }

  const handleSave = async () => {
    const data: Record<string, unknown> = {};

    if (name !== user?.name) data.name = name;
    if (email !== user?.email) data.email = email;
    if (isTwoFactorEnabled !== user?.isTwoFactorEnabled) data.isTwoFactorEnabled = isTwoFactorEnabled;
    if (password && newPassword) {
      data.password = password;
      data.newPassword = newPassword;
    }

    if (Object.keys(data).length === 0) {
      toast.show({ label: "No changes" });
      return;
    }

    try {
      await updateSettings.mutateAsync(data);
      toast.show({ variant: "success", label: "Settings updated" });
      setPassword("");
      setNewPassword("");
    } catch (err) {
      Alert.alert("Error", err instanceof Error ? err.message : "Failed to update settings");
    }
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: () => logout() },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 24, paddingBottom: 48 }}>
        <Text style={{ color: "#fff", fontSize: 28, fontWeight: "bold" }}>Settings</Text>

        {/* Profile */}
        <Card>
          <Card.Header>
            <Card.Title>Profile</Card.Title>
          </Card.Header>
          <Card.Body style={{ gap: 16 }}>
            {user?.image && (
              <View style={{ alignItems: "center" }}>
                <Avatar>
                  <Avatar.Image source={{ uri: user.image }} />
                  <Avatar.Fallback>{user.name.charAt(0)}</Avatar.Fallback>
                </Avatar>
              </View>
            )}
            <TextField>
              <Label>Name</Label>
              <Input value={name} onChangeText={setName} />
            </TextField>
            {!user?.isOAuth && (
              <TextField>
                <Label>Email</Label>
                <Input value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
              </TextField>
            )}
          </Card.Body>
        </Card>

        {/* Security */}
        <Card>
          <Card.Header>
            <Card.Title>Security</Card.Title>
          </Card.Header>
          <Card.Body style={{ gap: 16 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ color: "#fff" }}>Two-Factor Authentication</Text>
              <Switch isSelected={isTwoFactorEnabled} onChange={setIsTwoFactorEnabled} />
            </View>

            {!user?.isOAuth && (
              <>
                <Button variant="ghost" onPress={() => setShowPasswordChange(!showPasswordChange)}>
                  <Button.Label>{showPasswordChange ? "Cancel" : "Change Password"}</Button.Label>
                </Button>
                {showPasswordChange && (
                  <>
                    <TextField>
                      <Label>Current Password</Label>
                      <Input value={password} onChangeText={setPassword} secureTextEntry />
                    </TextField>
                    <TextField>
                      <Label>New Password</Label>
                      <Input value={newPassword} onChangeText={setNewPassword} secureTextEntry />
                    </TextField>
                  </>
                )}
              </>
            )}
          </Card.Body>
        </Card>

        {/* Save */}
        <Button variant="primary" onPress={handleSave} isDisabled={updateSettings.isPending}>
          <Button.Label>{updateSettings.isPending ? "Saving..." : "Save Changes"}</Button.Label>
        </Button>

        <Separator />

        {/* Logout */}
        <Button variant="danger" onPress={handleLogout}>
          <Button.Label>Logout</Button.Label>
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd /c/Users/Nader/OneDrive/Documents/Projects/classified
git add apps/mobile/app/\(tabs\)/settings.tsx
git commit -m "feat: implement settings screen with profile, 2FA, and password change"
```

---

### Task 9: Quality Checks and Final Verification

- [ ] **Step 1: Create apps/mobile/.env** (gitignored)

```
EXPO_PUBLIC_API_URL=http://localhost:3001
```

Note: For testing on a physical device, replace `localhost` with your machine's local IP.

- [ ] **Step 2: Run type-check**

```bash
cd /c/Users/Nader/OneDrive/Documents/Projects/classified/apps/mobile
bunx tsc --noEmit
```

Fix any TypeScript errors.

- [ ] **Step 3: Create ESLint config**

Create `apps/mobile/eslint.config.js`:

```javascript
import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(js.configs.recommended, ...tseslint.configs.recommended, {
  ignores: ["dist/", "node_modules/", ".expo/"],
});
```

- [ ] **Step 4: Run lint**

```bash
cd /c/Users/Nader/OneDrive/Documents/Projects/classified
bunx turbo run lint
```

Fix any ESLint errors.

- [ ] **Step 5: Run format:check**

```bash
bunx turbo run format:check
```

If issues: `bunx turbo run format`.

- [ ] **Step 6: Verify app on device/emulator**

```bash
cd apps/mobile
bunx expo start
```

Test the following:
1. App launches → redirects to login
2. Login with credentials → dashboard with records
3. Search filters records
4. Pull-to-refresh works
5. Copy password → haptic feedback + toast
6. Add record → appears in list
7. Edit record → saves changes
8. Delete record → confirmation → removed
9. Settings → update name, toggle 2FA
10. Logout → returns to login

- [ ] **Step 7: Commit any fixes**

```bash
cd /c/Users/Nader/OneDrive/Documents/Projects/classified
git add -A
git commit -m "chore: quality fixes and mobile app finalization"
```
