import JSZip from "jszip";
import { Notice, Plugin, requestUrl } from "obsidian";
import { VaultApiClient } from "./api";
import {
	DEFAULT_SETTINGS,
	getMissingRequiredSettings,
	MarkdownVaultSettingTab,
	MyPluginSettings,
} from "./settings";

export default class MarkdownVaultPlugin extends Plugin {
	settings: MyPluginSettings;
	private isPublishing = false;

	async onload() {
		await this.loadSettings();

			this.addRibbonIcon(
				"smartphone",
				"Publish to Markdown Vault",
				(evt: MouseEvent) => {
					void this.publishVault();
				},
			);

		this.addCommand({
			id: "publish-vault",
			name: "Publish",
			callback: async () => {
				await this.publishVault();
			},
		});

		this.addSettingTab(new MarkdownVaultSettingTab(this.app, this));
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			(await this.loadData()) as Partial<MyPluginSettings>,
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	ensureRequiredSettingsConfigured(showNotice = true): boolean {
		const missing = getMissingRequiredSettings(this.settings);

		if (missing.length === 0) {
			return true;
		}

		if (showNotice) {
			new Notice(
				`Missing required MarkdownVault settings: ${missing.join(", ")}. ` +
					"Set them in Settings -> Community plugins -> MarkdownVault Publish.",
			);
		}

		return false;
	}

	private async publishVault(): Promise<void> {
		if (this.isPublishing) {
			new Notice("Vault publishing is already in progress.");
			return;
		}

		if (!this.ensureRequiredSettingsConfigured()) {
			return;
		}

		this.isPublishing = true;

		const vaultUuid = this.settings.vaultUuid.trim();
		const api = new VaultApiClient({
			apiKey: this.settings.apiKey.trim(),
			vaultPassword: undefined,
		});

		let uploadUuid: string | undefined;
		let completeUploadCalled = false;

		try {
			new Notice("Preparing vault archive...");
			const zipBytes = await this.buildVaultArchive();
			const zipFilename = `${vaultUuid}.zip`;

			new Notice(
				`Archive prepared (${formatBytes(zipBytes.length)}). Creating upload...`,
			);
			const upload = await api.createUpload(vaultUuid, {
				filename: zipFilename,
				contentType: "application/zip",
				sizeBytes: zipBytes.length,
			});
			uploadUuid = upload.uploadUuid;

			if (upload.partSize <= 0) {
				throw new Error("Server returned invalid part size.");
			}

			const partCount = Math.ceil(zipBytes.length / upload.partSize);
			if (partCount > upload.maxParts) {
				throw new Error(
					`Archive requires ${partCount} parts, but server allows at most ${upload.maxParts}.`,
				);
			}

			const partNumbers = Array.from(
				{ length: partCount },
				(_, index) => index + 1,
			);
			new Notice(
				`Requesting upload URLs for ${partNumbers.length} parts...`,
			);
			const uploadParts = await api.createUploadParts(
				vaultUuid,
				uploadUuid,
				{ partNumbers },
			);
			const uploadPartByNumber = new Map(
				uploadParts.parts.map((part) => [part.partNumber, part]),
			);
			const completedParts: { partNumber: number; etag: string }[] = [];

			for (const partNumber of partNumbers) {
				const uploadPart = uploadPartByNumber.get(partNumber);
				if (!uploadPart) {
					throw new Error(
						`Server did not return a URL for part ${partNumber}.`,
					);
				}

				const offset = (partNumber - 1) * upload.partSize;
				const chunk = zipBytes.slice(
					offset,
					Math.min(offset + upload.partSize, zipBytes.length),
				);
				const putResponse = await requestUrl({
					url: uploadPart.url,
					method: "PUT",
					body: chunk.buffer.slice(
						chunk.byteOffset,
						chunk.byteOffset + chunk.byteLength,
					),
					throw: false,
				});

				if (putResponse.status < 200 || putResponse.status >= 300) {
					throw new Error(
						`Upload failed for part ${partNumber} (HTTP ${putResponse.status}).`,
					);
				}

				const etag =
					putResponse.headers.etag ?? putResponse.headers.ETag;
				if (!etag) {
					throw new Error(
						`Upload part ${partNumber} did not return an ETag.`,
					);
				}

				completedParts.push({ partNumber, etag });
			}

			completeUploadCalled = true;
			new Notice("Finalizing publish...");
			await api.completeUpload(vaultUuid, uploadUuid, {
				parts: completedParts,
			});
			new Notice("Vault published.");
		} catch (error: unknown) {
			if (uploadUuid && !completeUploadCalled) {
				try {
					await api.abandonUpload(vaultUuid, uploadUuid);
				} catch {
					// Ignore abandon failures and preserve the original error.
				}
			}

			const errorMessage =
				error instanceof Error ? error.message : String(error);
			new Notice(`Publish failed: ${errorMessage}`);
		} finally {
			this.isPublishing = false;
		}
	}

	private async buildVaultArchive(): Promise<Uint8Array> {
		const zip = new JSZip();
		const files = this.app.vault
			.getFiles()
			.filter((file) => !isDotPath(file.path));

		for (const file of files) {
			const fileBytes = await this.app.vault.readBinary(file);
			zip.file(file.path, fileBytes);
		}

		return zip.generateAsync({
			type: "uint8array",
			compression: "DEFLATE",
			compressionOptions: { level: 6 },
		});
	}
}

function isDotPath(path: string): boolean {
	return path.split("/").some((segment) => segment.startsWith("."));
}

function formatBytes(value: number): string {
	if (value < 1024) {
		return `${value} B`;
	}

	if (value < 1024 * 1024) {
		return `${(value / 1024).toFixed(1)} KB`;
	}

	return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}
