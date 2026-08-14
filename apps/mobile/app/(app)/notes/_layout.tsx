import { Stack } from "expo-router";
import { useTheme } from "@/lib/theme";

export default function NotesStackLayout() {
	const { colors } = useTheme();
	return (
		<Stack
			screenOptions={{
				headerStyle: { backgroundColor: colors.surface },
				headerTintColor: colors.text,
				headerShadowVisible: false,
				contentStyle: { backgroundColor: colors.background },
			}}
		>
			<Stack.Screen name="index" options={{ title: "Notes" }} />
			<Stack.Screen name="new" options={{ title: "New note" }} />
			<Stack.Screen name="[id]" options={{ title: "Note" }} />
			<Stack.Screen name="collections" options={{ title: "Collections" }} />
		</Stack>
	);
}
