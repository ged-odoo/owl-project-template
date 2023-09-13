// In this example, we show how components can be defined and created.
import { mount } from "@odoo/owl";
import { Root } from "./root";

const TEMPLATES = document.querySelector('script[type="application/xml"]').text;

mount(Root, document.body, { templates: TEMPLATES, dev: true });
