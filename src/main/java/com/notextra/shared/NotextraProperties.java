package com.notextra.shared;

import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "notextra")
public record NotextraProperties(
	Storage storage,
	Security security,
	Ai ai,
	Cors cors
) {

	public NotextraProperties {
		if (cors == null) {
			cors = Cors.defaults();
		}
	}

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

	public record Cors(
		List<String> allowedOrigins
	) {
		public Cors {
			if (allowedOrigins == null || allowedOrigins.isEmpty()) {
				allowedOrigins = defaults().allowedOrigins();
			}
		}

		static Cors defaults() {
			return new Cors(List.of(
				"http://localhost:3000",
				"http://127.0.0.1:3000",
				"http://localhost:8081"
			));
		}
	}
}
