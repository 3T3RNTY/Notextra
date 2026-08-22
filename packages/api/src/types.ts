export type NoteStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";
export type NoteType = "TEXT" | "IMAGE" | "AUDIO" | "VIDEO" | "DOCUMENT";
export type MediaType = "IMAGE" | "AUDIO" | "VIDEO" | "DOCUMENT" | "OTHER";
export type GenerationOutputType = "NOTE" | "PRESENTATION" | "TRANSCRIPT" | "MARKDOWN" | "PDF";
export type GenerationJobStatus = "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED";

export interface UserProfile {
	id: string;
	email: string;
	displayName: string;
	createdAt: string;
}

export interface AuthResponse {
	accessToken: string;
	refreshToken: string;
	user: UserProfile;
}

export interface NoteTag {
	id: string;
	name: string;
}

export interface NoteDetail {
	id: string;
	ownerId: string;
	title: string;
	content: string | null;
	type: NoteType;
	status: NoteStatus;
	attachmentIds: string[];
	tags: NoteTag[];
	createdAt: string;
	updatedAt: string;
}

export interface CollectionDetail {
	id: string;
	name: string;
	noteIds: string[];
	createdAt: string;
}

export interface MediaAssetDetail {
	id: string;
	ownerId: string;
	type: MediaType;
	contentType: string;
	fileName: string;
	sizeBytes: number | null;
	createdAt: string;
	downloadUrl: string;
}

export interface UploadSessionResponse {
	assetId: string;
	uploadUrl: string;
	storageKey: string;
}

export interface GenerationJobDetail {
	id: string;
	ownerId: string;
	outputType: GenerationOutputType;
	status: GenerationJobStatus;
	prompt: string | null;
	sourceNoteIds: string[];
	sourceMediaIds: string[];
	resultNoteId: string | null;
	resultMediaId: string | null;
	errorMessage: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface RegisterRequest {
	email: string;
	password: string;
	displayName: string;
}

export interface LoginRequest {
	email: string;
	password: string;
}

export interface CreateNoteRequest {
	title: string;
	content?: string;
	type?: NoteType;
	tagIds?: string[];
}

export interface UpdateNoteRequest {
	title: string;
	content?: string;
	status?: NoteStatus;
	tagIds?: string[];
}

export interface CreateTagRequest {
	name: string;
}

export interface CreateCollectionRequest {
	name: string;
}

export interface UpdateCollectionRequest {
	name: string;
}

export interface InitiateUploadRequest {
	fileName: string;
	contentType: string;
	type: MediaType;
}

export interface ConfirmUploadRequest {
	sizeBytes: number;
}

export interface GenerationRequest {
	sourceNoteIds?: string[];
	sourceMediaIds?: string[];
	outputType: GenerationOutputType;
	prompt?: string;
}

export interface TokenStore {
	getAccessToken(): Promise<string | null> | string | null;
	getRefreshToken(): Promise<string | null> | string | null;
	setTokens(accessToken: string, refreshToken: string): Promise<void> | void;
	clearTokens(): Promise<void> | void;
}

export interface ApiClientOptions {
	baseUrl: string;
	tokenStore: TokenStore;
}
