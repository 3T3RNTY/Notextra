package com.notextra.identity.internal;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

interface RefreshTokenRepository extends JpaRepository<RefreshTokenEntity, UUID> {

	Optional<RefreshTokenEntity> findByTokenHash(String tokenHash);
}
