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
    initialize: function() {
      this.collection = new aggregatesCollection;
    },
    plot: function() {
      $('input[name="aggregate-property"]').prop('disabled', true);

      var aggregate_property = $('input[name="aggregate-property"]:checked').val();
      var aggregates = this.collection.models;

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

      var maximum_value = 0;
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
        .style("fill","#7d4698")
        .style("stroke", "#484848")
        .style("stroke-linejoin", "round")
        .style("stroke-linecap", "round")
        .selectAll("path")
        .data(topojson.feature(us, us.objects.countries).features)
        .enter()
          .append("path")
            .attr("id", function(d) { return d.id; })
            .style("fill-opacity", function(d) { return getCountryAggregate(d.id, aggregate_property); })
            .attr("d", path)
          .append("svg:title")
            .text( function(d) { return d.id; });

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
          .style("font-family", "Helvetica")
          .style("font-size", "12px")
          .style("fill", "#484848")
          .text("" + (Math.pow(i,2)* maximum_value*100).toFixed(3) + "%");
      }

      $("#aggregate-map").html("");
      document.getElementById("aggregate-map").appendChild(svg.node());

      $('input[name="aggregate-property"]').prop('disabled', false);
     });
    },
    save: function() {
      /* Encode SVG image for download link. */
      html = d3.select("#aggregate-map")
        .node()
        .innerHTML;
      window.open("data:image/svg+xml;base64," + btoa(html), "SaveSVG");
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

