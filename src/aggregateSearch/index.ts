import { SidebarPlugin } from "../sidebars/sidebarPage";

class AggregateSearchPlugin extends SidebarPlugin {

    constructor() {
        super();

        this.id = "aggregateSearchPlugin";
        this.name = "Aggregate Search";
        this.icon = "fas fa-search";
        this.styles = [
        ];
        this.scripts = [
        ];
        this.html = '<div class="card"><div class="card-body">Under development...</div></div>';
    }
}

const aggregateSearchPlugin = new AggregateSearchPlugin();
export default aggregateSearchPlugin;
