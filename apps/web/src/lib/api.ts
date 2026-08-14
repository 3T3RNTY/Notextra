import { createApiClient } from "@notextra/api";
import { webTokenStore } from "./token-store";

export const api = createApiClient({
	baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080",
	tokenStore: webTokenStore,
});

export function formatDate(value: string | null | undefined): string {
	if (!value) {
		return "";
	}
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return String(value);
	}
	return date.toLocaleString();
}

export function inferMediaType(contentType: string): "IMAGE" | "AUDIO" | "VIDEO" | "DOCUMENT" | "OTHER" {
	if (contentType.startsWith("image/")) {
		return "IMAGE";
	}
	if (contentType.startsWith("audio/")) {
		return "AUDIO";
	}
	if (contentType.startsWith("video/")) {
		return "VIDEO";
	}
	if (contentType.startsWith("text/") || contentType.includes("pdf") || contentType.includes("document")) {
		return "DOCUMENT";
	}
	return "OTHER";
}
