var React = require('react');
var ReactDOM = require('react-dom');
var _=require('underscore');

// HELPER FUNCTIONS
function parseTime() {
	// too simple
	return '#'+(Date.now().toString(16).toUpperCase().slice(-7,-1))
}

function smoothParse() {
	var now = Date.now()
	var H = Math.floor((now/10)%1000)/1000
	var L = Math.floor((now/1000)%100)/100
	var S = 1
	// console.log('H: ',H)
	// console.log('L: ',L)
	var R, G, B, v2

	if (L < .5) v2 = L*(1+S)
	else 				v2 = (L+S)-(S*L)

	var v1 = 2*L-v2

	var R = Math.floor(255*H2R(v1, v2, H+(1/3)))
	var G = Math.floor(255*H2R(v1, v2, H))
	var B = Math.floor(255*H2R(v1, v2, H-(1/3)))

	return [R,G,B]
}

function H2R(v1, v2, vH) {
	if (vH<0) vH+=1
	if (vH>1) vH-=1
	if ((6*vH)<1) return (v1+(v2-v1)*6*vH)
	if ((2*vH)<1) return (v2)
	if ((3*vH)<2) return (v1+(v2-v1)*6*((2/3)-vH))
	return v1
}
function toRGB(array) {
	return 'rgb('+array[0]+','+array[1]+','+array[2]+')'
}
function lightEnuf(array) {
	return 360<_.reduce(array, function(memo, num) {return (num + memo)}, 0)
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
		this.setState({'chroma':smoothParse()})
		// console.log('current: ',this.state.chroma)
	},
	componentDidMount: function() {
		console.log('called')
		setInterval(this.click,10)
	},
	render: function() {
		if (this.props.page ==='time') {
			var h1c = '#ffffff'
			if (lightEnuf(this.state.chroma)) 
				h1c = '#2e2e2e'
			return <div id="canvas" onClick={this.click} 
				style={{'backgroundColor':toRGB(this.state.chroma)}}>
				<h1 id="color" style={{'color':h1c}}>{toRGB(this.state.chroma)}</h1>
			</div>;
		}
	}
});

ReactDOM.render(<InitailPage/>,document.getElementById('root'));