$(document).ready(function () {
    $("#tbxQty").numeric({ decimal: false, negative: false });

    $("#slider").on("click", ".thumb", function () {
        $("#imgPreview").attr("src", this.src).attr("data-openslide", $(this).data("openslide"));
    });

    $("#imgPreview").click(function () {
        goToSlide($(this).attr("data-openslide"));
        $('#previewImagesModal').modal('show');
    });
});

function validateProductQty() {
    var maxQty = parseInt($('#tbxQty').attr("data-maxqty"));
    var qty = parseInt($('#tbxQty').val());
    if (maxQty != -1 && qty > maxQty) {
        $.jGrowl('<span class="icon icon-megaphone"></span><p>' + $("#invalidqty").text().replace("%MAX_UNIT%", maxQty + 1) + '</p>', { sticky: false, position: 'center', theme: 'growl-warning', header: '' });
        return false;
    }
    return true;
}

function getSelectedVariations() {
    var result = "";
    var variationsDisplayInfo = [];
    $(".attribute-select").each(function () {
        result = result + this.name + ":" + this.value + ";";
        variationsDisplayInfo.push($(this).find("option:selected").attr("data-ja-name"));
    });
    $("#selectedVariations").val(result);
    $("#selectedVariationsDisplayInfo").val(variationsDisplayInfo.join(';'));
}