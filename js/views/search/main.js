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
	    }
  });
  return new mainSearchView;
});

