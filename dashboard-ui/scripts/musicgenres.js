﻿(function ($, document) {

    // The base query options
    var query = {

        SortBy: "SortName",
        SortOrder: "Ascending",
        IncludeItemTypes: "Audio,MusicVideo",
        Recursive: true,
        Fields: "DateCreated,SyncInfo,ItemCounts",
        StartIndex: 0
    };

    function getSavedQueryKey() {

        return 'musicgenres' + (query.ParentId || '');
    }

    function reloadItems(page) {

        Dashboard.showLoadingMsg();

        ApiClient.getMusicGenres(Dashboard.getCurrentUserId(), query).done(function (result) {

            // Scroll back up so they can see the results from the beginning
            $(document).scrollTop(0);

            var html = '';
            var view = 'Thumb';

            if (AppInfo.hasLowImageBandwidth) {
                if (view == 'Thumb') {
                    view = 'ThumbCard';
                }
            }

            $('.listTopPaging', page).html(LibraryBrowser.getQueryPagingHtml({
                startIndex: query.StartIndex,
                limit: query.Limit,
                totalRecordCount: result.TotalRecordCount,
                viewButton: true,
                showLimit: false,
                addSelectionButton: true
            })).trigger('create');

            updateFilterControls(page);
            
            if (view == "Thumb") {
                html = LibraryBrowser.getPosterViewHtml({
                    items: result.Items,
                    shape: "backdrop",
                    preferThumb: true,
                    context: 'music',
                    showItemCounts: true,
                    centerText: true,
                    lazy: true
                });
            }
            else if (view == "ThumbCard") {

                html = LibraryBrowser.getPosterViewHtml({
                    items: result.Items,
                    shape: "backdrop",
                    preferThumb: true,
                    context: 'music',
                    showItemCounts: true,
                    cardLayout: true,
                    lazy: true,
                    showTitle: true
                });
            }

            $('#items', page).html(html).lazyChildren();

            $('.btnNextPage', page).on('click', function () {
                query.StartIndex += query.Limit;
                reloadItems(page);
            });

            $('.btnPreviousPage', page).on('click', function () {
                query.StartIndex -= query.Limit;
                reloadItems(page);
            });

            LibraryBrowser.saveQueryValues(getSavedQueryKey(), query);
            
            Dashboard.hideLoadingMsg();
        });
    }

    function updateFilterControls(page) {

        $('#selectPageSize', page).val(query.Limit).selectmenu('refresh');
    }

    $(document).on('pageinitdepends', "#musicGenresPage", function () {

        var page = this;

        $('.chkStandardFilter', this).on('change', function () {

            var filterName = this.getAttribute('data-filter');
            var filters = query.Filters || "";

            filters = (',' + filters).replace(',' + filterName, '').substring(1);

            if (this.checked) {
                filters = filters ? (filters + ',' + filterName) : filterName;
            }

            query.StartIndex = 0;
            query.Filters = filters;

            reloadItems(page);
        });

        $('#selectPageSize', page).on('change', function () {
            query.Limit = parseInt(this.value);
            query.StartIndex = 0;
            reloadItems(page);
        });

    }).on('pageshown', "#musicGenresPage", function () {

        query.ParentId = LibraryMenu.getTopParentId();

        var limit = LibraryBrowser.getDefaultPageSize();

        // If the default page size has changed, the start index will have to be reset
        if (limit != query.Limit) {
            query.Limit = limit;
            query.StartIndex = 0;
        }

        LibraryBrowser.loadSavedQueryValues(getSavedQueryKey(), query);

        reloadItems(this);

        updateFilterControls(this);
    });

})(jQuery, document);