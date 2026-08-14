"use client";

import { APPEARANCE_OPTIONS, PALETTE_META, palettes, type Appearance, type PaletteId } from "@notextra/theme";
import { useAuth } from "@/components/auth-provider";
import { useTheme } from "@/components/theme-provider";
import { Card, PageHeader } from "@/components/ui";

export default function OptionsPage() {
	const { appearance, palette, setAppearance, setPalette } = useTheme();
	const { user } = useAuth();

	return (
		<div className="max-w-2xl">
			<PageHeader title="Options" />
			<section className="mb-8">
				<h2 className="mb-3 text-sm font-medium text-muted">Appearance</h2>
				<div className="flex flex-wrap gap-2">
					{APPEARANCE_OPTIONS.map((option) => (
						<button
							key={option.id}
							type="button"
							onClick={() => setAppearance(option.id as Appearance)}
							className={`rounded-md px-3 py-2 text-sm ${
								appearance === option.id
									? "bg-primary text-primary-foreground"
									: "bg-surface-muted text-foreground"
							}`}
						>
							{option.label}
						</button>
					))}
				</div>
			</section>
			<section className="mb-8">
				<h2 className="mb-3 text-sm font-medium text-muted">Color theme</h2>
				<div className="grid gap-3 sm:grid-cols-2">
					{PALETTE_META.map((meta) => {
						const swatch = palettes[meta.id as PaletteId].light;
						const selected = palette === meta.id;
						return (
							<button
								key={meta.id}
								type="button"
								onClick={() => setPalette(meta.id as PaletteId)}
								className={`rounded-lg border p-4 text-left ${selected ? "border-primary" : "border-border bg-surface"}`}
							>
								<div className="mb-3 flex gap-2">
									<span className="h-6 w-6 rounded-full" style={{ background: swatch.primary }} />
									<span className="h-6 w-6 rounded-full" style={{ background: swatch.accent }} />
									<span className="h-6 w-6 rounded-full border border-border" style={{ background: swatch.background }} />
								</div>
								<div className="font-medium">{meta.label}</div>
								<div className="text-sm text-muted">{meta.description}</div>
							</button>
						);
					})}
				</div>
			</section>
			<Card>
				<h2 className="mb-2 font-medium">Account</h2>
				<p className="text-sm">{user?.displayName}</p>
				<p className="text-sm text-muted">{user?.email}</p>
			</Card>
		</div>
	);
}
