# 🦉 owl-project-template 🦉

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
- `core/` is meant to contain the code that organize the application (so, a framework). This means:
  - managing assets
  - a simple autoreload feature
  - a basic http server
- `public/` is the location for the owl application code (the browser code). Note that all xml files will be  
  injected intothe main page (look at page source)
    - `public/app.html` is the main page that will serve as index page.
    - `public/app.js` is the main entry point for the owl application

## Server

The server located in `core` has the following routes:
- for route `/`, it reads `public/app.html` and inject templates, and autoreload code (in dev mode)
- for route `/app.js`, it bundles all code in `public/` using `app.js` as the entry point
- for route `/owl.js`, it returns the owl file from `node_modules`
- other files are statically served from `/public`