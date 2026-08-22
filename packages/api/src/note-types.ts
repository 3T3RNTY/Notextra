import type { MediaType, NoteType } from "./types";

export const NOTE_TYPE_OPTIONS: { value: NoteType; label: string }[] = [
	{ value: "TEXT", label: "Text" },
	{ value: "IMAGE", label: "Photo" },
	{ value: "AUDIO", label: "Audio" },
	{ value: "VIDEO", label: "Video" },
	{ value: "DOCUMENT", label: "PDF / document" },
];

export const MEDIA_TYPE_OPTIONS: { value: MediaType; label: string }[] = [
	{ value: "IMAGE", label: "Photo" },
	{ value: "AUDIO", label: "Audio" },
	{ value: "VIDEO", label: "Video" },
	{ value: "DOCUMENT", label: "PDF / document" },
	{ value: "OTHER", label: "Other" },
];

export function labelForNoteType(type: NoteType | null | undefined): string {
	return NOTE_TYPE_OPTIONS.find((option) => option.value === type)?.label ?? "Text";
}

export function labelForMediaType(type: MediaType | null | undefined): string {
	return MEDIA_TYPE_OPTIONS.find((option) => option.value === type)?.label ?? type ?? "File";
}

export function acceptForNoteType(type: NoteType): string | undefined {
	switch (type) {
		case "IMAGE":
			return "image/*";
		case "AUDIO":
			return "audio/*";
		case "VIDEO":
			return "video/*";
		case "DOCUMENT":
			return "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,.pdf,.doc,.docx,.txt";
		default:
			return undefined;
	}
}

export function pickerTypesForNoteType(type: NoteType): string | string[] {
	switch (type) {
		case "IMAGE":
			return "image/*";
		case "AUDIO":
			return "audio/*";
		case "VIDEO":
			return "video/*";
		case "DOCUMENT":
			return [
				"application/pdf",
				"application/msword",
				"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
				"text/plain",
			];
		default:
			return "*/*";
	}
}

export function mediaTypeForNoteType(type: NoteType): MediaType | null {
	if (type === "TEXT") {
		return null;
	}
	return type;
}

export function inferMediaType(contentType: string, fileName = ""): MediaType {
	const lowerName = fileName.toLowerCase();
	if (contentType.startsWith("image/") || /\.(png|jpe?g|gif|webp|heic|bmp)$/i.test(lowerName)) {
		return "IMAGE";
	}
	if (contentType.startsWith("audio/") || /\.(mp3|wav|m4a|aac|ogg|flac)$/i.test(lowerName)) {
		return "AUDIO";
	}
	if (contentType.startsWith("video/") || /\.(mp4|mov|webm|mkv|avi)$/i.test(lowerName)) {
		return "VIDEO";
	}
	if (
		contentType.startsWith("text/") ||
		contentType.includes("pdf") ||
		contentType.includes("document") ||
		/\.(pdf|docx?|txt|rtf)$/i.test(lowerName)
	) {
		return "DOCUMENT";
	}
	return "OTHER";
}
