$Page.define('designs.lairen.pro', {
    
    title: '来人到家 PRO',
    
    onCreateView: function () {
        this.render( {
            html: template( 'designs/lairen/pro.tpl')()
        } );
    
        $('#page_load_indicator').toggle( false );
    
        $('#footer').html( template('footer.tpl', { has_contact: false } ) );
    },
    
    onRendering: function () {
    
    },
    
    onRendered: function () {
    },
    
    onResume: function () {
        console.log( this.id + ' be resumed.' );
    },
    
    onPause: function () {
        console.log( this.id + ' be paused.' );
    }
});