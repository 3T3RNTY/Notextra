import { Link, router } from "expo-router";
import { useState } from "react";
import { Text } from "react-native";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { Button, ErrorText, Field, Input, Screen, Title } from "@/lib/ui";

export default function RegisterScreen() {
	const { register } = useAuth();
	const { colors } = useTheme();
	const [email, setEmail] = useState("");
	const [displayName, setDisplayName] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [pending, setPending] = useState(false);

	async function onSubmit() {
		setError(null);
		setPending(true);
		try {
			await register(email, password, displayName);
			router.replace("/(app)/notes");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Unable to register");
		} finally {
			setPending(false);
		}
	}

	return (
		<Screen>
			<Title>Create account</Title>
			<Field label="Display name">
				<Input value={displayName} onChangeText={setDisplayName} />
			</Field>
			<Field label="Email">
				<Input autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
			</Field>
			<Field label="Password">
				<Input secureTextEntry value={password} onChangeText={setPassword} />
			</Field>
			<ErrorText message={error} />
			<Button label={pending ? "Creating…" : "Register"} onPress={() => void onSubmit()} disabled={pending} />
			<Link href="/(auth)/login">
				<Text style={{ color: colors.accent }}>Already have an account</Text>
			</Link>
		</Screen>
	);
}
