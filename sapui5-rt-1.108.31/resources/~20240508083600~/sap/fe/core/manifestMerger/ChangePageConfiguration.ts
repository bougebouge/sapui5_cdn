import Log from "sap/base/Log";
import ObjectPath from "sap/base/util/ObjectPath";

export type Change = {
	getContent(): ChangeContent;
};

type ChangeContent = {
	page: string; // ID of the page to be changed
	entityPropertyChange: EntityPropertyChange;
};

type EntityPropertyChange = {
	propertyPath: string; // path to the property to be changed
	operation: string; // only UPSERT supported
	propertyValue: string | Object; //what to be changed
};

export function applyChange(manifest: any, change: Change): any {
	const changeContent = change.getContent();
	const pageID = changeContent?.page;
	const targets = manifest["sap.ui5"]?.routing?.targets || {};
	let pageSettings;
	const propertyChange = changeContent?.entityPropertyChange;

	// return unmodified manifest in case change not valid
	if (
		propertyChange?.operation !== "UPSERT" ||
		!propertyChange?.propertyPath ||
		propertyChange?.propertyValue === undefined ||
		propertyChange?.propertyPath.startsWith("/")
	) {
		Log.error("Change content is not a valid");
		return manifest;
	}

	for (const p in targets) {
		if (targets[p].id === pageID) {
			if (targets[p].name?.startsWith("sap.fe.templates.")) {
				pageSettings = targets[p]?.options?.settings || {};
				break;
			}
		}
	}

	if (!pageSettings) {
		Log.error(`No Fiori elements page with ID ${pageID} found in routing targets.`);
		return manifest;
	}

	let propertyPath = propertyChange.propertyPath.split("/");
	if (propertyPath[0] === "controlConfiguration") {
		let annotationPath = "";
		// the annotation path in the control configuration has to stay together. For now rely on the fact the @ is in the last part
		for (let i = 1; i < propertyPath.length; i++) {
			annotationPath += (i > 1 ? "/" : "") + propertyPath[i];
			if (annotationPath.indexOf("@") > -1) {
				propertyPath = ["controlConfiguration", annotationPath].concat(propertyPath.slice(i + 1));
				break;
			}
		}
	}
	ObjectPath.set(propertyPath, propertyChange.propertyValue, pageSettings);

	return manifest;
}
