// Set margins for each chart
var height  = 300;
var width   = 600;
var hEach   = 40;

var margin = {top: 15, right: 15, bottom: 45, left: 50};

var countries = [
    {"name":"US", "color" : "steelblue"},
    {"name":"France", "color" : "red"},
    {"name":"Spain", "color" : "purple"},
    {"name":"Italy", "color" : "rgb(255, 196, 0)"},
    {"name":"United Kingdom", "color" : "green"}
]

var chartTypes = [
    {"name" :"Confirmed", "location": {"left": 20, "top": 60, "position":"absolute"}, "ybasis":"zero"},
    {"name" :"ConfirmedDailyIncrease" , "location": {"left": 20, "top": 380, "position":"absolute"}, "ybasis":"zero"},
    {"name" :"ConfirmedSDSMA4" , "location": {"left": 20, "top": 700, "position":"absolute"}, "ybasis":"function"},
    {"name" :"Deaths" , "location": {"left": 650, "top": 60, "position":"absolute"}, "ybasis":"zero"},
    {"name" :"DeathsDailyIncrease" , "location": {"left": 650, "top": 380, "position":"absolute"}, "ybasis":"zero"},
    {"name" :"DeathsSDSMA4" , "location": {"left": 650, "top": 700, "position":"absolute"}, "ybasis":"function"}
]

// parse the date / time
var parseTime = d3.timeParse("%Y-%m-%d");
var tickForm = d3.timeParse("%m-%d");

function LineChart () {
    d3.csv('../sql/SumByCountryDateAnalysis.csv', function (error, dataProto) {
        
        // format the data
        dataProto.forEach(function(d) {
            d.Last_Update = parseTime(d.Last_Update);
            d.Confirmed = +d.Confirmed;
            d.ConfirmedDailyIncrease = +d.ConfirmedDailyIncrease;
            d.ConfirmedSDSMA4 = +d.ConfirmedSDSMA4;
            d.Deaths = +d.Deaths;
            d.DeathsDailyIncrease = +d.DeathsDailyIncrease;
            d.DeathsSDSMA4 = +d.DeathsSDSMA4;
        });
        
        data = dataProto.filter(function(d){return d.Last_Update>=parseTime("2020-03-01")})

        // Create and paint each chart
        chartTypes.forEach(function(chartType) {

            cWidth = width - margin.left - margin.right;
            cHeight = height - margin.top - margin.bottom;
            
            var svg = d3.select('body').append("svg")
            .attr("width",  cWidth + margin.left + margin.right)
            .attr("height", cHeight + margin.top + margin.bottom)
            .attr("id","svg" + chartType.name)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            $("#svg" + chartType.name).css(chartType.location);

            /////////////////////
            // Paint the Chart //
            /////////////////////
            // set the ranges
            var x = d3.scaleTime().range([0, cWidth]);
            x.domain(d3.extent(data, function(d) { return d.Last_Update; })).nice();

            var y = d3.scaleLinear().range([cHeight, 0]);
            ybasis = chartType.ybasis =="zero" ? 0 : -d3.max(data, function(d) {return d[chartType.name] })/2
            y.domain([ybasis,d3.max(data, function(d) {return d[chartType.name] })]);

            
            var valueline = d3.line()
            .x(function(d) { return x(d.Last_Update); })
            .y(function(d) { return y(d[chartType.name]);  })
            .curve(d3.curveMonotoneX);

            /* Paint each Country line */
            countries.forEach(function(country) {
                var dataFiltered = data.filter(function(d){return d.Country_Region==country.name})

                svg.append("path")
                .data([dataFiltered]) 
                .attr("class", "line")  
                .attr("id", "line" + country.name)
                .attr("stroke",country.color)
                .attr("d", valueline); 

                // Add the X Axis
                svg.append("g")
                .attr("transform", "translate(0," + cHeight + ")")
                .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%m-%d")))
                .selectAll("text")	
                    .style("text-anchor", "end")
                    .attr("dx", "-.8em")
                    .attr("dy", ".15em")
                    .attr("transform", "rotate(-65)");

                // Add the Y Axis
                svg.append("g")
                .attr("transform", "translate(0,0)")
                .call(d3.axisLeft(y));

            });
        });
    });
};

  