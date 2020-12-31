function newPage(url){ //open new page in same tab
    var tab = window.open(url,'_self');
    tab.focus();
}

if (sessionStorage.getItem("clicked")){
    sessionStorage.setItem("clicked",true);
}
//let clicked = false;
let newLink = '<li class="breadcrumb-item"><a href="bus-timings.html">Bus Timings</a></li>';

$("#clock").click(function(){newPage("bus-timings.html")});
$("#route").click(function(){
    newPage("fastest-route.html")
    sessionStorage.removeItem("clicked");
});

$("#see-fastest").hover( //change button color on hover
    function(){
        $(this).css({"background-color":"#2699fb",})
        $("#fast-btn").css({"color":"white"})
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
    sessionStorage.removeItem("clicked");
    sessionStorage.setItem("clicked",true);
}); //change page + update breadcrumb
$("#go").click(function(){newPage("map.html")});

// ---------------- Bus Timings (LTA DataMall) ------------------
$(document).ready(function() {
    function getETA(nextBus){ //find time diff between CPU time and bus arrival time
        let now = new Date();
        let estArrival = new Date(nextBus);
        console.log(estArrival);
        let diff = estArrival.getTime() - now.getTime();
        return diff;
    };
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
    };
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
    };
    function initBusStopList(code,data){
        for (let i = 0; i<(data.value).length;i++){
            if (data.value[i].BusStopCode == code){
                $('#name').html(`${data.value[i].Description}`);
                return data.value[i];
            }
        };
        return false;
    };
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
                tdNew1.setAttribute("class",`nextBus1 bg-${seats(data.Services[i].NextBus.Load)} text-white`);
                tdNew1.setAttribute("id",`${i}`);
                let tdNew2  = document.createElement("td");
                tdNew2.setAttribute("class",`nextBus2 bg-${seats(data.Services[i].NextBus2.Load)} text-white`);
                tdNew2.setAttribute("id",`${i}`);
                let tdNew3  = document.createElement("td");
                tdNew3.setAttribute("class",`nextBus3 bg-${seats(data.Services[i].NextBus3.Load)} text-white`);
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
        let skip = 0;
        let init = false;
        let boundary = [14039,22159,28091,43829,47629,56031,64171,70281,83059,98149,99189];
        for (let i = 0; i<boundary.length; i++){
            if (boundary[i] >= parseInt(code)){
                skip = i*500;
                break;
            }
        }
        //while (init === false){
        var settings = {
            "url": `https://cors-anywhere.herokuapp.com/http://datamall2.mytransport.sg/ltaodataservice/BusStops?$skip=${skip}`,
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
            let init = initBusStopList(code,data);
            let latitude = init.Latitude;
            let longtitude = init.Longitude; 
            sessionStorage.setItem('latitude',latitude);
            sessionStorage.setItem('longitude',longtitude);
            /*if (init===false){
                skip += 500;
            };*/
        })
        .catch(function (response){
            console.log(response);
        });
        //};
    });

//---------- fastest-route.html ------------
    let departure = $('#search.departure').val();
    if (sessionStorage.getItem('clicked')){
        $('#special-nav #home').after(newLink);
        let latitude = sessionStorage.getItem('latitude');
        let longitude = sessionStorage.getItem('longitude');
        departure = `@${latitude},${longitude}`;
    } else {
        $('#special-nav').filter(":contains(newLink)").remove()
    };
    console.log(departure);

    let arrival = $('#search.arrival').val();


//--------------- map.html ------------------
    // ---------------- Fastest Route (gothere.sg API) --------------
    // {copied from "https://gothere.sg/api/maps/getting-started.html"
    gothere.load("maps");
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
            // Create a directions object.
            var directions = new GDirections(map, document.getElementById("panel"));
            // Get public transport directions.
            var options = {travelMode:G_TRAVEL_MODE_TRANSIT};
            directions.load(`from:${departure} to:${arrival}`, options);
            }
        }
    gothere.setOnLoadCallback(initialize);
});
