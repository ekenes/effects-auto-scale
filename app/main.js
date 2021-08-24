var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
define(["require", "exports", "esri/WebMap", "esri/views/MapView", "esri/widgets/Legend", "esri/widgets/Expand", "esri/widgets/LayerList", "esri/widgets/BasemapLayerList", "esri/support/actions/ActionToggle", "esri/widgets/BasemapGallery", "esri/Color", "./urlParams"], function (require, exports, WebMap, MapView, Legend, Expand, LayerList, BasemapLayerList, ActionToggle, BasemapGallery, Color, urlParams_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (function () { return __awaiter(void 0, void 0, void 0, function () {
        function triggerAction(event) {
            var action = event.action, item = event.item;
            var id = action.id;
            var layer = item.layer;
            var actions = item.actionsSections.reduce(function (p, c) { return p.concat(c); });
            actions.forEach(function (action) {
                action.value = action.value && action.id === id;
            });
            console.log(event);
            selectedLayer = layer;
            var bloomControlsContainer = document.getElementById("bloom-controls");
            var dropshadowControlsContainer = document.getElementById("dropshadow-controls");
            var sliders;
            if (action.value) {
                layer.effect = effects[id];
                if (id === "Bloom") {
                    item.panel = {
                        content: bloomControlsContainer.cloneNode(true),
                        open: true
                    };
                    item.panel.content.style.display = "block";
                    var panelContent = item.panel.content;
                    sliders = __spreadArrays(panelContent.getElementsByTagName("calcite-slider"));
                    sliders.forEach(function (control) {
                        control.addEventListener("calciteSliderChange", function () {
                            updateBloomEffect(view.scale, layer);
                        });
                    });
                }
                if (id === "Drop shadow") {
                    item.panel = {
                        content: dropshadowControlsContainer.cloneNode(true),
                        open: true
                    };
                    item.panel.content.style.display = "block";
                    var panelContent = item.panel.content;
                    sliders = __spreadArrays(panelContent.getElementsByTagName("calcite-slider"));
                    sliders.forEach(function (control) {
                        control.addEventListener("calciteSliderChange", function () {
                            updateDropshadowEffect(view.scale, layer);
                        });
                    });
                }
            }
            else {
                item.panel.open = false;
                layer.effect = null;
            }
            function updateBloomEffect(scale, layer) {
                var bloomStrengthControl = sliders[0];
                var bloomRadiusControl = sliders[1];
                var bloomThresholdControl = sliders[2];
                var strength = parseFloat(bloomStrengthControl.value);
                var radius = parseFloat(bloomRadiusControl.value);
                var threshold = parseFloat(bloomThresholdControl.value);
                var bloomParams = { strength: strength, radius: radius, threshold: threshold };
                var effects = setBloom(scale, bloomParams);
                layer.effect = effects;
            }
            function updateDropshadowEffect(scale, layer) {
                var dropshadowOffsetXControl = sliders[0];
                var dropshadowOffsetYControl = sliders[1];
                var dropshadowBlurRadiusControl = sliders[2];
                var offsetX = parseFloat(dropshadowOffsetXControl.value);
                var offsetY = parseFloat(dropshadowOffsetYControl.value);
                var blurRadius = parseFloat(dropshadowBlurRadiusControl.value);
                var color = dropShadowDefault.color;
                var dropshadowParams = { offsetX: offsetX, offsetY: offsetY, blurRadius: blurRadius, color: color };
                var effects = setDropshadow(scale, dropshadowParams);
                layer.effect = effects;
            }
        }
        function basemapListItemCreatedFunction(event) {
            var item = event.item;
            item.actionsSections = [
                createActions(effects)
            ];
        }
        function setBloom(scale, params) {
            var strength = params.strength, radius = params.radius, threshold = params.threshold;
            var factor = 2;
            var invFactor = 1 / factor;
            return [
                {
                    // the original values have been doubled after two zoom level in
                    scale: scale * 0.25,
                    value: "bloom(" + strength * factor + ", " + radius * factor + "px, " + threshold + ")",
                },
                {
                    scale: scale,
                    value: "bloom(" + strength + ", " + radius + "px, " + threshold + ")",
                },
                {
                    // the original values have been halved after two zooms level out
                    scale: scale * 2,
                    value: "bloom(" + strength * invFactor + ", " + radius * invFactor + "px, " + threshold + ")",
                }
            ];
        }
        function setDropshadow(scale, params) {
            var offsetX = params.offsetX, offsetY = params.offsetY, blurRadius = params.blurRadius, color = params.color;
            var factor = 2;
            var invFactor = 1 / factor;
            return [
                {
                    // the original values have been doubled after two zoom level in
                    scale: scale * 0.25,
                    value: "drop-shadow(" + offsetX * factor + "px, " + offsetY * factor + "px, " + blurRadius * factor + "px, " + color + ")",
                },
                {
                    scale: scale,
                    value: "drop-shadow(" + offsetX + "px, " + offsetY + "px, " + blurRadius + "px, " + color + ")",
                },
                {
                    // the original values have been halved after two zooms level out
                    scale: scale * 2,
                    value: "drop-shadow(" + offsetX * invFactor + "px, " + offsetY * invFactor + "px, " + blurRadius * invFactor + "px, " + color + ")",
                }
            ];
        }
        var webmap, map, view, bloomDefault, dropShadowDefault, selectedLayer, effects, createActions, layerList, basemapLayerList;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    webmap = urlParams_1.getUrlParams().webmap;
                    map = new WebMap({
                        portalItem: {
                            id: webmap
                        }
                    });
                    return [4 /*yield*/, map.load()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, map.loadAll()];
                case 2:
                    _a.sent();
                    view = new MapView({
                        map: map,
                        container: "viewDiv"
                    });
                    view.ui.add("titleDiv", "top-right");
                    return [4 /*yield*/, view.when()];
                case 3:
                    _a.sent();
                    view.ui.add(new Expand({
                        content: new Legend({ view: view }),
                        view: view,
                        expanded: false
                    }), "bottom-left");
                    view.ui.add(new Expand({
                        content: new BasemapGallery({ view: view }),
                        view: view,
                        expanded: false
                    }), "bottom-left");
                    bloomDefault = {
                        strength: 2,
                        radius: 1,
                        threshold: 0.1
                    };
                    dropShadowDefault = {
                        offsetX: 1,
                        offsetY: 1,
                        blurRadius: 2,
                        color: new Color("#000000")
                    };
                    effects = {
                        "Bloom": setBloom(view.scale, bloomDefault),
                        "Drop shadow": setDropshadow(view.scale, dropShadowDefault)
                    };
                    createActions = function (effects) { return Object.keys(effects).map(function (key) { return new ActionToggle({ id: key, title: key, value: false }); }); };
                    layerList = new LayerList({
                        view: view,
                        listItemCreatedFunction: function (event) {
                            var item = event.item;
                            var finalLayer = view.map.layers.getItemAt(view.map.layers.length - 1);
                            var showOptions = finalLayer.id === item.layer.id;
                            item.actionsOpen = showOptions;
                            var layer = item.layer;
                            item.actionsSections = [
                                createActions(effects)
                            ];
                        }
                    });
                    view.ui.add(new Expand({
                        view: view,
                        content: layerList,
                        group: "top-right"
                    }), "top-right");
                    layerList.on("trigger-action", triggerAction);
                    basemapLayerList = new BasemapLayerList({
                        view: view,
                        baseListItemCreatedFunction: basemapListItemCreatedFunction,
                        referenceListItemCreatedFunction: basemapListItemCreatedFunction
                    });
                    view.ui.add(new Expand({
                        view: view,
                        content: basemapLayerList,
                        expanded: true,
                        group: "top-right"
                    }), "top-right");
                    basemapLayerList.on("trigger-action", triggerAction);
                    return [2 /*return*/];
            }
        });
    }); })();
});
//# sourceMappingURL=main.js.map