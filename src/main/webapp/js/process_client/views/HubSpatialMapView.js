/*jslint browser: true*/
/*global OpenLayers*/
/*global Backbone*/
var GDP = GDP || {};

GDP.PROCESS_CLIENT = GDP.PROCESS_CLIENT || {};

GDP.PROCESS_CLIENT.view = GDP.PROCESS_CLIENT.view || {};

(function() {
	"use strict";

	GDP.PROCESS_CLIENT.view.HubSpatialMapView = Backbone.View.extend({

		/**
		 * @constructs
		 * @param {Object} options
		 *     @prop model {model with attributes for aoiName, aoiExtent, aoiAttribute, and aoiAttributeValues
		 *     #prop mapDiv {String} - id of div where map should be rendered
		 */
		initialize : function(options) {
			this.mapDiv = options.mapDiv;
			this.aoiLayer = null;
			this.aoiFeatureLayer = null;

			Backbone.View.prototype.initialize.apply(this, arguments);

			var name = this.model.get('aoiName');
			var attribute = this.model.get('aoiAttribute');
			var values = this.model.get('aoiAttributeValues');
			var filter;

			var baseLayers = [GDP.util.mapUtils.createWorldStreetMapLayer()];
			this.map = GDP.util.mapUtils.createMap(baseLayers, []);

			if (name) {
				this.map.addLayer(GDP.util.mapUtils.createAOILayer(name));

				if ((attribute) && (values.length > 0)) {
					filter = GDP.util.mapUtils.createCQLFilter(attribute, values);
					this.map.addLayer(GDP.util.mapUtils.createAOIFeaturesLayer(name, filter));
				}
			}
			this.render();
		},

		render : function() {
			var name = this.model.get('aoiName');
			this.map.render(this.mapDiv);
			if (name) {
				this.map.zoomToExtent(this.model.get('aoiExtent'), false);
			}
			else {
				this.map.zoomToExtent(new OpenLayers.Bounds(GDP.config.get('map').extent.conus['3857']), false);
			}
			this._addDatasetBoundingBoxLayer();
		},

		_addDatasetBoundingBoxLayer : function() {
			var self = this;
			var dataSetModel = this.model.get('dataSetModel');
			var dataSourceUrl = this.model.get('dataSourceUrl');
			var bounds;

			if (dataSetModel.has('identifier') && dataSetModel.has('bounds')) {
				bounds = dataSetModel.get('bounds');
				if (dataSourceUrl) {
					GDP.util.mapUtils.createDataSourceExtentLayer(bounds, dataSetModel.get('identifier'), dataSourceUrl).done(function(layer) {
						self.boundsLayer = layer;
						self.map.addLayer(self.boundsLayer);
					});

				}
				else {
					this.boundsLayer = GDP.util.mapUtils.createDataSetExtentLayer(bounds);
					this.map.addLayer(this.boundsLayer);
				}

			}
		}
	});

}());


