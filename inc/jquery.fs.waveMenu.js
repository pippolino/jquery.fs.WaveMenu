/*!
* jQuery waveMenu plugin v1.2.1
* http://github.com/pippolino/jquery.fs.WaveMenu
*
*    Usage:
*    $('#menu').fsWaveMenu({scale: 100, beginningScale: 70});
*
*    Options:
*    scale: scale for element when mouse over (default is 120)
*    beginningScale: beginning scale for all elements (default is 100)
*    neighborsScale: scale for mouse over element's neighbors (default is the beginning scale)
*    rememberSelected: if true remeber last selected element (default true)
*    noWrap: if true set nowrap to menu on init (default true)
*    defaultSelectedClass: class for default element selected
*
*    webkit fix from Paul Irish. thx!
*    hidden menu fix from ben-lin (ben). tnx!
*
*    TODO:
*    - callbackFunction
*/
;(function($, undefined) {
'use strict';

	//Wave Menu Animation
	function FsWaveMenu(el, options) {
        this.name = "jquery.fs.WaveMenu";
        this.version = "1.2.1";

		//Defaults:
		this.defaults = {
			scale: 120,
            beginningScale: 100,
            neighborsScale: 100,
            rememberSelected: true,
            noWrap: true,
            defaultSelectedClass: "waveMenuDefaultSelected"
		};

		//Extending options:
		this.opts = $.extend({}, this.defaults, options);
        this.opts.neighborsScale = options.neighborsScale ? options.neighborsScale : this.opts.beginningScale;

		//Privates:
		this.$el = $(el);
        this.imagesReady = false;

        this.BLANK = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
	}

	// Separate functionality from object creation
	FsWaveMenu.prototype = {

		init: function() {
			var self = this;
            var isBeginningScaled = self.opts.beginningScale == 100;

            // Hide menu if intial scale is different than 100s
            if(!isBeginningScaled) {
                self.$el.hide();
            }

            // Preload Images if Need for calc dimensions
            if(!self.imagesReady) {
                self.preloadImages();
                return;
            }

            if(self.opts.noWrap) {
                self.$el.css("white-space", "nowrap")
            }

            // Scale item selected when leave the menu
            if(self.opts.rememberSelected) {
                self.$el.mouseleave(function() {
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
                kid.mouseenter(function() {
                    // First restore selected
                    if(self.opts.rememberSelected) {
                        var item = $("[waveSelected]", self.$el).removeClass("waveMenuSelected");
                        if(kid.get(0) != item.get(0)) {
                            self.restoreScaleElementAndChildren(item, {stop: true});
                        }
                    }

                    // Scale item on hover
                    self.scaleElementAndChildren(kid.addClass("waveMenuOver"), {stop: true});
                    // Scale neighbors
                    if( self.opts.neighborsScale != self.opts.beginningScale) {
                        self.scaleElementAndChildren(kid.prev().addClass("waveMenuNeighborsOver"), {stop: true, scale: self.opts.neighborsScale});
                        self.scaleElementAndChildren(kid.next().addClass("waveMenuNeighborsOver"), {stop: true, scale: self.opts.neighborsScale});
                    }
                });
                kid.mouseleave(function() {
                    kid.removeClass("waveMenuOver");
                    if(!self.opts.rememberSelected || (self.opts.rememberSelected && !kid.attr("waveSelected"))) {
                        self.restoreScaleElementAndChildren(kid, {stop: true});
                    }

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

            // Show menu if hidden
            self.$el.fadeIn();
		},

        preloadImages: function() {
            var self = this;
            if(!self.imagesReady) {
               self.imagesLoaded($("img", self.$el), function($images, $proper, $broken) {
                    $images.each(function() {
                        //var dim = {width: this.width, height: this.height}; // Note: $(this).width() will not work for in memory images.
                        var dim = {width: self.actual($(this), 'width', { absolute : true } ), height: self.actual($(this), 'height', { absolute : true } )};
                        self.getOriginalDimension(this, {force: true, dimension: dim});
                    });
                    self.imagesReady = true;
                    self.init();
                });
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
                    fontSize: parseInt(original.fontSize * sc) + "px"
                }, duration, callback);
            }
            return self;
        },

        scaleElementAndChildren: function(el, opt) {
            var self = this;
            var scale = opt.scale ? opt.scale : false;
            var stop = opt.stop ? opt.stop : false;
            var duration = (opt.duration === undefined) ? {} : {duration: opt.duration};
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

        getOriginalDimension: function(el, opt) {
            var opt =  $.extend({}, {}, opt);
            var self = $(el);
            var oriObj = self.data("waveMenuData");
            if(!oriObj || opt.force) {
                var dim = opt.dimension ? opt.dimension : this.getElementDimension(self);
                oriObj = {
                    width: dim.width,
                    height: dim.height,
                    fontSize: parseInt(self.css("font-size"))
                };
                self.data("waveMenuData", oriObj); // Save original
            }
            return oriObj;
        },

        restoreScaleElementAndChildren: function(el, opt) {
            if($(el).length) {
                var self = this;
                var stop = opt.stop ? opt.stop : false;
                self.scale(stop ? el.stop(true, true) : el, self.opts.beginningScale).children().each(function() {
                    self.scale(stop ? $(this).stop(true, true): $(this), self.opts.beginningScale);
                });
            }
        },

        // Restore Initial Scale
        restoreScale: function(el) {
            return this.resize($(el), this.opts.beginningScale);
        },

        getElementDimension: function(el) {
            var self = this;
            //return {width: el.width, height: el.height()};
            return {width: self.actual($(el), 'width', { absolute : true } ), height: self.actual($(el), 'height', { absolute : true } )};
        },

        // Images Loaded tnks to Paul Irish
        imagesLoaded: function($obj, callback ) {
            var self = this,
                $this = $obj,
                deferred = $.isFunction($.Deferred) ? $.Deferred() : 0,
                hasNotify = $.isFunction(deferred.notify),
                $images = $this.find('img').add( $this.filter('img') ),
                loaded = [],
                proper = [],
                broken = [];

            function doneLoading() {
                var $proper = $(proper),
                    $broken = $(broken);

                if ( deferred ) {
                    if ( broken.length ) {
                        deferred.reject( $images, $proper, $broken );
                    } else {
                        deferred.resolve( $images );
                    }
                }

                if ( $.isFunction( callback ) ) {
                    callback.call( $this, $images, $proper, $broken );
                }
            }

            function imgLoaded( img, isBroken ) {
                // don't proceed if BLANK image, or image is already loaded
                if ( img.src === self.BLANK || $.inArray( img, loaded ) !== -1 ) {
                    return;
                }

                // store element in loaded images array
                loaded.push( img );

                // keep track of broken and properly loaded images
                if ( isBroken ) {
                    broken.push( img );
                } else {
                    proper.push( img );
                }

                // cache image and its state for future calls
                $.data( img, 'imagesLoaded', { isBroken: isBroken, src: img.src } );

                // trigger deferred progress method if present
                if ( hasNotify ) {
                    deferred.notifyWith( $(img), [ isBroken, $images, $(proper), $(broken) ] );
                }

                // call doneLoading and clean listeners if all images are loaded
                if ( $images.length === loaded.length ){
                    setTimeout( doneLoading );
                    $images.unbind( '.imagesLoaded' );
                }
            }

            // if no images, trigger immediately
            if ( !$images.length ) {
                doneLoading();
            } else {
                $images.bind( 'load.imagesLoaded error.imagesLoaded', function( event ){
                    // trigger imgLoaded
                    imgLoaded( event.target, event.type === 'error' );
                }).each( function( i, el ) {
                        var src = el.src;

                        // find out if this image has been already checked for status
                        // if it was, and src has not changed, call imgLoaded on it
                        var cached = $.data( el, 'imagesLoaded' );
                        if ( cached && cached.src === src ) {
                            imgLoaded( el, cached.isBroken );
                            return;
                        }

                        // if complete is true and browser supports natural sizes, try
                        // to check for image status manually
                        if ( el.complete && el.naturalWidth !== undefined ) {
                            imgLoaded( el, el.naturalWidth === 0 || el.naturalHeight === 0 );
                            return;
                        }

                        // cached images don't fire load sometimes, so we reset src, but only when
                        // dealing with IE, or image is complete (loaded) and failed manual check
                        // webkit hack from http://groups.google.com/group/jquery-dev/browse_thread/thread/eee6ab7b2da50e1f
                        if ( el.readyState || el.complete ) {
                            el.src = self.BLANK;
                            el.src = src;
                        }
                    });
            }

            return deferred ? deferred.promise( $this ) : $this;
        },


        // Actual dimension from ben-lin (ben). tnx!
        actual : function(obj, method, options ){
            var $hidden, $target, configs, css, tmp, actual, fix, restore;

            $target = obj;

            configs = $.extend({
                absolute : false,
                clone : false,
                includeMargin : undefined
            }, options );



            if( configs.clone === true ){
                fix = function(){
                    // this is useful with css3pie
                    $target = $target.filter( ':first' ).clone().css({
                        position : 'absolute',
                        top : -1000
                    }).appendTo( 'body' );
                };

                restore = function(){
                    // remove DOM element after getting the width
                    $target.remove();
                };
            }else{
                fix = function(){
                    // get all hidden parents
                    $hidden = $target.parents().andSelf().filter( ':hidden' );

                    css = configs.absolute === true ?
                    { position : 'absolute', visibility: 'hidden', display: 'block' } :
                    { visibility: 'hidden', display: 'block' };

                    tmp = [];

                    // save the origin style props
                    // set the hidden el css to be got the actual value later
                    $hidden.each( function(){
                        var _tmp = {}, name;
                        for( name in css ){
                            // save current style
                            _tmp[ name ] = this.style[ name ];
                            // set current style to proper css style
                            this.style[ name ] = css[ name ];
                        }
                        tmp.push( _tmp );
                    });
                };

                restore = function(){
                    // restore origin style values
                    $hidden.each( function( i ){
                        var _tmp = tmp[ i ], name;
                        for( name in css ){
                            this.style[ name ] = _tmp[ name ];
                        }
                    });
                };
            }

            fix();
            // get the actual value with user specific methed
            // it can be 'width', 'height', 'outerWidth', 'innerWidth'... etc
            // configs.includeMargin only works for 'outerWidth' and 'outerHeight'
            actual = /(outer)/g.test( method ) ?
                $target[ method ]( configs.includeMargin ) :
                $target[ method ]();

            restore();
            // IMPORTANT, this plugin only return the value of the first element
            return actual;
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