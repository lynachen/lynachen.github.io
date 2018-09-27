$Page.define('codes.xfly.examples.multi.instance', {

    multitask: true,    /* REQUIRED */

    onCreateView: function() {
        this.render( { html: template( 'codes/xfly/examples/header.tpl' )() } );
        
        $('.xfly-example-inner').html(
            '<h1>This view was created at ' + new Date + '</h1>' +
            '<p>NOTE: When the args are different, a new instance is created.</p>' +
            '<hr/>' +
            '<a class="xfly-page__back" href="">Get back</a>'
        );
    
        setTimeout(function (  ) {
            $('.project-intro').addClass('animated fade-in-enter-effect');
        }, 400 );
    },

    onRendering: function() {
    },

    onRendered: function() {
        $('#page_load_indicator').toggle( false );
    
        SourceMap.updateExpandButton();
    }
});