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
	var GFile = []; // Array global list file
	return BaseController.extend("solman.controller.EditEntity", {
		guiId: 0, // Guid edit
		isFirstTime: true, // Variable first time to initial GFile
		onInit: function() {
			this._oResourceBundle = this.getResourceBundle();

			this.getView().setModel(new JSONModel({
				// "maximumFilenameLength": 55,
				"maximumFileSize": 1000,
				"mode": MobileLibrary.ListMode.SingleSelectMaster,
				"uploadEnabled": true,
				"uploadButtonVisible": true,
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
			
			// Set model file types to check upload
			this.getView().setModel(new JSONModel({
				"items": ["pdf", "doc", "docx", "xls", "xlsx", "rar", "zip"],
				"selected": ["pdf", "doc", "docx", "xls", "xlsx", "rar", "zip"]
			}), "fileTypes");

			var oViewModel = new JSONModel({
				busy: false,
				delay: 0
			});
			this.setModel(oViewModel, "edit");
			this.getRouter().getRoute("edit").attachPatternMatched(this._onObjectMatched, this);
			this.byId("UploadCollection").addEventDelegate({
				onBeforeRendering: function() {
					this.byId("attachmentTitle").setText(this.getAttachmentTitleText());
				}.bind(this)
			});
		},
		
		/**
		 * Change mode edit or display
		 * */
		onChangeMode: function(oEvent) {
			if (oEvent.getSource().getState()) {
				if (this.getView().byId("status").getSelectedKey() === "E0008") {
					this.getView().byId("switchMode").setState(false);
				}
				else {
					this.onChangeTicket(oEvent);
				}
			} else {
				this.onDisplay(oEvent);
			}
		},

		onCancel: function() {
			if (this.getView().byId("switchMode").getState()) {
				this._showConfirmQuitChanges();
			} else {
				this._resetDefaultVal();
				this.onDisplay(null);
				this._navBack();
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
						that.onDisplay(null);
						that._navBack();
					}
				}
			});
		},

		_resetDefaultVal: function() {
			this.getView().byId("switchMode").setState(false);
			var oModel = this.getOwnerComponent().getModel();
			oModel.resetChanges();
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
		
		onHome: function(){
			this._resetDefaultVal();
			this.onDisplay(null);
			this.getRouter().getTargets().display("object");	
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

		onFileDeleted: function(oEvent) {
			this.deleteItemById(oEvent.getParameter("documentId"));
		},

		deleteItemById: function(sItemToDeleteId) {
			var oUploadCollection = this.byId("UploadCollection");
			var listItems = oUploadCollection.getItems();
			var fileName = "";

			for (var i = 0; i < listItems.length; i++) {
				if (listItems[i].getProperty("documentId") === sItemToDeleteId) {
					fileName = listItems[i].getProperty("fileName");
					oUploadCollection.removeItem(listItems[i]);
				}
			}
			jQuery.each(GFile, function(index) {
				if (fileName !== "" && GFile[index] && GFile[index].NameFile === fileName) {
					GFile.splice(index, 1);
				}
			});

			this.byId("attachmentTitle").setText(this.getAttachmentTitleText());
		},

		onFilenameLengthExceed: function() {},

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

		onUploadComplete: function(oEvent) {
			var oItem = {};
			var sUploadedFile = oEvent.getParameter("files")[0].fileName;
			// at the moment parameter fileName is not set in IE9
			if (!sUploadedFile) {
				var aUploadedFile = (oEvent.getParameters().getSource().getProperty("value")).split(/\" "/);
				sUploadedFile = aUploadedFile[0];
			}
			oItem = {
				"fileName": sUploadedFile,
				"documentId": jQuery.now().toString(),
				"visibleEdit": false
			};

			var newItem = new sap.m.UploadCollectionItem(oItem);
			this.getView().byId("UploadCollection").addItem(newItem);
		},

		onBeforeUploadStarts: function(oEvent) {
			// Header Slug
			var oCustomerHeaderSlug = new UploadCollectionParameter({
				name: "slug",
				value: oEvent.getParameter("fileName")
			});
			oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
			// MessageToast.show("BeforeUploadStarts event triggered.");
		},

		onUploadTerminated: function() {

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

		_onObjectMatched: function(oEvent) {
			this.onDisplay(oEvent);
			var oParameter = oEvent.getParameter("arguments").Guid;
			this.guiId = oParameter;
			this.getModel().metadataLoaded().then(function() {
				this.getView().byId("page").bindElement({
					path: "/ItemSet(Guid='" + oParameter + "')"
				});
			}.bind(this));
		},

		onDisplay: function(oEvent) {
			this.getView().byId("description").setEnabled(false);
			this.getView().byId("priority").setEnabled(false);
			this.getView().byId("impact").setEnabled(false);
			// this.getView().byId("status").setEnabled(false);
			this.getView().byId("text_description").setEnabled(false);
			this.getView().byId("comment").setEnabled(false);
			this.getView().byId("save").setEnabled(false);
			this.getView().byId("cancel").setEnabled(false);
			var items = this.getView().byId("UploadCollection").getItems();
			for (var i = 0; i < items.length; i++) {
				items[i].setEnableDelete(false);
			}
			this.getView().byId("UploadCollection").setUploadButtonInvisible(true);
			this.getView().byId("switchMode").setState(false);
			// this.getView().byId("btnDownloadSelected").setEnabled(false);
		},

		onChangeTicket: function(oEvent) {
			this.getView().byId("description").setEnabled(true);
			this.getView().byId("priority").setEnabled(true);
			this.getView().byId("impact").setEnabled(true);
			// this.getView().byId("status").setEnabled(true);
			this.getView().byId("text_description").setEnabled(true);
			this.getView().byId("comment").setEnabled(true);
			this.getView().byId("save").setEnabled(true);
			this.getView().byId("cancel").setEnabled(true);
			this.getView().byId("UploadCollection").setUploadButtonInvisible(false);
			// this.getView().byId("btnDownloadSelected").setEnabled(true);
			var items = this.getView().byId("UploadCollection").getItems();
			for (var i = 0; i < items.length; i++) {
				items[i].setEnableDelete(true);
			}
			this._initGFile();
		},

		_initGFile: function() {
			if (this.isFirstTime) {
				GFile = [];
				this.isFirstTime = false;
				var oUploadCollection = this.getView().byId("UploadCollection");
				var items = oUploadCollection.getItems();
				if (items.length > 0) {
					for (var i = 0; i < items.length; i++) {
						var IdAtt = items[i].getBindingContext().getObject("IdAtt");
						var IdTicket = items[i].getBindingContext().getObject("IdTicket");
						var NameFile = items[i].getBindingContext().getObject("NameFile");
						var Length = items[i].getBindingContext().getObject("Length");
						var Extention = items[i].getBindingContext().getObject("Extention");
						var Mime = items[i].getBindingContext().getObject("Mime");
						var Content = items[i].getBindingContext().getObject("Content");

						GFile.unshift({
							IdAtt: IdAtt,
							IdTicket: IdTicket,
							NameFile: NameFile,
							Length: Length,
							Extention: Extention,
							Mime: Mime,
							Content: Content
						});
					}
				}
			}
		},

		onDownload: function(oEvt) {
			// Khoi tao GFile khi user nhấn button Download
			this._initGFile();

			var oUploadCollection = this.getView().byId("UploadCollection");
			var aSelectedItems = oUploadCollection.getSelectedItems();
			if (aSelectedItems.length > 0) {
				for (var i = 0; i < aSelectedItems.length; i++) {
					// var oValueDecode = aSelectedItems[i].getBindingContext().getObject("Content");
					// var oFilenameDecode = aSelectedItems[i].getBindingContext().getObject("NameFile");
					var oFilenameDecode = aSelectedItems[i].getProperty("fileName");
					var oValueDecode = "";
					for (var j = 0; j < GFile.length; j++) {
						if (GFile[j].NameFile === oFilenameDecode) {
							oValueDecode = GFile[j].Content;
						}
					}
					var oElement = document.createElement("a");
					oElement.setAttribute("href", "data:application/octet-stream;charset=utf-8;base64," + oValueDecode);
					oElement.setAttribute("download", oFilenameDecode);
					oElement.style.display = "none";
					oElement.click();
				}
			} else {
				MessageBox.information("Select an item to download");
			}
		},

		onNavBack: function() {
			this.onCancel();
		},

		onSave: function(oEvent) {
			var that = this;
			var sUrl = "/sap/opu/odata/sap/ZODATA_FIORI_SOL_SRV/";
			var oDataModel = new sap.ui.model.odata.v2.ODataModel(sUrl, {
				json: true,
				loadMetadataAsync: true
			});

			var description = this.getView().byId("description").getValue();
			var priority = this.getView().byId("priority").getSelectedKey();
			var impact = this.getView().byId("impact").getSelectedKey();
			// var status = this.getView().byId("status").getSelectedKey();
			var textDescription = this.getView().byId("text_description").getValue();
			var comment = this.getView().byId("comment").getValue();

			if (description === "") {
				MessageBox.warning(this._oResourceBundle.getText("description_required"));
			}

			var oEntry = {};

			oEntry.Guid = this.guiId; // Model update
			oEntry.Priority = priority;
			oEntry.Impact = impact;
			oEntry.Description = description;
			// oEntry.Status = status;
			oEntry.TextDescription = textDescription;
			oEntry.Comment = comment;
			oEntry.ToAttachSet = GFile;

			sap.ui.core.BusyIndicator.show();

			oDataModel.create("/ItemSet", oEntry, {
				success: function(oData, response) {
					sap.ui.core.BusyIndicator.hide();
					if (oData.TicketId !== "") {
						MessageBox.success(that._oResourceBundle.getText("msg_update_success"), {
							onClose: function(oAction) {
								that.onDisplay(null);
							}
						});
					} else {
						MessageBox.success(this._oResourceBundle.getText("msg_update_error"));
					}
				},
				error: function(oError) {
					sap.ui.core.BusyIndicator.hide();
					MessageBox.error(oError.statusText);
				}
			});
		}
	});

});