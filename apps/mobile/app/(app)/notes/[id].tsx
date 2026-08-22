import { ApiRequestError, type MediaAssetDetail, type NoteDetail } from "@notextra/api";
import * as DocumentPicker from "expo-document-picker";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { api, formatDate } from "@/lib/api";
import { loadNoteAttachments, shareMediaFile, uploadMediaFromUri } from "@/lib/media-file";
import { Button, Card, ErrorText, Field, Heading, Input, Muted, Row, Screen, Title } from "@/lib/ui";

export default function NoteDetailScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const [note, setNote] = useState<NoteDetail | null>(null);
	const [attachments, setAttachments] = useState<MediaAssetDetail[]>([]);
	const [library, setLibrary] = useState<MediaAssetDetail[]>([]);
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [pending, setPending] = useState(false);
	const [busyFile, setBusyFile] = useState(false);

	async function loadNote(noteId: string) {
		const loaded = await api.notes.get(noteId);
		const [attached, all] = await Promise.all([loadNoteAttachments(loaded), api.media.list()]);
		setNote(loaded);
		setTitle(loaded.title);
		setContent(loaded.content ?? "");
		setAttachments(attached);
		setLibrary(all);
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

	async function onAddFiles() {
		if (!note) {
			return;
		}
		const result = await DocumentPicker.getDocumentAsync({
			copyToCacheDirectory: true,
			multiple: true,
		});
		if (result.canceled || result.assets.length === 0) {
			return;
		}
		setBusyFile(true);
		setError(null);
		try {
			for (const picked of result.assets) {
				const asset = await uploadMediaFromUri({
					uri: picked.uri,
					fileName: picked.name,
					mimeType: picked.mimeType,
					sizeBytes: picked.size,
				});
				await api.notes.attachMedia(note.id, asset.id);
			}
			await loadNote(note.id);
		} catch (err) {
			setError(err instanceof ApiRequestError || err instanceof Error ? err.message : "Could not attach file");
		} finally {
			setBusyFile(false);
		}
	}

	async function onAttachExisting(assetId: string) {
		if (!note) {
			return;
		}
		setBusyFile(true);
		setError(null);
		try {
			await api.notes.attachMedia(note.id, assetId);
			await loadNote(note.id);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Could not attach file");
		} finally {
			setBusyFile(false);
		}
	}

	function onRemove(assetId: string) {
		if (!note) {
			return;
		}
		Alert.alert("Remove file", "Remove this file from the note? It stays in Media.", [
			{ text: "Cancel", style: "cancel" },
			{
				text: "Remove",
				style: "destructive",
				onPress: () => {
					void api.notes
						.detachMedia(note.id, assetId)
						.then(() => loadNote(note.id))
						.catch((err) => setError(err instanceof Error ? err.message : "Could not remove file"));
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

	const availableLibrary = library.filter((asset) => !(note?.attachmentIds ?? []).includes(asset.id));

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
			<Button
				label={busyFile ? "Working…" : "Add files"}
				variant="ghost"
				onPress={() => void onAddFiles()}
				disabled={busyFile}
			/>
			{attachments.map((asset) => (
				<Card key={asset.id}>
					<Heading>{asset.fileName}</Heading>
					<Muted>
						{asset.type} · {formatDate(asset.createdAt)}
					</Muted>
					<Row>
						<Button label="Open" variant="ghost" onPress={() => void shareMediaFile(asset, false)} />
						<Button label="Download" variant="ghost" onPress={() => void shareMediaFile(asset, true)} />
						<Button label="Remove" variant="danger" onPress={() => onRemove(asset.id)} />
					</Row>
				</Card>
			))}
			{availableLibrary.length > 0 ? <Muted>Attach from Media</Muted> : null}
			{availableLibrary.map((asset) => (
				<Button
					key={asset.id}
					label={`Attach ${asset.fileName}`}
					variant="ghost"
					disabled={busyFile}
					onPress={() => void onAttachExisting(asset.id)}
				/>
			))}
			<Button label="Delete" variant="danger" onPress={onDelete} />
		</Screen>
	);
}
