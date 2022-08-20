import {SidebarPlugin, Sidebars} from "../sidebars/sidebarPage";

class TodolistPlugin extends SidebarPlugin {

    constructor() {
        super();

        this.id = "todolist";
        this.name = "todolist";
        this.icon = "fas fa-clock";
        this.styles = [];
        this.scripts = [];
        this.html = "Todo list is under development";
    }

    public async init(sidebar: Sidebars) {

    }

    public async panelMsgProcess(msg) {
        return false;
    }
}

const todolistPlugin = new TodolistPlugin();
export default todolistPlugin;
