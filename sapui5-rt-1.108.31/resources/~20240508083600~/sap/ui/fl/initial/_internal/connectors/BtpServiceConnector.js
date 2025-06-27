/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/base/util/merge","sap/ui/fl/initial/_internal/connectors/KeyUserConnector","sap/ui/fl/Layer"],function(a,e,r){"use strict";var i="/flex/all";var n="/v3";var s=i+n;var t=a({},e,{layers:[r.CUSTOMER,r.PUBLIC,r.USER],ROOT:s,ROUTES:{DATA:s+"/data",SETTINGS:s+"/settings"}});return t});
//# sourceMappingURL=BtpServiceConnector.js.map