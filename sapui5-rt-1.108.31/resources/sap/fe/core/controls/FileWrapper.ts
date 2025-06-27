import CommonUtils from "sap/fe/core/CommonUtils";
import { aggregation, defineUI5Class, property } from "sap/fe/core/helpers/ClassSupport";
import ResourceModel from "sap/fe/macros/ResourceModel";
import type Avatar from "sap/m/Avatar";
import BusyDialog from "sap/m/BusyDialog";
import type Button from "sap/m/Button";
import type Link from "sap/m/Link";
import type Text from "sap/m/Text";
import type Icon from "sap/ui/core/Icon";
import type { URI } from "sap/ui/core/library";
import type RenderManager from "sap/ui/core/RenderManager";
import type Context from "sap/ui/model/Context";
import type V4Context from "sap/ui/model/odata/v4/Context";
import type FileUploader from "sap/ui/unified/FileUploader";
import FieldWrapper from "./FieldWrapper";

@defineUI5Class("sap.fe.core.controls.FileWrapper")
class FileWrapper extends FieldWrapper {
	@property({ type: "sap.ui.core.URI" })
	uploadUrl!: URI;
	@property({ type: "sap.ui.model.Context" })
	parentEntitySet!: Context;
	@property({ type: "sap.ui.model.Context" })
	parentEntityType!: Context;
	@property({ type: "string" })
	propertyPath!: string;
	@property({ type: "string" })
	filename!: string;
	@property({ type: "string" })
	mediaType!: string;
	@aggregation({ type: "sap.m.Avatar", multiple: false })
	avatar!: Avatar;
	@aggregation({ type: "sap.ui.core.Icon", multiple: false })
	icon!: Icon;
	@aggregation({ type: "sap.m.Link", multiple: false })
	link!: Link;
	@aggregation({ type: "sap.m.Text", multiple: false })
	text!: Text;
	@aggregation({ type: "sap.ui.unified.FileUploader", multiple: false })
	fileUploader!: FileUploader;
	@aggregation({ type: "sap.m.Button", multiple: false })
	deleteButton!: Button;
	private _busy: boolean = false;
	private busyDialog?: BusyDialog;

	getAccessibilityInfo() {
		const accInfo = [];
		if (this.avatar) {
			accInfo.push(this.avatar);
		}
		if (this.icon) {
			accInfo.push(this.icon);
		}
		if (this.link) {
			accInfo.push(this.link);
		}
		if (this.text) {
			accInfo.push(this.text);
		}
		if (this.fileUploader) {
			accInfo.push(this.fileUploader);
		}
		if (this.deleteButton) {
			accInfo.push(this.deleteButton);
		}
		return { children: accInfo };
	}

	onBeforeRendering() {
		this._setAriaLabels();
		this._addSideEffects();
	}

	_setAriaLabels() {
		this._setAriaLabelledBy(this.avatar);
		this._setAriaLabelledBy(this.icon);
		this._setAriaLabelledBy(this.link);
		this._setAriaLabelledBy(this.text);
		this._setAriaLabelledBy(this.fileUploader);
		this._setAriaLabelledBy(this.deleteButton);
	}

	_addSideEffects() {
		// add SideEffects for stream content, filename and mediatype
		let sourceProperty = "",
			sourcePath = "",
			path = "",
			parentEntitySetWithSlash = "";
		const navigationProperties: object[] = [];
		this.getCustomData().forEach(function (item: any) {
			if (item.getProperty("key") === "sourcePath") {
				sourcePath = item.getProperty("value");
			}
		});
		parentEntitySetWithSlash = `/${this.parentEntitySet}/`;
		sourceProperty = sourcePath.substring(
			sourcePath.indexOf(parentEntitySetWithSlash) + parentEntitySetWithSlash.length,
			sourcePath.length
		);
		path = sourceProperty.replace(this.propertyPath, "");
		navigationProperties.push({ "$NavigationPropertyPath": sourceProperty });
		if (this.filename) {
			navigationProperties.push({ "$NavigationPropertyPath": path + this.filename });
		}
		if (this.mediaType) {
			navigationProperties.push({ "$NavigationPropertyPath": path + this.mediaType });
		}
		this._getSideEffectController().addControlSideEffects(this.parentEntityType, {
			SourceProperties: sourceProperty,
			TargetEntities: navigationProperties,
			sourceControlId: this.getId()
		});
	}
	_getSideEffectController() {
		const controller = this._getViewController();
		return controller ? controller._sideEffects : undefined;
	}
	_getViewController() {
		const view = CommonUtils.getTargetView(this);
		return view && view.getController();
	}
	getUploadUrl() {
		// set upload url as canonical url for NavigationProperties
		// this is a workaround as some backends cannot resolve NavigationsProperties for stream types
		const context = this.getBindingContext() as V4Context;
		return context && this.uploadUrl ? this.uploadUrl.replace(context.getPath(), context.getCanonicalPath()) : "";
	}
	setUIBusy(busy: boolean) {
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const that = this;
		this._busy = busy;
		if (busy) {
			if (!this.busyDialog) {
				this.busyDialog = new BusyDialog({
					text: ResourceModel.getText("M_FILEWRAPPER_BUSY_DIALOG_TITLE"),
					showCancelButton: false
				});
			}
			setTimeout(function () {
				if (that._busy) {
					that.busyDialog?.open();
				}
			}, 1000);
		} else {
			this.busyDialog?.close(false);
		}
	}
	getUIBusy() {
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		return this._busy;
	}
	static render(renderManager: RenderManager, fileWrapper: FileWrapper) {
		renderManager.openStart("div", fileWrapper); // FileWrapper control div
		renderManager.style("width", fileWrapper.width);
		renderManager.openEnd();

		// Outer Box
		renderManager.openStart("div"); // div for all controls
		renderManager.style("display", "flex");
		renderManager.style("box-sizing", "border-box");
		renderManager.style("justify-content", "space-between");
		renderManager.style("align-items", "center");
		renderManager.style("flex-wrap", "wrap");
		renderManager.style("align-content", "stretch");
		renderManager.style("width", "100%");
		renderManager.openEnd();

		// Display Mode
		renderManager.openStart("div"); // div for controls shown in Display mode
		renderManager.style("display", "flex");
		renderManager.style("align-items", "center");
		renderManager.openEnd();

		if (fileWrapper.avatar) {
			renderManager.renderControl(fileWrapper.avatar); // render the Avatar Control
		} else {
			renderManager.renderControl(fileWrapper.icon); // render the Icon Control
			renderManager.renderControl(fileWrapper.link); // render the Link Control
			renderManager.renderControl(fileWrapper.text); // render the Text Control for empty file indication
		}
		renderManager.close("div"); // div for controls shown in Display mode

		// Additional content for Edit Mode
		renderManager.openStart("div"); // div for controls shown in Display + Edit mode
		renderManager.style("display", "flex");
		renderManager.style("align-items", "center");
		renderManager.openEnd();
		renderManager.renderControl(fileWrapper.fileUploader); // render the FileUploader Control
		renderManager.renderControl(fileWrapper.deleteButton); // render the Delete Button Control
		renderManager.close("div"); // div for controls shown in Display + Edit mode

		renderManager.close("div"); // div for all controls

		renderManager.close("div"); // end of the complete Control
	}
	destroy(bSuppressInvalidate: boolean) {
		const oSideEffects = this._getSideEffectController();
		if (oSideEffects) {
			oSideEffects.removeControlSideEffects(this);
		}
		delete this.busyDialog;
		FieldWrapper.prototype.destroy.apply(this, [bSuppressInvalidate]);
	}
}

export default FileWrapper;
