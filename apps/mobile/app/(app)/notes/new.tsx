import { ApiRequestError, NOTE_TYPE_OPTIONS, pickerTypesForNoteType, type NoteType } from "@notextra/api";
import * as DocumentPicker from "expo-document-picker";
import { router } from "expo-router";
import { useState } from "react";
import { api, uploadMediaFromUri } from "@/lib/api";
import { Button, Chip, ErrorText, Field, Input, Row, Screen, Title } from "@/lib/ui";

export default function NewNoteScreen() {
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [type, setType] = useState<NoteType>("TEXT");
	const [fileName, setFileName] = useState<string | null>(null);
	const [picked, setPicked] = useState<{
		uri: string;
		name: string;
		mimeType?: string | null;
		size?: number | null;
	} | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [pending, setPending] = useState(false);

	async function onPickFile() {
		const result = await DocumentPicker.getDocumentAsync({
			type: pickerTypesForNoteType(type),
			copyToCacheDirectory: true,
		});
		if (result.canceled || !result.assets[0]) {
			return;
		}
		const asset = result.assets[0];
		setPicked({
			uri: asset.uri,
			name: asset.name,
			mimeType: asset.mimeType,
			size: asset.size,
		});
		setFileName(asset.name);
	}

	async function onSave() {
		setError(null);
		setPending(true);
		try {
			const note = await api.notes.create({ title, content, type });
			if (picked && type !== "TEXT") {
				const asset = await uploadMediaFromUri({
					uri: picked.uri,
					fileName: picked.name,
					mimeType: picked.mimeType,
					sizeBytes: picked.size,
					noteType: type,
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
			<Field label="Type">
				<Row>
					{NOTE_TYPE_OPTIONS.map((option) => (
						<Chip
							key={option.value}
							label={option.label}
							active={type === option.value}
							onPress={() => {
								setType(option.value);
								setPicked(null);
								setFileName(null);
							}}
						/>
					))}
				</Row>
			</Field>
			<Field label="Title">
				<Input value={title} onChangeText={setTitle} />
			</Field>
			<Field label={type === "TEXT" ? "Content" : "Caption"}>
				<Input
					value={content}
					onChangeText={setContent}
					multiline
					style={{ minHeight: type === "TEXT" ? 160 : 80, textAlignVertical: "top" }}
				/>
			</Field>
			{type !== "TEXT" ? (
				<Button label={fileName ? `File: ${fileName}` : "Choose file"} variant="ghost" onPress={() => void onPickFile()} />
			) : null}
			<ErrorText message={error} />
			<Button label={pending ? "Saving…" : "Create"} onPress={() => void onSave()} disabled={pending} />
		</Screen>
	);
}
