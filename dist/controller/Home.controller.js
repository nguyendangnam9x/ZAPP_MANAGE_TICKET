/*global location */
sap.ui.define([
	"solman/controller/BaseController",
	"sap/m/TablePersoController",
	"sap/ui/model/json/JSONModel",
	"./TablePersoService",
	"sap/m/MessageBox",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Filter"
], function(BaseController, TablePersoController, JSONModel, TablePersoService, MessageBox, FilterOperator, Filter) {
	"use strict";
	return BaseController.extend("solman.controller.Home", {
		pageNumber: 1,
		pageMax: 0,
		totalRecord: 0,
		totalOpen: 0,
		totalClose: 0,
		autoRefresh: null,
		onInit: function() {
			sap.ushell.Container.getRenderer("fiori2").hideHeaderItem("backBtn", false);
			this._oTPC = new TablePersoController({
				table: this.byId("table_list_ticket"),
				componentName: "ticketApp",
				persoService: TablePersoService
			}).activate();
			this._searchTicket();
		},
		onNavBack: function(oEvent) {
			this.getRouter().getTargets().display("object");
		},
		onPersoButtonPressed: function(oEvent) {
			this._oTPC.openDialog();
		},
		onTablePersoRefresh: function() {
			this._oTPC.refresh();
		},
		onCreate: function(oEvent) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("create");
		},
		onEdit: function(oEvent) {
			var route = sap.ui.core.UIComponent.getRouterFor(this);
			var guid = oEvent.getSource().getAggregation("customData")[0].getBindingContext().getProperty("Guid");
			route.navTo("edit", {
				Guid: encodeURIComponent(guid)
			});
		},
		onMyTicket: function(oEvent) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("myticket");
		},
		onChartPie: function(oEvent) {
			var oVizFrame = this.oVizFrame = this.getView().byId("oVizFrame");
			oVizFrame.setVisible(!oVizFrame.getVisible());
		},
		onSearch: function(oEvent) {
			this.pageNumber = 1;
			this._searchTicket();
		},
		onNextPage: function(OEvent) {
			this._enableAllButtonPage();
			this.pageNumber = this.pageNumber + 1;
			if (this.pageNumber >= this.pageMax) {
				this.pageNumber = this.pageMax;
				this.getView().byId("btn_next_page").setEnabled(false);
				this.getView().byId("btn_last_page").setEnabled(false);
			}
			this._searchTicket();
		},
		onPrevPage: function(OEvent) {
			this._enableAllButtonPage();
			this.pageNumber = this.pageNumber - 1;
			if (this.pageNumber <= 1) {
				this.pageNumber = 1;
				this.getView().byId("btn_first_page").setEnabled(false);
				this.getView().byId("btn_prev_page").setEnabled(false);
			}
			this._searchTicket();
		},
		onFirstPage: function(OEvent) {
			this._enableAllButtonPage();
			this.pageNumber = 1;
			this.getView().byId("btn_first_page").setEnabled(false);
			this.getView().byId("btn_prev_page").setEnabled(false);
			this._searchTicket();
		},
		onLastPage: function(OEvent) {
			this._enableAllButtonPage();
			this.pageNumber = this.pageMax;
			this.getView().byId("btn_last_page").setEnabled(false);
			this.getView().byId("btn_next_page").setEnabled(false);
			this._searchTicket();
		},
		onUpdateFinishedAlegation: function(OEvent) {
			sap.ui.core.BusyIndicator.hide();
			this._countItem();
		},
		_enableAllButtonPage: function() {
			this._setEnableBtnPgae(true);
		},
		_disableAllButtonPage: function() {
			this._setEnableBtnPgae(false);
		},
		_setEnableBtnPgae: function(isEnable) {
			this.getView().byId("btn_first_page").setEnabled(isEnable);
			this.getView().byId("btn_prev_page").setEnabled(isEnable);
			this.getView().byId("btn_next_page").setEnabled(isEnable);
			this.getView().byId("btn_last_page").setEnabled(isEnable);
		},
		_searchTicket: function() {
			sap.ui.core.BusyIndicator.show();
			var sUrl = "/sap/opu/odata/sap/ZODATA_FIORI_SOL_SRV/";
			var that = this;

			var top = this.getView().byId("page_size").getSelectedKey();
			var skip = (this.pageNumber - 1) * top;

			var idVal = this.getView().byId("search_field_assign").getValue();
			var transTypeVal = this.getView().byId("transaction_type").getSelectedKey();
			var statusVal = this.getView().byId("status").getSelectedKey();
			var priorityVal = this.getView().byId("priority").getSelectedKey();
			var dateFromVal = this.getView().byId("date_from").getValue();
			var dateToVal = this.getView().byId("date_to").getValue();
			if (transTypeVal === "all") {
				transTypeVal = "";
			}
			if (statusVal === "all") {
				statusVal = "";
			}
			if (priorityVal === "all") {
				priorityVal = "";
			}
			var id = new sap.ui.model.Filter("TicketId", sap.ui.model.FilterOperator.Contains, idVal);
			var transType = new sap.ui.model.Filter("TransactionType", sap.ui.model.FilterOperator.EQ, transTypeVal);
			var status = new sap.ui.model.Filter("Status", sap.ui.model.FilterOperator.EQ, statusVal);
			var priority = new sap.ui.model.Filter("Priority", sap.ui.model.FilterOperator.EQ, priorityVal);
			var requestedStart = new sap.ui.model.Filter("RequestedStart", sap.ui.model.FilterOperator.BT, dateFromVal, dateToVal);
			var oDataModel = new sap.ui.model.odata.v2.ODataModel(sUrl, {
				json: true,
				loadMetadataAsync: true
			});
			oDataModel.read("/ItemSet", {
				filters: [id, transType, status, priority, requestedStart],
				urlParameters: {
					"$top": top,
					"$skip": skip
				},
				success: function(oData, response) {
					var oTable = that.getView().byId("table_list_ticket");
					var oJSONModel = new sap.ui.model.json.JSONModel();
					oJSONModel.setData(oData);
					oTable.setModel(oJSONModel);
					oTable.bindItems({
						path: "/results",
						template: oTable.getBindingInfo("items").template
					});
					if (oData.results.length <= 0) {
						that._disableAllButtonPage();
					}
				},
				error: function(oError) {
					MessageBox.error(oError.statusText);
				}
			});
		},

		_countItem: function() {
			sap.ui.core.BusyIndicator.show();
			var sUrl = "/sap/opu/odata/sap/ZODATA_FIORI_SOL_SRV/";
			var that = this;

			var idVal = this.getView().byId("search_field_assign").getValue();
			var transTypeVal = this.getView().byId("transaction_type").getSelectedKey();
			var statusVal = this.getView().byId("status").getSelectedKey();
			var priorityVal = this.getView().byId("priority").getSelectedKey();
			var dateFromVal = this.getView().byId("date_from").getValue();
			var dateToVal = this.getView().byId("date_to").getValue();
			if (transTypeVal === "all") {
				transTypeVal = "";
			}
			if (statusVal === "all") {
				statusVal = "";
			}
			if (priorityVal === "all") {
				priorityVal = "";
			}
			var id = new sap.ui.model.Filter("TicketId", sap.ui.model.FilterOperator.Contains, idVal);
			var transType = new sap.ui.model.Filter("TransactionType", sap.ui.model.FilterOperator.EQ, transTypeVal);
			var status = new sap.ui.model.Filter("Status", sap.ui.model.FilterOperator.EQ, statusVal);
			var priority = new sap.ui.model.Filter("Priority", sap.ui.model.FilterOperator.EQ, priorityVal);
			var requestedStart = new sap.ui.model.Filter("RequestedStart", sap.ui.model.FilterOperator.BT, dateFromVal, dateToVal);
			var oDataModel = new sap.ui.model.odata.v2.ODataModel(sUrl, {
				json: true,
				loadMetadataAsync: true
			});
			oDataModel.read("/Count_ItemSet", {
				filters: [id, transType, status, priority, requestedStart],
				success: function(oData, response) {
					var oVizFrame = that.getView().byId("oVizFrame");
					var oJSONModel = new sap.ui.model.json.JSONModel(oData);
					oVizFrame.setModel(oJSONModel);
					that._setTextInfo(oData.results);
					sap.ui.core.BusyIndicator.hide();
				},
				error: function(oError) {
					MessageBox.error(oError.statusText);
					sap.ui.core.BusyIndicator.hide();
				}
			});
		},

		_initBtnNextLast: function(top) {
			if (this.pageNumber === 1 && top < this.totalRecord) {
				this.getView().byId("btn_next_page").setEnabled(true);
				this.getView().byId("btn_last_page").setEnabled(true);
				this.getView().byId("btn_prev_page").setEnabled(false);
				this.getView().byId("btn_first_page").setEnabled(false);
			} else if (this.pageNumber === 1 && top >= this.totalRecord) {
				this.getView().byId("btn_next_page").setEnabled(false);
				this.getView().byId("btn_last_page").setEnabled(false);
				this.getView().byId("btn_prev_page").setEnabled(false);
				this.getView().byId("btn_first_page").setEnabled(false);
			}
		},

		_setTextInfo: function(results) {
			var top = this.getView().byId("page_size").getSelectedKey();

			var today = new Date();
			var date = String(today.getDate()).padStart(2, "0") + "." + String(today.getMonth() + 1).padStart(2, "0") + "." + today.getFullYear();
			var time = String(today.getHours()).padStart(2, "0") + ":" + String(today.getMinutes()).padStart(2, "0") + ":" + String(today.getSeconds())
				.padStart(2, "0");
			var dateTime = date + " " + time;
			for (var i = 0; i < results.length; i++) {
				if (results[i].Status === "Close") {
					this.totalClose = results[i].Count;
				} else if (results[i].Status === "Open") {
					this.totalOpen = results[i].Count;
				}
			}
			var pageSize = this.getView().byId("page_size").getSelectedKey();
			this.totalRecord = this.totalClose + this.totalOpen;
			this.pageMax = Math.ceil(this.totalRecord / pageSize);

			this._initBtnNextLast(top);

			this.getView().byId("txt_info").setText("Result List: " + this.totalRecord + ", Last Refresh: " + dateTime);
			this.getView().byId("txtTotal").setText("Total: " + this.totalRecord);
			this.getView().byId("txtOpen").setText("Open: " + this.totalOpen);
			this.getView().byId("txtClose").setText("Close: " + this.totalClose);
		},

		onChangePageSize: function(oEvent) {
			this.pageNumber = 1;
			this._searchTicket();
		},

		onRefresh: function(oEvent) {
			this.pageNumber = 1;
			this._searchTicket();
		},

		onRefreshAuto: function(oEvent) {
			var that = this;
			var switchRefresh = this.getView().byId("switchRefresh").getState();
			if (switchRefresh) {
				that.autoRefresh = setInterval(function() {
					that.onRefresh(oEvent);
				}, 60000);
			} else {
				clearInterval(that.autoRefresh);
			}
		}
	});
});