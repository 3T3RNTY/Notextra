import { ApiRequestError } from "@notextra/api";
import * as DocumentPicker from "expo-document-picker";
import { router } from "expo-router";
import { useState } from "react";
import { api } from "@/lib/api";
import { uploadMediaFromUri } from "@/lib/media-file";
import { Button, ErrorText, Field, Input, Muted, Screen, Title } from "@/lib/ui";

type PickedFile = {
	uri: string;
	name: string;
	mimeType?: string | null;
	size?: number | null;
};

export default function NewNoteScreen() {
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [files, setFiles] = useState<PickedFile[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [pending, setPending] = useState(false);

	async function onPickFile() {
		const result = await DocumentPicker.getDocumentAsync({
			copyToCacheDirectory: true,
			multiple: true,
		});
		if (result.canceled || result.assets.length === 0) {
			return;
		}
		setFiles(
			result.assets.map((asset) => ({
				uri: asset.uri,
				name: asset.name,
				mimeType: asset.mimeType,
				size: asset.size,
			})),
		);
	}

	async function onSave() {
		setError(null);
		setPending(true);
		try {
			const note = await api.notes.create({ title, content });
			for (const file of files) {
				const asset = await uploadMediaFromUri({
					uri: file.uri,
					fileName: file.name,
					mimeType: file.mimeType,
					sizeBytes: file.size,
				});
				await api.notes.attachMedia(note.id, asset.id);
			}
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
			<Button
				label={files.length ? `${files.length} file(s) selected` : "Add files"}
				variant="ghost"
				onPress={() => void onPickFile()}
			/>
			{files.length > 0 ? <Muted>{files.map((file) => file.name).join(", ")}</Muted> : null}
			<ErrorText message={error} />
			<Button label={pending ? "Saving…" : "Create"} onPress={() => void onSave()} disabled={pending} />
		</Screen>
	);
}
