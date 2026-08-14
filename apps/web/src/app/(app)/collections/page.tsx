"use client";

import { ApiRequestError, type CollectionDetail } from "@notextra/api";
import { FormEvent, useEffect, useState } from "react";
import { Button, Card, Field, Input, PageHeader, StatusMessage } from "@/components/ui";
import { api, formatDate } from "@/lib/api";

export default function CollectionsPage() {
	const [collections, setCollections] = useState<CollectionDetail[]>([]);
	const [name, setName] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);

	async function load() {
		setError(null);
		setLoading(true);
		try {
			setCollections(await api.collections.list());
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load collections");
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		void load();
	}, []);

	async function onCreate(event: FormEvent) {
		event.preventDefault();
		try {
			await api.collections.create({ name });
			setName("");
			await load();
		} catch (err) {
			setError(err instanceof ApiRequestError ? err.message : "Could not create collection");
		}
	}

	async function onDelete(id: string) {
		await api.collections.delete(id);
		await load();
	}

	return (
		<div>
			<PageHeader title="Collections" />
			<form className="mb-6 flex max-w-md gap-2" onSubmit={onCreate}>
				<Field label="Name">
					<Input value={name} onChange={(e) => setName(e.target.value)} required />
				</Field>
				<Button type="submit" className="mt-6">
					Create
				</Button>
			</form>
			{loading ? <p className="text-sm text-muted">Loading…</p> : null}
			<StatusMessage error={error} empty={!loading && collections.length === 0 ? "No collections yet." : null} />
			<div className="grid gap-3">
				{collections.map((collection) => (
					<Card key={collection.id} className="flex items-center justify-between gap-3">
						<div>
							<h2 className="font-medium">{collection.name}</h2>
							<p className="text-xs text-muted">
								{collection.noteIds.length} notes · {formatDate(collection.createdAt)}
							</p>
						</div>
						<Button variant="ghost" onClick={() => void onDelete(collection.id)}>
							Delete
						</Button>
					</Card>
				))}
			</div>
		</div>
	);
}
