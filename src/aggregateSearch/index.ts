import { SidebarPlugin } from "../sidebars/sidebarPage";
import {underDevelopment} from "./test";

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
    }
}

const aggregateSearchPlugin = new AggregateSearchPlugin();
export default aggregateSearchPlugin;
