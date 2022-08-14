import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, Workspace, WorkspaceRibbon, WorkspaceRoot, WorkspaceSidedock } from 'obsidian';

// Remember to rename these classes and interfaces!

interface AutoHideSettings {
	openLeftSplitOnClickSideBar: boolean;
	openLeftSplitOnClickTitleBar: boolean;
}

const DEFAULT_SETTINGS: AutoHideSettings = {
	openLeftSplitOnClickSideBar: false,
	openLeftSplitOnClickTitleBar: false
}

export default class AutoHidePlugin extends Plugin {
	settings: AutoHideSettings;
	leftSplit: WorkspaceSidedock;
	rightSplit: WorkspaceSidedock;
	leftRibbonEl: HTMLElement;
	rightRibbonEl: HTMLElement;
	contentEl: HTMLElement;
	titleBarEl: HTMLElement;

	async onload() {
		await this.loadSettings();

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

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
		this.leftRibbonEl = this.app.workspace.leftRibbon.containerEl;
		this.rightRibbonEl = this.app.workspace.rightRibbon.containerEl;
		this.contentEl = document.getElementsByClassName('view-content')[0] as HTMLElement;
		this.titleBarEl = document.getElementsByClassName('view-header-title-container')[0] as HTMLElement;
	}

	registerEvents() {
		// Click rootSplit to collapse all.
		this.registerDomEvent(this.contentEl, 'click', (evt: MouseEvent) => {
			this.leftSplit.collapse();
			this.rightSplit.collapse();		
		});

		// Click leftRibbon to expand leftSplit (Optional).
		this.registerDomEvent(this.leftRibbonEl, 'click', (evt: MouseEvent) => {
			if(this.settings.openLeftSplitOnClickSideBar){
				if(evt.target.ariaLabel == null){ // =サイドバー内のボタンを押している場合は実行しない
					this.leftSplit.expand();
				}
			}
		});
		// Click rightRibbon to expand rightSplit (Optional).
		this.registerDomEvent(this.rightRibbonEl, 'click', (evt: MouseEvent) => {
			if(this.settings.openLeftSplitOnClickSideBar){
				if(evt.target.ariaLabel == null){ // =サイドバー内のボタンを押している場合は実行しない
					this.rightSplit.expand();
				}
			}
		});

		// Click titleBar to expand leftSplit (Optional).
		this.registerDomEvent(this.titleBarEl, 'click', (evt: MouseEvent) => {
			if(this.settings.openLeftSplitOnClickTitleBar){
				this.leftSplit.expand();
			}
		});
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: AutoHidePlugin;

	constructor(app: App, plugin: AutoHidePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Settings for Auto Hide plugin.'});

		new Setting(containerEl)
			.setName('Click sidebar to expand')
			.setDesc('When you clicked the left ribbon bar, then left sidebar expand')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.openLeftSplitOnClickSideBar)
				.onChange(async (value) => {
					console.log('asyncyncyn!');
					this.plugin.settings.openLeftSplitOnClickSideBar = value;
					await this.plugin.saveSettings();
				}));
		new Setting(containerEl)
			.setName('Click titlebar to expand sidebar')
			.setDesc('When you clicked the left ribbon bar, then left sidebar expand')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.openLeftSplitOnClickTitleBar)
				.onChange(async (value) => {
					console.log('asyncyncyn!');
					this.plugin.settings.openLeftSplitOnClickTitleBar = value;
					await this.plugin.saveSettings();
				}));
	}
}
