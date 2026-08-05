package com.notextra.shared.security;

import java.util.UUID;

public record AuthenticatedUser(UUID userId, String email) {
}
