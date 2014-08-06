/**
 * @jsx React.DOM
 */
"use strict";

var React          = require('react/addons');

//globally expose React
//makes dev tools (among other things) work
if(window) { window.React = window.React || React; }

var components = [];
//register our component examples
//the files need to module.export a react component
components.push({id:'basic', module:require('./basic') });
components.push({id:'frozen columns', module:require('./frozenCols') });

//creates a simple nav menu and viewer
var Examples = React.createClass({
 onMenuClick: function(component) {
   this.setState({exampleToShow: component});
 },
 getInitialState: function(){
   return { exampleToShow: null };
 },
 render: function() {
   var detail =this.state.exampleToShow ? this.state.exampleToShow({}) : '';
  return (<div>
            <nav className="navbar navbar-inverse navbar-static-top" role="navigation">
              <div className="container-fluid">
                <Menu onMenuClick={this.onMenuClick} />
              </div>
            </nav>
            {detail}
          </div>)
 },
});
//loops the components and puts out a menu item, wired to pass up the component
var Menu = React.createClass({
 render: function() {
   var children = components.map((comp, idx) =>
     MenuItem({
       id: comp.id,
       module: comp.module,
       onClick: this.props.onMenuClick
     }));
   return (<ul className="nav navbar-nav">{children}</ul>);
 },
});

var MenuItem = React.createClass({
  handleClick: function() {
    if (this.props.onClick) { this.props.onClick(this.props.module); }
  },
   render: function() {
     return (<li onClick={this.handleClick}><a href="#">{this.props.id}</a></li>);
   }

 });

 React.renderComponent(<Examples />, document.body);
