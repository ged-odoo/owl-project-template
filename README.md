# 🦉 owl-project-template 🦉

A starter template to create [owl](https://github.com/odoo/owl) projects using bun. This is only a toy (around 300 loc), not
production ready!

## Setup

To create a new project:

```bash
bun create ged-odoo/owl-project-template [destination]
cd [destination]
bun dev # to start a dev server
```

The following scripts are available:

- `bun start`: build all static assets in `dist/` and start a server in production mode 
- `bun dev` to start a dev server, loading all static assets in memory from `public/` (and with dev mode, autoreload and file watcher)
- `bun run build` to build all static assets into `dist/` folder

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
- other files are statically served from `public/` (in dev mode) or `dist/` (in prod mode)

## Configuration

Here is the list of supported keys in `app_config` key in package.json:

- `port`: the port that the server will listen to
- `public_path`: the (relative) folder containing all the static code for the application
- `build_path`: the (relative) folder that will be used as target for the build process
- `other_static_files`: a description of all additional static files available to the server.
  For example:
  ```json
  {
    "other_static_files": {
      "milligram.css": "node_modules/milligram/dist/milligram.css"
    }
  }
  ```
- `inline_css` (default: false): if true, all css files in `public_path` will be concatenated and
  injected in html page. Otherwise, a `<link href="app.css"/>` will be injected instead, and the `/app.css`
  route will return the content of all css files
- `inline_xml` (default: false): same as the css, but for all xml files