package com.notextra.shared;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "notextra")
public record NotextraProperties(
	Storage storage,
	Security security,
	Ai ai
) {

	public record Storage(
		String endpoint,
		String accessKey,
		String secretKey,
		String bucket
	) {
	}

	public record Security(
		String jwtSecret,
		long jwtExpirationMs,
		long refreshExpirationMs
	) {
	}

	public record Ai(
		String openaiApiKey
	) {
	}
}
