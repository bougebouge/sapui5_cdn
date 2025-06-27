import type AppComponent from "sap/fe/core/AppComponent";
import Component from "sap/ui/core/Component";
import Core from "sap/ui/core/Core";
import type View from "sap/ui/core/mvc/View";
import type { V4Context } from "types/extension_types";

export enum UserStatus {
	NotYetInvited = 0,
	NoChangesMade = 1,
	ChangesMade = 2,
	CurrentlyEditing = 3
}

export enum UserEditingState {
	NoChanges = "N",
	InProgress = "P"
}

export type User = {
	id: string;
	initials?: string;
	name: string;
	color?: number;
	transient?: boolean;
	status?: UserStatus;
	me?: boolean;
	initialName?: string;
};

// backend representation of a user according to collaboration draft spec
export type BackendUser = {
	UserID: string;
	UserAccessRole: string;
	UserEditingState?: UserEditingState;
	UserDescription?: string;
};

export type UserActivity = User & {
	key?: string;
};

export enum Activity {
	Join = "JOIN",
	JoinEcho = "JOINECHO",
	Leave = "LEAVE",
	Change = "CHANGE",
	Create = "CREATE",
	Delete = "DELETE",
	Action = "ACTION",
	LiveChange = "LIVECHANGE",
	Activate = "ACTIVATE",
	Discard = "DISCARD",
	Undo = "UNDO"
}

export type Message = {
	userDescription: string;
	userID: string;
	userAction: string;
	clientAction: string;
	clientContent: string;
};

function formatInitials(fullName: string): string {
	// remove titles - those are the ones from S/4 to be checked if there are others
	const academicTitles = ["Dr.", "Prof.", "Prof. Dr.", "B.A.", "MBA", "Ph.D."];
	academicTitles.forEach(function (academicTitle) {
		fullName = fullName.replace(academicTitle, "");
	});

	let initials: string;
	const parts = fullName.trimStart().split(" ");

	if (parts.length > 1) {
		initials = (parts?.shift()?.charAt(0) || "") + parts.pop()?.charAt(0);
	} else {
		initials = fullName.substring(0, 2);
	}

	return initials.toUpperCase();
}

function getUserColor(UserID: string, activeUsers: User[], invitedUsers: User[]) {
	// search if user is known
	const user = activeUsers.find((u) => u.id === UserID);
	if (user) {
		return user.color;
	} else {
		// search for next free color
		for (let i = 1; i <= 10; i++) {
			if (activeUsers.findIndex((u) => u.color === i) === -1 && invitedUsers.findIndex((u) => u.color === i) === -1) {
				return i;
			}
		}
		// this seems to be a popular object :) for now just return 10 for all.
		// for invited we should start from 1 again so the colors are different
		return 10;
	}
}

// copied from CommonUtils. Due to a cycle dependency I can't use CommonUtils here.
// That's to be fixed. the discard popover thingy shouldn't be in the common utils at all
function getAppComponent(oControl: any): AppComponent {
	if (oControl.isA("sap.fe.core.AppComponent")) {
		return oControl;
	}
	const oOwner = Component.getOwnerComponentFor(oControl);
	if (!oOwner) {
		return oControl;
	} else {
		return getAppComponent(oOwner);
	}
}

function getMe(view: View): User {
	const shellServiceHelper = getAppComponent(view).getShellServices();
	if (!shellServiceHelper || !shellServiceHelper.hasUShell()) {
		throw "No Shell... No User";
	}
	return {
		initials: shellServiceHelper.getUser().getInitials(),
		id: shellServiceHelper.getUser().getId(),
		name: `${shellServiceHelper.getUser().getFullName()} (${getText("C_COLLABORATIONDRAFT_YOU")})`,
		initialName: shellServiceHelper.getUser().getFullName(),
		color: 6, //  same color as FLP...
		me: true,
		status: UserStatus.CurrentlyEditing
	};
}

export function getText(textId: string, ...args: string[]): string {
	const oResourceModel = Core.getLibraryResourceBundle("sap.fe.core");
	return oResourceModel.getText(textId, args);
}

export const CollaborationUtils = {
	formatInitials: formatInitials,
	getUserColor: getUserColor,
	getMe: getMe,
	getAppComponent: getAppComponent,
	getText: getText
};

export function shareObject(bindingContext: V4Context, users: BackendUser[] = []): Promise<void> {
	const model = bindingContext.getModel();
	const metaModel = model.getMetaModel();
	const entitySet = metaModel.getMetaPath(bindingContext as any);
	const shareActionName = metaModel.getObject(`${entitySet}@com.sap.vocabularies.Common.v1.DraftRoot/ShareAction`);
	const shareAction = model.bindContext(`${shareActionName}(...)`, bindingContext);
	shareAction.setParameter("Users", users);
	shareAction.setParameter("ShareAll", true);
	return shareAction.execute();
}
