import type { TokenStore } from "@notextra/api";

const ACCESS_KEY = "notextra.accessToken";
const REFRESH_KEY = "notextra.refreshToken";

export const webTokenStore: TokenStore = {
	getAccessToken() {
		if (typeof window === "undefined") {
			return null;
		}
		return localStorage.getItem(ACCESS_KEY);
	},
	getRefreshToken() {
		if (typeof window === "undefined") {
			return null;
		}
		return localStorage.getItem(REFRESH_KEY);
	},
	setTokens(accessToken, refreshToken) {
		localStorage.setItem(ACCESS_KEY, accessToken);
		localStorage.setItem(REFRESH_KEY, refreshToken);
	},
	clearTokens() {
		localStorage.removeItem(ACCESS_KEY);
		localStorage.removeItem(REFRESH_KEY);
	},
};
