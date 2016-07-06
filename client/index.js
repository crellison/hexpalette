var React = require('react');
var ReactDOM = require('react-dom');
var _=require('underscore');

// HELPER FUNCTIONS
function parseTime() {
	// return 
	return '#'+(Date.now().toString(16).toUpperCase().slice(-7,-1))
}
function lightEnuf(color) {
	color = color.split('')
	if (color[1]==='f'||color[3]==='f'||color[5]==='f') return true
	return false
}

// INITIAL PAGE
var InitailPage = React.createClass({
	color: function(arg) {
		ReactDOM.render(<ColorTimePage page={arg.target.text}/>,document.getElementById('root'))
	},
	render: function() {
		return <div id="canvas" className="initial">
			<a className="secondary button index" onClick={this.color}>time</a>
			<a className="secondary button index">select</a>
			<a className="secondary button index">random</a>
			<a className="secondary button index">palette</a>
		</div>
	}
})
// COLOR PAGES
var ColorTimePage = React.createClass({
	getInitialState: function() {
    return {
    	'chroma': parseTime(),
    	'palette': []
    };
  },
	click: function() {
		this.setState({'chroma':parseTime()})
		// console.log('current: ',this.state.chroma)
	},
	componentDidMount: function() {
		console.log('called')
		setInterval(this.click,25)
	},
	render: function() {
		if (this.props.page ==='time') {
			var h1c = '#ffffff'
			if (lightEnuf(this.state.chroma)) 
				h1c = '#2e2e2e'
			return <div id="canvas" onClick={this.click} 
				style={{'backgroundColor':this.state.chroma}}>
				<h1 id="color" style={{'color':h1c}}>{this.state.chroma}</h1>
			</div>;
		}
	}
});

ReactDOM.render(<InitailPage/>,document.getElementById('root'));