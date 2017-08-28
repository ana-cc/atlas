var loadSortingExtensions = function(){
    /**
     * Atlas renders speed as MiB/s, KiB/sec, etc - which as a string does
     * not sort nicely at all. This sorting plugin fixes that by converting
     * the speeds back into a raw Bytes value, and then sorting. It is based
     * on two different versions of the datatabes file-size sorting plugin -
     * https://datatables.net/plug-ins/sorting/file-size - the latest edition
     * that has superior matching, and a very old version from 2011 that works
     * with the version of datatables that Atlas runs on.
     *  @name File size
     *  @author mhenderson
     */

    var getBytesFromString = function(xstring,ystring){
        var xmatches = xstring.match( /(\d+(?:\.\d+)?)\s*([a-z]+)/i );
        var ymatches = ystring.match( /(\d+(?:\.\d+)?)\s*([a-z]+)/i );
        var multipliers = {
            b:  1,
            bytes: 1,
            kb: 1000,
            kib: 1024,
            mb: 1000000,
            mib: 1048576,
            gb: 1000000000,
            gib: 1073741824,
            tb: 1000000000000,
            tib: 1099511627776,
            pb: 1000000000000000,
            pib: 1125899906842624
        };
    
        var x = xmatches[1];
        if (xmatches){
            x = x * multipliers[xmatches[2].toLowerCase()];
        }
        var y = ymatches[1]; 
        if (ymatches) {
            y = y * multipliers[ymatches[2].toLowerCase()];
        }

        return [x,y]
    }

    jQuery.extend( jQuery.fn.dataTableExt.oSort, {
        "file-size-asc": function ( a, b ) {
            var raw = getBytesFromString(a,b)
            var x = raw[0]
            var y = raw[1]
            return ((x < y) ? -1 : ((x > y) ?  1 : 0));
        },

        "file-size-desc": function ( a, b ) {
            var raw = getBytesFromString(a,b)
            var x = raw[0]
            var y = raw[1]          
            return ((x < y) ?  1 : ((x > y) ? -1 : 0));
        }
    } );

    /**
     * Sorts a column containing IP addresses in typical dot notation. This can 
     * be most useful when using DataTables for a networking application, and 
     * reporting information containing IP address. Also has a matching type 
     * detection plug-in for automatic type detection.
     *  @name IP addresses 
     *  @author Brad Wasson
     */

    jQuery.extend( jQuery.fn.dataTableExt.oSort, {
        "ip-address-asc": function ( a, b ) {
            var m = a.split("."), x = "";
            var n = b.split("."), y = "";
            for(var i = 0; i < m.length; i++) {
                var item = m[i];
                if(item.length == 1) {
                    x += "00" + item;
                } else if(item.length == 2) {
                    x += "0" + item;
                } else {
                    x += item;
                }
            }
            for(var i = 0; i < n.length; i++) {
                var item = n[i];
                if(item.length == 1) {
                    y += "00" + item;
                } else if(item.length == 2) {
                    y += "0" + item;
                } else {
                    y += item;
                }
            }
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        },

        "ip-address-desc": function ( a, b ) {
            var m = a.split("."), x = "";
            var n = b.split("."), y = "";
            for(var i = 0; i < m.length; i++) {
                var item = m[i];
                if(item.length == 1) {
                    x += "00" + item;
                } else if (item.length == 2) {
                    x += "0" + item;
                } else {
                    x += item;
                }
            }
            for(var i = 0; i < n.length; i++) {
                var item = n[i];
                if(item.length == 1) {
                    y += "00" + item;
                } else if (item.length == 2) {
                    y += "0" + item;
                } else {
                    y += item;
                }
            }
            return ((x < y) ? 1 : ((x > y) ? -1 : 0));
        }
    } );
}