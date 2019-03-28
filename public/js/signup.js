$(window).ready(function () {
    var form = $('form')[0];
    console.log(form);

    // $("")

    $(form).submit(function (e) {
        console.log(form);
        if (form.checkValidity() === false) {
            e.preventDefault();
            e.stopPropagation();
        }
        form.classList.add("was-validated");

    });
});

$(document).ready(function () {
    //check if username already exists and displays a message
    $('#inputUserName').blur(function (e) {
        e.preventDefault();
        console.log($('#inputUserName').val());

        //query db for username
        $.ajax({
            type: "GET",
            url: "/users/" + $('#inputUserName').val(),
            dataType: "JSON",
            success: function (response) {
                console.log(response);
                if (response.length == 0) {} else {
                    console.log('error');
                    $('#inputUserName').attr('class', ':invalid').append('<div><p>That username already exists</p></div>');
                }

            }
        });
    });
});