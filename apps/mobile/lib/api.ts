import { createApiClient } from "@notextra/api";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { mobileTokenStore } from "./token-store";

function firstLanHost(...values: Array<string | undefined | null>): string | null {
	for (const value of values) {
		if (!value) {
			continue;
		}
		const ip = value.match(/(\d{1,3}(?:\.\d{1,3}){3})/);
		if (ip?.[1] && ip[1] !== "127.0.0.1") {
			return ip[1];
		}
	}
	return null;
}

/**
 * Physical phones treat localhost as the phone itself. Reuse the Metro LAN
 * host so the app can reach the API on the development machine.
 */
export function resolveApiBaseUrl(): string {
	const configured = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8080";
	const expoHost = firstLanHost(
		Constants.expoGoConfig?.debuggerHost,
		Constants.expoConfig?.hostUri,
		Constants.linkingUri,
	);

	if (expoHost) {
		return configured.replace(/^(https?:\/\/)(localhost|127\.0\.0\.1)(?=[:/]|$)/, `$1${expoHost}`);
	}

	if (Platform.OS === "android" && /:\/\/(localhost|127\.0\.0\.1)(?=[:/]|$)/.test(configured)) {
		return configured.replace(/^(https?:\/\/)(localhost|127\.0\.0\.1)/, "$110.0.2.2");
	}

	return configured;
}

export const api = createApiClient({
	baseUrl: resolveApiBaseUrl(),
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

export function inferMediaType(contentType: string, fileName = ""): "IMAGE" | "AUDIO" | "VIDEO" | "DOCUMENT" | "OTHER" {
	const lowerName = fileName.toLowerCase();
	if (contentType.startsWith("image/") || /\.(png|jpe?g|gif|webp|heic|bmp)$/i.test(lowerName)) {
		return "IMAGE";
	}
	if (contentType.startsWith("audio/") || /\.(mp3|wav|m4a|aac|ogg|flac)$/i.test(lowerName)) {
		return "AUDIO";
	}
	if (contentType.startsWith("video/") || /\.(mp4|mov|webm|mkv|avi)$/i.test(lowerName)) {
		return "VIDEO";
	}
	if (
		contentType.startsWith("text/") ||
		contentType.includes("pdf") ||
		contentType.includes("document") ||
		/\.(pdf|docx?|txt|rtf)$/i.test(lowerName)
	) {
		return "DOCUMENT";
	}
	return "OTHER";
}
