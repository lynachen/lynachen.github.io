$Page.define('codes.xfly.examples.member.not.engagement', {

    title: 'Hi',

    onCreateView: function() {
        this.render( { html: template( 'codes/xfly/examples/header.tpl' )() } );
    },

    onRendering: function() {

    },

    onRendered: function() {
        $('.xfly-example-inner').html(
            '<h1>Hi</h1>' +
            '<p>For testing logic expression, tap bellow "Sign in" button to simulate a member engagement</p>' +
            '<hr/>' +
            '<button class="sign-in">Sign in</button>' +
            '<a class="xfly-page__back" href="">Get back</a>'
        );
    
        setTimeout(function (  ) {
            $('.project-intro').addClass('animated fade-in-enter-effect');
        }, 400 );
        
        $('#page_load_indicator').toggle( false );
        
        // Mark a member are signed
        $('.sign-in').on( 'click', function () {
            hasMember = true;

            weui.toast( 'Member flag was updated', { duration: 900 } );
        } );
    
        SourceMap.updateExpandButton();
    }
});