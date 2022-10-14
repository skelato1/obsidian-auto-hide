import { App, Plugin, PluginSettingTab, Setting, WorkspaceSidedock, ButtonComponent } from 'obsidian';

interface AutoHideSettings {
	expandSidebar_onClickRibbon: boolean;
	expandSidebar_onClickNoteTitle: boolean;
	lockSidebar: boolean;
}

const DEFAULT_SETTINGS: AutoHideSettings = {
	expandSidebar_onClickRibbon: false,
	expandSidebar_onClickNoteTitle: false,
	lockSidebar: false
}

export default class AutoHidePlugin extends Plugin {
	settings: AutoHideSettings;
	leftSplit: WorkspaceSidedock;
	rightSplit: WorkspaceSidedock;
	rootSplitEl: HTMLElement;
	leftRibbonEl: HTMLElement;
	rightRibbonEl: HTMLElement;

	leftPin: boolean;
	rightPin: boolean;

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new AutoHideSettingTab(this.app, this));

		this.app.workspace.onLayoutReady(() => {
			this.init();
			this.registerEvents();
			this.togglePins();
		})
	}

	onunload() {
		this.removePins();
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
			// prevents unexpected behavior when clicking on the expand button
			if (evt.path.some((element: HTMLElement) => element.className === "workspace-tab-header-container")) {
				return;
			}
			// prevents unexpected behavior when clicking on the tag
			if (evt.target.classList.contains("cm-hashtag") || evt.target.classList.contains("tag")) {
				return;
			}
			
			// Click on the note title to expand the left sidebar (Optional).
			if(evt.target.classList.contains("view-header-title") && this.settings.expandSidebar_onClickNoteTitle) {
				if (this.leftSplit.collapsed == true) this.leftSplit.expand();
				return;
			}

			// // Click on the rootSplit() to collapse both sidebars.
			if(!this.leftPin) {
				this.leftSplit.collapse();
			}
			if(!this.rightPin) {
				this.rightSplit.collapse();
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

	// Feature: pane locking

	togglePins() {
		if (this.settings.lockSidebar) {
			this.addPins();
		} else {
			this.removePins();
		}
	}

	addPins() {
		const tabHeaderContainers = document.getElementsByClassName("workspace-tab-header-container");
		this.leftPin = false;
		this.rightPin = false;

		const lb = new ButtonComponent(tabHeaderContainers[0] as HTMLElement)
			.setIcon("pin")
			.setClass("auto-hide-button")
			.onClick(() => {
				document.getElementsByClassName("auto-hide-button")[0].classList.toggle("is-active");
				this.leftPin = !this.leftPin;
				if (this.leftPin) {
					lb.setIcon("filled-pin");
				} else {
					lb.setIcon("pin");
				}
			});

		const rb = new ButtonComponent(tabHeaderContainers[1] as HTMLElement)
			.setIcon("pin")
			.setClass("auto-hide-button")
			.onClick(() => {
				document.getElementsByClassName("auto-hide-button")[1].classList.toggle("is-active");
				this.rightPin = !this.rightPin;
				if (this.rightPin) {
					rb.setIcon("filled-pin");
				} else {
					rb.setIcon("pin");
				}
			});
	}

	removePins() {
		const pins = document.getElementsByClassName("auto-hide-button");
		while (pins.length) {
			if (pins.item(0) != null) {
				pins[0].remove();
			}
		}
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
		containerEl.createEl('h4', { text: 'EXPERIMENTAL!' });
		new Setting(containerEl)
			.setName('Lock sidebar collapse')
			.setDesc('Add a pin that can temporarily lock the sidebar collapse.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.lockSidebar)
				.onChange(async (value) => {
					this.plugin.settings.lockSidebar = value;
					await this.plugin.saveSettings();
					this.plugin.togglePins();
				}));
	}
}
