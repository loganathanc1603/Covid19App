sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"com/loga/covid19app/Covid19/model/models"
], function (UIComponent, Device, models) {
	"use strict";

	return UIComponent.extend("com.loga.covid19app.Covid19.Component", {

		metadata: {
			manifest: "json"
		},

		init: function () {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// enable routing
			this.getRouter().initialize();

			// set the device model
			this.setModel(models.createDeviceModel(), "device");

			//api endpoint to fetch worldwide data from
			var sUrl = "https://corona.lmao.ninja/all";
			this.setModel(models.createCovidAllModel(sUrl), "covidAll");
		}
	});
});