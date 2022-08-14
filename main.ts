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
	leftRibbonEl: HTMLElement;
	rightRibbonEl: HTMLElement;
	contentEl: HTMLElement;
	noteTitleEl: HTMLElement;

	async onload() {
		await this.loadSettings();

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
		this.noteTitleEl = document.getElementsByClassName('view-header-title-container')[0] as HTMLElement;
	}

	registerEvents() {
		// Click on the contentEl to collapse both sidebars.
		this.registerDomEvent(this.contentEl, 'click', (evt: MouseEvent) => {
			this.leftSplit.collapse();
			this.rightSplit.collapse();		
		});

		// Click on the blank area of leftRibbonEl to expand the left sidebar (Optional).
		this.registerDomEvent(this.leftRibbonEl, 'click', (evt: MouseEvent) => {
			if(this.settings.expandSidebar_onClickRibbon){
				if(evt.target.ariaLabel == null){ // If clicked on the blank area, this property will be null. MAYBE.
					if(this.leftSplit.collapsed == true) this.leftSplit.expand();
				}
			}
		});
		// Click on the blank area of rightRibbonEl to expand the right sidebar (Optional).
		this.registerDomEvent(this.rightRibbonEl, 'click', (evt: MouseEvent) => {
			if(this.settings.expandSidebar_onClickRibbon){
				if(evt.target.ariaLabel == null){
					if(this.rightSplit.collapsed == true) this.rightSplit.expand();
				}
			}
		});
		// Click on the note title to expand the left sidebar (Optional).
		this.registerDomEvent(this.noteTitleEl, 'click', (evt: MouseEvent) => {
			if(this.settings.expandSidebar_onClickNoteTitle){
				if(this.leftSplit.collapsed == true) this.leftSplit.expand();
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
