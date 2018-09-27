var config = {
    "/": [
        "@/index"
    ],
    
    "/index": [
        "src/app/build/index.tpl.js",
        
        "src/app/index.js"
    ],
    
    "/designs/lairen/pro": [
        "src/app/build/designs/lairen/pro.tpl.js",
        
        "src/app/designs/lairen/pro.js"
    ],
    
    /* ---------------------------------------------------------------------- */
    
    "/codes": [
        "src/app/build/codes/index.tpl.js",
        "src/app/codes/index.js"
    ],
    
    "/codes/xfly/examples/index": [
        "src/app/build/codes/xfly/examples/header.tpl.js",
        "src/app/codes/xfly/examples/source-map.js",
        "src/app/codes/xfly/examples/index.js",
    
        "@/codes/xfly/examples/member/engagement",
        "@/codes/xfly/examples/member/not/engagement"
    ],
    "/codes/xfly/examples/multi/instance": [
        "src/app/build/codes/xfly/examples/header.tpl.js",
        "src/app/codes/xfly/examples/source-map.js",
        "src/app/codes/xfly/examples/multi.instance.js"
    ],
    "/codes/xfly/examples/page/with/args": [
        "src/app/build/codes/xfly/examples/header.tpl.js",
        "src/app/codes/xfly/examples/source-map.js",
        "src/app/codes/xfly/examples/page.with.args.js"
    ],
    "/codes/xfly/examples/reload": [
        "src/app/build/codes/xfly/examples/header.tpl.js",
        "src/app/codes/xfly/examples/source-map.js",
        "src/app/codes/xfly/examples/reload.js"
    ],
    "/codes/xfly/examples/see/you/again": [
        "src/app/build/codes/xfly/examples/header.tpl.js",
        "src/app/codes/xfly/examples/source-map.js",
        "src/app/codes/xfly/examples/see.you.again.js"
    ],
    
    "/codes/xfly/examples/member/not/engagement": [
        "src/app/build/codes/xfly/examples/header.tpl.js",
        "src/app/codes/xfly/examples/source-map.js",
        "src/app/codes/xfly/examples/member.not.engagement.js",
        
        "@/codes/xfly/examples/index",
        "@/codes/xfly/examples/member/engagement"
    ],
    "/codes/xfly/examples/member/engagement": [
        "src/app/build/codes/xfly/examples/header.tpl.js",
        "src/app/codes/xfly/examples/source-map.js",
        "src/app/codes/xfly/examples/member.engagement.js",
        
        "@/codes/xfly/examples/index",
        "@/codes/xfly/examples/member/not/engagement"
    ]
};
