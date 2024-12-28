import { Plugin, WorkspaceLeaf, ViewState } from 'obsidian';
import { EpubView, EPUB_VIEW_TYPE } from './EpubView';

export default class BookboyPlugin extends Plugin {
  async onload() {
    console.log('loading plugin bookboy !!!');
    
    // Register view type
    this.registerView(
      EPUB_VIEW_TYPE,
      (leaf: WorkspaceLeaf) => new EpubView(leaf)
    );

    // Register extension handler
    this.registerExtensions(['epub'], EPUB_VIEW_TYPE);

    // Handle opening epub files
    this.app.workspace.on('file-open', async (file) => {
      if (file && file.extension === 'epub') {
        const leaves = this.app.workspace.getLeavesOfType(EPUB_VIEW_TYPE);
        let leaf: WorkspaceLeaf;
        
        if (leaves.length > 0) {
          leaf = leaves[0];
        } else {
          leaf = this.app.workspace.getLeaf('split');
        }
        
        await leaf.setViewState({
          type: EPUB_VIEW_TYPE,
          state: { filePath: file.path }
        } as ViewState);
      }
    });
  }

  async onunload() {
    console.log('unloading plugin');
  }
}