$(document).ready(function() {
    var searchBar = $("#searchBar");

    $("#searchButton").click(function () {
        var values = $("#searchBar").val().split(" ");

        $("#content").empty();
        for (var i = 0; i < values.length; i++) {
            search(values[i]);
            removeDuplicates();
        }
    });

    function search (word) {
        // rawXML variable from xml_parsing_from_jquery.js of website examples (Ajax)
        var rawXML = '\
    <inventory>\
       <computers>\
          <laptop price="499.99" cpu="i5-3570" />\
          <laptop price="549.99" cpu="i5-3570" />\
          <laptop price="999.99" cpu="i7-2600" />\
          <desktop price="999.99" cpu="i3-2600" gpu="gtx 1080" />\
          <desktop price="799.99" cpu="i3-3600" gpu="gtx 1070" />\
          <desktop price="699.99" cpu="i3-4600" gpu="gtx 1060" />\
       </computers>\
       <components>\
          <speakers price="40.00" colour="blue" />\
          <speakers price="60.00" colour="red" />\
          <mouse price="20.00" colour="white" brand="logitech" />\
          <mouse price="25.00" colour="black" brand="microsoft" />\
       </components>\
    </inventory>';
    
        var xmlDoc = $.parseXML(rawXML);

        if ($(xmlDoc).find(word).children().length > 0) {
            console.log(word);
            getChildrenResults($(xmlDoc).find(word).children());
        } else {
            var element = {};

            $(xmlDoc).find(word).each(function() {
                var header = "<tr>";
                var text = "<tr>";
                $.each(this.attributes, function(i, a) {
                    header += "<th>" + a.name + "</th>";
                    text += "<td>" + a.value + "</td>";
                });
                text += "</tr>";
                header += "</tr>";

                if (element[this.localName] == undefined) {
                    element[this.localName] = header + text;
                } else {
                    element[this.localName] += text;
                }
            });

            for (var name in element) {
                var table = $("<table>");
                table.append("<tr><th><h3>" + name + "</h3></th></tr>")
                table.addClass("table");
                table.append(element[name]);
                $("#content").append(table);    
            }

        }
    }
    
    function getChildrenResults (collection) {
        if ($(collection).children().length > 0) {
            getChildrenResults($(collection).children());
        } else {
            var elements = {};
        
            $(collection).each(function() {
                var header = "<tr>";
                var text = "<tr>";
                $.each(this.attributes, function(i, a) {
                    header += "<th>" + a.name + "</th>";
                    text += "<td>" + a.value + "</td>";
                });
                text += "</tr>";
                header += "</tr>";

                if (elements[this.localName] == undefined) {
                    elements[this.localName] = header + text;
                } else {
                    elements[this.localName] += text;
                }
            })
            for (var element in elements) {
                var table = $("<table>");
                table.addClass("table");
                table.append("<tr><th><h3>" + element + "</h3></th></tr>")
                table.append(elements[element]);
                $("#content").append(table);    
            }
        }
    }

    // Temporary solution to duplicates
    function removeDuplicates() {
        // Making a dictionary that will keep track of values that have been seen 
        var existingValues = {};
        // Iterating through all the rows of a table
        $("table tr").each(function () {
            // Getting the text from current row
            var text = $(this).text();
            // If the current row has already been seen
            if(existingValues[text]) {
                // Remove the row
                $(this).remove();
            } 
            // If it has not been seen
            else {
                // Add it to the dictionary with a value of true
                existingValues[text] = true;
            }
        });
    }
});

