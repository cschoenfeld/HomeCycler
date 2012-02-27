/*
	HomeCycler Javascript library.
	
	Self-contained object that allows you to create a page element which cycles through 
	multiple states, either cross-fading or sequentially fading. Extensible so that 
	other elements on the page can also be affected. See usage examples below.

	@author Charles Schoenfeld, Adams & Knight
	@version 1.0
	
	Version History:
	1.0:
		Initial Release		
	

	USAGE EXAMPLE:

	cyc = new HomeCycler({
		cycle_duration: 6000, 
		slideclass: 'hpblock', 
		mode: 'crossfade', 
		after_advance: function(oj) {
			var mc = $('main_content');
			var el = oj.slides[oj.homeslide];
			var n = el.id.split('_')[1];
			mc.setStyle('background-image: url(' + window.BASE_URL + 'images/dashbg-' + n + '.jpg);');
		}
	});
	cyc.begin();
	
	
	SIMPLER EXAMPLE:	
	cyc = new HomeCycler({
		slideclass: 'hpslide'
	});
	cyc.begin();	

*/

var HomeCycler = Class.create({
	
	// Constructor 
	initialize: function(params) {
		this.cycle_duration = (params.cycle_duration) ? params.cycle_duration : 4000;
		this.fade_speed = (params.fade_speed) ? params.fade_speed : 0.4;
		this.slideclass = (params.slideclass) ? params.slideclass : 'slide';
		this.homeslide = 0;
		this.slides = $$('.'+this.slideclass);
		this.after_advance = (params.after_advance) ? params.after_advance : (function(){return true;});
		this.mode = (params.mode && params.mode == 'crossfade') ? 'crossfade' : 'sequential'; // Default to sequential
		this.auto_advance = (params.auto_advance && params.auto_advance == 'suppress') ? false : true; // Default to true
	},
	
	cycle_slides: function() {
		if (this.slides[this.homeslide + 1]) {
			// Advance to the next slide.
			this.force_slide(this.homeslide + 2);
		} else {
			// Cycle back to the first slide.
			this.force_slide(1);
		}
	}, 
	
	cycle_back: function() {
		if (this.slides[this.homeslide - 1]) {
			// Retreat to the previous slide.
			this.force_slide(this.homeslide);
		} else {
			// Cycle around to the last slide in the group.
			this.force_slide(this.slides.size());
		}
	}, 
	
	crossfade_slide: function(n) {
		var dx = n - 1;
		if (this.slides[dx]) {
			// Clear the interval in progress.
			clearInterval(this.cyc);
			
			// Advance to the specified slide.
			// window.homeslide will fade away, to reveal dx.
			this.slides[this.homeslide].setStyle('z-index: 2');
			this.slides[dx].setStyle('z-index: 1; display: block; opacity: 1.0;');
			if (Prototype.Browser.IE === true) {
				// Using IE
				this.slides[this.homeslide].style.display = 'none';
				this.slides[this.homeslide].setStyle('z-index: 1');
				this.homeslide = dx;
				// If a hook function has been defined, call it here.
				if (typeof this.after_advance == 'function') { this.after_advance(this); }
			} else {
				// Not using IE
				new Effect.Opacity(this.slides[this.homeslide], {
					from: 1.0, to: 0.0, 
					duration: this.fade_speed, 
					afterFinish: (function() {
						this.slides[this.homeslide].style.display = 'none';
						this.slides[this.homeslide].setStyle('z-index: 1');
						this.homeslide = dx;
						// If a hook function has been defined, call it here.
						if (typeof this.after_advance == 'function') { this.after_advance(this); }
					}).bind(this)
				});
			}
			
			// Start a new interval.
			if (this.auto_advance !== false) {
				this.cyc = setInterval(this.cycle_slides.bind(this), this.cycle_duration);
			}
		}
		return true;
	},
	
	force_slide: function(n) {
		if (this.mode == 'crossfade') {
			return this.crossfade_slide.bind(this)(n);
		}
		var dx = n - 1;
		if (this.slides[dx]) {
			// Clear the interval in progress.
			clearInterval(this.cyc);
			
			// Advance to the specified slide.
			if (Prototype.Browser.IE === true) {
				// Using IE
				this.slides[this.homeslide].style.display = 'none';
				this.slides[dx].style.opacity = 1.0;
				this.slides[dx].style.display = 'block';
				this.homeslide = dx;
				// If a hook function has been defined, call it here.
				if (typeof this.after_advance == 'function') { this.after_advance(this); }
			} else {
				// Not using IE
				this.slides[dx].style.opacity = 0.0;
				this.slides[dx].style.display = 'block';
				new Effect.Opacity(this.slides[this.homeslide], {
					from: 1.0, to: 0.0, 
					duration: this.fade_speed, 
					afterFinish: (function() {
						this.slides[this.homeslide].style.display = 'none';
						new Effect.Opacity(this.slides[dx], {
							from: 0.0, to: 1.0, 
							duration: this.fade_speed
						});
						this.homeslide = dx;
						// If a hook function has been defined, call it here.
						if (typeof this.after_advance == 'function') { this.after_advance(this); }						
					}).bind(this)
				});
			}
			
			// Start a new interval.
			if (this.auto_advance !== false) {
				this.cyc = setInterval(this.cycle_slides.bind(this), this.cycle_duration);
			}
		}
	}, 
		
	begin: function() {
		if (this.slides.size() > 0 && this.auto_advance !== false) {
			this.cyc = setInterval(this.cycle_slides.bind(this), this.cycle_duration);
		}
	}
	
});