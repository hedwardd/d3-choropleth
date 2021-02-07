Promise.all([
  d3.json(
    "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json"
  ),
  d3.json(
    "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json"
  )
])
  .then((files) => {
    render(files[0], files[1]);
    scroll();
  })
  .catch((err) => {
    console.log("Encountered an error");
  });

// Scroll Header info into view for mobile
function scroll(){
  const headers = document.getElementById('headers');
  
  headers.scrollIntoView({
    block: "center",
    inline: "center"
  });
}

// D3 Rendering
function render(geoData, educationData) {
  
  // Create object to store education data
  const educationDataMap = {};
  educationData.forEach((county) => {
    educationDataMap[county.fips] = {
      area_name: county.area_name,
      bachelorsOrHigher: county.bachelorsOrHigher,
      state: county.state
    };
  });

  // Canvas Size
  const w = 960;
  const h = 600;

  // Render Canvas
  const svg = d3
    .select("body")
    .append("svg")
    .attr("width", w)
    .attr("height", h)
    .attr("id", "canvas");
  
  const colorInterpolator = d3
    .interpolate("rgb(229, 255, 224)", "rgb(0, 68, 27)");

  // Color scale
  const fill = d3
    .scaleQuantize()
    .domain([
      d3.min(educationData, (d) => d.bachelorsOrHigher),
      d3.max(educationData, (d) => d.bachelorsOrHigher)
    ])
    .range(d3.quantize(colorInterpolator, 6));
  
  // Path
  const path = d3.geoPath();
  
  // TOOLTIP
  const toolTip = d3
    .select("body")
    .append("div")
    .attr("id", "tooltip")
    .style("opacity", 0);

  svg
    .append("g")
    .selectAll("path")
    .data(topojson.feature(geoData, geoData.objects.counties).features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("class", "county")
    .attr("data-education", (d) => educationDataMap[d.id].bachelorsOrHigher)
    .attr("data-fips", (d) => d.id)
    .attr("fill", (d) => fill(educationDataMap[d.id].bachelorsOrHigher))
    .on("mouseover", (d) => {
      const countyInfo = educationDataMap[d.id];
      toolTip.transition().duration(200).style("opacity", 100);
      toolTip
        .html(
          countyInfo.area_name +
            ", " +
            countyInfo.state +
            ": " +
            countyInfo.bachelorsOrHigher +
            "%"
        )
        .style("left", d3.event.pageX + 28 + "px")
        .style("top", d3.event.pageY - 28 + "px")
        .attr("data-education", countyInfo.bachelorsOrHigher)
        .attr("data-fips", d.id);
    })
    .on("mouseout", (d) =>
      toolTip.transition().duration(500).style("opacity", 0)
    );

  // Render State Lines
  svg
    .append("path")
    .datum(
      topojson.mesh(geoData, geoData.objects.states, (a, b) => a.id !== b.id)
    )
    .attr("class", "states")
    .attr("d", path);
  
  const legendLinear = d3
    .legendColor()
    .shapeWidth(80)
    .shapePadding(1)
    .orient("horizontal")
    .scale(fill);
  
  const legend = svg
    .append("g")
    .attr("class", "legendLinear")
    .attr("id", "legend")
    .attr("transform", "translate(" + 237 + ",5)")
    .call(legendLinear);
}
