"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { Providers } from "@/components/providers";
import { Sidebar } from "@/components/sidebar";

function AppShell({ children }: { children: React.ReactNode }) {
	const { user, ready } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (ready && !user) {
			router.replace("/login");
		}
	}, [ready, user, router]);

	if (!ready) {
		return <div className="p-8 text-muted">Loading…</div>;
	}
	if (!user) {
		return null;
	}

	return (
		<div className="flex min-h-screen">
			<Sidebar />
			<main className="min-w-0 flex-1 p-6 md:p-8">{children}</main>
		</div>
	);
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
	return (
		<Providers>
			<AppShell>{children}</AppShell>
		</Providers>
	);
}
