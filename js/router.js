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
	'top10': 'showTop10',
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
                $(".breadcrumb").html("<li><a href=\"https://metrics.torproject.org/\">Home</a></li><li><a href=\"#\">Relay Search</a></li><li class=\"active\">Details for " + relay.get('nickname') + "</li>");

            },
            error: function() {
                mainDetailsView.error();
                $(".progress").hide();
                $("#content").show();
                $(".breadcrumb").html("<li><a href=\"https://metrics.torproject.org/\">Home</a></li><li><a href=\"#\">Relay Search</a></li><li class=\"active\">Error</li>");
            }
        });
    },

    // Perform a search on Atlas
    doSearch: function(query){
        $(".breadcrumb").html("<li><a href=\"https://metrics.torproject.org/\">Home</a></li><li><a href=\"#\">Relay Search</a></li><li class=\"active\">Search for " + query + "</li>");

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
                success: function(err){
                    doSearchView.relays = doSearchView.collection.models;

                    // Redirect to the details page when there is exactly one
                    // search result.
                    if (doSearchView.relays.length == 1) {
                        document.location = "#details/" +
                            doSearchView.relays[0].fingerprint;
                        return;
                    }
		    doSearchView.error = err;
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
    showTop10: function(){
        $(".breadcrumb").html("<li><a href=\"https://metrics.torproject.org/\">Home</a></li><li><a href=\"#\">Relay Search</a></li><li class=\"active\">Top 10 Relays</li>");

        $("#content").hide();
        $(".progress").show();

        doSearchView.collection.url = "https://onionoo.torproject.org/summary?type=relay&order=-consensus_weight&limit=10&running=true";
            doSearchView.collection.lookup({
                success: function(err){
                    doSearchView.relays = doSearchView.collection.models;
                    doSearchView.error = err;
                    doSearchView.render("");
		    $("#search-title").text("Top 10 Relays by Consensus Weight");
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
        $(".breadcrumb").html("<li><a href=\"https://metrics.torproject.org/\">Home</a></li><li class=\"active\">Relay Search</li>");

        mainSearchView.render();

        $(".progress").hide();
        $("#content").show();
    }

  });

  var initialize = function(){
    var app_router = new AppRouter;
    Backbone.history.start();
  };
  return {
    initialize: initialize
  };
});
