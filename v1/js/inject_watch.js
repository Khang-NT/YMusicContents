(function () {
    if (document._ymusic_injected) {
        return
    }
    document._ymusic_injected = true;


    let style = document.createElement("style");
    style.innerHTML = "#player-container-id { display: none; }\n" +
        ".player-size { display: none; }\n" +
        "ytm-item-section-renderer[section-identifier=\"related-items\"] { display: none; }\n" +
        "ytm-header-bar { display: none; }";
    let body = document.getElementsByTagName("body")[0];
    body.insertBefore(style, null);

    function loopHandleAtags() {
        let elements = document.getElementsByTagName("a");
        for (let i = 0; i < elements.length; i++) {
            let a = elements[i];
            let handled = a.handled;
            if (!handled) {
                a.handled = true;
                a.addEventListener("click", function (e) {
                    if (a.href) {
                        window.location = a.href;
                        e.stopImmediatePropagation();
                        e.preventDefault();
                    }
                }, false);
            }
        }

        if (window.spf && typeof window.spf.dispose === "function") {
            try {
                window.spf.dispose()
                window.spf = null;
            } catch (e) {
            }
        }

        if (window.ytcfg && window.ytcfg.data_) {
            try {
                window.ytcfg.data_["EXPERIMENT_FLAGS"]["pbj_navigate_limit"] = 0
            } catch (e) {
            }
        }

        setTimeout(loopHandleAtags, 500);
    }

    loopHandleAtags()
}).call(this);