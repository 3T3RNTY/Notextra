import { APPEARANCE_OPTIONS, PALETTE_META, palettes, type Appearance, type PaletteId } from "@notextra/theme";
import { Pressable, Text, View } from "react-native";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { Button, Card, Heading, Muted, Row, Screen, Title } from "@/lib/ui";

export default function OptionsScreen() {
	const { appearance, palette, colors, setAppearance, setPalette } = useTheme();
	const { user, logout } = useAuth();

	return (
		<Screen>
			<Title>Options</Title>
			<Muted>Appearance</Muted>
			<Row>
				{APPEARANCE_OPTIONS.map((option) => {
					const selected = appearance === option.id;
					return (
						<Pressable
							key={option.id}
							onPress={() => setAppearance(option.id as Appearance)}
							style={{
								paddingHorizontal: 12,
								paddingVertical: 10,
								borderRadius: 10,
								backgroundColor: selected ? colors.primary : colors.surfaceMuted,
							}}
						>
							<Text style={{ color: selected ? colors.primaryForeground : colors.text, fontWeight: "600" }}>
								{option.label}
							</Text>
						</Pressable>
					);
				})}
			</Row>
			<Muted>Color theme</Muted>
			{PALETTE_META.map((meta) => {
				const swatch = palettes[meta.id as PaletteId].light;
				const selected = palette === meta.id;
				return (
					<Pressable
						key={meta.id}
						onPress={() => setPalette(meta.id as PaletteId)}
						style={{
							borderWidth: 1,
							borderColor: selected ? colors.primary : colors.border,
							backgroundColor: colors.surface,
							borderRadius: 12,
							padding: 14,
							gap: 8,
						}}
					>
						<Row>
							<View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: swatch.primary }} />
							<View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: swatch.accent }} />
							<View
								style={{
									width: 22,
									height: 22,
									borderRadius: 11,
									backgroundColor: swatch.background,
									borderWidth: 1,
									borderColor: colors.border,
								}}
							/>
						</Row>
						<Text style={{ color: colors.text, fontWeight: "600" }}>{meta.label}</Text>
						<Text style={{ color: colors.textMuted }}>{meta.description}</Text>
					</Pressable>
				);
			})}
			<Card>
				<Heading>Account</Heading>
				<Muted>{user?.displayName}</Muted>
				<Muted>{user?.email}</Muted>
			</Card>
			<Button label="Log out" variant="ghost" onPress={() => void logout()} />
		</Screen>
	);
}
