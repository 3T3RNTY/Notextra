import {
	ApiRequestError,
	MEDIA_TYPE_OPTIONS,
	labelForMediaType,
	type MediaAssetDetail,
	type MediaType,
} from "@notextra/api";
import * as DocumentPicker from "expo-document-picker";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Linking } from "react-native";
import { api, formatDate, rewriteDevHost, uploadMediaFromUri } from "@/lib/api";
import { Button, Card, Chip, ErrorText, Heading, Muted, Row, Screen, Title } from "@/lib/ui";

export default function MediaScreen() {
	const [assets, setAssets] = useState<MediaAssetDetail[]>([]);
	const [type, setType] = useState<MediaType | "">("");
	const [error, setError] = useState<string | null>(null);
	const [uploading, setUploading] = useState(false);

	const load = useCallback(async (nextType?: MediaType | "") => {
		const selectedType = nextType === undefined ? type : nextType;
		setError(null);
		try {
			setAssets(await api.media.list({ type: selectedType || undefined }));
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load media");
		}
	}, [type]);

	useFocusEffect(
		useCallback(() => {
			void load();
		}, [load]),
	);

	async function onUpload() {
		const result = await DocumentPicker.getDocumentAsync({
			copyToCacheDirectory: true,
		});
		if (result.canceled || !result.assets[0]) {
			return;
		}
		const picked = result.assets[0];
		setUploading(true);
		setError(null);
		try {
			await uploadMediaFromUri({
				uri: picked.uri,
				fileName: picked.name,
				mimeType: picked.mimeType,
				sizeBytes: picked.size,
			});
			await load();
		} catch (err) {
			setError(err instanceof ApiRequestError || err instanceof Error ? err.message : "Upload failed");
		} finally {
			setUploading(false);
		}
	}

	function onDelete(assetId: string) {
		Alert.alert("Delete file", "This cannot be undone.", [
			{ text: "Cancel", style: "cancel" },
			{
				text: "Delete",
				style: "destructive",
				onPress: () => {
					void api.media
						.delete(assetId)
						.then(() => setAssets((current) => current.filter((asset) => asset.id !== assetId)))
						.catch((err) => setError(err instanceof Error ? err.message : "Could not delete file"));
				},
			},
		]);
	}

	return (
		<Screen>
			<Title>Media</Title>
			<Button label={uploading ? "Uploading…" : "Upload"} onPress={() => void onUpload()} disabled={uploading} />
			<Row>
				<Chip
					label="All"
					active={type === ""}
					onPress={() => {
						setType("");
						void load("");
					}}
				/>
				{MEDIA_TYPE_OPTIONS.filter((option) => option.value !== "OTHER").map((option) => (
					<Chip
						key={option.value}
						label={option.label}
						active={type === option.value}
						onPress={() => {
							setType(option.value);
							void load(option.value);
						}}
					/>
				))}
			</Row>
			<ErrorText message={error} />
			{assets.length === 0 ? <Muted>No media yet.</Muted> : null}
			{assets.map((asset) => (
				<Card key={asset.id}>
					<Heading>{asset.fileName}</Heading>
					<Muted>
						{labelForMediaType(asset.type)} · {formatDate(asset.createdAt)}
					</Muted>
					{asset.downloadUrl ? (
						<Button label="Open" variant="ghost" onPress={() => void Linking.openURL(rewriteDevHost(asset.downloadUrl))} />
					) : null}
					<Button label="Delete" variant="danger" onPress={() => onDelete(asset.id)} />
				</Card>
			))}
		</Screen>
	);
}
