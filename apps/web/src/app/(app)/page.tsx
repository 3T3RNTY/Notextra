"use client";

import type { NoteDetail } from "@notextra/api";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, Card, Input, PageHeader, StatusMessage } from "@/components/ui";
import { api, formatDate } from "@/lib/api";

export default function NotesPage() {
	const [notes, setNotes] = useState<NoteDetail[]>([]);
	const [query, setQuery] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);

	async function load(q?: string) {
		setError(null);
		setLoading(true);
		try {
			setNotes(await api.notes.list({ q: q || undefined }));
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load notes");
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		void load();
	}, []);

	return (
		<div>
			<PageHeader
				title="Notes"
				actions={
					<Link href="/notes/new">
						<Button>New note</Button>
					</Link>
				}
			/>
			<form
				className="mb-4 flex gap-2"
				onSubmit={(event) => {
					event.preventDefault();
					void load(query);
				}}
			>
				<Input placeholder="Search notes" value={query} onChange={(e) => setQuery(e.target.value)} />
				<Button type="submit" variant="ghost">
					Search
				</Button>
			</form>
			{loading ? <p className="text-sm text-muted">Loading…</p> : null}
			<StatusMessage error={error} empty={!loading && notes.length === 0 ? "No notes yet." : null} />
			<div className="grid gap-3">
				{notes.map((note) => (
					<Link key={note.id} href={`/notes/${note.id}`}>
						<Card className="hover:border-accent">
							<h2 className="font-medium">{note.title}</h2>
							<p className="mt-1 line-clamp-2 text-sm text-muted">{note.content || "No content"}</p>
							<p className="mt-2 text-xs text-muted">
								{formatDate(note.updatedAt)}
								{note.attachmentIds.length > 0
									? ` · ${note.attachmentIds.length} file${note.attachmentIds.length === 1 ? "" : "s"}`
									: ""}
							</p>
						</Card>
					</Link>
				))}
			</div>
		</div>
	);
}
