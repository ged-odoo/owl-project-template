// In this example, we show how components can be defined and created.
import { mount } from "@odoo/owl";
import { Root } from "./root";

mount(Root, document.body, {
  templates: document.querySelector('script[type="application/xml"]').text,
  dev: true 
});
