function getPathtest(map)
{
    var val = $('#prependedDay') .val();
    var txt;
    if(val=='Day 1')
    {
       map = createMap('31.767389', '35.194145', 'data/efrat.gpx');
       txt = 'data/pages/day1.html';    
    }
    else if(val=='Day 2')
    {
       map = createMap('31.671778', '35.163284', 'data/gilo2cisco.gpx');
       $("#txt").html('Day 2');
       txt = 'data/pages/day2.html';   
    }
    else if(val=='Day 3')
    {
        map = createMap('32.47927646231825', '34.996033', 'data/offroad.gpx');
        txt = 'data/pages/day3.html';       
    } 
    else if(val=='Day 4') 
    {
        map = createMap('32.403507', '34.97612028027303', 'work2home.gpx');
        txt = 'data/pages/day4.html';       
    } 

    $.get(txt, function(data) { 
            $("#txt").html(data);
      });
      
    return map                         
   
}