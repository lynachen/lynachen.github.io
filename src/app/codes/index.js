$Page.define('codes', {
    
    title: 'DL/T 645-1997',
    
    onCreateView: function () {
        this.render( {
            html: template( 'codes/index.tpl')()
        } );
    
        $('#page_load_indicator').toggle( false );
    
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