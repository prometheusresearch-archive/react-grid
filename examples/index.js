/**
 * @jsx React.DOM
 */
"use strict";

var React          = require('react/addons');

var components = [];
components.push({id:'basic', module:require('./basic') });
components.push({id:'frozen columns', module:require('./frozenCols') });

var Examples = React.createClass({
 onMenuClick: function(component) {
   this.setState({exampleToShow: component});
 },
 getInitialState: function(){
   var component =
   components.length && components[0] && typeof(components[0]) === 'function'
   ?  components[0]
   : null
   return { exampleToShow: component };
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
            <div id="exampleContainer"></div>
          </div>)
 },
});

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
    if(this.props.onClick) { this.props.onClick(this.props.module); }
  },
   render: function() {
     return (<li onClick={this.handleClick}><a href="#">{this.props.id}</a></li>);
   }

 });

 React.renderComponent(<Examples />, document.body);
