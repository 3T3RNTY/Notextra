import { ApiRequestError, type CollectionDetail } from "@notextra/api";
import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { api, formatDate } from "@/lib/api";
import { Button, Card, ErrorText, Field, Heading, Input, Muted, Screen, Title } from "@/lib/ui";

export default function CollectionsScreen() {
	const [collections, setCollections] = useState<CollectionDetail[]>([]);
	const [name, setName] = useState("");
	const [error, setError] = useState<string | null>(null);

	const load = useCallback(async () => {
		setError(null);
		try {
			setCollections(await api.collections.list());
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load collections");
		}
	}, []);

	useFocusEffect(
		useCallback(() => {
			void load();
		}, [load]),
	);

	async function onCreate() {
		try {
			await api.collections.create({ name });
			setName("");
			await load();
		} catch (err) {
			setError(err instanceof ApiRequestError ? err.message : "Could not create collection");
		}
	}

	async function onDelete(id: string) {
		await api.collections.delete(id);
		await load();
	}

	return (
		<Screen>
			<Title>Collections</Title>
			<Field label="Name">
				<Input value={name} onChangeText={setName} />
			</Field>
			<Button label="Create" onPress={() => void onCreate()} />
			<ErrorText message={error} />
			{collections.length === 0 ? <Muted>No collections yet.</Muted> : null}
			{collections.map((collection) => (
				<Card key={collection.id}>
					<Heading>{collection.name}</Heading>
					<Muted>
						{collection.noteIds.length} notes · {formatDate(collection.createdAt)}
					</Muted>
					<Button label="Delete" variant="ghost" onPress={() => void onDelete(collection.id)} />
				</Card>
			))}
		</Screen>
	);
}
