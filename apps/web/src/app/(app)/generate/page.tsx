"use client";

import { ApiRequestError, type GenerationJobDetail, type GenerationOutputType, type NoteDetail } from "@notextra/api";
import { FormEvent, useEffect, useState } from "react";
import { Button, Card, Field, PageHeader, Select, StatusMessage, Textarea } from "@/components/ui";
import { api, formatDate } from "@/lib/api";

const OUTPUT_TYPES: GenerationOutputType[] = ["NOTE", "PRESENTATION", "TRANSCRIPT", "MARKDOWN", "PDF"];

export default function GeneratePage() {
	const [jobs, setJobs] = useState<GenerationJobDetail[]>([]);
	const [notes, setNotes] = useState<NoteDetail[]>([]);
	const [outputType, setOutputType] = useState<GenerationOutputType>("NOTE");
	const [prompt, setPrompt] = useState("");
	const [sourceNoteId, setSourceNoteId] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);

	async function load() {
		setError(null);
		setLoading(true);
		try {
			const [jobList, noteList] = await Promise.all([api.generation.list(), api.notes.list()]);
			setJobs(jobList);
			setNotes(noteList);
			if (!sourceNoteId && noteList[0]) {
				setSourceNoteId(noteList[0].id);
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load generation jobs");
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		void load();
	}, []);

	async function onSubmit(event: FormEvent) {
		event.preventDefault();
		try {
			await api.generation.create({
				outputType,
				prompt,
				sourceNoteIds: sourceNoteId ? [sourceNoteId] : [],
			});
			setPrompt("");
			await load();
		} catch (err) {
			setError(err instanceof ApiRequestError ? err.message : "Could not start job");
		}
	}

	return (
		<div>
			<PageHeader title="Generate" />
			<form className="mb-8 max-w-xl space-y-3" onSubmit={onSubmit}>
				<Field label="Output type">
					<Select value={outputType} onChange={(e) => setOutputType(e.target.value as GenerationOutputType)}>
						{OUTPUT_TYPES.map((type) => (
							<option key={type} value={type}>
								{type}
							</option>
						))}
					</Select>
				</Field>
				<Field label="Source note">
					<Select value={sourceNoteId} onChange={(e) => setSourceNoteId(e.target.value)}>
						<option value="">None</option>
						{notes.map((note) => (
							<option key={note.id} value={note.id}>
								{note.title}
							</option>
						))}
					</Select>
				</Field>
				<Field label="Prompt">
					<Textarea rows={4} value={prompt} onChange={(e) => setPrompt(e.target.value)} />
				</Field>
				<Button type="submit">Start job</Button>
			</form>
			{loading ? <p className="text-sm text-muted">Loading…</p> : null}
			<StatusMessage error={error} empty={!loading && jobs.length === 0 ? "No generation jobs yet." : null} />
			<div className="grid gap-3">
				{jobs.map((job) => (
					<Card key={job.id}>
						<div className="flex items-center justify-between gap-3">
							<h2 className="font-medium">{job.outputType}</h2>
							<span className="text-xs text-accent">{job.status}</span>
						</div>
						<p className="mt-1 text-sm text-muted">{job.prompt || "No prompt"}</p>
						<p className="mt-2 text-xs text-muted">{formatDate(job.createdAt)}</p>
						{job.errorMessage ? <p className="mt-2 text-sm text-danger">{job.errorMessage}</p> : null}
					</Card>
				))}
			</div>
		</div>
	);
}
