package com.notextra;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

@SpringBootTest
@Import(TestStorageConfig.class)
class ApiIntegrationTest {

	@Autowired
	WebApplicationContext context;

	@Autowired
	ObjectMapper objectMapper;

	MockMvc mockMvc;

	@BeforeEach
	void setUp() {
		mockMvc = MockMvcBuilders.webAppContextSetup(context)
			.apply(springSecurity())
			.build();
	}

	@Test
	void registerLoginAndCreateNote() throws Exception {
		var registerBody = objectMapper.createObjectNode()
			.put("email", "user@example.com")
			.put("password", "password123")
			.put("displayName", "Test User");

		var registerResponse = mockMvc.perform(post("/api/auth/register")
				.contentType(MediaType.APPLICATION_JSON)
				.content(registerBody.toString()))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.accessToken").isNotEmpty())
			.andReturn();

		String token = objectMapper.readTree(registerResponse.getResponse().getContentAsString())
			.get("accessToken").asText();

		var noteBody = objectMapper.createObjectNode()
			.put("title", "My first note")
			.put("content", "Hello Notextra");

		mockMvc.perform(post("/api/notes")
				.header("Authorization", "Bearer " + token)
				.contentType(MediaType.APPLICATION_JSON)
				.content(noteBody.toString()))
			.andExpect(status().isCreated())
			.andExpect(jsonPath("$.title").value("My first note"));

		mockMvc.perform(get("/api/notes")
				.header("Authorization", "Bearer " + token))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$[0].title").value("My first note"));
	}
}
