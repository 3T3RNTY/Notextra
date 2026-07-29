package com.notextra;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.modulith.core.ApplicationModules;

@SpringBootTest
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
