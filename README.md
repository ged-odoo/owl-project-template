# owl-project-template

A starter template to create [owl](https://github.com/odoo/owl) projects using bun. This is only a toy (<200 loc), not
production ready!

## Setup
To create a new project:

```bash
bun create ged-odoo/owl-project-template [destination]
cd [destination]
bun dev # to start a dev server
```

The following scripts are available:
- `bun start` to start a server
- `bun dev` to start a dev server (with autoreload and file watcher)

## Features

This project template provides the following features:
- starting point for an owl application
- all templates are collected from `src` and injected into the page
- autoreload (in dev mode)

## Project structure

- `main.js` is the main entry point. It checks for dev mode, and start the server accordingly
- `server/` is a very simple (mostly static) server that perform the following tasks:
    - for route `/`, it reads `src/app.html` and inject templates, and autoreload code (in dev mode)
    - for route `/app.js`, it bundles all code in `src/` using `app.js` as the entry point
    - for route `/owl.js`, it returns the owl file from `node_modules`
    - other files are statically served from `/src`
- `src/` is the location for the owl application code. Note that all xml files will be injected into
    the main page (look at page source)
    - `src/app.html` is the main page that will serve as index page.
    - `src/app.js` is the main entry point for the owl application