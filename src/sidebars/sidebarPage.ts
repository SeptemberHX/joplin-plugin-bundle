import joplin from "../../api";


export abstract class SidebarPlugin {
    id: string;
    name: string;
    icon: string;
    html: string;
    styles: string[];
    scripts: string[];

    protected constructor() {
        this.html = `
            <div class="card"><div class="card-body">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            </div></div>
        `;
    }

    public async panelMsgProcess(msg: any) {
        return false;
    }

    public async init(sidebars: Sidebars) {

    }
}


export class Sidebars {
    plugins: SidebarPlugin[];
    panel;
    lastActiveTabPluginId: string;

    constructor() {
    }

    public async init(plugins) {
        this.plugins = plugins;
        this.panel = await joplin.views.panels.create('sidebar_bundle_panel');

        await joplin.views.panels.onMessage(this.panel, async (msg: any) => {
            switch (msg.name) {
                case 'sidebar_tab_item_clicked':
                    this.lastActiveTabPluginId = msg.id;
                    break;
                default:
                    for (const plugin of this.plugins) {
                        if (await plugin.panelMsgProcess(msg)) {
                            break;
                        }
                    }
                    break;
            }
        });

        await joplin.views.panels.addScript(this.panel, './scripts/sidebars/bootstrap.min.css');

        for (const plugin of this.plugins) {
            for (const style of plugin.styles) {
                await joplin.views.panels.addScript(this.panel, style);
            }
            for (const script of plugin.scripts) {
                await joplin.views.panels.addScript(this.panel, script);
            }
        }
        await this.render();
        await joplin.views.panels.addScript(this.panel, './scripts/sidebars/custom.css');
        await joplin.views.panels.addScript(this.panel, './scripts/sidebars/bootstrap.bundle.min.js');
        await joplin.views.panels.addScript(this.panel, './scripts/sidebars/sidebars.js');

        for (const plugin of this.plugins) {
            await plugin.init(this);
        }
    }

    public async updateHtml(id, html) {
        for (const existPlugin of this.plugins) {
            if (existPlugin.id === id) {
                existPlugin.html = html;
                break;
            }
        }

        await this.render();
    }

    public async render() {
        if (this.plugins.length === 0) {
            return 'Empty';
        }

        if (!this.lastActiveTabPluginId) {
            this.lastActiveTabPluginId = this.plugins[0].id;
        }

        let result = `<div id="sidebar-bundle">`
        result += `<ul class="nav nav-tabs fixed-top" id="myTab" role="tablist">`;
        let divResult = `<div class="tab-content" id="myTabContent">`;
        for (let i = 0; i < this.plugins.length; i++) {
            const isLastActive = this.lastActiveTabPluginId ? this.lastActiveTabPluginId === this.plugins[i].id : false;

            let active = isLastActive ? 'active' : '';
            let show = isLastActive ? 'show' : '';
            result += `
                <li class="nav-item" role="presentation">
                    <button class="nav-link ${active}" id="${this.plugins[i].id}-tab" title="${this.plugins[i].name}" onclick="tabItemClicked('${this.plugins[i].id}')" data-bs-toggle="tab" data-bs-target="#${this.plugins[i].id}" type="button" role="tab" aria-controls="${this.plugins[i].id}" aria-selected="true">
                        <div data-bs-toggle="tooltip" data-bs-title="${this.plugins[i].name}" data-bs-container="body">
                            <i class="${this.plugins[i].icon}"></i>
                        </div>
                    </button>
                </li>
            `;
            divResult += `
                <div class="tab-pane fade ${show} ${active}" id="${this.plugins[i].id}" role="tabpanel" aria-labelledby="${this.plugins[i].id}-tab">${this.plugins[i].html}</div>
            `
        }
        divResult += `</div>`;
        result += `</ul>` + divResult + `</div>`;

        await joplin.views.panels.setHtml(this.panel, result);
    }
}
