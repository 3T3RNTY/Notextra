package com.notextra.identity.internal;

import com.notextra.identity.internal.IdentityService.AuthResponse;
import com.notextra.identity.internal.IdentityService.LoginRequest;
import com.notextra.identity.internal.IdentityService.LogoutRequest;
import com.notextra.identity.internal.IdentityService.RefreshRequest;
import com.notextra.identity.internal.IdentityService.RegisterRequest;
import com.notextra.shared.security.CurrentUser;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
class AuthController {

	private final IdentityService identityService;

	AuthController(IdentityService identityService) {
		this.identityService = identityService;
	}

	@PostMapping("/register")
	AuthResponse register(@Valid @RequestBody RegisterRequest request) {
		return identityService.register(request);
	}

	@PostMapping("/login")
	AuthResponse login(@Valid @RequestBody LoginRequest request) {
		return identityService.login(request);
	}

	@PostMapping("/refresh")
	AuthResponse refresh(@Valid @RequestBody RefreshRequest request) {
		return identityService.refresh(request);
	}

	@PostMapping("/logout")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	void logout(@RequestBody(required = false) LogoutRequest request) {
		identityService.logout(request == null ? new LogoutRequest(null) : request);
	}

	@GetMapping("/me")
	com.notextra.identity.api.UserProfile me() {
		return identityService.me(CurrentUser.id());
	}
}
