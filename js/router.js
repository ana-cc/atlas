// ~ router.js ~
define([
  'jquery',
  'underscore',
  'backbone',
  'views/details/main',
  'views/search/main',
  'views/search/do',
  'jssha'
], function($, _, Backbone, mainDetailsView, mainSearchView, doSearchView, jsSHA){
  var AppRouter = Backbone.Router.extend({
    routes: {
       // Define the routes for the actions in Atlas
    	'details/:fingerprint': 'mainDetails',
    	'search/:query': 'doSearch',
        'top10': 'showTopRelays',
        'toprelays': 'showTopRelays',
    	// Default
    	'*actions': 'defaultAction'
    },

    hashFingerprint: function(fp){
        if (fp.match(/^[a-f0-9]{40}$/i) != null)
            return new jsSHA(fp, "HEX").getHash("SHA-1", "HEX").toUpperCase();
        else
            return fp
    },

    // Show the details page of a node
    mainDetails: function(fingerprint){


        $("#content").hide();
        $(".progress").show();

        mainDetailsView.model.fingerprint = this.hashFingerprint(fingerprint);
        mainDetailsView.model.lookup({
            success: function(relay) {
    	        mainDetailsView.render();
                $(".progress").hide();
                $("#content").show();
                $(".breadcrumb").html("<li><a href=\"https://metrics.torproject.org/\">Home</a></li><li><a href=\"https://metrics.torproject.org/services.html\">Services</a></li><li><a href=\"#\">Relay Search</a></li><li class=\"active\">Details for " + relay.get('nickname') + "</li>");
                $("#secondary-search").show();

            },
            error: function() {
                mainDetailsView.error();
                $(".progress").hide();
                $("#content").show();
                $(".breadcrumb").html("<li><a href=\"https://metrics.torproject.org/\">Home</a></li><li><a href=\"https://metrics.torproject.org/services.html\">Services</a></li><li><a href=\"#\">Relay Search</a></li><li class=\"active\">Error</li>");
                $("#secondary-search").show();
            }
        });
    },

    // Perform a search on Atlas
    doSearch: function(query){
        $(".breadcrumb").html("<li><a href=\"https://metrics.torproject.org/\">Home</a></li><li><a href=\"https://metrics.torproject.org/services.html\">Services</a></li><li><a href=\"#\">Relay Search</a></li><li class=\"active\">Search for " + query + "</li>");
        $("#secondary-search").show();
        $("#secondary-search-query").val(query);

        $("#content").hide();
        $(".progress").show();

        if (query == "") {
	    doSearchView.error = 5;
            doSearchView.renderError();
            $(".progress").hide();
            $("#content").show();
        } else {
            doSearchView.collection.url =
                doSearchView.collection.baseurl + this.hashFingerprint(query);
            doSearchView.collection.lookup({
                success: function(err, relaysPublished, bridgesPublished){
                    doSearchView.relays = doSearchView.collection.models;

                    // Redirect to the details page when there is exactly one
                    // search result.
                    if (doSearchView.relays.length == 1) {
                        document.location.replace("#details/" +
                            doSearchView.relays[0].fingerprint);
                        return;
                    }
		    doSearchView.error = err;
                    doSearchView.relaysPublished = relaysPublished;
                    doSearchView.bridgesPublished = bridgesPublished;
                    doSearchView.render(query);
		    $("#search-title").text(query);
                    $(".progress").hide();
                    $("#content").show();
                },

                error: function(err){
		    doSearchView.error = err;
		    doSearchView.renderError();
                    $(".progress").hide();
                    $("#content").show();
                }
            });
        }
    },
    showTopRelays: function(){
        $(".breadcrumb").html("<li><a href=\"https://metrics.torproject.org/\">Home</a></li><li><a href=\"https://metrics.torproject.org/services.html\">Services</a></li><li><a href=\"#\">Relay Search</a></li><li class=\"active\">Top Relays</li>");

        $("#secondary-search").show();
        $("#secondary-search-query").val("");

        $("#content").hide();
        $(".progress").show();

        doSearchView.collection.url = "https://onionoo.torproject.org/details?type=relay&order=-consensus_weight&limit=250&running=true";
            doSearchView.collection.lookup({
                success: function(err){
                    doSearchView.relays = doSearchView.collection.models;
                    doSearchView.error = err;
                    doSearchView.render("");
		    $("#search-title").text("Top Relays by Consensus Weight");
                    $(".progress").hide();
                    $("#content").show();
                },

                error: function(erno){
                    doSearchView.error = erno;
                    doSearchView.renderError();
                    $(".progress").hide();
                    $("#content").show();
                }
            });
    },

    // No matched rules go to the default home page
    defaultAction: function(actions){
        $(".breadcrumb").html("<li><a href=\"https://metrics.torproject.org/\">Home</a></li><li><a href=\"https://metrics.torproject.org/services.html\">Services</a></li><li class=\"active\">Relay Search</li>");
        $("#secondary-search").hide();
        $("#secondary-search-query").val("");

        mainSearchView.render();

        $(".progress").hide();
        $("#content").show();
    }

  });

  var initialize = function(){
    var app_router = new AppRouter;
    Backbone.history.start();

    $("#secondary-search-submit").bind('click', function(){
      document.location = "#search/"+encodeURI($('#secondary-search-query').val());
      return false;
    });

    $("#secondary-search-clear").bind('click', function(){
      $("#secondary-search-query").val("");
      return false;
    });

    $("#secondary-search").bind('submit', function(){
      document.location = "#search/"+encodeURI($('#secondary-search-query').val());
      return false;
    });

  };
  return {
    initialize: initialize
  };
});
