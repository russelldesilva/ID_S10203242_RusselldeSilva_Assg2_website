function newPage(url){
    var tab = window.open(url,'_self');
    tab.focus();
}

$("#clock").click(function(){newPage("bus-timings.html")});
$("#route").click(function(){newPage("fastest-route.html")});

$("#see-fastest").hover(
    function(){
        $(this).css({"background-color":"#2699fb",})
        $("a").css({"color":"white"})
        $("path").css({"stroke":"white"})
    }, 
    function(){
        $(this).css({"background-color":"white",})
        $("a").css({"color":"#2699fb"})
        $("path").css({"stroke":"#2699fb"})
    }
);
$("#see-fastest").click(function(){newPage("fastest-route.html")});