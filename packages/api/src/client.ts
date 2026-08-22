import type { ApiClientOptions, AuthResponse, TokenStore } from "./types";

export class ApiRequestError extends Error {
	readonly status: number;
	readonly body: unknown;

	constructor(status: number, message: string, body?: unknown) {
		super(message);
		this.name = "ApiRequestError";
		this.status = status;
		this.body = body;
	}
}

function joinUrl(baseUrl: string, path: string): string {
	return `${baseUrl.replace(/\/$/, "")}${path}`;
}

async function readBody(response: Response): Promise<unknown> {
	const text = await response.text();
	if (!text) {
		return null;
	}
	try {
		return JSON.parse(text);
	} catch {
		return text;
	}
}

function errorMessage(body: unknown, fallback: string): string {
	if (body && typeof body === "object" && "message" in body && typeof body.message === "string") {
		return body.message;
	}
	return fallback;
}

export function createApiClient(options: ApiClientOptions) {
	const tokenStore: TokenStore = options.tokenStore;
	let refreshInFlight: Promise<boolean> | null = null;

	async function tryRefresh(): Promise<boolean> {
		if (refreshInFlight) {
			return refreshInFlight;
		}
		refreshInFlight = (async () => {
			const refreshToken = await tokenStore.getRefreshToken();
			if (!refreshToken) {
				return false;
			}
			const response = await fetch(joinUrl(options.baseUrl, "/api/auth/refresh"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ refreshToken }),
			});
			if (!response.ok) {
				await tokenStore.clearTokens();
				return false;
			}
			const body = (await response.json()) as AuthResponse;
			await tokenStore.setTokens(body.accessToken, body.refreshToken);
			return true;
		})().finally(() => {
			refreshInFlight = null;
		});
		return refreshInFlight;
	}

	async function request<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
		const headers = new Headers(init.headers);
		if (init.body && !headers.has("Content-Type")) {
			headers.set("Content-Type", "application/json");
		}
		const accessToken = await tokenStore.getAccessToken();
		if (accessToken) {
			headers.set("Authorization", `Bearer ${accessToken}`);
		}

		let response: Response;
		try {
			response = await fetch(joinUrl(options.baseUrl, path), { ...init, headers });
		} catch (err) {
			const reason = err instanceof Error ? err.message : "network error";
			throw new ApiRequestError(0, `Cannot reach the API at ${options.baseUrl} (${reason})`);
		}
		const isAuthPath = path.startsWith("/api/auth/");

		if (response.status === 401 && retry && !isAuthPath) {
			const refreshed = await tryRefresh();
			if (refreshed) {
				return request<T>(path, init, false);
			}
		}

		if (response.status === 204) {
			return undefined as T;
		}

		const body = await readBody(response);
		if (!response.ok) {
			throw new ApiRequestError(response.status, errorMessage(body, response.statusText), body);
		}
		return body as T;
	}

	async function authorizedFetch(path: string, init: RequestInit = {}, retry = true): Promise<Response> {
		const headers = new Headers(init.headers);
		const accessToken = await tokenStore.getAccessToken();
		if (accessToken) {
			headers.set("Authorization", `Bearer ${accessToken}`);
		}
		const response = await fetch(joinUrl(options.baseUrl, path), { ...init, headers });
		const isAuthPath = path.startsWith("/api/auth/");
		if (response.status === 401 && retry && !isAuthPath) {
			const refreshed = await tryRefresh();
			if (refreshed) {
				return authorizedFetch(path, init, false);
			}
		}
		return response;
	}

	async function authHeaders(): Promise<Record<string, string>> {
		const accessToken = await tokenStore.getAccessToken();
		return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
	}

	function query(params: Record<string, string | undefined>): string {
		const search = new URLSearchParams();
		for (const [key, value] of Object.entries(params)) {
			if (value) {
				search.set(key, value);
			}
		}
		const encoded = search.toString();
		return encoded ? `?${encoded}` : "";
	}

	return {
		request,
		authHeaders,
		baseUrl: options.baseUrl.replace(/\/$/, ""),
		auth: {
			register: (body: { email: string; password: string; displayName: string }) =>
				request<AuthResponse>("/api/auth/register", { method: "POST", body: JSON.stringify(body) }).then(
					async (res) => {
						await tokenStore.setTokens(res.accessToken, res.refreshToken);
						return res;
					},
				),
			login: (body: { email: string; password: string }) =>
				request<AuthResponse>("/api/auth/login", { method: "POST", body: JSON.stringify(body) }).then(
					async (res) => {
						await tokenStore.setTokens(res.accessToken, res.refreshToken);
						return res;
					},
				),
			logout: async () => {
				const refreshToken = await tokenStore.getRefreshToken();
				try {
					await request<void>("/api/auth/logout", {
						method: "POST",
						body: JSON.stringify({ refreshToken }),
					});
				} finally {
					await tokenStore.clearTokens();
				}
			},
			me: () => request<import("./types").UserProfile>("/api/auth/me"),
		},
		notes: {
			list: (params?: { q?: string; type?: string; tagId?: string; collectionId?: string }) =>
				request<import("./types").NoteDetail[]>(
					`/api/notes${query({
						q: params?.q,
						type: params?.type,
						tagId: params?.tagId,
						collectionId: params?.collectionId,
					})}`,
				),
			get: (noteId: string) => request<import("./types").NoteDetail>(`/api/notes/${noteId}`),
			create: (body: import("./types").CreateNoteRequest) =>
				request<import("./types").NoteDetail>("/api/notes", { method: "POST", body: JSON.stringify(body) }),
			update: (noteId: string, body: import("./types").UpdateNoteRequest) =>
				request<import("./types").NoteDetail>(`/api/notes/${noteId}`, {
					method: "PUT",
					body: JSON.stringify(body),
				}),
			delete: (noteId: string) => request<void>(`/api/notes/${noteId}`, { method: "DELETE" }),
			attachMedia: (noteId: string, mediaAssetId: string) =>
				request<import("./types").NoteDetail>(`/api/notes/${noteId}/attachments/${mediaAssetId}`, {
					method: "POST",
				}),
			detachMedia: (noteId: string, mediaAssetId: string) =>
				request<import("./types").NoteDetail>(`/api/notes/${noteId}/attachments/${mediaAssetId}`, {
					method: "DELETE",
				}),
			attachTag: (noteId: string, tagId: string) =>
				request<import("./types").NoteDetail>(`/api/notes/${noteId}/tags/${tagId}`, { method: "POST" }),
			detachTag: (noteId: string, tagId: string) =>
				request<import("./types").NoteDetail>(`/api/notes/${noteId}/tags/${tagId}`, { method: "DELETE" }),
		},
		tags: {
			list: () => request<import("./types").NoteTag[]>("/api/tags"),
			create: (body: import("./types").CreateTagRequest) =>
				request<import("./types").NoteTag>("/api/tags", { method: "POST", body: JSON.stringify(body) }),
			delete: (tagId: string) => request<void>(`/api/tags/${tagId}`, { method: "DELETE" }),
		},
		collections: {
			list: () => request<import("./types").CollectionDetail[]>("/api/collections"),
			get: (collectionId: string) =>
				request<import("./types").CollectionDetail>(`/api/collections/${collectionId}`),
			create: (body: import("./types").CreateCollectionRequest) =>
				request<import("./types").CollectionDetail>("/api/collections", {
					method: "POST",
					body: JSON.stringify(body),
				}),
			update: (collectionId: string, body: import("./types").UpdateCollectionRequest) =>
				request<import("./types").CollectionDetail>(`/api/collections/${collectionId}`, {
					method: "PUT",
					body: JSON.stringify(body),
				}),
			delete: (collectionId: string) => request<void>(`/api/collections/${collectionId}`, { method: "DELETE" }),
			addNote: (collectionId: string, noteId: string) =>
				request<import("./types").CollectionDetail>(`/api/collections/${collectionId}/notes/${noteId}`, {
					method: "POST",
				}),
			removeNote: (collectionId: string, noteId: string) =>
				request<import("./types").CollectionDetail>(`/api/collections/${collectionId}/notes/${noteId}`, {
					method: "DELETE",
				}),
		},
		media: {
			list: (params?: { type?: string }) =>
				request<import("./types").MediaAssetDetail[]>(`/api/media${query({ type: params?.type })}`),
			get: (assetId: string) => request<import("./types").MediaAssetDetail>(`/api/media/${assetId}`),
			initiateUpload: (body: import("./types").InitiateUploadRequest) =>
				request<import("./types").UploadSessionResponse>("/api/media/uploads", {
					method: "POST",
					body: JSON.stringify(body),
				}),
			confirmUpload: (assetId: string, body: import("./types").ConfirmUploadRequest) =>
				request<import("./types").MediaAssetDetail>(`/api/media/${assetId}/confirm`, {
					method: "POST",
					body: JSON.stringify(body),
				}),
			delete: (assetId: string) => request<void>(`/api/media/${assetId}`, { method: "DELETE" }),
			contentUrl: (assetId: string, inline = false) =>
				joinUrl(options.baseUrl, `/api/media/${assetId}/content${inline ? "?inline=true" : ""}`),
			download: async (assetId: string, inline = false) => {
				const response = await authorizedFetch(
					`/api/media/${assetId}/content${inline ? "?inline=true" : ""}`,
				);
				if (!response.ok) {
					const body = await readBody(response);
					throw new ApiRequestError(response.status, errorMessage(body, response.statusText), body);
				}
				return response.blob();
			},
			uploadContent: async (assetId: string, body: Blob, contentType: string) => {
				const response = await authorizedFetch(`/api/media/${assetId}/content`, {
					method: "PUT",
					headers: {
						"Content-Type": contentType || "application/octet-stream",
					},
					body,
				});
				if (!response.ok && response.status !== 204) {
					const parsed = await readBody(response);
					throw new ApiRequestError(response.status, errorMessage(parsed, response.statusText), parsed);
				}
			},
		},
		generation: {
			list: () => request<import("./types").GenerationJobDetail[]>("/api/generation/jobs"),
			get: (jobId: string) => request<import("./types").GenerationJobDetail>(`/api/generation/jobs/${jobId}`),
			create: (body: import("./types").GenerationRequest) =>
				request<import("./types").GenerationJobDetail>("/api/generation/jobs", {
					method: "POST",
					body: JSON.stringify(body),
				}),
		},
	};
}

export type ApiClient = ReturnType<typeof createApiClient>;
