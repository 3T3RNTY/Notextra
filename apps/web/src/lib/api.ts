import {
	acceptForNoteType,
	createApiClient,
	inferMediaType,
	mediaTypeForNoteType,
	type MediaAssetDetail,
	type NoteType,
} from "@notextra/api";
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

export function fileAcceptForNoteType(type: NoteType): string | undefined {
	return acceptForNoteType(type);
}

export async function uploadMediaFile(file: File, noteType?: NoteType): Promise<MediaAssetDetail> {
	const contentType = file.type || "application/octet-stream";
	const type = mediaTypeForNoteType(noteType ?? "TEXT") ?? inferMediaType(contentType, file.name);
	const session = await api.media.initiateUpload({
		fileName: file.name,
		contentType,
		type,
	});
	const put = await fetch(session.uploadUrl, {
		method: "PUT",
		headers: { "Content-Type": contentType },
		body: file,
	});
	if (!put.ok) {
		throw new Error("Upload to storage failed");
	}
	return api.media.confirmUpload(session.assetId, { sizeBytes: file.size });
}
