// ~ views/search/main ~
define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/search/main.html',
], function($, _, Backbone, mainSearchTemplate){
  var mainSearchView = Backbone.View.extend({
	    el: $("#content"),

	    render: function(query){
			document.title = "Relay Search";
			var data = {};
			var compiledTemplate = _.template(mainSearchTemplate, data);
			this.el.html(compiledTemplate);

            $("#do-top10").bind('click', function(){
                document.location = "#top10";
                return false;
            });

            $("#do-search").bind('click', function(){
                var query = _.escape($('#query').val());
                document.location = "#search/"+query;
                return false;
            });

            $("#home-search").bind('submit', function(){
                var query = _.escape($('#query').val());
                document.location = "#search/"+query;
                return false;
            });
	    }
  });
  return new mainSearchView;
});

