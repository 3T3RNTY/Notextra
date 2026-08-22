import type { MediaAssetDetail, NoteDetail } from "@notextra/api";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { api, inferMediaType } from "./api";

function sanitizeFileName(fileName: string): string {
	const trimmed = fileName.trim() || "download";
	return trimmed.replace(/[\\/:*?"<>|]/g, "_");
}

export async function saveMediaLocally(asset: MediaAssetDetail, persist = false): Promise<string> {
	await api.media.get(asset.id);
	const directory = persist ? FileSystem.documentDirectory : FileSystem.cacheDirectory;
	if (!directory) {
		throw new Error("Local storage is unavailable on this device");
	}
	const dest = `${directory}notextra-${asset.id}-${sanitizeFileName(asset.fileName)}`;
	const result = await FileSystem.downloadAsync(api.media.contentUrl(asset.id), dest, {
		headers: await api.authHeaders(),
	});
	if (result.status !== 200) {
		throw new Error("Could not download file");
	}
	return result.uri;
}

export async function shareMediaFile(asset: MediaAssetDetail, persist = false): Promise<void> {
	const uri = await saveMediaLocally(asset, persist);
	if (!(await Sharing.isAvailableAsync())) {
		throw new Error("Sharing is not available on this device");
	}
	await Sharing.shareAsync(uri, {
		mimeType: asset.contentType || undefined,
		dialogTitle: asset.fileName,
	});
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

export async function uploadMediaFromUri(input: {
	uri: string;
	fileName: string;
	mimeType?: string | null;
	sizeBytes?: number | null;
}): Promise<MediaAssetDetail> {
	const contentType = input.mimeType || "application/octet-stream";
	const session = await api.media.initiateUpload({
		fileName: input.fileName,
		contentType,
		type: inferMediaType(contentType, input.fileName),
	});
	const fileResponse = await fetch(input.uri);
	const body = await fileResponse.blob();
	await api.media.uploadContent(session.assetId, body, contentType);
	return api.media.confirmUpload(session.assetId, { sizeBytes: input.sizeBytes ?? body.size });
}
