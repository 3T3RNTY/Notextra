import type { NoteDetail } from "@notextra/api";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { api, formatDate } from "@/lib/api";
import { Button, Card, ErrorText, Heading, Input, Muted, Row, Screen, Title } from "@/lib/ui";

export default function NotesScreen() {
	const [notes, setNotes] = useState<NoteDetail[]>([]);
	const [query, setQuery] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const load = useCallback(async (q?: string) => {
		setError(null);
		setLoading(true);
		try {
			setNotes(await api.notes.list({ q: q || undefined }));
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load notes");
		} finally {
			setLoading(false);
		}
	}, []);

	useFocusEffect(
		useCallback(() => {
			void load();
		}, [load]),
	);

	return (
		<Screen>
			<Title>Notes</Title>
			<Row>
				<Button label="New note" onPress={() => router.push("/(app)/notes/new")} />
				<Button label="Collections" variant="ghost" onPress={() => router.push("/(app)/notes/collections")} />
			</Row>
			<Input placeholder="Search" value={query} onChangeText={setQuery} onSubmitEditing={() => void load(query)} />
			<ErrorText message={error} />
			{notes.length === 0 && !loading ? <Muted>No notes yet.</Muted> : null}
			{notes.map((note) => (
				<Card key={note.id} onPress={() => router.push(`/(app)/notes/${note.id}`)}>
					<Heading>{note.title}</Heading>
					<Muted>{note.content || "No content"}</Muted>
					<Muted>{formatDate(note.updatedAt)}</Muted>
				</Card>
			))}
		</Screen>
	);
}
