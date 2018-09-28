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