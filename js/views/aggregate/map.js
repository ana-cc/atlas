// ~ views/search/do ~
define([
  'jquery',
  'underscore',
  'backbone',
  'topojson',
  'd3-array',
  'd3-geo',
  'd3-geo-projection',
  'collections/aggregates',
  'text!templates/aggregate/map.html',
  'datatables',
  'datatablessort',
  'helpers',
  'bootstrap',
  'datatablesbs'
], function($, _, Backbone, topojson, d3array, d3geo, d3geoproj, aggregatesCollection, aggregateMapTemplate){
  var aggregateSearchView = Backbone.View.extend({
    el: "#content",
    explanations: {
        "consensus_weight_fraction": "This map shows the total <a href=\"https://metrics.torproject.org/glossary.html#consensus-weight\" target=\"_blank\">consensus weight</a> of each country's relays as a percentage of all consensus weights in the network.  This percentage is a very rough approximation of the probability of a relay in each country to be selected by clients.",
        "guard_probability": "This map shows the total guard probability of each country's relays as a percentage of the guard probabilities of all relays in the network. This probability is calculated based on consensus weights, relay flags, and bandwidth weights in the consensus. Path selection depends on more factors, so that this probability can only be an approximation.",
        "middle_probability": "This map shows the total middle probability of each country's relays as a percentage of the middle probabilities of all relays in the network. This probability is calculated based on consensus weights, relay flags, and bandwidth weights in the consensus. Path selection depends on more factors, so that this probability can only be an approximation.",
        "exit_probability": "This map shows the total exit probability of each country's relays as a percentage of the exit probabilities of all relays in the network. This probability is calculated based on consensus weights, relay flags, and bandwidth weights in the consensus. Path selection depends on more factors, so that this probability can only be an approximation.",
        "advertised_bandwidth": "This map shows the total <a href=\"https://metrics.torproject.org/glossary.html#advertised-bandwidth\" target=\"_blank\">advertised bandwidth</a> of each country's relays.",
        "cw_bw": "This map shows the ratio of total consensus weight versus total advertised bandwidth for each country. Countries shown in purple have greater advertised bandwidth than consensus weight, indicating that they are underweighted. Countries shown in green have greater consensus weight than advertised bandwidth and so are over weighted."
    },
    initialize: function() {
      this.collection = new aggregatesCollection;
    },
    plot: function() {
      $('input[name="aggregate-property"]').prop('disabled', true);

      var aggregate_property = $('input[name="aggregate-property"]:checked').val();
      var aggregates = this.collection.models;
      var explanations = this.explanations;

      var m_width = $("#container").width();
      var width = 938;
      var height = 500;

      var projection = d3geoproj.geoCylindricalEqualArea();

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

      var maximum_value = Number.NEGATIVE_INFINITY;
      var minimum_value = Number.POSITIVE_INFINITY;

      if (aggregate_property == "cw_bw") {
        _.each(aggregates, function(aggregate) {
          if (aggregate["advertised_bandwidth"] == 0) current_val = 0;
            else current_val = (aggregate["consensus_weight"]/(aggregate["advertised_bandwidth"]/1024));
          if (current_val > maximum_value) maximum_value = current_val;
          if (current_val < minimum_value) minimum_value = current_val;
       });
       var getCountryAggregate = function(code, aggregate_property) {
         var found = 0;
         _.each(aggregates, function(aggregate) {
           if (aggregate.country.toUpperCase() == code)
           if (aggregate["advertised_bandwidth"] == 0) found = 0;
           else found=aggregate["consensus_weight"]/(aggregate["advertised_bandwidth"]/1024);
         });
         if (found < 1 && found > 0) {
           return 1/(Math.sqrt(found/minimum_value));
         } else {
           return 0-Math.sqrt(found/maximum_value);
         }
       }
     } else {
        _.each(aggregates, function(aggregate) {
          if (aggregate[aggregate_property] > maximum_value) maximum_value = aggregate[aggregate_property];
        });
        var getCountryAggregate = function(code, aggregate_property) {
          var found = 0;
          _.each(aggregates, function(aggregate) {
            if (aggregate.country.toUpperCase() == code) found = aggregate[aggregate_property];
          });
        return (found == 0) ? found : Math.sqrt(found/maximum_value);
        }
      }

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

      g.append("g")
        .attr("id", "countries")
        .style("fill", "#7d4698")
        .style("stroke", "#484848")
        .style("stroke-linejoin", "round")
        .style("stroke-linecap", "round")
        .selectAll("path")
        .data(topojson.feature(us, us.objects.countries).features)
        .enter()
          .append("path")
            .attr("id", function(d) { return d.id; })
            .style("fill", function(d) { return (getCountryAggregate(d.id, aggregate_property) > 0) ? "#7d4698" : "#68b030"; })
            .style("fill-opacity", function(d) { return Math.abs(getCountryAggregate(d.id, aggregate_property)); })
            .attr("d", path)
          .append("svg:title")
            .text( function(d) { return d.id; });


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
            return (aggregate_property == "advertised_bandwidth") ?
             "" + (Math.pow(i,2)* maximum_value/(1024*1024)).toFixed(2) + "MiB/s" :
             "" + (Math.pow(i,2)* maximum_value*100).toFixed(3) + "%";
          });
       }
    }
  if (aggregate_property == "cw_bw") {
      legend = (maximum_value > 1) ? 0 : 1;
      current_box = 0;
      for (var i = legend; i <= 2 ; i += 0.2) {
        j = Math.abs(i-1);
        current_value = (i<1) ? (Math.pow(j,2)*maximum_value) :
                                (Math.pow(j,2)*(1/minimum_value));
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
          .style("fill", function() { return (i>1) ? "#7d4698" : "#68b030"; })
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

      $("#aggregate-map").html("");
      document.getElementById("aggregate-map").appendChild(svg.node());

      $('input[name="aggregate-property"]').prop('disabled', false);
      $('#map-explain').html(explanations[aggregate_property]);
     });
    },
    save: function() {
      /* Encode SVG image for download link. */
      html = d3.select("#aggregate-map")
        .node()
        .innerHTML;
      window.open("data:data/xml;base64," + btoa(html), "SaveSVG");
    },
    render: function(query){
      document.title = "Relay Search";
      var compiledTemplate = _.template(aggregateMapTemplate)
      this.$el.html(compiledTemplate({query: query,
                                     aggregates: this.collection.models,
                                     countries: CountryCodes,
                                     error: this.error,
                                     relaysPublished: this.relaysPublished,
                                     bridgesPublished: this.bridgesPublished}));

      canSvg = !!(document.createElementNS && document.createElementNS('http://www.w3.org/2000/svg','svg').createSVGRect);
      if (canSvg) {
        this.plot();
        var thisView = this;
        $('input[name="aggregate-property"]').bind('change', function(){
          thisView.plot();
        });
        $('#save_svg').bind('click', function(){
          thisView.save();
        });
      } else {
        $('#no-svg').show();
      }
    },
    renderError: function(){
      var compiledTemplate = _.template(aggregateSearchTemplate);
      this.$el.html(compiledTemplate({aggregates: null, error: this.error, countries: null}));
    }
  });
  return new aggregateSearchView;
});

