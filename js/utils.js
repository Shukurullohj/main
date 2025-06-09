String.format = function () { for (var i, t = arguments[0], n = 0; n < arguments.length - 1; n++)i = new RegExp("\\{" + n + "\\}", "gm"), t = t.replace(i, arguments[n + 1]); return t }; Number.prototype.formatMoney = function (n, t, i, r) { var f = this, t = isNaN(t = Math.abs(t)) ? 2 : t, i = i == undefined ? "." : i, r = r == undefined ? "," : r, o = f < 0 ? "-" : "", e = parseInt(f = Math.abs(+f || 0).toFixed(t)) + "", u = (u = e.length) > 3 ? u % 3 : 0; return n + o + (u ? e.substr(0, u) + r : "") + e.substr(u).replace(/(\d{3})(?=\d)/g, "$1" + r) };

function debounce(func, wait, immediate) {
    let timeout;

    return function executedFunction() {
        const context = this;
        const args = arguments;

        const later = function () {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };

        const callNow = immediate && !timeout;

        clearTimeout(timeout);

        timeout = setTimeout(later, wait);

        if (callNow) func.apply(context, args);
    };
}