import { ApiRequestError } from "@notextra/api";
import { router } from "expo-router";
import { useState } from "react";
import { api } from "@/lib/api";
import { Button, ErrorText, Field, Input, Screen, Title } from "@/lib/ui";

export default function NewNoteScreen() {
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [pending, setPending] = useState(false);

	async function onSave() {
		setError(null);
		setPending(true);
		try {
			const note = await api.notes.create({ title, content });
			router.replace(`/(app)/notes/${note.id}`);
		} catch (err) {
			setError(err instanceof ApiRequestError ? err.message : "Could not create note");
		} finally {
			setPending(false);
		}
	}

	return (
		<Screen>
			<Title>New note</Title>
			<Field label="Title">
				<Input value={title} onChangeText={setTitle} />
			</Field>
			<Field label="Content">
				<Input value={content} onChangeText={setContent} multiline style={{ minHeight: 160, textAlignVertical: "top" }} />
			</Field>
			<ErrorText message={error} />
			<Button label={pending ? "Saving…" : "Create"} onPress={() => void onSave()} disabled={pending} />
		</Screen>
	);
}
