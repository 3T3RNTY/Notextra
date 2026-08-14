"use client";

import type {
	ButtonHTMLAttributes,
	InputHTMLAttributes,
	ReactNode,
	SelectHTMLAttributes,
	TextareaHTMLAttributes,
} from "react";

export function Button({
	children,
	variant = "primary",
	className = "",
	...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "danger" }) {
	const styles = {
		primary: "bg-primary text-primary-foreground hover:opacity-90",
		ghost: "bg-surface-muted text-foreground hover:opacity-90",
		danger: "bg-danger text-white hover:opacity-90",
	}[variant];
	return (
		<button
			className={`inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium disabled:opacity-50 ${styles} ${className}`}
			{...props}
		>
			{children}
		</button>
	);
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
	return <div className={`rounded-lg border border-border bg-surface p-4 ${className}`}>{children}</div>;
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
	return (
		<input
			{...props}
			className={`w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-accent ${props.className ?? ""}`}
		/>
	);
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
	return (
		<textarea
			{...props}
			className={`w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-accent ${props.className ?? ""}`}
		/>
	);
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
	return (
		<select
			{...props}
			className={`w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-accent ${props.className ?? ""}`}
		/>
	);
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
	return (
		<label className="block space-y-1">
			<span className="text-sm text-muted">{label}</span>
			{children}
		</label>
	);
}

export function PageHeader({ title, actions }: { title: string; actions?: ReactNode }) {
	return (
		<div className="mb-6 flex flex-wrap items-center justify-between gap-3">
			<h1 className="text-2xl font-semibold">{title}</h1>
			{actions}
		</div>
	);
}

export function StatusMessage({ error, empty }: { error?: string | null; empty?: string | null }) {
	if (error) {
		return <p className="text-sm text-danger">{error}</p>;
	}
	if (empty) {
		return <p className="text-sm text-muted">{empty}</p>;
	}
	return null;
}
