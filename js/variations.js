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

    function showVariations(vJson) {
        var variationsJson = unescape($("#variations").val());
        var isSubSelect = false;
        if (vJson != undefined && vJson.length > 0) {
            variationsJson = vJson;
            isSubSelect = true;
        }

        if (variationsJson == "") {
            return;
        }

        var variations = JSON.parse(variationsJson);

        $.each(variations, function (index, variation) {
            var optionsStr = "";
            var hasSubSelect = false;
            if (variation != null) {
                $.each(variation.Options, function (index, option) {
                    //if (variation.Options.length == 1 && option.SubVariations && !$("#preselectedVariationtmpl").length) {
                    //    $.each(option.SubVariations, function (i, sv) {
                    //        if (!sv.Name) sv.Name = "";
                    //        sv.Name += " " + variation.Name;
                    //    });
                    //}

                    var isSelectedOptionStr = option.IsSelected ? "selected" : "";
                    var optionUrl = option.Url;
                    var normalizedName = option.Name.replace("'", "");

                    var jaVariationName = "";
                    if (normalizedName.length) {
                        jaVariationName += variation.Name ?? "";
                        if (jaVariationName.length) {
                            jaVariationName += " : ";
                        }
                        jaVariationName += normalizedName;
                    }

                    var notranslateOption = option.Name.match(/^[ 0-9a-zA-Z]+$/)
                    optionsStr = optionsStr + "<option value='" + option.Value + "' data-maxqty='" + getMaxOptionQty(option) + "'  data-subSelectData='" + JSON.stringify(option.SubVariations) + "' data-optionUrl='" + optionUrl + "' " + isSelectedOptionStr + " data-ja-name='" + jaVariationName + "' " + (notranslateOption ? "class='notranslate'" : "") + " >" + option.Name + "</option>";
                    if (option.SubVariations != undefined && option.SubVariations.length > 0) {
                        hasSubSelect = true;
                    }
                });

                if ($("#preselectedVariationtmpl").length && variation.Options.length == 1) {
                    $('#divSelectVariation').tmpl('preselectedVariationtmpl', { Title: variation.Name ?? "", PreselectedValue: variation.Options[0].Value.split("##")[1] ?? variation.Options[0].Name, IsSubSelect: isSubSelect });
                }

                var result = { Title: variation.Name ?? "", Options: optionsStr, HasSubSelect: hasSubSelect, IsSubSelect: isSubSelect };

                $('#divSelectVariation').tmpl('variationtmpl', result);

                if ($('.select2-open-container').length === 0) {
                    $('#divSelectVariation').append('<div class="notranslate select2-open-container"></div>');
                }
                
                $("#divSelectVariation .attribute-select:last")
                    .select2({
                        dropdownParent: $(".select2-open-container"),
                        width: '100%',
                        minimumResultsForSearch: -1
                    })
                    .on('change', function () {
                    if ($(this).find('option:selected').attr("data-optionUrl") && $(this).find('option:selected').attr("data-optionUrl") != "null") {
                        $("#header1_tbxSearch").val($(this).find('option:selected').attr("data-optionUrl"));
                        __doPostBack('header1$btnSearch', '')
                    } else {
                        $("#tbxQty").attr("data-maxqty", $(this).find('option:selected').attr("data-maxQty"));
                        if ($(this).attr("data-hasSubSelect") == 'true') {
                            $("div[data-isSubSelect='true']").remove();
                            showVariations($(this).find('option:selected').attr("data-subSelectData"));
                        }

                    }
                });

                $(".select2-selection__placeholder").addClass("notranslate");
                $(".select2-selection__rendered").addClass("notranslate");

                if ($("#divSelectVariation select:last option:not(:empty):selected").length) {
                    if ($("#divSelectVariation select:last option:selected").attr("data-subSelectData") &&
                        $("#divSelectVariation select:last option:selected").attr("data-subSelectData") != "null" &&
                        JSON.parse($("#divSelectVariation select:last option:selected").attr("data-subSelectData")).length) {
                        $("div[data-isSubSelect='true']").remove();
                        showVariations($("#divSelectVariation select:last option:selected").attr("data-subSelectData"));
                    }
                } else {
                    if (variation.Options.length == 1) {
                        var currentEl = $("#divSelectVariation .attribute-select:last");
                        currentEl.val(variation.Options[0].Value).trigger("change");
                        currentEl.parents("div.select-container").hide();
                    }
                }
            }
        });
    }

    function getMaxOptionQty(option) {
        if (option.MaxQty && option.MaxQty != undefined)
            return parseInt(option.MaxQty);

        var availableQuantity = $("#hfAvailableQuantity").length && $("#hfAvailableQuantity").val() ? parseInt($("#hfAvailableQuantity").val()) : 0;

        if (availableQuantity > 0)
            return availableQuantity;

         return -1;
    }

    showVariations();
});