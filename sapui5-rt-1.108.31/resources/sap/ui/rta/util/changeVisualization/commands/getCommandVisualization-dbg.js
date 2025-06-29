/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define([
	"sap/ui/rta/util/changeVisualization/commands/RenameVisualization",
	"sap/ui/rta/util/changeVisualization/commands/MoveVisualization",
	"sap/ui/rta/util/changeVisualization/commands/CombineVisualization",
	"sap/ui/rta/util/changeVisualization/commands/SplitVisualization",
	"sap/ui/rta/util/changeVisualization/commands/CreateContainerVisualization"
], function(
	RenameVisualization,
	MoveVisualization,
	CombineVisualization,
	SplitVisualization,
	CreateContainerVisualization
) {
	"use strict";

	var mCommands = {
		rename: RenameVisualization,
		move: MoveVisualization,
		combine: CombineVisualization,
		split: SplitVisualization,
		createContainer: CreateContainerVisualization
	};

	return function(mIndicatorInformation) {
		var sCommandName = mIndicatorInformation.commandName;

		// Settings commands can be assigned to existing categories
		// (e.g. "move" to display the "Show Source" button)
		if (sCommandName === "settings") {
			sCommandName = mIndicatorInformation.changeCategory;
		}
		return mCommands[sCommandName];
	};
});