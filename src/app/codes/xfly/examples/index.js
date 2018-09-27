$Page.define('codes.xfly.examples.index', {

    title: 'Xfly',

    onCreateView: function () {
        this.render( { html: template( 'codes/xfly/examples/header.tpl' )() } );
    },

    onRendering: function () {

    },

    onRendered: function () {
        $('.xfly-example-inner').html(
            '<h1>Hello</h1>' +
            '<p>If you are using Server side render(PHP with Nginx、Apache...), here is no need the /index.html file.</p>' +
            '<ul>' +
            '<li><a class="xfly-page__nav" href="/codes/xfly/examples/see/you/again">Go to Next page</a></li>' +
            '<li><a class="xfly-page__nav" href="/codes/xfly/examples/page/with/args?key=Xflllllllllllly">Page take Args</a></li>' +
            '<li><a class="xfly-page__nav" href="/codes/xfly/examples/multi/instance?key=primary">Page with Multi-instance</a></li>' +
            '<li><a class="xfly-page__nav" href="/codes/xfly/examples/multi/instance?key=second">Page with Multi-instance 2</a></li>' +
            '<li><a class="xfly-page__nav" href="/codes/xfly/examples/reload">Next page(Reload)</a></li>' +
            '<li><a class="xfly-page__nav" data-if="hasMember" href="/codes/xfly/examples/member/engagement" data-else-href="/codes/xfly/examples/member/not/engagement">Logic Expression</a></li>' +
            '</ul>' +
            '<br/>' +
            '<br/>' +
            '<br/>' +
            '<b>MORE EXAMPLES BE COMING SOON...</b>'
        );
    
        setTimeout(function (  ) {
            $('.project-intro').addClass('animated fade-in-enter-effect');
        }, 400 );
        
        $('#page_load_indicator').toggle( false );
    
        SourceMap.updateExpandButton();
    },

    onResume: function () {
        console.log( this.id + ' be resumed.' );
    },

    onPause: function () {
        console.log( this.id + ' be paused.' );
    }
});