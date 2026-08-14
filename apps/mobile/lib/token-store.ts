import * as SecureStore from "expo-secure-store";
import type { TokenStore } from "@notextra/api";

const ACCESS_KEY = "notextra.accessToken";
const REFRESH_KEY = "notextra.refreshToken";

export const mobileTokenStore: TokenStore = {
	getAccessToken() {
		return SecureStore.getItemAsync(ACCESS_KEY);
	},
	getRefreshToken() {
		return SecureStore.getItemAsync(REFRESH_KEY);
	},
	async setTokens(accessToken, refreshToken) {
		await SecureStore.setItemAsync(ACCESS_KEY, accessToken);
		await SecureStore.setItemAsync(REFRESH_KEY, refreshToken);
	},
	async clearTokens() {
		await SecureStore.deleteItemAsync(ACCESS_KEY);
		await SecureStore.deleteItemAsync(REFRESH_KEY);
	},
};
