"use client";

import { ApiRequestError } from "@notextra/api";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button, Field, Input, PageHeader, Textarea } from "@/components/ui";
import { api } from "@/lib/api";

export default function NewNotePage() {
	const router = useRouter();
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [pending, setPending] = useState(false);

	async function onSubmit(event: FormEvent) {
		event.preventDefault();
		setError(null);
		setPending(true);
		try {
			const note = await api.notes.create({ title, content });
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
				<Field label="Title">
					<Input value={title} onChange={(e) => setTitle(e.target.value)} required />
				</Field>
				<Field label="Content">
					<Textarea rows={12} value={content} onChange={(e) => setContent(e.target.value)} />
				</Field>
				{error ? <p className="text-sm text-danger">{error}</p> : null}
				<Button type="submit" disabled={pending}>
					{pending ? "Saving…" : "Create"}
				</Button>
			</form>
		</div>
	);
}
