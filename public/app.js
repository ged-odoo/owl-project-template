// In this example, we show how components can be defined and created.
import { mount } from "@odoo/owl";
import { Root } from "./root";

mount(Root, document.body, {
  templates: TEMPLATES, // injected by server
  dev: DEV, // injected by server 
});
