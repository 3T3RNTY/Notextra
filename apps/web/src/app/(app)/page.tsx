"use client";

import { NOTE_TYPE_OPTIONS, labelForNoteType, type NoteDetail, type NoteType } from "@notextra/api";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, Card, FilterChip, Input, PageHeader, StatusMessage } from "@/components/ui";
import { api, formatDate } from "@/lib/api";

export default function NotesPage() {
	const [notes, setNotes] = useState<NoteDetail[]>([]);
	const [query, setQuery] = useState("");
	const [type, setType] = useState<NoteType | "">("");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);

	async function load(q?: string, nextType?: NoteType | "") {
		const selectedType = nextType === undefined ? type : nextType;
		setError(null);
		setLoading(true);
		try {
			setNotes(
				await api.notes.list({
					q: q || undefined,
					type: selectedType || undefined,
				}),
			);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load notes");
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		void load();
		// eslint-disable-next-line react-hooks/exhaustive-deps
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
			<div className="mb-4 flex flex-wrap gap-2">
				<FilterChip
					active={type === ""}
					onClick={() => {
						setType("");
						void load(query, "");
					}}
				>
					All
				</FilterChip>
				{NOTE_TYPE_OPTIONS.map((option) => (
					<FilterChip
						key={option.value}
						active={type === option.value}
						onClick={() => {
							setType(option.value);
							void load(query, option.value);
						}}
					>
						{option.label}
					</FilterChip>
				))}
			</div>
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
							<div className="flex items-start justify-between gap-3">
								<h2 className="font-medium">{note.title}</h2>
								<span className="rounded-full bg-surface-muted px-2 py-0.5 text-xs text-muted">
									{labelForNoteType(note.type)}
								</span>
							</div>
							<p className="mt-1 line-clamp-2 text-sm text-muted">{note.content || "No content"}</p>
							<p className="mt-2 text-xs text-muted">{formatDate(note.updatedAt)}</p>
						</Card>
					</Link>
				))}
			</div>
		</div>
	);
}
