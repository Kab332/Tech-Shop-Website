$(document).ready(function() {
    var searchBar = $("#searchBar");
    var table = $("<table>");
    table.addClass("table");

    // rawXML variable from xml_parsing_from_jquery.js of website examples (Ajax)
    var rawXML = '\
<inventory>\
   <computers>\
      <laptop price="499.99" cpu="i5-3570" />\
      <laptop price="549.99" cpu="i5-3570" />\
      <laptop price="999.99" cpu="i7-2600" />\
   </computers>\
</inventory>';

    $("#searchButton").click(function () {
        search("laptop");
        $("#content").empty();
        $("#content").append(table);
    });

    function search (word) {
        var rawXML = '\
    <inventory>\
       <computers>\
          <laptop price="499.99" cpu="i5-3570" />\
          <laptop price="549.99" cpu="i5-3570" />\
          <laptop price="999.99" cpu="i7-2600" />\
       </computers>\
    </inventory>';
    
        var xmlDoc = $.parseXML(rawXML);
        
        if ($(xmlDoc).find(word).children().length > 0) {
            getChildrenResults($(xmlDoc).find(word).children());
        } else {
            $(xmlDoc).find(word).each(function() {
                var text = "<tr>"
                $.each(this.attributes, function(i, attribute) {
                    text += "<td>" + attribute.value + "</td>";
                });
                text += "</tr>";
                table.append(text);
            });
        }
    }
    
    function getChildrenResults (collection) {
        if ($(collection).children().length > 0) {
            $(collection).children().each(function() {
                getChildrenResults(this);
            });
        } else {
            $(collection).each(function() {
                var text = "<tr>"
                $.each(this.attributes, function(i, a) {
                    text += "<td>" + a.value + "</td>";
                });
                text += "</tr>";
                table.append(text);
            })
        }
    }
});

