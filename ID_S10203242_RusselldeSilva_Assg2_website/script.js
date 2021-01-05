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
$("#go").click(function(){newPage("map.html")});

// ---------------- Bus Timings (LTA DataMall) ------------------
$(document).ready(function() {
    let boundary = [14039,22159,28091,43829,47629,56031,64171,70281,83059,98149,99189];
    let skip = 0;
    function getInfo(nextBus){ //find time diff between CPU time and bus arrival time
        let now = new Date();
        let estArrival = new Date(nextBus.EstimatedArrival);
        let diff = estArrival.getTime() - now.getTime();
        let feature = nextBus.Feature;
        let wheelchair = "";
        if (feature === 'WAB'){
            wheelchair = '<img src = "images/Wheelchair_symbol.svg">';
        };
        let nextbusinfo = [diff,wheelchair];
        return nextbusinfo;
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
                "X-Requested-With": "XMLHttpRequest",
                "Access-Control-Allow-Origin": "*",
                "AccountKey": "eGXZ5SGHSdGIRwjg2oCZOw== "
            },
          };
          //ajax call for bus timing API
          $.ajax(settings)
          .done(function (data) {
            //display bus stop code
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
                let nextbus1 = getInfo(data.Services[i].NextBus);
                let nextbus2 = getInfo(data.Services[i].NextBus2);
                let nextbus3 = getInfo(data.Services[i].NextBus3);
                nextbus1[0] = roundOff(nextbus1[0]);
                nextbus2[0] = roundOff(nextbus2[0]);
                nextbus3[0] = roundOff(nextbus3[0]);
                if (nextbus1 != false){
                    $(`td#${i}.nextBus1`).html(`${nextbus1[0]} ${nextbus1[1]}`);
                };
                if (nextbus2 != false){
                    $(`td#${i}.nextBus2`).html(`${nextbus2[0]} ${nextbus2[1]}`);
                };
                if (nextbus3 != false){
                    $(`td#${i}.nextBus3`).html(`${nextbus3[0]} ${nextbus3[1]}`);
                };
            };
        });
        let init = false;
        
        for (let i = 0; i<boundary.length; i++){
            if (boundary[i] >= parseInt(code)){
                skip = i*500;
                break;
            }
        }
        /*while (init === false && skip < 5500){*/
            var settings = {
                "url": `https://cors-anywhere.herokuapp.com/http://datamall2.mytransport.sg/ltaodataservice/BusStops?$skip=${skip}`,
                "method": "GET",
                "timeout": 0,
                "headers": {
                    "X-Requested-With": "XMLHttpRequest",
                    "Access-Control-Allow-Origin": "*",
                    "AccountKey": "eGXZ5SGHSdGIRwjg2oCZOw== ",
                },
            };
                //ajax call for bus stop info API (to display bus stop name)
            $.ajax(settings)
            .done(function (data) {
                let stopData = initBusStopList(code,data);
                if (stopData != false){
                    $('#name').html(`${stopData.Description}`);
                    $("#see-fastest").click(function(){
                        newPage("fastest-route.html");
                        sessionStorage.removeItem("clicked");
                        sessionStorage.setItem("clicked",true);
                        sessionStorage.setItem("code",code);
                        stopDataStr = JSON.stringify(stopData);
                        sessionStorage.setItem("stopData",stopDataStr);
                    }); //change page + update breadcrumb
                };
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
    if (sessionStorage.getItem('clicked')){
        $('#special-nav #home').after(newLink);
        let dcode = sessionStorage.getItem("code");
        $('#search.departure').val(dcode);
        let stopData = JSON.parse(sessionStorage.getItem("stopData"));
        let dlatitude = parseFloat(stopData.Latitude);
        let dlongitude = parseFloat(stopData.Longitude);
        let departure = JSON.stringify([dlatitude,dlongitude]);
        sessionStorage.setItem("departure",departure);
    } else {
    $('body').on("keyup","#search.departure", function(){
        $('#departure.spinner-border').css({visibility:"visible"});
        $('#special-nav').filter(":contains(newLink)").remove()
        let dcode = $('#search.departure').val();
        sessionStorage.setItem('dcode',dcode);
        for (let i = 0; i<boundary.length; i++){
            if (boundary[i] >= parseInt(dcode)){
                skip = i*500;
                break;
            }
        }
        var settings = {
            "url": `https://cors-anywhere.herokuapp.com/http://datamall2.mytransport.sg/ltaodataservice/BusStops?$skip=${skip}`,
            "method": "GET",
            "timeout": 0,
            "headers": {
                "X-Requested-With": "XMLHttpRequest",
                "Access-Control-Allow-Origin": "*",
                "AccountKey": "eGXZ5SGHSdGIRwjg2oCZOw== ",
            },
        };
            //ajax call for bus stop info API (to display bus stop name)
        $.ajax(settings)
        .done(function (data) {
            let stopData = initBusStopList(dcode,data);
            if (stopData != false){
                let dlatitude = parseFloat(stopData.Latitude);
                let dlongitude = parseFloat(stopData.Longitude);
                let departure = JSON.stringify([dlatitude,dlongitude]);
                sessionStorage.setItem("departure",departure);
                $('#departure.spinner-border').css({visibility:"hidden"});
                $("input.departure").attr('class',"departure form-control is-valid");
            }
            else {
                $('#departure.spinner-border').css({visibility:"hidden"});
                $("input.departure").attr('class',"departure form-control is-invalid");
                $('#departure.text-danger').css({visibility:"visible"});
            }
        });
    });
    //event.preventDefault();
};


$('#search.arrival').keyup(function(){
    $('#arrival.spinner-border').css({visibility:"visible"});
    let acode = $('#search.arrival').val();
    sessionStorage.setItem('acode',acode);
    for (let i = 0; i<boundary.length; i++){
        if (boundary[i] >= parseInt(acode)){
            skip = i*500;
            break;
        }
    }
    var settings = {
        "url": `https://cors-anywhere.herokuapp.com/http://datamall2.mytransport.sg/ltaodataservice/BusStops?$skip=${skip}`,
        "method": "GET",
        "timeout": 0,
        "headers": {
            "X-Requested-With": "XMLHttpRequest",
            "Access-Control-Allow-Origin": "*",
            "AccountKey": "eGXZ5SGHSdGIRwjg2oCZOw== ",
        },
    };
        //ajax call for bus stop info API (to display bus stop name)
    $.ajax(settings)
    .done(function (data) {
        let stopData = initBusStopList(acode,data);
        if (stopData != false){
            let alatitude = parseFloat(stopData.Latitude);
            let alongitude = parseFloat(stopData.Longitude);
            let arrival = JSON.stringify([alatitude,alongitude]);
            sessionStorage.setItem("arrival",arrival);
            $('#arrival.spinner-border').css({visibility:"hidden"});
            $("input.arrival").attr('class',"arrival form-control is-valid");
        }
        else {
            $('#arrival.spinner-border').css({visibility:"hidden"});
            $("input.arrival").attr('class',"arrival form-control is-invalid");
            $('#arrival.text-danger').css({visibility:"visible"});
        };
    });
    //event.preventDefault();
});
    



    
 


//--------------- map.html ------------------
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
            // Create a directions object.
            var directions = new GDirections(map, document.getElementById("panel"));
            // Get public transport directions.
            var options = {travelMode:G_TRAVEL_MODE_TRANSIT};
            directions.load(`from:${departure} to:${arrival}`, options);
            }
        }
    gothere.setOnLoadCallback(initialize);*/
});
