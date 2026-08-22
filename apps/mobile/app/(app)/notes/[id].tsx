import { ApiRequestError, labelForNoteType, pickerTypesForNoteType, type MediaAssetDetail, type NoteDetail } from "@notextra/api";
import * as DocumentPicker from "expo-document-picker";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Linking } from "react-native";
import { api, formatDate, rewriteDevHost, uploadMediaFromUri } from "@/lib/api";
import { Button, Card, ErrorText, Field, Heading, Input, Muted, Screen, Title } from "@/lib/ui";

export default function NoteDetailScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const [note, setNote] = useState<NoteDetail | null>(null);
	const [attachments, setAttachments] = useState<MediaAssetDetail[]>([]);
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [pending, setPending] = useState(false);
	const [uploading, setUploading] = useState(false);

	async function loadNote(noteId: string) {
		const loaded = await api.notes.get(noteId);
		setNote(loaded);
		setTitle(loaded.title);
		setContent(loaded.content ?? "");
		if (loaded.attachmentIds.length === 0) {
			setAttachments([]);
			return;
		}
		const assets = await api.media.list();
		setAttachments(assets.filter((asset) => loaded.attachmentIds.includes(asset.id)));
	}

	useEffect(() => {
		if (!id) {
			return;
		}
		loadNote(id).catch((err) => setError(err instanceof Error ? err.message : "Failed to load note"));
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

	async function onAddFile() {
		if (!note) {
			return;
		}
		const result = await DocumentPicker.getDocumentAsync({
			type: note.type === "TEXT" ? "*/*" : pickerTypesForNoteType(note.type),
			copyToCacheDirectory: true,
		});
		if (result.canceled || !result.assets[0]) {
			return;
		}
		const picked = result.assets[0];
		setUploading(true);
		setError(null);
		try {
			const asset = await uploadMediaFromUri({
				uri: picked.uri,
				fileName: picked.name,
				mimeType: picked.mimeType,
				sizeBytes: picked.size,
				noteType: note.type,
			});
			const updated = await api.notes.attachMedia(note.id, asset.id);
			setNote(updated);
			setAttachments((current) => [asset, ...current.filter((item) => item.id !== asset.id)]);
		} catch (err) {
			setError(err instanceof ApiRequestError || err instanceof Error ? err.message : "Upload failed");
		} finally {
			setUploading(false);
		}
	}

	function onDeleteFile(assetId: string) {
		Alert.alert("Delete file", "This cannot be undone.", [
			{ text: "Cancel", style: "cancel" },
			{
				text: "Delete",
				style: "destructive",
				onPress: () => {
					void api.media
						.delete(assetId)
						.then(async () => {
							if (note) {
								const updated = await api.notes.get(note.id);
								setNote(updated);
							}
							setAttachments((current) => current.filter((asset) => asset.id !== assetId));
						})
						.catch((err) => setError(err instanceof Error ? err.message : "Could not delete file"));
				},
			},
		]);
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
			<Field label="Type">
				<Muted>{labelForNoteType(note?.type)}</Muted>
			</Field>
			<Field label="Title">
				<Input value={title} onChangeText={setTitle} />
			</Field>
			<Field label={note?.type === "TEXT" ? "Content" : "Caption"}>
				<Input
					value={content}
					onChangeText={setContent}
					multiline
					style={{ minHeight: note?.type === "TEXT" ? 180 : 80, textAlignVertical: "top" }}
				/>
			</Field>
			<ErrorText message={error} />
			<Button label={pending ? "Saving…" : "Save"} onPress={() => void onSave()} disabled={pending} />
			<Button label={uploading ? "Uploading…" : "Add file"} variant="ghost" onPress={() => void onAddFile()} disabled={uploading} />
			{attachments.map((asset) => (
				<Card key={asset.id}>
					<Heading>{asset.fileName}</Heading>
					<Muted>{formatDate(asset.createdAt)}</Muted>
					{asset.downloadUrl ? (
						<Button label="Open" variant="ghost" onPress={() => void Linking.openURL(rewriteDevHost(asset.downloadUrl))} />
					) : null}
					<Button label="Delete file" variant="danger" onPress={() => onDeleteFile(asset.id)} />
				</Card>
			))}
			<Button label="Delete" variant="danger" onPress={onDelete} />
		</Screen>
	);
}
