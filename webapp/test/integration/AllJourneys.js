jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

// We cannot provide stable mock data out of the template.
// If you introduce mock data, by adding .json files in your webapp/localService/mockdata folder you have to provide the following minimum data:
// * At least 3 ItemSet in the list
// * All 3 ItemSet have at least one ToAttachSet

sap.ui.require([
	"sap/ui/test/Opa5",
	"solman/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"solman/test/integration/pages/App",
	"solman/test/integration/pages/Browser",
	"solman/test/integration/pages/Master",
	"solman/test/integration/pages/Detail",
	"solman/test/integration/pages/Create",
	"solman/test/integration/pages/NotFound"
], function(Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "solman.view."
	});

	sap.ui.require([
		"solman/test/integration/MasterJourney",
		"solman/test/integration/NavigationJourney",
		"solman/test/integration/NotFoundJourney",
		"solman/test/integration/BusyJourney",
		"solman/test/integration/FLPIntegrationJourney"
	], function() {
		QUnit.start();
	});
});