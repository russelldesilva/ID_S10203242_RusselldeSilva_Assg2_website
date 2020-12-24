function newPage(url){ //open new page in same tab
    var tab = window.open(url,'_self');
    tab.focus();
}

$("#clock").click(function(){newPage("bus-timings.html")});
$("#route").click(function(){newPage("fastest-route.html")});

$("#see-fastest").hover( //change button color on hover
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
$("#see-fastest").click(function(){ //change page + update breadcrumb
    newPage("fastest-route.html");
    document.onchange(function(){ // change breadcrumb nav to include prev page (bus-timings.html)
        let newNav = document.createElement("li", {class : "breadcrumb-item"});
        let newLink = Object.assign(document.createElement("a"), {href : "bus-timings.html", innerText : "Bus Timings"});
        alert(newLink);
        newNav.appendChild(newLink);
        let list = document.getElementById("special-nav");
        list.insertBefore(newNav, list.childNodes[1]);
    });
});
$("#go").click(function(){newPage("map.html")});

// ---------------- Fastest Route (gothere.sg API) --------------
// {copied from "https://gothere.sg/api/maps/getting-started.html"
/*gothere.load("maps");
function initialize() {
    if (GBrowserIsCompatible()) {
    // Create the Gothere map object.
    var map = new GMap2(document.getElementById("map"));
    // Set the center of the map.
    map.setCenter(new GLatLng(1.362083, 103.819836), 11);
    // Add zoom controls on the top left of the map.
    map.addControl(new GSmallMapControl());
    // Add a scale bar at the bottom left of the map.
    map.addControl(new GScaleControl());
    }
} 
// }

var directions = new GMap2(map, document.getElementById("directions"));
const travel_m = {travelMode : G_TRAVEL_MODE_TRANSIT};
directions.load("from:orchard road to:changi airport", travel_m);

gothere.setOnLoadCallback(initialize);*/


// ---------------- Bus Timings (LTA DataMall) ------------------
$(document).ready(function() {
    $('body').on("click", "button", function(){
        let code = $('#search').val();
        console.log(`${code}`);
        $('#code').html(`${code}`);
        $.ajax({
            method: "GET",
            url: `https://cors-anywhere.herokuapp.com/http://datamall2.mytransport.sg/ltaodataservice/BusArrivalv2?BusStopCode=${code}`,
            async:true, // copied from "https://repl.it/@malcolmyam/wk0x-ltabusapi-test#script.js"
            crossDomain:true,
            'dataType': "jsonp",
            "timeout": 0,
            "headers": {
            "AccountKey": "eGXZ5SGHSdGIRwjg2oCZOw== ", //Use your own Account Key
            "accept": "application/json",
            'Access-Control-Allow-Origin': '*',
        },
        })
        .done(function (data) {
            console.log("Bus Arrival times" + data);
            code = data.BusStopCode
            console.log(code);
            $('#code').html(`${code}`);
        });
        $.ajax({
            method: "GET",
            url: "https://cors-anywhere.herokuapp.com/http://datamall2.mytransport.sg/ltaodataservice/BusStops",
            async:true, // copied from "https://repl.it/@malcolmyam/wk0x-ltabusapi-test#script.js"
            crossDomain:true,
            'dataType': "jsonp",
            "timeout": 0,
            "headers": {
            "AccountKey": "eGXZ5SGHSdGIRwjg2oCZOw== ", //Use your own Account Key
            "accept": "application/json",
            'Access-Control-Allow-Origin': '*',
        },
        })
        .done(function (data) {
            console.log("Bus Stop Info" + data);
            for (let i = 0; i<data.value.length; i++) {
                if (data.value[i].BusStopCode == code){
                    let name = data.value[i].Description;
                    console.log(name);
                    $('#name').html(`${name}`);
                }
            }
        });
    });
});