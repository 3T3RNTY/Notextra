import type { MediaAssetDetail } from "@notextra/api";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { api } from "./api";

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
