import { Tabs } from "expo-router";
import { Text } from "react-native";
import { useTheme } from "@/lib/theme";

function TabLabel({ label, focused }: { label: string; focused: boolean }) {
	const { colors } = useTheme();
	return (
		<Text style={{ color: focused ? colors.primary : colors.textMuted, fontSize: 12, fontWeight: "600" }}>
			{label}
		</Text>
	);
}

export default function AppTabsLayout() {
	const { colors } = useTheme();
	return (
		<Tabs
			screenOptions={{
				headerStyle: { backgroundColor: colors.surface },
				headerTintColor: colors.text,
				headerShadowVisible: false,
				tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
				tabBarActiveTintColor: colors.primary,
				tabBarInactiveTintColor: colors.textMuted,
			}}
		>
			<Tabs.Screen
				name="notes"
				options={{
					title: "Notes",
					headerShown: false,
					tabBarLabel: ({ focused }) => <TabLabel label="Notes" focused={focused} />,
				}}
			/>
			<Tabs.Screen
				name="media"
				options={{
					title: "Media",
					tabBarLabel: ({ focused }) => <TabLabel label="Media" focused={focused} />,
				}}
			/>
			<Tabs.Screen
				name="generate"
				options={{
					title: "Generate",
					tabBarLabel: ({ focused }) => <TabLabel label="Generate" focused={focused} />,
				}}
			/>
			<Tabs.Screen
				name="options"
				options={{
					title: "Options",
					tabBarLabel: ({ focused }) => <TabLabel label="Options" focused={focused} />,
				}}
			/>
		</Tabs>
	);
}
