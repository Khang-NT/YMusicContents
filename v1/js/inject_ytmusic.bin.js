!function(e) {
    "use strict";
    if (e) {
        var t = e.head;
        if (!t) {
            var n = e.getElementsByTagName("head");
            n && n.length && (t = n[0]);
        }
        if (t && !e.ymusicInitialized) {
            e.ymusicInitialized = !0;
            var i = "ytmusic-menu-service-item-renderer, paper-dialog, ytmusic-mealbar-promo-renderer { display: none; visibility: invisible; }", o = e.createElement("style");
            t.appendChild(o), o.type = "text/css", o.styleSheet ? o.styleSheet.cssText = i : o.appendChild(e.createTextNode(i)),
                function t() {
                    var n = e.getElementById("left-content");
                    n ? (n.innerHTML = '<a class="style-scope ytmusic-nav-bar" href="#" aria-label="Trang chủ">\n<picture class="style-scope ytmusic-nav-bar">\n<svg style="width:24px;height:24px" viewBox="0 0 24 24">\n<path style="fill: white" fill="#ffffffff" d="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z"></path>\n</svg>\n</picture>\n</a>',
                        n.addEventListener("click", function(e) {
                            e.preventDefault(), e.stopPropagation(), console.log("ymusic_open_nav:{}");
                        })) : setTimeout(t, 100);
                }(), function t() {
                var n = e.getElementsByTagName("ytmusic-settings-button");
                if (n.length && n[0] && n[0].accountService_ && n[0].accountService_.cachedGetAccountMenuRequestPromise && n[0].accountService_.cachedGetAccountMenuRequestPromise.result_ && "SUCCESS" === n[0].accountService_.cachedGetAccountMenuRequestPromise.result_.code) {
                    for (var i = n[0].accountService_.cachedGetAccountMenuRequestPromise.result_.data.actions, o = [], r = 0; r < i.length; r++) {
                        var a = i[r];
                        if (a.openPopupAction) {
                            o = a.openPopupAction.popup.multiPageMenuRenderer.sections;
                            break;
                        }
                    }
                    if (o.length) {
                        for (o[0].multiPageMenuSectionRenderer.items = o[0].multiPageMenuSectionRenderer.items.filter(function(e) {
                            var t = e.compactLinkRenderer.icon.iconType;
                            return "ACCOUNT_BOX" === t || "SWITCH_ACCOUNTS" === t || "EXIT_TO_APP" === t;
                        }); o.length > 1; ) o.pop();
                        return;
                    }
                }
                if ("undefined" != typeof yt && yt && yt.config_ && !yt.config_.LOGGED_IN && (n = e.getElementById("right-content"))) {
                    n = n.getElementsByTagName("paper-icon-button");
                    for (var s = 0; s < n.length; s++) n[s].hidden = !0;
                }
                setTimeout(t, 100);
            }(), l(function() {
                return e.getElementsByTagName("ytmusic-player-page");
            }), l(function() {
                return e.getElementsByClassName("fullscreen-overlay");
            }), l(function() {
                return [ e.getElementById("player-bar-background") ];
            }), l(function() {
                return e.getElementsByTagName("ytmusic-player-bar");
            });
            var r, a, s = null;
            !function t() {
                var n, i = e.getElementsByTagName("ytmusic-app-layout"), o = i.length ? i[0].playerUiService_ : null;
                o && !o.mockedStore && o.store && o.store.dispatch ? (o.mockedStore = !0, n = o.store.dispatch,
                    o.store.dispatch = function(e) {
                        if (console.log(e), e && e.type) {
                            var t = e.type, i = e.payload;
                            "SET_PLAYER_UI_STATE" === t && "INACTIVE" !== i || "SET_PLAYER_PAGE_INFO" === t && i && i.open || n.call(o.store, e);
                        }
                    }, s = o) : setTimeout(t, 100);
            }(), r = XMLHttpRequest.prototype.open, XMLHttpRequest.prototype.open = function(e, t, n, i, o) {
                this._url = t, r.call(this, e, t, n, i, o);
            }, a = XMLHttpRequest.prototype.addEventListener, XMLHttpRequest.prototype.addEventListener = function(e, t) {
                var n = this;
                a.call(n, e, function() {
                    n._url && (n._url.indexOf("/youtubei/v1/next") > -1 || n._url.indexOf("/get_video_info") > -1 || n._url.indexOf("/get_queue") > -1 || n._url.indexOf("/get_share_panel") > -1) || t.call(n);
                });
            };
            var u, c = "ymusic_watch:";
            u = XMLHttpRequest.prototype.send, XMLHttpRequest.prototype.send = function(e) {
                var t = this, n = this.onreadystatechange;
                if (this.onreadystatechange = function() {
                    if (t._waitForRadioMyMix) {
                        if (4 === t.readyState) {
                            if (200 === t.status) try {
                                var e = JSON.parse(t.responseText).currentVideoEndpoint.watchEndpoint;
                                e.videoId && e.playlistId && d(e.videoId, e.playlistId, t._shuffle);
                            } catch (e) {}
                            p();
                        }
                    } else if (t._waitForShare) {
                        if (4 === t.readyState && 200 === t.status) try {
                            var i = JSON.parse(t.responseText).actions[0].openPopupAction.popup.unifiedSharePanelRenderer.contents[0].thirdPartyNetworkSection.copyLinkContainer.copyLinkRenderer.shortUrl;
                            console.log("ymusic_share:" + i);
                        } catch (e) {}
                    } else n && n.call(t);
                }, t._url && t._url.indexOf("/get_share_panel") > -1 && (t._waitForShare = !0),
                t._url && (t._url.indexOf("/get_video_info") > -1 || t._url.indexOf("/get_queue") > -1)) setTimeout(p, 500); else {
                    if (t._url && t._url.indexOf("/youtubei/v1/next") > -1) {
                        var i = JSON.parse(e);
                        console.log(i);
                        var o = "string" == typeof i.params && i.params.indexOf("wAEB8gECGAE") > -1;
                        t._shuffle = o;
                        var r = i.playlistId, a = i.videoId;
                        if (a) return setTimeout(p, 500), d(a, r, o);
                        if (0 === r.indexOf("RDMM") && 15 === r.length) return setTimeout(p, 500), d(r.substring(4), r, o);
                        if (0 === r.indexOf("RDAMVM") && 17 === r.length) return setTimeout(p, 500), d(r.substring(6), r, o);
                        var s = "RDMM" === r, c = 0 === r.indexOf("RD") && 26 === r.length, l = 0 === r.indexOf("ML");
                        if (!(s || c || l || "LM" === r)) return setTimeout(p, 500), d(null, r, o);
                        t._waitForRadioMyMix = !0;
                    }
                    if (u.call(this, e), t._waitForShare) throw 1;
                }
            };
        }
    }
    function l(e) {
        for (var t = e(), n = !1, i = 0; i < t.length; i++) {
            var o = t[i];
            o && (o.parentNode.removeChild(o), console.log("Removed " + o.tagName), n = !0);
        }
        n || setTimeout(function() {
            return l(e);
        }, 100);
    }
    function p() {
        if (s) {
            console.log("Reset player");
            var t = 100;
            [ function() {
                s.store.dispatch({
                    type: "SET_IS_GENERATING",
                    payload: !1
                });
            }, function() {
                s.store.dispatch({
                    type: "SET_PLAYER_PAGE_INFO",
                    payload: {
                        open: !1
                    }
                });
            }, function() {
                s.store.dispatch({
                    type: "SET_PLAYER_UI_STATE",
                    payload: "HIDDEN"
                });
            }, function() {
                s.store.dispatch({
                    type: "CLEAR"
                });
            }, function() {
                s.store.dispatch({
                    type: "SET_PLAYER_UI_STATE",
                    payload: "HIDDEN"
                });
            }, function() {
                s.playerApi && s.playerApi.stopVideo && s.playerApi.stopVideo();
            } ].forEach(function(e) {
                setTimeout(e, t), t += 100;
            }), setTimeout(function() {
                for (var t = e.getElementsByTagName("ytmusic-play-button-renderer"), n = 0; n < t.length; n++) {
                    t[n].setAttribute("state", "default");
                }
            }, 3e3);
        }
    }
    function d(e, t, n) {
        console.log(c + JSON.stringify({
            videoId: e,
            playlistId: t,
            shuffle: null != n && n
        }));
    }
}(document);