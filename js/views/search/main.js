// ~ views/search/main ~
define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/search/main.html',
  'helpers',
], function($, _, Backbone, mainSearchTemplate){
  var mainSearchView = Backbone.View.extend({
	    el: "#content",

	    render: function(query){
			document.title = "Relay Search";
			var data = {countries: CountryCodes};
			var compiledTemplate = _.template(mainSearchTemplate);
			this.$el.html(compiledTemplate(data));

            $("#do-top-relays").bind('click', function(){
                document.location = "#toprelays";
                return false;
            });

            $("#do-search").bind('click', function(){
                document.location = "#search/"+encodeURI($('#query').val());
                return false;
            });

            $("#home-search").bind('submit', function(){
                document.location = "#search/"+encodeURI($('#query').val());
                return false;
            });

            $("#do-aggregate").bind('click', function(){
                document.location = "#aggregate/all/"+encodeURI($('#aggregated-query').val());
                return false;
            });

            $("#do-full-aggregation").bind('click', function(){
                document.location = "#aggregate/all";
                return false;
            });

            $("#home-aggregate-search").bind('submit', function(){
                document.location = "#aggregate/all/"+encodeURI($('#aggregated-query').val());
                return false;
            });

            var buildAdvancedQuery = function(){
              var query = "";
              if($('#advanced-search-nickname').val().trim() != "") query += $('#advanced-search-nickname').val().trim() + " ";
              if($('#advanced-search-family')[0].checked) {
                if($('#advanced-search-fingerprint').val().trim() != "") query += "family:" + $('#advanced-search-fingerprint').val().trim().split(" ")[0] + " ";
              } else {
                if($('#advanced-search-fingerprint').val().trim() != "") query += "fingerprint:" + $('#advanced-search-fingerprint').val().trim().split(" ")[0] + " ";
              }
              if($('#advanced-search-flag').val() !== "") query += "flag:" + $('#advanced-search-flag').val() + " ";
              if($('#advanced-search-country').val() !== "") query += "country:" + $('#advanced-search-country').val() + " ";
              if($('#advanced-search-as').val().trim() !== "") query += "as:" + $('#advanced-search-as').val().trim() + " ";
              if($('#advanced-search-contact').val().trim() != "") query += "contact:" + $('#advanced-search-contact').val().trim().split(" ")[0] + " ";
              if($('#advanced-search-hostname').val().trim() != "") query += "host_name:" + $('#advanced-search-hostname').val().trim().split(" ")[0] + " ";
              if($('#advanced-search-type').val() !== "") query += "type:" + $('#advanced-search-type').val() + " ";
              if($('#advanced-search-running').val() !== "") query += "running:" + $('#advanced-search-running').val() + " ";
              return query;
            }

            $("#do-advanced").bind('click', function(){
                var query = buildAdvancedQuery();
                document.location = "#search/"+encodeURI(query);
            });

            $("#do-advanced-aggregation").bind('click', function(){
                var query = buildAdvancedQuery();
                document.location = "#aggregate/all/"+encodeURI(query);
            });

            $("#do-advanced-aggregation-cc").bind('click', function(){
                var query = buildAdvancedQuery();
                document.location = "#aggregate/cc/"+encodeURI(query);
            });

            $("#do-advanced-aggregation-as").bind('click', function(){
                var query = buildAdvancedQuery();
                document.location = "#aggregate/as/"+encodeURI(query);
            });

            $(".tip").tooltip();

	    }
  });
  return new mainSearchView;
});

