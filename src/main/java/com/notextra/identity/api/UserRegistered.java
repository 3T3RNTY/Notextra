package com.notextra.identity.api;

import java.util.UUID;

public record UserRegistered(UUID userId, String email) {
}
