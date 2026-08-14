import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
	transpilePackages: ["@notextra/theme", "@notextra/api"],
	outputFileTracingRoot: path.join(__dirname, "../.."),
};

export default nextConfig;
