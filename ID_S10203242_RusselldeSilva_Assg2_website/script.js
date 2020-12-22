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
$("#see-fastest").click(function(){
    newPage("fastest-route.html");
    document.onchange(function(){
        let newNav = document.createElement("li", {class : "breadcrumb-item"});
        let newLink = Object.assign(document.createElement("a"), {href : "bus-timings.html", innerText : "Bus Timings"});
        alert(newLink);
        newNav.appendChild(newLink);
        let list = document.getElementById("special-nav");
        list.insertBefore(newNav, list.childNodes[1]);
    });
});
$("#go").click(function(){newPage("map.html")});

// copied from "https://gothere.sg/api/maps/getting-started.html"
/*gothere.load("maps");
var map = new GMap2(document.getElementById("map"));
var smallControl = new GSmallMapControl();
map.addControl(smallControl, new GControlPosition(G_ANCHOR_BOTTOM_LEFT));*/