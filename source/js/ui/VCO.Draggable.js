/*	VCO.Draggable
	VCO.Draggable allows you to add dragging capabilities to any element. Supports mobile devices too.
	TODO Enable constraints
================================================== */

VCO.Draggable = VCO.Class.extend({
	
	includes: VCO.Events,
	
	_el: {},
	
	mousedrag: {
		down:		"mousedown",
		up:			"mouseup",
		leave:		"mouseleave",
		move:		"mousemove"
	},
	
	touchdrag: {
		down:		"touchstart",
		up:			"touchend",
		leave:		"mouseleave",
		move:		"touchmove"
	},

	initialize: function (drag_elem, options, move_elem) {
		
		// DOM ELements 
		this._el = {
			drag: drag_elem,
			move: drag_elem
		};
		
		if (move_elem) {
			this._el.move = move_elem;
		}
		
		
		//Options
		this.options = {
			enable:	{
				x: true,
				y: true
			},
			constraint: {
				top: false,
				bottom: false,
				left: false,
				right: false
			},
			momentum_multiplier: 	2000,
			duration: 				1000,
			ease: 					VCO.Ease.easeInOutQuint
		};
		
		
		// Animation Object
		this.animator = null;
		
		// Drag Event Type
		this.dragevent = this.mousedrag;
		
		if (VCO.Browser.touch) {
			this.dragevent = this.touchdrag;
		}
		
		// Draggable Data
		this.data = {
			sliding:		false,
			direction: 		"none",
			pagex: {
				start:		0,
				end:		0
			},
			pagey: {
				start:		0,
				end:		0
			},
			pos: {
				start: {
					x: 0,
					y:0
				},
				end: {
					x: 0,
					y:0
				}
			},
			new_pos: {
				x: 0,
				y: 0
			},
			new_pos_parent: {
				x: 0,
				y: 0
			},
			time: {
				start:		0,
				end:		0
			},
			touch:			false
		};
		
		// Merge Data and Options
		VCO.Util.mergeData(this.options, options);
		
		
	},
	
	enable: function(e) {
		// Temporarily disableing this until I have time to fix some issues.
		//VCO.DomEvent.addListener(this._el.drag, this.dragevent.down, this._onDragStart, this);
		//VCO.DomEvent.addListener(this._el.drag, this.dragevent.up, this._onDragEnd, this);
		
		this.data.pos.start = VCO.Dom.getPosition(this._el.move);
		this._el.move.style.left = this.data.pos.start.x + "px";
		this._el.move.style.top = this.data.pos.start.y + "px";
		this._el.move.style.position = "absolute";
		//this._el.move.style.zIndex = "11";
		//this._el.move.style.cursor = "move";
	},
	
	disable: function() {
		VCO.DomEvent.removeListener(this._el.drag, this.dragevent.down, this._onDragStart, this);
		VCO.DomEvent.removeListener(this._el.drag, this.dragevent.up, this._onDragEnd, this);
	},
	
	stopMomentum: function() {
		if (this.animator) {
			this.animator.stop();
		}

	},
	
	updateConstraint: function(c) {
		this.options.constraint = c;
		
		// Temporary until issues are fixed
		
	},
	
	/*	Private Methods
	================================================== */
	_onDragStart: function(e) {
		if (VCO.Browser.touch) {
			if (e.originalEvent) {
				this.data.pagex.start = e.originalEvent.touches[0].screenX;
				this.data.pagey.start = e.originalEvent.touches[0].screenY;
			} else {
				this.data.pagex.start = e.targetTouches[0].screenX;
				this.data.pagey.start = e.targetTouches[0].screenY;
			}
		} else {
			this.data.pagex.start = e.pageX;
			this.data.pagey.start = e.pageY;
		}
		
		// Center element to finger or mouse
		if (this.options.enable.x) {
			this._el.move.style.left = this.data.pagex.start - (this._el.move.offsetWidth / 2) + "px";
		}
		
		if (this.options.enable.y) {
			this._el.move.style.top = this.data.pagey.start - (this._el.move.offsetHeight / 2) + "px";
		}
		
		this.data.pos.start = VCO.Dom.getPosition(this._el.drag);
		this.data.time.start = new Date().getTime();
		
		this.fire("dragstart", this.data);
		VCO.DomEvent.addListener(this._el.drag, this.dragevent.move, this._onDragMove, this);
		VCO.DomEvent.addListener(this._el.drag, this.dragevent.leave, this._onDragEnd, this);
	},
	
	_onDragEnd: function(e) {
		this.data.sliding = false;
		VCO.DomEvent.removeListener(this._el.drag, this.dragevent.move, this._onDragMove, this);
		VCO.DomEvent.removeListener(this._el.drag, this.dragevent.leave, this._onDragEnd, this);
		this.fire("dragend", this.data);
		
		//  momentum
		this._momentum();
	},
	
	_onDragMove: function(e) {
		e.preventDefault();
		this.data.sliding = true;
		
		if (VCO.Browser.touch) {
			if (e.originalEvent) {
				this.data.pagex.end = e.originalEvent.touches[0].screenX;
				this.data.pagey.end = e.originalEvent.touches[0].screenY;
			} else {
				this.data.pagex.end = e.targetTouches[0].screenX;
				this.data.pagey.end = e.targetTouches[0].screenY;
			}

		} else {
			this.data.pagex.end = e.pageX;
			this.data.pagey.end = e.pageY;
		}
		
		this.data.pos.end = VCO.Dom.getPosition(this._el.drag);
		this.data.new_pos.x = -(this.data.pagex.start - this.data.pagex.end - this.data.pos.start.x)//-(this.data.pagex.start - this.data.pagex.end - this.data.pos.end.x);
		this.data.new_pos.y = -(this.data.pagey.start - this.data.pagey.end - this.data.pos.start.y );
		
		if (this.options.enable.x) {
			this._el.move.style.left = this.data.new_pos.x + "px";
		}
		
		if (this.options.enable.y) {
			this._el.move.style.top = this.data.new_pos.y + "px";
		}
		
		this.fire("dragmove", this.data);
	},
	
	_momentum: function() {
		var pos_adjust = {
				x: 0,
				y: 0,
				time: 0
			},
			pos_change = {
				x: 0,
				y: 0,
				time: 0
			},
			swipe = false,
			swipe_direction = "";
		
		
		if (VCO.Browser.touch) {
			//this.options.momentum_multiplier = this.options.momentum_multiplier * 2;
		}
		
		pos_adjust.time = (new Date().getTime() - this.data.time.start) * 10;
		pos_change.time = (new Date().getTime() - this.data.time.start) * 10;
		
		pos_change.x = this.options.momentum_multiplier * (Math.abs(this.data.pagex.end) - Math.abs(this.data.pagex.start));
		pos_change.y = this.options.momentum_multiplier * (Math.abs(this.data.pagey.end) - Math.abs(this.data.pagey.start));
		
		pos_adjust.x = Math.round(pos_change.x / pos_change.time);
		pos_adjust.y = Math.round(pos_change.y / pos_change.time);
		
		this.data.new_pos.x = Math.min(this.data.pos.end.x + pos_adjust.x);
		this.data.new_pos.y = Math.min(this.data.pos.end.y + pos_adjust.y);

		
		if (!this.options.enable.x) {
			this.data.new_pos.x = this.data.pos.start.x;
		} else if (this.data.new_pos.x < 0) {
			this.data.new_pos.x = 0;
		}
		
		if (!this.options.enable.y) {
			this.data.new_pos.y = this.data.pos.start.y;
		} else if (this.data.new_pos.y < 0) {
			this.data.new_pos.y = 0;
		}
		
		// Detect Swipe
		if (pos_change.time < 3000) {
			swipe = true;
		}
		
		// Detect Direction
		if (Math.abs(pos_change.x) > 10000) {
			this.data.direction = "left";
			if (pos_change.x > 0) {
				this.data.direction = "right";
			}
		}
		// Detect Swipe
		if (Math.abs(pos_change.y) > 10000) {
			this.data.direction = "up";
			if (pos_change.y > 0) {
				this.data.direction = "down";
			}
		}
		this._animateMomentum();
		if (swipe) {
			this.fire("swipe_" + this.data.direction, this.data);
		}
		
	},
	
	
	_animateMomentum: function() {
		var pos = {
			x: this.data.new_pos.x,
			y: this.data.new_pos.y
		}
		
		if (this.options.constraint.top || this.options.constraint.bottom) {
			if (pos.y > this.options.constraint.bottom) {
				pos.y = this.options.constraint.bottom;
			} else if (pos.y < this.options.constraint.top) {
				pos.y = this.options.constraint.top;
			}
		}
		
		if (this.options.constraint.left || this.options.constraint.right) {
			if (pos.x > this.options.constraint.left) {
				pos.x = this.options.constraint.left;
			} else if (pos.x < this.options.constraint.right) {
				pos.x = this.options.constraint.right;
			}
		}
		
		//trace(this._el.move.offsetParent);
		//trace("this._el.move.offsetTop " + this._el.move.offsetTop);
		//trace("pos.y " + pos.y);
		//trace("this._el.move.offsetTop - pos.y " + (this._el.move.offsetTop - pos.y));
		this.animator = VCO.Animate(this._el.move, {
			left: 		Math.floor(pos.x) + "px",
			top: 		Math.floor(pos.y) + "px",
			duration: 	this.options.duration,
			easing: 	VCO.Ease.easeOutStrong
		});
		this.fire("momentum", this.data);
	}
});
