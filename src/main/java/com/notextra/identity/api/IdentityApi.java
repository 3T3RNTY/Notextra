package com.notextra.identity.api;

import java.util.Optional;
import java.util.UUID;

public interface IdentityApi {

	Optional<UserProfile> findById(UUID userId);

	boolean existsById(UUID userId);
}
