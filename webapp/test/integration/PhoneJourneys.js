jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/test/Opa5",
	"solman/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"solman/test/integration/pages/App",
	"solman/test/integration/pages/Browser",
	"solman/test/integration/pages/Master",
	"solman/test/integration/pages/Detail",
	"solman/test/integration/pages/NotFound"
], function(Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "solman.view."
	});

	sap.ui.require([
		"solman/test/integration/NavigationJourneyPhone",
		"solman/test/integration/NotFoundJourneyPhone",
		"solman/test/integration/BusyJourneyPhone"
	], function() {
		QUnit.start();
	});
});