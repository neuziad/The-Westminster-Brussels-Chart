# The Westminster-Brussels Chart

![Preview of the app](/public/preview.gif)

## [Check it out for yourself here!](https://the-westminster-brussels-chart.onrender.com/)

## Introduction

**The Westminster-Brussels Chart** is an interactive data visualisation application that displays each Member of Parliament (or MEPs) of [the European Parliament](https://www.europarl.europa.eu/about-parliament/en) by parliamentary groups in a Westminster-style parliament chart, rendered in 3D with [WebGL](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API). The Westminster-style chart is an apportionment diagram model, often used in British media to visualise the members of the House of Commons by political party. Written in ***Three.js***, this application takes CSV data of the composition of the 10th parliamentary term of the EU parliament, organised by member states and parliamentary groups; and renders a 3D Westminster chart showing a grid of bubbles, each representing the number of seats taken by a particular EU political group.

An example of a Westminster-style chart, showing the composition of the House of Commons after the 2024 UK general election:

![Example of a Westminster-style chart, showing the composition of the House of Commons after the 2024 UK general elections](https://upload.wikimedia.org/wikipedia/commons/1/12/House_of_Commons_%282024_election%29.svg)

## Running locally

If you haven't already, you will need to install of the dependencies of this project first before running:

```bash
npm install
```

To run this application locally on your machine, simply run this command:

```bash
npx vite
```

## Building & Deployment

This project is currently hosted on [Render.com](render.com).

To create your own build, run these commands:

```bash
npm install && npm run build
```

This will install all of the necessary dependencies and build the web application with Vite.

## Extensions

There's a slight chance I won't ever get around to these but, either way, here are potential new features I would like to add to this app in the future:

- [ ] Mobile compatibility
- [ ] More comprehensive data: have each seat display individual MEPs
- [ ] Filtering seats by country
- [ ] Individual pages for each parliamentary group: explaining the ideologies and philosophies each parliamentary groups have in common and their general voting record.

This project is open-source, so if you would like to implement these features yourself, or you would like to create your own variations of the chart in 3D space, go ahead and clone the project!

## Sources

All data has been gathered from the [European Parliament's Open Data Portal](https://data.europarl.europa.eu/en/home)

## License

This project is under the MIT license.
