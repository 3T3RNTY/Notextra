"use client";

import {
	ApiRequestError,
	MEDIA_TYPE_OPTIONS,
	labelForMediaType,
	type MediaAssetDetail,
	type MediaType,
} from "@notextra/api";
import { ChangeEvent, useEffect, useState } from "react";
import { Button, Card, FilterChip, PageHeader, StatusMessage } from "@/components/ui";
import { api, formatDate, uploadMediaFile } from "@/lib/api";

export default function MediaPage() {
	const [assets, setAssets] = useState<MediaAssetDetail[]>([]);
	const [type, setType] = useState<MediaType | "">("");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [uploading, setUploading] = useState(false);

	async function load(nextType?: MediaType | "") {
		const selectedType = nextType === undefined ? type : nextType;
		setError(null);
		setLoading(true);
		try {
			setAssets(await api.media.list({ type: selectedType || undefined }));
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load media");
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		void load();
		// eslint-disable-next-line react-hooks/exhaustive-deps
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
			await uploadMediaFile(file);
			await load();
		} catch (err) {
			setError(err instanceof ApiRequestError || err instanceof Error ? err.message : "Upload failed");
		} finally {
			setUploading(false);
		}
	}

	async function onDelete(assetId: string) {
		if (!confirm("Delete this file?")) {
			return;
		}
		setError(null);
		try {
			await api.media.delete(assetId);
			setAssets((current) => current.filter((asset) => asset.id !== assetId));
		} catch (err) {
			setError(err instanceof Error ? err.message : "Could not delete file");
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
			<div className="mb-4 flex flex-wrap gap-2">
				<FilterChip
					active={type === ""}
					onClick={() => {
						setType("");
						void load("");
					}}
				>
					All
				</FilterChip>
				{MEDIA_TYPE_OPTIONS.filter((option) => option.value !== "OTHER").map((option) => (
					<FilterChip
						key={option.value}
						active={type === option.value}
						onClick={() => {
							setType(option.value);
							void load(option.value);
						}}
					>
						{option.label}
					</FilterChip>
				))}
			</div>
			{loading ? <p className="text-sm text-muted">Loading…</p> : null}
			<StatusMessage error={error} empty={!loading && assets.length === 0 ? "No media yet." : null} />
			<div className="grid gap-3">
				{assets.map((asset) => (
					<Card key={asset.id} className="flex items-center justify-between gap-3">
						<div>
							<h2 className="font-medium">{asset.fileName}</h2>
							<p className="text-xs text-muted">
								{labelForMediaType(asset.type)} · {formatDate(asset.createdAt)}
							</p>
						</div>
						<div className="flex items-center gap-2">
							{asset.downloadUrl ? (
								<a href={asset.downloadUrl} className="text-sm text-accent underline" target="_blank" rel="noreferrer">
									Open
								</a>
							) : null}
							<Button variant="danger" onClick={() => void onDelete(asset.id)}>
								Delete
							</Button>
						</div>
					</Card>
				))}
			</div>
		</div>
	);
}
