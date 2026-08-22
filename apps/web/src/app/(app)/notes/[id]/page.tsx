"use client";

import {
	ApiRequestError,
	labelForNoteType,
	type MediaAssetDetail,
	type NoteDetail,
} from "@notextra/api";
import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, Card, Field, Input, PageHeader, Select, Textarea } from "@/components/ui";
import { api, fileAcceptForNoteType, formatDate, loadNoteAttachments, uploadMediaFile } from "@/lib/api";
import { downloadMediaFile, openMediaInBrowser } from "@/lib/media-file";

export default function NoteDetailPage() {
	const params = useParams<{ id: string }>();
	const noteId = params?.id;
	const router = useRouter();
	const [note, setNote] = useState<NoteDetail | null>(null);
	const [attachments, setAttachments] = useState<MediaAssetDetail[]>([]);
	const [library, setLibrary] = useState<MediaAssetDetail[]>([]);
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [existingId, setExistingId] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [pending, setPending] = useState(false);
	const [busyFile, setBusyFile] = useState(false);

	async function loadNote(id: string) {
		const loaded = await api.notes.get(id);
		const [attached, all] = await Promise.all([loadNoteAttachments(loaded), api.media.list()]);
		setNote(loaded);
		setTitle(loaded.title);
		setContent(loaded.content ?? "");
		setAttachments(attached);
		setLibrary(all);
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

	async function onAddFiles(fileList: FileList | null) {
		if (!note || !fileList?.length) {
			return;
		}
		setBusyFile(true);
		setError(null);
		try {
			let updated = note;
			for (const file of Array.from(fileList)) {
				const asset = await uploadMediaFile(file, note.type);
				updated = await api.notes.attachMedia(note.id, asset.id);
			}
			await loadNote(updated.id);
		} catch (err) {
			setError(err instanceof ApiRequestError || err instanceof Error ? err.message : "Could not attach file");
		} finally {
			setBusyFile(false);
		}
	}

	async function onAttachExisting() {
		if (!note || !existingId) {
			return;
		}
		setBusyFile(true);
		setError(null);
		try {
			await api.notes.attachMedia(note.id, existingId);
			setExistingId("");
			await loadNote(note.id);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Could not attach file");
		} finally {
			setBusyFile(false);
		}
	}

	async function onRemove(assetId: string) {
		if (!note) {
			return;
		}
		setBusyFile(true);
		setError(null);
		try {
			await api.notes.detachMedia(note.id, assetId);
			await loadNote(note.id);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Could not remove file");
		} finally {
			setBusyFile(false);
		}
	}

	async function onDeleteFile(assetId: string) {
		if (!note || !confirm("Delete this file?")) {
			return;
		}
		setError(null);
		try {
			await api.media.delete(assetId);
			await loadNote(note.id);
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

	const availableLibrary = library.filter((asset) => !(note?.attachmentIds ?? []).includes(asset.id));

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
					<div className="flex flex-wrap items-center justify-between gap-3">
						<h2 className="text-lg font-medium">Files</h2>
						<label className="inline-flex cursor-pointer">
							<span className="inline-flex items-center justify-center rounded-md bg-surface-muted px-3 py-2 text-sm font-medium">
								{busyFile ? "Working…" : "Add file"}
							</span>
							<input
								type="file"
								multiple
								accept={note.type === "TEXT" ? undefined : fileAcceptForNoteType(note.type)}
								className="hidden"
								disabled={busyFile}
								onChange={(event) => {
									const list = event.target.files;
									event.target.value = "";
									void onAddFiles(list);
								}}
							/>
						</label>
					</div>
					{availableLibrary.length > 0 ? (
						<div className="flex gap-2">
							<Select value={existingId} onChange={(e) => setExistingId(e.target.value)}>
								<option value="">Attach existing media</option>
								{availableLibrary.map((asset) => (
									<option key={asset.id} value={asset.id}>
										{asset.fileName}
									</option>
								))}
							</Select>
							<Button type="button" variant="ghost" disabled={busyFile || !existingId} onClick={() => void onAttachExisting()}>
								Attach
							</Button>
						</div>
					) : null}
					{attachments.length === 0 ? <p className="text-sm text-muted">No files attached.</p> : null}
					{attachments.map((asset) => (
						<Card key={asset.id} className="flex flex-wrap items-center justify-between gap-3">
							<div>
								<p className="font-medium">{asset.fileName}</p>
								<p className="text-xs text-muted">
									{asset.type} · {formatDate(asset.createdAt)}
								</p>
							</div>
							<div className="flex flex-wrap items-center gap-2">
								<Button variant="ghost" onClick={() => void openMediaInBrowser(asset)}>
									Open
								</Button>
								<Button variant="ghost" onClick={() => void downloadMediaFile(asset)}>
									Download
								</Button>
								<Button variant="ghost" disabled={busyFile} onClick={() => void onRemove(asset.id)}>
									Remove
								</Button>
								<Button variant="danger" disabled={busyFile} onClick={() => void onDeleteFile(asset.id)}>
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
