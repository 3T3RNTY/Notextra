package com.notextra;

import com.notextra.shared.storage.ObjectStorageService;
import org.mockito.Mockito;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;

@TestConfiguration
public class TestStorageConfig {

	@Bean
	@Primary
	ObjectStorageService objectStorageService() {
		ObjectStorageService storage = Mockito.mock(ObjectStorageService.class);
		Mockito.when(storage.createUploadUrl(Mockito.anyString(), Mockito.anyString()))
			.thenAnswer(invocation -> "https://storage.test/upload/" + invocation.getArgument(0));
		Mockito.when(storage.createDownloadUrl(Mockito.anyString()))
			.thenAnswer(invocation -> "https://storage.test/download/" + invocation.getArgument(0));
		return storage;
	}
}
