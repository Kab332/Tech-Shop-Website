$(document).ready(function () {
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
    $(table).on("keyup", function (val) {
        if (val.which == 13) {
            lastCell.remove("input");
            lastCell.text(input.val());
        }
    })
});