package com.notextra.generation;

import org.springframework.modulith.ApplicationModule;

@ApplicationModule(
	displayName = "Generation",
	allowedDependencies = {"notes :: api", "media :: api", "ai :: api", "shared"}
)
public class GenerationModule {
}
