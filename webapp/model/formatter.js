sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function (JSONModel, Device) {
	"use strict";

	return {
		checkValue: function (sValue) {
			if (sValue) {
				if (sValue != "0") {
					return "[ + " + sValue + "  ]";
				}
			}
		}

	};
});