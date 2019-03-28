$(window).ready(function () {
    var form = $('form')[0];

    $(form).submit(function (e) {
        if (form.checkValidity() === false) {
            e.preventDefault();
            e.stopPropagation();
        }
        form.classList.add("was-validated");

    });
});