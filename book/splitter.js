require(['gitbook', 'jQuery'], function (gitbook, $) {
  
	// MEMO:
	// Gitbook is calculated as "calc (100% - 60px)" in the horizontal width when the width of the screen size is 600px
	// or less.
	// In this case, since contradiction occurs in the implementation of this module, return.
	if($(window).width() <= 600) {
		return;
	}

	gitbook.events.bind('start', function () {
	});

	gitbook.events.bind('page.change', function () {

		var KEY_SPLIT_STATE = 'plugin_gitbook_split';

		var dividerWidth = null;
		var isDraggable = false;
		var dividerCenterOffsetLeft = null;
		var splitState = null;
		var grabPointWidth = null;

		var $body = $('body');
		var $book = $('.book');
		var $summary = $('.book-summary');
		var $bookBody = $('.book-body');
		var $divider = $('<div class="divider-content-summary">' +
			               '<div class="divider-content-summary__icon">' +
			                 '<i class="fa fa-ellipsis-v"></i>' +
			               '</div>' +
			             '</div>');

		$summary.append($divider);

		dividerWidth = $divider.outerWidth();
		dividerCenterOffsetLeft = $divider.outerWidth() / 2;

		// restore split state from sessionStorage
		splitState = getSplitState();
		setSplitState(
			splitState.summaryWidth,
			splitState.summaryOffset,
			splitState.bookBodyOffset
		);

		setTimeout(function() {
			var isGreaterThanEqualGitbookV2_5 = !Boolean($('.toggle-summary').length);

			var $toggleSummary = isGreaterThanEqualGitbookV2_5
				? $('.fa.fa-align-justify').parent() : $('.toggle-summary');

			$toggleSummary.on('click', function () {

				var summaryOffset  = null;
				var bookBodyOffset = null;

				var isOpen = isGreaterThanEqualGitbookV2_5
					? !gitbook.sidebar.isOpen() : $book.hasClass('with-summary');

				if (isOpen) {
					summaryOffset  = -($summary.outerWidth());
					bookBodyOffset = 0;
				} else {
					summaryOffset  = 0;
					bookBodyOffset = $summary.outerWidth();
				}

				setSplitState($summary.outerWidth(), summaryOffset, bookBodyOffset);
				saveSplitState($summary.outerWidth(), summaryOffset, bookBodyOffset);
			});
		}, 1);

		$divider.on('mousedown', function (event) {
			event.stopPropagation();
			isDraggable = true;
			grabPointWidth = $summary.outerWidth() - event.pageX;
		});

		$body.on('mouseup', function (event) {
			event.stopPropagation();
			isDraggable = false;
			saveSplitState(
				$summary.outerWidth(),
				$summary.position().left,
				$bookBody.position().left
			);
		});

		$body.on('mousemove', function (event) {
			if (!isDraggable) {
				return;
			}
			event.stopPropagation();
			event.preventDefault();
			$summary.outerWidth(event.pageX + grabPointWidth);
			$bookBody.offset({ left: event.pageX + grabPointWidth });
		});

		function setCookie(cookieName,cookieValue,cookieDates){
			var d = new Date();
			d.setDate(d.getDate()+cookieDates);
			document.cookie = cookieName+"="+cookieValue+";expires="+d.toGMTString();
		}

		function getCookie(cookieName){
			var cookieStr = unescape(document.cookie);
			var arr = cookieStr.split("; ");
			var cookieValue = "";
			for(var i=0;i<arr.length;i++){
				var temp = arr[i].split("=");
				if(temp[0]==cookieName){
					cookieValue = temp[1];
					break;
				}
			}
			return cookieValue;
		}
		function getSplitState() {
			// var splitState = JSON.parse(sessionStorage.getItem(KEY_SPLIT_STATE));
			var splitState = JSON.parse(getCookie(KEY_SPLIT_STATE));
			splitState || (splitState = {});
			splitState.summaryWidth || (splitState.summaryWidth = $summary.outerWidth());
			splitState.summaryOffset || (splitState.summaryOffset = $summary.position().left);
			splitState.bookBodyOffset || (splitState.bookBodyOffset = $bookBody.position().left);
			return splitState;
		}

		function saveSplitState(summaryWidth, summaryWidthOffset, bookBodyOffset) {
			setCookie(KEY_SPLIT_STATE,JSON.stringify({
				summaryWidth: summaryWidth,
				summaryOffset: summaryWidthOffset,
				bookBodyOffset: bookBodyOffset,
			}),1)
			// sessionStorage.setItem(KEY_SPLIT_STATE, JSON.stringify({
			// 	summaryWidth: summaryWidth,
			// 	summaryOffset: summaryWidthOffset,
			// 	bookBodyOffset: bookBodyOffset,
			// }));
		}

		function setSplitState(summaryWidth, summaryOffset, bookBodyOffset) {
			$summary.outerWidth(summaryWidth);
			$summary.offset({ left: summaryOffset });
			$bookBody.offset({ left: bookBodyOffset });
			// improved broken layout in windows chrome.
			//   "$(x).offset" automatically add to "position:relative".
			//   but it cause layout broken..
			$summary.css({ position: 'absolute' });
			$bookBody.css({ position: 'absolute' });
		}
	});
});
