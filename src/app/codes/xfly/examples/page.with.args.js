$Page.define('codes.xfly.examples.page.with.args', {

    onCreateView: function() {
        /* Tip: Easy way to get the query string */
        var args = this.getArgs();
    
        this.render( { html: template( 'codes/xfly/examples/header.tpl' )() } );

        $('.xfly-example-inner').html(
            '<h1>Got the arg is ' + args[ 'key' ] + '</h1>' +
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