sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";

	var TablePersoService = {

		oData : {
			_persoSchemaVersion: "1.0",
			aColumns : [
				{
					id: "ticketApp-table_list_ticket-idCol",
					order: 0,
					text: "Id",
					visible: true
				},
				{
					id: "ticketApp-table_list_ticket-descriptionCol",
					order: 1,
					text: "Description",
					visible: true
				},
				{
					id: "ticketApp-table_list_ticket-requestedStartCol",
					order: 2,
					text: "Requested start",
					visible: true
				},
				{
					id: "ticketApp-table_list_ticket-priorityCol",
					order: 3,
					text: "Priority",
					visible: true
				},
				{
					id: "ticketApp-table_list_ticket-transactionTypeCol",
					order: 4,
					text: "Transaction type",
					visible: true
				},
				{
					id: "ticketApp-table_list_ticket-firstResponseCol",
					order: 5,
					text: "First Response",
					visible: true
				},
				{
					id: "ticketApp-table_list_ticket-dueByCol",
					order: 6,
					text: "Due by",
					visible: true
				},{
					id: "ticketApp-table_list_ticket-userStatusCol",
					order: 7,
					text: "User status",
					visible: true
				},
				{
					id: "ticketApp-table_list_ticket-personResponsibleCol",
					order: 8,
					text: "Person responsible",
					visible: true
				}
			]
		},
		
		getPersData : function () {
			var oDeferred = new jQuery.Deferred();
			if (!this._oBundle) {
				this._oBundle = this.oData;
			}
			var oBundle = this._oBundle;
			oDeferred.resolve(oBundle);
			return oDeferred.promise();
		},

		setPersData : function (oBundle) {
			var oDeferred = new jQuery.Deferred();
			this._oBundle = oBundle;
			oDeferred.resolve();
			return oDeferred.promise();
		},

		resetPersData : function () {
			var oDeferred = new jQuery.Deferred();
			var oInitialData = {
				_persoSchemaVersion: "1.0",
				aColumns : [
				{
					id: "ticketApp-table_list_ticket-idCol",
					order: 0,
					text: "Id",
					visible: false
				},
				{
					id: "ticketApp-table_list_ticket-descriptionCol",
					order: 1,
					text: "Description",
					visible: true
				},
				{
					id: "ticketApp-table_list_ticket-requestedStartCol",
					order: 2,
					text: "Requested start",
					visible: true
				},
				{
					id: "ticketApp-table_list_ticket-priorityCol",
					order: 3,
					text: "Priority",
					visible: true
				},
				{
					id: "ticketApp-table_list_ticket-transactionTypeCol",
					order: 4,
					text: "Transaction type",
					visible: true
				},
				{
					id: "ticketApp-table_list_ticket-firstResponseCol",
					order: 5,
					text: "First Response",
					visible: true
				},
				{
					id: "ticketApp-table_list_ticket-dueByCol",
					order: 6,
					text: "Due by",
					visible: true
				},{
					id: "ticketApp-table_list_ticket-userStatusCol",
					order: 7,
					text: "User status",
					visible: true
				},
				{
					id: "ticketApp-table_list_ticket-personResponsibleCol",
					order: 8,
					text: "Person responsible",
					visible: true
				}
			]
			};

			//set personalization
			this._oBundle = oInitialData;

			oDeferred.resolve();
			return oDeferred.promise();
		}
	};

	return TablePersoService;

}, true);