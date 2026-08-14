import { AuthProvider, useAuth } from "@/lib/auth";
import { ThemeProvider, useTheme } from "@/lib/theme";
import { Redirect, Slot, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

function Gate() {
	const { user, ready } = useAuth();
	const { colors, appearance } = useTheme();
	const pathname = usePathname();
	const inAuth = pathname.includes("login") || pathname.includes("register");

	if (!ready) {
		return (
			<View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
				<ActivityIndicator color={colors.primary} />
			</View>
		);
	}
	if (!user && !inAuth) {
		return <Redirect href="/(auth)/login" />;
	}
	if (user && inAuth) {
		return <Redirect href="/(app)/notes" />;
	}

	const statusStyle = appearance === "light" ? "dark" : appearance === "dark" ? "light" : "auto";
	return (
		<>
			<StatusBar style={statusStyle} />
			<Slot />
		</>
	);
}

export default function RootLayout() {
	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<SafeAreaProvider>
				<ThemeProvider>
					<AuthProvider>
						<Gate />
					</AuthProvider>
				</ThemeProvider>
			</SafeAreaProvider>
		</GestureHandlerRootView>
	);
}
