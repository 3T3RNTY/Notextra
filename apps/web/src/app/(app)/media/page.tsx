"use client";

import { ApiRequestError, type MediaAssetDetail } from "@notextra/api";
import { ChangeEvent, useEffect, useState } from "react";
import { Button, Card, PageHeader, StatusMessage } from "@/components/ui";
import { api, formatDate, inferMediaType } from "@/lib/api";

export default function MediaPage() {
	const [assets, setAssets] = useState<MediaAssetDetail[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [uploading, setUploading] = useState(false);

	async function load() {
		setError(null);
		setLoading(true);
		try {
			setAssets(await api.media.list());
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load media");
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		void load();
	}, []);

	async function onFile(event: ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0];
		event.target.value = "";
		if (!file) {
			return;
		}
		setUploading(true);
		setError(null);
		try {
			const session = await api.media.initiateUpload({
				fileName: file.name,
				contentType: file.type || "application/octet-stream",
				type: inferMediaType(file.type),
			});
			const put = await fetch(session.uploadUrl, {
				method: "PUT",
				headers: { "Content-Type": file.type || "application/octet-stream" },
				body: file,
			});
			if (!put.ok) {
				throw new Error("Upload to storage failed");
			}
			await api.media.confirmUpload(session.assetId, { sizeBytes: file.size });
			await load();
		} catch (err) {
			setError(err instanceof ApiRequestError || err instanceof Error ? err.message : "Upload failed");
		} finally {
			setUploading(false);
		}
	}

	return (
		<div>
			<PageHeader
				title="Media"
				actions={
					<label className="inline-flex cursor-pointer">
						<span className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground">
							{uploading ? "Uploading…" : "Upload"}
						</span>
						<input type="file" className="hidden" onChange={(e) => void onFile(e)} disabled={uploading} />
					</label>
				}
			/>
			{loading ? <p className="text-sm text-muted">Loading…</p> : null}
			<StatusMessage error={error} empty={!loading && assets.length === 0 ? "No media yet." : null} />
			<div className="grid gap-3">
				{assets.map((asset) => (
					<Card key={asset.id} className="flex items-center justify-between gap-3">
						<div>
							<h2 className="font-medium">{asset.fileName}</h2>
							<p className="text-xs text-muted">
								{asset.type} · {formatDate(asset.createdAt)}
							</p>
						</div>
						{asset.downloadUrl ? (
							<a href={asset.downloadUrl} className="text-sm text-accent underline" target="_blank" rel="noreferrer">
								Open
							</a>
						) : null}
					</Card>
				))}
			</div>
		</div>
	);
}
