/*!
 *
 * MLB Toggle Switch Plugin
 *
 * Dependencies: jQuery 1.7.1+, jQuery UI 1.8+, Modernizr ( csstransforms3d detection )
 * Version 1.0
 * Author @Cornally
 *
 *
 * Based On: jQuery UI Widget-factory plugin boilerplate (for 1.8/9+) by @addyosmani
 * 
 */

// Used to parse translate3d X value
function toggleSwitchMatrixToArray(matrix) {

    // IE 10 returns a slightly different property for transform: translate3d()
    if ( Modernizr.csstransforms3d && matrix.indexOf('matrix3d') >= 0 ){
        return matrix.substr(9, matrix.length - 10).split(', ');
    } else {
        return matrix.substr(7, matrix.length - 8).split(', ');    
    }

}

// Bind appropriate listener
function toggleSwitchPointer(event) {
    
    switch(event) {
        case 'down':
        return Modernizr.touch ? 'touchstart.toggleswitch' : 'mousedown.toggleswitch';
        case 'up':
        return Modernizr.touch ? 'touchend.toggleswitch' : 'mouseup.toggleswitch';
        case 'move':
        return Modernizr.touch ? 'touchmove.toggleswitch' : 'mousemove.toggleswitch';
    }

}

;(function ( $ ) {

    $.widget( "mlb.toggleswitch" , {

        //Options to be used as defaults
        options: {
            bSwitchState: false,
            bSwitchEnabled: true,
            bAnimate: true,
            bDisplayText: false,
            asDisplayText: [ "Off" , "On" ]
        },

        //Setup widget (eg. element creation, apply theming
        // , bind events etc.)
        _create: function () {

            // _create will automatically run the first time
            // this widget is called. Put the initial widget
            // setup code here, then you can access the element
            // on which the widget was called via this.element.
            // The options defined above can be accessed
            // via this.options this.element.addStuff();

            element = $(this.element);
            wrapper = element.parent();
            
            // Store each instance in an array.  This is helpful
            // for keeping tabs on the number of instantiated
            $.mlb.toggleswitch.instances.push(this.element);

            // Hide original <select> and apply a special class that can be
            // used to omit toggle switches from other jQuery plugin bindings,
            // like select2.  Wrap new contents in a class.
            element.hide().addClass('toggleswitch-select').wrap('<div class="toggleswitch-container">');

            // Build the fun stuff
            var newToggleContainer = element.parent();
            
            // Display text on the toggleswitch    
            if ( this.options.bDisplayText ) {

                newText = $('<div class="toggleswitch-text">');
                element.after( newText );

            }
        
            newSwitch = $('<div class="toggleswitch-switch">');
            element.after( newSwitch );
            
            // Set value to on or off state & preserve original dropdown value
            // true = "on", switch is right
            // false = "off", switch is left
            if ( this.options.bSwitchState ) {
                
                newToggleContainer.addClass('toggleswitch-state-on');
                element.val('on');
                
                if ( this.options.bDisplayText ) {
                    $('.toggleswitch-text' , wrapper).text(this.options.asDisplayText[1].trim().substring(0, 4));
                }
                
            } else {
                
                newToggleContainer.addClass('toggleswitch-state-off');
                element.val('off');
                
                if ( this.options.bDisplayText ) {
                    $('.toggleswitch-text' , wrapper).text(this.options.asDisplayText[0].trim().substring(0, 4));
                }
                
            }
            
            // Set switch to enabled or disabled
            // true = "enabled"
            // false = "disabled"
            if (this.options.bSwitchEnabled) {
                
                element.attr('disabled' , false);
                this._enableListeners(newToggleContainer);
                
            } else {
                
                newToggleContainer.addClass('toggleswitch-state-disabled');
                element.attr('disabled' , true);
                this._disableListeners(newToggleContainer);
            
            }
            
            // Set animation of toggle switch on or off.  Useful for progressive enhancement/degredation
            if (this.options.bAnimate && Modernizr.csstransforms3d) {
                
                prefix  = this._prefix();
                transform = prefix + 'transform';
                
                newToggleContainer.addClass('toggleswitch-animate');

            } else {

                newToggleContainer.addClass('toggleswitch-no-animate');

            }
        
        },
        
        // Enable the bindings of our toggle switch
        _enableListeners: function( toggleswitch ) {
          
          // One binding kicks off / binds "mousedown", "mouseup" and "mousemove" actions
            $(toggleswitch).on(toggleSwitchPointer('down') , function(e){
                
                if ( $(e.target).closest('.toggleswitch-container').hasClass('toggleswitch-animate')) {
                
                    // Starting position of pointer X
                    var startPosition = (Modernizr.touch) ? e.originalEvent.changedTouches[0].clientX : e.pageX;
                    
                    // Starting translate3d X value of switch
                    var currentPosition = toggleSwitchMatrixToArray($('.toggleswitch-switch', this).css(transform));
                    
                    // Offset position of pointer X
                    var dragOffset;
                    
                    // Final translate3d X value
                    var dragPosition
                    
                    // TODO: Establish drag boundaries dynamically based on container width
                    var minX = 0;
                    var maxX = 43;
                    
                    // Update position of switch on mousemove / touchmove
                    $(this).on(toggleSwitchPointer('move') , function(e){

                        // Stop page from scrolling while dragging switch
                        e.preventDefault();
                        e.stopPropagation();
                        
                        // Add class to indicate drag in progress
                        $(this).addClass('toggleswitch-state-drag');
                        
                        dragOffset = (Modernizr.touch) ? startPosition - e.originalEvent.changedTouches[0].clientX : startPosition - e.pageX;
                        
                        // IE returns a slightly different array for transform: translate3d()
                        // Also, IE11 removes the UA token for "MSIE", so check the length of
                        // our array as a fallback. Remove the UA sniff in the future.
                        if ( $.browser.msie || currentPosition.length > 6 ){
                            dragPosition = parseInt(currentPosition[12]) - dragOffset;
                        } else {
                            dragPosition = parseInt(currentPosition[4]) - dragOffset;    
                        }
                                            
                        // Drag boundaries
                        if (dragPosition >= maxX) {
                            dragPosition = maxX;
                        }
                        else if (dragPosition <= minX) {
                            dragPosition = minX;    
                        }
                        
                        // Update the visual state of the toggle on mousemove
                        if (dragPosition >= maxX/2){
                            $(this).removeClass('toggleswitch-state-off').addClass('toggleswitch-state-on');
                        } else {
                            $(this).removeClass('toggleswitch-state-on').addClass('toggleswitch-state-off');
                        }
                        
                        //console.log('currentPositionX: '+ currentPosition[4] + ' startPosition: ' + startPosition + ' dragOffset: ' + dragOffset + ' dragPosition: ' + dragPosition);
                        
                        // Update position during drag
                        $('.toggleswitch-switch' , this).css(transform , 'translate3d(' + dragPosition + 'px, 0, 0)');
                        
                    });
                
                }
                
                
                // Mouse up is bound on document to trap scenarios where users might
                // drag off of the original button
                
                $(document).on(toggleSwitchPointer('up') , function(e){
                
                    // Define the active switch on mouseup.  If a drag has occurred,
                    // use the dragged switch as the mouseup event may not happen
                    // over the toggleswitch container.  If clicked, use e.target
                    // because our drag class is applied on "mousemove".
                    
                    if ( dragOffset !== undefined ){
                        var activeSwitch = $('.toggleswitch-state-drag');
                    } else {
                        var activeSwitch = $(e.target).closest('.toggleswitch-container');
                    }
                
                    // Remove inline styles applied during drag
                    if ( activeSwitch.hasClass('toggleswitch-animate') ) {
                        $('.toggleswitch-switch' , activeSwitch).css(transform , '');    
                    }
                    
                    // Update the switch's state via our options to trigger the
                    // handling.  Use our dragOffset parameter to determine if
                    // the action was a "click" or a "drag"
                    
                    // Click - Set Off
                    if ( activeSwitch.hasClass('toggleswitch-state-on') && dragOffset === undefined ){
                        
                        activeSwitch.find('.toggleswitch-select').toggleswitch({ 'bSwitchState' : false });
                        
                    }
                    // Click - Set On
                    else if ( activeSwitch.hasClass('toggleswitch-state-off') && dragOffset === undefined ){
                        
                        activeSwitch.find('.toggleswitch-select').toggleswitch({ 'bSwitchState' : true });
                        
                    }
                    // Drag - Set On
                    else if( activeSwitch.hasClass('toggleswitch-state-on') && dragOffset !== undefined ){
                        
                        activeSwitch.find('.toggleswitch-select').toggleswitch({ 'bSwitchState' : true });                        
                        
                    }
                    // Drag - Set Off
                    else if ( activeSwitch.hasClass('toggleswitch-state-off') && dragOffset !== undefined ){
                        
                        activeSwitch.find('.toggleswitch-select').toggleswitch({ 'bSwitchState' : false });
                    }
                    
                    $('.toggleswitch-container').off(toggleSwitchPointer('move')).removeClass('toggleswitch-state-drag');
                    
                    $(document).off(toggleSwitchPointer('up'));
                    
                });
                
            });
          
        },
        
        // Disable the bindings of our toggle switch
        _disableListeners: function( toggleswitch ) {

            $(toggleswitch).off(toggleSwitchPointer('down'));
            $(toggleswitch).off(toggleSwitchPointer('move'), '.toggleswitch-switch');
            $(document).off(toggleSwitchPointer('up'));

        },

        // Destroy an instantiated plugin and clean up
        // modifications the widget has made to the DOM
        destroy: function () {

            // this.element.removeStuff();
            // For UI 1.8, destroy must be invoked from the
            // base widget
            $.Widget.prototype.destroy.call(this);
            // For UI 1.9, define _destroy instead and don't
            // worry about
            // calling the base widget

            // Kill plugin and show original element
            element = $(this.element);
            element.appendTo( element.parent().parent() );
            element.show();
            element.prev('.toggleswitch-container').hide();
            
            // Remove listeners
            //element.next('.toggleswitch-container')._disableListeners();

            // Remove from list of plugin instances
            $.mlb.toggleswitch.instances.pop(this.element);
        },
        
        // Respond to any changes the user makes to the option method
        _setOption: function ( key, value ) {
            
            switch (key) {
                
            case "bSwitchState":

                var toggleContainer = this.element.parent();
                var currentValue =  this.element.val();
                
                // Switch On
                if (value === true) {
                   
                    toggleContainer.removeClass('toggleswitch-state-off').addClass('toggleswitch-state-on');
                    
                    if ( this.options.bDisplayText ) {
                        $('.toggleswitch-text' , toggleContainer).text(this.options.asDisplayText[1].trim().substring(0, 4));
                    }
                    
                    // Update the original element
                    this.element.val('on').change();
                    
                }
                // Switch Off
                else if (value === false) {
                    
                    toggleContainer.removeClass('toggleswitch-state-on').addClass('toggleswitch-state-off');
    
                    if ( this.options.bDisplayText ) {
                        $('.toggleswitch-text' , toggleContainer).text(this.options.asDisplayText[0].trim().substring(0, 4));
                    }
                    
                    // Update the original element
                    this.element.val('off').change();
                    
                }
                
                // Remove inline styles applied during drag
                if ( $('.toggleswitch-switch' , toggleContainer).hasClass('toggleswitch-animate') ) {
                    $('.toggleswitch-switch' , toggleContainer).css(transform , '');    
                }
                
                // Fire event if current value changes
                if ( currentValue != this.element.val() ) {
                    this._trigger('change');    
                }
                
                break;
            
            case "bSwitchEnabled":
                
                //var toggleContainer = this.element.next('.toggleswitch-container');
                var toggleContainer = this.element.parent();
                
                // Switch Enabled
                if (value === true) {
                    
                    this.element.closest('.toggleswitch-select').attr('disabled' , false);
                    toggleContainer.removeClass('toggleswitch-state-disabled');
                    this._enableListeners( toggleContainer );
                    
                }
                // Switch Disabled
                else if (value === false) {
                    
                    this.element.closest('.toggleswitch-select').attr('disabled' , true);
                    toggleContainer.addClass('toggleswitch-state-disabled');
                    this._disableListeners( toggleContainer );
                    
                }

                break;
            default:
                break;
            }
            
            // For UI 1.8, _setOption must be manually invoked
            // from the base widget
            $.Widget.prototype._setOption.apply( this, arguments );
            // For UI 1.9 the _super method can be used instead
            // this._super( "_setOption", key, value );
            
        },
        
        // Call this directly to toggle our value back and forth.  Pass a boolean
        // argument to update the bSwitchState option.
        changeState: function( value ) {
            
            switch (value) {
                
                case true:
                    
                    this._setOption('bSwitchState' , true);
                    
                    break;
                case false:
                    
                    this._setOption('bSwitchState' , false);
                    
                    break;
                default:
                    
                    // Toggle state back and forth between on / off if no boolean is passed
                    if (this.options.bSwitchState ) {
                        
                        this._setOption('bSwitchState' , false);
                        
                    } else if (!this.options.bSwitchState) {
                        
                        this._setOption('bSwitchState' , true);
                    }  
                    
                    break;
                
            }
 
        },
        
        // Call this directly to toggle our disabled/enabled state back and forth.  Pass a boolean
        // argument to update the bSwitchEnabled option.
        changeEnabled : function( value ) {
            
            switch (value) {
                
                case true:
                    
                    this._setOption('bSwitchEnabled' , true);
                    
                    break;
                case false:
                    
                    this._setOption('bSwitchEnabled' , false);
                    
                    break;
                default:
                    
                    // Toggle between enabled / disabled if no boolean is passed
                    if (this.options.bSwitchEnabled ) {
                        
                        this._setOption('bSwitchEnabled' , false);
                        
                    } else if (!this.options.bSwitchEnabled) {
                        
                        this._setOption('bSwitchEnabled' , true);
                    }  
                    
                    break;
            }
        },
        
        // Handle browser prefixes ( for jQuery < 1.8+ )
        _prefix : function() {

            var prefix = (/firefox/.test(navigator.userAgent.toLowerCase()) &&
            !/webkit/.test(navigator.userAgent.toLowerCase())) ? '-moz-' :
            (/webkit/.test(navigator.userAgent.toLowerCase())) ? '-webkit-' :
            (/msie/.test(navigator.userAgent.toLowerCase())) ? '-ms-' :
            (/opera/.test(navigator.userAgent.toLowerCase())) ? '-o-' : '';
           
            return prefix;

        },

    });

    $.extend($.mlb.toggleswitch, {

        instances: []
        
    });

})( jQuery );
