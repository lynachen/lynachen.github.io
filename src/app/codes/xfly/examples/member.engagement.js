$Page.define('codes.xfly.examples.member.engagement', {

    title: 'Yeah, you are joined',

    onCreateView: function() {
        this.render( { html: template( 'codes/xfly/examples/header.tpl' )() } );
    },

    onRendering: function() {

    },

    onRendered: function() {
        $('.xfly-example-inner').html(
            '<h1>Yeah, you are joined</h1>' +
            '<hr/>' +
            '<button class="sign-out">Tap to sign out</button>' +
            '<a class="xfly-page__back" href="">Get back</a>'
        );
    
        setTimeout( function () {
            $('.project-intro').addClass('animated fade-in-enter-effect');
        }, 400 );
        
        $('#page_load_indicator').toggle( false );
        
        $('.sign-out').on( 'click', function () {
            hasMember = false;

            weui.toast( 'Member flag was updated', { duration: 900 } );
        } );
    
        SourceMap.updateExpandButton();
    }
});