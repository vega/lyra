# Lyra

Lyra is an interactive environment that enables custom visualization design without writing any code. Graphical “marks” can be bound to data fields using property drop zones; dynamically positioned using connectors; and directly moved, rotated, and resized using handles. Lyra also provides a data pipeline interface for iterative visual specification of data transformations and layout algorithms. Lyra is more expressive than interactive systems like Tableau, allowing designers to create custom visualizations comparable to hand-coded visualizations built with D3 or Processing. These visualizations can then be easily published and reused on the Web.

**This is the working branch for Lyra 2 and does not contain all functionality.** 
A deployed version of [Lyra 1 is available online](http://idl.cs.washington.edu/projects/lyra/). For more information, check out the [Lyra wiki](https://github.com/uwdata/lyra/wiki).

## Local Development

### Installation

To work on Lyra locally, you must have [node](https://nodejs.org/) and [yarn](https://yarnpkg.com/en/) installed on your computer. Download this repository with Git, then (from the command prompt or terminal) check out the `lyra2` development branch with the command

```sh
git checkout lyra2019
```

Once you are on the lyra2 branch, run

```sh
yarn install
```

to install the project's code dependencies.

Start the local webserver with the command:

```sh
yarn start
```

Lyra should now be running at [http://localhost:8080](http://localhost:8080)! This web server will auto-reload when you change the JavaScript code; manually re-building with `npm run build` should only be necessary if you update the SCSS stylesheets.
