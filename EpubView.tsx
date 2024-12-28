// import React from 'react';
import { ItemView, TFile, WorkspaceLeaf } from "obsidian";
import { createRoot, Root } from "react-dom/client";
import EpubReader from "./components/EpubReader";
import * as path from "path";
import { readFile } from "fs";

export const EPUB_VIEW_TYPE = "epub-view";

export class EpubView extends ItemView {
	private currentFilePath: string;
	private root: Root;
	book: any;
	rendition: any;

	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
	}

	getViewType(): string {
		return EPUB_VIEW_TYPE;
	}

	getDisplayText(): string {
		return this.currentFilePath || "EPUB Reader";
	}

	async onOpen() {
		this.contentEl.empty();
	}

	private async readFileAsBlob(file: TFile): Promise<Blob> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();

			reader.onload = () => {
				const arrayBuffer = reader.result as ArrayBuffer;
				resolve(new Blob([arrayBuffer]));
			};

			reader.onerror = () => reject(new Error("Failed to read file"));

			// Read the file as an ArrayBuffer (binary data)
			// @ts-ignore
			readFile(path.join(file.vault.adapter.basePath, file.path), (err, data) => {
				if (err) {
					reject(err);
				} else {
					reader.readAsArrayBuffer(new Blob([data]));
				}
			});
		});
	}
	async setFile(filePath: string) {
		console.log("Opening file:", filePath);
		this.root = createRoot(this.contentEl);
		try {
			const file = this.app.vault.getAbstractFileByPath(filePath);
			console.log("file", file);
			if (!file || !(file instanceof TFile)) {
				console.error("File not found:", filePath);
				return;
			}
			const fileContent = await this.readFileAsBlob(file);
			const bookPath = URL.createObjectURL(fileContent);
			this.root.render(<EpubReader path={bookPath} />);
		} catch (error) {
			console.error("Error rendering EPUB:", error);
		}
	}

	async prev() {
		if (this.rendition) {
			this.rendition.prev();
		}
	}

	async next() {
		if (this.rendition) {
			this.rendition.next();
		}
	}

	getState() {
		return {
			filePath: this.currentFilePath,
		};
	}

	async setState(state: any, result: any): Promise<void> {
		console.log("setState called with:", state);
		if (state.file) {
			this.currentFilePath = state.file;
			await this.setFile(state.file);
			// Let Obsidian know the state was successfully set
			return Promise.resolve();
		}
	}

	async onClose() {
		if (this.book) {
			this.book.destroy();
		}
	}
}
