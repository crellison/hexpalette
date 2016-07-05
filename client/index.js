var React = require('react');
var ReactDOM = require('react-dom');

function parseTime() {
	return '#'+(Date.now().toString(16).toUpperCase().slice(-7,-1))
}
function lightEnuf(color) {
	color = color.split('')
	if (color[1]==='f'||color[3]==='f'||color[5]==='f') return true
	return false
}

var ColorPage = React.createClass({
	getInitialState: function() {
    return {'chroma': parseTime()};
  },
	click: function() {
		this.setState({'chroma':parseTime()})
		console.log('current: ',this.state.chroma)
	},
	componentDidMount: function() {
		console.log('called')
		setInterval(this.click,25)
	},
	render: function() {
		var h1c = '#ffffff'
		if (lightEnuf(this.state.chroma)) 
			h1c = '#2e2e2e'
		return <div id="canvas" onClick={this.click} 
			style={{'backgroundColor':this.state.chroma}}>
			<h1 id="color" style={{'color':h1c}}>{this.state.chroma}</h1>
		</div>;
	}
});

ReactDOM.render(<ColorPage/>,
								document.getElementById('root'));