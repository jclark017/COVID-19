// Set margins for each chart
var height  = 350;
var width   = 600;
var hEach   = 40;
var cSpace = 10
var hSpace = 20

var i = 0

var margin = {top: 15, right: 15, bottom: 45, left: 50};

var chartTypes = [
    {"name" :"Confirmed", "location": {"left": cSpace, "top": 60 + (i*hSpace) + (i*height), "position":"absolute"}, "ybasis":"zero"},
    {"name" :"ConfirmedDailyIncrease" , "location": {"left": (i*cSpace) + width, "top": 60 + (i*hSpace) + (i*height), "position":"absolute"}, "ybasis":"zero"},
    /*{"name" :"ConfirmedSDSMA4" , "location": {"left": (3*cSpace) + (2*width), "top": 60 + (i*hSpace) + (i*height), "position":"absolute"}, "ybasis":"function"},*/
    {"name" :"Deaths" , "location": {"left": cSpace, "top": 60 + (i*hSpace) + (i*height), "position":"absolute"}, "ybasis":"zero"},
    {"name" :"DeathsDailyIncrease" , "location": {"left": (i*cSpace) + width, "top": 60 + (i*hSpace) + (i*height), "position":"absolute"}, "ybasis":"zero"},
    /*{"name" :"DeathsSDSMA4" , "location": {"left": (6*cSpace) + (5*width), "top": 60 + (i*hSpace) + (i*height), "position":"absolute"}, "ybasis":"function"},*/
    {"name" :"TodayPositiveTestRate" , "location": {"left": cSpace, "top": 60 + (i*hSpace) + (i*height), "position":"absolute"}, "ybasis":"zero"},    
    {"name" :"hospitalizedCurrently" , "location": {"left": (i*cSpace) + width, "top": 60 + (i*hSpace) + (i*height), "position":"absolute"}, "ybasis":"zero"},    
    {"name" :"onVentilatorCurrently" , "location": {"left": cSpace, "top": 60 + (i*hSpace) + (i*height), "position":"absolute"}, "ybasis":"zero"}    
]

// parse the date / time
var parseTime = d3.timeParse("%Y-%m-%d");
var parseDate = d3.timeParse("%Y%m%d");
var tickForm = d3.timeParse("%m-%d");

function LineChartState() {
  d3.json('https://covidtracking.com/api/v1/us/daily.json', function (error, dataProto) {
  //d3.json('https://covidtracking.com/api/v1/states/daily.json', function (error, dataProto) {
      /*"date":20200630,
      "state":"AK",
      "positive":940,
      "negative":111245,
      "pending":null,
      "hospitalizedCurrently":18,
      "hospitalizedCumulative":null,
      "inIcuCurrently":null,
      "inIcuCumulative":null,
      "onVentilatorCurrently":1,
      "onVentilatorCumulative":null,
      "recovered":526,
      "dataQualityGrade":"A",
      "lastUpdateEt":"6/29/2020 00:00",
      "dateModified":"2020-06-29T00:00:00Z",
      "checkTimeEt":"06/28 20:00",
      "death":14,
      "hospitalized":null,
      "dateChecked":"2020-06-29T00:00:00Z",
      "totalTestsViral":112185,
      "positiveTestsViral":null,
      "negativeTestsViral":null,
      "positiveCasesViral":null,
      "fips":"02",
      "positiveIncrease":36,
      "negativeIncrease":3440,
      "total":112185,
      "totalTestResults":112185,
      "totalTestResultsIncrease":3476,
      "posNeg":112185,
      "deathIncrease":0,
      "hospitalizedIncrease":0,
      "hash":"c5005ccb9df1aac9b5921115fc05931c3b67d41c",
      "commercialScore":0,
      "negativeRegularScore":0,
      "negativeScore":0,
      "positiveScore":0,
      "score":0,
      "grade":""

      "state":"AK",
      "notes":"Total tests are taken from the annotations on the charts on the page. \nNegatives = (Totals – Positives)\nPositives occasionally update before totals do; do not revise negatives down, keep the last calculated negative.\nLast Updated (Local Time) = (today's date + time = 00:00) \nAs of May 16, Alaska reports specimens tested; because some people may be tested more than once, this number may be higher than the number of people tested.",
      "covid19Site":"http://dhss.alaska.gov/dph/Epi/id/Pages/COVID-19/monitoring.aspx",
      "covid19SiteSecondary":"http://dhss.alaska.gov/dph/Epi/id/Pages/COVID-19/default.aspx",
      "covid19SiteTertiary":"https://alaska-dhss.maps.arcgis.com/apps/opsdashboard/index.html#/8782a14ef52342e99f866a3b8a3e624a",
      "twitter":"@Alaska_DHSS",
      "covid19SiteOld":"http://dhss.alaska.gov/dph/Epi/id/Pages/COVID-19/default.aspx",
      "name":"Alaska",
      "fips":"02",
      "pui":"",
      "pum":false}

      */
      dataProto.forEach(function(d) {
        d.Last_Update = parseDate(d.date);
        d.TodayPositiveTestRate = (d.positiveIncrease/d.totalTestResultsIncrease)
        d.Confirmed = +d.positive;
        d.ConfirmedDailyIncrease = +d.positiveIncrease;
        d.ConfirmedSDSMA4 = +d.ConfirmedSDSMA4;
        d.Deaths = +d.death;
        d.DeathsDailyIncrease = +d.deathIncrease;
        d.DeathsSDSMA4 = +d.DeathsSDSMA4;
      });
      data = dataProto.filter(function(d){return d.Last_Update>=parseTime("2020-03-01")})
      console.log(data[1]);

      chartTypes.forEach(function(chartType) {
        cWidth = width - margin.left - margin.right;
        cHeight = height - margin.top - margin.bottom;
        
        var svg = d3.select('body').append("svg")
        .attr("width",  cWidth + margin.left + margin.right)
        .attr("height", cHeight + margin.top + margin.bottom)
        .attr("id","svg" + chartType.name)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        chartType.location.top = 120 + (Math.floor(i/2)*hSpace) + (Math.floor(i/2)*height);

        $("#svg" + chartType.name).css(chartType.location);
        
        // Filter data for this state
        var dataFiltered = data
        //Set with Nan excluded for cleaner data
        var dataFilteredNan = data.filter(function(d){return d[chartType.name] })
        
        /////////////////////
        // Paint the Chart //
        /////////////////////
        // set the ranges
        var x = d3.scaleTime().range([0, cWidth]);
        x.domain(d3.extent(dataFiltered, function(d) { return d.Last_Update; })).nice();

        var y = d3.scaleLinear().range([cHeight, 0]);
        ybasis = chartType.ybasis =="zero" ? 0 : Math.min(d3.min(dataFiltered, function(d) {return d[chartType.name] }),
                                                          -d3.max(dataFiltered, function(d) {return d[chartType.name] })
                                                          )
        y.domain([ybasis,d3.max(dataFiltered, function(d) {return d[chartType.name] })]);

        
        var valueline = d3.line()
        .x(function(d) { return x(d.Last_Update); })
        .y(function(d) { return y(d[chartType.name]);  })
        //.curve(curveNMoveAge.N(7));

        /* Paint each Country line */
        
        svg.append("path")
        .data([dataFilteredNan]) 
        .attr("class", "line")  
        .attr("id", "line")
        .attr("d", valueline.curve(curveNMoveAge.N(1))); 

        // Add the X Axis
        svg.append("g")
        .attr("transform", "translate(0," + cHeight + ")")
        .call(d3.axisBottom(x).ticks(5).tickFormat(d3.timeFormat("%m-%d")))
        .selectAll("text")	
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)");

        // Add the Y Axis
        svg.append("g")
        .attr("transform", "translate(0,0)")
        .call(d3.axisLeft(y).ticks(5));

        // Add title

        svg.append("text")
        .attr("x", (width / 3))             
        .attr("y", 0)
        .attr("text-anchor", "middle")  
        .style("font-size", "12px") 
        .style("text-decoration", "underline")  
        .text(chartType.name);

        i = i + 1
      });
    });
}



function LineChart () {
  d3.csv('../sql/SumByCountryStateDateAnalysis.csv', function (error, dataProto) {
  
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

    chartTypes.forEach(function(chartType) {

      cWidth = width - margin.left - margin.right;
      cHeight = height - margin.top - margin.bottom;
      
      var svg = d3.select('body').append("svg")
      .attr("width",  cWidth + margin.left + margin.right)
      .attr("height", cHeight + margin.top + margin.bottom)
      .attr("id","svg" + chartType.name)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      chartType.location.top = 120 + (i*hSpace) + (i*height);

      $("#svg" + chartType.name).css(chartType.location);
      
      // Filter data for this state
      var dataFiltered = data
      
      /////////////////////
      // Paint the Chart //
      /////////////////////
      // set the ranges
      var x = d3.scaleTime().range([0, cWidth]);
      x.domain(d3.extent(dataFiltered, function(d) { return d.Last_Update; })).nice();

      var y = d3.scaleLinear().range([cHeight, 0]);
      ybasis = chartType.ybasis =="zero" ? 0 : Math.min(d3.min(dataFiltered, function(d) {return d[chartType.name] }),
                                                        -d3.max(dataFiltered, function(d) {return d[chartType.name] })
                                                        )
      y.domain([ybasis,d3.max(dataFiltered, function(d) {return d[chartType.name] })]);

      
      var valueline = d3.line()
      .x(function(d) { return x(d.Last_Update); })
      .y(function(d) { return y(d[chartType.name]);  })
      .curve(d3.curveMonotoneX);

      /* Paint each Country line */
      
      svg.append("path")
      .data([dataFiltered]) 
      .attr("class", "line")  
      .attr("id", "line")
      .attr("d", valueline); 

      // Add the X Axis
      svg.append("g")
      .attr("transform", "translate(0," + cHeight + ")")
      .call(d3.axisBottom(x).ticks(5).tickFormat(d3.timeFormat("%m-%d")))
      .selectAll("text")	
          .style("text-anchor", "end")
          .attr("dx", "-.8em")
          .attr("dy", ".15em")
          .attr("transform", "rotate(-65)");

      // Add the Y Axis
      svg.append("g")
      .attr("transform", "translate(0,0)")
      .call(d3.axisLeft(y).ticks(5));

      // Add title
      if (chartType.name =="Confirmed") {
        svg.append("text")
        .attr("x", (width / 3))             
        .attr("y", 0)
        .attr("text-anchor", "middle")  
        .style("font-size", "12px") 
        .style("text-decoration", "underline")  
        .text(stateData.name);
      }
    });
  });
};

      /*  
    //President x axis
    //Get data
    d3.json('https://jclark017.github.io/d3_development/data/presidents.json', function (errorPres, presData) {
      var xPres = d3.scale.ordinal().domain(
        presData.map(function (d) {
          return d.Name
        })
      )
  
      var xAxisPres = d3.svg
        .axis()
        .scale(xPres)
        .orient('bottom')
  
      // tooltip variable
      var tip = d3
        .tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function (d) {
          if (d.Net > 0) {
            NetDescription = 'Deficit'
          } else {
            NetDescription = 'Surplus'
          }
  
          if (d.ChangeFromPreceding_Net > 0) {
            if (NetDescription == 'Surplus') {
              ChgDescription = 'decrease'
            } else {
              ChgDescription = 'increase'
            }
          } else {
            if (NetDescription == 'Surplus') {
              ChgDescription = 'increase'
            } else {
              ChgDescription = 'decrease'
            }
          }
          var ret = "<strong>Fiscal Year:</strong> <span style='color:white'>" + d.Year + '</span>'
          ret += "<br/><strong>President:</strong> <span style='color:white'>" + d.President + '</span>'
          ret += '<br/><strong>' + d.Year + ' ' + NetDescription + ":</strong> <span style='color:white'>$" +
            Math.abs(d.Net) + 'bn</span>'
          ret += '<br/><strong>' + NetDescription + " Change:</strong> <span style='color:white'>$" + Math.abs(d.ChangeFromPreceding_Net) +
            'bn ' + ChgDescription  + '</span>'
          return ret
        })
  
      // create left axis scales
      var yAxisScale = d3.scale
        .linear()
        .domain([800, 1100]) //Changed later
        .range([height, 0])
      var yScale = d3.scale
        .linear()
        .domain([20, 80]) //Changed later
        .range([height, 0])
      // create left yAxis
      var yAxisLeft = d3.svg
        .axis()
        .scale(yAxisScale)
        .ticks(16)
        .orient('left')
  
      // create left axis scales
      var yAxisScaleRight = d3.scale
        .linear()
        .domain([800, 1100]) //Change later
        .range([height, 0])
      var yScaleRight = d3.scale
        .linear()
        .domain([20, 80]) //Change later
        .range([height, 0])
      // create right yAxis
      var yAxisRight = d3.svg
        .axis()
        .scale(yAxisScaleRight)
        .ticks(16)
        .orient('right')
  
      var svg = d3
        .select('body')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', chartHeight * 1.75)
        .attr('id', 'svg')
        .append('g')
        .attr('class', 'graph')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
  
      svg.call(tip)
  
      d3.csv('https://jclark017.github.io/d3_development/data/budget.csv', type, function (error, dataProto) {
        //Convert data formats
        var data = dataProto.map(function (currentObject) {
          return {
            Year: currentObject.Year,
            Net: parseFloat(-currentObject.Net),
            Preceding_Net: parseFloat(currentObject.Preceding_Net),
            ChangeFromPreceding_Net: parseFloat(
              currentObject.ChangeFromPreceding_Net
            ),
            Change_Net: parseFloat(currentObject.Change_Net),
            TotalDebt: parseFloat(currentObject.TotalDebt),
            PresidentParty: currentObject.PresidentParty,
            SenateMajorityParty: currentObject.SenateMajorityParty,
            HouseMajorityParty: currentObject.HouseMajorityParty,
            President: currentObject.President,
            SuperMajority: currentObject.SuperMajority
          }
        })
  
        x.domain(
          data.map(function (d) {
            return d.Year
          })
        )
  
        xPres.range(
          presData.map(function (d, i) {
            var xPresWid =
              (width-12) *
              (iPres /
                d3.sum(presData, function (d) {
                  return d.yrs
                }))
            console.log(d.Name + ':' + xPresWid)
            iPres += d.yrs
            return xPresWid
          })
        )
  
        //Left Axis
        //Scale with negative values
        yScale
          .domain([
            0,
            d3.max(data, function (d) {
              return d.ChangeFromPreceding_Net
            })
          ])
          .range([0, chartHeight])
        //Scale with 0 lower bound
        yAxisScale
          .domain([
            d3.min(data, function (d) {
              return d.ChangeFromPreceding_Net
            }),
            d3.max(data, function (d) {
              return d.ChangeFromPreceding_Net
            })
          ])
          .range([
            chartHeight -
              yScale(
                d3.min(data, function (d) {
                  return d.ChangeFromPreceding_Net
                })
              ),
            0
          ])
  
        //Right Axis
        //Scale with negative values
        yScaleRight
          .domain([
            0,
            d3.max(data, function (d) {
              return d.Net
            })
          ])
          .range([0, chartHeight])
        //Scale with 0 lower bound
        yAxisScaleRight
          .domain([
            d3.min(data, function (d) {
              return d.Net
            }),
            d3.max(data, function (d) {
              return d.Net
            })
          ])
          .range([
            chartHeight -
              yScaleRight(
                d3.min(data, function (d) {
                  return d.Net
                })
              ),
            0
          ])
  
        svg
          .append('g')
          .attr('class', 'x axis')
          .attr(
            'transform',
            'translate(-7,' +
              (chartHeight -
                yScale(
                  d3.min(data, function (d) {
                    return d.ChangeFromPreceding_Net
                  })
                )) +
              ')'
          ) //" + chartHeight + ")")
          .call(xAxis)
          .selectAll('text')
          .attr('y', -7)
          .attr('x', 25)
          .attr('dy', '.35em')
          .attr('transform', 'rotate(90)')
  
        // paint the axis for presidents
        let xAxisPresPaint = svg
          .append('g')
          .attr('class', 'xPres axis')
          .attr(
            'transform',
            'translate(0,' +
              (chartHeight -
                yScale(
                  d3.min(data, function (d) {
                    return d.ChangeFromPreceding_Net
                  })
                )) +
              ')'
          ) //" + chartHeight + ")") 
          .call(xAxisPres)
          .selectAll('text')
          .attr('transform', 'rotate(-90), translate(50,10)')
  
        svg.selectAll('g.xPres g.tick text').attr('font-size', '10')
        svg.selectAll('g.xPres g.tick line').remove()
        svg.selectAll('g.xPres path').remove()
  
        //paint the left y axis
        svg
          .append('g')
          .attr('class', 'y axis axisLeft')
          .attr('transform', 'translate(0,0)')
          .attr('id', 'xtext')
          .call(yAxisLeft)
          .append('text')
          .attr('y', -10)
          .attr('x', 0 - height / 1.5)
          .style('text-anchor', 'middle')
          .style('font-size', '18px')
          .attr('transform', 'rotate(-90)')
          .attr('dy', '-2em')
          .text('Yearly Change in Deficit (Surplus)')
  
        //paint the right y axis
        svg
          .append('g')
          .attr('class', 'y axis axisRight')
          .attr('transform', 'translate(' + width + ',0)')
          .attr('id', 'xtext')
          .call(yAxisRight)
          .append('text')
          .attr('y', 60)
          .attr('x', 0 - height / 1.5)
          .style('text-anchor', 'middle')
          .style('font-size', '18px')
          .attr('transform', 'rotate(-90)')
          .text('Total Annual Deficit (Surplus)')
  
        //Paint the axis text color
        svg.selectAll('#xtext g text').attr('id', function (d) {
          return d <= 0 ? 'xtextgood' : "xtextbad";
        })
        // Paint President background bars
        iPres = 0
        barsPres = svg
          .selectAll('.barPres')
          .data(presData)
          .enter()
        barsPres
          .append('rect')
          .attr('class', 'barPres')
          .attr('transform', 'translate(0,0)')
          .attr('class', function (d) {
            return 'barPres ' + d.party
          })
          .attr('x', function (d, i) {return x(d.startFiscalYear);})
          .attr('y', yAxisScale()[yScale.length - 1]) //animated later
          .attr('width', function (d, i) {
              // calculate width. Account for last year, where there is no x value to rely on from the next year
              if (x(d.endFiscalYear+1) === undefined) {
                  // If there is no next year, just tack on the difference between the last two years
                  return x(d.endFiscalYear) + (x(d.endFiscalYear)-x(d.endFiscalYear-1)) - x(d.startFiscalYear)-1;
              } else {
                  return x(d.endFiscalYear+1) - x(d.startFiscalYear)-1;
              }
          })
          .attr('height', 0) //animated later
  
        // Paint the deficit change bars
        bars = svg
          .selectAll('.bar')
          .data(data)
          .enter()
        bars
          .append('rect')
          .attr('class', function (d) {
            //Set a class value for good or bad
            if (d.ChangeFromPreceding_Net > 0) {
              var chg = 'bad'
            } else {
              var chg = 'good'
            }
  
            if (d.Year > '2019') {
              return 'bar2 ' + chg
            } else {
              return 'bar1 ' + chg
            }
          })
          .attr('x', function (d) {
            return x(d.Year)
          })
          .attr('y', yAxisScale(0)) //animated later
          .attr('width', x.rangeBand())
          .attr('height', 0) //animated later
          //tooltips
          .on('mouseover', tip.show)
          .on('mouseout', tip.hide)
  
        var lineFunction = d3.svg
          .line()
          .x(function (d) {
            return x(d.Year) + x.rangeBand() / 2
          })
          .y(function (d) {
            return yAxisScaleRight(d.Net)
          })
  
        // Draw the deficit line
        svg
          .append('path')
          .datum(data)
          .attr('fill', 'none')
          .attr('class', 'line')
          .attr('id', 'actual')
          .attr('stroke', 'steelblue')
          .attr('stroke-width', 3)
          .style('opacity', '0') //Set invisible initially
          .attr(
            'd',
            lineFunction(
              data.filter(function (d) {
                return d.Year < '2021'
              })
            )
          )
  
        // Draw the forecast line
        svg
          .append('path')
          .datum(data)
          .attr('fill', 'none')
          .attr('class', 'line')
          .attr('id', 'forecast')
          .style('stroke-dasharray', '3, 3')
          .style('opacity', '0') //Set invisible initially
          .attr('stroke', 'steelblue')
          .attr('stroke-width', 3)
          .attr(
            'd',
            lineFunction(
              data.filter(function (d) {
                return d.Year > '2019'
              })
            )
          )
  
        //draw the year counter
        svg
          .append('text')
          .attr('id', 'counter')
          .text('')
          .attr("x",40)
          .attr("y",40);
  
        //Animation for the year counter
        setTimeout(() => {
          data.forEach((element, i) => {
            setTimeout(() => {
              cntVal = element.Year < 2021 ? element.Year : element.Year < 2028 ? element.Year + " (Forecast)" : ""
              svg.select('#counter').text(cntVal);
              
            }, i * 100)
          })
        }, 1000)
  
        console.log(yAxisScale.domain()[yAxisScale.domain().length - 1])
        //Animation for Presidents
        svg
          .selectAll('rect.barPres')
          .transition()
          .duration(500)
          .attr('y', 0)
          .attr('height', 425 )
          .delay(function (d, i) {
            return i * 100
          })
  
        //Animation for rectangles
        svg
          .selectAll('rect.bar1, rect.bar2')
          .transition()
          .duration(500)
          .attr('y', function (d) {
            return chartHeight - Math.max(0, yScale(d.ChangeFromPreceding_Net))
          })
          .attr('height', function (d) {
            return Math.abs(yScale(d.ChangeFromPreceding_Net))
          })
          .delay(function (d, i) {
            if (i == 0) {
              return 1000
            } else {
              return 1000 + i * 100
            }
          })
  
        // Then highlight the main line to be fully visable and give it a thicker stroke
        d3.select('#actual')
          .style('opacity', '1')
          .style('stroke-width', 3)
  
        // First work our the total length of the line
        var totalLength = d3
          .select('#actual')
          .node()
          .getTotalLength()
  
        d3.selectAll('#actual')
          // Set the line pattern to be an long line followed by an equally long gap
          .attr('stroke-dasharray', totalLength + ' ' + totalLength)
          // Set the intial starting position so that only the gap is shown by offesetting by the total length of the line
          .attr('stroke-dashoffset', totalLength)
          // Then the following lines transition the line so that the gap is hidden...
          .transition()
          .delay(1000)
          .duration(3400)
          .ease('quad') //Try linear, quad, bounce... see other examples here - http://bl.ocks.org/hunzy/9929724
          .attr('stroke-dashoffset', 0)
  
        d3.selectAll('#forecast')
          .transition()
          .delay(4400)
          .duration(1000)
          .ease('quad') //Try linear, quad, bounce... see other examples here - http://bl.ocks.org/hunzy/9929724
          .style('opacity', '1')
      })
    })
    function type (d) {
      d.money = +d.money
      return d
    } */
  
  