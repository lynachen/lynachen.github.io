$Page.define('index', {
    title: 'Chenglong Xiao\'s Portfolio',
    
    onCreateView: function () {
        this.render( {
            html: template( 'index.tpl')()
        } );
        
        // Hide the loading indicator
        $('#page_load_indicator').toggle( false );
    
        // Add the fade enter effect for view
        $('.home, #designs').addClass('animated fade-in-enter-effect');
        $('#footer').html( template('footer.tpl', { has_contact: true } ) );
    },
    
    onRendering: function () {
    
    },
    
    onRendered: function () {
        $('.violator').on('click', function () {
            var ctx = $( this );
            
            ctx.addClass('shake');
            
            setTimeout( function () {
                ctx.find('.overlay').css( { opacity: 1 } );
            }, 1000 );
            
            return false;
        } );
    },
    
    onResume: function () {
        console.log( this.id + ' be resumed.' );
    },
    
    onPause: function () {
        console.log( this.id + ' be paused.' );
    }
});