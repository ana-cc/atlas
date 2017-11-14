// ~ views/search/do ~
define([
  'jquery',
  'underscore',
  'backbone',
  'collections/results',
  'text!templates/search/do.html',
  'datatables',
  'datatablessort',
  'tooltip',
  'helpers',
  'typeahead'
], function($, _, Backbone, resultsCollection, doSearchTemplate){
  var doSearchView = Backbone.View.extend({
	    el: $("#content"),
	    initialize: function() {
	    	this.collection = new resultsCollection;
	    },
        render: function(query){
            document.title = "Relay Search";
            var asInitVals = new Array();
            var compiledTemplate = _.template(doSearchTemplate, {query: query, relays: this.relays, countries: CountryCodes, error: this.error});
			this.el.html(compiledTemplate);
            var fp = this;
            loadSortingExtensions();
            // This creates the table using DataTables
            var oTable = $('#torstatus_results').dataTable({
                //Define column specific options
                "aoColumns": [
                        null,   //Status
                        null,   //Nickname
                        { "sType":  "file-size" },  //Bandwidth
                        null,   //Uptime
                        null,   //Country
                        { "sType":  "ip-address" },  //IP Address
                        null,   //Flags
                        null,   //Properties
                        null,   //ORPort
                        null,   //DirPort
                        null    //Type
                    ],
                // Save the state of the tables
                "sDom": "<'row'<'span6'l><'span6 hide'f>r>t<'row'<'span6'i><'span6'p>>",
				"bStateSave": false,
				"aaSorting": [],
                "fnDrawCallback": function( oSettings ) {
                    // Make the tooltips
                    $(".tip").tooltip();
                }
			});
            // Type ahead for country codes
            $('.typeahead').typeahead({source:_.values(CountryCodes)});
            $('input#flags').typeahead({
                    source: ['Authority', 'Fast', 'Guard', 'HSDir', 'Named',
                            'Running', 'Stable', 'V2Dir', 'Valid', 'Unnamed',
                            'Exit']
            });
            $('input#type').typeahead({
                    source: ['Relay', 'Bridge']
            });

            $("#torstatus_results tbody tr").hover(function() {
                $(this).addClass('hover');
            }, function() {
                $(this).removeClass('hover');
            });

            $("tfoot input#nickname").keyup( function() {
                oTable.fnFilter(this.value, 0);
            });

            $("tfoot input#bw_from").keyup(function() {
                oTable.fnDraw();
            });

            $("tfoot input#bw_to").keyup(function() {
                oTable.fnDraw();
            });

           $("tfoot input#uptime_from").keyup(function() {
                oTable.fnDraw();
            });

           $("tfoot input#uptime_to").keyup(function() {
                oTable.fnDraw();
            });

           $("tfoot input#or_address").keyup(function() {
                oTable.fnFilter(this.value, 4);
           });

           $("tfoot input#or_port").keyup(function() {
                oTable.fnFilter(this.value, 6);
           });

           $("tfoot input#dir_port").keyup(function() {
                oTable.fnFilter(this.value, 7);
           });

           $("tfoot input#flags").keyup(function() {
                oTable.fnDraw();
           });

           $("tfoot input#country").keyup(function() {
                oTable.fnDraw();
           });

           $("tfoot input#type").keyup(function() {
                oTable.fnFilter(this.value, 8);
           });


        },

	    renderError: function(){
	    	var compiledTemplate = _.template(doSearchTemplate, {relays: null, error: this.error, countries: null});
	    	this.el.html(compiledTemplate);
	    }

  });
  return new doSearchView;
});

