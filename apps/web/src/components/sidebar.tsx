"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./auth-provider";
import { Button } from "./ui";

const links = [
	{ href: "/", label: "Notes" },
	{ href: "/collections", label: "Collections" },
	{ href: "/media", label: "Media" },
	{ href: "/generate", label: "Generate" },
	{ href: "/options", label: "Options" },
];

export function Sidebar() {
	const pathname = usePathname() ?? "";
	const { user, logout } = useAuth();

	return (
		<aside className="flex w-56 shrink-0 flex-col border-r border-border bg-surface p-4">
			<div className="mb-6 text-lg font-semibold tracking-tight">Notextra</div>
			<nav className="flex flex-1 flex-col gap-1">
				{links.map((link) => {
					const active = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
					return (
						<Link
							key={link.href}
							href={link.href}
							className={`rounded-md px-3 py-2 text-sm ${active ? "bg-primary text-primary-foreground" : "text-muted hover:bg-surface-muted hover:text-foreground"}`}
						>
							{link.label}
						</Link>
					);
				})}
			</nav>
			<div className="mt-4 space-y-2 border-t border-border pt-4">
				<p className="truncate text-xs text-muted">{user?.displayName}</p>
				<p className="truncate text-xs text-muted">{user?.email}</p>
				<Button variant="ghost" className="w-full" onClick={() => logout()}>
					Log out
				</Button>
			</div>
		</aside>
	);
}
