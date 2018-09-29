        //随机背景图片
        $(function() {
            var length = 3;
            $(".bg-img li:nth-child(2)").show();
            setInterval(function () {
                var randomBgIndex = Math.round(Math.random() * length);
                $("#section1 .bg-img li").eq(randomBgIndex).addClass("show").siblings().removeClass("show");
            },5000);
        
            //导航slideToggle
            $(".more-nav").on("click", function () {
                $(".nav-ul.nav-xs-ul").slideToggle(300);
            });

            $(".nav-xs-ul li").click(function () {
                $(this).addClass("active").siblings().removeClass("active");
                $(this).parents(".nav-xs-ul").slideUp(300);
            });
        });
        $(window).resize(function (){
            var wid = $(window).width();
            if(wid>768){
                $(".nav-xs-ul").hide();
            }
        });

        // function IsPC() {
        //     var userAgentInfo = navigator.userAgent;
        //     var Agents = ["Android", "iPhone",
        //     "SymbianOS", "Windows Phone",
        //     "iPad", "iPod"];
        //     var flag = true;
        //     for (var v = 0; v < Agents.length; v++) {
        //         if (userAgentInfo.indexOf(Agents[v]) > 0) {
        //             flag = false;
        //             break;
        //         }
        //     }
        //     return flag;
        // };
        // $(function(){
        //     var isPC=IsPC();
        //     if(isPC){
        //         console.log("不加载adaptive.js文件");
        //     } else{
        //         $.getScript("assets/js/adaptive.js",function(){  //加载mobile.js,成功后，并执行回调函数
        //             console.log("加载adaptive.js文件");
        //             window['adaptive'].desinWidth = 750;
        //             window['adaptive'].baseFont = 12;
        //             window['adaptive'].init();
        //         });
        //     }
        // });