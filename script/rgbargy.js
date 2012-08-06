/*
    RGBargy: by Mr Speaker. Saturday, July 10th 2010.
    
    Dear diary,
    
    I am typing this code sitting on the floor in a cool old appartment in Paris.
    Out the window to my right is the Eiffel tower. It's all sparkling. They turn on
    the sparkles on the hour, so I always know what time it is because the crowds
    cheer when it starts. I stay away to avoid the argy-bargy.
*/
var rgbargy = {
    // Constants
    spinTime: 2300,

    // Random other goodies you shouldn't need to touch
    isTouch: ( typeof Touch == "object" ),
    scrollHeight: 0,
    isSpinning: false,
    
    /*
        Some crazy people have started up outside my left window (it's ok though,
        'cause I'm 7 stories up) and they are belting out a strange rendition of
        "We are the Champions".
    */
    init: function(){
        window.onorientationchange = $.proxy( this.updateOrientation, this );
        $( "#container" ).bind( "touchmove", function( e ){ e.preventDefault(); } );

        this.initUI();
        this.spin();
    },

    /*
        I have to get used to this place. And I have to be careful in Paris 
        when ordering and buying beer. In Australia you can use a simple 
        algorithm to determine how much alcohol you've consumed.
        
        var pendingHangover = numberOfBeers > 6;
    */
    updateOrientation: function(){
        switch ( window.orientation ){
            case 0:
                $( "#container" ).removeClass( "landscape" );
                break;
            case -90:
            case 90:
                $( "#container" ).addClass( "landscape" );
                break;
        };

        /*
            Beers vary dramatically in alcohol content, from around 5% - up to 
            11 or 12%! So you think you've had 3 pints - but really you've 
            had about 6. So you'd need to do some kinda map-reduce hijinks to 
            figure out if you were going to get a hangover.
        */
        this.setScrollHeight();
        this.updatePositions();
    },

    initUI: function(){
        // Should prolly make the scrollers objects... but... meh...
        // I've always been a procedural guy at heart.
        $( ".scroller ul" )
            .each( function( index ){
                // Add the list items
                for( var i = 0; i < 16; i++ ){
                    var hex = "0123456789ABCDEF".charAt( i );
                    var col = "#";
                    for( var j = 0; j < 3; j++ ){
                        col += j === Math.floor( index / 2 ) ? hex : "0";
                    }

                    $( "<li></li>" )
                        .text( hex )
                        .css( "background-color", col )
                        .appendTo( this );
                };

                // Add the iScroll functionality
                $( this ).data( "scroll", new iScroll( this, { desktopCompatibility: !this.isTouch } ) );
            })
            .click( function( e ){
                rgbargy.spin( e );
            });
        
        // Will change between landscape and portrait modes    
        this.setScrollHeight();

        /*
            If you want to say that you are feeling good, you say,
                            "I have potatoes"
            Or peaches. J'ai le pêche. But I like the idea of 
            potatoes being used in a saying in a positive manner.
        */
        $( ".scroller" ).each( function(){
            // Add the "hold" function
            $( "<div></div>" )
                .click( function( e ){
                    $( this ).toggleClass( "selected" );
                })
                .appendTo( this )
                .addClass( "lock" )
                .hide().show();
        });

        // Bind the big spin button
        $( "ul.static" ).click( function(){
            rgbargy.spin();
        });

        // Shhhh! Easter egg.
        shhh = ( function( scrollHeight ){
            return function(){
                $( ".scroller li" ).each( function(){
                    var $this = $( this );
                    $this.addClass( "secret" ).css( "background-position", function(){
                        // Thanks antonemdin.com, you crazy character!
                        return "1px -" + ( $this.index() * scrollHeight ) + "px";
                    });
                });
                shhh = function(){};
            };
        })( this.scrollHeight );
    },

    setScrollHeight: function(){
       this.scrollHeight = parseInt( $( ".scroller:first" ).css( "height" ), 10 );
    },

    /*
        Twhirling! The "crazy" people I mentioned earlier are having a party 
        in a small cafe that is frequented by old grumpy looking people. But now 
        everyone is dancing and twhirling around... like ballroom dancing, except 
        the song is YMCA.
    */
    spin: function( e ){
        var _this = this;
        this.isSpinning = true;
        
        // Spin one or all the panes?
        var selector = e ? $( e.target.parentNode ) : $( ".scroller ul" );
        selector.each( function( index ){
            var $this = $( this );

            // Don't scroll locked bars
            if( $this.parent().find( ".lock" ).hasClass( "selected" ) ){
                return;
            }

            var scroller = $this.data( "scroll" );

            // Can't land on itelf...
            var scrollTo = -scroller.y;
            var num = -1;
            // Has the potential to be an infinite loop. If you're very lucky.
            while( scroller.y + scrollTo === 0 ){
                num = Math.floor( Math.random() * 16 );
                scrollTo = num * _this.scrollHeight;
            }
            $this.data( "num", num );
            scroller.scrollTo( 0, -scrollTo, _this.spinTime + "ms" );
        });

        // Wait till the spinning is over before updating.
        clearTimeout( this.timer );
        this.timer = setTimeout( function(){
            _this.timer = null;
            _this.spinEnd();
        }, this.spinTime );
    },

    /*
        It can't go on forever. The Eiffel tour has gone dark for the night, 
        so I guess it's time to quit coding. It was a nice project while it lasted,
        I guess. Would have been better if there was a point, but that can 
        wait for version 2.

        The dancing is still going though. Much louder dancing now.
    */
    spinEnd: function(){
        this.isSpinning = false;
        var scrollHeight = this.scrollHeight,
            col = "#",
            shhhh=-2,shh=0; // Shhhh... easter egg

        $( ".scroller ul" ).each( function( i ){
            var s = ( ( Math.abs( $( this ).data( "scroll" ).y ) ) / scrollHeight );
            col += "0123456789ABCDEF".charAt( s );

            // Shhhh... easter egg.
            s===++shhhh?++shh-~~Math.PI?~Math.PI:shhh():shh+=~shh+1;shhhh=s;
        });

        // Update the button
        $( ".static li" )
            .text( col )
            .css( "background-color", col );
    },

    /*
        It hurts sitting on the floor for long periods of time.
    */
    updatePositions: function(){
        // Update the scroll top on orientation change
        var _this = this;
        $( ".scroller ul" ).each( function(){
            var $this = $( this );
            var scroller = $this.data( "scroll" );
            var num = $this.data( "num" );
            scroller.setTransitionTime( _this.isSpinning ? 1000 : 0 );
            scroller.setPosition( 0, -( num * _this.scrollHeight ), true );
        });
    }
};