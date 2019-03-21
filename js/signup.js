$(window).ready(function () {
    var form = $('#signUpForm')[0];

    $(form).submit(function (e) {
        if (form.checkValidity() === false) {
            e.preventDefault();
            e.stopPropagation();
        }
        form.classList.add("was-validated");

    });
});

$(document).ready(function () {
    var pass1 = $('#inputPassword');
    var pass2 = $('#inputPassword2');

    $(pass2).blur(function (e) {
        console.log('func called');
        console.log($(pass1).text());
        console.log($(pass2));
        if ($(pass1).text() != $(pass2).text()) {
            $(pass2).addClass('invalid-feedback');
        }

    });
});