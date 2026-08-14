"use client";

import { ApiRequestError, type NoteDetail } from "@notextra/api";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { Button, Field, Input, PageHeader, Textarea } from "@/components/ui";
import { api } from "@/lib/api";

export default function NoteDetailPage() {
	const params = useParams<{ id: string }>();
	const noteId = params?.id;
	const router = useRouter();
	const [note, setNote] = useState<NoteDetail | null>(null);
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [pending, setPending] = useState(false);

	useEffect(() => {
		if (!noteId) {
			return;
		}
		api.notes
			.get(noteId)
			.then((loaded) => {
				setNote(loaded);
				setTitle(loaded.title);
				setContent(loaded.content ?? "");
			})
			.catch((err) => setError(err instanceof Error ? err.message : "Failed to load note"));
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
				<Field label="Title">
					<Input value={title} onChange={(e) => setTitle(e.target.value)} required />
				</Field>
				<Field label="Content">
					<Textarea rows={14} value={content} onChange={(e) => setContent(e.target.value)} />
				</Field>
				{error ? <p className="text-sm text-danger">{error}</p> : null}
				<Button type="submit" disabled={pending}>
					{pending ? "Saving…" : "Save"}
				</Button>
			</form>
		</div>
	);
}
