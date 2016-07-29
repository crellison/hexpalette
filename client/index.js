// CHECK IF CHROME FOR BROWSER COMPATABILITY
var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
// put in jQuery
if (isChrome) {
	var script = document.createElement('script');
	script.src = 'https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js';
	script.type = 'text/javascript';
	document.getElementsByTagName('head')[0].appendChild(script);

	// COPY COLOR CODES
	var clipboard = new Clipboard('.swatch');

	clipboard.on('success', function(e) {
	  	var c = e.text
	  	$('.banner h1').text('COPIED')
	  	$('.banner h1').css('color', lightEnuf(toRGB(c)) ? '#2e2e2e' : '#fff')
	  	$('.banner').css('background-color',c)
		  $('.banner').toggleClass('bannerSwung')
		  setTimeout(function() {$('.banner').toggleClass('bannerSwung')}, 600)
	});
	clipboard.on('error', function(e) {
		$('.banner h1').text('Press CTRL+C')
		$('.banner h1').css('color', lightEnuf(toRGB(c)) ? '#2e2e2e' : '#fff')
		$('.banner').css('background-color',c)
	  $('.banner').toggleClass('bannerSwung')
	  setTimeout(function() {$('.banner').toggleClass('bannerSwung')}, 600)
	  console.log("Press CTRL+C", e.text);
	});
}

var React = require('react');
var ReactDOM = require('react-dom');
var _ = require('underscore');
var fileSaver = require('file-saver')

// REGEX EXPRESSIONS
var HEX = /^(?:#)?([0-9a-f]{3})([0-9a-f]{3})?$/i
var RGB = /^(?:rgb(?:(\(|\s)))?(\d+)[^\d]{1,2}(\d+)[^\d]{1,2}(\d+)/i

// INITIAL PAGE
var InitialPage = React.createClass({
	getInitialState: function() {
		var palette = localStorage.getItem('palette')
		palette ? palette=palette.split(' ') : palette=[]
		// clearn local storage if corrupt
		_.each(palette, function(elt) {if (!HEX.test(elt)) palette=[]})
		return {
			'page': 'home',
			'palette': palette,
		}
	},
	home: function() {
		this.setState({'page' : 'home'})
	},
	color: function(arg) {
		this.setState({'page' : arg.target.text})
	},
	save: function(color) {
		if (color) this.setState({'palette': this.state.palette.concat([color])})
	},
	remove: function(e) {
		e.preventDefault()
		var color = parseColorString(e.target.parentElement.style.backgroundColor)
		var i = this.state.palette.indexOf(color)
		this.setState({'palette':this.state.palette.slice(0,i).concat(this.state.palette.slice(i+1))})
	},
	render: function() {
		localStorage.setItem('palette', this.state.palette.join(' '))
		if (this.state.page === 'home')
			return <div id="canvas" className="initial">
				<a className="secondary button index" onClick={this.color}>time</a>
				<a className="secondary button index" onClick={this.color}>select</a>
				<a className="secondary button index" onClick={this.color}>random</a>
				<a className="secondary button index" onClick={this.color}>palette</a>
				<div id="foot">
					<a className="fi-social-github" id="github" href="https://github.com/crellison/colorPage"/>
				</div>
			</div>
		else
			return <ColorPage page={this.state.page} saveColor={this.save} 
				palette={this.state.palette} home={this.home} remove={this.remove}/>
	}
})

// COLOR PAGES
var ColorPage = React.createClass({
	getInitialState: function() {
		var selected = localStorage.getItem('selected')
		selected ? selected=selected.split(' ') : selected=[]
    return {
    	'chroma': [0,0,0],
    	'windowX': window.innerWidth,
    	'windowY': window.innerHeight,
    	'paused': false,
    	'pauseStart': 0,
    	'pauseTime': 0,
    	'cumulativePause': 0,
    	'showAdd': false,
    	'interval': false,
    	'current': 'rbg(226, 226, 226)',
    	'selected': selected,
    	'input': [0,0,0]
    };
  },
  handleResize: function(e) { // resizes color window on select page
    this.setState({
    	windowX: window.innerWidth,
    	windowY: window.innerHeight,
    });
  },
  handleMouse: function(e) { // tracks mouse movement on select page
  	if (!this.state.paused)
  	this.setState({'chroma':smoothParse(e.clientX/this.state.windowX, e.clientY/this.state.windowY)})
  },
	click: function() { // handles click events to pause color change on time page
		if (this.state.paused) {
			this.setState({'pauseTime' : Date.now()-this.state.pauseStart+this.state.cumulativePause})
		} else {
			this.setState({'cumulativePause': this.state.pauseTime})
			var HL = getHL(Date.now()-this.state.cumulativePause)
			this.setState({'chroma':smoothParse(HL[0],HL[1])})
		}
	},
	pause: function() { // freezes screen on current color (select and time page)
		this.setState({
			'paused': !this.state.paused,
			'pauseStart': Date.now(),
			'showAdd': !this.state.showAdd,
		})
	},
	random: function() { // renders random color on random page
		this.setState({'showAdd':true})
		this.setState({
			'chroma':[Math.floor(Math.random()*255),Math.floor(Math.random()*255),Math.floor(Math.random()*255)]
		})
	},
	home: function() { // unmounts handlers and clears interval before returning to home screen
		this.componentWillUnmount()
		this.setState({'interval':clearInterval(this.state.interval)})
		this.props.home()
	},
	componentDidMount: function() { // adds event listeners
		// add event listeners
		window.addEventListener('resize', this.handleResize) 
		if (this.props.page === 'time') {
			this.setState({'interval' : setInterval(this.click,10)})
		}
	},
	componentWillUnmount: function() { // unmount components before unmount
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('onMouseMove', this.handleMouse);
    window.removeEventListener('onClick', this.grabColor);
  },
  grabColor: function(e) { // snags color of swatch and displays it on palette page
  	e.preventDefault()
  	this.setState({'current' : e.target.style.backgroundColor})
  	return e.target.style.backgroundColor
  },
  add: function(e) { // adds color to export scheme
  	e.preventDefault()
  	if (this.state.selected.length<7)
			this.setState({'selected': this.state.selected.concat([this.grabColor(e).replace(/ /g,'')])})
  },
  export: function() { // exports .scss doc with color names
		var expArr = ['/* Hex Palette export '+Date()+' */\n\n']
		expArr = expArr.concat(this.state.selected.map(function(elt,i) {
			return '$color'+i+': '+toHEX(elt.slice(4,-1).split(','))+'; /* '+elt+' */\n'
		}))
  	for (var i = 0; i < expArr.length; i++) {
  		// console.log(expArr[i])
  	}
  	var blob = new Blob(expArr,{'type': 'text/css;charset=utf-8'})
  	fileSaver.saveAs(blob, 'hexpalette.scss')
  },
  remove: function(e) {
  	e.preventDefault()
		var color = e.target.style.backgroundColor.replace(/ /g,'')
		var i = this.state.selected.indexOf(color)
		this.setState({'selected':this.state.selected.slice(0,i).concat(this.state.selected.slice(i+1))})
  },
  enter: function(e) {
  	// console.log('current value', e.target.value)
  	// console.log('setting input to: ',parseColorString(e.target.value))
    this.setState({'input': parseColorString(e.target.value) || [0,0,0]})
  	if(e.which === 13) {
  		e.target.value = ''
  		// console.log('current input: ',this.state.input)
  		this.props.saveColor(this.state.input)
    }
  },
  saveColor: function() {
  	// console.log(toHEX(this.state.chroma))
  	this.props.saveColor(toHEX(this.state.chroma))
  },
	render: function() {
		var h1c = '#ffffff'
		if (lightEnuf(this.state.chroma)) 
			h1c = '#2e2e2e'

		var title = <div id="title">
			<i className="fi-plus" onClick={this.saveColor} 
				style={{'color':h1c,'display': (this.state.showAdd ? 'block' : 'none')}}/>
			<h1 id="color" style={{'color':h1c}}>{toRGBString(this.state.chroma)}</h1>
		</div>
		
		var header = <header style={{'height': this.props.page==='palette' ? '50px' : '0'}}>
      <i className='fi-home' id='home' style={{'color':h1c}} onClick={this.home}></i>
    </header>

		if (this.props.page ==='time') {
			return <div id="canvas" onClick={this.pause} 
					style={{'backgroundColor':toRGBString(this.state.chroma)}}>
					{header}
					{title}
				</div>

		} else if (this.props.page ==='random') {
			return <div> {header}
				<div id="canvas" onClick={this.random} 
					style={{'backgroundColor':toRGBString(this.state.chroma)}}>
					{title}
				</div>
			</div>

		} else if (this.props.page === 'select') {
			return <div> {header}
				<div id="canvas" onClick={this.pause} onMouseMove={this.handleMouse}
					style={{'backgroundColor':toRGBString(this.state.chroma)}}>
					{title}
				</div>;	
			</div>		

		} else if (this.props.page === 'palette') {
			localStorage.setItem('selected', this.state.selected.join(' '))
			return <div id='palette' style={{'backgroundColor': '#e2e2e2'}}> 
				{isChrome? <div className="banner"><h1/></div> : null}
				{header}

				{this.state.selected.length>0 ? <a id="export" href="#" onClick={this.export}>export scss</a>	: null}
				
				<div id="swatch-container">
				<div id="saved">
					{this.state.selected.map(function(elt, i) {
						return <div key={i+elt} style={{'backgroundColor':elt}} onClick={this.remove}>
						</div>
					},this)}
				</div>
				{this.props.palette.map(function(e,i) {
					var innerColor = lightEnuf(toRGB(e)) ? '#2e2e2e' : '#fff'
					return <div key={e+i} className="swatch" style={{'backgroundColor':e}} onClick={this.grabColor} title="Copy" data-clipboard-text={e}>
							<span className="fi-trash inside-swatch" onClick={this.props.remove} style={{'backgroundColor':e, 'color' : innerColor}}/>
							<span className="fi-plus inside-swatch" onClick={this.add} style={{'backgroundColor':e, 'color' : innerColor}}/>
					</div>
				},this)}
				</div>
				<div id="add-color">
					<div id="add" onClick={function() {this.props.saveColor(this.state.input)}.bind(this)}>
						<span className="fi-plus"/>
					</div>
					<input placeholder="add RGB or HEX" onKeyUp={this.enter}/>
				</div>
				<h4 id="current-color">{this.state.current}</h4>
			</div>
		}
	}
});

// HELPER FUNCTIONS
function getHL(now) {
	var H = Math.floor((now/10)%1000)/1000
	var L = Math.floor((now/1000)%100)/100
	return [H,L]
}
function smoothParse(hue,lit) {
	var H = hue
	var L = lit
	var S = 1
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
function toRGBString(array) {
	return 'rgb('+array[0]+','+array[1]+','+array[2]+')'
}
function toRGB(hex) {
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ] : null;
}
function toHEX(array) {
	// console.log('array: ', array)
	return '#' + array.map(function(e) {
		return parseInt(e)>255 ? 'ff' : ('0'+parseInt(e).toString(16)).slice(-2)
	}).join('')
}
function lightEnuf(array) {
	return (array[0]>200 && array[1]>220) || .7<(Math.max.apply(null,array)/255+Math.min.apply(null,array)/255)/2
}
function parseColorString(color) {
	if (!color) return false
	if (RGB.test(color)) {
		color = RGB.exec(color).slice(-3)
		return toHEX(color)}
	if (HEX.test(color)) {
		color = HEX.exec(color).slice(1,3)
		return '#'.concat(_.isUndefined(color[1]) ? color[0].split('').map(function(e) {return e+e}).join('') : color[0]+color[1])
	}
}

ReactDOM.render(<InitialPage/>,document.getElementById('root'));