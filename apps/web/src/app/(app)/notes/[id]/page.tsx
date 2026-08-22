"use client";

import {
	ApiRequestError,
	labelForNoteType,
	type MediaAssetDetail,
	type NoteDetail,
} from "@notextra/api";
import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, Card, Field, Input, PageHeader, Textarea } from "@/components/ui";
import { api, fileAcceptForNoteType, formatDate, uploadMediaFile } from "@/lib/api";

export default function NoteDetailPage() {
	const params = useParams<{ id: string }>();
	const noteId = params?.id;
	const router = useRouter();
	const [note, setNote] = useState<NoteDetail | null>(null);
	const [attachments, setAttachments] = useState<MediaAssetDetail[]>([]);
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [pending, setPending] = useState(false);
	const [uploading, setUploading] = useState(false);

	async function loadNote(id: string) {
		const loaded = await api.notes.get(id);
		setNote(loaded);
		setTitle(loaded.title);
		setContent(loaded.content ?? "");
		if (loaded.attachmentIds.length === 0) {
			setAttachments([]);
			return loaded;
		}
		const assets = await api.media.list();
		setAttachments(assets.filter((asset) => loaded.attachmentIds.includes(asset.id)));
		return loaded;
	}

	useEffect(() => {
		if (!noteId) {
			return;
		}
		loadNote(noteId).catch((err) => setError(err instanceof Error ? err.message : "Failed to load note"));
	}, [noteId]);

	async function onSave(event: FormEvent) {
		event.preventDefault();
		if (!note) {
			return;
		}
		setError(null);
		setPending(true);
		try {
			const updated = await api.notes.update(note.id, { title, content, status: note.status });
			setNote(updated);
		} catch (err) {
			setError(err instanceof ApiRequestError ? err.message : "Could not save note");
		} finally {
			setPending(false);
		}
	}

	async function onAddFile(file: File | undefined) {
		if (!note || !file) {
			return;
		}
		setUploading(true);
		setError(null);
		try {
			const asset = await uploadMediaFile(file, note.type);
			const updated = await api.notes.attachMedia(note.id, asset.id);
			setNote(updated);
			setAttachments((current) => [asset, ...current.filter((item) => item.id !== asset.id)]);
		} catch (err) {
			setError(err instanceof ApiRequestError || err instanceof Error ? err.message : "Upload failed");
		} finally {
			setUploading(false);
		}
	}

	async function onDeleteFile(assetId: string) {
		if (!note || !confirm("Delete this file?")) {
			return;
		}
		setError(null);
		try {
			await api.media.delete(assetId);
			const updated = await api.notes.get(note.id);
			setNote(updated);
			setAttachments((current) => current.filter((asset) => asset.id !== assetId));
		} catch (err) {
			setError(err instanceof Error ? err.message : "Could not delete file");
		}
	}

	async function onDelete() {
		if (!note || !confirm("Delete this note?")) {
			return;
		}
		await api.notes.delete(note.id);
		router.replace("/");
	}

	if (!note && !error) {
		return <p className="text-sm text-muted">Loading…</p>;
	}

	return (
		<div className="max-w-2xl">
			<PageHeader
				title="Edit note"
				actions={
					<Button variant="danger" onClick={() => void onDelete()}>
						Delete
					</Button>
				}
			/>
			<form className="space-y-3" onSubmit={onSave}>
				<Field label="Type">
					<Input value={labelForNoteType(note?.type)} readOnly />
				</Field>
				<Field label="Title">
					<Input value={title} onChange={(e) => setTitle(e.target.value)} required />
				</Field>
				<Field label={note?.type === "TEXT" ? "Content" : "Caption"}>
					<Textarea rows={note?.type === "TEXT" ? 14 : 6} value={content} onChange={(e) => setContent(e.target.value)} />
				</Field>
				{error ? <p className="text-sm text-danger">{error}</p> : null}
				<Button type="submit" disabled={pending}>
					{pending ? "Saving…" : "Save"}
				</Button>
			</form>

			{note ? (
				<div className="mt-8 space-y-3">
					<div className="flex items-center justify-between gap-3">
						<h2 className="text-lg font-medium">Files</h2>
						<label className="inline-flex cursor-pointer">
							<span className="inline-flex items-center justify-center rounded-md bg-surface-muted px-3 py-2 text-sm font-medium">
								{uploading ? "Uploading…" : "Add file"}
							</span>
							<input
								type="file"
								accept={note.type === "TEXT" ? undefined : fileAcceptForNoteType(note.type)}
								className="hidden"
								disabled={uploading}
								onChange={(event) => {
									const file = event.target.files?.[0];
									event.target.value = "";
									void onAddFile(file);
								}}
							/>
						</label>
					</div>
					{attachments.length === 0 ? <p className="text-sm text-muted">No files attached.</p> : null}
					{attachments.map((asset) => (
						<Card key={asset.id} className="flex items-center justify-between gap-3">
							<div>
								<p className="font-medium">{asset.fileName}</p>
								<p className="text-xs text-muted">{formatDate(asset.createdAt)}</p>
							</div>
							<div className="flex items-center gap-2">
								{asset.downloadUrl ? (
									<a href={asset.downloadUrl} className="text-sm text-accent underline" target="_blank" rel="noreferrer">
										Open
									</a>
								) : null}
								<Button variant="danger" onClick={() => void onDeleteFile(asset.id)}>
									Delete
								</Button>
							</div>
						</Card>
					))}
				</div>
			) : null}
		</div>
	);
}
