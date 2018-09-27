'use strict';


var gulp         = require('gulp');
var clean        = require('gulp-clean');

var newer        = require('gulp-newer');

//var js_hint      = require('gulp-jshint');

var uglify       = require('gulp-uglify');
var clean_css    = require('gulp-clean-css');

var concat       = require("gulp-concat");

var concat_css   = require('gulp-concat-css');
var imagemin     = require('gulp-imagemin');
var htmlmin      = require('gulp-htmlmin');

var rev          = require('gulp-rev');
var fileinclude  = require('gulp-file-include');
var usemin       = require('gulp-usemin');



//gulp.task('lint', function() {
//    return gulp.src('js/**/*.js')
//        .pipe( js_hint() )
//        .pipe( js_hint.reporter() );
//});

// -----------------------------------------------------------------------------

var fs      = require("fs");
var hashsum = require('hashsum');
var chalk   = require('chalk');

// -----------------------------------------------------------------------------

/**
 * 计算 string 的 hashcode.
 *
 * 参考:
 * http://web.archive.org/web/20130703081745/http://www.cogs.susx.ac.uk/courses/dats/notes/html/node114.html
 * @param str
 * @returns {number}
 */
function hash_code(str) {
    var hash = 0;
    
    if ( ! (0 ^ str.length) )
        return hash;
    
    var idx;
    
    for ( idx = 0; idx < str.length; idx++ ) {
        hash = 31 * hash + str.charCodeAt( idx );
        
        /* Convert to 32bit integer */
        hash |= 0;
    }
    
    return hash;
}

function calc_bundle_hash(key) {
    var hash = hash_code( key );
    
    return hash < 0 ? 'M' + Math.abs( hash ) : hash;
}

// -----------------------------------------------------------------------------

var Bundle = function() {
    // Page 的唯一标识
    this.key                = void 0;
    this.assets             = [];
    
    this.prod_assets        = [];
    
    // TODO solved & mapping to assets
    this.references         = [];
    
    this._cached_has_change = {};
    
    /**
     * 是否有指定类型的资源.
     * @return boolean
     */
    this.hasAssetAgainstGivenType = function (type) {
        if ( ! type )
            throw new Error( 'Must be specify the asset type!' );
        
        return this.getAssetsPath( type ).length;
    };
    
    /**
     * 是否指定类型资源至少有一项发生的改变。
     * @return boolean
     */
    this.hasChange = function (type) {
        // TODO 是否 .cache/xxx.file && prod/xxx.bundle.file 存在
        // Changed  global.assets[ this.assets[ idx ] ].dity
        // Added    this.getVersion() !== last.this.getVersion()
        // Removed  this.getVersion() !== last.this.getVersion()
    
        if ( ! type )
            throw new Error( 'Must be specify the asset type!' );
        
        if ( typeof this._cached_has_change[ type ] !== 'undefined' ) {
            return this._cached_has_change[ type ];
        }
        
        var classed_assets = this.getAssetsPath( type );
        var changed;
        
        for ( var idx in classed_assets ) {
            if ( assets[ classed_assets[ idx ] ].dity ) {
                changed = true;
                break;
            }
        }
        
        // 比较最后一次的全部资源版本按制定的类型
        if ( ! changed && last_ver_table ) {
            if ( typeof last_ver_table[ this.key ] === 'undefined' ) {
                changed = true;
            } else {
                var last = last_ver_table[ this.key ];
                
                changed = this.getVersion( type ) !== last[ type ];
            }
        }
        
        return this._cached_has_change[ type ] = changed;
    };
    
    /**
     * 获取指定类型的资源的路径。
     * @param type
     * @returns {Array}
     */
    this.getAssetsPath = function(type) {
        var node;
        var paths = [];
        
        for ( var idx in this.assets ) {
            node = assets[ this.assets[ idx ] ];
            
            switch ( type ) {
                case TYPE_JS:
                    if ( node.is_js )
                        paths.push( this.assets[ idx ] );
                    break;
                case TYPE_CSS:
                    if ( ! node.is_js )
                        paths.push( this.assets[ idx ] );
                    break;
                default:
                    paths.push( this.assets[ idx ] );
                    break;
            }
        }
        
        return paths;
    };
    
    this.getHash = function() {
        if ( typeof this.key === 'undefined' )
            throw new Error( 'The this.key cannot be null!' );
        
        return calc_bundle_hash( this.key );
    };
    
    /**
     * 获取指定类型资源的版本号。
     * @return String
     */
    this.getVersion = function(type) {
        if ( prod ) {
            if ( ! type )
                throw new Error( 'Must be specify the asset type!' );
    
            var buffer         = [];
            var asset_ver;
            var desired_assets = this.getAssetsPath( type );
            
            for ( var idx in desired_assets ) {
                asset_ver = assets[ desired_assets[ idx ] ].version;
        
                if ( asset_ver )
                    buffer.push( asset_ver );
                else
                    throw new Error( 'The asset "' + desired_assets[ idx ]
                        + '" has no version info!' );
            }
    
            return calc_bundle_hash( buffer.join( '' ) );
        }
    
        return Date.now();
    };
};
var AssetNode = function() {
    this.is_js      = false;
    this.minified   = false;
    this.dity       = false;
    this.path       = void 0;
    this.version    = void 0;
};
var ReferNode = function() {
    this.bundle = void 0;
    this.offset = -1;
};

var prod = false;
var dump = false;
var DUMP_LINK_PREFIX;

// -----------------------------------------------------------------------------

var TYPE_JS = 'js',
    TYPE_CSS = 'css';

// -----------------------------------------------------------------------------

var bundle_map;  // 所有的页面
var bundle_num = 0;
var assets = {}; // 所有页面引用的资源

// -----------------------------------------------------------------------------

var current_stage = 0;

var has_last_ver_table = false;
var present_ver_table;
var last_ver_table = {};

function log_succeed(stage) {
    //console.log( '<<<< Step ' + stage + ' succeed, '
    //    + ( new Date() ).toLocaleString() );
}
function log_failed(stage) {
    //console.log( '!!!! Step ' + stage + ' failed, '
    //    + ( new Date() ).toLocaleString() );
}

function do_next_stage() {
    handle_stage_change( current_stage++ );
}

function perform_stage_repeat(stage) {
    handle_stage_change( stage );
}

// -----------------------------------------------------------------------------


var css_files = [],
    js_files  = [];

// -----------------------------------------------------------------------------

var MinifyJob = function () {
    this.is_js          = false;
    this.src            = void 0;
    this.dest           = void 0;
    this.concat_name    = void 0;
    this.bundle         = void 0;
};

var concat_queue = [];

/**
 * 加入 Minify 任务的队列；
 * @param is_js
 * @param src
 * @param concat_name
 * @param dest
 */
function en_queue(is_js, src, concat_name, dest, bundle) {
    var x = new MinifyJob();
    
    x.is_js         = is_js;
    x.src           = src;
    x.concat_name   = concat_name;
    x.dest          = dest;
    x.bundle        = bundle;
    
    concat_queue.push( x );
}

/**
 * 生成当前资源的版本对照表；
 * @returns {{}}
 */
function generate_present_asset_ver_table() {
    var hashsum_result = {};
    for ( var file in assets ) {
        hashsum_result[ file ] = hashsum.fileSync( file );
    }
    
    return hashsum_result;
}

/**
 * Bundle 的 JS、CSS 最新版本号。
 */
function generate_bundle_ver_table(  ) {
    var result = {};
    
    var bundle;
    var bundle_assets_ver;
    for ( var key in bundle_map ) {
        bundle = bundle_map[ key ];
        bundle_assets_ver = {};
        
        if ( bundle.hasAssetAgainstGivenType( TYPE_JS ) ) {
            bundle_assets_ver[ TYPE_JS ] = bundle.getVersion( TYPE_JS );
        }
        if ( bundle.hasAssetAgainstGivenType( TYPE_CSS ) ) {
            bundle_assets_ver[ TYPE_CSS ] = bundle.getVersion( TYPE_CSS );
        }
        
        result[ key ] = bundle_assets_ver;
    }
    
    return result;
}

var automatic_state = false;

function handle_stage_change(new_stage) {
    //console.log( '>>>> Being the Step ' + new_stage + ', '
    //    + ( new Date() ).toLocaleString() );
    
    switch ( new_stage ) {
        // 解析 Bundle 需要的资源
        case 0:
        {
            bundle_map = ( new Function(
                fs.readFileSync( 'src/bundle.config.js', 'utf-8' )
                + 'return config;' )
            )();
    
            var dependencies_of_page;
            var asset_descriptor;
            
            var bundle;
            var asset_node;
            var refer_node;
            
            var result_for_dump;
            if ( dump )
                result_for_dump = [];
            
            for ( var page in bundle_map ) {
                bundle = new Bundle();
                dependencies_of_page = bundle_map[ page ];
        
                for ( var idx in dependencies_of_page ) {
                    asset_descriptor = dependencies_of_page[ idx ];
            
                    if ( asset_descriptor.indexOf( '@' ) === 0 ) {
                        refer_node = new ReferNode();
                        
                        refer_node.bundle = asset_descriptor.substr( 1 );
                        refer_node.offset = idx;
                        
                        bundle.references.push( refer_node );
                    } else {
                        asset_node = new AssetNode();
                        
                        asset_node.is_js = asset_descriptor.lastIndexOf('.js')
                            === asset_descriptor.length - 3;
                        asset_node.minified = asset_descriptor.lastIndexOf(
                            asset_node.is_js ? '.min.js' : '.min.css' )
                            === asset_descriptor.length - ( asset_node.is_js ? 7 : 8 );
    
                        asset_node.path = asset_descriptor;
    
                        bundle.assets.push( asset_node.path );
    
                        if ( typeof assets[ asset_node.path ] !== 'undefined' ) {
                            continue;
                        }
    
                        assets[ dependencies_of_page[ idx ] ] = asset_node;
                    }
                }
                
                bundle.key = page;
                bundle_map[ page ] = bundle;
                bundle_num++;
                
                
                if ( dump )
                    result_for_dump.push( '<li><a href="' + DUMP_LINK_PREFIX + page + '">' + page + '</a></li>' );
            }
            
            if ( dump )
                console.log( result_for_dump.join( '\n' ) );
            
            // Step 1: 加载 bundle.map;
            // Step 2: 首次 build & bundle;
            // Step 3: 生产 version table;
            // Step 4: 生产 manifest 用于 DEV & PRO 环境;
    
    
            // 资源修改、增加、减少都会触发 build
            // Check flag & remove flag
            // 第一步：Minify
            // 第二步: Concat
    
            // 分解引用的资源
            var referenced_assets;
    
            for ( var page in bundle_map ) {
                bundle = bundle_map[ page ];
        
                if ( ! bundle.references.length )
                    continue;
        
                for ( var idx in bundle.references ) {
                    referenced_assets = bundle_map[
                        bundle.references[ idx ].bundle
                        ].assets;
            
                    for ( var idx_of_ref_assets in referenced_assets ) {
                        if ( bundle.assets.indexOf(
                            referenced_assets[ idx_of_ref_assets ] ) === -1 ) {
                            bundle.assets.push(
                                referenced_assets[ idx_of_ref_assets ] );
                        }
                    }
                }
            }
            
            
            if ( prod ) {
                present_ver_table = generate_present_asset_ver_table();
                has_last_ver_table = fs.existsSync(
                    'src/app/build/.cache/ver-table.last.json' );
                
                if ( has_last_ver_table ) {
                    last_ver_table = JSON.parse(
                        fs.readFileSync(
                            'src/app/build/.cache/ver-table.last.json', 'utf-8' ) );
                }
                
                // 发生修改的资源
                // TODO(XCL): 当 Bundle 更新时，也应该 rebuild
                var modified_assets = {};
                
                Object.keys( assets ).forEach(
                    function ( path ) {
                        if ( present_ver_table[ path ] !== last_ver_table[ path ] )
                            modified_assets[ path ] = 1;
                        
                        assets[ path ].version = present_ver_table[ path ];
                    }
                );
                
                
                var node;
        
                for ( var path in assets ) {
                    node = assets[ path ];
            
                    if (
                        typeof modified_assets[ path ] !== 'undefined'
                        && ! node.minified
                    ) {
                        node.dity = true;
                        ( node.is_js ? js_files : css_files ).push( node.path );
                    }
                }
            }
    
            log_succeed( new_stage );
            do_next_stage();
        }
            break;
            
        // PROD 场景 CSS 单个资源压缩
        case 1:
        {
            if ( prod ) {
                // TODO 新增的文件不会被转换到 .cache
                if ( css_files.length ) {
                    var stream = gulp.src( css_files, { base: 'src' } )
                                     .pipe( clean_css() )
                                     .pipe( gulp.dest( 'src/app/build/.cache/' ) );
        
                    stream.on( 'finish', function () {
                        log_succeed( new_stage );
                        do_next_stage();
                    } );
                    stream.on( 'error', function () {
                        log_failed( new_stage );
                    } );
                } else {
                    log_succeed( new_stage );
                    do_next_stage();
                }
            } else {
                log_succeed( new_stage );
                do_next_stage();
            }
        }
            break;
    
        // PROD 场景 JS 单个资源压缩
        case 2:
        {
            if ( prod ) {
                if ( js_files.length ) {
                    var stream = gulp.src( js_files, { base: 'src' } )
                        .pipe( uglify() )
                        .pipe( gulp.dest( 'src/app/build/.cache/' ) );
                    
                    stream.on( 'finish', function (  ) {
                        log_succeed( new_stage );
                        do_next_stage();
                    } );
                    
                    stream.on( 'error', function () {
                        log_failed( new_stage );
                    } );
                } else {
                    log_succeed( new_stage );
                    do_next_stage();
                }
            } else {
                log_succeed( new_stage );
                do_next_stage();
            }
        }
            break;
            
        // PROD 场景 Bundle 资源合并 & 压缩队列编排
        case 3:
        {
            if ( prod ) {
                var bundle_prod_key;
                var bundle_assets_path;
        
                for ( var key in bundle_map ) {
                    bundle = bundle_map[ key ];
                    bundle_prod_key = bundle.getHash();
            
                    css_files = [];
                    js_files = [];
            
                    bundle_assets_path = [];
                    
                    if ( bundle.hasChange( TYPE_CSS ) )
                        bundle_assets_path = bundle.getAssetsPath( TYPE_CSS );
                    if ( bundle.hasChange( TYPE_JS ) )
                        bundle_assets_path = bundle_assets_path.concat(
                            bundle.getAssetsPath( TYPE_JS ) );
            
                    for ( var idx in bundle_assets_path ) {
                        node = assets[ bundle_assets_path[ idx ] ];
                
                        ( node.is_js ? js_files : css_files ).push(
                            node.minified
                            ? node.path
                            : 'src/app/build/.cache' + node.path.substr( node.is_js
                                    ? 3
                                    : 4 )
                        );
                    }
            
                    if ( css_files.length )
                        en_queue(
                            false,
                            css_files.slice(),
                            bundle_prod_key + '.css',
                            'assets/css/',
                            key );
                    if ( bundle.hasAssetAgainstGivenType( TYPE_CSS ) )
                        bundle.prod_assets.push( 'assets/css/' + bundle_prod_key + '.css' );
    
                    if ( js_files.length )
                        en_queue(
                            true,
                            js_files.slice(),
                            bundle_prod_key + '.js',
                            'assets/js/',
                            key );
                    if ( bundle.hasAssetAgainstGivenType( TYPE_JS ) )
                        bundle.prod_assets.push( 'assets/js/' + bundle_prod_key + '.js' );
                    
                    if ( concat_queue.length && ! pretty.columns_spec.length ) {
                        pretty.setup( [
                            {
                                label: 'No.',
                                width: 6,
                                decorator: function (data) {
                                    return { plain: '' + data.no };
                                }
                            },
        
                            {
                                label: 'Bundle',
                                width: 28,
                                decorator: function (data) {
                                    return { plain: data.bundle };
                                }
                            },
        
                            {
                                label: 'Chunk',
                                width: 16,
                                decorator: function (data) {
                                    return {
                                        plain: data.file,
                                        styled: chalk.green( data.file )
                                    };
                                }
                            },
    
                            {
                                label: 'Size',
                                width: 10,
                                decorator: function (data) {
                                    return {
                                        plain: data.formatted_size,
                                        styled: data.size > 90 * 1024
                                            ? chalk.redBright( data.formatted_size )
                                            : data.formatted_size
                                    };
                                }
                            },
        
                            {
                                label: 'Status',
                                width: 10,
                                decorator: function (data) {
                                    return {
                                        plain: '[' + data.state + ']',
                                        styled: '[' + chalk.green( data.state ) + ']'
                                    };
                                }
                            }
                        ] );
                    }
                }
            }
            
            log_succeed( new_stage );
            do_next_stage();
        }
            break;
    
        // PROD 场景 Bundle 资源合并 & 压缩任务执行
        case 4:
        {
            if ( concat_queue.length ) {
                var job = concat_queue.shift();
        
                // Combine all of Chunk to closure
                var src = job.src;
                if ( job.is_js ) {
                    src.unshift( 'src/assets/js/libs/closure/head.js' );
                    src.push( 'src/assets/js/libs/closure/tail.js' );
                }
                
                var stream = gulp.src( job.src )
                                 .pipe( job.is_js
                                     ? concat( job.concat_name )
                                     : concat_css( job.concat_name ) )
                                 .pipe( job.is_js
                                     ? uglify()
                                     : clean_css() )
                                 .pipe( gulp.dest( job.dest ) );
    
                stream.on( 'finish', function () {
                    var fd = fs.openSync( job.dest + job.concat_name, 'r' );
                    var stats = fs.fstatSync( fd );
                    
                    pretty.print(
                        { no: concat_queue.length + 1 },
                        { bundle: job.bundle },
                        { file: job.concat_name },
                        { size: stats.size, formatted_size: format_file_size( stats.size ) },
                        { state: 'OK' } );
    
                    if ( concat_queue.length ) {
                        perform_stage_repeat( new_stage );
                    } else {
                        log_succeed( new_stage );
                        do_next_stage();
                    }
                } );
    
                stream.on( 'error', function () {
                    log_failed( new_stage );
                } );
            } else {
                log_succeed( new_stage );
                do_next_stage();
            }
        }
            break;
            
        // PROD 场景生成资源版本表
        case 5:
        {
            if ( prod ) {
                var merged = Object.assign(
                    generate_present_asset_ver_table(),
                    generate_bundle_ver_table() );
                
                if ( ! fs.existsSync( 'src/app/build/.cache/' ) )
                    fs.mkdirSync( 'src/app/build/.cache/' );
                
                fs.writeFileSync(
                    'src/app/build/.cache/ver-table.last.json',
                    JSON.stringify( merged ),
                    'utf-8'
                );
    
                log_succeed( new_stage );
                do_next_stage();
            } else {
                log_succeed( new_stage );
                do_next_stage();
            }
            
            // -------------------------------------------------------------------------
    
            // Check file status
            // 开发阶段
            // 部署
    
            // -------------------------------------------------------------------------
        }
            break;
        
        // 生成 Manifest
        case 6:
        {
            var manifest = [ 'var manifest={' ];
    
            // 用于 Bundle 计数
            var counter = 0;
    
            // Bundle 下的资源
            var assets_of_bundle;
            var bundle;
            var path;
            var is_js;
            
            for ( var page in bundle_map ) {
                bundle = bundle_map[ page ];
                
                assets_of_bundle = prod
                    ? bundle.prod_assets
                    : bundle.getAssetsPath();
    
                counter++;
        
                manifest.push( '"', page, '":[' );
        
                for ( var idx in assets_of_bundle ) {
                    path = assets_of_bundle[ idx ];
                    is_js = path.lastIndexOf('.js') === path.length - 3;
                    
                    manifest.push(
                        '"', path, "?_=",
                        bundle.getVersion( is_js
                            ? TYPE_JS
                            : TYPE_CSS ),
                        '"'
                    );
            
                    if ( idx != assets_of_bundle.length - 1 )
                        manifest.push( ',' );
                }
        
                manifest.push( ']' );
        
                if ( counter < bundle_num )
                    manifest.push( ',' );
            }
    
            manifest.push( '};' );
    
            // Combine CSS with JS and make it into a single
            // Watch bundle.map.json change
            // TODO 尾部多了一个逗号
            // TODO 出现 manifest 无法更新的现象
            fs.writeFileSync(
                'src/assets-manifest' + ( prod ? '.prod' : '.dev' ) + '.js',
                new Buffer( manifest.join( '' ) ),
                'utf-8'
            );
            
            if ( ! prod )
                console.log(
                    '[OK] The ' + chalk.green( 'assets-manifest.dev.js' )
                    + ' file is updated at '
                    + chalk.green( ( new Date() ).toLocaleString() ) );
            
            log_succeed( new_stage );
            do_next_stage();
            
            //console.log( "Bundle size: " + counter );
    
            // js-string-escape for Style
    
            // ^& 资源首；
            // #& 自然位置；
            // ～& 资源尾；
            // && 已经优化过的资源；
        }
            break;
            
        case 7: {
            if ( prod ) {
                var stream = gulp.src( [
                               'src/assets/vendor/bootstarp/3.3.7-dist/css/bootstrap.min.css',
                               'src/assets/css/base.css',
                               'src/assets/css/xfly.css',
                               'src/assets/css/codes.css',
                               'src/assets/css/animation.css' ] )
                           .pipe( concat_css( 'main.css' ) )
                           .pipe( clean_css() )
                           .pipe( gulp.dest( 'assets/css/inline' ) );
    
                stream.on( 'finish', function () {
                    log_succeed( new_stage );
                    do_next_stage();
                } );
    
                stream.on( 'error', function () {
                    log_failed( new_stage );
                } );
            } else {
                log_succeed( new_stage );
                do_next_stage();
            }
        }
        break;
        case 8: {
            if ( prod ) {
                var stream = gulp.src( [
                                     'src/app/build/template.js',
                                     'src/app/build/footer.tpl.js',
                                     'src/assets/vendor/zepto/1.2.0/zepto.min.js',
                                     'src/assets/vendor/zepto/1.2.0/detect.js',
                                     'src/assets/js/xfly/xfly-dev-0.1.52.js' ] )
                                 .pipe( concat( 'lib.js' ) )
                                 .pipe( uglify() )
                                 .pipe( gulp.dest( 'assets/js/inline' ) );
    
                stream.on( 'finish', function () {
                    log_succeed( new_stage );
                    do_next_stage();
                } );
    
                stream.on( 'error', function () {
                    log_failed( new_stage );
                } );
            } else {
                log_succeed( new_stage );
                do_next_stage();
            }
        }
        break;
            
        case 9:
        {
            var stream = gulp.src('src/*.html')
                .pipe( fileinclude( {
                    context : {
                        mode: prod ? 'PROD' : 'DEV'
                    }
                } ) )
                .pipe( gulp.dest( '' ) );
    
            stream.on( 'finish', function () {
                log_succeed( new_stage );
                do_next_stage();
            } );
    
            stream.on( 'error', function () {
                log_failed( new_stage );
            } );
        }
            break;
            
        case 10: {
            //if ( prod ) {
            //    var stream = gulp.src( '*.html' )
            //                     .pipe( usemin( {
            //                         css: [ clean_css, rev ],
            //                         js : [ uglify, rev ]
            //                     } ) )
            //                     .pipe( gulp.dest( '' ) );
            //
            //    stream.on( 'finish', function () {
            //        log_succeed( new_stage );
            //        do_next_stage();
            //
            //    } );
            //
            //    stream.on( 'error', function () {
            //        log_failed( new_stage );
            //    } );
            //} else {
            //    log_succeed( new_stage );
            //    do_next_stage();
            //}
    
            log_succeed( new_stage );
            do_next_stage();
        }
        break;
        
        case 11:
        {
            gulp.src('*.html')
                .pipe( htmlmin( { collapseWhitespace: true } ) )
                .pipe( gulp.dest( '' ) );
            
            log_succeed( new_stage );
            do_next_stage();
        }
            break;
        
        default:
        {
            current_stage   = 0;
            automatic_state = false;
            
            pretty.reset();
    
            //console.log( '**** DONE ****' );
        }
            break;
    }
}


// -----------------------------------------------------------------------------

function format_file_size(size) {
    if ( size > 1024 ) {
        size = size / 1024;
        
        if ( size % 1 )
            return size.toFixed( 2 ) + ' kB';
        
        return size + ' kB';
    }
    
    return size + ' bytes';
}

var Pretty = function () {
    var Spec = function () {
        this.label = void 0;
        this.width = void 0;
        this.decorator = void 0;
        
        this.padding = function( plain ) {
            var spacing = [];
            
            if ( plain.length >= this.width )
                return '';
            
            for ( var idx = 0; idx < this.width - plain.length; idx++ ) {
                spacing.push( ' ' );
            }
            
            return spacing.join( '' );
        };
    };
    
    this.columns_spec = [];
    
    this.setup = function(config) {
        var spec;
        var column_cfg;
        
        for ( var idx in config ) {
            spec = new Spec();
            column_cfg = config[ idx ];
            
            spec.label = column_cfg.label;
            spec.width = column_cfg.width;
            spec.decorator = column_cfg.decorator;
            
            this.columns_spec.push( spec );
        }
    
        var buffer = [];
    
        this.columns_spec.forEach( function(spec, idx) {
            buffer.push( spec.padding( spec.label ) );
            buffer.push( chalk.bold( spec.label ) );
        } );
    
        console.log( buffer.join( '' ) );
    };
    
    this.reset = function() {
        this.columns_spec = [];
    };
    
    this.print = function() {
        if ( ! this.columns_spec.length )
            throw new Error( 'You have no call the setup() method!' );
        
        if ( this.columns_spec.length != arguments.length )
            throw new Error( 'Invalid data!' );
        
        var buffer = [];
        var column_data;
        var data_sequence = arguments;
        
        this.columns_spec.forEach( function(spec, idx) {
            column_data = data_sequence[ idx ];
            
            var decorated_content = spec.decorator( column_data );
    
            buffer.push( spec.padding( decorated_content.plain ) );
            buffer.push( typeof decorated_content[ 'styled' ] != 'undefined'
                ? decorated_content.styled
                : decorated_content.plain );
        } );
        
        console.log( buffer.join( '' ) );
    };
};

var pretty = new Pretty();



gulp.task('clean-for-prod', function () {
    return gulp.src(
        [
            'assets/css',
            'assets/js'
        ],
        { read: false }
    ) .pipe( clean() );
});
gulp.task( 'optimize-image', function() {
    //return gulp.src(
    //        'src/assets/img/**'
    //   )
    //   .pipe( newer( 'src/assets/img/**' ) )
    //   .pipe( imagemin() )
    //   .pipe( gulp.dest( 'assets/img' ) );
} );

gulp.task( 'dev-manifest-build', function () {
    prod = false;
    do_next_stage();
} );
gulp.task( 'prod-manifest-build', function () {
    prod = true;
    do_next_stage();
} );


gulp.task( 'default', function() {
    prod = false;
    
    gulp.watch( [
        "css/**/*.css",
        "js/**/*.js",
        "bundle.config.js" ],
        
        function () {
            if ( ! automatic_state ) {
                automatic_state = true;
                do_next_stage();
            }
        }
    );
    
    setTimeout( function () {
        console.log( '[INFO] Starting the watch mode for YOUR project...' );
    }, 1000 );
} );
gulp.task( 'dev-dump', function() {
    prod = false;
    dump = true;
    DUMP_LINK_PREFIX = 'http://192.168.1.15:9000';

    do_next_stage();
} );

gulp.task( 'dev', [ 'dev-manifest-build', 'optimize-image' ] );
gulp.task( 'prod', [ 'prod-manifest-build', 'optimize-image' ] );