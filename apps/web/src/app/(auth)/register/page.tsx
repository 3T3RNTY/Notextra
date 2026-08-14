"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Button, Card, Field, Input } from "@/components/ui";
import { ApiRequestError } from "@notextra/api";

export default function RegisterPage() {
	const { user, ready, register } = useAuth();
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [displayName, setDisplayName] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [pending, setPending] = useState(false);

	useEffect(() => {
		if (ready && user) {
			router.replace("/");
		}
	}, [ready, user, router]);

	async function onSubmit(event: FormEvent) {
		event.preventDefault();
		setError(null);
		setPending(true);
		try {
			await register(email, password, displayName);
			router.replace("/");
		} catch (err) {
			setError(err instanceof ApiRequestError ? err.message : "Unable to register");
		} finally {
			setPending(false);
		}
	}

	return (
		<div className="flex min-h-screen items-center justify-center p-6">
			<Card className="w-full max-w-md space-y-4">
				<div>
					<h1 className="text-2xl font-semibold">Create account</h1>
					<p className="text-sm text-muted">Email, display name, and a password of at least 8 characters.</p>
				</div>
				<form className="space-y-3" onSubmit={onSubmit}>
					<Field label="Display name">
						<Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
					</Field>
					<Field label="Email">
						<Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
					</Field>
					<Field label="Password">
						<Input
							type="password"
							minLength={8}
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
						/>
					</Field>
					{error ? <p className="text-sm text-danger">{error}</p> : null}
					<Button type="submit" className="w-full" disabled={pending}>
						{pending ? "Creating…" : "Register"}
					</Button>
				</form>
				<p className="text-sm text-muted">
					Already have an account?{" "}
					<Link href="/login" className="text-accent underline">
						Sign in
					</Link>
				</p>
			</Card>
		</div>
	);
}
