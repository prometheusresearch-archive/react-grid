# React Grid

Data grid for [React](http://facebook.github.io/react)


## Getting started
0. you'll need node, and an editor. Till visual studio does JSX, we think Atom.io is the best, so if you dont already, grab them:

		choco install atom
		choco install nodejs.install *if typing npm gives you an error*
		git clone https://github.com/prometheusresearch/react-grid *in the root directory you want your files in*
		cd .\react-grid

1. You'll also need Gulp which will perform build tasks such as jsx compilation (specified in gulpfile.js) - Go get it:

		npm install -g gulp
		npm install --save-dev gulp

2. Install Project Dependencies from package.json file

		npm install

3. Run gulp. It compiles your jsx, jshint, packs your scripts up, and fires up a local webserver and opens the start page

		gulp

Have a look in the gulpfile for other commands or add your own

## Credits

React Grid is from  [Prometheus Research](http://prometheusresearch.github.io/react-grid) and there are some [good examples](http://prometheusresearch.github.io/react-grid/examples/locked-columns.html)
Contributions from [adazzle](https://www.adazzle.com)
It is released under the [MIT](LICENCE).

For more details, see the [React docs](http://facebook.github.io/react/), especially [thinking in react](http://facebook.github.io/react/docs/thinking-in-react.html)

## Work in progress
This is still a work in progress but feel free to comment, add [an issue](https://github.com/prometheusresearch/react-grid/issues) or submit a [pull request](https://github.com/prometheusresearch/react-grid/pulls)
