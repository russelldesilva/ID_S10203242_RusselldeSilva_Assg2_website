function newPage(url){ //open new page in same tab
    var tab = window.open(url,'_self');
    tab.focus();
}

let newLink = '<li class="breadcrumb-item"><a href="bus-timings.html">Bus Timings</a></li>'; //link to previous page to be inserted into breadcrumb if button is clicked */

$("#clock").click(function(){newPage("bus-timings.html")}); //open bus-timings.html when #clock (index.html) is clicked
$("#route").click(function(){ 
    newPage("fastest-route.html") //open fastest-route.html when #route (index.html) is clicked
    sessionStorage.removeItem("clicked"); //restore back to default where sessionStorage.getItem("clicked") = null
    $('#special-nav').filter(":contains(newLink)").remove()
});

$("#see-fastest").hover( //change button and text color on hover
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

// ---------------- Bus Timings (LTA DataMall) ------------------
$(document).ready(function() {
    //Bus Stops API only shows 500 bus stops at a time
    //boundary = an array with the last bus stop code of each group of 500
    let boundary = [14039,22159,28091,43829,47629,56031,64171,70281,83059,98149,99189]; 
    let skip = 0; //skip x number of bus stops when calling Bus Stops API
    function getInfo(nextBus){ //find info of next bus (arrival time + wheelchair accessibility)
        let now = new Date(); //current date and time
        let estArrival = new Date(nextBus.EstimatedArrival); //date and time of next bus
        let diff = estArrival.getTime() - now.getTime(); //time before next bus arrives
        let feature = nextBus.Feature;
        let wheelchair = "";
        if (feature === 'WAB'){ //check if bus is wheelchair accessible
            wheelchair = '<img src = "images/Wheelchair_symbol.svg">'; //img tag for wheelchair svg
        };
        let nextbusinfo = [diff,wheelchair];
        return nextbusinfo;
    };
    function roundOff(eta){ //round off est arrival time to nearest min
        if (eta != 'NaN'){ //check if eta is available
            let nMin = eta / 60000;
            nMin = Math.round(nMin);
            //if eta is less than 1mins, display "Arr" 
            //(as per LTA  recommendations "https://www.mytransport.sg/content/dam/datamall/datasets/LTA_DataMall_API_User_Guide.pdf" page 16)
            if (nMin < 1){ 
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
    function seats(load){ //colour table cells according to how many seats are available
        //uses bootstrap colour codes (success, warning and danger)
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
    function initBusStopList(code,data){ //check if bus stop code is in group of 500 records loaded
        for (let i = 0; i<(data.value).length;i++){
            if (data.value[i].BusStopCode == code){
                return data.value[i]; //return bus stop data if true
            }
        };
        return false; //else return false
    };
    //search and display bus timings on click
    $("form#bus-timings").submit(function(event){
        $('.timing-table > tr,td,th').remove(); //remove already loaded bus times
        $('#arrival').css({visibility:"hidden"}); //hide headers
        let code = $('#search').val();
        $("input#search").attr('class',"form-control"); //reset search bar to default look
        $('#search.text-danger').css({visibility:"hidden"}); //hide error message
        for (let i = 0; i<boundary.length; i++){ //loop thru each element in boundary to find which group of 500 the bus stop code entered is in
            if (boundary[i] >= parseInt(code)){
                skip = i*500; //skip x number of bus stops when calling Bus Stops API
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
        //ajax call for bus stop info API
        $.ajax(settings)
        .done(function (data) {
            let stopData = initBusStopList(code,data);
            if (stopData != false){ //check if bus stop is in data loaded
                $("input#search").attr('class',"form-control is-valid"); //add is-valid class to search bar for bootstrap formatting
                $('#name').html(`${stopData.Description}`); //display bus stop name
                $("#see-fastest").click(function(){ //change page and store required data in session storage for other pages
                    newPage("fastest-route.html"); 
                    sessionStorage.removeItem("clicked");
                    sessionStorage.setItem("clicked",true); 
                    sessionStorage.setItem("code",code); 
                    stopDataStr = JSON.stringify(stopData);
                    sessionStorage.setItem("stopData",stopDataStr);
                }); 
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
                    for (let i = 0; i<(data.Services).length; i++){ //create rows and columns in tbody for each bus service
                        let trNew = document.createElement("tr");
                        let thNew = document.createElement("th");
                        thNew.setAttribute("class","serviceNo"); //set attributes for th (representing each bus service)
                        thNew.setAttribute("scope","row");
                        thNew.setAttribute("id",`${i}`);
                        trNew.appendChild(thNew); //append th to tr
                        let tdNew1  = document.createElement("td");
                        //set attributes for td (for each NextBus)
                        //seats() will return string used in bootstrap table cells formatting to determine colour of each cell (bg-success, bg-warning, bg-danger)
                        tdNew1.setAttribute("class",`nextBus1 bg-${seats(data.Services[i].NextBus.Load)} text-white`); 
                        tdNew1.setAttribute("id",`${i}`);
                        let tdNew2  = document.createElement("td");
                        tdNew2.setAttribute("class",`nextBus2 bg-${seats(data.Services[i].NextBus2.Load)} text-white`);
                        tdNew2.setAttribute("id",`${i}`);
                        let tdNew3  = document.createElement("td");
                        tdNew3.setAttribute("class",`nextBus3 bg-${seats(data.Services[i].NextBus3.Load)} text-white`);
                        tdNew3.setAttribute("id",`${i}`);
                        trNew.appendChild(tdNew1); //append all td to tr
                        trNew.appendChild(tdNew2);
                        trNew.appendChild(tdNew3);
                        $('tbody').append(trNew); //append newly created tr to existing tbody
                        $(`th.serviceNo#${i}`).html(`${data.Services[i].ServiceNo}`); //display bus service number in newly created th
                        let nextbus1 = getInfo(data.Services[i].NextBus); //get bus arrival times and wheelchair accessibility info from each NextBus
                        let nextbus2 = getInfo(data.Services[i].NextBus2);
                        let nextbus3 = getInfo(data.Services[i].NextBus3);
                        nextbus1[0] = roundOff(nextbus1[0]); //round off bus timings to nearest min
                        nextbus2[0] = roundOff(nextbus2[0]);
                        nextbus3[0] = roundOff(nextbus3[0]);
                        //check if next bus exists and display info in respective td
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
                $('#arrival').css({visibility:"visible"}); //make headers visible
            } else { //if bus stop code entered invalid
                $("input#search").attr('class',"form-control is-invalid"); //add is-invalid class to search bar for bootstrap formatting
                $('#search.text-danger').css({visibility:"visible"}); //display error message
            }
        })
        .catch(function (response){
            console.log(response);
        });
        event.preventDefault(); //prevent page from reloading when form is submitted
    });

//---------- fastest-route.html ------------
    if (sessionStorage.getItem('clicked')){ //check if button on previous page was clicked
        $('#special-nav #home').after(newLink);
        dcode = sessionStorage.getItem("code");
        $('#search.departure').val(dcode); //display input entered on previous page in search bar
        $("#search.departure").attr('class',"departure form-control is-valid")
        let stopData = JSON.parse(sessionStorage.getItem("stopData")); //parse bus stop data loaded from previous page
        let dlatitude = parseFloat(stopData.Latitude);
        let dlongitude = parseFloat(stopData.Longitude);
        let departure = JSON.stringify([dlatitude,dlongitude]); 
        sessionStorage.setItem("departure",departure); //store langitude and logitude in session storage for next page to process 
    } else {
        $('#search.departure').val("");
    };
    $("form.departure").first().submit(function(event){
        $('#departure.spinner-border').css({visibility:"visible"}); //make spinner visible before loading
        $("#search.departure").attr('class',"departure form-control") //reset search bar to default look
        let dcode = $('#search.departure').val();
        if (dcode.length === 5){ //start processing when 5 characters are entered in the search bar
            for (let i = 0; i<boundary.length; i++){ //loop thru each element in boundary to find which group of 500 the bus stop code entered is in
                if (boundary[i] >= parseInt(dcode)){
                    skip = i*500; //skip x number of bus stops when calling Bus Stops API
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
            }
            //ajax call for bus stop info API (to display bus stop name)
            $.ajax(settings)
            .done(function (data) {
                let stopData = initBusStopList(dcode,data);
                if (stopData != false){
                    let dlatitude = parseFloat(stopData.Latitude); //parse bus stop data from previous API call
                    let dlongitude = parseFloat(stopData.Longitude);
                    let departure = JSON.stringify([dlatitude,dlongitude]);
                    sessionStorage.setItem("departure",departure); //store langitude and logitude in session storage for next page to process
                    $('#departure.spinner-border').css({visibility:"hidden"}); //hide spinner when get request is complete
                    $("#search.departure").attr("class", "departure form-control is-valid"); //add is-valid class to search bar for bootstrap formatting
                    $('#departure.text-danger').css({visibility:"hidden"}); //hide error message
                }
                else {
                    $('#departure.spinner-border').css({visibility:"hidden"}); //hide spinner when get request is complete
                    $("#search.departure").attr("class", "departure form-control is-invalid"); //add is-invalid class to search bar for bootstrap formatting
                    $('#departure.text-danger').css({visibility:"visible"}); //display error message
                }
            });
        } else {
            $("#search.departure").attr("class","departure form-control is-invalid");
        };
        event.preventDefault();
    });
    $('form.arrival').last().submit(function(event){
        $('#arrival.spinner-border').css({visibility:"visible"}); //make spinner visible before loading
        let acode = $('#search.arrival').val();
        $("#search.arrival").attr('class',"arrival form-control") //reset search bar to default look
        for (let i = 0; i<boundary.length; i++){ //loop thru each element in boundary to find which group of 500 the bus stop code entered is in
            if (boundary[i] >= parseInt(acode)){
                skip = i*500; //skip x number of bus stops when calling Bus Stops API
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
                let alatitude = parseFloat(stopData.Latitude); //parse bus stop data from previous API call
                let alongitude = parseFloat(stopData.Longitude);
                let arrival = JSON.stringify([alatitude,alongitude]);
                sessionStorage.setItem("arrival",arrival); //store langitude and logitude in session storage for next page to process
                $('#arrival.spinner-border').css({visibility:"hidden"}); //hide spinner when get request is complete
                $("#search.arrival").attr('class',"arrival form-control is-valid"); //add is-valid class to search bar for bootstrap formatting
                $('#arrival.text-danger').css({visibility:"hidden"}); //hide error message
            }
            else {
                $('#arrival.spinner-border').css({visibility:"hidden"}); //hide spinner when get request is complete
                $("#search.arrival").attr('class',"arrival form-control is-invalid"); //add is-invalid class to search bar for bootstrap formatting
                $('#arrival.text-danger').css({visibility:"visible"}); //display error message
            };
        });
        event.preventDefault(); //prevent page from reloading when form is submitted
    });
    $("#go").click(function(){
        let aClassList = $("#search.arrival").attr('class').split(" "); //extract classes of search bars and store in array
        let dClassList = $("#search.departure").attr('class').split(" ");
        if ((aClassList.includes("is-valid")) && (dClassList.includes("is-valid"))){ //check if is-valid class is in both arrays, meaning that both inputs have been validated
            newPage("map.html") //open new page in same tab if true
        } else {
            alert("Enter 2 valid bus stop codes!"); //otherwise display an error message
        }
    }); 
});
