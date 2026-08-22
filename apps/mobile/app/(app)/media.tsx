import type { MediaAssetDetail } from "@notextra/api";
import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { api, formatDate } from "@/lib/api";
import { shareMediaFile } from "@/lib/media-file";
import { Button, Card, ErrorText, Heading, Muted, Row, Screen, Title } from "@/lib/ui";

export default function MediaScreen() {
	const [assets, setAssets] = useState<MediaAssetDetail[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [busyId, setBusyId] = useState<string | null>(null);

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

	async function onOpen(asset: MediaAssetDetail) {
		setBusyId(asset.id);
		setError(null);
		try {
			await shareMediaFile(asset, false);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Could not open file");
		} finally {
			setBusyId(null);
		}
	}

	async function onDownload(asset: MediaAssetDetail) {
		setBusyId(asset.id);
		setError(null);
		try {
			await shareMediaFile(asset, true);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Could not download file");
		} finally {
			setBusyId(null);
		}
	}

	return (
		<Screen>
			<Title>Media</Title>
			<Muted>Files uploaded from web or this phone can be opened or saved here.</Muted>
			<ErrorText message={error} />
			{assets.length === 0 ? <Muted>No media yet.</Muted> : null}
			{assets.map((asset) => (
				<Card key={asset.id}>
					<Heading>{asset.fileName}</Heading>
					<Muted>
						{asset.type} · {formatDate(asset.createdAt)}
					</Muted>
					<Row>
						<Button
							label={busyId === asset.id ? "Working…" : "Open"}
							variant="ghost"
							disabled={busyId === asset.id}
							onPress={() => void onOpen(asset)}
						/>
						<Button
							label="Download"
							variant="ghost"
							disabled={busyId === asset.id}
							onPress={() => void onDownload(asset)}
						/>
					</Row>
				</Card>
			))}
		</Screen>
	);
}
