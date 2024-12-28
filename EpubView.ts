import { ItemView, WorkspaceLeaf } from "obsidian";
import Epub from "epubjs";

export const EPUB_VIEW_TYPE = "epub-view";

export class EpubView extends ItemView {
	private currentFilePath: string;
	book: any;
	rendition: any;

	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
	}

	getViewType(): string {
		return EPUB_VIEW_TYPE;
	}

	getDisplayText(): string {
		return "EPUB Reader";
	}

	async onOpen() {
		this.contentEl.empty();
		// Create wrapper for better layout control
		const wrapper = this.contentEl.createDiv({ cls: "epub-wrapper" });
		// Add navigation buttons
		const navButtons = wrapper.createDiv({ cls: "epub-nav-buttons" });
		const prevButton = navButtons.createEl("button", {
			cls: "epub-nav-button",
			text: "←",
		});
		const nextButton = navButtons.createEl("button", {
			cls: "epub-nav-button",
			text: "→",
		});

		const container = wrapper.createDiv({ cls: "epub-container" });
		container.style.height = "100%";
		container.style.width = "100%";
		container.style.position = "relative";

		// Add event listeners
		prevButton.addEventListener("click", () => this.prev());
		nextButton.addEventListener("click", () => this.next());

		// Add keyboard navigation
		this.registerDomEvent(document, "keydown", (event: KeyboardEvent) => {
			if (event.key === "ArrowLeft") {
				this.prev();
			} else if (event.key === "ArrowRight") {
				this.next();
			}
		});
	}

	async setFile(filePath: string) {
		console.log("Opening file:", filePath);

		try {
			const adapter = this.app.vault.adapter;
			const arrayBuffer = await adapter.readBinary(filePath);

			if (this.book) {
				this.book.destroy();
			}

			this.book = Epub(arrayBuffer);
			await this.book.ready;

			const container = this.contentEl.querySelector(".epub-container");
			if (!container) {
				console.error("Container not found");
				return;
			}

			this.rendition = this.book.renderTo(container, {
				width: "100%",
				height: "100%",
				flow: "paginated",
				manager: "default",
			});

			await this.rendition.display();
			console.log("EPUB rendered successfully");
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
