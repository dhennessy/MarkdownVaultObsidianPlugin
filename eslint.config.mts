import tseslint from "typescript-eslint";
import obsidianmd from "eslint-plugin-obsidianmd";
import globals from "globals";
import { globalIgnores } from "eslint/config";

export default tseslint.config(
	...obsidianmd.configs.recommended,
	{
		plugins: {
			obsidianmd,
		},
		languageOptions: {
			globals: {
				...globals.browser,
			},
			parserOptions: {
				projectService: {
					allowDefaultProject: ["eslint.config.js", "manifest.json"],
				},
				tsconfigRootDir: import.meta.dirname,
				extraFileExtensions: [".json"],
			},
		},
		rules: {
			"obsidianmd/ui/sentence-case": [
				"error",
				{
					brands: ["MarkdownVault", "Markdown Vault"],
					acronyms: ["API", "UUID", "ID"],
					enforceCamelCaseLower: true,
				},
			],
		},
	},
	globalIgnores([
		"node_modules",
		"dist",
		"esbuild.config.mjs",
		"eslint.config.js",
		"version-bump.mjs",
		"versions.json",
		"main.js",
	]),
);
