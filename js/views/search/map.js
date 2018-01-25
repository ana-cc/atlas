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
         var maximum_value = Number.NEGATIVE_INFINITY;
         var minimum_value = Number.POSITIVE_INFINITY;

       _.each(results, function(result) {
         var coordinates = projection([result.attributes.longitude, result.attributes.latitude]);
         var opacity = function(){ return (search_property == "advertised_bandwidth")
                                    ? result.attributes[search_property]/(150 *1024 *1024) : result.attributes[search_property] * 500;                                   }
         current_val = result.attributes[search_property]
         if (current_val > maximum_value) maximum_value = current_val;
         if (current_val < minimum_value) minimum_value = current_val;
         svg.append("circle")
            .attr("cx", coordinates[0])
            .attr("cy", coordinates[1])
            .attr("r", 3)
            .style("fill-opacity", opacity)
            .style("fill", "#7d4698");
        });

    function append_legend() {
      for (var i = 0; i <= 1; i += 0.2) {
        svg.append("rect")
          .attr("x", 10)
          .attr("y", height-(i*5+1)*20 )
          .attr("height", "10")
          .attr("width", "15")
          .style("fill", "#fff");

        svg.append("rect")
          .attr("x", 10)
          .attr("y", height-(i*5+1)*20 )
          .attr("height", "10")
          .attr("width", "15")
          .style("fill", "#7d4698")
          .style("fill-opacity", function() {return i;})
          .style("stroke", "#484848");

        svg.append("text")
          .attr("x", 30)
          .attr("y", height-(i*5+0.5)*20 )
          .style("font-size", "12px")
          .style("fill", "#484848")
          .text( function() {
            return formatValue(i*maximum_value, search_property);
          });
       }
    }

      var formatValue = function(value, search_property) {
        switch (search_property) {
          case "relays":
            text = value.toFixed(0) + " relays";
            break;
          case "consensus_weight_fraction":
          case "guard_probability":
          case "middle_probability":
          case "exit_probability":
            text = (value == maximum_value) ? "> " + (value*100).toFixed(3) + "%" : (value*100).toFixed(3) + "%";
            break;
          case "advertised_bandwidth":
            text = (value == maximum_value) ? "> " + hrBandwidth(value) : hrBandwidth(value);
            break;
          case "consensus_weight_to_bandwidth":
            if (value == 0) {
              text = "No relays";
            } else {
              text = (value<1) ? "1:" + (1/value).toFixed(1) :
                                  value.toFixed(1) + ":1";
            }
        }
        return text;
      }

  if (search_property == "consensus_weight_to_bandwidth") {
      legend = (maximum_value > 1) ? 0 : 1;
      current_box = 0;
      for (var i = legend; i <= 2 ; i += 0.2) {
        j = Math.abs(i-1);
        current_value = (i<1) ? (j*maximum_value) :
                                (j*(1/minimum_value));
        if (current_value < 1)
          continue;
        svg.append("rect")
          .attr("x", 10)
          .attr("y", height-(current_box*5+1)*20)
          .attr("height", "10")
          .attr("width", "15")
          .style("fill", "#fff");

        svg.append("rect")
          .attr("x", 10)
          .attr("y", height-(current_box*5+1)*20)
          .attr("height", "10")
          .attr("width", "15")
          .style("fill", function() { return (i<1) ? "#7d4698" : "#68b030"; })
          .style("fill-opacity", function() { return j; })
          .style("stroke", "#484848");

        svg.append("text")
          .attr("x", 30)
          .attr("y", height-(current_box*5+0.5)*20)
          .style("font-size", "12px")
          .style("fill", "#484848")
          .text(function(){
           if (j==0) return "1:1";
           return (i<1) ? "" + current_value.toFixed(1) + ":1" :
                          "1:" + current_value.toFixed(1);

         });
         current_box += 0.2;
       }
     } else {
       append_legend();
     }


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

