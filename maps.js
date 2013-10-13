$(document).ready(function ()
{

    L_PREFER_CANVAS = true;
    L_DISABLE_3D = true;

    Parse.initialize("cumLBO8rBloI9peNr7TuU2q6TOJdqL7mMz5faNFi", "YSfUfo6hXUwYPbPelzhO1v78i7C4pBv1RTFVSWJW");
    var Note = Parse.Object.extend("NoteObject");

    setMapSize();
    var marker;
    var timer;
    var map;
    var rides;
    var interval = 60;
    var count = 0;
    var val;


    $('#map, #ctrls, #btnStart, #btnStop, #btnShow, #btnHide, #txt, #aboutPage').hide();
    $('#maps').show();


    $(".ride").click(function ()
    {
        $("#prependedRide").val(this.id);
    });

    $(".day").click(function ()
    {
        $("#prependedDay").val(this.id);
    });

    $("#btnChoose").click(function ()
    {
        $('#maps').hide();
        $('#map, #ctrls, #btnStart, #btnShow').show();
        val = $('#prependedRide').val() + '_' + $('#prependedDay').val();
        $.get('ride_data.csv', function (csv)
        {
            var rides = $.csv.toObjects(csv);
            $.each(rides, function (i, json)
            {
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
        $('#aboutPage, #aboutTxt').show();
        $('#donateTxt').hide();
    });

    $("#btnDonate").click(function ()
    {
        $('#maps').hide();
        $('#aboutPage, #donateTxt').show();
        $('#aboutTxt').hide();
    });

    $("#btnBack").click(function ()
    {
        $('#aboutPage, #aboutTxt, #donateTxt').hide();
        $('#maps').show();
    });


    $("#btnChange").click(function ()
    {
        location.reload();
    });


    $("#btnShow").click(function ()
    {
        $("#txt, #btnHide").show();
        $("#map, #btnShow, .controls-row").hide();

    });
    $("#btnHide").click(function ()
    {
        $("#txt, #btnHide").hide();
        $("#map, #btnShow, .controls-row").show();
    });



    $("#btnStart").click(function ()
    {

        $('#btnStart').hide();
        $('#btnStop').show();
        var prevLatLng;

        timer = $.timer(function ()
        {
            count++;
            //$('#counter').html('<b>Elapsed time:</b> ' + count + ' seconds');
            if (count % interval == 0 || count == 1)
            {
                console.log(count);
                map.on("locationfound", function (location)
                {
                    if (!marker)
                        marker = L.userMarker(location.latlng, { pulsing: true, accuracy: 500, smallIcon: true
                        }).addTo(map);
                    marker.setLatLng(location.latlng);
                    marker.setAccuracy(location.accuracy);
                    marker.addTo(map);

                    if(location.latlng != prevLatLng)
                    {
                        SavePosition(val, count, 'tracker', location.latlng, Note);
                    }
                    prevLatLng = location.latlng;    
                    

                });

                var zm = map.getZoom();
                map.locate({ watch: false, locate: true, setView: true, enableHighAccuracy: true, maxZoom: zm });


            }

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

function SavePosition(val, count, txt, latlng, Note)
{
    
    var note = new Note();
    var point = new Parse.GeoPoint({latitude: latlng.lat, longitude: latlng.lng});
	note.save({
            count: count,
            title:val, 
            body:txt,
            location:point }, 
        {
		success:function(note) {
            $('#counter').html('Saved the object at: ' + count + ' seconds');
			console.log("Saved the object!");
		}, 
		error:function(note,error) {
			console.dir(error);
			alert("Sorry, I couldn't save it.");
		}
	});        
  
}



function createMap(map, json)
{
    
    var map = new L.map('map', 
    {
        center: [json.lng, json.lat],
        zoom: 13
    });

    var osmTile = "http://{s}.tile.cloudmade.com/ba8af3a046054cefaed65ea8ca002dc1/101270/256/{z}/{x}/{y}.png";
    var osmCopyright = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap contributors</a>';
                        '<a href="http://creativecommons.org/licenses/by-sa/2.0/"></a>CC-BY-SA</a>, Imagery Â© <a href="http://cloudmade.com">CloudMade</a>'; 
    var osmLayer = new L.TileLayer(osmTile, { maxZoom: 17, attribution: osmCopyright });  
    map.addLayer(osmLayer);
    //addLocateControl(map);
    showElevation(map, json.gpx_file);
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
        theme: "lime-theme", 
        width: 125,
        height: 100,
        margins: { top: 10, right: 10, bottom: 20, left: 10 },
        useHeightIndicator: true, 
        interpolation: "linear", 
        hoverNumber: { decimalsX: 3, decimalsY: 0 },
        xTicks: undefined,
        yTicks: undefined
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
      $("#map").height('150');
	}
	else if(res > 320 && res < 400){
      $("#map").height('175');
    } 
 	else if(res >= 400 && res < 480 ){
      $("#map").height('200');
    }
 	else if(res >= 480 && res < 540 ){
      $("#map").height('300');
 	}
 	else if(res > 540 ){
 	  $("#map").height('400');
 	}
     
}

function formatTime(time) {
    time = time / 10;
    var min = parseInt(time / 6000),
        sec = parseInt(time / 100) - min,
        hundredths = pad(time - (sec * 100) - (min * 6000), 2);

    return (min > 0 ? pad(min, 2) : "00") + ":" + pad(sec, 2) + ":" + hundredths;
}

function pad(number, length) {
    var str = '' + number;
    while (str.length < length) {str = '0' + str;}
    return str;
}