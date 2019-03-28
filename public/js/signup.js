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