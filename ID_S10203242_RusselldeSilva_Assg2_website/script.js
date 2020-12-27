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
    function getETA(nextBus){ //find time diff between CPU time and bus arrival time
        let now = new Date();
        let estArrival = new Date(nextBus);
        console.log(estArrival);
        let diff = estArrival.getTime() - now.getTime();
        return diff;
    }

    function roundOff(eta){
        if (eta != 'NaN'){
            let nMin = eta / 60000;
            nMin = Math.round(nMin);
            if (nMin < 2){
                return "Arr";
            }
            else {
                return nMin;
            }
        }
        else {
            return false;
        }   
    }
    function seats(load){
        if (load === 'SEA'){
            return "success";
        }
        else if (load === 'SDA'){
            return "warning";
        }
        else if (load === 'LSD'){
            return "danger";
        };
    }
    //search and display bus timings on click
    $('body').on("click", "button", function(){
        $('.timing-table > tr,td,th').remove();
        $('#arrival').css({visibility:"visible"});
        let code = $('#search').val();
        var settings = {
            "url": `https://cors-anywhere.herokuapp.com/http://datamall2.mytransport.sg/ltaodataservice/BusArrivalv2?BusStopCode=${code}`,
            "method": "GET",
            "timeout": 0,
            "headers": {
              "AccountKey": "eGXZ5SGHSdGIRwjg2oCZOw== "
            },
          };
          //ajax call for bus timing API
          $.ajax(settings)
          .done(function (data) {
            //display bus stop code
            code = data.BusStopCode
            $('#code').html(`${code}`);
            //display bus timings
            for (let i = 0; i<(data.Services).length; i++){
                let trNew = document.createElement("tr");
                let thNew = document.createElement("th");
                thNew.setAttribute("class","serviceNo");
                thNew.setAttribute("scope","row");
                thNew.setAttribute("id",`${i}`);
                trNew.appendChild(thNew);
                let tdNew1  = document.createElement("td");
                tdNew1.setAttribute("class",`nextBus1 table-${seats(data.Services[i].NextBus.Load)}`);
                tdNew1.setAttribute("id",`${i}`);
                let tdNew2  = document.createElement("td");
                tdNew2.setAttribute("class",`nextBus2 table-${seats(data.Services[i].NextBus2.Load)}`);
                tdNew2.setAttribute("id",`${i}`);
                let tdNew3  = document.createElement("td");
                tdNew3.setAttribute("class",`nextBus3 table-${seats(data.Services[i].NextBus3.Load)}`);
                tdNew3.setAttribute("id",`${i}`);
                trNew.appendChild(tdNew1);
                trNew.appendChild(tdNew2);
                trNew.appendChild(tdNew3);
                $('tbody').append(trNew);
                $(`th.serviceNo#${i}`).html(`${data.Services[i].ServiceNo}`);
                let eta1 = getETA(data.Services[i].NextBus.EstimatedArrival).toString();
                let eta2 = getETA(data.Services[i].NextBus2.EstimatedArrival).toString();
                let eta3 = getETA(data.Services[i].NextBus3.EstimatedArrival).toString();
                console.log(eta1,eta2,eta3);
                eta1 = roundOff(eta1);
                eta2 = roundOff(eta2);
                eta3 = roundOff(eta3);
                if (eta1 != false){
                    $(`td#${i}.nextBus1`).html(`${eta1}`);
                };
                if (eta2 != false){
                    $(`td#${i}.nextBus2`).html(`${eta2}`);
                };
                if (eta3 != false){
                    $(`td#${i}.nextBus3`).html(`${eta3}`);
                };
            };
        });

        /*let skip = 0;
        let init = false;
        while (init === false){*/
            var settings = {
                "url": `https://cors-anywhere.herokuapp.com/http://datamall2.mytransport.sg/ltaodataservice/BusStops?$skip=`,
                "method": "GET",
                "timeout": 0,
                "headers": {
                  "X-Requested-With": "XMLHttpRequest",
                  "Access-Control-Allow-Origin": "*",
                  "AccountKey": "eGXZ5SGHSdGIRwjg2oCZOw== "
                },
              };
              //ajax call for bus stop info API (to display bus stop name)
            $.ajax(settings)
            .done(function (data) {
                for (let i = 0; i<(data.value).length;i++){
                    if (data.value[i].BusStopCode == code){
                        $('#name').html(`${data.value[i].Description}`);
                        //init = true;
                    }
                };
                /*if (init === false){
                    skip += 500;
                };*/
            })
            .catch(function (response){
                console.log(response);
            });
        //};
    });
});