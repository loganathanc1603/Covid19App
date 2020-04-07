sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageBox",
	"sap/ui/Device",
	"sap/ui/model/Sorter",
	"com/loga/covid19app/Covid19/model/formatter",
	'sap/viz/ui5/data/FlattenedDataset',
	'sap/viz/ui5/format/ChartFormatter',
	'sap/viz/ui5/api/env/Format'
], function (Controller, JSONModel, Filter, FilterOperator, MessageBox, Device, Sorter, formatter, FlattenedDataset, ChartFormatter,
	Format) {
	"use strict";

	return Controller.extend("com.loga.covid19app.Covid19.controller.MainView", {
		formatter: formatter,
		onInit: function () {
			//	this.initChart();
			this._mViewSettingsDialogs = {};
			this.oRs = this.getOwnerComponent().getModel("i18n").getResourceBundle();

			var projPath = jQuery.sap.getModulePath("com.loga.covid19app.Covid19.media");
			var whoImg = projPath + "/WHO.jpg",
				MyGovIndImg = projPath + "/MyGovIndia.jpg",
				MyGovCovidTipsImg = projPath + "/MyGovCovidTips.png",
				MyGovStayHomeImg = projPath + "/MyGovStayHome.jfif";

			this.JModel = new JSONModel({
				iBusy: true,
				iBusyDelay: 5,
				NoofItemsIndia: this.oRs.getText("indiaTotal", [0]),
				otherCountryTotal: this.oRs.getText("otherCountryTotal", [0]),
				StateData: [],
				DistrictData: {},
				HeaderData: [],
				AllCountryData: [],
				IndiaGraph: [],
				KeyValue: {},
				whoImg: whoImg,
				MyGovIndImg: MyGovIndImg,
				MyGovCovidTipsImg: MyGovCovidTipsImg,
				MyGovStayHomeImg: MyGovStayHomeImg
			});
			this.getView().setModel(this.JModel, "JModel");
			this.StateDataFetch();
			this.fnFetchAllCountryData();
		},

		// initChart: function () {
		// 	// Format.numericFormatter(ChartFormatter.getInstance());
		// 	// var formatPattern = ChartFormatter.DefaultPattern;

		// 	// var oVizFrame = this.oVizFrame = this.getView().byId("VizFrameIndiaId");
		// 	// oVizFrame.setVizProperties({
		// 	// 	plotArea: {
		// 	// 		dataLabel: {
		// 	// 			formatString: formatPattern.SHORTFLOAT_MFD2,
		// 	// 			visible: true
		// 	// 		}
		// 	// 	},
		// 	// 	valueAxis: {
		// 	// 		label: {
		// 	// 			formatString: formatPattern.SHORTFLOAT
		// 	// 		},
		// 	// 		title: {
		// 	// 			visible: true
		// 	// 		}
		// 	// 	},
		// 	// 	categoryAxis: {
		// 	// 		title: {
		// 	// 			visible: true
		// 	// 		}
		// 	// 	},
		// 	// 	title: {
		// 	// 		visible: true,
		// 	// 		text: 'COVID 19 Report'
		// 	// 	}
		// 	// });
		// },

		fnFetchAllCountryData: function () {
			this.JModel.setProperty("/iBusy", true);
			var settings = {
				"async": true,
				"crossDomain": true,
				"url": "https://corona-virus-world-and-india-data.p.rapidapi.com/api",
				"method": "GET",
				"headers": {
					"x-rapidapi-host": "corona-virus-world-and-india-data.p.rapidapi.com",
					"x-rapidapi-key": "zkF95Q3Q99msh1YUMHbIe1uJfNmWp1Mzye0jsn8pNosOa8C15B"
				}
			};

			$.ajax(settings).done(function (response) {
				this.JModel.setProperty("/iBusy", false);
				this.JModel.setProperty("/AllCountryData", response.countries_stat);
				var oC = this.oRs.getText("otherCountryTotal", [response.countries_stat.length]);
				this.JModel.setProperty("/otherCountryTotal", oC);
			}.bind(this)).fail(function (err) {
				this.JModel.setProperty("/iBusy", false);
			}.bind(this));
		},

		StateDataFetch: function () {
			$.ajax({
				url: this.oRs.getText("stateUrl"),
				type: "GET",
				dataType: "json",
				success: function (data) {
					this.JModel.setProperty("/iBusy", false);
					var filterData = data.statewise.filter(function (item) {
						return item.state !== "Total";
					});
					var HeaderData = data.statewise.filter(function (item) {
						return item.state === "Total";
					});
					var oC = this.oRs.getText("indiaTotal", [filterData.length]);
					this.JModel.setProperty("/NoofItemsIndia", oC);
					this.fetchDistrictData(filterData);
					this.JModel.setProperty("/HeaderData", HeaderData);
					this.JModel.setProperty("/KeyValue", data.key_values);
					this.JModel.setProperty("/IndiaGraph", data.cases_time_series);
				}.bind(this),
				error: function (request, error) {
					this.JModel.setProperty("/iBusy", false);
				}.bind(this)
			});
		},

		fetchDistrictData: function (filterData) {
			this.JModel.setProperty("/iBusy", true);
			$.ajax({
				url: this.oRs.getText("districtUrl"),
				type: "GET",
				dataType: "json",
				success: function (data) {
					this.JModel.setProperty("/iBusy", false);

					filterData = this.SortValue(filterData, "state", "asc");
					filterData = this.ConvertValues(filterData);

					// var t = new JSONModel({
					// 	StateData: filterData
					// });
					// this.getView().setModel(t);
					data = this.SortValue(data, "state", "asc");
					for (var i = 0; i < data.length; i++) {
						for (var j = 0; j < filterData.length; j++) {
							if (data[i].state === filterData[j].state) {
								filterData[j].DistrictData = [];
								filterData[j].DistrictData = data[i].districtData;
							}
						}
					}
					this.JModel.setProperty("/StateData", filterData);
				}.bind(this),
				error: function (request, error) {
					this.JModel.setProperty("/iBusy", false);
				}.bind(this)
			});
		},

		ConvertValues: function (data) {
			for (var i = 0; i < data.length; i++) {
				data[i].confirmed = parseInt(data[i].confirmed);
				data[i].active = parseInt(data[i].active);
				data[i].deaths = parseInt(data[i].deaths);
				data[i].recovered = parseInt(data[i].recovered);
			}
			return data;
		},

		SortValue: function (data, property, orderBy) {
			function compareValues(key, order) {
				return function innerSort(a, b) {
					if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
						// property doesn't exist on either object
						return 0;
					}

					var varA = (typeof a[key] === "string") ? a[key].toUpperCase() : a[key];
					var varB = (typeof b[key] === "string") ? b[key].toUpperCase() : b[key];

					var comparison = 0;
					if (varA > varB) {
						comparison = 1;
					} else if (varA < varB) {
						comparison = -1;
					}
					return ((order === "desc" || order === true) ? (comparison * -1) : comparison);
				};
			}
			return data.sort(compareValues(property, orderBy));
		},

		createViewSettingsDialog: function (sDialogFragmentName) {
			var oDialog = this._mViewSettingsDialogs[sDialogFragmentName];

			if (!oDialog) {
				oDialog = sap.ui.xmlfragment(sDialogFragmentName, this);
				this._mViewSettingsDialogs[sDialogFragmentName] = oDialog;

				if (Device.system.desktop) {
					oDialog.addStyleClass("sapUiSizeCompact");
				}
			}
			return oDialog;
		},

		handleSortButtonPressed: function () {
			this.createViewSettingsDialog("com.loga.covid19app.Covid19.fragments.SortDialog").open();
		},

		onPrsSort: function () {
			this.createViewSettingsDialog("com.loga.covid19app.Covid19.fragments.AllCountrySortDialog").open();
		},

		onPrsBtnMenu: function (evt) {
			this.createViewSettingsDialog("com.loga.covid19app.Covid19.fragments.HelpPopover").openBy(evt.getSource());
		},

		onPrsClose: function () {
			this.createViewSettingsDialog("com.loga.covid19app.Covid19.fragments.DistrictDialog").close();
		},

		onPrsNavTable: function (evt) {
			this.JModel.setProperty("/DistrictData", undefined);
			var Obj = evt.getSource().getBindingContext("JModel").getObject();
			this.JModel.setProperty("/DistrictData", Obj);
			this.getView().getModel("JModel").refresh();
			this.createViewSettingsDialog("com.loga.covid19app.Covid19.fragments.DistrictDialog").open();
			this.createViewSettingsDialog("com.loga.covid19app.Covid19.fragments.DistrictDialog").setModel(this.JModel, "JModel");
		},

		handleSortDialogConfirm: function (oEvent) {
			var oTable = this.byId("mTblCovid19Id"),
				mParams = oEvent.getParameters(),
				oBinding = oTable.getBinding("items"),
				sPath,
				bDescending,
				aSorters = [];

			sPath = mParams.sortItem.getKey();
			bDescending = mParams.sortDescending;
			aSorters.push(new Sorter(sPath, bDescending));

			// apply the selected sort and group settings
			oBinding.sort(aSorters);
		},

		onSortAllCountry: function (oEvent) {
			var oTable = this.byId("mTblCovidOtherCtryId"),
				mParams = oEvent.getParameters(),
				oBinding = oTable.getBinding("items"),
				sPath,
				bDescending,
				aSorters = [];

			sPath = mParams.sortItem.getKey();
			bDescending = mParams.sortDescending;
			aSorters.push(new Sorter(sPath, bDescending));

			// apply the selected sort and group settings
			oBinding.sort(aSorters);
		},

		onLivChTable: function (oEvent) {
			var aFilters = [];
			var sQuery = oEvent.getSource().getValue();
			if (sQuery && sQuery.length > 0) {
				var f1 = new Filter("state", FilterOperator.Contains, sQuery),
					f2 = new Filter("confirmed", FilterOperator.Contains, sQuery),
					f3 = new Filter("active", FilterOperator.Contains, sQuery),
					f4 = new Filter("deaths", FilterOperator.Contains, sQuery),
					f5 = new Filter("recovered", FilterOperator.Contains, sQuery);
				aFilters.push(new Filter([f1, f2, f3, f4, f5], false));
			}

			// update list binding
			var oList = this.byId("mTblCovid19Id");
			var oBinding = oList.getBinding("items");
			oBinding.filter(aFilters, "Application");
		},

		onLivOtrCntry: function (oEvent) {
			var aFilters = [];
			var sQuery = oEvent.getSource().getValue();
			if (sQuery && sQuery.length > 0) {
				var f1 = new Filter("country_name", FilterOperator.Contains, sQuery),
					f2 = new Filter("cases", FilterOperator.Contains, sQuery),
					f3 = new Filter("active_cases", FilterOperator.Contains, sQuery),
					f4 = new Filter("total_recovered", FilterOperator.Contains, sQuery),
					f5 = new Filter("deaths", FilterOperator.Contains, sQuery);
				aFilters.push(new Filter([f1, f2, f3, f4, f5], false));
			}

			// update list binding
			var oList = this.byId("mTblCovidOtherCtryId");
			var oBinding = oList.getBinding("items");
			oBinding.filter(aFilters, "Application");
		},

		onPrsTile: function (evt) {
			var oTable = this.byId("mTblCovid19Id"),
				oBinding = oTable.getBinding("items"),
				bDescending,
				aSorters = [],
				sPath = evt.getSource().data("filterId");

			bDescending = true;
			aSorters.push(new Sorter(sPath, bDescending));

			// apply the selected sort and group settings
			oBinding.sort(aSorters);
		},

		onPrsBtnRefresh: function () {
			this.JModel.setProperty("/iBusy", true);
			this.JModel.setProperty("/AllCountryData", []);
			this.JModel.setProperty("/StateData", []);
			this.StateDataFetch();
			this.fnFetchAllCountryData();
		},

		onExpand: function (evt) {
			var sId = evt.getSource().data("filterId"),
				exp = evt.getSource().getExpanded();
			if (sId === "mPanlIndiaId" && exp === false) {
				this.byId("mPanlAllId").setExpanded(true);
			} else if (sId === "mPanlAllId" && exp === false) {
				this.byId("mPanlIndiaId").setExpanded(true);
			} else if (sId === "mPanlIndiaId" && exp === true) {
				this.byId("mPanlAllId").setExpanded(false);
			} else if (sId === "mPanlAllId" && exp === true) {
				this.byId("mPanlIndiaId").setExpanded(false);
			}
		},

		onPrsSlideTile: function (evt) {
			var oKey = evt.getSource().data("filterId");
			if (oKey === "1") {
				sap.m.URLHelper.redirect(this.oRs.getText("url1"), true);
			} else if (oKey === "2") {
				sap.m.URLHelper.redirect(this.oRs.getText("url2"), true);
			} else if (oKey === "3") {
				sap.m.URLHelper.redirect(this.oRs.getText("url3"), true);
			} else if (oKey === "4") {
				sap.m.URLHelper.redirect(this.oRs.getText("url4"), true);
			}
		},

		onPrsSwap: function (evt) {
			var oTable = this.byId("mTblCovid19Id").getVisible();
			if (oTable === true) {
				this.byId("mTblCovid19Id").setVisible(false);
				this.byId("VizFrameIndiaId").setVisible(true);
			} else {
				this.byId("mTblCovid19Id").setVisible(true);
				this.byId("VizFrameIndiaId").setVisible(false);
			}
		},

		onPrsClr: function (evt) {
			var t = evt;
		}
	});
});