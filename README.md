vde
===

An interactive, graphical Visualization Design Environment (VDE)


Testing
=======

First, install node dependencies in the top-level lyra folder.
```
npm install
```

Install *chrome-driver* using

```
./node_modules/protractor/bin/webdriver-manager update
```

The current test setup assumes that you have lyra running at *http://localhost/lyra/*.

The easiest way to do is to symlink your *vde/src* folder to */Library/WebServer/Documents/Lyra*
(Your default apache root folder in Mac).

Then run the test by

```./node_modules/protractor/bin/protractor debug tests```
or
```./node_modules/protractor/bin/protractor tests```
