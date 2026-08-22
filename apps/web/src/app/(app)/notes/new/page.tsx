"use client";

import { ApiRequestError, NOTE_TYPE_OPTIONS, type NoteType } from "@notextra/api";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button, Field, Input, PageHeader, Select, Textarea } from "@/components/ui";
import { api, fileAcceptForNoteType, uploadMediaFile } from "@/lib/api";

export default function NewNotePage() {
	const router = useRouter();
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [type, setType] = useState<NoteType>("TEXT");
	const [files, setFiles] = useState<File[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [pending, setPending] = useState(false);

	async function onSubmit(event: FormEvent) {
		event.preventDefault();
		setError(null);
		setPending(true);
		try {
			const note = await api.notes.create({ title, content, type });
			for (const file of files) {
				const asset = await uploadMediaFile(file, type);
				await api.notes.attachMedia(note.id, asset.id);
			}
			router.replace(`/notes/${note.id}`);
		} catch (err) {
			setError(err instanceof ApiRequestError ? err.message : "Could not create note");
		} finally {
			setPending(false);
		}
	}

	return (
		<div className="max-w-2xl">
			<PageHeader title="New note" />
			<form className="space-y-3" onSubmit={onSubmit}>
				<Field label="Type">
					<Select
						value={type}
						onChange={(e) => {
							const next = e.target.value as NoteType;
							setType(next);
							setFiles([]);
						}}
					>
						{NOTE_TYPE_OPTIONS.map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</Select>
				</Field>
				<Field label="Title">
					<Input value={title} onChange={(e) => setTitle(e.target.value)} required />
				</Field>
				<Field label={type === "TEXT" ? "Content" : "Caption"}>
					<Textarea rows={type === "TEXT" ? 12 : 4} value={content} onChange={(e) => setContent(e.target.value)} />
				</Field>
				<Field label="Files">
					<Input
						type="file"
						multiple
						accept={type === "TEXT" ? undefined : fileAcceptForNoteType(type)}
						onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
					/>
				</Field>
				{files.length > 0 ? (
					<p className="text-sm text-muted">{files.map((file) => file.name).join(", ")}</p>
				) : null}
				{error ? <p className="text-sm text-danger">{error}</p> : null}
				<Button type="submit" disabled={pending}>
					{pending ? "Saving…" : "Create"}
				</Button>
			</form>
		</div>
	);
}
