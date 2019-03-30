//flag to keep track of which tab the admin is on
var itemFlag;

$(document).ready(function () {
  var table = $(".table");
  var tHeaders;
  itemFlag = $(".itemFlag");

  //If the admin is on the items tab, render the item table and populate it with 
  //the approriate values 
  if (itemFlag.text() === "true") {
    $.ajax({
      type: "GET",
      url: "/items/ALL",
      dataType: "JSON",
      success: function (response) {
        console.log(response);
        tHeaders = ["name", "quantity", "date", "type", "image"];

        //draws the th row
        var tr = $('<tr class="tableHeader">');
        for (var i = 0; i < tHeaders.length; i++) {
          var th = $('<th>').text(tHeaders[i]);
          tr.append(th);
        }
        //remove? header
        var th = $('<th>').text('remove?');
        tr.append(th);
        table.append(tr);

        //draws the td rows
        for (var i = 0; i < response.length; i++) {
          var remove = $(
            '<form method="post" action="/removeItem" class="form">'
          );
          remove.append(
            '<input type="hidden" name="name" value="' +
            response[i].name +
            '"><button>Remove</button>'
          );
          var tr = $("<tr>").append(
            "<td>" +
            response[i].name +
            "</td><td>" +
            response[i].quantity +
            "</td><td>" +
            response[i].date +
            "</td><td>" +
            response[i].type +
            "</td><td>" +
            response[i].image +
            "</td>"
          );
          var td = $("<td>").append(remove);
          tr.append(td);
          table.append(tr);
        }
        //draws the addition button, which spans across the table
        var tr = $("<tr>").attr("class", "addColumn");
        var td = $("<td>")
          .attr("colspan", tHeaders.length + 1)
          .append(
            '<button class="add"><i class="fas fa-plus-square"></i></button>'
          );
        tr.append(td);
        table.append(tr);


        //When add button is clicked replace the button with a form 
        $(".add").click(function (e) {
          var form = $(
            '<form method="post" action="/addItem" class="form-inline"> needsValidation'
          );
          var div = $("<div>").attr("class", "form-group");
          var btn = $(
            '<button type="submit" class="btn btn-primary mb-2" name="Add">'
          ).text("Add");
          for (var i = 0; i < tHeaders.length; i++) {
            div.append(
              '<input type="text" id="' +
              tHeaders[i] +
              '" name="' +
              tHeaders[i] +
              '" placeholder="' +
              tHeaders[i] +
              '" class="form-control" required>'
            );
          }
          form.append(div).append(btn);

          $(".addColumn").html("");

          $(".addForm").append(form);
          $(".addForm").show();
        });
      }
    });
  }
  //If the admin is on the users tab, render the item table and populate it with 
  //the approriate values 
  else {
    $.ajax({
      type: "GET",
      url: "/users/ALL",
      dataType: "JSON",
      success: function (response) {
        tHeaders = [
          "username",
          "email",
          "hashedPassword",
          "address",
          "country",
          "province",
          "city",
          "zip"
        ];
        var tr = $('<tr class="tableHeader">');
        for (var i = 0; i < tHeaders.length; i++) {
          var th = $('<th>').text(tHeaders[i]);
          tr.append(th);
        }
        //remove? header
        var th = $('<th>').text('remove?');
        tr.append(th);
        table.append(tr);

        //draws the table
        for (var i = 0; i < response.length; i++) {
          var remove = $(
            '<form method="post" action="/removeItem" class="form">'
          );
          remove.append(
            '<input type="hidden" name="name" value="' +
            response[i].username +
            '"><button>Remove</button>'
          );
          var tr = $("<tr>").append(
            "<td>" +
            response[i].username +
            "</td><td>" +
            response[i].email +
            "</td><td>" +
            response[i].hashedPassword +
            "</td><td>" +
            response[i].address +
            "</td><td>" +
            response[i].country +
            "</td><td>" +
            response[i].province +
            "</td><td>" +
            response[i].city +
            "</td><td>" +
            response[i].zip +
            "</td>"
          );
          var td = $("<td>").append(remove);
          tr.append(td);
          table.append(tr);
        }
        var tr = $("<tr>").attr("class", "addColumn");
        var td = $("<td>")
          .attr("colspan", tHeaders.length + 1)
          .append(
            '<button class="add"><i class="fas fa-plus-square"></i></button>'
          );
        tr.append(td);
        table.append(tr);

        $(".add").click(function (e) {
          var form = $(
            '<form method="post" action="/addUser" class="form-inline"> needsValidation'
          );
          var div = $("<div>").attr("class", "form-group");
          var btn = $(
            '<button type="submit" class="btn btn-primary mb-2" name="Add">'
          ).text("Add");
          for (var i = 0; i < tHeaders.length; i++) {
            div.append(
              '<input type="text" id="' +
              tHeaders[i] +
              '" name="' +
              tHeaders[i] +
              '" placeholder="' +
              tHeaders[i] +
              '" class="form-control" required>'
            );
          }
          form.append(div).append(btn);

          $(".addColumn").html("");

          $(".addForm").append(form);
          $(".addForm").show();
        });
      }
    });
  }

  //lab 7 code that was modified to work with the current table
  $("td").click(function (e) {
    //any cells besides the remove button
    if (e.currentTarget.cellIndex < tHeaders.length) {
      submitAll();
      var currCell = $(this);

      let cellVal = currCell.html();
      currCell.html('<input class="change" value="' + cellVal + '">');
      currCell.find(".change").focus();

      $(".change").keyup(function (event) {
        if (event.keyCode == 13) {
          currCell.html($(".change").val());
        }
      });
    }
    //remove button is clicked 
    else {
      //gets name of object that need to be removed
      var name = $(this)
        .children()
        .children()
        .val();
      var url;
      if (itemFlag.text() == "true") {
        url = "/removeItem";
      } else {
        url = "/removeUser";
      }
      //rends post request to backedn to remove item from db
      $.ajax({
        type: "POST",
        url: url,
        data: name,
        dataType: "json",
        success: function (response) {
          localStorage.setItem("Message", response); // Storing the reponse from the Ajax call to be used after reloading the page
          document.location.reload();
        }
      });
    }
  });

  //utility function for the cells click function
  function submitAll() {
    $(".change").each(function () {
      let inputVal = $(this).val();
      let cell = $(this).parent();
      cell.html(inputVal);
    });
  }
});
// });

// A function that is called when the update button is pressed on the items page
function submitUpdateForm() {
  var count = 0;
  var tableData = '{ "rows": [';

  if (itemFlag.text() === "true") {
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
        tableData += ",";
        tableData += JSON.stringify(rowData);
      }
      count++;
    });

    tableData += " ]}";

    /* Sending an ajax request to update the items in the database using the values *
     * of the items in the client side table.                                       */
    $.ajax({
      type: "POST",
      url: "/updateItems",
      data: tableData,
      dataType: "json",
      cache: false,
      contentType: "application/json",
      success: function (result) {
        localStorage.setItem("Message", result); // Storing the reponse from the Ajax call to be used after reloading the page
        document.location.reload();
      }
    });
  } else {
    /* Getting the name, quantity and date values of every row after the header row and placing them    *
     * in a tableData variable                                                                          */
    $("#table tr").each(function () {
      var rowContents = $(this).children();
      var rowData = {
        username: rowContents[0].innerHTML,
        email: rowContents[1].innerHTML,
        hashedPassword: rowContents[2].innerHTML,
        address: rowContents[3].innerHTML,
        country: rowContents[4].innerHTML,
        province: rowContents[5].innerHTML,
        city: rowContents[6].innerHTML,
        zip: rowContents[7].innerHTML
      };

      if (count > 0 && count <= 1) {
        tableData += JSON.stringify(rowData);
      } else if (count > 1) {
        tableData += ",";
        tableData += JSON.stringify(rowData);
      }
      count++;
    });

    tableData += " ]}";

    /* Sending an ajax request to update the items in the database using the values *
     * of the items in the client side table.                                       */
    $.ajax({
      type: "POST",
      url: "/updateUsers",
      data: tableData,
      dataType: "json",
      cache: false,
      contentType: "application/json",
      success: function (result) {
        localStorage.setItem("Message", result); // Storing the reponse from the Ajax call to be used after reloading the page
        document.location.reload();
      }
    });
  }
}