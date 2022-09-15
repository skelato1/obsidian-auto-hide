import { App, Plugin, PluginSettingTab, Setting, WorkspaceSidedock } from 'obsidian';

interface AutoHideSettings {
	expandSidebar_onClickRibbon: boolean;
	expandSidebar_onClickNoteTitle: boolean;
}

const DEFAULT_SETTINGS: AutoHideSettings = {
	expandSidebar_onClickRibbon: false,
	expandSidebar_onClickNoteTitle: false
}

export default class AutoHidePlugin extends Plugin {
	settings: AutoHideSettings;
	leftSplit: WorkspaceSidedock;
	rightSplit: WorkspaceSidedock;
	rootSplitEl: HTMLElement;
	leftRibbonEl: HTMLElement;
	rightRibbonEl: HTMLElement;

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new AutoHideSettingTab(this.app, this));

		this.app.workspace.onLayoutReady(() => {
			this.init();
			this.registerEvents();
		})
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	init() {
		this.leftSplit = this.app.workspace.leftSplit;
		this.rightSplit = this.app.workspace.rightSplit;
		this.rootSplitEl = (this.app.workspace.rootSplit as any).containerEl;
		this.leftRibbonEl = (this.app.workspace.leftRibbon as any).containerEl;
		this.rightRibbonEl = (this.app.workspace.rightRibbon as any).containerEl;
	}

	registerEvents() {
		this.registerDomEvent(this.rootSplitEl, 'click', (evt: any) => {

			if (evt.target.classList.contains("view-header-title")) { // Click on the note title to expand the left sidebar (Optional).
				if (this.settings.expandSidebar_onClickNoteTitle) {
					if (this.leftSplit.collapsed == true) this.leftSplit.expand();
				}
			} else { // Click on the rootSplit() to collapse both sidebars.
				if (!(evt.target.classList.contains("cm-hashtag") || evt.target.classList.contains("tag"))) {
					this.leftSplit.collapse();
					this.rightSplit.collapse();
				}
			}
		});

		// Click on the blank area of leftRibbonEl to expand the left sidebar (Optional).
		this.registerDomEvent(this.leftRibbonEl, 'click', (evt: MouseEvent) => {
			if (this.settings.expandSidebar_onClickRibbon) {
				if (evt.target == this.leftRibbonEl) {
					if (this.leftSplit.collapsed == true) this.leftSplit.expand();
				}
			}
		});

		// Click on the blank area of rightRibbonEl to expand the right sidebar (Optional).
		this.registerDomEvent(this.rightRibbonEl, 'click', (evt: MouseEvent) => {
			if (this.settings.expandSidebar_onClickRibbon) {
				if (evt.target == this.rightRibbonEl) {
					if (this.rightSplit.collapsed == true) this.rightSplit.expand();
				}
			}
		});
	}
}

class AutoHideSettingTab extends PluginSettingTab {
	plugin: AutoHidePlugin;

	constructor(app: App, plugin: AutoHidePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h2', { text: 'Settings for Auto Hide plugin.' });

		new Setting(containerEl)
			.setName('Expand the sidebar with a ribbon')
			.setDesc('Click on the blank area of ribbon to expand the sidebar.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.expandSidebar_onClickRibbon)
				.onChange(async (value) => {
					this.plugin.settings.expandSidebar_onClickRibbon = value;
					await this.plugin.saveSettings();
				}));
		new Setting(containerEl)
			.setName('Expand the sidebar with a note title')
			.setDesc('Click on the note title to expand the left sidebar.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.expandSidebar_onClickNoteTitle)
				.onChange(async (value) => {
					this.plugin.settings.expandSidebar_onClickNoteTitle = value;
					await this.plugin.saveSettings();
				}));
	}
}
