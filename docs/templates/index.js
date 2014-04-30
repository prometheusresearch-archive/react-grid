/**
 * @jsx React.DOM
 */

var React   = require('react');
var Page    = require('./page');
var Section = require('./Section');
var Column  = require('./Column');
var Code    = require('./Code');

var reactVersion = require('react/package.json').version;

var StandaloneUsage = React.createClass({

  render: function() {
    return (
      <div className="Usage container">
        <Section>
          <h3>Getting started</h3>
          <p>
            We provide a standalone build of React Grid which can be included in your application using <code>{`<script>`}</code> element or loaded using an AMD loader similar to <a href="http://requirejs.org">RequireJS</a>. Alternatively you might want to use React Grid within a CommonJS module system, see instructions below on that.
          </p>
        </Section>
        <Section>
          <Column className="Text">
            <h4>1. Include scripts</h4>
            <p>
              You need to include <code>react-with-addons.js</code> build of React as well as <code>react-grid.js</code> itself.
            </p>
          </Column>
          <Column className="Example">
            <Code>{`
              <script src="JSXTransformer.js"></script>

              <script src="react-with-addons.js"></script>
              <script src="react-grid.js"></script>
              `}
            </Code>
          </Column>
        </Section>
      </div>
    );
  }
});

var CommonJSUsage = React.createClass({

  render: function() {
    return (
      <div className="Usage container">
        <Section>
          <h3>Getting started with CommonJS</h3>
          <p>
            For those who prefer working with CommonJS we provide <code>react-grid</code> npm package which exports React Grid functionality as a set of CommonJS modules.
          </p>
        </Section>
        <Section>
          <Column className="Text">
            <h4>1. Install via npm</h4>
            <p>
              You need both <code>react</code> and <code>react-grid</code> packages installed via npm. Also <code>browserify</code> and <code>reactify</code> help your code to be compiled for browser.
            </p>
          </Column>
          <Column className="Example">
            <Code>{`
              % npm install react react-grid
              % npm install browserify reactify
              `}
            </Code>
          </Column>
        </Section>
        <Section>
          <Column className="Text">
            <h4>2. Require React and React Grid</h4>
            <p>
              Both React and React Grid now can be brought into scope using CommonJS <code>require()</code> function.
            </p>
          </Column>
          <Column className="Example">
            <Code>{`
              /** @jsx React.DOM */

              var React     = require('react')
              var ReactGrid = require('react-grid')
              `}
            </Code>
          </Column>
        </Section>
        <Section>
          <Column className="Text">
            <h4>3. Bundle your application</h4>
            <p>
              To serve your application to browser you must bundle all modules together first.
            </p>
          </Column>
          <Column className="Example">
            <Code>{`
              % browserify -t reactify ./main.js > bundle.js
              `}
            </Code>
          </Column>
        </Section>
      </div>
    );
  }
});

var Index = React.createClass({

  render: function() {
    return this.transferPropsTo(
      <Page className="Index">
        <div className="HeaderWrapper">
          <div className="Header container">
            <h1>React Grid</h1>
            <p>
              React Grid component <a href="http://facebook.github.io/react">React</a>.
            </p>
          </div>
        </div>
        <div className="container">
          <h3>Features</h3>
          <p>
            React Grid component provides a basis for implementing grids with custom behaviours and appearance. It tries to have just a minimum feature set and parametrize over row, cell and header renderers so one can replace any part of the grid with their own custom implementations with no hassle.
          </p>
          <p>
            In fact, implementing sortable behaviour and grid which lazily loads data from remote data source can be done in under 100 lines of code.
          </p>
          <p>
            React Grid implements <strong>virtual scrolling</strong> — at any given moment it renders only a visible part of the dataset. That allows to use React Grid to visualize large datasets without putting a pressure on browser internals.
          </p>
          <p>
            Other notably features are <strong>locked columns</strong> and <strong>resizeable columns</strong>.
          </p>
        </div>
        <StandaloneUsage />
        <CommonJSUsage />
        <div className="Development container">
          <Section>
            <h3>Development</h3>
            <p>
              Development of React Grid library takes place at <a href="https://github.com/prometheusresearch/react-grid">prometheusresearch/react-grid</a> repository. If you found a bug, please submit an <a href="https://github.com/prometheusresearch/react-grid/issues">issue</a> or better open a pull request.
            </p>
          </Section>
        </div>
        <div className="Footer container">
          <Section>
            <p>
              React Grid is free software created by <a href="http://prometheusresearch.com">Prometheus Research, LLC</a> and is released under the MIT license.
            </p>
          </Section>
        </div>
      </Page>
    );
  }
});

module.exports = Index;
