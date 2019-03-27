// //Add bootstrap to page
// var $ = require('jquery');
// window.$ = $;
// require('bootstrap');

$(window).ready(function () {
    var form = $('#login')[0];
    console.log(form[0]);
    $(form).submit(function (e) {
        if (form.checkValidity() === false) {
            e.preventDefault();
            e.stopPropagation();
        }
        form.classList.add("was-validated");

    });
});