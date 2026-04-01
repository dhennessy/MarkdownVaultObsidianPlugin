import {App, PluginSettingTab, Setting} from "obsidian";
import MyPlugin from "./main";

export interface MyPluginSettings {
	vaultUuid: string;
	apiKey: string;
}

export const DEFAULT_SETTINGS: MyPluginSettings = {
	vaultUuid: "",
	apiKey: "",
};

export function getMissingRequiredSettings(settings: MyPluginSettings): string[] {
	const missing: string[] = [];

	if (!settings.vaultUuid.trim()) {
		missing.push("Vault UUID");
	}

	if (!settings.apiKey.trim()) {
		missing.push("API key");
	}

	return missing;
}

export class MarkdownVaultSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Vault UUID")
			.setDesc("Unique ID of the vault in MarkdownVault.")
			.addText(text => text
				.setPlaceholder("Enter your vault UUID")
				.setValue(this.plugin.settings.vaultUuid)
				.onChange(async (value) => {
					this.plugin.settings.vaultUuid = value.trim();
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName("API key")
			.setDesc("API key used to authenticate MarkdownVault API requests.")
			.addText(text => text
				.setPlaceholder("Enter your API key")
				.setValue(this.plugin.settings.apiKey)
				.onChange(async (value) => {
					this.plugin.settings.apiKey = value.trim();
					await this.plugin.saveSettings();
				}));

	}
}
