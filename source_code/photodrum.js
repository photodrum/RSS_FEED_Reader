$(function() {
    var ALL_ITEMS = [];
    var CATEGORIES = [
      {'id': 'bez-rubriki', 'label': 'Все уроки'},
      {'id': 'photoshop', 'label': 'Уроки по Photoshop'},
      {'id': 'illustrator', 'label': 'Уроки по Illustrator'},
      {'id': 'cinema', 'label': 'Уроки по Cinema 4D'}
    ];

    var DEFAULT_CATEGORY = 'bez-rubriki';
    var CURRENT_CATEGORY = decodeURIComponent(window.location.search.split('category=')[1] || DEFAULT_CATEGORY);

    var itemTpl = $('#rss-item-tpl').html();
    Mustache.parse(itemTpl);

    var selectCategoriesTpl = $('#select-categories-tpl').html();
    Mustache.parse(selectCategoriesTpl);

    var linkCategoriesTpl = $('#link-categories-tpl').html();
    Mustache.parse(linkCategoriesTpl);

    var $window = $(window);
    var $container = $('#csstricks');

    var PAGE_SIZE = 10;
    var offset = 0;

    function onScroll() {
      var scrollTop = $window.scrollTop();
      var windowHeight = $window.height();
      var scrollHeight = document.body.scrollHeight;

      if( scrollTop > scrollHeight - (windowHeight * 2) ) {
        renderItems($container, ALL_ITEMS.slice(offset, offset + PAGE_SIZE));
        offset += PAGE_SIZE;
      }
    }

    function formatDate(date) {
        var months = ['Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня', 'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря'];
        return date.getDate() + ' ' + months[date.getMonth()] + ', ' + date.getFullYear();
    }

    function parseEntryData(entry) {
        var regexSrc = /<img.*?src="(.*?)"/;
        var imageSrcMatches = regexSrc.exec(entry.content);
        var imageSrc = imageSrcMatches ? imageSrcMatches[1] : 'https://placehold.it/173x157?text=no+image';

        return {
            'title': entry.title,
            'author': entry.author,
            'link': entry.link,
            'categories': entry.categories,
            'publishedDate': entry.publishedDate,
            'contentSnippet': entry.contentSnippet,
            'formattedDate': formatDate(new Date(entry.publishedDate)),
            'image': imageSrc
        };
    }

    function parseFeed(url) {
        $.ajax({
            url: 'https://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=-1&callback=?&q=' + encodeURIComponent(url),
            dataType: 'json',
            success: function(data) {
                $.each(data.responseData.feed.entries, function(key, entry) {
                    ALL_ITEMS.push(parseEntryData(entry));
                });

                offset = 0;

                renderItems($container, ALL_ITEMS.slice(offset, PAGE_SIZE));

                offset += PAGE_SIZE;

                $window.off('scroll', onScroll);
                $window.on('scroll', onScroll);

                onScroll();
            },
            error: function(errorThrown) {
                console.log(errorThrown);
            }
        });
    }

    function renderItems($container, items) {
        var rendered = Mustache.render(itemTpl, {
            'items': items
        });
        $container.append(rendered);
    }

    function reloadData() {
      ALL_ITEMS = [];
      $container.html('');

/*       window.history.replaceState('page', document.title, '?category=' + encodeURIComponent(CURRENT_CATEGORY)); */
      parseFeed('http://photodrum.com/category/' + CURRENT_CATEGORY + '/feed/', $container);
    }

    function buildLinkCategories($container) {
      var rendered = Mustache.render(linkCategoriesTpl, {
          'categories': CATEGORIES
      });

      $('#categories-wrapper').html(rendered);
      $('#categories-wrapper a').on('click', function (e) {
        e.preventDefault();

        CURRENT_CATEGORY = $(this).attr('data-id');
        reloadData();
      });
    }

    function buildSelectCategories() {
      var rendered = Mustache.render(selectCategoriesTpl, {
          'categories': CATEGORIES
      });

      $('#categories-wrapper').html(rendered);
      $('#categories-wrapper select').on('change', function (e) {
        CURRENT_CATEGORY = $(this).val();
        reloadData();
      });
    }

    // call one of the next function if needed to build custom html for the categories
    // buildSelectCategories();
    // buildLinkCategories();

    $('#categories-menu').on('click', '.mdl-menu__item', function (e) {
      CURRENT_CATEGORY = $(this).attr('data-id');
      reloadData();
    });

    reloadData();
});
