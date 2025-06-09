var translatelang = 'en';

//function translate()
//{
//    function onComplete() {
//        Microsoft.Translator.Widget.domTranslator.showTooltips = false;
//        Microsoft.Translator.Widget.domTranslator.showHighlight = false;
//        Microsoft.Translator.Widget.domTranslator.showmessagebox = false;
//        Microsoft.Translator.Widget.showTooltips = false;

//        if ($(".attribute-select").length) {
//            $(".attribute-select").chosen("destroy");
//            $(".attribute-select").chosen({ disable_search: true })
//        }
//    }
//    if ($.cookie("zlang") == "cn") {
//        Microsoft.Translator.Widget.Translate('ja', "zh-CHS", onComplete);
//    }
//}

//window.onload = function (e) {
//    translate();
//}

$(document).ready(function () {
    $("div,span").not(".translate").each(function () {
        if (($(this).find(".translate").length == 0) && ($(this).closest(".translate").length == 0)) {
            $(this).addClass("notranslate");
        };
    });
        
    if ($.cookie("zlang") == "uk") translatelang = 'uk';
    if ($.cookie("zlang") == "ru") translatelang = 'ru';
    if ($.cookie("zlang") == "es") translatelang = 'es';
    if ($.cookie("zlang") == "fr") translatelang = 'fr';
    if ($.cookie("zlang") == "tw") translatelang = 'zh-TW';
    if ($.cookie("zlang") == "cn") translatelang = 'zh-CN';
    if ($.cookie("zlang") == "ja") translatelang = 'ja';
    if ($.cookie("zlang") == "ms") translatelang = 'ms';
    if ($.cookie("zlang") == "vi") translatelang = 'vi';
    if ($.cookie("zlang") == "de") translatelang = 'de';
    if ($.cookie("zlang") == "ar") translatelang = 'ar';
    if ($.cookie("zlang") == "id") translatelang = 'id';
    if ($.cookie("zlang") == "th") translatelang = 'th';
    if ($.cookie("zlang") == "it") translatelang = 'it';
    if ($.cookie("zlang") == "pt") translatelang = 'pt';
    if ($.cookie("zlang") == "tr") translatelang = 'tr';
    if ($.cookie("zlang") == "pl") translatelang = 'pl';
    if ($.cookie("zlang") == "ko") translatelang = 'ko';

    let translatefrom = $('head').attr('data-translate-from');
    if (!translatefrom) {
        translatefrom = "ja";
    }
    
    $.cookie("googtrans", "/" + translatefrom + "/" + translatelang, { path: '/', domain: ".zenmarket.jp" });
    $.cookie("googtrans", "/" + translatefrom + "/" + translatelang);
});