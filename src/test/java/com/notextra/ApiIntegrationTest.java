package com.notextra;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
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
			.andExpect(jsonPath("$.refreshToken").isNotEmpty())
			.andReturn();

		JsonNode auth = objectMapper.readTree(registerResponse.getResponse().getContentAsString());
		String token = auth.get("accessToken").asText();

		var noteBody = objectMapper.createObjectNode()
			.put("title", "My first note")
			.put("content", "Hello Notextra");

		mockMvc.perform(post("/api/notes")
				.header("Authorization", "Bearer " + token)
				.contentType(MediaType.APPLICATION_JSON)
				.content(noteBody.toString()))
			.andExpect(status().isCreated())
			.andExpect(jsonPath("$.title").value("My first note"))
			.andExpect(jsonPath("$.type").value("TEXT"))
			.andExpect(jsonPath("$.createdAt").isNotEmpty());

		mockMvc.perform(get("/api/notes")
				.header("Authorization", "Bearer " + token))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$[0].title").value("My first note"));
	}

	@Test
	void refreshTokenRotatesAccessToken() throws Exception {
		var registerBody = objectMapper.createObjectNode()
			.put("email", "refresh@example.com")
			.put("password", "password123")
			.put("displayName", "Refresh User");

		var registerResponse = mockMvc.perform(post("/api/auth/register")
				.contentType(MediaType.APPLICATION_JSON)
				.content(registerBody.toString()))
			.andExpect(status().isOk())
			.andReturn();

		String refreshToken = objectMapper.readTree(registerResponse.getResponse().getContentAsString())
			.get("refreshToken").asText();

		var refreshBody = objectMapper.createObjectNode().put("refreshToken", refreshToken);

		var refreshResponse = mockMvc.perform(post("/api/auth/refresh")
				.contentType(MediaType.APPLICATION_JSON)
				.content(refreshBody.toString()))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.accessToken").isNotEmpty())
			.andExpect(jsonPath("$.refreshToken").isNotEmpty())
			.andReturn();

		String newAccessToken = objectMapper.readTree(refreshResponse.getResponse().getContentAsString())
			.get("accessToken").asText();

		mockMvc.perform(get("/api/auth/me")
				.header("Authorization", "Bearer " + newAccessToken))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.email").value("refresh@example.com"));

		mockMvc.perform(post("/api/auth/refresh")
				.contentType(MediaType.APPLICATION_JSON)
				.content(refreshBody.toString()))
			.andExpect(status().isBadRequest());
	}

	@Test
	void tagsCollectionsSearchAndGenerationJob() throws Exception {
		var registerBody = objectMapper.createObjectNode()
			.put("email", "notes@example.com")
			.put("password", "password123")
			.put("displayName", "Notes User");

		var registerResponse = mockMvc.perform(post("/api/auth/register")
				.contentType(MediaType.APPLICATION_JSON)
				.content(registerBody.toString()))
			.andExpect(status().isOk())
			.andReturn();

		String token = objectMapper.readTree(registerResponse.getResponse().getContentAsString())
			.get("accessToken").asText();

		var tagResponse = mockMvc.perform(post("/api/tags")
				.header("Authorization", "Bearer " + token)
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.createObjectNode().put("name", "ideas").toString()))
			.andExpect(status().isCreated())
			.andExpect(jsonPath("$.name").value("ideas"))
			.andReturn();

		String tagId = objectMapper.readTree(tagResponse.getResponse().getContentAsString())
			.get("id").asText();

		var collectionResponse = mockMvc.perform(post("/api/collections")
				.header("Authorization", "Bearer " + token)
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.createObjectNode().put("name", "Inbox").toString()))
			.andExpect(status().isCreated())
			.andReturn();

		String collectionId = objectMapper.readTree(collectionResponse.getResponse().getContentAsString())
			.get("id").asText();

		var noteBody = objectMapper.createObjectNode()
			.put("title", "Searchable note")
			.put("content", "Unique keyword alphabravo");
		noteBody.putArray("tagIds").add(tagId);

		var noteResponse = mockMvc.perform(post("/api/notes")
				.header("Authorization", "Bearer " + token)
				.contentType(MediaType.APPLICATION_JSON)
				.content(noteBody.toString()))
			.andExpect(status().isCreated())
			.andExpect(jsonPath("$.tags[0].name").value("ideas"))
			.andReturn();

		String noteId = objectMapper.readTree(noteResponse.getResponse().getContentAsString())
			.get("id").asText();

		mockMvc.perform(post("/api/collections/" + collectionId + "/notes/" + noteId)
				.header("Authorization", "Bearer " + token))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.noteIds[0]").value(noteId));

		mockMvc.perform(get("/api/notes")
				.header("Authorization", "Bearer " + token)
				.param("q", "alphabravo")
				.param("tagId", tagId)
				.param("collectionId", collectionId))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$[0].id").value(noteId));

		var jobBody = objectMapper.createObjectNode()
			.put("outputType", "NOTE")
			.put("prompt", "Summarize");
		jobBody.putArray("sourceNoteIds").add(noteId);
		jobBody.putArray("sourceMediaIds");

		mockMvc.perform(post("/api/generation/jobs")
				.header("Authorization", "Bearer " + token)
				.contentType(MediaType.APPLICATION_JSON)
				.content(jobBody.toString()))
			.andExpect(status().isCreated())
			.andExpect(jsonPath("$.status").value("COMPLETED"));

		mockMvc.perform(get("/api/generation/jobs")
				.header("Authorization", "Bearer " + token))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$[0].status").value("COMPLETED"));

		mockMvc.perform(delete("/api/tags/" + tagId)
				.header("Authorization", "Bearer " + token))
			.andExpect(status().isNoContent());
	}

	@Test
	void noteTypeFilterAttachAndMediaDelete() throws Exception {
		var registerBody = objectMapper.createObjectNode()
			.put("email", "media-notes@example.com")
			.put("password", "password123")
			.put("displayName", "Media User");

		var registerResponse = mockMvc.perform(post("/api/auth/register")
				.contentType(MediaType.APPLICATION_JSON)
				.content(registerBody.toString()))
			.andExpect(status().isOk())
			.andReturn();

		String token = objectMapper.readTree(registerResponse.getResponse().getContentAsString())
			.get("accessToken").asText();

		var textNote = objectMapper.createObjectNode()
			.put("title", "Text note")
			.put("content", "Just words")
			.put("type", "TEXT");

		mockMvc.perform(post("/api/notes")
				.header("Authorization", "Bearer " + token)
				.contentType(MediaType.APPLICATION_JSON)
				.content(textNote.toString()))
			.andExpect(status().isCreated())
			.andExpect(jsonPath("$.type").value("TEXT"));

		var photoNote = objectMapper.createObjectNode()
			.put("title", "Holiday photos")
			.put("content", "Beach")
			.put("type", "IMAGE");

		var photoResponse = mockMvc.perform(post("/api/notes")
				.header("Authorization", "Bearer " + token)
				.contentType(MediaType.APPLICATION_JSON)
				.content(photoNote.toString()))
			.andExpect(status().isCreated())
			.andExpect(jsonPath("$.type").value("IMAGE"))
			.andReturn();

		String noteId = objectMapper.readTree(photoResponse.getResponse().getContentAsString())
			.get("id").asText();

		mockMvc.perform(get("/api/notes")
				.header("Authorization", "Bearer " + token)
				.param("type", "IMAGE"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.length()").value(1))
			.andExpect(jsonPath("$[0].id").value(noteId));

		var uploadBody = objectMapper.createObjectNode()
			.put("fileName", "beach.jpg")
			.put("contentType", "image/jpeg")
			.put("type", "IMAGE");

		var uploadResponse = mockMvc.perform(post("/api/media/uploads")
				.header("Authorization", "Bearer " + token)
				.contentType(MediaType.APPLICATION_JSON)
				.content(uploadBody.toString()))
			.andExpect(status().isCreated())
			.andExpect(jsonPath("$.assetId").isNotEmpty())
			.andReturn();

		String assetId = objectMapper.readTree(uploadResponse.getResponse().getContentAsString())
			.get("assetId").asText();

		var confirmBody = objectMapper.createObjectNode().put("sizeBytes", 1024);
		mockMvc.perform(post("/api/media/" + assetId + "/confirm")
				.header("Authorization", "Bearer " + token)
				.contentType(MediaType.APPLICATION_JSON)
				.content(confirmBody.toString()))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.type").value("IMAGE"));

		mockMvc.perform(post("/api/notes/" + noteId + "/attachments/" + assetId)
				.header("Authorization", "Bearer " + token))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.attachmentIds[0]").value(assetId));

		mockMvc.perform(delete("/api/notes/" + noteId + "/attachments/" + assetId)
				.header("Authorization", "Bearer " + token))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.attachmentIds.length()").value(0));

		mockMvc.perform(post("/api/notes/" + noteId + "/attachments/" + assetId)
				.header("Authorization", "Bearer " + token))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.attachmentIds[0]").value(assetId));

		mockMvc.perform(get("/api/media")
				.header("Authorization", "Bearer " + token)
				.param("type", "IMAGE"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.length()").value(1));

		mockMvc.perform(delete("/api/media/" + assetId)
				.header("Authorization", "Bearer " + token))
			.andExpect(status().isNoContent());

		mockMvc.perform(get("/api/notes/" + noteId)
				.header("Authorization", "Bearer " + token))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.attachmentIds.length()").value(0));
	}

	@Test
	void downloadMediaContentThroughApi() throws Exception {
		var registerBody = objectMapper.createObjectNode()
			.put("email", "files@example.com")
			.put("password", "password123")
			.put("displayName", "Files User");

		var registerResponse = mockMvc.perform(post("/api/auth/register")
				.contentType(MediaType.APPLICATION_JSON)
				.content(registerBody.toString()))
			.andExpect(status().isOk())
			.andReturn();

		String token = objectMapper.readTree(registerResponse.getResponse().getContentAsString())
			.get("accessToken").asText();

		var uploadBody = objectMapper.createObjectNode()
			.put("fileName", "notes.pdf")
			.put("contentType", "application/pdf")
			.put("type", "DOCUMENT");

		var uploadResponse = mockMvc.perform(post("/api/media/uploads")
				.header("Authorization", "Bearer " + token)
				.contentType(MediaType.APPLICATION_JSON)
				.content(uploadBody.toString()))
			.andExpect(status().isCreated())
			.andReturn();

		String assetId = objectMapper.readTree(uploadResponse.getResponse().getContentAsString())
			.get("assetId").asText();

		mockMvc.perform(post("/api/media/" + assetId + "/confirm")
				.header("Authorization", "Bearer " + token)
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.createObjectNode().put("sizeBytes", 10).toString()))
			.andExpect(status().isOk());

		mockMvc.perform(get("/api/media/" + assetId + "/content")
				.header("Authorization", "Bearer " + token))
			.andExpect(status().isOk())
			.andExpect(header().string("Content-Type", "application/pdf"))
			.andExpect(header().string("Content-Disposition", org.hamcrest.Matchers.containsString("attachment")))
			.andExpect(header().string("Content-Disposition", org.hamcrest.Matchers.containsString("notes.pdf")))
			.andExpect(content().string("test-bytes"));
	}

	@Test
	void attachAndDetachMediaOnNote() throws Exception {
		var registerBody = objectMapper.createObjectNode()
			.put("email", "attach@example.com")
			.put("password", "password123")
			.put("displayName", "Attach User");

		var registerResponse = mockMvc.perform(post("/api/auth/register")
				.contentType(MediaType.APPLICATION_JSON)
				.content(registerBody.toString()))
			.andExpect(status().isOk())
			.andReturn();

		String token = objectMapper.readTree(registerResponse.getResponse().getContentAsString())
			.get("accessToken").asText();

		var noteResponse = mockMvc.perform(post("/api/notes")
				.header("Authorization", "Bearer " + token)
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.createObjectNode().put("title", "With file").put("content", "caption").toString()))
			.andExpect(status().isCreated())
			.andReturn();

		String noteId = objectMapper.readTree(noteResponse.getResponse().getContentAsString())
			.get("id").asText();

		var uploadResponse = mockMvc.perform(post("/api/media/uploads")
				.header("Authorization", "Bearer " + token)
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.createObjectNode()
					.put("fileName", "scan.pdf")
					.put("contentType", "application/pdf")
					.put("type", "DOCUMENT")
					.toString()))
			.andExpect(status().isCreated())
			.andReturn();

		String assetId = objectMapper.readTree(uploadResponse.getResponse().getContentAsString())
			.get("assetId").asText();

		mockMvc.perform(put("/api/media/" + assetId + "/content")
				.header("Authorization", "Bearer " + token)
				.contentType(MediaType.APPLICATION_PDF)
				.content("pdf-bytes"))
			.andExpect(status().isNoContent());

		mockMvc.perform(post("/api/media/" + assetId + "/confirm")
				.header("Authorization", "Bearer " + token)
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.createObjectNode().put("sizeBytes", 9).toString()))
			.andExpect(status().isOk());

		mockMvc.perform(post("/api/notes/" + noteId + "/attachments/" + assetId)
				.header("Authorization", "Bearer " + token))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.attachmentIds[0]").value(assetId));

		mockMvc.perform(delete("/api/notes/" + noteId + "/attachments/" + assetId)
				.header("Authorization", "Bearer " + token))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.attachmentIds.length()").value(0));
	}
}
