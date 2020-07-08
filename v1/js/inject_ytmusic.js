(function (document) {
    if (document.ymusicInitialized) {
        return
    }
    document.ymusicInitialized = true;

    var css = 'ytmusic-menu-service-item-renderer, paper-dialog { display: none; visibility: invisible; }',
        head = document.head || document.getElementsByTagName('head')[0],
        style = document.createElement('style');

    head.appendChild(style);

    style.type = 'text/css';
    if (style.styleSheet) {
        // This is required for IE8 and below.
        style.styleSheet.cssText = css;
    } else {
        style.appendChild(document.createTextNode(css));
    }


    function mockLeftContent() {
        var leftContent = document.getElementById("left-content");
        if (!leftContent) {
            setTimeout(mockLeftContent, 100);
            return;
        }

        leftContent.innerHTML = "<a class=\"style-scope ytmusic-nav-bar\" href=\"#\" aria-label=\"Trang chủ\">\n" +
            "<picture class=\"style-scope ytmusic-nav-bar\">\n" +
            "<svg style=\"width:24px;height:24px\" viewBox=\"0 0 24 24\">\n" +
            "<path style=\"fill: white\" fill=\"#ffffffff\" d=\"M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z\"></path>\n" +
            "</svg>\n" +
            "</picture>\n" +
            "</a>";

        leftContent.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            console.log("ymusic_open_nav:{}");
        });
    }
    mockLeftContent();

    function mockAccountService() {
        let temp = document.getElementsByTagName("ytmusic-settings-button");
        if (temp.length
            && temp[0]
            && temp[0].accountService_
            && temp[0].accountService_.cachedGetAccountMenuRequestPromise
            && temp[0].accountService_.cachedGetAccountMenuRequestPromise.result_
            && temp[0].accountService_.cachedGetAccountMenuRequestPromise.result_.code === "SUCCESS") {
            let result = temp[0].accountService_.cachedGetAccountMenuRequestPromise.result_;
            let actions = result.data.actions;
            let sections = [];
            for (let index = 0; index < actions.length; index++) {
                const element = actions[index];
                if (element.openPopupAction) {
                    sections = element.openPopupAction.popup.multiPageMenuRenderer.sections;
                    break;
                }
            }
            if (sections.length) {
                sections[0].multiPageMenuSectionRenderer.items = sections[0].multiPageMenuSectionRenderer.items.filter((item) => {
                    let iconType = item.compactLinkRenderer.icon.iconType;
                    return iconType === "ACCOUNT_BOX" || iconType === "SWITCH_ACCOUNTS" || iconType === "EXIT_TO_APP";
                });
                while (sections.length > 1) sections.pop();
                return
            }
        }

        if (typeof yt !== "undefined" && yt && yt.config_) {
            if (!yt.config_.LOGGED_IN) {
                temp = document.getElementById("right-content");
                if (temp) {
                    temp = temp.getElementsByTagName("paper-icon-button");
                    for (let index = 0; index < temp.length; index++) {
                        const element = temp[index];
                        element.hidden = true;
                    }
                }
            }
        }

        setTimeout(mockAccountService, 100);
    }
    mockAccountService();


    function removeElement(query) {
        var elements = query();
        var ok = false;
        for (let index = 0; index < elements.length; index++) {
            const element = elements[index];
            if (element) {
                element.parentNode.removeChild(element);
                console.log("Removed " + element.tagName);
                ok = true;
            }
        }

        if (!ok) {
            setTimeout(() => removeElement(query), 100);
        }
    }

    removeElement(() => document.getElementsByTagName("ytmusic-player-page"));
    removeElement(() => document.getElementsByClassName("fullscreen-overlay"));
    removeElement(() => [document.getElementById("player-bar-background")]);
    removeElement(() => document.getElementsByTagName("ytmusic-player-bar"));
    // removeElement(() => document.getElementsByTagName("ytmusic-popup-container"));

    var playerUiService = null;
    function setUpPlayerUiService() {
        let elements = document.getElementsByTagName("ytmusic-app-layout");
        let playerUiService_ = elements.length ? elements[0].playerUiService_ : null;
        if (playerUiService_ && !playerUiService_.mockedStore && playerUiService_.store && playerUiService_.store.dispatch) {
            playerUiService_.mockedStore = true;
            (function (originDispatch) {
                playerUiService_.store.dispatch = function (data) {
                    console.log(data);
                    if (!data || !data.type) {
                        return;
                    }
                    let type = data.type;
                    let payload = data.payload;
                    if (type === "SET_PLAYER_UI_STATE" && payload !== "INACTIVE"
                        || type === "SET_PLAYER_PAGE_INFO" && payload && payload.open) {
                        return;
                    }
                    originDispatch.call(playerUiService_.store, data);
                }
            })(playerUiService_.store.dispatch);
            playerUiService = playerUiService_;
        } else {
            setTimeout(setUpPlayerUiService, 100);
        }
    }
    setUpPlayerUiService();

    function resetPlayer() {
        if (!playerUiService) {
            return;
        }
        console.log("Reset player");
        let actions = [
            () => {
                playerUiService.store.dispatch({
                    type: "SET_IS_GENERATING",
                    payload: false
                });
            },
            () => {
                playerUiService.store.dispatch({
                    type: "SET_PLAYER_PAGE_INFO",
                    payload: {
                        open: false
                    }
                });
            },
            () => {
                playerUiService.store.dispatch({
                    type: "SET_PLAYER_UI_STATE",
                    payload: "HIDDEN"
                });
            },
            () => {
                playerUiService.store.dispatch({
                    type: "CLEAR"
                });
            },
            () => {
                playerUiService.store.dispatch({
                    type: "SET_PLAYER_UI_STATE",
                    payload: "HIDDEN"
                });
            },
            () => {
                if (playerUiService.playerApi) {
                    if (playerUiService.playerApi.stopVideo) playerUiService.playerApi.stopVideo();
                }
            }
        ]

        var delay = 100;
        actions.forEach(action => {
            setTimeout(action, delay);
            delay += 100;
        });

        setTimeout(() => {
            let buttons = document.getElementsByTagName("ytmusic-play-button-renderer");
            for (let index = 0; index < buttons.length; index++) {
                const button = buttons[index];
                button.setAttribute("state", "default");
            }
        }, 3000);
    }

    (function (originOpen) {
        XMLHttpRequest.prototype.open = function (method, url, async, user, pass) {
            this._url = url;
            originOpen.call(this, method, url, async, user, pass);
        };
    })(XMLHttpRequest.prototype.open);

    (function (originAddEventListener) {
        XMLHttpRequest.prototype.addEventListener = function (name, callback) {
            let self = this;
            originAddEventListener.call(self, name, () => {
                if (self._url && (
                    self._url.indexOf("/youtubei/v1/next") > -1
                    || self._url.indexOf("/get_video_info") > -1
                    || self._url.indexOf("/get_queue") > -1
                    || self._url.indexOf("/get_share_panel") > -1)) {
                    return;
                }
                callback.call(self);
            });
        };
    })(XMLHttpRequest.prototype.addEventListener);

    const WATCH_COMMAND_PREFIX = "ymusic_watch:";
    function playCommand(videoId, playlistId, shuffle) {
        console.log(WATCH_COMMAND_PREFIX + JSON.stringify({
            videoId: videoId,
            playlistId: playlistId,
            shuffle: shuffle != null ? shuffle : false
        }));
    }

    (function (originSend) {
        XMLHttpRequest.prototype.send = function (body) {
            let self = this;
            let oldOnReadyStateChange = this.onreadystatechange;
            this.onreadystatechange = function () {
                if (self._waitForRadioMyMix) {
                    if (self.readyState === 4) {
                        if (self.status === 200) {
                            try {
                                let watchEndpoint = JSON.parse(self.responseText).currentVideoEndpoint.watchEndpoint;
                                if (watchEndpoint.videoId && watchEndpoint.playlistId) {
                                    playCommand(watchEndpoint.videoId, watchEndpoint.playlistId, self._shuffle);
                                }
                            } catch (ignore) {
                            }
                        }
                        resetPlayer();
                    }
                    return;
                }
                if (self._waitForShare) {
                    if (self.readyState === 4 && self.status === 200) {
                        try {
                            let url = JSON.parse(self.responseText).actions[0].openPopupAction
                                .popup.unifiedSharePanelRenderer.contents[0].thirdPartyNetworkSection
                                .copyLinkContainer.copyLinkRenderer.shortUrl;
                            console.log("ymusic_share:" + url);
                        } catch (ignore) {
                        }
                    }
                    return;
                }
                if (oldOnReadyStateChange) oldOnReadyStateChange.call(self);
            };

            if (self._url && self._url.indexOf("/get_share_panel") > -1) {
                self._waitForShare = true;
            }

            if (self._url && (self._url.indexOf("/get_video_info") > -1 || self._url.indexOf("/get_queue") > -1)) {
                // avoid load video
                setTimeout(resetPlayer, 500);
                return;
            }

            if (self._url && self._url.indexOf("/youtubei/v1/next") > -1) {
                let bodyData = JSON.parse(body);
                console.log(bodyData);
                let shuffle = typeof bodyData.params == "string" && bodyData.params.indexOf("wAEB8gECGAE") > -1;
                self._shuffle = shuffle;
                let playlistId = bodyData.playlistId;
                let videoId = bodyData.videoId;
                if (videoId) {
                    setTimeout(resetPlayer, 500);
                    return playCommand(videoId, playlistId, shuffle);
                }
                if (playlistId.indexOf("RDMM") === 0 && playlistId.length === 15) {
                    setTimeout(resetPlayer, 500);
                    return playCommand(playlistId.substring(4), playlistId, shuffle);
                }
                if (playlistId.indexOf("RDAMVM") === 0 && playlistId.length === 17) {
                    setTimeout(resetPlayer, 500);
                    return playCommand(playlistId.substring(6), playlistId, shuffle);
                }
                let isMyMix = playlistId === "RDMM";
                let isChannelRadio = playlistId.indexOf("RD") === 0 && playlistId.length === 26;
                let isMyLibrary = playlistId.indexOf("ML") === 0;
                let isMyLikes = playlistId === "LM";
                if (!isMyMix && !isChannelRadio && !isMyLibrary && !isMyLikes) {
                    setTimeout(resetPlayer, 500);
                    return playCommand(null, playlistId, shuffle);
                }
                self._waitForRadioMyMix = true;
            }

            originSend.call(this, body);
            if (self._waitForShare) {
                throw 1;
            }
        };
    })(XMLHttpRequest.prototype.send);
})(document);