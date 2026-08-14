import AsyncStorage from "@react-native-async-storage/async-storage";
import {
	DEFAULT_APPEARANCE,
	DEFAULT_PALETTE,
	effectiveMode,
	parseAppearance,
	parsePalette,
	resolveTheme,
	THEME_STORAGE_KEYS,
	type Appearance,
	type PaletteId,
	type SemanticColors,
} from "@notextra/theme";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useColorScheme } from "react-native";

interface ThemeContextValue {
	appearance: Appearance;
	palette: PaletteId;
	colors: SemanticColors;
	setAppearance: (appearance: Appearance) => void;
	setPalette: (palette: PaletteId) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
	const systemScheme = useColorScheme();
	const [appearance, setAppearanceState] = useState<Appearance>(DEFAULT_APPEARANCE);
	const [palette, setPaletteState] = useState<PaletteId>(DEFAULT_PALETTE);
	const [ready, setReady] = useState(false);

	useEffect(() => {
		void (async () => {
			const storedAppearance = await AsyncStorage.getItem(THEME_STORAGE_KEYS.appearance);
			const storedPalette = await AsyncStorage.getItem(THEME_STORAGE_KEYS.palette);
			setAppearanceState(parseAppearance(storedAppearance));
			setPaletteState(parsePalette(storedPalette));
			setReady(true);
		})();
	}, []);

	useEffect(() => {
		if (!ready) {
			return;
		}
		void AsyncStorage.setItem(THEME_STORAGE_KEYS.appearance, appearance);
	}, [appearance, ready]);

	useEffect(() => {
		if (!ready) {
			return;
		}
		void AsyncStorage.setItem(THEME_STORAGE_KEYS.palette, palette);
	}, [palette, ready]);

	const mode = effectiveMode(appearance, systemScheme === "dark");
	const colors = useMemo(() => resolveTheme(palette, mode), [palette, mode]);

	const value = useMemo<ThemeContextValue>(
		() => ({
			appearance,
			palette,
			colors,
			setAppearance: setAppearanceState,
			setPalette: setPaletteState,
		}),
		[appearance, palette, colors],
	);

	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
	const context = useContext(ThemeContext);
	if (!context) {
		throw new Error("useTheme must be used within ThemeProvider");
	}
	return context;
}
