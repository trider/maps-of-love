
$(document).ready(function ()
{

    L_PREFER_CANVAS = true;
    L_DISABLE_3D = true;

    setMapSize();
    var marker;
    var timer;
    var count = 0;
    var map;
    var rides;

    var locopts = { watch: false, locate: true, setView: true, enableHighAccuracy: true };
    
    $('#map, #ctrls, #btnStop, #btnHide, #txt, #aboutPage').hide();
    $('#maps').show();


    $("#offroad").click(function ()
    {
        $("#prependedRide").val("Offroad");
    });
    $("#onroad").click(function ()
    {
        $("#prependedRide").val("Onroad");
    });
    $("#challange").click(function ()
    {
        $("#prependedRide").val("Challange");
    });
    $("#touring").click(function ()
    {
        $("#prependedRide").val("Touring");
    });


    $("#day1").click(function ()
    {
        $("#prependedDay").val("Day1");
    });
    $("#day2").click(function ()
    {
        $("#prependedDay").val("Day2");
    });
    $("#day3").click(function ()
    {
        $("#prependedDay").val("Day3");
    });
    $("#day4").click(function ()
    {
        $("#prependedDay").val("Day4");
    });
    $("#day5").click(function ()
    {
        $("#prependedDay").val("Day5");
    });


    $("#btnChoose").click(function ()
    {
        $('#maps').hide();
        $('#map, #ctrls').show();
        var val = $('#prependedRide') .val() + '_' + $('#prependedDay') .val();
        $.get('ride_data.csv', function (csv)
        {
            var rides = $.csv.toObjects(csv);
            $.each(rides, function (i, json){
                if (json.name === val)
                {
                    map = createMap(map, json);        
                }
            }); 
         }); 
    });

    $("#btnAbout").click(function ()
    {
        $('#maps').hide();
        $('#aboutPage').show();
    });

    $("#btnBack").click(function ()
    {
        $('#maps').show();
        $('#aboutPage').hide();
    });


    $("#btnChange").click(function ()
    {
        location.reload();
    });


    $("#btnShow").click(function ()
    {
        $("#txt, #btnHide").show();
        $("#map, #btnShow").hide();

    });
    $("#btnHide").click(function ()
    {
        $("#txt, #btnHide").hide();
        $("#map, #btnShow").show();
    });

    $("#btnStart").click(function ()
    {

        $('#btnStart').hide();
        $('#btnStop').show();
        map.getZoom();
        timer = $.timer(function ()
        {
            count++;

            //$('#counter').html('<b>Elapsed time:</b> ' + count + ' seconds');
            map.on("locationfound", function (location)
            {
               if (!marker)
                    marker = L.userMarker(location.latlng, { pulsing: true, accuracy: 500, smallIcon: true
                }).addTo(map);
                marker.setLatLng(location.latlng);
                marker.setAccuracy(location.accuracy);
                marker.addTo(map);
            });
            map.locate(locopts);
        });
        timer.set({ time: 1000, autostart: true });
    });

    $("#btnStop").click(function ()
    {
        $('#counter').html('<br>');
        $('#btnStop').hide();
        $('#btnStart').show();
        timer.stop();
    });

});

function createMap(map, json)
{
    
    var map = new L.map('map', 
    {
        center: [json.lng, json.lat],
        zoom: 10
    });

    var osmTile = "http://{s}.tile.cloudmade.com/ba8af3a046054cefaed65ea8ca002dc1/101270/256/{z}/{x}/{y}.png";
    var osmCopyright = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap contributors</a>';
                        '<a href="http://creativecommons.org/licenses/by-sa/2.0/"></a>CC-BY-SA</a>, Imagery Â© <a href="http://cloudmade.com">CloudMade</a>';
    
    var osmLayer = new L.TileLayer(osmTile, { maxZoom: 17, attribution: osmCopyright });  
    map.addLayer(osmLayer);
    
    addLocateControl(map);
    if ($('#elv').is(':checked')) {
       showElevation(map, json.gpx_file);
    }
    else
    {
        addPath(map, json.gpx_file);
    } 
    $.get(json.html_file, function (data){$("#txt").html(data)});
    return map;
}

function addPath(map,path)
{
    new L.GPX(path, {
        async: true,
        marker_options: {
            startIconUrl: 'pin-icon-start.png',
            endIconUrl: 'pin-icon-end.png',
            shadowUrl: 'pin-shadow.png'
        }
    }).on('loaded', function (e)
    {
        getTitle(e)
    }).addTo(map);

}


function setMarker(map, marker)
{
   
    map.on("locationfound", function (location)
        {
            if (!marker)
                marker = L.userMarker(location.latlng, { pulsing: true, accuracy: 500,
                    smallIcon: true
                }).addTo(map);
            marker.setLatLng(location.latlng);
            marker.setAccuracy(location.accuracy);
            marker.addTo(map);
        });
    return marker
}

function addLocateControl(map)
{
    
    L.control.locate({
        position: 'topleft',  
        drawCircle: true,  
        metric: true,  
        setView: true,
        maxZoom: 16, 
        strings: {
            title: "Show me where I am",  
            popup: "You are within {distance} {unit} from this point",  
            outsideMapBoundsMsg: "You seem located outside the boundaries of the map"
        }
    }).addTo(map);
}

function showElevation(map, path)
{
    
        var el = L.control.elevation({
        position: "topright",
        theme: "lime-theme", //default: lime-theme
        width: 125,
        height: 100,
        margins: {
            top: 10,
            right: 10,
            bottom: 20,
            left: 10
        },
        useHeightIndicator: true, //if false a marker is drawn at map position
        interpolation: "linear", //see https://github.com/mbostock/d3/wiki/SVG-Shapes#wiki-area_interpolate
        hoverNumber: {
            decimalsX: 3, //decimals on distance (always in km)
            decimalsY: 0, //deciamls on height (always in m)
            formatter: undefined //custom formatter function may be injected
        },
        xTicks: undefined, //number of ticks in x axis, calculated by default according to width
        yTicks: undefined //number of ticks on y axis, calculated by default according to height
    });
    var g=new L.GPX(path, {async: true});
    g.on("addline", function (e)
    {
        getTitle(e);
        el.addData(e.line);
    });
    g.addTo(map);
    el.addTo(map);

}

function getTitle(e)
{
    $('.brand').text(e.target.get_name() + ' ('
            + Math.round(e.target.get_distance() / 1000) + 'km)');
}

function addPopup(latlng, map)
{
  var popup = L.popup();
    popup
        .setLatLng(latlng)
        .setContent(latlng.toString())
        .openOn(map);
    var ltlng = latlng.toString();
    var marker = L.marker(latlng).addTo(map); 
}


function setMapSize(){
	var res =  screen.availHeight;
	      
	if(res <= 320){
      $("#map").height('200px');
	}
	else if(res > 320 && res < 400){
      $("#map").height('250px');
    } 
 	else if(res >= 400 && res < 480 ){
      $("#map").height('275px');
    }
 	else if(res >= 480 && res < 540 ){
      $("#map").height('350px');
 	}
 	else if(res > 540 ){
 	  $("#map").height('400px');
 	}
     
}
