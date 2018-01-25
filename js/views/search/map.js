define([
  'jquery',
  'underscore',
  'backbone',
  'topojson',
  'd3-array',
  'd3-geo',
  'd3-geo-projection',
  'collections/results',
  'text!templates/search/map.html',
  'datatables',
  'datatablessort',
  'helpers',
  'map_helpers',
  'bootstrap',
  'datatablesbs'
],function($, _, Backbone, topojson, d3array, d3geo, d3geoproj, resultsCollection, searchMapTemplate){
  var searchMapView = Backbone.View.extend({
    el: "#content",
    initialize: function() {
      this.collection = new resultsCollection;
    },
    explanations: {
        "relays": "The map shows the total number of relays running in each country.",
        "consensus_weight_fraction": "This map shows the <a href=\"https://metrics.torproject.org/glossary.html#consensus-weight\" target=\"_blank\">consensus weight</a> of each relay as a percentage of all consensus weights in the network.  This percentage is a very rough approximation of the probability of a relay to be selected by clients.",
        "guard_probability": "This map shows the total guard probability of each relay as a percentage of the guard probabilities of all relays in the network. This probability is calculated based on consensus weights, relay flags, and bandwidth weights in the consensus. Path selection depends on more factors, so that this probability can only be an approximation.",
        "middle_probability": "This map shows the total middle probability of each relay as a percentage of the middle probabilities of all relays in the network. This probability is calculated based on consensus weights, relay flags, and bandwidth weights in the consensus. Path selection depends on more factors, so that this probability can only be an approximation.",
        "exit_probability": "This map shows the total exit probability of each relay as a percentage of the exit probabilities of all relays in the network. This probability is calculated based on consensus weights, relay flags, and bandwidth weights in the consensus. Path selection depends on more factors, so that this probability can only be an approximation.",
        "advertised_bandwidth": "This map shows the total <a href=\"https://metrics.torproject.org/glossary.html#advertised-bandwidth\" target=\"_blank\">advertised bandwidth</a> of each relay.",
        "consensus_weight_to_bandwidth": "This map shows the average ratio of consensus weight to advertised bandwidth for relays. Relays shown in purple have greater consensus weight than advertised bandwidth, indicating that they are overweighted. Relays shown in green have greater advertised bandwidth than consensus weight and so are underweighted. Relays that did not have an advertised bandwidth or advertise a bandwidth of zero are not included in this analysis. Relays that have not yet been measured by at least three bandwidth authorities are also not included in this map as their consensus weight is not based on bandwidth measurement yet."
    },
    plot: function() {
      $('input[name="search-property"]').prop('disabled', true);

      var search_property = $('input[name="search-property"]:checked').val();
      console.log(search_property)
      var results = this.collection.models;
      var m_width = $("#container").width();
      var width = 938;
      var height = 500;
      var explanations = this.explanations;
      var projection = d3geoproj.geoCylindricalEqualArea()
                       .scale(175);

      var path = d3.geo.path()
        .projection(projection);

      var svg = d3.select("body").append("svg")
        .remove()
        .attr("preserveAspectRatio", "xMidYMid")
        .attr("viewBox", "0 0 " + width + " " + height)

      svg.append("rect")
        .attr("class", "background")
        .attr("style", "fill: #484848;")
        .style("opacity", "0.444444444")
        .attr("width", width)
        .attr("height", height);

      var g = svg.append("g");
      d3.json("json/countries.topo.json", function(error, us) {
      g.append("g")
        .attr("id", "countries")
        .style("fill","#fff")
        .style("stroke", "#484848")
        .style("stroke-linejoin", "round")
        .style("stroke-linecap", "round")
        .selectAll("path")
        .data(topojson.feature(us, us.objects.countries).features)
        .enter()
        .append("path")
          .attr("d", path);
      $("#search-map").html("");
      document.getElementById("search-map").appendChild(svg.node());

});
       maximum_value = getMaxValue(results, search_property);
       minimum_value = getMinValue(results, search_property);

       _.each(results, function(result) {
           var coordinates = projection([result.attributes.longitude, result.attributes.latitude]);
           if (search_property == "consensus_weight_to_bandwidth") {
               value = (result.attributes["advertised_bandwidth"] == 0) ? 0 : 
                       result.attributes["consensus_weight"]*1024/result.attributes["advertised_bandwidth"];
               if (value != 0 && value < minimum_value) minimum_value = value;
               if (value > maximum_value) maximum_value = value;
               } else {
                 value = result.attributes[search_property];
               }
           var opacity = Math.abs(getFillOpacity(value, search_property, minimum_value, maximum_value));
           var fill = getFillColor(value, search_property, minimum_value, maximum_value);
           svg.append("circle")
             .attr("cx", coordinates[0]+ Math.random()*1.5)
             .attr("cy", coordinates[1]+ Math.random()*1.5)
             .attr("r", 3)
             .style("fill-opacity", opacity)
             .style("fill", fill);
        });

      append_legend(svg, minimum_value, maximum_value, 4, search_property, true);

      $('input[name="search-property"]').prop('disabled', false);
      $('#map-explain').html(explanations[search_property]);

                 },
    save: function() {
      /* Encode SVG image for download link. */
      html = d3.select("#search-map")
        .node()
        .innerHTML;
      window.open("data:image/svg+xml;base64," + btoa(html), "SaveSVG");
    },
    render: function(query){
      document.title = "Relay Search";
      var compiledTemplate = _.template(searchMapTemplate)
      this.$el.html(compiledTemplate({query: query,
                                     results: this.collection.models,
                                     mapProperty: this.mapProperty,
                                     countries: CountryCodes,
                                     error: this.error,
                                     relaysPublished: this.relaysPublished,
                                     bridgesPublished: this.bridgesPublished}));

      canSvg = !!(document.createElementNS && document.createElementNS('http://www.w3.org/2000/svg','svg').createSVGRect);
      if (canSvg) {
        this.plot();
        var thisView = this;
        $('input[name="search-property"]').bind('change', function(){
          thisView.plot();
        });
        $('#save_svg').bind('click', function(){
          thisView.save();
        });
        $('#permalink').bind('click', function(){
          search_property = $('input[name="search-property"]:checked').val();
          window.location.hash = "#msearch_" + search_property + ((query) ? "/" + query : "");
        });
      } else {
        $('#no-svg').show();
      }
    },
    renderError: function(){
      var compiledTemplate = _.template(searchMapTemplate);
      this.$el.html(compiledTemplate({results: null, error: this.error, countries: null}));
    }
  });
  return new searchMapView;
});

