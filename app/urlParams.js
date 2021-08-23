define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function getUrlParams() {
        var queryParams = document.location.search.substr(1);
        var result = {};
        var defaultWebmapId = "bb229c40e7af4d84ac63f6a66268c0dc";
        queryParams.split("&").forEach(function (part) {
            var item = part.split("=");
            result[item[0]] = decodeURIComponent(item[1]);
        });
        if (!result.webmap) {
            result.webmap = defaultWebmapId;
        }
        result = {
            webmap: result.webmap
        };
        setUrlParams(result);
        return result;
    }
    exports.getUrlParams = getUrlParams;
    // function to set an id as a url param
    function setUrlParams(params) {
        var webmap = params.webmap;
        window.history.pushState("", "", window.location.pathname + "?webmap=" + webmap);
    }
    exports.setUrlParams = setUrlParams;
    function updateUrlParams(params) {
        var urlParams = getUrlParams();
        for (var p in params) {
            urlParams[p] = params[p];
        }
        ;
        setUrlParams(urlParams);
    }
    exports.updateUrlParams = updateUrlParams;
});
//# sourceMappingURL=urlParams.js.map