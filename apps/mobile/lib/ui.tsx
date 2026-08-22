import type { ReactNode } from "react";
import {
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	View,
	type TextInputProps,
	type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "./theme";

export function Screen({ children, scroll = true }: { children: ReactNode; scroll?: boolean }) {
	const { colors } = useTheme();
	const body = scroll ? (
		<ScrollView contentContainerStyle={styles.scroll}>{children}</ScrollView>
	) : (
		<View style={styles.scroll}>{children}</View>
	);
	return (
		<SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={["top", "left", "right"]}>
			{body}
		</SafeAreaView>
	);
}

export function Title({ children }: { children: ReactNode }) {
	const { colors } = useTheme();
	return <Text style={[styles.title, { color: colors.text }]}>{children}</Text>;
}

export function Heading({ children }: { children: ReactNode }) {
	const { colors } = useTheme();
	return <Text style={[styles.heading, { color: colors.text }]}>{children}</Text>;
}

export function Muted({ children }: { children: ReactNode }) {
	const { colors } = useTheme();
	return <Text style={[styles.muted, { color: colors.textMuted }]}>{children}</Text>;
}

export function Card({ children, onPress }: { children: ReactNode; onPress?: () => void }) {
	const { colors } = useTheme();
	const style = [styles.card, { backgroundColor: colors.surface, borderColor: colors.border }];
	if (onPress) {
		return (
			<Pressable onPress={onPress} style={style}>
				{children}
			</Pressable>
		);
	}
	return <View style={style}>{children}</View>;
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
	const { colors } = useTheme();
	return (
		<View style={styles.field}>
			<Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
			{children}
		</View>
	);
}

export function Input(props: TextInputProps) {
	const { colors } = useTheme();
	return (
		<TextInput
			placeholderTextColor={colors.textMuted}
			{...props}
			style={[
				styles.input,
				{ color: colors.text, borderColor: colors.border, backgroundColor: colors.surface },
				props.style,
			]}
		/>
	);
}

export function Button({
	label,
	onPress,
	variant = "primary",
	disabled,
}: {
	label: string;
	onPress: () => void;
	variant?: "primary" | "ghost" | "danger";
	disabled?: boolean;
}) {
	const { colors } = useTheme();
	const background =
		variant === "primary" ? colors.primary : variant === "danger" ? colors.danger : colors.surfaceMuted;
	const color = variant === "primary" ? colors.primaryForeground : colors.text;
	return (
		<Pressable
			onPress={onPress}
			disabled={disabled}
			style={[styles.button, { backgroundColor: background, opacity: disabled ? 0.5 : 1 }]}
		>
			<Text style={[styles.buttonLabel, { color }]}>{label}</Text>
		</Pressable>
	);
}

export function ErrorText({ message }: { message?: string | null }) {
	const { colors } = useTheme();
	if (!message) {
		return null;
	}
	return <Text style={[styles.error, { color: colors.danger }]}>{message}</Text>;
}

export function Row({ children, style }: { children: ReactNode; style?: ViewStyle }) {
	return <View style={[styles.row, style]}>{children}</View>;
}

export function Chip({
	label,
	active,
	onPress,
}: {
	label: string;
	active?: boolean;
	onPress: () => void;
}) {
	const { colors } = useTheme();
	return (
		<Pressable
			onPress={onPress}
			style={[
				styles.chip,
				{
					backgroundColor: active ? colors.primary : colors.surface,
					borderColor: active ? colors.primary : colors.border,
				},
			]}
		>
			<Text style={{ color: active ? colors.primaryForeground : colors.text, fontSize: 13, fontWeight: "600" }}>
				{label}
			</Text>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	screen: { flex: 1 },
	scroll: { padding: 16, gap: 12, paddingBottom: 32 },
	title: { fontSize: 24, fontWeight: "600", marginBottom: 4 },
	heading: { fontSize: 16, fontWeight: "600" },
	muted: { fontSize: 14 },
	card: { borderWidth: 1, borderRadius: 12, padding: 14, gap: 6 },
	field: { gap: 6 },
	label: { fontSize: 13 },
	input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15 },
	button: { borderRadius: 10, paddingVertical: 12, alignItems: "center" },
	buttonLabel: { fontSize: 15, fontWeight: "600" },
	error: { fontSize: 14 },
	row: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
	chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
});
