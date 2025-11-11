(function () {
    function parseUri(href) {
        var l = document.createElement("a");
        l.href = href;
        return l;
    }

    function hideElementByClassName(className) {
        var elements = document.getElementsByClassName(className);
        for (var i = 0; i < elements.length; i++) {
            elements[i].style.display = "none";
        }
    }

    var shouldShowFacebookPage = Math.random() > 0.7; // 30% 
    console.log('Show YMusic page: ' + shouldShowFacebookPage);

    function checkAndHideElement() {
        var i;
        if (location.hostname.indexOf("shazam.com") != -1) {
            if (location.pathname == "/" || location.pathname.length == 3) {
                hideElementByClassName("getshazam");
                hideElementByClassName("shazamoffers");
                hideElementByClassName("get-verified");
                hideElementByClassName("get-verified-btn");
            } else {
                if (shouldShowFacebookPage) {
                    var elements = document.getElementsByClassName("shz-frame-money");
                    for (i = 0; i < elements.length; i++) {
                        var fbLikeContainer = elements[i];
                        if (fbLikeContainer.className.indexOf('added-fb-like') < 0) {
                            fbLikeContainer.className += ' added-fb-like';
                            fbLikeContainer.style.textAlign = 'center';
                            fbLikeContainer.innerHTML = '<iframe src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fymusic.android%2F&tabs&width=340&height=214&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId=1526211714125837" width="340" height="214" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowTransparency="true"></iframe>';
                        }
                    }
                } else {
                    hideElementByClassName('shz-frame-money');
                }
            }
            // hide player footer
            var footers = document.getElementsByTagName('footer');
            for (i = 0; i < footers.length; i++) {
                var footer = footers[i];
                if (footer.className.indexOf('footerstatic') >= 0) {
                    footer.style.display = 'none';
                }
            }
        }
        setTimeout(checkAndHideElement, 1000);
    }

    checkAndHideElement();

    console.log("script ===============");
    var trackIdSet = [];
    var trackInPage = [];
    var trackInPageInvalidate = true;

    function parseArtistCarousel(data) {
        for (var index = 0; index < data.length; index++) {
            var trackData = data[index].track;
            if (trackData) parseTrack(trackData);
        }
    }

    function parseChart(data) {
        for (var index = 0; index < data.chart.length; index++) {
            var trackData = data.chart[index];
            parseTrack(trackData);
        }
    }

    function parseShazamAccountData(data) {
        var tags = data.tags;
        if (tags) {
            for (var i = 0; i < tags.length; i++) {
                var tag = tags[i];
                var trackData = tag.track;
                if (trackData) parseTrack(trackData);
            }
        }
    }

    function parseTrack(data) {
        if (data.type != "MUSIC") return;
        var track = {
            id: data.key,
            title: data.heading.title,
            subtitle: data.heading.subtitle,
            thumbnail: data.images.default
        };
        if (!track.thumbnail) {
            track.thumbnail = 'https://images.shazam.com/coverart/t' + track.id + '_s400.jpg';
        }
        if (trackIdSet.indexOf(track.id) < 0) {
            trackIdSet.push(track.id);
            trackInPage.push(track);
            window.sessionStorage.setItem('track:' + track.id, JSON.stringify(track));
            if (!trackInPageInvalidate) {
                trackInPageInvalidate = true;
                console.log("Mark track in page invalidate");
            }
        }
    }

    (function (send) {
        XMLHttpRequest.prototype.send = function (data) {
            var originCallback = this.onreadystatechange;
            this.onreadystatechange = function () {
                if (originCallback) {
                    originCallback();
                }
                if (this.readyState == 4 && this.status == 200) {
                    var regexAristTopTract = /\/artisttoptracks_\d+$/g;
                    var regexTrackData = /\/track\/\d+$/g;
                    var regexChart = /\/tracks\/\w+chart\w+$/g;
                    var regexRecommendation = /\/tracks\/recommendations_\d+$/g;
                    var regexArtistCarousel = /\/artistfollow\.json$/g;
                    var regexShazamAccount = /\/tag\/([A-Z0-9a-z]+-?)+$/g;

                    var uri = parseUri(this.responseURL);
                    if (regexAristTopTract.test(uri.pathname) ||
                        regexChart.test(uri.pathname) ||
                        regexRecommendation.test(uri.pathname)) {
                        parseChart(JSON.parse(this.responseText));
                    } else if (regexTrackData.test(uri.pathname)) {
                        parseTrack(JSON.parse(this.responseText));
                        console.log(this.responseText);
                    } else if (regexArtistCarousel.test(uri.pathname)) {
                        parseArtistCarousel(JSON.parse(this.responseText));
                    } else if (regexShazamAccount.test(uri.pathname)) {
                        parseShazamAccountData(JSON.parse(this.responseText));
                    }
                }
            };
            send.call(this, data);
        };
    })(XMLHttpRequest.prototype.send);

    function onPlayShazam(trackId) {
        var index = 0;
        if (trackId) {
            for (; index < trackInPage.length; index++) {
                if (trackInPage[index].id == trackId) break;
            }
            if (index >= trackInPage.length) {
                index = -1;
            }
        }
        if (index < 0) {
            var trackInStorage = window.sessionStorage.getItem('track:' + trackId);
            if (trackInStorage) {
                trackInPage.unshift(JSON.parse(trackInStorage));
                trackIdSet.push(trackId);
                index = 0;
            }
        }
        console.log('track: ' + trackId + ' index = ' + index);
        if (index < 0 || trackInPage.length === 0) {
            return;
        }
        var eventPayload = {};
        eventPayload.position = index;
        eventPayload.tracks = trackInPage;
        console.log("doPlayShazam:" + JSON.stringify(eventPayload));
    }

    function onPlayYoutubeVideo(videoId) {
        console.log("doPlayYouTube:" + videoId);
    }

    function replaceClass(e, className, newClass) {
        var reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
        e.className = e.className.replace(reg, ' ' + newClass + ' ');
    }

    function hasClass(e, className) {
        var reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
        return reg.test(e.className);
    }

    function makeShazamEventClick(trackId, stopPropagation) {
        return function (e) {
            onPlayShazam(trackId);
            if (stopPropagation) {
                e.stopPropagation();
            }
        };
    }

    function makeYouTubeEventClick(videoId, stopPropagation) {
        return function (e) {
            onPlayYoutubeVideo(videoId);
            if (stopPropagation) {
                e.stopPropagation();
            }
        };
    }

    function findYouTubeVideoId(data) {
        var regex = /\/ux\/youtube\/([a-zA-Z0-9-_]{11})/g;
        var m = regex.exec(data);
        if (m) return m[1];

        regex = /(\?|&)v=([a-zA-Z0-9-_]{11})(&|$)/g;
        m = regex.exec(data);
        if (m) return m[2];

        regex = /youtu\.be\/([a-zA-Z0-9-_]{11})/g;
        m = regex.exec(data);
        if (m) return m[1];
    }

    function findElementByAttr(tag, attribute, attributeValue) {
        var elements = document.getElementsByTagName(tag);
        var result = [];
        for (var i = 0; i < elements.length; i++) {
            var element = elements[i];
            if (element.getAttribute(attribute) == attributeValue) {
                result.push(element);
            }
        }
        return result;
    }

    function overrideAudioPlay() {
        var audioPlayElements = document.getElementsByClassName("audio-play");
        for (var i = 0; i < audioPlayElements.length; i++) {
            var audioPlayElement = audioPlayElements[i];
            var trackId = audioPlayElement.getAttribute('data-track-id');
            if (!trackId) {
                // try find in parent node
                trackId = audioPlayElement.parentNode.getAttribute('data-track-id');
                if (!trackId) continue;
            }
            replaceClass(audioPlayElement, "audio-play", "audio-play-overrided");
            if (audioPlayElement.tagName.toUpperCase() == "A") {
                audioPlayElement.href = '#play_shazam_' + trackId;
            } else {
                audioPlayElement.addEventListener('click', makeShazamEventClick(trackId, true), true);
            }
        }

        var playElements = findElementByAttr("a", "data-shz-cmd", "play");
        for (i = 0; i < playElements.length; i++) {
            var playElement = playElements[i];
            playElement.attributes.removeNamedItem("data-shz-cmd");
            if (playElement.tagName.toUpperCase() == "A") {
                playElement.href = "#play_shazam_0";
            } else if (!hasClass(playElement, "set-onclick")) {
                playElement.className += " set-onclick";
                playElement.addEventListener('click', makeShazamEventClick(null, true), true);
            }
        }

        var popupElements = document.getElementsByClassName("popup-btn");
        for (i = 0; i < popupElements.length; i++) {
            var popupElement = popupElements[i];
            if (!popupElement.hasAttribute("data-href")) {
                continue;
            }
            var dataHref = popupElement.getAttribute("data-href");
            var videoId = findYouTubeVideoId(dataHref);
            if (!videoId) continue;

            replaceClass(popupElement, "popup-btn", '');
            replaceClass(popupElement, "popup-takeover", '');
            popupElement.attributes.removeNamedItem("data-href");

            if (popupElement.tagName.toUpperCase() == "A") {
                popupElement.href = "#play_youtube_" + videoId;
            } else {
                popupElement.addEventListener("click", makeYouTubeEventClick(videoId, true), true);
            }
        }

        trackInPageInvalidate = trackInPageInvalidate && audioPlayElements.length === 0;
        setTimeout(overrideAudioPlay, trackInPageInvalidate ? 50 : 500);
    }

    overrideAudioPlay();

    (function (history) {
        var pushState = history.pushState;
        history.pushState = function (state, title, url) {
            var uri = parseUri(url);
            if (uri.hash.indexOf('#play_shazam_') == 0) {
                var trackId = uri.hash.substring(13);
                if (trackId == "0") {
                    trackId = null;
                }
                console.log("#play_shazam - track ID: " + trackId);
                onPlayShazam(trackId);
                return;
            } else if (uri.hash.indexOf('#play_youtube_') == 0) {
                var videoId = uri.hash.substring(14);
                console.log("#play_youtube - video ID: " + videoId);
                onPlayYoutubeVideo(videoId);
                return;
            }
            console.log(url);
            window.location.href = url;
            pushState(state, title, url);
        };
    })(window.history);
})();