export const spacing = {
	xs: 4,
	sm: 8,
	md: 16,
	lg: 24,
	xl: 32,
	"2xl": 48,
} as const;

export const radius = {
	sm: 6,
	md: 10,
	lg: 16,
	full: 9999,
} as const;

export const fontSize = {
	sm: 13,
	md: 15,
	lg: 18,
	xl: 24,
	"2xl": 32,
} as const;

export const THEME_STORAGE_KEYS = {
	appearance: "notextra.theme.appearance",
	palette: "notextra.theme.palette",
} as const;

export const DEFAULT_APPEARANCE = "system" as const;
export const DEFAULT_PALETTE = "ocean" as const;
