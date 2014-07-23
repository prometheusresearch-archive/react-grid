# React Grid

Data grid for [React](http://facebook.github.io/react)


## Getting started
0. you'll need node, and an editor. Till visual studio does JSX, we think Atom.io is the best, so if you dont already, grab them:
 
		choco install atom
		choco install node
		git clone https://github.com/adazzle/react-grid *in the root directory you want your files in*

1. You'll also need Gulp which will perform build tasks such as jsx compilation (specified in gulpfile.js) - Go get it:
		
		npm install -g gulp
		npm install --save-dev gulp 

2. Install Project Dependencies from package.json file 
		
		npm install

3. Run gulp. It compiles your jsx, jshint, packs your scripts up, and fires up a local webserver and opens the start page
		
		gulp
	
Have a look in the gulpfile for other commands or add your own

## Credits

React Grid is forked from  [Prometheus Research](http://prometheusresearch.github.io/react-grid)
This version is creqted by [adazzle](https://www.adazzle.com) and released under the [MIT](licence.txt).

For more details, see the [React docs](http://facebook.github.io/react/), especially [thinking in react](http://facebook.github.io/react/docs/thinking-in-react.html)

## Work in progress
This is still a proof of concept, there are a fair amount of [things todo](https://github.com/adazzle/react-grid/issues/5) but feel free to comment, add [an issue](https://github.com/adazzle/react-grid/issues) or submit a [pull request](https://github.com/adazzle/react-grid/pulls)
