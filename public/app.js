// In this example, we show how components can be defined and created.
import { mount } from "@odoo/owl";
import { Root } from "./root.js";

const TEMPLATES = await (await fetch('templates')).text();

mount(Root, document.body, { templates: TEMPLATES, dev: true });
