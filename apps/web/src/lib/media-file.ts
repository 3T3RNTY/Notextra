import type { MediaAssetDetail } from "@notextra/api";
import { api } from "./api";

export async function openMediaInBrowser(asset: MediaAssetDetail): Promise<void> {
	const blob = await api.media.download(asset.id, true);
	const url = URL.createObjectURL(blob);
	const opened = window.open(url, "_blank", "noopener,noreferrer");
	if (!opened) {
		downloadMediaFile(asset, blob, url);
		return;
	}
	window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export async function downloadMediaFile(
	asset: MediaAssetDetail,
	existingBlob?: Blob,
	existingUrl?: string,
): Promise<void> {
	const blob = existingBlob ?? (await api.media.download(asset.id, false));
	const url = existingUrl ?? URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = asset.fileName || "download";
	document.body.appendChild(link);
	link.click();
	link.remove();
	window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
