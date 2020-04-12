sap.ui.define([
	"sap/ui/core/format/DateFormat"
], function (DateFormat) {
	"use strict";

	return {
		checkValue: function (sValue) {
			if (sValue) {
				if (sValue != "0") {
					return "[ + " + sValue + "  ]";
				}
			}
		},

		groupNumber: function (sNumber) {
			var oNumFormat = sap.ui.core.format.NumberFormat.getIntegerInstance({
				groupingEnabled: true
			});
			return oNumFormat.format(sNumber);
		},

		convertDateFormat: function (sValue) {
			if (sValue) {
				var Dt = new Date(sValue);
				var oDtFmt = DateFormat.getDateTimeInstance({
						pattern: "dd.MM.yyyy HH:mm:ss"
					}),
					fDt = oDtFmt.format(Dt);
				return fDt;
			}
		}

	};
});