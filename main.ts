import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, Workspace, WorkspaceRibbon, WorkspaceSidedock } from 'obsidian';

// Remember to rename these classes and interfaces!

interface AutoHideSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: AutoHideSettings = {
	mySetting: 'default'
}

export default class AutoHidePlugin extends Plugin {
	settings: AutoHideSettings;
	// sidedock: WorkspaceSidedock;
	// workspace: Workspace;
	leftSplit: WorkspaceSidedock;
	rightSplit: WorkspaceSidedock;
	leftRibbon: WorkspaceRibbon;
	rightRibbon: WorkspaceRibbon;


	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('This is a notice!');
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		console.log("outer ready");
		this.app.workspace.onLayoutReady(() => {
			this.initialize();
			this.registerEvents()
			
		})

		
		
		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}
	
	onunload() {
		
	}
	
	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}
	
	async saveSettings() {
		await this.saveData(this.settings);
	}

	initialize() {
		this.leftSplit = this.app.workspace.leftSplit;
		this.rightSplit = this.app.workspace.rightSplit;
		this.leftRibbon = this.app.workspace.leftRibbon;
		this.rightRibbon = this.app.workspace.rightRibbon;
		console.log("Initialize done");

	}

	registerEvents() {
		// this.registerDomEvent(this.leftRibbon.containerEl, 'mouseover', (evt: MouseEvent) => {
		// 	console.log('mouseover', evt);
		// 	this.app.workspace.leftSplit.expand();
		// });
		// this.registerDomEvent(this.rightRibbon.containerEl, 'mouseover', (evt: MouseEvent) => {
		// 	console.log('mouseover', evt);
		// });

		this.registerDomEvent(this.app.workspace.rootSplit.containerEl, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
			this.collapseAll();			
		});
	}

	collapseAll() {
		this.leftSplit.collapse();
		this.rightSplit.collapse();
	}


}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
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

		containerEl.createEl('h2', {text: 'Settings for my awesome plugin.'});

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					console.log('Secret: ' + value);
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
