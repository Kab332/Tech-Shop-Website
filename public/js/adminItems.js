var itemFlag;
$(document).ready(function () {
  var table = $(".table");
  var tHeaders;
  // var table = $("<table>");
  itemFlag = $(".itemFlag");

  console.log(itemFlag.text());

  if (itemFlag.text() === "true") {
    $.ajax({
      type: "GET",
      url: "/items/ALL",
      dataType: "JSON",
      success: function (response) {
        console.log(response);
        tHeaders = ["name", "quantity", "date", "type"];

        //draws the first row
        table.append(
          "<tr><th>name</th><th>quantity</th><th>date</th><th>type</th>" +
          '<th>remove?</th><th><form method="post" action="removeAllItems" class="form">' +
          '<button class="control row 3">Remove All</button></th>'
        );

        //draws the rest of table
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
          console.log("test");

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
  } else {
    $.ajax({
      type: "GET",
      url: "/users/ALL",
      dataType: "JSON",
      success: function (response) {
        console.log(response);

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
        table.append(
          "<tr><th>username</th><th>email</th><th>hashedPassword</th>+" +
          "<th>address</th><th>country</th><th>province</th><th>city</th><th>zip</th><th>remove?</th>" +
          '<th><form method="post" action="/removeAllUsers" class="form"><button class="control row 3">Remove All</button></th>'
        );

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
          console.log("test");

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

  // $(table).click(function (e) {
  //   e.preventDefault();
  $("th").click(function (e) {
    console.log(e);
    if (e.currentTarget.cellIndex == tHeaders.length - 1) {
      var url;
      if (itemFlag.text() == "true") {
        url = "/removeItem";
      } else {
        url = "/removeUser";
      }
      console.log(url);
      $.ajax({
        type: "POST",
        url: url,
        data: [],
        success: function (response) {
          localStorage.setItem("Message", response); // Storing the reponse from the Ajax call to be used after reloading the page
          document.location.reload();
        }
      });
    }
  });

  $("td").click(function (e) {
    if (e.currentTarget.cellIndex < tHeaders.length) {
      console.log(e);
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
    } else {
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
      console.log(name);
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

  function submitAll() {
    $(".change").each(function () {
      console.log($(this));
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

    console.log(tableData);

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

    console.log(tableData);
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