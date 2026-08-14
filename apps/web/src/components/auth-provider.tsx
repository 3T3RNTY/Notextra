"use client";

import type { UserProfile } from "@notextra/api";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api } from "@/lib/api";

interface AuthContextValue {
	user: UserProfile | null;
	ready: boolean;
	login: (email: string, password: string) => Promise<void>;
	register: (email: string, password: string, displayName: string) => Promise<void>;
	logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<UserProfile | null>(null);
	const [ready, setReady] = useState(false);

	useEffect(() => {
		api.auth
			.me()
			.then(setUser)
			.catch(() => setUser(null))
			.finally(() => setReady(true));
	}, []);

	const login = useCallback(async (email: string, password: string) => {
		const response = await api.auth.login({ email, password });
		setUser(response.user);
	}, []);

	const register = useCallback(async (email: string, password: string, displayName: string) => {
		const response = await api.auth.register({ email, password, displayName });
		setUser(response.user);
	}, []);

	const logout = useCallback(async () => {
		await api.auth.logout();
		setUser(null);
	}, []);

	const value = useMemo(
		() => ({ user, ready, login, register, logout }),
		[user, ready, login, register, logout],
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within AuthProvider");
	}
	return context;
}
