# React Grid

Data grid for [React][].

## Setup
run `npm install`
You can then just run `gulp`
this will:
- compile all the jsx into js
- wrap up all the examples registered under `\examples`
- compile less -> css
- fire up a server and open a test page

## Adding examples
To add any other examples, you just need to:
1. Add a .js file under the examples folder that returns a react component by `module.exports = someNewExample`
2. in examples\index.js register this by adding `components.push({id:'Name for your component', module:require('./nameOfYourFile') });`

This will then add a new menu to teh examples.html page


## Credits

React Grid is free software created by [Prometheus Research][] and is released
under the MIT.

[React]: http://facebook.github.io/react/
[Prometheus Research, LLC]: http://prometheusresearch.com
