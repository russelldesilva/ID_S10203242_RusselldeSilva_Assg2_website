function newPage(url){
    var tab = window.open(url,'_self');
    tab.focus();
}

$("#clock").click(function(){newPage("bus-timings.html")});
$("#route").click(function(){newPage("fastest-route.html")});