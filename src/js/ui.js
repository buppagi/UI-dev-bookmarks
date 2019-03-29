var isMobile = {
	Android: function() {
		return navigator.userAgent.match(/Android/i);
	},
	BlackBerry: function() {
		return navigator.userAgent.match(/BlackBerry/i);
	},
	iOS: function() {
		return navigator.userAgent.match(/iPhone|iPad|iPod/i);
	},
	Opera: function() {
		return navigator.userAgent.match(/Opera Mini/i);
	},
	Windows: function() {
		return navigator.userAgent.match(/IEMobile/i);
	},
	any: function() {
		return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
	}
};

(function($,window,document,undefined){
	"use strict";
	var $window = $(window),
		$document = $(document),
		$body = $('body'),
		$wrap = $('#wrap'),
		$header = $('#header'),
		$navi = $('#navi'),
		$hamburger = $('.menu-open-button'),
		$container = $('#container'),
		$bookList = $('.bookmark_lists'),
		$html_css = '.html, .html5, .css, .css3, .standard, .accessibility, .sass, .less, .fonts',
		$js_jquery = '.javascript, .jquery',
		$ui = '.ui, .web, .layouts, .resource, .showcase, .mobile',
		$tools = '.tools, .converter, .calculator, .compressor, .beautifier, .validators, .compiler, .framework, .plugins',
		$useful = '.useful, .newsletters, .study, .blogs, .photos',
		$wp = '.wordpress',
		spreadsheetID = '1W5Ozb1bIaB64mCIHJjW6Tw0G3QQTreSQNRw_mXOtFQc',
		url = "https://spreadsheets.google.com/feeds/list/" + spreadsheetID + "/od6/public/values?alt=json",
		Ui = Ui || {};

	var jRes = jRespond([
		{
			label: 'smallest',
			enter: 0,
			exit: 479
		},{
			label: 'handheld',
			enter: 480,
			exit: 767
		},{
				label: 'tablet',
				enter: 768,
				exit: 979
		},{
			label: 'laptop',
			enter: 980,
			exit: 1199
		},{
			label: 'desktop',
			enter: 1200,
			exit: 10000
		}
	]);
	jRes.addFunc([
		{
			breakpoint: 'desktop',
			enter: function() { $body.addClass('device-lg'); },
			exit: function() { $body.removeClass('device-lg'); }
		},{
			breakpoint: 'laptop',
			enter: function() { $body.addClass('device-md'); },
			exit: function() { $body.removeClass('device-md'); }
		},{
			breakpoint: 'tablet',
			enter: function() { $body.addClass('device-sm'); },
			exit: function() { $body.removeClass('device-sm'); }
		},{
			breakpoint: 'handheld',
			enter: function() { $body.addClass('device-xs'); },
			exit: function() { $body.removeClass('device-xs'); }
		},{
			breakpoint: 'smallest',
			enter: function() { $body.addClass('device-xxs'); },
			exit: function() { $body.removeClass('device-xxs'); }
		}
	]);

	Ui = {
		Gnb:function(navi){
			var $navi = '';

			$navi += '<ul class="navigation" role="navigation">';
			$navi += '<li><button class="menu-item button"><span class="txt">전체</span></button></li>';
			for(var i=0; i < navi.length; i++) {
				$navi += '<li>';
				switch (navi[i]) {
					case 'HTML/CSS':
						$navi += '<button class="menu-item button" data-filter="'+ $html_css +'">';
						break;
					case 'JS/jQuery':
						$navi += '<button class="menu-item button" data-filter="'+ $js_jquery +'">';
						break;
					case 'UI':
						$navi += '<button class="menu-item button" data-filter="'+ $ui +'">';
						break;
					case '유익한정보':
						$navi += '<button class="menu-item button" data-filter="'+ $useful +'">';
						break;
					case 'Tools':
						$navi += '<button class="menu-item button" data-filter="'+ $tools +'">';
						break;
					case '워드프레스':
						$navi += '<button class="menu-item button" data-filter="'+ $wp +'">';
						break;
				}
				$navi += '<span class="txt">' + navi[i] + '</span>';
				$navi += '</button>';
				$navi += '</li>';
			}
			$navi += '</ul>';
			$navi += '<button class="btn-search" id="btnSearch"><i class="fa fa-search" aria-hidden="true"></i></button>';
			$header.find('.menu').append($navi);
			$header.find('.navigation > li:last').remove();
		},
		searchForm: function(){
			var elem = $('#btnSearch');
			elem.on('click', function(){
				var _this = $(this);
				if( !_this.hasClass('active') ) {
					_this.addClass('active');
					$('.search-wrap').stop().animate({
						height: 'toggle'
					}, 300).find('.quicksearch').focus();
				} else {
					_this.removeClass('active');
					$('.search-wrap').stop().animate({
						height: 'toggle'
					}, 300);
				}
			});
		},
		dataLoadView:function(url){
			var entry;
			$.getJSON(url, function(data){
				entry = data.feed.entry;
				$('.contents-header').find('.count').text(entry.length);

				$bookList.empty();

				var $category = [];
				$(entry).each(function(index){
					var _tagTmp = '', _filterTmp = '', $item = '',
						_tags = this.gsx$태그.$t,
						_tagSplit = _tags.split(','),
						_filter = this.gsx$filter.$t,
						_filterSplit = _filter.split(',');

					for( var i=0; i < _filterSplit.length; i++ ) {
						_filterTmp += ' ' + _filterSplit[i];
					}

					$item += '<div class="grid-item '+ _filterTmp +'">';
					$item += '<div class="gutter-sizer"></div>';
					$item += '<article class="entry-hotlink filters-button-group">';
					$item += '<span class="folded-corner"></span>';
					$item += '<span class="cat-hotlink category">';
					$item += '<a class="button" href="#">' + this.gsx$카테고리.$t + '</a>';
					$item += '</span>';
					$item += '<h2 class="title_hotlink"><a class="" href="' + this.gsx$링크.$t + '" rel="bookmark" target="_blank">' + this.gsx$사이트명.$t + ' <i class="fa fa-external-link"></i></a></h2>';
					$item += '<div class="bookmark_desc">' + this.gsx$설명.$t  + '</div>';
					$item += '</article>';
					$item += '</div>';

					$bookList.append( $item );
					$category.push(this.gsx$카테고리.$t);
				});

				var uniq = $category.reduce(function(a,b){if(a.indexOf(b)<0)a.push(b);return a;},[]); //중복제거

				Ui.Gnb(uniq);
				Ui.searchForm();
			}).done(function(){
				var qsRegex;
				var $grid = $('.grid').isotope({
					itemSelector: '.grid-item',
					layoutMode: 'fitRows',
					percentPosition: true,
					fitRows: {
						gutter: '.gutter-sizer'
					},
					sortBy: 'random',
					filter: function(){
						return qsRegex ? $(this).text().match(qsRegex) : true;
					}
				});
				// Grid 그려준 후 첫번 째 실행
				Ui.minimap();

				// 함수로 안부르면 호출이 안됨.
				function onArrange() {
				  Ui.minimap();
				}

				// button 클릭 후 grid 그려진 후 미니맵 다시 실행
				$grid.on('arrangeComplete', onArrange);

				var filterFns = {
					ium: function() {
						var name = $(this).find('.name').text();
						return name.match( /ium$/ );
					}
				};
				// isotope Button
				$('.filters-button-group').on( 'click', '.button', function() {
					var filterValue = $( this ).attr('data-filter');
					filterValue = filterFns[ filterValue ] || filterValue;
					if( !$body.hasClass('device-md') || !$body.hasClass('device-lg') ) {
						$('html, body').stop().animate({
							scrollTop: 0
						}, 800);
					};
					$grid.isotope({ filter: filterValue });
				});
				$('.button-group').each( function( i, buttonGroup ) {
					var $buttonGroup = $( buttonGroup );
					$buttonGroup.on( 'click', '.button', function() {
						$buttonGroup.find('.is-checked').removeClass('is-checked');
						$( this ).addClass('is-checked');
					});
				});
				// 검색 필드 값 필터링 하기
				var $quicksearch = $('.quicksearch').keyup( debounce( function() {
					qsRegex = new RegExp( $quicksearch.val(), 'gi' );
					$grid.isotope();
				}, 200 ) );
				// 필터링은 초마다 일어나지 않도록 디버깅
				function debounce( fn, threshold ) {
				  var timeout;
				  return function debounced() {
				    if ( timeout ) {
				      clearTimeout( timeout );
				    }
				    function delayed() {
				      fn();
				      timeout = null;
				    }
				    timeout = setTimeout( delayed, threshold || 100 );
				  }
				};
			});
		},
		minimap: function(){
			if($body.find('.minimap').length){ return }
			var bookH = $container.height();
			if($body.hasClass('device-md') || $body.hasClass('device-lg')) { // PC에서만 노출!
				if(bookH > 2000 ) {
					var previewBody = $container.minimap({
						heightRatio : 0.3,
						widthRatio : 0.10,
						offsetHeightRatio : 0.180,
						offsetWidthRatio : 0.035,
						position : "right",
						touch: true,
						smoothScroll: true,
						smoothScrollDelay: 200
					});
				} else {
					Ui.elemRemove('.minimap, .miniregion');
				}
			}
		},
		elemRemove: function(deleteClass){
			if($body.find(deleteClass).length) {
				$body.find(deleteClass).remove();
			}
		},
		hamburger: function(){
			var menu = $hamburger.closest('.menu'),
				open = $('#menuOpen');

			open.length;
			$hamburger.on('click', function(){
				var _this = $(this);

				if( !menu.hasClass("checked") ) {
					menu.addClass('checked');
					open.attr('checked', 'checked');
					_this.attr('aria-checked', 'true');
				} else {
					menu.removeClass('checked');
					open.removeAttr('checked');
					_this.attr('aria-checked', 'false');
				}
				menu.find('>ul').stop().animate({
					height: 'toggle'
				}, 250);
			});
		},
		year:function(){ //Copyright 최근년도 넣기
			var today = new Date(),
				year = today.getFullYear(),
				el = document.getElementById('footerYear');

			el.innerHTML = year;
		},
		reSize: function(){
			var windowWidth = $window.width();
  		var windowHeight = $window.height();

			$window.bind('resize', function(e){ //Resize,  End event check
				window.resizeEvt;
				$window.on('resize', function(){
					clearTimeout(window.resizeEvt);
					window.resizeEvt = setTimeout(function(){
						if( $body.hasClass('device-md') || $body.hasClass('device-lg') ) {
							Ui.minimap();
						} else {
							Ui.elemRemove('.minimap, .miniregion');
						}
						// 리사이징시에 새로고침
						if(windowWidth != $(window).width() || windowHeight != $(window).height()) {
							location.reload();
							return;
						}
					}, 250);
				});
			});
		},
		onScroll: function(){
			var hHeight = $header.outerHeight(),
				$contsHeader = $('.contents-header');

			$window.on('scroll', function(){
				var st = $window.scrollTop();
				// PC ver.
				if( ($body.hasClass('device-md') || $body.hasClass('device-lg')) && st > 0 ) {
					$header.addClass('fixed');
					$contsHeader.css('padding-top', hHeight + 30);
				} else {
					$header.removeClass('fixed');
					$contsHeader.removeAttr('style');
				}
				// Mobile ver.
				if( (!$body.hasClass('device-md') || !$body.hasClass('device-lg')) && st > 0 ) {
					if( $navi.hasClass('checked') ) {
						$hamburger.trigger('click');
					}
					$navi.addClass('fixed');
				} else {
					if( $navi.hasClass('checked') ) {
						$hamburger.trigger('click');
					}
					$navi.removeClass('fixed');
				}
			});
		},
		init:function(){
			$bookList.text('Loading bookmark...');
			// index화면에서만 호출!
			// var $href = document.location.href.split('/');
			// if($href[$href.length-1] === ""){}
			Ui.dataLoadView(url);
			Ui.hamburger();
			Ui.onScroll();
			Ui.reSize();
			Ui.year();
		}
	};

	$document.ready(function(){
		Ui.init();
		// 검색 https://codepen.io/desandro/pen/wfaGu
		// Select https://codepen.io/desandro/pen/jubmr
	});

})(jQuery,window,document);
