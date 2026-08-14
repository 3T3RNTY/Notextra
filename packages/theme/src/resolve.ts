import { palettes } from "./palettes";
import { DEFAULT_APPEARANCE, DEFAULT_PALETTE } from "./tokens";
import type { Appearance, ColorMode, PaletteId, SemanticColors } from "./types";

export function isPaletteId(value: string | null | undefined): value is PaletteId {
	return value === "neutral" || value === "ocean" || value === "forest" || value === "violet";
}

export function isAppearance(value: string | null | undefined): value is Appearance {
	return value === "light" || value === "dark" || value === "system";
}

export function effectiveMode(appearance: Appearance, systemDark: boolean): ColorMode {
	if (appearance === "system") {
		return systemDark ? "dark" : "light";
	}
	return appearance;
}

export function resolveTheme(palette: PaletteId, mode: ColorMode): SemanticColors {
	return palettes[isPaletteId(palette) ? palette : DEFAULT_PALETTE][mode];
}

export function parseAppearance(value: string | null | undefined): Appearance {
	return isAppearance(value) ? value : DEFAULT_APPEARANCE;
}

export function parsePalette(value: string | null | undefined): PaletteId {
	return isPaletteId(value) ? value : DEFAULT_PALETTE;
}

export function toCssVarName(key: string): string {
	return `--nx-${key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)}`;
}

export function themeToCssVars(colors: SemanticColors): Record<string, string> {
	const vars: Record<string, string> = {};
	for (const [key, value] of Object.entries(colors)) {
		vars[toCssVarName(key)] = value;
	}
	return vars;
}

export function applyThemeToElement(
	root: {
		style: { setProperty(name: string, value: string): void };
		setAttribute(name: string, value: string): void;
		classList: { toggle(token: string, force?: boolean): boolean };
	},
	colors: SemanticColors,
	mode: ColorMode,
	palette: PaletteId,
): void {
	for (const [name, value] of Object.entries(themeToCssVars(colors))) {
		root.style.setProperty(name, value);
	}
	root.setAttribute("data-mode", mode);
	root.setAttribute("data-palette", palette);
	root.classList.toggle("dark", mode === "dark");
}

export function getThemeBootstrapScript(): string {
	return `(function(){
  try {
    var palettes = ${JSON.stringify(palettes)};
    var appearanceKey = ${JSON.stringify("notextra.theme.appearance")};
    var paletteKey = ${JSON.stringify("notextra.theme.palette")};
    var appearance = localStorage.getItem(appearanceKey) || ${JSON.stringify(DEFAULT_APPEARANCE)};
    var palette = localStorage.getItem(paletteKey) || ${JSON.stringify(DEFAULT_PALETTE)};
    if (!palettes[palette]) palette = ${JSON.stringify(DEFAULT_PALETTE)};
    var systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var mode = appearance === "system" ? (systemDark ? "dark" : "light") : appearance;
    if (mode !== "dark" && mode !== "light") mode = "light";
    var colors = palettes[palette][mode];
    var root = document.documentElement;
    root.setAttribute("data-mode", mode);
    root.setAttribute("data-palette", palette);
    root.classList.toggle("dark", mode === "dark");
    for (var key in colors) {
      var name = "--nx-" + key.replace(/[A-Z]/g, function(m) { return "-" + m.toLowerCase(); });
      root.style.setProperty(name, colors[key]);
    }
  } catch (e) {}
})();`;
}
