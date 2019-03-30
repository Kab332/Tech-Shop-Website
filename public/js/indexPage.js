$(document).ready(function () {
    $("table").click(function(event) {
        var tbody = event.target.parentNode.parentNode.parentNode;
        var rows = $(tbody).children();
        var name = $(rows[0]).text();
        var quantity = $(rows[2]).text().split(" ")[1];

        var cartData = {
            name: name,
            quantity: quantity
        };

        $.ajax({
            type: 'POST',
            url: '/addToCart',
            data: JSON.stringify(cartData),
            dataType: 'json',
            cache: false,
            contentType: 'application/json',
            success: function(result){
                console.log(result);
            }
        });
    });
});
