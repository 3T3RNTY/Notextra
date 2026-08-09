package com.notextra.config;

import com.notextra.shared.security.AuthenticatedUser;
import com.notextra.shared.security.JwtService;
import java.util.List;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
@Order(Ordered.HIGHEST_PRECEDENCE + 99)
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

	private final JwtService jwtService;

	public WebSocketConfig(JwtService jwtService) {
		this.jwtService = jwtService;
	}

	@Override
	public void registerStompEndpoints(StompEndpointRegistry registry) {
		registry.addEndpoint("/ws")
			.setAllowedOriginPatterns("*")
			.withSockJS();
	}

	@Override
	public void configureMessageBroker(MessageBrokerRegistry registry) {
		registry.enableSimpleBroker("/queue", "/topic");
		registry.setApplicationDestinationPrefixes("/app");
		registry.setUserDestinationPrefix("/user");
	}

	@Override
	public void configureClientInboundChannel(ChannelRegistration registration) {
		registration.interceptors(new ChannelInterceptor() {
			@Override
			public Message<?> preSend(Message<?> message, MessageChannel channel) {
				StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
				if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
					String token = resolveToken(accessor);
					if (token == null) {
						throw new IllegalArgumentException("Missing JWT for WebSocket CONNECT");
					}
					JwtService.JwtClaims claims = jwtService.parseToken(token);
					accessor.setUser(new AuthenticatedUser(claims.userId(), claims.email()));
				}
				return message;
			}
		});
	}

	private static String resolveToken(StompHeaderAccessor accessor) {
		String auth = accessor.getFirstNativeHeader("Authorization");
		if (auth != null && auth.startsWith("Bearer ")) {
			return auth.substring(7);
		}
		List<String> accessToken = accessor.getNativeHeader("access_token");
		if (accessToken != null && !accessToken.isEmpty()) {
			return accessToken.getFirst();
		}
		return null;
	}
}
