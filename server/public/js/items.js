$(document).ready(function() {
    var table = $("table");

    var current;
    var rowIndex;
    var cellIndex;

    var lastCell;
    var input = $("<input type=\"text\">");

    /* When a table cell in the first three columns (not including the header row) is clicked,  *
     * an input box appears that allows the user to change the value of the cell.               */ 
    $(table).click(function (event) {
        current = $(event.target);
        rowIndex = current.parent()[0].rowIndex;
        cellIndex = current[0].cellIndex;
 
        if (rowIndex > 0 && cellIndex < 3) {
            lastCell = $(event.target);
            input.val(current.text());
            current.text("");
            current.append(input);  
        }
    })

    // The new input value above is confirmed when the enter key is pressed
    $(table).on("keyup", function(val) {
        if (val.which == 13) {
            lastCell.remove("input");
            lastCell.text(input.val());
        }
    })
});

// A function that is called when the update button is pressed on the items page
function submitUpdateForm() {
    var count = 0;
    var tableData = '{ "rows": [';

    /* Getting the name, quantity and date values of every row after the header row and placing them    *
     * in a tableData variable                                                                          */
    $("#table tr").each(function () {
        var rowContents = $(this).children();
        var rowData = {
            name: rowContents[0].innerHTML,
            quantity: rowContents[1].innerHTML,
            date: rowContents[2].innerHTML
        };

        if (count > 0 && count <= 1) {
            tableData += JSON.stringify(rowData);
        } else if (count > 1) {
            tableData += ',';
            tableData += JSON.stringify(rowData);
        } 
        count++;
    });

    tableData +=' ]}';

    /* Sending an ajax request to update the items in the database using the values *
     * of the items in the client side table.                                       */
    $.ajax({
        type: "POST",
        url: '/updateItems',
        data: tableData,
        dataType: "json",
        cache: false,
        contentType: 'application/json',
        success: function(result){
            document.location.href = '/items';
        }
    });
}
