/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"com/loga/covid19app/Covid19/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});