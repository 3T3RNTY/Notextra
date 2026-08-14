import type { MediaAssetDetail } from "@notextra/api";
import { useCallback, useState } from "react";
import { Linking } from "react-native";
import { useFocusEffect } from "expo-router";
import { api, formatDate } from "@/lib/api";
import { Button, Card, ErrorText, Heading, Muted, Screen, Title } from "@/lib/ui";

export default function MediaScreen() {
	const [assets, setAssets] = useState<MediaAssetDetail[]>([]);
	const [error, setError] = useState<string | null>(null);

	const load = useCallback(async () => {
		setError(null);
		try {
			setAssets(await api.media.list());
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load media");
		}
	}, []);

	useFocusEffect(
		useCallback(() => {
			void load();
		}, [load]),
	);

	return (
		<Screen>
			<Title>Media</Title>
			<Muted>Upload from the web app for now. This list is wired to GET /api/media.</Muted>
			<ErrorText message={error} />
			{assets.length === 0 ? <Muted>No media yet.</Muted> : null}
			{assets.map((asset) => (
				<Card key={asset.id}>
					<Heading>{asset.fileName}</Heading>
					<Muted>
						{asset.type} · {formatDate(asset.createdAt)}
					</Muted>
					{asset.downloadUrl ? (
						<Button label="Open" variant="ghost" onPress={() => void Linking.openURL(asset.downloadUrl)} />
					) : null}
				</Card>
			))}
		</Screen>
	);
}
