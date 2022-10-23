import { App, Plugin, PluginSettingTab, Setting, WorkspaceSidedock, ButtonComponent, addIcon } from 'obsidian';

interface AutoHideSettings {
	expandSidebar_onClickRibbon: boolean;
	expandSidebar_onClickNoteTitle: boolean;
	lockSidebar: boolean;
	leftPinActive: boolean;
	rightPinActive: boolean;
}

const DEFAULT_SETTINGS: AutoHideSettings = {
	expandSidebar_onClickRibbon: false,
	expandSidebar_onClickNoteTitle: false,
	lockSidebar: false,
	leftPinActive: false,
	rightPinActive: false
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

		addIcon("oah-pin", `<g transform="matrix(.87777 .88112 -.87777 .88112 43.03 -31.116)" style="fill:none"><g transform="translate(3.0597 -.53266)" stroke="currentColor" stroke-linejoin="round" stroke-width="2.3821" style="fill:none"><path d="m27.884 53.709c-2.1049-8.9245 4.547-11.436 9.5283-14.888l1.5881-23.821c-7.9403-1.4888-7.9403-2.3554-7.9403-8.9328h31.761c0 6.5774 0 7.444-7.9403 8.9328l1.5881 23.821c4.9814 3.4517 11.633 5.9636 9.5283 14.888l-19.057 1.4e-5z" style="fill:none"/><path d="m43.764 53.709v33.349l3.1761 7.9403 3.1761-7.9403v-33.349" style="fill:none"/></g></g>`);
		addIcon("oah-filled-pin", `<g transform="matrix(.87777 .88112 -.87777 .88112 43.03 -31.116)"><g transform="translate(3.0597 -.53266)" stroke="currentColor" fill="currentColor" stroke-linejoin="round" stroke-width="2.3821"><path d="m27.884 53.709c-2.1049-8.9245 4.547-11.436 9.5283-14.888l1.5881-23.821c-7.9403-1.4888-7.9403-2.3554-7.9403-8.9328h31.761c0 6.5774 0 7.444-7.9403 8.9328l1.5881 23.821c4.9814 3.4517 11.633 5.9636 9.5283 14.888l-19.057 1.4e-5z"/><path d="m43.764 53.709v33.349l3.1761 7.9403 3.1761-7.9403v-33.349"/></g></g>`);

		this.app.workspace.onLayoutReady(() => {
			this.init();
			this.registerEvents();
			this.togglePins();
		});
		// Reassigned when workspace is switched
		this.app.workspace.on("layout-change", () => {
			this.init();
			this.togglePins();
			if (this.settings.leftPinActive) {
				this.leftSplit.expand();
			}
			if (this.settings.rightPinActive) {
				this.rightSplit.expand();
			}
		});
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
		// Use workspace.containerEl instead of rootSplitEl to avoid removing EventListener when switching workspace
		this.registerDomEvent(this.app.workspace.containerEl, 'click', (evt: any) => {
			// focus to rootSplitEl
			if (!evt.path.contains(this.rootSplitEl)) {
				return;
			}
			// prevents unexpected behavior when clicking on the expand button
			if (evt.path.some((element: HTMLElement) => element.className === "workspace-tab-header-container")) {
				return;
			}
			// prevents unexpected behavior when clicking on the tag
			if (evt.target.classList.contains("cm-hashtag") || evt.target.classList.contains("tag")) {
				return;
			}
			// prevents collapsing when clicking on the breadcrumb
			if (evt.target.classList.contains("view-header-breadcrumb")) {
				return;
			}

			// Click on the note title to expand the left sidebar (Optional).
			if (evt.target.classList.contains("view-header-title") && this.settings.expandSidebar_onClickNoteTitle) {
				if (this.leftSplit.collapsed == true) this.leftSplit.expand();
				return;
			}

			// // Click on the rootSplit() to collapse both sidebars.
			if (!this.settings.leftPinActive) {
				this.leftSplit.collapse();
			}
			if (!this.settings.rightPinActive) {
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
		if (!this.settings.lockSidebar) {
			this.removePins();
			return;
		}
		if (document.getElementsByClassName("auto-hide-button").length == 0) {
			this.addPins();
		}
	}

	addPins() {
		// tabHeaderContainers[0]=left, [2]=right. need more robust way to get these
		const tabHeaderContainers = document.getElementsByClassName("workspace-tab-header-container");

		const lb = new ButtonComponent(tabHeaderContainers[0] as HTMLElement)
			.setIcon(this.settings.leftPinActive ? "oah-filled-pin" : "oah-pin")
			.setClass("auto-hide-button")
			.onClick(async () => {
				this.settings.leftPinActive = !this.settings.leftPinActive;
				await this.saveSettings();

				if (this.settings.leftPinActive) {
					lb.setIcon("oah-filled-pin");
				} else {
					lb.setIcon("oah-pin");
				}
			});

		const rb = new ButtonComponent(tabHeaderContainers[2] as HTMLElement)
			.setIcon(this.settings.rightPinActive ? "oah-filled-pin" : "oah-pin")
			.setClass("auto-hide-button")
			.onClick(async () => {
				this.settings.rightPinActive = !this.settings.rightPinActive;
				await this.saveSettings();

				if (this.settings.rightPinActive) {
					rb.setIcon("oah-filled-pin");
				} else {
					rb.setIcon("oah-pin");
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
