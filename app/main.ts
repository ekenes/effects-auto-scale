import esri = __esri;

import WebMap = require("esri/WebMap");
import MapView = require("esri/views/MapView");
import Legend = require("esri/widgets/Legend");
import Expand = require("esri/widgets/Expand");
import LayerList = require("esri/widgets/LayerList");
import BasemapLayerList = require("esri/widgets/BasemapLayerList");
import ActionToggle = require("esri/support/actions/ActionToggle");
import BasemapGallery = require("esri/widgets/BasemapGallery");
import Color = require("esri/Color");

import { getUrlParams } from "./urlParams";

( async () => {

  const { webmap } = getUrlParams();

  const map = new WebMap({
    portalItem: {
      id: webmap
    }
  });

  await map.load();
  await map.loadAll();

  const view = new MapView({
    map: map,
    container: "viewDiv"
  });
  view.ui.add("titleDiv", "top-right");

  await view.when();

  view.ui.add(new Expand({
    content: new Legend({ view }),
    view,
    expanded: false
  }), "bottom-left");

  view.ui.add(new Expand({
    content: new BasemapGallery({ view }),
    view,
    expanded: false
  }), "bottom-left");

  const effects = {
    "Bloom": `bloom(2,1px,0.1)`,
    "Blur": `blur(2px)`,
    "Brightness": `brightness(150%)`,
    "Contrast": `contrast(200%)`,
    "Drop shadow": `drop-shadow(1px,1px,2px,#000000)`,
    "Grayscale": `grayscale(100%)`,
    "Hue rotate": `hue-rotate(100deg)`,
    "Invert": `invert(100%)`,
    "Opacity": `opacity(50%)`
  };

  const createActions = (effects:any) => Object.keys(effects).map( (key: string) => new ActionToggle({ id: key, title: key, value: false }));

  const layerList = new LayerList({
    view,
    listItemCreatedFunction: (event) => {
      const item = event.item as esri.ListItem;

      const finalLayer = view.map.layers.getItemAt(view.map.layers.length-1);
      const showOptions = finalLayer.id === item.layer.id;

      item.actionsOpen = showOptions;

      const layer = item.layer as esri.FeatureLayer;

      item.actionsSections = [
        createActions(effects)
      ] as any;
    }
  });
  view.ui.add(new Expand({
    view,
    content: layerList,
    group: "top-right"
  }), "top-right");

  function triggerAction (event: esri.LayerListTriggerActionEvent) {
    const { item } = event;
    const layer = item.layer as esri.FeatureLayer;
    const actions = item.actionsSections.reduce((p, c) => p.concat(c));

    const effect = actions.map(action => (action as ActionToggle).value ? effects[action.id] : '')
      .reduce((p,c) => `${p} ${c}`)
      .trim();

      console.log(effect)

    layer.effect = effect.length > 0 ? effect : null;
  }

  layerList.on("trigger-action", triggerAction);

  function basemapListItemCreatedFunction (event: any) {
    const item = event.item as esri.ListItem;
    item.actionsSections = [
      createActions(effects)
    ] as any;
  }

  const basemapLayerList = new BasemapLayerList({
    view,
    baseListItemCreatedFunction: basemapListItemCreatedFunction,
    referenceListItemCreatedFunction: basemapListItemCreatedFunction
  });
  view.ui.add(new Expand({
    view,
    content: basemapLayerList,
    expanded: true,
    group: "top-right"
  }), "top-right");
  basemapLayerList.on("trigger-action", triggerAction);

  interface BloomParams {
    strength: number;
    radius: number;
    threshold: number;
  }

  function setBloom(scale: number, params: BloomParams): esri.Effect {
    const { strength, radius, threshold } = params;
    const factor = 2;
    const invFactor = 1 / factor;
    return [
      {
        // the original values have been doubled after two zoom level in
        scale: scale * 0.25,
        value: `bloom(${strength * factor}, ${radius * factor}, ${threshold})`,
      },
      {
        scale,
        value: `bloom(${strength}, ${radius}, ${threshold})`,
      },
      {
        // the original values have been halved after two zooms level out
        scale: scale * 2,
        value: `bloom(${strength * invFactor}, ${radius * invFactor}, ${threshold})`,
      }
    ];
  }

  interface DropshadowParams {
    offsetX: number;
    offsetY: number;
    blurRadius: number;
    color: Color;
  }

  function setDropshadow(scale: number, params: DropshadowParams): esri.Effect {
    const { offsetX, offsetY, blurRadius, color } = params;
    const factor = 2;
    const invFactor = 1 / factor;
    return [
      {
        // the original values have been doubled after two zoom level in
        scale: scale * 0.25,
        value: `drop-shadow(${offsetX * factor}px, ${offsetY * factor}px, ${blurRadius * factor}px, ${color})`,
      },
      {
        scale,
        value: `drop-shadow(${offsetX}px, ${offsetY}px, ${blurRadius}px, ${color})`,
      },
      {
        // the original values have been halved after two zooms level out
        scale: scale * 2,
        value: `drop-shadow(${offsetX * invFactor}px, ${offsetY * invFactor}px, ${blurRadius * invFactor}px, ${color})`,
      }
    ];
  }

})();
