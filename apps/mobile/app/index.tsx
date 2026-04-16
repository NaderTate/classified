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
