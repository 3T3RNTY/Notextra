import { NOTE_TYPE_OPTIONS, labelForNoteType, type NoteDetail, type NoteType } from "@notextra/api";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { api, formatDate } from "@/lib/api";
import { Button, Card, Chip, ErrorText, Heading, Input, Muted, Row, Screen, Title } from "@/lib/ui";

export default function NotesScreen() {
	const [notes, setNotes] = useState<NoteDetail[]>([]);
	const [query, setQuery] = useState("");
	const [type, setType] = useState<NoteType | "">("");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const load = useCallback(async (q?: string, nextType?: NoteType | "") => {
		const selectedType = nextType === undefined ? type : nextType;
		setError(null);
		setLoading(true);
		try {
			const result = await api.notes.list({
				q: q || undefined,
				type: selectedType || undefined,
			});
			setNotes(Array.isArray(result) ? result : []);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load notes");
		} finally {
			setLoading(false);
		}
	}, [type]);

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
			<Row>
				<Chip
					label="All"
					active={type === ""}
					onPress={() => {
						setType("");
						void load(query, "");
					}}
				/>
				{NOTE_TYPE_OPTIONS.map((option) => (
					<Chip
						key={option.value}
						label={option.label}
						active={type === option.value}
						onPress={() => {
							setType(option.value);
							void load(query, option.value);
						}}
					/>
				))}
			</Row>
			<Input placeholder="Search" value={query} onChangeText={setQuery} onSubmitEditing={() => void load(query)} />
			<ErrorText message={error} />
			{notes.length === 0 && !loading ? <Muted>No notes yet.</Muted> : null}
			{notes.map((note) => {
				const fileCount = note.attachmentIds?.length ?? 0;
				return (
				<Card key={note.id} onPress={() => router.push(`/(app)/notes/${note.id}`)}>
					<Heading>{note.title}</Heading>
					<Muted>{labelForNoteType(note.type)}</Muted>
					<Muted>{note.content || "No content"}</Muted>
					<Muted>
						{formatDate(note.updatedAt)}
						{fileCount > 0 ? ` · ${fileCount} file${fileCount === 1 ? "" : "s"}` : ""}
					</Muted>
				</Card>
				);
			})}
		</Screen>
	);
}
