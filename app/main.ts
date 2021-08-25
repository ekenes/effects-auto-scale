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
import FeatureLayer = require("esri/layers/FeatureLayer");
import Feature = require("esri/widgets/Feature");
import ListItemPanel = require("esri/widgets/LayerList/ListItemPanel");

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

  const bloomDefault = {
    strength: 2,
    radius: 1,
    threshold: 0.1
  };

  const dropShadowDefault = {
    offsetX: 1,
    offsetY: 1,
    blurRadius: 2,
    color: new Color("#000000")
  };

  const bloomCurrent = bloomDefault;
  const dropShadowCurrent = dropShadowDefault;

  const effects = {
    "Bloom": setBloom({ scale: view.scale, ...bloomDefault }),
    "Drop shadow": setDropshadow({ scale: view.scale, ...dropShadowDefault })
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

  let scaleWatcher:esri.WatchHandle = null;

  function triggerAction (event: esri.LayerListTriggerActionEvent) {
    if(scaleWatcher){
      scaleWatcher.remove();
      scaleWatcher = null;
    }

    const { action, item } = event;
    const { id } = action;
    const layer = item.layer as esri.FeatureLayer;

    const actions = item.actionsSections.reduce((p, c) => p.concat(c));

    actions.forEach(action => {
      (action as ActionToggle).value = (action as ActionToggle).value && action.id === id;
    });

    const bloomControlsContainer = document.getElementById("bloom-controls") as HTMLElement;
    const dropshadowControlsContainer = document.getElementById("dropshadow-controls") as HTMLElement;
    let sliders: HTMLInputElement[];

    if ((action as esri.ActionToggle).value){
      layer.effect = effects[id];

      if(id === "Bloom"){
        item.panel = {
          content: bloomControlsContainer.cloneNode(true),
          open: true
        } as esri.ListItemPanel;
        (item.panel.content as HTMLElement).style.display = "block";

        const panelContent = item.panel.content as any;

        const [ scaleCheckbox ] = [ ...panelContent.getElementsByTagName("calcite-checkbox") ];

        sliders = [ ...panelContent.getElementsByTagName("calcite-slider") ];
        sliders[0].value = bloomDefault.strength.toString();
        sliders[1].value = bloomDefault.radius.toString();
        sliders[2].value = bloomDefault.threshold.toString();

        sliders.forEach( (control: HTMLElement) => {
          control.addEventListener("calciteSliderChange", () => {
            const scale = scaleCheckbox.checked ? view.scale : null;
            updateBloomEffect({ scale, layer })
          });
        });

        scaleCheckbox.addEventListener("calciteCheckboxChange", () => {
          const scale = scaleCheckbox.checked ? view.scale : null;
          updateBloomEffect({ scale, layer})
        });

        scaleWatcher = view.watch("scale", (viewScale) => {
          console.log("scale", view.scale);
          console.log("effects", layer.effect);

          if(viewScale > effects[2].scale){
            return;
          }

          if(viewScale > effects[1].scale){
            const referenceScale = effects[1].scale;
            viewScale
          }

          if(viewScale > effects[0].scale){

          }

          if(viewScale < effects[0].scale){
            return;
          }



        })

      }
      if(id === "Drop shadow"){
        item.panel = {
          content: dropshadowControlsContainer.cloneNode(true),
          open: true
        } as esri.ListItemPanel;
        (item.panel.content as HTMLElement).style.display = "block";

        const panelContent = item.panel.content as any;

        const [ scaleCheckbox ] = [ ...panelContent.getElementsByTagName("calcite-checkbox") ];

        sliders = [ ...panelContent.getElementsByTagName("calcite-slider") ];
        sliders[0].value = dropShadowDefault.offsetX.toString();
        sliders[1].value = dropShadowDefault.offsetY.toString();
        sliders[2].value = dropShadowDefault.blurRadius.toString();

        sliders.forEach( (control: HTMLElement) => {
          control.addEventListener("calciteSliderChange", () => {
            const scale = scaleCheckbox.checked ? view.scale : null;
            updateDropshadowEffect({ scale, layer})
          });
        });

        scaleCheckbox.addEventListener("calciteCheckboxChange", () => {
          const scale = scaleCheckbox.checked ? view.scale : null;
          updateDropshadowEffect({ scale, layer})
        });
      }
    } else {
      item.panel.open = false;
      layer.effect = null;
    }

    interface UpdateEffectParams {
      scale?: number;
      layer: FeatureLayer;
    }

    function updateBloomEffect (params: UpdateEffectParams) {
      const { scale, layer } = params;
      const bloomStrengthControl = sliders[0] as HTMLInputElement;
      const bloomRadiusControl = sliders[1] as HTMLInputElement;
      const bloomThresholdControl = sliders[2] as HTMLInputElement;
      const strength = parseFloat(bloomStrengthControl.value);
      const radius = parseFloat(bloomRadiusControl.value);
      const threshold = parseFloat(bloomThresholdControl.value);

      const bloomParams = { scale, strength, radius, threshold };

      bloomCurrent.strength = strength;
      bloomCurrent.radius = radius;
      bloomCurrent.threshold = threshold;

      const effects = setBloom(bloomParams);
      console.log(effects);
      layer.effect = effects;
    }

    function updateDropshadowEffect (params: UpdateEffectParams) {
      const { scale, layer } = params;
      const dropshadowOffsetXControl = sliders[0] as HTMLInputElement;
      const dropshadowOffsetYControl = sliders[1] as HTMLInputElement;
      const dropshadowBlurRadiusControl = sliders[2] as HTMLInputElement;
      const offsetX = parseFloat(dropshadowOffsetXControl.value);
      const offsetY = parseFloat(dropshadowOffsetYControl.value);
      const blurRadius = parseFloat(dropshadowBlurRadiusControl.value);
      const { color } = dropShadowDefault;

      const dropshadowParams = { scale, offsetX, offsetY, blurRadius, color };

      dropShadowCurrent.offsetX = offsetX;
      dropShadowCurrent.offsetY = offsetY;
      dropShadowCurrent.blurRadius = blurRadius;

      const effects = setDropshadow(dropshadowParams);
      console.log(effects);
      layer.effect = effects;
    }
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
    scale?: number;
  }

  function setBloom(params: BloomParams): esri.Effect {
    const { scale, strength, radius, threshold } = params;

    if(!scale){
      return `bloom(${strength}, ${radius}px, ${threshold})`;
    }

    const factor = 2;
    const invFactor = 1 / factor;
    return [
      {
        // the original values have been doubled after two zoom level in
        scale: scale * 0.25,
        value: `bloom(${strength * factor}, ${radius * factor}px, ${threshold})`,
      },
      {
        scale,
        value: `bloom(${strength}, ${radius}px, ${threshold})`,
      },
      {
        // the original values have been halved after two zooms level out
        scale: scale * 4,
        value: `bloom(${strength * invFactor}, ${radius * invFactor}px, ${threshold})`,
      }
    ];
  }

  interface DropshadowParams {
    scale?: number;
    offsetX: number;
    offsetY: number;
    blurRadius: number;
    color: Color;
  }

  function setDropshadow(params: DropshadowParams): esri.Effect {
    const { scale, offsetX, offsetY, blurRadius, color } = params;

    if(!scale){
      return `drop-shadow(${offsetX}px, ${offsetY}px, ${blurRadius}px, ${color})`;
    }

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
        scale: scale * 4,
        value: `drop-shadow(${offsetX * invFactor}px, ${offsetY * invFactor}px, ${blurRadius * invFactor}px, ${color})`,
      }
    ];
  }

})();
