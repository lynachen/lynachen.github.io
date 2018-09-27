! function () {
    var render = function (ctx) {
        ctx.render( { html: template( 'codes/xfly/examples/header.tpl' )() } );
        
        $('.xfly-example-inner').html(
            '<h1>This view last updated at ' + new Date + '</h1>' +
            '<hr/>' +
            '<a id="reload_trigger" href="">Touch to reload</a>' +
            '<a class="xfly-page__back" href="">Get back</a>'
        );
    };

    $Page.define('codes.xfly.examples.reload', {
        onCreateView: function() {
            render( this );
    
            setTimeout( function () {
                $('.project-intro').addClass('animated fade-in-enter-effect');
            }, 400 );
        },

        onRendered: function() {
            $('#page_load_indicator').toggle( false );
            
            var me = this;

            $('#reload_trigger').on( 'click', function () {
                me.reload();

                return false;
            } );
        },

        onReload: function () {
            /* To clear that the exist view Before re-render */
            $('.page-ui').remove();

            render( this );
    
            SourceMap.updateExpandButton();
        }
    });
}();