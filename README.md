# Posts

Posts is a minimalistic note-taking app with support for Markdown with Github-style task lists.

This was inspired by [Psyc](https://github.com/piyushagade/Psyc) - I like the project, but changes
to Electron and Node, as well as the original author's removal of his Firebase had made it unbuildable.

It was build from zero using React, the latest Electron, and the latest LTS-stable Node.

# Installation

Go to the [latest release](../../releases/latest) and download an appropriate package.

## Features

At present, the feature-set is limited - it's strictly notes saved locally for now.  Plans include:

* [x] Convert pasted rich text to markdown
* [x] Support checkbox lists
* [x] Add markdown-related editor interaction features
    * [x] Continue list/indent on enter
    * [x] Clear tab on backspace
    * [x] indent/outdent lines
* [x] Keep notes on top (per-note)
* [x] Colored sticky notes
    * [ ] Algorithmically work out background / foreground colors from accent
* [ ] Production build for desktop platforms
* [ ] Inline [sequence diagrams](https://bramp.github.io/js-sequence-diagrams/)
* [ ] Implement storage encryption
* [ ] Implement note security via pin
* [ ] Implement sync

I won't be copying the widget features of Psyc or the TODO implementation.  Yet.

## Structure

* src/ - Sources for the app's UI
    * icons/ - JSX SVG icons
    * Layout/ - Layout component for note windows
    * Loading/ - Simple loading spinner
    * Note/ - Most of the hard work
        * ColorPicker/ - A picker, for colors
        * MarkdownContainer/ - A container, for Markdown
        * MarkdownEditor/ - A textarea with extensions for editing Markdown
        * hooks.js, util.js - utility classes and hooks for Note
    * util/ - utility classes and hooks
    * index.css - only theme variables go here
* app/ - Sources for the backend
    * API/ - Common stuff for exposing backend work to the UI
    * Notes/ - Model for notes
    * Tray/ - Abstraction layer for the tray icon
    * features.js - Barrel for the app's "features" {init(), menuItems()}
    * ipc.js - preloaded marshaller for IPC communication
    * storage.js - promise / notification wrapper around `electron-storage`
    * main.js - app entry point

The rest of the app structure is standard "create-react-app" stuff.

## package scripts

Before any of these are run, you must run `npm init` first.

* `start` - Run the app
* `build` - Create desktop packages
    * `build:react` - Rebuild the UI
    * `build:election` - Rebuild the packages with the current built UI

