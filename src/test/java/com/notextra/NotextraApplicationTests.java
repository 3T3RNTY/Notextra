package com.notextra;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.modulith.core.ApplicationModules;

@SpringBootTest
@Import(TestStorageConfig.class)
class NotextraApplicationTests {

	@Test
	void contextLoads() {
	}

	@Test
	void verifyModularStructure() {
		var modules = ApplicationModules.of(NotextraApplication.class);
		modules.verify();
	}
}
