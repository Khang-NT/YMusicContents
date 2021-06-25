!function(document) {
    "use strict";
    if (document) {
        var head = document.head;
        if (!head) {
            var temp = document.getElementsByTagName("head");
            temp && temp.length && (head = temp[0]);
        }
        if (head && !document.ymusicInitialized) {
            document.ymusicInitialized = !0;
            var css = "ytmusic-menu-service-item-renderer, paper-dialog, ytmusic-mealbar-promo-renderer { display: none !important; visibility: invisible; }", style = document.createElement("style");
            head.appendChild(style), style.type = "text/css", style.styleSheet ? style.styleSheet.cssText = css : style.appendChild(document.createTextNode(css)),
                mockLeftContent(), mockAccountService(), removeElement(function() {
                return document.getElementsByTagName("ytmusic-player-page");
            }), removeElement(function() {
                return document.getElementsByClassName("fullscreen-overlay");
            }), removeElement(function() {
                return [ document.getElementById("player-bar-background") ];
            }), removeElement(function() {
                return document.getElementsByTagName("ytmusic-player-bar");
            });
            var playerUiService = null;
            setUpPlayerUiService();
            var isAsync = !0;
            try {
                eval("async () => {}");
            } catch (e) {
                e instanceof SyntaxError && (isAsync = !1);
            }
            var hasFetchApi = isAsync && "Promise" in window && "fetch" in window, originOpen, originAddEventListener;
            originOpen = XMLHttpRequest.prototype.open, XMLHttpRequest.prototype.open = function(e, t, n, r, i) {
                this._url = t, originOpen.call(this, e, t, n, r, i);
            }, originAddEventListener = XMLHttpRequest.prototype.addEventListener, XMLHttpRequest.prototype.addEventListener = function(e, t) {
                var n = this;
                originAddEventListener.call(n, e, function() {
                    n._url && (n._url.indexOf("/youtubei/v1/next") > -1 || n._url.indexOf("/youtubei/v1/player") > -1 || n._url.indexOf("/get_video_info") > -1 || n._url.indexOf("/get_queue") > -1 || n._url.indexOf("/get_share_panel") > -1) || t.call(n);
                });
            };
            var WATCH_COMMAND_PREFIX = "ymusic_watch:", originSend;
            originSend = XMLHttpRequest.prototype.send, XMLHttpRequest.prototype.send = function(e) {
                var t = this, n = this.onreadystatechange;
                if (this.onreadystatechange = function() {
                    if (t._waitForRadioMyMix) {
                        if (4 === t.readyState) {
                            if (200 === t.status) try {
                                var e = JSON.parse(t.responseText).currentVideoEndpoint.watchEndpoint;
                                e.videoId && e.playlistId && playCommand(e.videoId, e.playlistId, t._shuffle);
                            } catch (e) {}
                            resetPlayer();
                        }
                    } else if (t._waitForShare) {
                        if (4 === t.readyState && 200 === t.status) try {
                            var r = JSON.parse(t.responseText).actions[0].openPopupAction.popup.unifiedSharePanelRenderer.contents[0].thirdPartyNetworkSection.copyLinkContainer.copyLinkRenderer.shortUrl;
                            console.log("ymusic_share:" + r);
                        } catch (e) {}
                    } else n && n.call(t);
                }, t._url && t._url.indexOf("/get_share_panel") > -1 && (t._waitForShare = !0),
                t._url && (t._url.indexOf("/get_video_info") > -1 || t._url.indexOf("/get_queue") > -1 || t._url.indexOf("/youtubei/v1/player") > -1)) setTimeout(resetPlayer, 500); else {
                    if (t._url && t._url.indexOf("/youtubei/v1/next") > -1) {
                        var r = JSON.parse(e), i = "string" == typeof r.params && r.params.indexOf("wAEB8gECGAE") > -1;
                        t._shuffle = i;
                        var o = r.playlistId, a = r.videoId;
                        if (a) return setTimeout(resetPlayer, 500), playCommand(a, o, i);
                        if (0 === o.indexOf("RDMM") && 15 === o.length) return setTimeout(resetPlayer, 500),
                            playCommand(o.substring(4), o, i);
                        if (0 === o.indexOf("RDAMVM") && 17 === o.length) return setTimeout(resetPlayer, 500),
                            playCommand(o.substring(6), o, i);
                        var s = "RDMM" === o, c = 0 === o.indexOf("RD") && 26 === o.length, l = 0 === o.indexOf("ML");
                        if (!(s || c || l || "LM" === o)) return setTimeout(resetPlayer, 500), playCommand(null, o, i);
                        t._waitForRadioMyMix = !0;
                    }
                    if (originSend.call(this, e), t._waitForShare) throw 1;
                }
            }, hasFetchApi && eval("{var origFetch = window.fetch;\n        window.fetch = async function (...args) {\n            try {\n                if (args[0].url && (args[0].url.indexOf('/youtubei/v1/next') > -1 || args[0].url.indexOf('/get_share_panel') > -1)) {\n                    var promise = new Promise(async function () {\n                        var xhr = new XMLHttpRequest();\n                        xhr.open('POST', args[0].url, true);\n                        Array.from(args[0].headers.keys()).forEach(key => {\n                            xhr.setRequestHeader(key, args[0].headers.get(key));\n                        });\n                        xhr.setRequestHeader('Content-Type', 'application/json');\n                        xhr.send(await args[0].text());\n                    });\n                    promise.then = function () {\n                    };\n\n                    promise.catch = function () {\n                    };\n\n                    promise.finally = function () {\n                    };\n\n                    return promise;\n                }\n            } catch (e) {\n                console.error(e);\n            }\n\n            return await origFetch.apply(this, args);\n        };}");
        }
    }
    function mockLeftContent() {
        var e = document.getElementById("left-content");
        e ? (e.innerHTML = '<a class="style-scope ytmusic-nav-bar" href="#" aria-label="Trang chủ">\n<picture class="style-scope ytmusic-nav-bar">\n<svg style="width:24px;height:24px" viewBox="0 0 24 24">\n<path style="fill: white" fill="#ffffffff" d="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z"></path>\n</svg>\n</picture>\n</a>',
            e.addEventListener("click", function(e) {
                e.preventDefault(), e.stopPropagation(), console.log("ymusic_open_nav:{}");
            })) : setTimeout(mockLeftContent, 100);
    }
    function mockAccountService() {
        var e = document.getElementsByTagName("ytmusic-settings-button");
        if (e.length && e[0] && e[0].accountService_ && e[0].accountService_.cachedGetAccountMenuRequestPromise && e[0].accountService_.cachedGetAccountMenuRequestPromise.result_ && "SUCCESS" === e[0].accountService_.cachedGetAccountMenuRequestPromise.result_.code) {
            for (var t = e[0].accountService_.cachedGetAccountMenuRequestPromise.result_.data.actions, n = [], r = 0; r < t.length; r++) {
                var i = t[r];
                if (i.openPopupAction) {
                    n = i.openPopupAction.popup.multiPageMenuRenderer.sections;
                    break;
                }
            }
            if (n.length) {
                for (n[0].multiPageMenuSectionRenderer.items = n[0].multiPageMenuSectionRenderer.items.filter(function(e) {
                    var t = e.compactLinkRenderer.icon.iconType;
                    return "ACCOUNT_BOX" === t || "SWITCH_ACCOUNTS" === t || "EXIT_TO_APP" === t;
                }); n.length > 1; ) n.pop();
                return;
            }
        }
        if ("undefined" != typeof yt && yt && yt.config_ && !yt.config_.LOGGED_IN && (e = document.getElementById("right-content"))) {
            e = e.getElementsByTagName("paper-icon-button");
            for (var o = 0; o < e.length; o++) e[o].hidden = !0;
        }
        setTimeout(mockAccountService, 100);
    }
    function removeElement(e) {
        for (var t = e(), n = !1, r = 0; r < t.length; r++) {
            var i = t[r];
            i && (i.parentNode.removeChild(i), console.log("Removed " + i.tagName), n = !0);
        }
        n || setTimeout(function() {
            return removeElement(e);
        }, 100);
    }
    function setUpPlayerUiService() {
        var e, t = document.getElementsByTagName("ytmusic-app-layout"), n = t.length ? t[0].playerUiService_ : null;
        n && !n.mockedStore && n.store && n.store.dispatch ? (n.mockedStore = !0, e = n.store.dispatch,
            n.store.dispatch = function(t) {
                if (t && t.type) {
                    var r = t.type, i = t.payload;
                    "SET_PLAYER_UI_STATE" === r && "INACTIVE" !== i || "SET_PLAYER_PAGE_INFO" === r && i && i.open || e.call(n.store, t);
                }
            }, playerUiService = n) : setTimeout(setUpPlayerUiService, 100);
    }
    function resetPlayer() {
        if (playerUiService) {
            console.log("Reset player");
            var e = 100;
            [ function() {
                playerUiService.store.dispatch({
                    type: "SET_IS_GENERATING",
                    payload: !1
                });
            }, function() {
                playerUiService.store.dispatch({
                    type: "SET_PLAYER_PAGE_INFO",
                    payload: {
                        open: !1
                    }
                });
            }, function() {
                playerUiService.store.dispatch({
                    type: "SET_PLAYER_UI_STATE",
                    payload: "HIDDEN"
                });
            }, function() {
                playerUiService.store.dispatch({
                    type: "CLEAR"
                });
            }, function() {
                playerUiService.store.dispatch({
                    type: "SET_PLAYER_UI_STATE",
                    payload: "HIDDEN"
                });
            }, function() {
                playerUiService.playerApi && playerUiService.playerApi.stopVideo && playerUiService.playerApi.stopVideo();
            } ].forEach(function(t) {
                setTimeout(t, e), e += 100;
            }), setTimeout(function() {
                for (var e = document.getElementsByTagName("ytmusic-play-button-renderer"), t = 0; t < e.length; t++) {
                    e[t].setAttribute("state", "default");
                }
            }, 3e3);
        }
    }
    function playCommand(e, t, n) {
        console.log(WATCH_COMMAND_PREFIX + JSON.stringify({
            videoId: e,
            playlistId: t,
            shuffle: null != n && n
        }));
    }
}(document);
