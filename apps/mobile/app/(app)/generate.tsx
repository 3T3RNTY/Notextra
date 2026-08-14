import { ApiRequestError, type GenerationJobDetail, type GenerationOutputType, type NoteDetail } from "@notextra/api";
import { useCallback, useState } from "react";
import { Pressable, Text } from "react-native";
import { useFocusEffect } from "expo-router";
import { api, formatDate } from "@/lib/api";
import { useTheme } from "@/lib/theme";
import { Button, Card, ErrorText, Field, Heading, Input, Muted, Row, Screen, Title } from "@/lib/ui";

const OUTPUT_TYPES: GenerationOutputType[] = ["NOTE", "PRESENTATION", "TRANSCRIPT", "MARKDOWN", "PDF"];

export default function GenerateScreen() {
	const { colors } = useTheme();
	const [jobs, setJobs] = useState<GenerationJobDetail[]>([]);
	const [notes, setNotes] = useState<NoteDetail[]>([]);
	const [outputType, setOutputType] = useState<GenerationOutputType>("NOTE");
	const [prompt, setPrompt] = useState("");
	const [sourceNoteId, setSourceNoteId] = useState("");
	const [error, setError] = useState<string | null>(null);

	const load = useCallback(async () => {
		setError(null);
		try {
			const [jobList, noteList] = await Promise.all([api.generation.list(), api.notes.list()]);
			setJobs(jobList);
			setNotes(noteList);
			setSourceNoteId((current) => current || noteList[0]?.id || "");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load jobs");
		}
	}, []);

	useFocusEffect(
		useCallback(() => {
			void load();
		}, [load]),
	);

	async function onSubmit() {
		try {
			await api.generation.create({
				outputType,
				prompt,
				sourceNoteIds: sourceNoteId ? [sourceNoteId] : [],
			});
			setPrompt("");
			await load();
		} catch (err) {
			setError(err instanceof ApiRequestError ? err.message : "Could not start job");
		}
	}

	return (
		<Screen>
			<Title>Generate</Title>
			<Field label="Output type">
				<Row>
					{OUTPUT_TYPES.map((type) => (
						<Pressable
							key={type}
							onPress={() => setOutputType(type)}
							style={{
								paddingHorizontal: 10,
								paddingVertical: 8,
								borderRadius: 8,
								backgroundColor: outputType === type ? colors.primary : colors.surfaceMuted,
							}}
						>
							<Text style={{ color: outputType === type ? colors.primaryForeground : colors.text, fontSize: 12 }}>
								{type}
							</Text>
						</Pressable>
					))}
				</Row>
			</Field>
			<Field label="Source note">
				<Row>
					{notes.slice(0, 6).map((note) => (
						<Pressable
							key={note.id}
							onPress={() => setSourceNoteId(note.id)}
							style={{
								paddingHorizontal: 10,
								paddingVertical: 8,
								borderRadius: 8,
								backgroundColor: sourceNoteId === note.id ? colors.primary : colors.surfaceMuted,
							}}
						>
							<Text style={{ color: sourceNoteId === note.id ? colors.primaryForeground : colors.text, fontSize: 12 }}>
								{note.title}
							</Text>
						</Pressable>
					))}
				</Row>
			</Field>
			<Field label="Prompt">
				<Input value={prompt} onChangeText={setPrompt} multiline style={{ minHeight: 80, textAlignVertical: "top" }} />
			</Field>
			<Button label="Start job" onPress={() => void onSubmit()} />
			<ErrorText message={error} />
			{jobs.length === 0 ? <Muted>No generation jobs yet.</Muted> : null}
			{jobs.map((job) => (
				<Card key={job.id}>
					<Heading>{job.outputType}</Heading>
					<Muted>{job.status}</Muted>
					<Muted>{job.prompt || "No prompt"}</Muted>
					<Muted>{formatDate(job.createdAt)}</Muted>
					{job.errorMessage ? <ErrorText message={job.errorMessage} /> : null}
				</Card>
			))}
		</Screen>
	);
}
