import { ApiRequestError } from "@notextra/api";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Text } from "react-native";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { Button, ErrorText, Field, Input, Screen, Title } from "@/lib/ui";

export default function LoginScreen() {
	const { login } = useAuth();
	const { colors } = useTheme();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [pending, setPending] = useState(false);

	async function onSubmit() {
		setError(null);
		setPending(true);
		try {
			await login(email, password);
			router.replace("/(app)/notes");
		} catch (err) {
			setError(err instanceof ApiRequestError ? err.message : "Unable to sign in");
		} finally {
			setPending(false);
		}
	}

	return (
		<Screen>
			<Title>Sign in</Title>
			<Field label="Email">
				<Input autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
			</Field>
			<Field label="Password">
				<Input secureTextEntry value={password} onChangeText={setPassword} />
			</Field>
			<ErrorText message={error} />
			<Button label={pending ? "Signing in…" : "Sign in"} onPress={() => void onSubmit()} disabled={pending} />
			<Link href="/(auth)/register">
				<Text style={{ color: colors.accent }}>Create an account</Text>
			</Link>
		</Screen>
	);
}
