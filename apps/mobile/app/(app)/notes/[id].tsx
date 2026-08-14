import { ApiRequestError, type NoteDetail } from "@notextra/api";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { api } from "@/lib/api";
import { Button, ErrorText, Field, Input, Screen, Title } from "@/lib/ui";

export default function NoteDetailScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const [note, setNote] = useState<NoteDetail | null>(null);
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [pending, setPending] = useState(false);

	useEffect(() => {
		if (!id) {
			return;
		}
		api.notes
			.get(id)
			.then((loaded) => {
				setNote(loaded);
				setTitle(loaded.title);
				setContent(loaded.content ?? "");
			})
			.catch((err) => setError(err instanceof Error ? err.message : "Failed to load note"));
	}, [id]);

	async function onSave() {
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

	function onDelete() {
		if (!note) {
			return;
		}
		Alert.alert("Delete note", "This cannot be undone.", [
			{ text: "Cancel", style: "cancel" },
			{
				text: "Delete",
				style: "destructive",
				onPress: () => {
					void api.notes.delete(note.id).then(() => router.replace("/(app)/notes"));
				},
			},
		]);
	}

	return (
		<Screen>
			<Title>Edit note</Title>
			<Field label="Title">
				<Input value={title} onChangeText={setTitle} />
			</Field>
			<Field label="Content">
				<Input value={content} onChangeText={setContent} multiline style={{ minHeight: 180, textAlignVertical: "top" }} />
			</Field>
			<ErrorText message={error} />
			<Button label={pending ? "Saving…" : "Save"} onPress={() => void onSave()} disabled={pending} />
			<Button label="Delete" variant="danger" onPress={onDelete} />
		</Screen>
	);
}
