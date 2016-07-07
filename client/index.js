var React = require('react');
var ReactDOM = require('react-dom');
var _=require('underscore');

// HELPER FUNCTIONS
function parseTime() {
	// too simple, renders choppy
	return '#'+(Date.now().toString(16).toUpperCase().slice(-7,-1))
}
function getHL(now) {
	var H = Math.floor((now/10)%1000)/1000
	var L = Math.floor((now/1000)%100)/100
	return [H,L]
}
function smoothParse(hue,lit) {
	var H = hue
	var L = lit
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
			<a className="secondary button index" onClick={this.color}>select</a>
			<a className="secondary button index" onClick={this.color}>random</a>
			<a className="secondary button index">palette</a>
		</div>
	}
})
// COLOR PAGES
var ColorTimePage = React.createClass({
	getInitialState: function() {
    return {
    	'chroma': [0,0,0],
    	'palette': [],
    	'windowX': window.innerWidth,
    	'windowY': window.innerHeight,
    	'paused': false,
    	'pauseStart': 0,
    	'pauseTime': 0,
    	'showAdd': false
    };
  },
  handleResize: function(e) {
    this.setState({
    	windowX: window.innerWidth,
    	windowY: window.innerHeight,
    });
  },
  handleMouse: function(e) {
  	if (!this.state.paused)
  	this.setState({'chroma':smoothParse(e.clientX/this.state.windowX, e.clientY/this.state.windowY)})
  },
	click: function() {
		if (this.state.paused) {
			this.setState({'pauseTime' : Date.now()-this.state.pauseStart})
		} else {
			var HL = getHL(Date.now()-this.state.pauseTime)
			this.setState({'chroma':smoothParse(HL[0],HL[1])})
		}
	},
	pause: function() {
		this.setState({
			'paused': !this.state.paused,
			'pauseStart': Date.now(),
			'showAdd' : !this.state.showAdd,
		})
	},
	random: function() {
		this.setState({'chroma':[Math.floor(Math.random()*255),Math.floor(Math.random()*255),Math.floor(Math.random()*255)]})
	},
	save: function() {
		console.log('saved') // not completed
	},
	home: function() {
		this.componentWillUnmount()
		ReactDOM.render(<InitailPage/>,document.getElementById('root'))
	},
	componentDidMount: function() {
		window.addEventListener('resize', this.handleResize) 
		if (this.props.page === 'select') {
			console.log('attaching mouse....')
			window.addEventListener('onClick', this.handleMouse)
		}
		if (this.props.page === 'time')
			setInterval(this.click,10)
	},
	componentWillUnmount: function() {
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('onClick', this.handleMouse);
  },
	render: function() {
		var h1c = '#ffffff'
		if (lightEnuf(this.state.chroma)) 
			h1c = '#2e2e2e'

		var smallTitle = <h1 id="color" style={{'color':h1c}}>{toRGB(this.state.chroma)}</h1>
		
		var header = <header>
      <i className='fi-home' style={{'color':h1c}} onClick={this.home}></i>
    </header>

		if (this.props.page ==='time') {
			return <div id="canvas" onClick={this.pause} 
					style={{'backgroundColor':toRGB(this.state.chroma)}}>
					{header}
					<div>
						<i className="fi-plus" style={{'color':h1c,'display': (this.state.showAdd ? 'block' : 'none')}}/>
						{smallTitle}
					</div>
				</div>

		} else if (this.props.page ==='random') {
			return <div> {header}
				<div id="canvas" onClick={this.random} 
					style={{'backgroundColor':toRGB(this.state.chroma)}}>
					<div>
						<i className="fi-plus" style={{'color':h1c}}/>
						{smallTitle}
					</div>
				</div>
			</div>

		} else if (this.props.page === 'select') {
			return <div> {header}
				<div id="canvas" onClick={this.save} onMouseMove={this.handleMouse}
					style={{'backgroundColor':toRGB(this.state.chroma)}}>
					{smallTitle}
				</div>;	
			</div>		
		}
	}
});

ReactDOM.render(<InitailPage/>,document.getElementById('root'));