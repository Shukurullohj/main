window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }

if ($.cookie("gdprterms") != 1) {
    gtag('consent', 'default', {
        'ad_storage': 'denied',
        'ad_user_data': 'denied',
        'ad_personalization': 'denied'
    });
}

document.addEventListener('DOMContentLoaded', (event) => {
    var div = document.createElement('div'); //solve mmenu ublock bug
    document.body.appendChild(div);
});


// Function to get the brightness of a color
function getColorBrightness(color) {
    const rgb = color.match(/\d+/g);
    return (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
}

function RefreshCategories() {
    var shop = $("#hfShop").val();
    var genre = $("#hfGenre").val();

    if (genre)
        $(".current-category").show()
    else
        $(".current-category").hide()

    $(".default-categories").find(".category").hide();
    $(".default-categories").find("." + shop + "-categories").show();

    var category = $(".default-categories li a[data-categoryid='" + genre + "']:last").text();
    $(".header-search-category").text(category);
    $("#mobile-menu-preferred-category").text(category);
}

function selectShop(shop, name) {
    $(".header-search-shop").text(name);
    $("#mobileMenuPreferredShop .mm-navbar__title span").text($("#mobileMenuPreferredShop .mm-navbar__title span").text().replace($("#lblMobileMenuPreferredShop").text(), name));
    $("#lblMobileMenuPreferredShop").text(name);
    $("#mobile-menu-preferred-shop").text(name);
    if (shop) {
        if (!isOtherShopSelected(shop)) {
            $("#shop-categories-container").show();
            if ($("#hfShop").val() != shop)
                $("#hfGenre").val("");

            $("#hfShop").val(shop);

            $.cookie("prefshop", shop, { expires: 100, path: '/' });
            RefreshCategories();
        } else {
            $("#shop-categories-container").hide();
            $("#hfShop").val(shop);
            $("#hfGenre").val("");
        }

        if (shop == "minne" || shop == "digimart") {
            $("#shop-categories-container").hide();
        }
    }
    updateTypeaheadVisibility();
}

function selectCategory(categoryid, name) {
    $(".header-search-category").text(name);
    $("#mobile-menu-preferred-category").text(name);
    if (categoryid)
        $("#hfGenre").val(categoryid);
    else
        $("#hfGenre").val("");
}

function showSearchSuggest() {
    if ($(".mobile-menu-search-input").is(":visible")) {
        $("#header1_searchSuggest")
            .css("top", ($(".mobile-menu-search-input:visible").parent().offset().top + $(".mobile-menu-search-input:visible").parent().outerHeight()) + "px")
            .css("left", ($(".btn-mobile-menu-open-preferred-shop").offset().left + $(".btn-mobile-menu-open-preferred-shop").outerWidth() + 1) + "px")
            .css("width", ($(".mobile-menu-search-input:visible").outerWidth()) + "px")
            .show();
    } else {
        $("#header1_searchSuggest")
            .css("top", ($(".search-line .input-group").offset().top + $(".search-line .input-group").height() - 1) + "px")
            .css("left", $(".header-search").offset().left + "px")
            .css("width", ($("#header1_tbxSearch").outerWidth() + $("#header1_btnSearch").outerWidth()) + "px")
            .show();
    }
}

function hideSearchSuggest() {
    $("#header1_searchSuggest").hide();
}

function isShopsPage() {
    return window.location.href.indexOf("shop.aspx?") != -1;
}

function isOtherShopSelected(shop) {
    return shop && shop.length && shop != "rakuten" && shop != "amazon" && shop != "yahoo" && shop != "yahooshopping" && shop != "zenmarketplace" && shop != "rakuma" && shop != "mercari" && shop != "luxe" && shop != "minne" && shop != "digimart";
}

function initTypeahead() {
    $('.header-search, .mobile-menu-search-input').typeahead({
        matcher: function (item) { return true },
        sorter: function (items) { return items },
        onselect: function (item) {
            if (item.id != null) {
                $("#hfAutocompleteGenre").val(item.id);
                $(".header-search").val(decodeHtml($(".header-search").val()));
                __doPostBack('header1$btnSearch', '')
            } else {
                $(".header-search").val(decodeHtml($(".header-search").val()));
                __doPostBack('header1$btnSearch', '')
            }
        }, source: function (typeahead, query) {
            if (isOtherShopSelected($("#hfShop").val()))
                return;

            var method = "GetYahooSuggestion";
            if ($.cookie("prefshop") == "rakuten") method = "GetRakutenSuggestion";
            if ($.cookie("prefshop") == "amazon") method = "GetAmazonSuggestion";
            if ($.cookie("prefshop") == "yahooshopping") method = "GetYahooShoppingSuggestion";
            if ($.cookie("prefshop") == "zenmarketplace") method = "GetMarketplaceSuggestion";
            if ($.cookie("prefshop") == "rakuma") method = "GetRakumaSuggestion";
            if ($.cookie("prefshop") == "mercari") method = "GetMercariSuggestion";
            if ($.cookie("prefshop") == "minne") method = "GetMinneSuggestion";
            if ($.cookie("prefshop") == "digimart") method = "GetDigimartSuggestion";
            if ($.cookie("prefshop") == "dhc") return;
            if ($.cookie("prefshop") == "luxe") return;
            $.ajax({
                type: "POST",
                url: $("#hfAutocompleteServiceUrl").val() + "/" + method,
                data: JSON.stringify({ "prefix": $(".header-search").val() }),
                contentType: "application/json", dataType: "json",
                success: function (data) {
                    return typeahead.process(jQuery.parseJSON(data.d));
                }
            });
        }
    });
    
}

var isTypeaheadInitialized = false;
function updateTypeaheadVisibility() {
    if (isOtherShopSelected($("#hfShop").val())) {
        if (isTypeaheadInitialized) {
            $('.header-search, .mobile-menu-search-input').off('focus.typeahead keypress.typeahead keyup.typeahead blur.typeahead'); // Unbind only typeahead events
            $('.header-search, .mobile-menu-search-input').removeData('typeahead');
            isTypeaheadInitialized = false;
        }
    } else {
        if (!isTypeaheadInitialized) {
            initTypeahead();
            isTypeaheadInitialized = true;
        }
    }
}

$(document).ready(function () {
    //document.tidioChatLang = document.querySelector('html').getAttribute('lang');
    //show offer

    setTimeout(function () {
        if ($("#signUpOfferWindow").length)
            if ($.cookie("hidesignupoffer") != 1) {
                $("#signUpOfferWindow").modal("show");
            }
    }, 5000);

    var mobileMenu;
    setTimeout(function () {
        if ($("#mobile-menu").length) {

            $(".default-shops li a").each(function () {
                var html = `<li><a href='#' class='select-mobile-menu-category close-mobile-menu' data-categoryid=''>${$(".default-categories li a[data-categoryid='']").text()}</a></li>`;
                $("." + $(this).data("shopid") + "-categories a").each(function () {
                    html += `<li><a href='#' class='select-mobile-menu-category close-mobile-menu' data-categoryid='${$(this).data("categoryid")}' data-categoryname='${$(this).text()}'>${$(this).text()}</a></li>`;
                });
                $("#mobileMenuPreferredShop").append(`<li class='select-mobile-menu-shop' data-shopid='${$(this).data("shopid")}' data-shopname='${$(this).text()}'><span>${$(this).text()}</span><ul>${html}</ul></li>`);
            });

            $('.select-mobile-menu-shop').on("click", function () {
                selectShop($(this).data("shopid"), $(this).data("shopname"));
            });

            $('.select-mobile-menu-category').on("click", function () {
                selectCategory($(this).data("categoryid"), $(this).data("categoryname"));
            });

            mobileMenu = new Mmenu('#mobile-menu', {
                "navbar": {
                    title: "ZenMarket",
                    titleLink: "parent"
                },
                "extensions": [
                    "border-none", "pagedim-black", "position-front"
                ]
            });            
        }
    }, 100);

    $('.btn-menu-close').on("click", function (e) {
        mobileMenu.close();
        mobileMenu.closeAllPanels();
        e.preventDefault();
    });

    $(".close-mobile-menu").on("click", function () {
        mobileMenu.close();
        mobileMenu.closeAllPanels();
    });

    $(".btn-mobile-menu-open-preferred-shop").click(function (e) {
        mobileMenu.API.open();
        mobileMenu.API.openPanel(document.querySelector("#mobileMenuPreferredShop"));
        e.preventDefault();
        return false;
    });

    $('#signUpOfferWindow').on('hidden.bs.modal', function () {
        $.cookie('hidesignupoffer', 1, { expires: 365 });
    });


    $(".mobile-menu").sticky({ topSpacing: 0 });

    $('.mobile-menu').on('sticky-start', function () { $(".hide-on-scroll").addClass("hidden"); $(".show-on-scroll").removeClass("hidden"); });
    $('.mobile-menu').on('sticky-end', function () { $(".show-on-scroll").addClass("hidden"); $(".hide-on-scroll").removeClass("hidden"); });


    //$(".search-sticky-button").click(function () {
    //    $('html, body').animate({
    //        scrollTop: 0
    //    }, 500);
    //    $(".header-search").focus();
    //    return false;
    //});

    var activetab = $("#hfActiveTab").val();
    if (activetab) {
        var shop = $(".default-shops li a[data-shopid='" + activetab + "']").text();
        $(".header-search-shop").text(shop);
        $("#mobileMenuPreferredShop .mm-navbar__title span").text($("#mobileMenuPreferredShop .mm-navbar__title span").text().replace($("#lblMobileMenuPreferredShop").text(), shop));
        $("#lblMobileMenuPreferredShop").text(shop);
        $("#mobile-menu-preferred-shop").text(shop);
        $("#hfShop").val(activetab);
        $.cookie("prefshop", activetab, { expires: 100, path: '/' });
        RefreshCategories();
    }
    else {
        if (isShopsPage()) {
            $("#hfShop").val($("#hfShopId").val());
            $(".header-search-shop").text($("#hfShopName").val());
            $("#shop-categories-container").hide();
            $("#default-shops-list").prepend(`<li><a data-shopid='${$("#hfShopId").val()}' data-target='#'>${$("#hfShopName").val()}</a></li>`);
        } else {
            if ($.cookie("prefshop") != null) {
                var shop = $(".default-shops li a[data-shopid='" + $.cookie("prefshop") + "']").text();
                $(".header-search-shop").text(shop);
                $("#mobileMenuPreferredShop .mm-navbar__title span").text($("#mobileMenuPreferredShop .mm-navbar__title span").text().replace($("#lblMobileMenuPreferredShop").text(), shop));
                $("#lblMobileMenuPreferredShop").text(shop);
                $("#mobile-menu-preferred-shop").text(shop);
                $("#hfShop").val($.cookie("prefshop"));
            } else {
                var shop = $(".default-shops li a[data-shopid='yahoo']").text();
                $(".header-search-shop").text(shop);
                $("#mobileMenuPreferredShop .mm-navbar__title span").text($("#mobileMenuPreferredShop .mm-navbar__title span").text().replace($("#lblMobileMenuPreferredShop").text(), shop));
                $("#lblMobileMenuPreferredShop").text(shop);
                $("#mobile-menu-preferred-shop").text(shop);
                $("#hfShop").val("yahoo");
            }

            RefreshCategories();
        }
    }

    if ($("#hfShop").val() == "minne" || $("#hfShop").val() == "digimart") {
        $("#shop-categories-container").hide();
    }

    updateTypeaheadVisibility();

    //$(document).on("keyup", ".mobile-menu-search-input", function () {
    //    debugger;
    //    $(".header-search").val($(this).val());
    //});
    //$(".mobile-menu-search-input").keypress(function (e) {
    //    $(".header-search").val($(this).val());
    //});

    // Get references to the input elements
    const input1 = document.getElementById('mobile-menu-search-input1');
    const input2 = document.getElementById('mobile-menu-search-input2');
    const input3 = document.getElementById('header1_tbxSearch');

    // A function to update all input fields except the one being typed into
    function syncInputs(sourceInput) {
        if (sourceInput != null) {
            const value = sourceInput.value; // Get the current value of the input being typed into
            // Update the other two inputs with this value
            if (sourceInput !== input1) input1.value = value;
            if (sourceInput !== input2) input2.value = value;
            if (sourceInput !== input3) input3.value = value;
        }
    }

    if (input1 != null && input2 != null && input3 != null) {
        syncInputs(input3);
        // Add event listeners to each input
        [input1, input2, input3].forEach(input => {
            input.addEventListener('input', () => syncInputs(input));
        });
    }

    $(".header-search, .mobile-menu-search-input").keypress(function (e) {
        if (e.which == 13) {
            __doPostBack($("#header .header-search-button").attr("id").replace("_btnSearch", "$btnSearch"), ''); return false;
        }
    });



    $(".default-shops li a").click(function () {
        selectShop($(this).data("shopid"), $(this).text());
    });

    $(".default-categories li a").click(function () {
        selectCategory($(this).data("categoryid"), $(this).text());
    });




    $('#header1_tbxRememberLogin').bind('keydown', function (e) {
        var key = e.charCode ? e.charCode : e.keyCode ? e.keyCode : 0;
        if (key == 13) {
            __doPostBack("header1$btnRemember", "");
            return false;
        }
    });

    $(".show-filters").on("click", function () {
        $(".filters-container").addClass("hamburger-content");
        $(".categories-wrapper").hide();
        $(".filters-wrapper").show();
    });
    $(".hide-filters").on("click", function () {
        $(".filters-container").removeClass("hamburger-content");
        $(".categories-wrapper").show();
        $(".filters-wrapper").show();
    });
    $(".show-categories").on("click", function () {
        $(".filters-container").addClass("hamburger-content");
        $(".categories-wrapper").show();
        $(".filters-wrapper").hide();
    });


    $("#accept-gdpr-terms").click(function () {
        $.cookie('gdprterms', 1, { expires: 1365 });
        $.cookie('gdprconsent', 1, { expires: 1365 });
        $("#gdpr-terms-warning").hide();

        gtag('consent', 'update', {
            'ad_storage': 'granted',
            'analytics_storage': 'granted',
            'ad_user_data': 'granted',
            'functionality_storage': 'granted',
            'personalization_storage': 'granted',
            'security_storage': 'granted',
            'ad_personalization': 'granted'
        });

        return false;
    });

    $(".header-search, .mobile-menu-search-input").focus(function (e) {
        if (!$(this).val().length) {
            showSearchSuggest();
        } else {
            hideSearchSuggest();
            $(this).keyup();
        }
    });

    $(".header-search, .mobile-menu-search-input").keyup(function () {
        if (!$(this).val().length) {
            showSearchSuggest();
        } else {
            hideSearchSuggest();
        }
    });

    $(".header-search, .mobile-menu-search-input").focusout(function (e) {
        setTimeout(hideSearchSuggest, 100);
    });

    $("#search-history-clear").click(function (e) {
        $.ajax({
            type: "POST",
            url: "/default.aspx/ClearUserSearchHistory",
            contentType: "application/json",
            success: function (data) {
                $("#header1_searchSuggest").remove();
            }
        });
    });

    $(".select-query").click(function (e) {
        $(".header-search").val($(this).text().trim());
        __doPostBack('header1$btnSearch', '')
    })

    // Function to set text color based on background brightness
    function setLinkColor() {
        var banners = document.querySelectorAll('.header-banner');
        if (banners) {
            var bannerArray = Array.prototype.slice.call(banners);
            bannerArray.forEach(function (banner) {
                const bgColor = window.getComputedStyle(banner).backgroundColor;
                const brightness = getColorBrightness(bgColor);

                const closeButton = banner.querySelector('.close-header-banner');

                if (closeButton) {
                    closeButton.style.color = brightness > 128 ? '#000' : '#fff';
                }
            });
        }
    }

    $('#addProductModal').on('shown.bs.modal', function () {
        var addProductComment = localStorage.getItem('zenlink_product_comment');
        var addProductQty = localStorage.getItem('zenlink_product_qty');
        if (addProductComment && addProductComment.length) {
            $("#tbAddProductComments").val(addProductComment);
        }
        if (addProductQty && addProductQty.length) {
            $("#header1_tbxAddProductQty").val(addProductQty);
        }
        localStorage.removeItem('zenlink_product_comment');
        localStorage.removeItem('zenlink_product_qty');
        $('#tbAddProductComments').focus();
    });

    //setLinkColor();
    //window.addEventListener('resize', setLinkColor);
});

function decodeHtml(html) {
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}