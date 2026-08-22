import { createApiClient, type MediaAssetDetail, type NoteDetail } from "@notextra/api";
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

export async function uploadMediaFile(file: File): Promise<MediaAssetDetail> {
	const contentType = file.type || "application/octet-stream";
	const session = await api.media.initiateUpload({
		fileName: file.name,
		contentType,
		type: inferMediaType(contentType, file.name),
	});
	await api.media.uploadContent(session.assetId, file, contentType);
	return api.media.confirmUpload(session.assetId, { sizeBytes: file.size });
}

export async function loadNoteAttachments(note: NoteDetail): Promise<MediaAssetDetail[]> {
	const ids = note.attachmentIds ?? [];
	if (ids.length === 0) {
		return [];
	}
	const assets = await api.media.list();
	const byId = new Map(assets.map((asset) => [asset.id, asset]));
	return ids
		.map((id) => byId.get(id))
		.filter((asset): asset is MediaAssetDetail => Boolean(asset));
}
