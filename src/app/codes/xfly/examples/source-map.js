var SourceMap = {
    base_path: 'https://github.com/c-ong/c-ong.github.io/tree/master/src/app/codes/xfly/examples/',

    map: {
        'codes.xfly.examples.index':            'index.js',
        'codes.xfly.examples.welcome':          'welcome.js',
        'codes.xfly.examples.multi.instance':   'multi.instance.js',
        'codes.xfly.examples.page.with.args':   'page.with.args.js',
        'codes.xfly.examples.reload':           'reload.js',
        'codes.xfly.examples.see.you.again':    'see.you.again.js',

        'codes.xfly.examples.member.not.engagement':    'member.not.engagement.js',
        'codes.xfly.examples.member.engagement':        'member.engagement.js'
    },

    updateExpandButton: function () {
        var id = getCurrentPage().id;

        if ( id ) {
            $('.src-expand')[ 0 ].href = this.base_path + this.map[id];
        }
    }
};