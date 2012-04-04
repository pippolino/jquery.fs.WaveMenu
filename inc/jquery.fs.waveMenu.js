(function($){

	//Wave Menu Animation
	function FsWaveMenu(el, options) {
        this.name = "jquery.fs.WaveMenu";
        this.version = "1.0.0";
        this.author = "Federico Soldani",

		//Defaults:
		this.defaults = {
			scale: 120,
            beginningScale: 100,
            neighborsScale: 100
		};

		//Extending options:
		this.opts = $.extend({}, this.defaults, options);
        this.opts.neighborsScale = options.neighborsScale ? options.neighborsScale : this.opts.beginningScale;

		//Privates:
		this.$el = $(el);
	}

	// Separate functionality from object creation
	FsWaveMenu.prototype = {

		init: function() {
			var self = this;
            self.$el.children().each(function() {
                var kid = $(this);
                // Set Initial Dimension
                if(self.opts.beginningScale != 100) {
                    self.scale(kid, self.opts.beginningScale).children().each(function() {
                        self.scale($(this), self.opts.beginningScale);
                    });
                }
                // Add Hover Event
                kid.hover(function() {
                    self.scale(kid.stop(true, true).addClass("waveMenuSelected")).children().each(function() {
                        self.scale($(this).stop(true, true));
                    });
                    // Scale neighbors
                    if( self.opts.neighborsScale != self.opts.beginningScale) {
                        self.scale(kid.prev().stop(true, true).addClass("waveMenuNeighborsSelected"), self.opts.neighborsScale).children().each(function() {
                            self.scale($(this).stop(true, true), self.opts.neighborsScale);
                        });
                        self.scale(kid.next().stop(true, true).addClass("waveMenuNeighborsSelected"), self.opts.neighborsScale).children().each(function() {
                            self.scale($(this).stop(true, true), self.opts.neighborsScale);
                        });
                    }
                }, function() {
                    self.restoreScale(kid.stop(true, true).removeClass("waveMenuSelected")).children().each(function() {
                        self.restoreScale($(this).stop(true, true));
                    });
                    // Restore neighbors
                    if( self.opts.neighborsScale != self.opts.beginningScale) {
                        self.restoreScale(kid.prev().stop(true, true).removeClass("waveMenuNeighborsSelected")).children().each(function() {
                            self.restoreScale($(this).stop(true, true));
                        });
                        self.restoreScale(kid.next().stop(true, true).removeClass("waveMenuNeighborsSelected")).children().each(function() {
                            self.restoreScale($(this).stop(true, true));
                        });
                    }
                });
                self.$el.show();
            });
		},

        resize: function(el, scale) {
            var self = $(el);
            var sc = parseFloat(scale / 100);
            var original = self.data("original");
            if(original) {
                return self.animate({
                    width: original.width * sc,
                    height: original.height * sc,
                    fontSize: (original.fontSize * sc) + "px"
                });
            }
            return self;
        },

        // Scale Dom elements and children
        scale: function(el, scale) {
            var self = $(el);
            var original = self.data("original");
            if(!original) {
                original = {
                    height: self.height(),
                    width: self.width(),
                    fontSize: parseInt(self.css("font-size")),
                    paddingTop: self.paddingTop,
                    paddingBottom: self.paddingBottom
                };
                self.data("original", original); // Save original
            }
            return this.resize(self, scale ? scale : this.opts.scale);
        },

        // Restore Initial Scale
        restoreScale: function(el) {
            return this.resize($(el), this.opts.beginningScale);
        }
	};

	// The actual plugin
	$.fn.fsWaveMenu = function(options) {
        return this.each(function() {
            var rev = new FsWaveMenu(this, options);
            rev.init();
            $(this).data('fsWaveMenu', rev);
        });
	};

})(jQuery);