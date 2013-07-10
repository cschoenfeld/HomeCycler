/*
	HomeCycler Javascript library -- JQuery version.
	
	Self-contained object that allows you to create a page element which cycles through 
	multiple states, either cross-fading or sequentially fading. Extensible so that 
	other elements on the page can also be affected. See usage examples below.

	@author Charles Schoenfeld, Adams & Knight
	@version 1.2
	
	Version History:
	1.2:
		Added a jQuery version.
	
	1.1: 
		Added a stopCycling() function.
	
	1.0:
		Initial Release		
	

	USAGE EXAMPLE:

	cyc = new CAS.HomeCycler();
	cyc.initialize({
		cycle_duration: 6000, 
		slideclass: 'hpblock', 
		mode: 'crossfade', 
		after_advance: function(oj) {
			var mc = jQuery('#main_content');
			var el = oj.slides[oj.homeslide];
			var n = el.id.split('_')[1];
			mc.css({ 'background-image': 'url(' + window.BASE_URL + 'images/dashbg-' + n + '.jpg)' });
		}
	});
	cyc.begin();
	
	
	SIMPLER EXAMPLE:	
	cyc = new CAS.HomeCycler();
	cyc.initialize({
		slideclass: 'hpslide'
	});
	cyc.begin();	

*/

// Namespace for my helper functions.
if (!window.CAS) { window.CAS = {}; }

CAS.HomeCycler = function() {};

CAS.HomeCycler.prototype = {

	// Browser detection
	browser: {
		mozilla: /mozilla/.test(navigator.userAgent.toLowerCase()) && !/webkit/.test(navigator.userAgent.toLowerCase()), 
		webkit: /webkit/.test(navigator.userAgent.toLowerCase()), 
		opera: /opera/.test(navigator.userAgent.toLowerCase()), 
		msie: /msie/.test(navigator.userAgent.toLowerCase())
	}, 
	
	// Constructor 
	initialize: function(params) {
		this.cycle_duration = (params.cycle_duration) ? params.cycle_duration : 4000;
		this.fade_speed = (params.fade_speed) ? params.fade_speed : 400;
		this.slideclass = (params.slideclass) ? params.slideclass : 'slide';
		this.homeslide = 0;
		this.slides = jQuery('.'+this.slideclass);
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
			jQuery(this.slides[this.homeslide]).css({'z-index': 2 });
			jQuery(this.slides[dx]).css({ 'z-index': 1, 'display': 'block', 'opacity': 1.0 });
			if (this.browser.msie === true) {
				// Using IE
				jQuery(this.slides[this.homeslide]).hide().css({ 'z-index': 1 });
				this.homeslide = dx;
				// If a hook function has been defined, call it here.
				if (typeof this.after_advance == 'function') { this.after_advance(this); }
			} else {
				// Not using IE
				jQuery(this.slides[this.homeslide]).animate({ 'opacity': 0 }, {
					duration: this.fade_speed, 
					complete: jQuery.proxy(function() {
						jQuery(this.slides[this.homeslide]).hide().css({ 'z-index': 1 });
						this.homeslide = dx;
						// If a hook function has been defined, call it here.
						if (typeof this.after_advance == 'function') { this.after_advance(this); }
					}, this)
				});
			}
			
			// Start a new interval.
			if (this.auto_advance !== false) {
				this.cyc = setInterval(jQuery.proxy(this.cycle_slides, this), this.cycle_duration);
			}
		}
		return true;
	},
	
	force_slide: function(n) {
		if (this.mode == 'crossfade') {
			return jQuery.proxy(this.crossfade_slide, this)(n);
		}
		var dx = n - 1;
		if (this.slides[dx]) {
			// Clear the interval in progress.
			clearInterval(this.cyc);
			
			// Advance to the specified slide.
			if (this.browser.msie === true) {
				// Using IE
				jQuery(this.slides[this.homeslide]).hide();
				jQuery(this.slides[dx]).css({ 'opacity': 1.0 }).show();
				this.homeslide = dx;
				// If a hook function has been defined, call it here.
				if (typeof this.after_advance == 'function') { this.after_advance(this); }
			} else {
				// Not using IE
				jQuery(this.slides[dx]).css({ 'opacity': 0, 'display': 'block' });
				jQuery(this.slides[this.homeslide]).animate({ 'opacity': 0 }, {
					duration: this.fade_speed, 
					complete: jQuery.proxy(function() {
						jQuery(this.slides[this.homeslide]).hide();
						jQuery(this.slides[dx]).animate({ 'opacity': 0 }, this.fade_speed);
						this.homeslide = dx;
						// If a hook function has been defined, call it here.
						if (typeof this.after_advance == 'function') { this.after_advance(this); }						
					}, this)
				});
			}
			
			// Start a new interval.
			if (this.auto_advance !== false) {
				this.cyc = setInterval(jQuery.proxy(this.cycle_slides, this), this.cycle_duration);
			}
		}
	}, 
		
	begin: function() {
		if (this.slides.size() > 0 && this.auto_advance !== false) {
			this.cyc = setInterval(jQuery.proxy(this.cycle_slides, this), this.cycle_duration);
		}
	},
	
	stopCycling: function() {
		this.auto_advance = false;
		clearInterval(this.cyc);
	}
	
};