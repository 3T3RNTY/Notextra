import { createApiClient } from "@notextra/api";
import { mobileTokenStore } from "./token-store";

export const api = createApiClient({
	baseUrl: process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8080",
	tokenStore: mobileTokenStore,
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
