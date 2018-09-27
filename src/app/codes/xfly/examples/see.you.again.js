$Page.define('codes.xfly.examples.see.you.again', {

    title: 'See you again',

    onCreateView: function() {
        this.render( { html: template( 'codes/xfly/examples/header.tpl' )() } );
        
        $('.xfly-example-inner').html(
            '<h1>See you again</h1>' +
            '<hr/>' +
            '<a class="xfly-page__back" href="">Get back</a>'
        );
    
        setTimeout( function () {
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