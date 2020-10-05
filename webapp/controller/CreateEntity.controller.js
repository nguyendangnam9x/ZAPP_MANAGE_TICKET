sap.ui.define([
	"solman/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/m/ObjectMarker",
	"sap/ui/core/format/FileSizeFormat",
	"sap/m/UploadCollectionParameter",
	"sap/m/MessageToast",
	"sap/m/library"
], function(BaseController, JSONModel, MessageBox, ObjectMarker, FileSizeFormat, UploadCollectionParameter, MessageToast, MobileLibrary) {
	"use strict";
	var GFile = [];
	return BaseController.extend("solman.controller.CreateEntity", {
		onInit: function() {
			var data = {
				"items": []
			};
			this.getView().setModel(new JSONModel(data));

			this.getView().setModel(new JSONModel({
				// "maximumFilenameLength": 55,
				"maximumFileSize": 3,
				"mode": MobileLibrary.ListMode.SingleSelectMaster,
				"uploadEnabled": true,
				"uploadButtonVisible": false,
				"enableEdit": true,
				"enableDelete": true,
				"visibleEdit": true,
				"visibleDelete": true,
				"listSeparatorItems": [
					MobileLibrary.ListSeparators.All,
					MobileLibrary.ListSeparators.None
				],
				"showSeparators": MobileLibrary.ListSeparators.All,
				"listModeItems": [{
					"key": MobileLibrary.ListMode.SingleSelectMaster,
					"text": "Single"
				}, {
					"key": MobileLibrary.ListMode.MultiSelect,
					"text": "Multi"
				}]
			}), "settings");

			this.getView().setModel(new JSONModel({
				"items": ["pdf", "doc", "docx", "xls", "xlsx", "rar", "zip"],
				"selected": ["pdf", "doc", "docx", "xls", "xlsx", "rar", "zip"]
			}), "fileTypes");

			// Sets the text to the label
			this.byId("UploadCollection").addEventDelegate({
				onBeforeRendering: function() {
					this.byId("attachmentTitle").setText(this.getAttachmentTitleText());
				}.bind(this)
			});
			this._oResourceBundle = this.getResourceBundle();
		},
		
		onNavBack: function() {
			this.onCancel();
		},

		onCancel: function() {
			var oView = this.getView();
			if (oView.byId("incident").getSelectedKey() !== "ZMIN" || oView.byId("description").getValue() !== "" ||
					oView.byId("impact").getSelectedKey() !== "CA_1" || oView.byId("requested_start").getValue() !== "" ||
					oView.byId("priority").getSelectedKey() !== "1" || oView.byId("requested_start").getValue() !== ""  ||
					oView.byId("text_description").getValue() !== "" || oView.byId("comment").getValue() !== "" ||
					GFile.length !== 0) {
				this._showConfirmQuitChanges();
			}
			else {
				this._resetDefaultVal();
				this._navBack();
			}
		},
		
		_navBack: function() {
			var oHistory = sap.ui.core.routing.History.getInstance(),
				sPreviousHash = oHistory.getPreviousHash();
			this.getView().unbindObject();
			if (sPreviousHash !== undefined) {
				history.go(-1);
			} else {
				this.getRouter().getTargets().display("object");
			}
		},

		_showConfirmQuitChanges: function() {
			var oComponent = this.getOwnerComponent();
			var that = this;
			MessageBox.confirm(this._oResourceBundle.getText("confirmCancelMessage"), {
				styleClass: oComponent.getContentDensityClass(),
				onClose: function(oAction) {
					if (oAction === sap.m.MessageBox.Action.OK) {
						that._resetDefaultVal();
						that._navBack();
					}
				}
			});
		},

		onFileDeleted: function(oEvent) {
			this.deleteItemById(oEvent.getParameter("documentId"));
		},

		deleteItemById: function(sDocumentId) {
			var oData = this.byId("UploadCollection").getModel().getData();
			var aItems = jQuery.extend(true, {}, oData).items;
			var fileName = "";
			jQuery.each(aItems, function(index) {
				if (aItems[index] && aItems[index].documentId === sDocumentId) {
					fileName = aItems[index].fileName;
					aItems.splice(index, 1);
				}
			});
			jQuery.each(GFile, function(index) {
				if (fileName !== "" && GFile[index] && GFile[index].NameFile === fileName) {
					GFile.splice(index, 1);
				}
			});
			this.byId("UploadCollection").getModel().setData({
				"items": aItems
			});
			this.byId("attachmentTitle").setText(this.getAttachmentTitleText());
		},

		onFilenameLengthExceed: function() {
			
		},

		onFileRenamed: function(oEvent) {
			// var oData = this.byId("UploadCollection").getModel().getData();
			// var aItems = jQuery.extend(true, {}, oData).items;
			// var sDocumentId = oEvent.getParameter("documentId");
			// jQuery.each(aItems, function(index) {
			// 	if (aItems[index] && aItems[index].documentId === sDocumentId) {
			// 		aItems[index].fileName = oEvent.getParameter("item").getFileName();
			// 	}
			// });
			// this.byId("UploadCollection").getModel().setData({
			// 	"items": aItems
			// });
		},

		onFileSizeExceed: function() {
			MessageBox.error(this._oResourceBundle.getText("msg_file_maxsize"));
		},

		onTypeMissmatch: function() {
			MessageBox.error(this._oResourceBundle.getText("msg_file_extension_error"));
		},

		onUpload: function(oEvent) {
			var oUploadCollection = oEvent.getSource();
			var oCustomerHeaderToken = new sap.m.UploadCollectionParameter({
				name: "x-csrf-token",
				value: "securityTokenFromModel"
			});
			oUploadCollection.addHeaderParameter(oCustomerHeaderToken);
			var uploadAttachment = this.getView().byId("UploadCollection");

			function getFileInfo(file) {
				var reader = new FileReader();
				reader.readAsDataURL(file);
				reader.onload = function() {
					GFile.unshift({
						Mime: file.type.toString(),
						Extention: file.name.split(".")[1].toString(),
						Length: file.size.toString(),
						NameFile: file.name.toString(),
						Content: reader.result.split(",")[1].toString()
					});
				};
			}

			for (var i = 0; i < oEvent.getParameter("files").length; i++) {
				var oFileTemp = oEvent.getParameter("files")[i];
				if (uploadAttachment.getItems().length > 0) {
					for (var j = 0; j < uploadAttachment.getItems().length; j++) {
						if (oFileTemp.name === uploadAttachment.getItems()[j].getProperty("fileName")) {
							// Do nothing. Same name file is not allow
							return;
						} else {
							getFileInfo(oFileTemp);
						}
					}
				} else {
					getFileInfo(oFileTemp);
				}
			}
		},

		onUploadComplete: function(oEvent) {
			var oUploadCollection = this.byId("UploadCollection");
			var oData = oUploadCollection.getModel().getData();
			var sfileName = oEvent.getParameter("files")[0].fileName;
			// at the moment parameter fileName is not set in IE9
			if (!sfileName) {
				var aUploadedFile = (oEvent.getParameters().getSource().getProperty("value")).split(/\" "/);
				sfileName = aUploadedFile[0];
			}
			// Check same file name
			for (var j = 0; j < oUploadCollection.getItems().length; j++) {
				if (sfileName === oUploadCollection.getItems()[j].getProperty("fileName")) {
					MessageBox.error(this._oResourceBundle.getText("msg_same_file_error"));
					return;
				}
			}
			oData.items.unshift({
				"fileName": sfileName,
				"documentId": jQuery.now().toString()
			});
			this.getView().getModel().refresh();
			this.byId("attachmentTitle").setText(this.getAttachmentTitleText());
		},

		onBeforeUploadStarts: function(oEvent) {
			// Header Slug
			var oCustomerHeaderSlug = new UploadCollectionParameter({
				name: "slug",
				value: oEvent.getParameter("fileName")
			});
			oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
		},

		onUploadTerminated: function() {

		},

		onFileTypeChange: function(oEvent) {
			this.byId("UploadCollection").setFileType(oEvent.getSource().getSelectedKeys());
		},

		onSelectAllPress: function(oEvent) {
			var oUploadCollection = this.byId("UploadCollection");
			if (!oEvent.getSource().getPressed()) {
				this.deselectAllItems(oUploadCollection);
				oEvent.getSource().setPressed(false);
				oEvent.getSource().setText("Select all");
			} else {
				this.deselectAllItems(oUploadCollection);
				oUploadCollection.selectAll();
				oEvent.getSource().setPressed(true);
				oEvent.getSource().setText("Deselect all");
			}
			this.onSelectionChange(oEvent);
		},

		deselectAllItems: function(oUploadCollection) {
			var aItems = oUploadCollection.getItems();
			for (var i = 0; i < aItems.length; i++) {
				oUploadCollection.setSelectedItem(aItems[i], false);
			}
		},

		getAttachmentTitleText: function() {
			var aItems = this.byId("UploadCollection").getItems();
			return "Attachments (" + aItems.length + ")";
		},

		onModeChange: function(oEvent) {
			var oSettingsModel = this.getView().getModel("settings");
			if (oEvent.getParameters().selectedItem.getProperty("key") === MobileLibrary.ListMode.MultiSelect) {
				oSettingsModel.setProperty("/visibleEdit", false);
				oSettingsModel.setProperty("/visibleDelete", false);
				this.enableToolbarItems(true);
			} else {
				oSettingsModel.setProperty("/visibleEdit", true);
				oSettingsModel.setProperty("/visibleDelete", true);
				this.enableToolbarItems(false);
			}
		},

		enableToolbarItems: function(status) {
			this.byId("selectAllButton").setVisible(status);
			this.byId("deleteSelectedButton").setVisible(status);
			this.byId("selectAllButton").setEnabled(status);
			// This is only enabled if there is a selected item in multi-selection mode
			if (this.byId("UploadCollection").getSelectedItems().length > 0) {
				this.byId("deleteSelectedButton").setEnabled(true);
			}
		},

		onSelectionChange: function() {
			var oUploadCollection = this.byId("UploadCollection");
			// Only it is enabled if there is a selected item in multi-selection mode
			if (oUploadCollection.getMode() === MobileLibrary.ListMode.MultiSelect) {
				if (oUploadCollection.getSelectedItems().length > 0) {
					this.byId("deleteSelectedButton").setEnabled(true);
				} else {
					this.byId("deleteSelectedButton").setEnabled(false);
				}
			}
		},

		onOpenAppSettings: function(oEvent) {
			if (!this.oSettingsDialog) {
				this.oSettingsDialog = sap.ui.xmlfragment("sap.m.sample.UploadCollection.AppSettings", this);
				this.getView().addDependent(this.oSettingsDialog);
			}
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this.oSettingsDialog);
			this.oSettingsDialog.open();
		},

		onDialogCloseButton: function() {
			this.oSettingsDialog.close();
		},

		onSave: function(oEvent) {
			var that = this;
			var sUrl = "/sap/opu/odata/sap/ZODATA_FIORI_SOL_SRV/";
			var oDataModel = new sap.ui.model.odata.v2.ODataModel(sUrl, {
				json: true,
				loadMetadataAsync: true
			});
			var oEntry = {};

			var transactionType = this.getView().byId("incident").getSelectedKey();
			var transactionTypeText = this.getView().byId("incident").getSelectedItem().getText();
			var description = this.getView().byId("description").getValue();
			var priority = this.getView().byId("priority").getSelectedKey();
			var impact = this.getView().byId("impact").getSelectedKey();
			var requestedStart = this.getView().byId("requested_start").getValue();
			var textDescription = this.getView().byId("text_description").getValue();
			var comment = this.getView().byId("comment").getValue();

			// Description is required
			if (description === "") {
				MessageBox.warning(this._oResourceBundle.getText("description_required"));
				return;
			}

			oEntry.TransactionType = transactionType;
			oEntry.Description = description;
			oEntry.Priority = priority;
			oEntry.Impact = impact;
			oEntry.RequestedStart = requestedStart;
			oEntry.TextDescription = textDescription;
			oEntry.Comment = comment;
			oEntry.ToAttachSet = GFile;
			var route = sap.ui.core.UIComponent.getRouterFor(this);

			sap.ui.core.BusyIndicator.show();
			oDataModel.create("/ItemSet", oEntry, {
				success: function(oData, response) {
					sap.ui.core.BusyIndicator.hide();
					if (oData.TicketId !== "") {
						that._resetDefaultVal();
						MessageBox.success(that._oResourceBundle.getText("msg_create_ticket_success", transactionTypeText), {
							onClose: function(oAction) {
								route.navTo("edit", {
									Guid: encodeURIComponent(oData.Guid)
								});
							}
						});
					} else {
						MessageBox.success(that._oResourceBundle.getText("msg_create_ticket_error", transactionTypeText));
					}
				},
				error: function(oError) {
					sap.ui.core.BusyIndicator.hide();
					MessageBox.error(oError.statusText);
				}
			});
		},

		_resetDefaultVal: function() {
			var oView = this.getView();
			oView.byId("incident").setSelectedKey("ZMIN");
			this.getView().byId("page").setTitle("Create " + oView.byId("incident").getSelectedItem().getText());
			oView.byId("priority").setSelectedKey("1");
			oView.byId("impact").setSelectedKey("CA_1");
			oView.byId("description").setValue("");
			oView.byId("requested_start").setValue("");
			oView.byId("text_description").setValue("");
			oView.byId("comment").setValue("");
			GFile = [];
			var data = {
				"items": []
			};
			this.getView().setModel(new JSONModel(data));
		},
		
		onChangeIncident: function(oEvent) {
			this.getView().byId("page").setTitle("Create " + oEvent.getSource().getSelectedItem().getText());
		}
	});

});