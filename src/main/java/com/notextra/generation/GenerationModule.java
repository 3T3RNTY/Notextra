package com.notextra.generation;

import org.springframework.modulith.ApplicationModule;

@ApplicationModule(
	displayName = "Generation",
	allowedDependencies = {"notes", "media", "ai"}
)
public class GenerationModule {
}
