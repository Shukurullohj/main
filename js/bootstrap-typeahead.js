/* =============================================================
 * bootstrap-typeahead.js v2.0.0
 * http://twitter.github.com/bootstrap/javascript.html#typeahead
 * =============================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ============================================================ */

jQuery.uaMatch = function (ua) {
    ua = ua.toLowerCase();

    var match = /(chrome)[ \/]([\w.]+)/.exec(ua) ||
                /(webkit)[ \/]([\w.]+)/.exec(ua) ||
                /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua) ||
                /(msie) ([\w.]+)/.exec(ua) ||
                ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua) ||
                [];

    return {
        browser: match[1] || "",
        version: match[2] || "0"
    };
};

// Don't clobber any existing jQuery.browser in case it's different
if (!jQuery.browser) {
    matched = jQuery.uaMatch(navigator.userAgent);
    browser = {};

    if (matched.browser) {
        browser[matched.browser] = true;
        browser.version = matched.version;
    }

    // Chrome is Webkit, but Webkit is also Safari.
    if (browser.chrome) {
        browser.webkit = true;
    } else if (browser.webkit) {
        browser.safari = true;
    }

    jQuery.browser = browser;
}


!function ($) {

    "use strict"

    var Typeahead = function (element, options) {
        this.$element = $(element)
        this.options = $.extend({}, $.fn.typeahead.defaults, options)
        this.matcher = this.options.matcher || this.matcher
        this.sorter = this.options.sorter || this.sorter
        this.highlighter = this.options.highlighter || this.highlighter
        this.$menu = $(this.options.menu).appendTo('body')
        this.source = this.options.source
        this.onselect = this.options.onselect
        this.autoselect = this.options.autoselect
        this.autowidth = this.options.autowidth
        this.strings = true
        this.shown = false
        this.timeout = this.options.timeout || 10
        this.listen()
    }

    Typeahead.prototype = {

        constructor: Typeahead

  , select: function () {
      var text, original_text;
      var hasactive = !this.$menu.find('.active').length == 0
      if (!hasactive) {
          var val = this.$element.val();
      }
      else {
          var val = JSON.parse(this.$menu.find('.active').attr('data-value'));
      }

      if (!this.strings && hasactive) text = val[this.options.property]
      else text = val

      original_text = this.$element.val();
      this.$element.val(text)

      if (typeof this.onselect == "function")
          this.onselect(val, text, original_text)

      return this.hide()
  }

  , show: function () {
      var pos = $.extend({}, this.$element.offset(), {
          height: this.$element[0].offsetHeight
      })

      this.$menu.css({
          top: pos.top + pos.height
      , left: pos.left
      })

      this.$menu.show()
      this.shown = true
      return this
  }

  , hide: function () {
      this.$menu.hide()
      this.shown = false
      return this
  }

  , lookup: function (event) {
      var that = this
        , items
        , q
        , value

      this.query = this.$element.val()

      if (typeof this.source == "function") {
          value = this.source(this, this.query)
          if (value) this.process(value)
      } else {
          this.process(this.source)
      }
  }

  , process: function (results) {
      var that = this
        , items
        , q
      if (results == null) return;
      if (results.length && typeof results[0] != "string")
          this.strings = false

      this.query = this.$element.val()

      if (!this.query) {
          return this.shown ? this.hide() : this
      }

      items = $.grep(results, function (item) {
          if (!that.strings)
              item = item[that.options.property]
          if (that.matcher(item)) return item
      })

      items = this.sorter(items)

      if (!items.length) {
          return this.shown ? this.hide() : this
      }

      return this.render(items.slice(0, this.options.items)).show()
  }

  , matcher: function (item) {
      return ~item.toLowerCase().indexOf(this.query.toLowerCase())
  }

  , sorter: function (items) {
      var beginswith = []
        , caseSensitive = []
        , caseInsensitive = []
        , item
        , sortby

      while (item = items.shift()) {
          if (this.strings) sortby = item
          else sortby = item[this.options.property]

          if (!sortby.toLowerCase().indexOf(this.query.toLowerCase())) beginswith.push(item)
          else if (~sortby.indexOf(this.query)) caseSensitive.push(item)
          else caseInsensitive.push(item)
      }

      return beginswith.concat(caseSensitive, caseInsensitive)
  }

  , highlighter: function (item) {
      return item.replace(new RegExp('(' + this.query + ')', 'ig'), function ($1, match) {
          return '<strong>' + match + '</strong>'
      })
  }

  , render: function (items) {
      var that = this

      items = $(items).map(function (i, item) {
          i = $(that.options.item).attr('data-value', JSON.stringify(item))
          if (!that.strings)
              item = item[that.options.property]
          i.find('a').html(that.highlighter(item))
          return i[0]
      })

      if (that.autoselect) items.first().addClass('active')
      if (that.autowidth) this.$menu.width(this.$element.width());
      this.$menu.html(items)
      return this
  }

  , next: function (event) {
      var active = this.$menu.find('.active').removeClass('active')
        , next = active.next()

      if (!next.length) {
          next = $(this.$menu.find('li')[0])
      }

      next.addClass('active')
  }

  , prev: function (event) {
      var active = this.$menu.find('.active').removeClass('active')
        , prev = active.prev()

      if (!prev.length) {
          prev = this.$menu.find('li').last()
      }

      prev.addClass('active')
  }

  , listen: function () {
      this.$element
        .on('blur', $.proxy(this.blur, this))
        .on('keypress', $.proxy(this.keypress, this))
        .on('keyup', $.proxy(this.keyup, this))

      if ($.browser.webkit || $.browser.msie) {
          this.$element.on('keydown', $.proxy(this.keypress, this))
      }

      this.$menu
        .on('click', $.proxy(this.click, this))
        .on('mouseenter', 'li', $.proxy(this.mouseenter, this))
  }

  , keyup: function (e) {
      e.stopPropagation()
      e.preventDefault()

      switch (e.keyCode) {
          case 40: // down arrow
          case 38: // up arrow
              break

          //case 13: // enter
              

          case 9: // tab
              var that = this
              e.stopPropagation()
              e.preventDefault()
              setTimeout(function () { that.hide() }, 150)
              break

          case 27: // escape
              this.hide()
              break

          default:
              if (this.timer) clearTimeout(this.timer);
              var self = this;
              this.timer = setTimeout(function () { self.lookup(); }, this.timeout);
      }

  }

  , keypress: function (e) {
      e.stopPropagation()
      if (!this.shown) return

      switch (e.keyCode) {
          case 9: // tab
          case 13: // enter
              if (!this.shown) return
              this.select()
              break
          case 27: // escape
              e.preventDefault()
              break

          case 38: // up arrow
              e.preventDefault()
              this.prev()
              break

          case 40: // down arrow
              e.preventDefault()
              this.next()
              break
      }
  }

  , blur: function (e) {
      var that = this
      e.stopPropagation()
      e.preventDefault()
      setTimeout(function () { that.hide() }, 150)
  }

  , click: function (e) {
      e.stopPropagation()
      e.preventDefault()
      this.select()
  }

  , mouseenter: function (e) {
      this.$menu.find('.active').removeClass('active')
      $(e.currentTarget).addClass('active')
  }

    }


    /* TYPEAHEAD PLUGIN DEFINITION
    * =========================== */

    $.fn.typeahead = function (option) {
        return this.each(function () {
            var $this = $(this)
        , data = $this.data('typeahead')
        , options = typeof option == 'object' && option
            if (!data) $this.data('typeahead', (data = new Typeahead(this, options)))
            if (typeof option == 'string') data[option]()
        })
    }

    $.fn.typeahead.defaults = {
        source: []
  , items: 10
  , menu: '<ul class="typeahead dropdown-menu"></ul>'
  , item: '<li><a href="#"></a></li>'
  , onselect: null
  , autoselect: false
  , autowidth: true
  , timeout: 100
  , property: 'value'
    }

    $.fn.typeahead.Constructor = Typeahead


    /* TYPEAHEAD DATA-API
    * ================== */

    $(function () {
        $('body').on('focus.typeahead.data-api', '[data-provide="typeahead"]', function (e) {
            var $this = $(this)
            if ($this.data('typeahead')) return
            e.preventDefault()
            $this.typeahead($this.data())
        })
    })

} (window.jQuery);
