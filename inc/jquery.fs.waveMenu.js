/*
    Options:
    scale: scale for element when mouse over (default is 120)
    beginningScale: beginning scale for all elements (default is 100)
    neighborsScale: scale for mouse over element's neighbors (default is the beginning scale)
    rememberSelected: if true remeber last selected element (default true)
    defaultSelectedClass: class for default element selected

    TODO:
    - callbackFunction
    - hidden menu
    - images without dimension not work on chrome and safari
 */
//Optional parameter includeMargin is used when calculating outer dimensions
(function($) {

	//Wave Menu Animation
	function FsWaveMenu(el, options) {
        this.name = "jquery.fs.WaveMenu";
        this.version = "1.1.1";
        this.author = "Federico Soldani",

		//Defaults:
		this.defaults = {
			scale: 120,
            beginningScale: 100,
            neighborsScale: 100,
            rememberSelected: true,
            defaultSelectedClass: "waveMenuDefaultSelected"
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
            var isBeginningScaled = self.opts.beginningScale == 100;

            // Selected Manage
            if(self.opts.rememberSelected) {
                self.$el.hover(function() {
                    self.restoreScaleElementAndChildren($("[waveSelected]", self.$el).removeClass("waveMenuSelected"), {stop: true});
                }, function() {
                    self.scaleElementAndChildren($("[waveSelected]", self.$el).addClass("waveMenuSelected"), {stop: true});
                });
            }

            self.$el.children().each(function() {
                var kid = $(this);
                // Set Initial Dimension
                if(!isBeginningScaled) {
                    self.scaleElementAndChildren(kid, {scale: self.opts.beginningScale, duration: 0});
                }
                // Add Click Event
                if(self.opts.rememberSelected) {
                    kid.click(function() {
                        $("*", self.$el).removeAttr("waveSelected");
                        $(this).attr("waveSelected", "true");
                    });
                }
                // Add Hover Event
                kid.hover(function() {
                    self.scaleElementAndChildren(kid.addClass("waveMenuOver"), {stop: true});
                    // Scale neighbors
                    if( self.opts.neighborsScale != self.opts.beginningScale) {
                        self.scaleElementAndChildren(kid.prev().addClass("waveMenuNeighborsOver"), {stop: true, scale: self.opts.neighborsScale});
                        self.scaleElementAndChildren(kid.next().addClass("waveMenuNeighborsOver"), {stop: true, scale: self.opts.neighborsScale});
                    }
                }, function() {
                    self.restoreScaleElementAndChildren(kid.removeClass("waveMenuOver"), {stop: true});
                    // Restore neighbors
                    if( self.opts.neighborsScale != self.opts.beginningScale) {
                        self.restoreScaleElementAndChildren(kid.prev().removeClass("waveMenuNeighborsOver"), {stop: true});
                        self.restoreScaleElementAndChildren(kid.next().removeClass("waveMenuNeighborsOver"), {stop: true});
                    }
                });
            });

            // Set default Selected
            if(self.opts.rememberSelected && self.opts.defaultSelectedClass != "") {
                self.scaleElementAndChildren($("." + self.opts.defaultSelectedClass, self.$el).attr("waveSelected", "true").addClass("waveMenuSelected"), {stop: true});
            }

            // Show Menu if hidden only if beginning scale is 100%
            // otherwise is show in resize callback function
            //if(isBeginningScaled) {
            if(true) {
                self.$el.fadeIn();
            }
		},

        resize: function(el, scale, opt, callback) {
            var self = $(el);
            var sc = parseFloat(scale / 100);
            var original = this.getOriginalDimension(self);
            var duration = opt && opt.duration ? opt.duration : 400;
            if(original) {
                return self.animate({
                    width: parseFloat(original.width * sc).toFixed(2) + "px",
                    height: parseFloat(original.height * sc).toFixed(2) + "px",
                    fontSize: parseFloat(original.fontSize * sc).toFixed(2) + "px"
                }, duration, callback);
            }
            return self;
        },

        scaleElementAndChildren: function(el, opt) {
            var self = this;
            var scale = opt.scale ? opt.scale : false;
            var stop = opt.stop ? opt.stop : false;
            var duration = opt.duration ? {duration: opt.duration} : {};
            //var stop = false;
            self.scale(stop ? el.stop(true, true) : el, scale, duration).children().each(function() {
                self.scale(stop ? $(this).stop(true, true) : $(this), scale, duration);
            });
        },

        // Scale Dom elements and children
        scale: function(el, scale, opt, callback) {
            var self = $(el);
            this.getOriginalDimension(self);
            return this.resize(self, scale ? scale : this.opts.scale, opt, callback);
        },

        getOriginalDimension: function(el) {
            var self = $(el);
            var oriObj = self.data("waveMenuData");
            if(!oriObj) {
                var dim = this.getElementDimension(self);
                oriObj = {
                    height: dim.height,
                    width: dim.width,
                    fontSize: parseInt(self.css("font-size"))
                };
                self.data("waveMenuData", oriObj); // Save original
            }
            return oriObj;
        },

        restoreScaleElementAndChildren: function(el, opt) {
            var self = this;
            var stop = opt.stop ? opt.stop : false;
            //var stop = false;
            self.scale(stop ? el.stop(true, true) : el, self.opts.beginningScale).children().each(function() {
                self.scale(stop ? $(this).stop(true, true): $(this), self.opts.beginningScale);
            });
        },

        // Restore Initial Scale
        restoreScale: function(el) {
            return this.resize($(el), this.opts.beginningScale);
        },

        getElementDimension: function(el) {
            /*if($.browser.msie || $.browser.mozilla || !el.is("img")) {
                return {height: el.height(), width: el.width()};
            } else {
                // Request the remote document
                var dimension = {};
                jQuery.ajax({
                    url: el.attr("src"),
                    type: "GET",
                    dataType: "html",
                    async: false,
                    complete: function() {
                        var ele = this.get(0);
                        console.debug(this.outerHeight());
                        dimension = {height: ele.outerHeight(), width: ele.outerWidth()};
                    },
                    context: $("<img/>")
                });
                return dimension;
            }*/
            return {height: el.height(), width: el.width()};
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