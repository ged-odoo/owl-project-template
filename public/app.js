// In this example, we show how components can be defined and created.
import { mount } from "@odoo/owl";
import { Root } from "./root";

const templates = await FETCH_TEMPLATES();
mount(Root, document.body, {
  templates,
  dev: DEV, // injected by server
});
