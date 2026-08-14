export type ColorMode = "light" | "dark";
export type Appearance = ColorMode | "system";
export type PaletteId = "neutral" | "ocean" | "forest" | "violet";

export interface SemanticColors {
	background: string;
	surface: string;
	surfaceMuted: string;
	text: string;
	textMuted: string;
	border: string;
	primary: string;
	primaryForeground: string;
	accent: string;
	danger: string;
	success: string;
}

export interface PaletteMeta {
	id: PaletteId;
	label: string;
	description: string;
}

export interface ThemePreferences {
	appearance: Appearance;
	palette: PaletteId;
}
