package com.notextra.shared.security;

import java.security.Principal;
import java.util.UUID;

public record AuthenticatedUser(UUID userId, String email) implements Principal {

	@Override
	public String getName() {
		return userId.toString();
	}
}
