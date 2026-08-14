import type { Metadata } from "next";
import { getThemeBootstrapScript } from "@notextra/theme";
import "./globals.css";

export const metadata: Metadata = {
	title: "Notextra",
	description: "AI-assisted note taking",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<script dangerouslySetInnerHTML={{ __html: getThemeBootstrapScript() }} />
			</head>
			<body>{children}</body>
		</html>
	);
}
