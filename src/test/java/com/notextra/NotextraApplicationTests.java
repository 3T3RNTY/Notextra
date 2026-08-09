package com.notextra;

import org.junit.jupiter.api.Test;
import org.springframework.modulith.core.ApplicationModules;

class NotextraApplicationTests {

	@Test
	void verifyModularStructure() {
		var modules = ApplicationModules.of(NotextraApplication.class);
		modules.verify();
	}
}
