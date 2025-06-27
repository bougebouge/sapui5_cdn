/**
 * Collection of formatters needed for the collaboration draft.
 *
 * @param {object} this The context
 * @param {string} sName The inner function name
 * @param {object[]} oArgs The inner function parameters
 * @returns {object} The value from the inner function
 */

const collaborationFormatters = function (this: object, sName: string, ...oArgs: any[]): any {
	if (collaborationFormatters.hasOwnProperty(sName)) {
		return (collaborationFormatters as any)[sName].apply(this, oArgs);
	} else {
		return "";
	}
};
export const hasCollaborationActivity = (activities: any, ...keys: any[]): boolean | undefined => {
	return !!getCollaborationActivity(activities, ...keys);
};
hasCollaborationActivity.__functionName = "sap.fe.core.formatters.CollaborationFormatter#hasCollaborationActivity";

export const getCollaborationActivityInitials = (activities: any, ...keys: any[]): string | undefined => {
	const activity = getCollaborationActivity(activities, ...keys);
	return activity?.initials || undefined;
};
getCollaborationActivityInitials.__functionName = "sap.fe.core.formatters.CollaborationFormatter#getCollaborationActivityInitials";

export const getCollaborationActivityColor = (activities: any, ...keys: any[]): string | undefined => {
	const activity = getCollaborationActivity(activities, ...keys);
	return activity?.color ? `Accent${activity.color}` : undefined;
};
getCollaborationActivityColor.__functionName = "sap.fe.core.formatters.CollaborationFormatter#getCollaborationActivityColor";

function getCollaborationActivity(activities: any, ...keys: any[]) {
	if (activities && activities.length > 0) {
		return activities.find(function (activity: any) {
			const activityKeys = activity?.key?.split(",") || [];
			let compareKey = "";
			let splitKeys: string[];

			for (let i = 0; i < activityKeys.length; i++) {
				// take care on short and full notation
				splitKeys = activityKeys[i].split("=");
				compareKey = (splitKeys[1] || splitKeys[0]).split("'").join("");
				if (compareKey !== keys[i]?.toString()) {
					return false;
				}
			}
			return true;
		});
	}
}

collaborationFormatters.hasCollaborationActivity = hasCollaborationActivity;
collaborationFormatters.getCollaborationActivityInitials = getCollaborationActivityInitials;
collaborationFormatters.getCollaborationActivityColor = getCollaborationActivityColor;
/**
 * @global
 */
export default collaborationFormatters;
