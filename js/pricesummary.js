$(document).ready(function () {
    $.fn.tmpl = function (tmplId, data) {
        var tmpl = doT.template($("#" + tmplId).html());
        if (!$.isArray(data)) data = [data];

        return this.each(function () {
            var html = '';
            for (var itemIdx = 0; itemIdx < data.length; itemIdx++) {
                html += tmpl(data[itemIdx]);
            }
            $(this).append(html);
        });
    };

    $(".summary-country").select2({ dropdownParent: $("#country-container") }).on("change", function () {
        $.cookie("summarycountry", $(".summary-country :selected").val(), { expires: 100, path: '/' });
        UpdateShippingMethods();
    });

    $(".summary-shipping-method").select2({ minimumResultsForSearch: -1, dropdownParent: $("#summary-shipping-method-container") }).on("change", function () {
        $.cookie("summarysm", $(".summary-shipping-method :selected").val(), { expires: 100, path: '/' });
        var selectedOption = $(".summary-shipping-method option:selected");
        $(".maxWeightCalc").text(selectedOption.attr("data-maxweight"));
        UpdatePrice();
    });

    

    $(".summary-weight").numeric({ decimal: false, negative: false });
    $(".summary-weight").keyup(function () {
        $(this).doTimeout('text-type', 250, function () {
            UpdateShippingMethods();;
        });
    });

    $("#tbxQty").change(function() {
        UpdatePrice();
    });

    function UpdatePrice() {
        var weight = $(".summary-weight").val();
        if (weight == "" || weight == 0) {
            $("#summary").hide();
            $("#summary-total").hide();
        }
        else
        {
            $("#summary").fadeTo("fast", 0.5);
            $("#summary-total").fadeTo("fast", 0.5);
            $.ajax({
                type: "POST",
                url: serviceUrl+"/GetSummary",
                data: JSON.stringify({ 'countryCode': $(".summary-country :selected").val(), 'carrier': $(".summary-shipping-method :selected").val(), 'weight': weight, 'productPrice': $("#hfPSProductPrice").val() * $("#tbxQty").val(), 'showLocalShipping': $("#hfPSLocalShipping").val() }),
                contentType: "application/json",
                dataType: "json",
                success: function (data) {
                    prices = jQuery.parseJSON(data.d);
                    if ($(".summary-weight").val() == prices[4]) {
                        if (prices[3] != "-1") {
                            $("#summary").show();
                            $("#summary-total").show();

                            $("#summary").fadeTo("fast", 1); $("#summary-total").fadeTo("fast", 1);

                            var totalPrice = prices[0];
                            $("#lblProductPrice").text(prices[0].formatMoney('¥', 3, ','));
                            if ($("#hfPSLocalShipping").val() == "True") {
                                $("#lblLocalShippingPrice").text(prices[1].formatMoney('¥', 3, ','));
                                totalPrice += prices[1];
                                $("#localShippingRow").show();
                            }
                            else {
                                $("#localShippingRow").hide();
                            }

                            if ($("#hfPSVAT").val()) {
                                var vatValue = parseInt($("#hfPSVAT").val());
                                $("#lblVATPrice").text(vatValue.formatMoney('¥', 3, ','));
                                totalPrice += vatValue;
                                $("#VATRow").show();
                            } else {
                                $("#VATRow").hide();
                            }

                            totalPrice += prices[3];
                            totalPrice += 500; //zen fee
                            $("#lblShippingPrice").text(prices[3].formatMoney('¥', 3, ','));
                            $("#lblTotalPrice").text(totalPrice.formatMoney('¥', 3, ','));

                        } else {
                            $("#summary").hide();
                            $("#summary-total").hide();
                        }
                    }
                }
            });
        }
    }

    function UpdateShippingMethods() {
        $.ajax({
            type: "POST",
            url: serviceUrl+"/GetAllowedShippingMethods",
            data: JSON.stringify({ 'countryCode': $(".summary-country :selected").val(), 'weight': $(".summary-weight").val() }),
            contentType: "application/json",
            dataType: "json",
            success: function (data) {
                $('.summary-shipping-method').empty();
                $('.summary-shipping-method').tmpl('summaryShippingMethodItemTmpl', jQuery.parseJSON(data.d));

                if ($.cookie("summarysm") != null &&
                    $(".summary-shipping-method option[value=" + $.cookie("summarysm") + "]").length) {
                    $(".summary-shipping-method").val($.cookie("summarysm"));
                } else {
                    $(".summary-shipping-method").val($('.summary-shipping-method option:first').val());
                }

                $(".summary-shipping-method").trigger("change");

                var selectedOption = $(".summary-shipping-method option:selected");
                $(".maxWeightCalc").text(selectedOption.attr("data-maxweight"));

                UpdatePrice();
            }
        });
    }

    if ($.cookie("summarycountry") != null) {
        $(".summary-country").val($.cookie("summarycountry"));
        $(".summary-country").trigger("change");
    } else {
        UpdateShippingMethods();
    }
});