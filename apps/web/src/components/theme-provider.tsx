"use client";

import {
	APPEARANCE_OPTIONS,
	applyThemeToElement,
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

interface ThemeContextValue {
	appearance: Appearance;
	palette: PaletteId;
	colors: SemanticColors;
	setAppearance: (appearance: Appearance) => void;
	setPalette: (palette: PaletteId) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readStoredAppearance(): Appearance {
	if (typeof window === "undefined") {
		return DEFAULT_APPEARANCE;
	}
	return parseAppearance(localStorage.getItem(THEME_STORAGE_KEYS.appearance));
}

function readStoredPalette(): PaletteId {
	if (typeof window === "undefined") {
		return DEFAULT_PALETTE;
	}
	return parsePalette(localStorage.getItem(THEME_STORAGE_KEYS.palette));
}

export function ThemeProvider({ children }: { children: ReactNode }) {
	const [appearance, setAppearanceState] = useState<Appearance>(readStoredAppearance);
	const [palette, setPaletteState] = useState<PaletteId>(readStoredPalette);
	const [systemDark, setSystemDark] = useState(() =>
		typeof window !== "undefined" ? window.matchMedia("(prefers-color-scheme: dark)").matches : false,
	);

	useEffect(() => {
		const media = window.matchMedia("(prefers-color-scheme: dark)");
		const onChange = () => setSystemDark(media.matches);
		onChange();
		media.addEventListener("change", onChange);
		return () => media.removeEventListener("change", onChange);
	}, []);

	const mode = effectiveMode(appearance, systemDark);
	const colors = useMemo(() => resolveTheme(palette, mode), [palette, mode]);

	useEffect(() => {
		applyThemeToElement(document.documentElement, colors, mode, palette);
	}, [colors, mode, palette]);

	useEffect(() => {
		localStorage.setItem(THEME_STORAGE_KEYS.appearance, appearance);
	}, [appearance]);

	useEffect(() => {
		localStorage.setItem(THEME_STORAGE_KEYS.palette, palette);
	}, [palette]);

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

export { APPEARANCE_OPTIONS };
