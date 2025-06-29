/*!
 * SAPUI5
 * (c) Copyright 2009-2022 SAP SE. All rights reserved.
 */
jQuery.sap.declare("sap.uiext.inbox.InboxConstants");
jQuery.sap.require("sap.ui.core.IconPool");
sap.uiext.inbox.InboxConstants = function(){
};

sap.uiext.inbox.InboxConstants.prototype = jQuery.sap.newObject(sap.ui.base.Object.prototype);

sap.uiext.inbox.InboxConstants.mEntities = {
		taskMetadata: { 
			propertiesLabel: ["INBOX_TASK_TITLE","INBOX_START_DATE","INBOX_CREATED_BY_NAME","INBOX_DUE_DATE","INBOX_STATUS","INBOX_PRIORITY"],
			properties: ["TaskTitle","CreatedOn","CreatedByName","CompletionDeadLine","Status","Priority"],
			customAttributes: []
		},
		todoMetadata: { 
			propertiesLabel: ["INBOX_TASK_TITLE","INBOX_START_DATE","INBOX_CREATED_BY_NAME","INBOX_STATUS","INBOX_PRIORITY"],
			properties: ["TaskTitle","CreatedOn","CreatedByName","Status","Priority"],
			customAttributes: []
		},
		alertMetadata: { 
			propertiesLabel: ["INBOX_TASK_TITLE","INBOX_START_DATE","INBOX_CREATED_BY_NAME","INBOX_STATUS","INBOX_PRIORITY"],
			properties: ["TaskTitle","CreatedOn","CreatedByName","Status","Priority"],
			customAttributes: []
		},
		notificationMetadata: { 
			propertiesLabel: ["INBOX_TASK_TITLE","INBOX_START_DATE","INBOX_CREATED_BY_NAME","INBOX_STATUS","INBOX_PRIORITY"],
			properties: ["TaskTitle","CreatedOn","CreatedByName","Status","Priority"],
			customAttributes: []
		}
		
};

sap.uiext.inbox.InboxConstants.TABLE_VIEW_TECH_NAMES = {
		INBOX_TABLE_VIEW_TASK_TITLE:"TaskTitle",
		INBOX_TABLE_VIEW_CREATION_DATE:"CreatedOn",
		INBOX_CREATED_BY_NAME:"CreatedByName",
		INBOX_TABLE_VIEW_DUE_DATE:"CompletionDeadLine",
		INBOX_TABLE_VIEW_STATUS:"Status",
		INBOX_TABLE_VIEW_PRIORITY:"Priority"
};

sap.uiext.inbox.InboxConstants.iconPool = sap.ui.core.IconPool;
sap.uiext.inbox.InboxConstants.tableViewImageSelected = sap.ui.core.IconPool.getIconURI("table-view");
sap.uiext.inbox.InboxConstants.rrViewImageSelected = sap.ui.core.IconPool.getIconURI("list");
sap.uiext.inbox.InboxConstants.filterViewImage = sap.ui.core.IconPool.getIconURI("filter");
sap.uiext.inbox.InboxConstants.nxtBtnImage = "next.png";
sap.uiext.inbox.InboxConstants.prevBtnImage = "previous.png";
sap.uiext.inbox.InboxConstants.refreshImage = sap.ui.core.IconPool.getIconURI("refresh");
sap.uiext.inbox.InboxConstants.loaderImage = "loader_ani.gif";
sap.uiext.inbox.InboxConstants.completeImage = "complete_action.png";
sap.uiext.inbox.InboxConstants.claimImage = "claim_action.png";
sap.uiext.inbox.InboxConstants.releaseImage = "release_action.png";
sap.uiext.inbox.InboxConstants.forwardTaskImage = "forwardTask.png"
sap.uiext.inbox.InboxConstants.settingsImage = "settings_button_regular.png";
sap.uiext.inbox.InboxConstants.settingsImageHover = "settings_button_hover.png";
sap.uiext.inbox.InboxConstants.sapLogo = "sap_logo.gif";
sap.uiext.inbox.InboxConstants.taskInitiatorDefaultImage = "taskInitiator_default.png";
sap.uiext.inbox.InboxConstants.attachmentsImage = "attachment.png";
sap.uiext.inbox.InboxConstants.commentsImage = sap.ui.core.IconPool.getIconURI("comment");
sap.uiext.inbox.InboxConstants.customAttributesImage = "custom_attributes.png";
sap.uiext.inbox.InboxConstants.COLON = ":";
sap.uiext.inbox.InboxConstants.DOT = String.fromCharCode(183);//ASCII Character Middle DOT "·".
sap.uiext.inbox.InboxConstants.WHITESPACE = String.fromCharCode(0);
sap.uiext.inbox.InboxConstants.LESS_THAN = String.fromCharCode(60); //ASCII Character for "<"
sap.uiext.inbox.InboxConstants.GREATER_THAN = String.fromCharCode(62); //ASCII Character for ">"
sap.uiext.inbox.InboxConstants.sortAscImage = sap.ui.core.IconPool.getIconURI("up");
sap.uiext.inbox.InboxConstants.sortDescImage = sap.ui.core.IconPool.getIconURI("down");
sap.uiext.inbox.InboxConstants.SPACE = " ";
sap.uiext.inbox.InboxConstants.EQUALS = "=";
sap.uiext.inbox.InboxConstants.taskCategoryImage = "task.png";
sap.uiext.inbox.InboxConstants.alertCategoryImage = "alert.png";
sap.uiext.inbox.InboxConstants.notificationCategoryImage = "notification.png";
sap.uiext.inbox.InboxConstants.rrViewAlertCategoryImage = "rr_view_alert.png";
sap.uiext.inbox.InboxConstants.rrViewNotificationCategoryImage = "rr_view_notification.png";
sap.uiext.inbox.InboxConstants.todoCategoryImage = "todo.png";
sap.uiext.inbox.InboxConstants.rrViewTodoCategoryImage = "rr_view_todo.png";

sap.uiext.inbox.InboxConstants.defaultView_URLParameter = "sap-ui-inbox-defaultView";
sap.uiext.inbox.InboxConstants.tableViewRowCount_URLParameter = "sap-ui-inbox-tableViewRowCount";
sap.uiext.inbox.InboxConstants.rrViewRowCount_URLParameter = "sap-ui-inbox-rrViewRowCount";
sap.uiext.inbox.InboxConstants.async_URLParameter = "async";

sap.uiext.inbox.InboxConstants.statusTooltip = {COMPLETED: "INBOX_FILTER_STATUS_COMPLETED",
   	READY: "INBOX_FILTER_STATUS_READY",
   	RESERVED: "INBOX_FILTER_STATUS_RESERVED",
   	IN_PROGRESS: "INBOX_FILTER_STATUS_IN_PROGRESS",
   	SELECTED: "INBOX_FILTER_STATUS_RESERVED",
   	STARTED: "INBOX_FILTER_STATUS_IN_PROGRESS",
   	COMMITTED : "INBOX_FILTER_STATUS_COMPLETED"
   	};

sap.uiext.inbox.InboxConstants.prioTooltip = {VERY_HIGH: "INBOX_FILTER_PRIORITY_VERY_HIGH",
		HIGH: "INBOX_FILTER_PRIORITY_HIGH",
		MEDIUM: "INBOX_FILTER_PRIORITY_MEDIUM",
		LOW: "INBOX_FILTER_PRIORITY_LOW",
		1: "INBOX_FILTER_PRIORITY_VERY_HIGH",
		2: "INBOX_FILTER_PRIORITY_VERY_HIGH",
		3: "INBOX_FILTER_PRIORITY_HIGH",
		4: "INBOX_FILTER_PRIORITY_HIGH",
		5: "INBOX_FILTER_PRIORITY_MEDIUM",
		6: "INBOX_FILTER_PRIORITY_LOW",
		7: "INBOX_FILTER_PRIORITY_LOW",
		8: "INBOX_FILTER_PRIORITY_LOW",
		9: "INBOX_FILTER_PRIORITY_LOW"};

sap.uiext.inbox.InboxConstants.statusImages = {COMPLETED: "completed_status.png",
			   	READY: "ready_status.png",
			   	RESERVED: "reserved_status.png",
			   	IN_PROGRESS: "inprocess_status.png",
			   	SELECTED: "reserved_status.png",
			   	STARTED: "inprocess_status.png",
			   	COMMITTED : "completed_status.png"};

sap.uiext.inbox.InboxConstants.prioImages = {VERY_HIGH: "very_high_priority.png",
   				HIGH: "high_priority.png",
   				MEDIUM: "medium_priority.png",
   				LOW: "low_priority.png",
   				1: "very_high_priority.png",
   				2: "very_high_priority.png",
   				3: "high_priority.png",
   				4: "high_priority.png",
   				5: "medium_priority.png",
   				6: "low_priority.png",
   				7: "low_priority.png",
   				8: "low_priority.png",
   				9: "low_priority.png"};

sap.uiext.inbox.InboxConstants.taskCategoryImages = {TASK: sap.ui.core.IconPool.getIconURI("task"), 
	
		ALERT: sap.ui.core.IconPool.getIconURI("alert"),
	    NOTIFICATION: sap.ui.core.IconPool.getIconURI("notification-2"),
	    TODO: sap.ui.core.IconPool.getIconURI("activity-2")
};

sap.uiext.inbox.InboxConstants.taskCategoryToolTip = {TASK: "INBOX_TASK_CATEGORY",
	ALERT: "INBOX_ALERT_CATEGORY",
	NOTIFICATION: "INBOX_NOTIFICATION_CATEGORY",
	TODO: "INBOX_TODO_CATEGORY"
};

sap.uiext.inbox.InboxConstants.messageTypeIcons = { error: sap.ui.core.IconPool.getIconURI("alert"),

	warning: sap.ui.core.IconPool.getIconURI("warning"),	
	success: sap.ui.core.IconPool.getIconURI("sys-enter-2"),
    info: sap.ui.core.IconPool.getIconURI("hint")
	};
sap.uiext.inbox.InboxConstants.statusMap={
		COMPLETED: "INBOX_FILTER_STATUS_COMPLETED",
	   	READY: "INBOX_FILTER_STATUS_READY",
	   	RESERVED: "INBOX_FILTER_STATUS_RESERVED",
	   	IN_PROGRESS: "INBOX_FILTER_STATUS_IN_PROGRESS"
		
};

sap.uiext.inbox.InboxConstants.messageTypeToolTip = {error: "INBOX_MSG_STATUS_ERROR",
		warning: "INBOX_MSG_STATUS_WARN",
		success: "INBOX_MSG_STATUS_SUCCESS",
		info: "INBOX_MSG_STATUS_INFO"
		};

sap.uiext.inbox.InboxConstants.mRRSortMap = {li_creationDate: "sortByStartDate",
		li_status: "sortByStatus",
		li_taskTitle : "sortByTaskTitle"
		};

sap.uiext.inbox.InboxConstants.closeImg= sap.ui.core.IconPool.getIconURI("decline");
sap.uiext.inbox.InboxConstants.closeHovImg= "close_hover.png";

sap.uiext.inbox.InboxConstants.filterKeysMetaMap = {
		INBOX_FILTER_PRIORITY : ["lowPrio","medPrio","hiPrio","veryhiPrio"],
		INBOX_FILTER_STATUS : ["resStat","readyStat","InProStat"],
		INBOX_FILTER_CREATION_DATE : ["today","last30","last15","last7"],
		INBOX_FILTER_DUE_DATETIME : ["dueDateToday","dueDatenext30","dueDatenext15","dueDatenext7"],
		INBOX_FILTER_CATEGORY : ["taskCategory", "todoCategory", "alertCategory", "notificationCategory"]
};

sap.uiext.inbox.InboxConstants.filterKeysMetaMapWithNoDueDate = {
		INBOX_FILTER_PRIORITY : ["lowPrio","medPrio","hiPrio","veryhiPrio"],
		INBOX_FILTER_STATUS : ["resStat","readyStat","InProStat"],
		INBOX_FILTER_CREATION_DATE : ["today","last30","last15","last7"],
		INBOX_FILTER_DUE_DATETIME : ["dueDateToday","dueDatenext30","dueDatenext15","dueDatenext7", "noDueDate"],
		INBOX_FILTER_CATEGORY : ["taskCategory", "todoCategory", "alertCategory", "notificationCategory"]
};

sap.uiext.inbox.InboxConstants.aFilterMetaData = [
		{name: "INBOX_FILTER_TASK_TYPE", attributes: []},
		{name: "INBOX_FILTER_PRIORITY", attributes: ["INBOX_FILTER_PRIORITY_LOW","INBOX_FILTER_PRIORITY_MEDIUM","INBOX_FILTER_PRIORITY_HIGH","INBOX_FILTER_PRIORITY_VERY_HIGH"]},
		{name: "INBOX_FILTER_STATUS", attributes: ["INBOX_FILTER_STATUS_READY","INBOX_FILTER_STATUS_RESERVED","INBOX_FILTER_STATUS_IN_PROGRESS"]},
		{name: "INBOX_FILTER_CREATION_DATE", attributes: ["INBOX_FILTER_DATETIME_TODAY","INBOX_FILTER_DATETIME_WEEK","INBOX_FILTER_DATETIME_15DAYS","INBOX_FILTER_DATETIME_MONTH"]},
		{name: "INBOX_FILTER_DUE_DATETIME", attributes: ["INBOX_FILTER_DUE_DATETIME_TODAY","INBOX_FILTER_DUE_DATETIME_WEEK","INBOX_FILTER_DUE_DATETIME_15DAYS","INBOX_FILTER_DUE_DATETIME_MONTH"]}
];

sap.uiext.inbox.InboxConstants.aFilterMetaDataWithNoDueDate = [
		{name: "INBOX_FILTER_TASK_TYPE", attributes: []},
		{name: "INBOX_FILTER_PRIORITY", attributes: ["INBOX_FILTER_PRIORITY_LOW","INBOX_FILTER_PRIORITY_MEDIUM","INBOX_FILTER_PRIORITY_HIGH","INBOX_FILTER_PRIORITY_VERY_HIGH"]},
		{name: "INBOX_FILTER_STATUS", attributes: ["INBOX_FILTER_STATUS_READY","INBOX_FILTER_STATUS_RESERVED","INBOX_FILTER_STATUS_IN_PROGRESS"]},
		{name: "INBOX_FILTER_CREATION_DATE", attributes: ["INBOX_FILTER_DATETIME_TODAY","INBOX_FILTER_DATETIME_WEEK","INBOX_FILTER_DATETIME_15DAYS","INBOX_FILTER_DATETIME_MONTH"]},
		{name: "INBOX_FILTER_DUE_DATETIME", attributes: ["INBOX_FILTER_DUE_DATETIME_TODAY","INBOX_FILTER_DUE_DATETIME_WEEK","INBOX_FILTER_DUE_DATETIME_15DAYS","INBOX_FILTER_DUE_DATETIME_MONTH", "INBOX_FILTER_NO_DUE_DATETIME"]}
];
				
sap.uiext.inbox.InboxConstants.aDrillDownFilterMetadata  = [
		{name: "INBOX_FILTER_CATEGORY", attributes: ["INBOX_FILTER_CATEGORY_TASKS", "INBOX_FILTER_CATEGORY_TODO", "INBOX_FILTER_CATEGORY_ALERT", "INBOX_FILTER_CATEGORY_NOTIFICATION"]},
		{name: "INBOX_FILTER_TASK_TYPE", attributes: []},
		{name: "INBOX_FILTER_PRIORITY", attributes: ["INBOX_FILTER_PRIORITY_LOW","INBOX_FILTER_PRIORITY_MEDIUM","INBOX_FILTER_PRIORITY_HIGH","INBOX_FILTER_PRIORITY_VERY_HIGH"]},
		{name: "INBOX_FILTER_STATUS", attributes: ["INBOX_FILTER_STATUS_READY","INBOX_FILTER_STATUS_RESERVED","INBOX_FILTER_STATUS_IN_PROGRESS"]},
		{name: "INBOX_FILTER_CREATION_DATE", attributes: ["INBOX_FILTER_DATETIME_TODAY","INBOX_FILTER_DATETIME_WEEK","INBOX_FILTER_DATETIME_15DAYS","INBOX_FILTER_DATETIME_MONTH"]},
		{name: "INBOX_FILTER_DUE_DATETIME", attributes: ["INBOX_FILTER_DUE_DATETIME_TODAY","INBOX_FILTER_DUE_DATETIME_WEEK","INBOX_FILTER_DUE_DATETIME_15DAYS","INBOX_FILTER_DUE_DATETIME_MONTH"]}
];

sap.uiext.inbox.InboxConstants.aDependentDrillDownFiltersBasedOnCategory  = {
		aFilterMetadataForCategoryTask: [
		        "INBOX_FILTER_CATEGORY", "INBOX_FILTER_TASK_TYPE", "INBOX_FILTER_PRIORITY", "INBOX_FILTER_STATUS", "INBOX_FILTER_CREATION_DATE", "INBOX_FILTER_DUE_DATETIME"
		        ],
		aFilterMetadataForCategoryTodo: [
		        "INBOX_FILTER_CATEGORY", "INBOX_FILTER_TASK_TYPE", "INBOX_FILTER_STATUS", "INBOX_FILTER_CREATION_DATE"
		        ],
		aFilterMetadataForCategoryAlert: [
		        "INBOX_FILTER_CATEGORY", "INBOX_FILTER_TASK_TYPE", "INBOX_FILTER_PRIORITY", "INBOX_FILTER_STATUS", "INBOX_FILTER_CREATION_DATE"
		        ],
		aFilterMetadataForCategoryNotification: [
		        "INBOX_FILTER_CATEGORY", "INBOX_FILTER_TASK_TYPE", "INBOX_FILTER_PRIORITY", "INBOX_FILTER_STATUS", "INBOX_FILTER_CREATION_DATE"
				],
		aFilterMetadataDefault: [
		        "INBOX_FILTER_TASK_TYPE", "INBOX_FILTER_PRIORITY", "INBOX_FILTER_STATUS", "INBOX_FILTER_CREATION_DATE", "INBOX_FILTER_DUE_DATETIME"
				]
};

sap.uiext.inbox.InboxConstants.rightAlignedTypes = ["java.lang.Integer", "java.math.BigDecimal", "java.lang.Long", "java.lang.Float"];
sap.uiext.inbox.InboxConstants.decisionOptionsFunctionImport = "DecisionOptions";
sap.uiext.inbox.InboxConstants.decisionExecutionFunctionImport = "Decision";
sap.uiext.inbox.InboxConstants.claimFunctionImport = "Claim";
sap.uiext.inbox.InboxConstants.releaseFunctionImport = "Release";
sap.uiext.inbox.InboxConstants.addCommentFunctionImport = "AddComment";

sap.uiext.inbox.InboxConstants.tableView = 'sap_inbox_list';
sap.uiext.inbox.InboxConstants.rowRepeaterView = 'sap_inbox_stream';
sap.uiext.inbox.InboxConstants.inboxViews = [sap.uiext.inbox.InboxConstants.tableView, sap.uiext.inbox.InboxConstants.rowRepeaterView];

sap.uiext.inbox.InboxConstants.customAction = "customAction";
sap.uiext.inbox.InboxConstants.sapOrigin = "SAP__Origin";
sap.uiext.inbox.InboxConstants.InstanceID = "InstanceID";

sap.uiext.inbox.InboxConstants.taskDefinitionDecisionOptionsMap = {};
sap.uiext.inbox.InboxConstants.oTaskDefinitionCustomAttributesMap = {};
sap.uiext.inbox.InboxConstants.oTaskInstanceCustomAttributeValuesMap = {};
sap.uiext.inbox.InboxConstants.taskInstanceDecisionOptionsMap = {};
sap.uiext.inbox.InboxConstants.taskDescriptionsMap = {};

sap.uiext.inbox.InboxConstants.forwardSlash = "/";
sap.uiext.inbox.InboxConstants.amperSand = "&";
sap.uiext.inbox.InboxConstants.query = "?";
sap.uiext.inbox.InboxConstants.formatJSONURLParam = "$format=json";
sap.uiext.inbox.InboxConstants.acceptHeaderforJSON = "application/json";
sap.uiext.inbox.InboxConstants.REFRESH_ON_DATE_PATTERN = "MMM dd, HH:mm";
sap.uiext.inbox.InboxConstants.FORWARD = "Forward";


sap.uiext.inbox.InboxConstants.customAttributeNavigationParam = "CustomAttributeData";
sap.uiext.inbox.InboxConstants.taskDefinitionNavigationParam = "TaskDefinitionData";


sap.uiext.inbox.InboxConstants.UserInfoCollection = "UserInfoCollection";

sap.uiext.inbox.InboxConstants.TaskDefinitionCollection = {
		entityName : "TaskDefinitionCollection",
	  	navParam : {
	  				customAttrDefn : "CustomAttributeDefinitionData"										   
	  				
		},
		properties : {
			taskDefnID : "TaskDefinitionID"
		}
};

sap.uiext.inbox.InboxConstants.TaskCollection = {
		entityName :"TaskCollection",
		navParam : {
			   
				customAttrValues : "CustomAttributeData",
				comments		 : "Comments",
  				taskDescription  : "Description",
  				taskDefinition	 : "TaskDefinitionData"
		},
		properties : {
				instanceID : "InstanceID"
		}
};

sap.uiext.inbox.InboxConstants.mEntitiesToElements = {
		taskMetadata: { 
			sap_inbox_list : {
				columnsMap : {
					TaskTitle : "TaskTitle",
					CreatedOn : "CreatedOn",
					CompletionDeadLine : "CompletionDeadLine",
					Status : "Status",
					Priority : "Priority"
				}
			},
			sap_inbox_stream: {
				sorterMap : {
					CreatedOn : "li_creationDate",
					TaskTitle : "li_taskTitle",
					Status	  : "li_status"
				}
			},
		}
	};
sap.uiext.inbox.InboxConstants.ENTITY_NAME_TASK_COLLECTION= "Task";
sap.uiext.inbox.InboxConstants.PROPERTY_NAME_CUSTOM_STATUS= "StatusText";

sap.uiext.inbox.InboxConstants.PROPERTY_NAME_TASK_TITLE = "TaskTitle";
sap.uiext.inbox.InboxConstants.PROPERTY_NAME_PRIORITY = "Priority";
sap.uiext.inbox.InboxConstants.PROPERTY_NAME_TASK_DEFINITION_NAME = "TaskDefinitionName";


sap.uiext.inbox.InboxConstants.mTooltipforActionButtonsinRR = {
		show : {
			customAttributesSegBtn :"INBOX_SHOW_CUSTOM_ATTRIBUTES",
			commentsSegBtn :"INBOX_SHOW_COMMENTS",
			attachmentsSegBtn : "INBOX_SHOW_ATTACHMENTS"
		},
		hide : {
			customAttributesSegBtn :"INBOX_HIDE_CUSTOM_ATTRIBUTES",
			commentsSegBtn :"INBOX_HIDE_COMMENTS",
			attachmentsSegBtn : "INBOX_HIDE_ATTACHMENTS"
		}
};

sap.uiext.inbox.InboxConstants.NAVIGATION_DESCRIPTION="Description";
sap.uiext.inbox.InboxConstants.NAVIGATION_TASKDEFINITION="TaskDefinitionData";

sap.uiext.inbox.InboxConstants.TABLE_COLUMN = {TASK_TITLE: 0,
   	CREATED_ON: 1,
   	CREATED_BY: 2,
   	COMPLETION_DEADLINE: 3,
   	STATUS: 4,
   	PRIORITY: 5,
};

sap.uiext.inbox.InboxConstants.SystemInfoCollection = {
		entityType : "TASKPROCESSING.SystemInfo",
	  	name : "SystemInfoCollection"
};

sap.uiext.inbox.InboxConstants.attachmentCollection = {
		entityName :"AttachmentCollection",
		navParam : {
				attachment : "Attachments",
				value : "$value"
		},
		properties : {
			id : "ID"
		}
};

sap.uiext.inbox.InboxConstants.SubstitutionProfileCollection = {
		entityType : "TASKPROCESSING.SubstitutionProfile",
	  	name : "SubstitutionProfileCollection"
};
