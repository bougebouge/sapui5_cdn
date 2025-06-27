/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap*/
sap.ui.define(
[
"sap/sac/df/firefly/ff0230.io.ext"
],
function(oFF)
{
"use strict";

oFF.InAMergeProcessorFactory = function() {};
oFF.InAMergeProcessorFactory.prototype = new oFF.XObject();
oFF.InAMergeProcessorFactory.prototype._ff_c = "InAMergeProcessorFactory";

oFF.InAMergeProcessorFactory.s_factory = null;
oFF.InAMergeProcessorFactory.registerFactory = function(factory)
{
	oFF.InAMergeProcessorFactory.s_factory = factory;
};
oFF.InAMergeProcessorFactory.createInAMergeProcessor = function(connectionPool)
{
	var factory = oFF.InAMergeProcessorFactory.s_factory;
	var newObject = null;
	if (oFF.notNull(connectionPool))
	{
		if (oFF.notNull(factory) && connectionPool.getInAMergeProcessor() === null)
		{
			newObject = factory.newInAMergeProcessor(connectionPool);
		}
	}
	return newObject;
};

oFF.ConnectionParameters = {

	ALIAS:"ALIAS",
	AUTHENTICATION_TYPE:"AUTHENTICATION_TYPE",
	AUTHENTICATION_TYPE__BASIC:"BASIC",
	AUTHENTICATION_TYPE__NONE:"NONE",
	AUTHENTICATION_TYPE__BEARER:"BEARER",
	AUTHENTICATION_TYPE__SAML_WITH_PASSWORD:"SAML_WITH_PASSWORD",
	CONTENT_TYPE:"CONTENT_TYPE",
	PROTOCOL:"PROTOCOL",
	PROTOCOL_HTTP:"HTTP",
	PROTOCOL_HTTPS:"HTTPS",
	PROTOCOL_FILE:"FILE",
	APP_PROTOCOL_CIP:"CIP",
	APP_PROTOCOL_INA:"INA",
	APP_PROTOCOL_RSR:"RSR",
	APP_PROTOCOL_INA2:"INA2",
	APP_PROTOCOL_SQL:"SQL",
	HOST:"HOST",
	SECURE:"SECURE",
	URL:"URL",
	PASSWORD:"PASSWORD",
	TOKEN_VALUE:"TOKEN_VALUE",
	PORT:"PORT",
	PATH:"PATH",
	CLIENT:"CLIENT",
	WEBDISPATCHER_URI:"WEBDISPATCHER_URI",
	PREFLIGHT:"PREFLIGHT",
	PREFIX:"PREFIX",
	PROXY_HOST:"PROXY_HOST",
	PROXY_PORT:"PROXY_PORT",
	PROXY_TYPE:"PROXY_TYPE",
	PROXY_AUTHORIZATION:"PROXY_AUTHORIZATION",
	USER:"USER",
	SYSTEM_TYPE:"SYSTEM_TYPE",
	SYSTYPE:"SYSTYPE",
	ORIGIN:"ORIGIN",
	NAME:"NAME",
	DESCRIPTION:"DESCRIPTION",
	TIMEOUT:"TIMEOUT",
	IS_CSRF_REQUIRED:"IS_CSRF_REQUIRED",
	IS_CONTEXT_ID_REQUIRED:"IS_CONTEXT_ID_REQUIRED",
	KEEP_ALIVE_INTERVAL:"KEEP_ALIVE_INTERVAL",
	KEEP_ALIVE_DELAY:"KEEP_ALIVE_DELAY",
	LANGUAGE:"LANGUAGE",
	EQS_PATTERNS:"EQS_PATTERNS",
	TAGS:"TAGS",
	SESSION_CARRIER_TYPE:"SESSION_CARRIER_TYPE",
	CORRELATION_ID_ACTIVE:"CORRELATION_ID_ACTIVE",
	SAP_PASSPORT_ACTIVE:"SAP_PASSPORT_ACTIVE",
	ENABLE_TESTS:"ENABLE_TESTS",
	ENFORCE_TESTS:"ENFORCE_TESTS",
	X509CERTIFICATE:"X509CERTIFICATE",
	SECURE_LOGIN_PROFILE:"SECURE_LOGIN_PROFILE",
	SQL_DRIVER_JAVA:"SQL_DRIVER_JAVA",
	SQL_CONNECT_JAVA:"SQL_CONNECT_JAVA",
	MAPPING_SYSTEM_NAME:"MAPPING_SYSTEM_NAME",
	MAPPINGS:"MAPPINGS",
	CONTEXTS:"CONTEXTS",
	DEFINITION:"definition",
	SCC_VIRTUAL_HOST:"sccVirtualHost",
	SCC_PORT:"sccPort",
	MAPPING_SERIALIZATION_TABLE:"MAPPING_SERIALIZE_TABLE",
	MAPPING_SERIALIZATION_SCHEMA:"MAPPING_SERIALIZE_SCHEMA",
	MAPPING_DESERIALIZATION_TABLE:"MAPPING_DESERIALIZE_TABLE",
	MAPPING_DESERIALIZATION_SCHEMA:"MAPPING_DESERIALIZE_SCHEMA",
	ORGANIZATION_TOKEN:"ORGANIZATION",
	ELEMENT_TOKEN:"ELEMENT",
	USER_TOKEN:"USER_TOKEN",
	TENANT_ID:"TENANT_ID",
	TENANT_ROOT_PACKAGE:"TENANT_ROOT_PACKAGE",
	INTERNAL_USER:"INTERNAL_USER",
	ASSOCIATED_HANA_SYSTEM:"ASSOCIATED_HANA_SYSTEM",
	CACHE_HINTS_ENABLED:"CACHE_HINTS_ENABLED",
	CACHE_HINT_LEAVE_THROUGH:"CACHE_HINT_LEAVE_THROUGH",
	OEM_APPLICATION_ID:"OEM_APPLICATION_ID",
	IS_CONNECTED:"IS_CONNECTED",
	IS_X_AUTHORIZATION_REQUIRED:"IS_X_AUTHORIZATION_REQUIRED",
	FPA_CREATED_AT:"FPA_CREATED_AT",
	FPA_MODIFIED_AT:"FPA_MODIFIED_AT",
	FPA_CREATED_BY:"FPA_CREATED_BY",
	FPA_AUTHENTICATION_METHOD:"FPA_AUTHENTICATION_METHOD",
	FPA_IS_CONNECTED:"FPA_IS_CONNECTED",
	FPA_IS_NEED_CREDENTIAL:"FPA_IS_NEED_CREDENTIAL",
	FPA_CONNECTION_TYPE:"FPA_CONNECTION_TYPE"
};

oFF.ServerService = {

	ANALYTIC:"Analytics",
	BWMASTERDATA:"BWMasterData",
	MASTERDATA:"Masterdata",
	MODEL_PERSISTENCY:"ModelPersistence",
	PLANNING:"Planning",
	VALUE_HELP:"ValueHelp",
	WORKSPACE:"Workspace",
	HIERARCHY_MEMBER:"HierarchyMember",
	CATALOG:"Catalog",
	INA:"InA",
	LIST_REPORTING:"ListReporting",
	DIMENSION_EXTENSION:"ffs4DimensionExtension",
	DOCUMENTS:"Documents"
};

oFF.RpcFunctionFactory = function() {};
oFF.RpcFunctionFactory.prototype = new oFF.XObject();
oFF.RpcFunctionFactory.prototype._ff_c = "RpcFunctionFactory";

oFF.RpcFunctionFactory.s_factoryByProtocol = null;
oFF.RpcFunctionFactory.s_factoryBySystemType = null;
oFF.RpcFunctionFactory.s_defaultFactory = null;
oFF.RpcFunctionFactory.staticSetupFunctionFactory = function()
{
	oFF.RpcFunctionFactory.s_factoryByProtocol = oFF.XHashMapByString.create();
	oFF.RpcFunctionFactory.s_factoryBySystemType = oFF.XHashMapByString.create();
};
oFF.RpcFunctionFactory.registerDefaultFactory = function(factory)
{
	oFF.RpcFunctionFactory.s_defaultFactory = factory;
};
oFF.RpcFunctionFactory.registerFactory = function(protocolType, systemType, factory)
{
	if (oFF.notNull(protocolType))
	{
		oFF.RpcFunctionFactory.s_factoryByProtocol.put(protocolType.getName(), factory);
	}
	if (oFF.notNull(systemType))
	{
		oFF.RpcFunctionFactory.s_factoryBySystemType.put(systemType.getName(), factory);
	}
};
oFF.RpcFunctionFactory.create = function(context, name, systemType, protocolType)
{
	var factory = null;
	if (oFF.notNull(systemType))
	{
		factory = oFF.RpcFunctionFactory.s_factoryBySystemType.getByKey(systemType.getName());
	}
	if (oFF.isNull(factory))
	{
		factory = oFF.RpcFunctionFactory.s_factoryByProtocol.getByKey(protocolType.getName());
	}
	if (oFF.isNull(factory))
	{
		factory = oFF.RpcFunctionFactory.s_defaultFactory;
	}
	var result = null;
	if (oFF.notNull(factory))
	{
		result = factory.newRpcFunction(context, name, systemType, protocolType);
	}
	return result;
};

oFF.ProcessEntity = {

	OLAP_ENVIRONMENT:"olap.OlapEnvironment",
	APPLICATION:"rt.Application",
	CONNECTION_POOL:"rt.ConnectionPool",
	CREDENTIALS_PROVIDER:"rt.CredentialsProvider",
	GUI:"rt.Gui",
	SYSTEM_LANDSCAPE:"rt.SystemLandscape",
	SUB_SYSTEM:"rt.SubSystem",
	CACHE_PROVIDER:"rt.CacheProvider"
};

oFF.XFileFilterType = function() {};
oFF.XFileFilterType.prototype = new oFF.XConstant();
oFF.XFileFilterType.prototype._ff_c = "XFileFilterType";

oFF.XFileFilterType.EXACT = null;
oFF.XFileFilterType.ASTERISK = null;
oFF.XFileFilterType.s_lookup = null;
oFF.XFileFilterType.staticSetup = function()
{
	oFF.XFileFilterType.s_lookup = oFF.XHashMapByString.create();
	oFF.XFileFilterType.EXACT = oFF.XFileFilterType.create("Exact");
	oFF.XFileFilterType.ASTERISK = oFF.XFileFilterType.create("Asterisk");
};
oFF.XFileFilterType.create = function(name)
{
	var type = new oFF.XFileFilterType();
	type.setupConstant(name);
	oFF.XFileFilterType.s_lookup.put(name, type);
	return type;
};
oFF.XFileFilterType.lookup = function(name)
{
	return oFF.XFileFilterType.s_lookup.getByKey(name);
};

oFF.InAMergeProcessingMode = function() {};
oFF.InAMergeProcessingMode.prototype = new oFF.XConstant();
oFF.InAMergeProcessingMode.prototype._ff_c = "InAMergeProcessingMode";

oFF.InAMergeProcessingMode.MERGE_EXECUTE = null;
oFF.InAMergeProcessingMode.MERGE_PERSIST = null;
oFF.InAMergeProcessingMode.EXECUTE_PERSISTED = null;
oFF.InAMergeProcessingMode.staticSetup = function()
{
	oFF.InAMergeProcessingMode.MERGE_EXECUTE = oFF.InAMergeProcessingMode.create("MergeAndExecute");
	oFF.InAMergeProcessingMode.MERGE_PERSIST = oFF.InAMergeProcessingMode.create("MergeAndPersist");
	oFF.InAMergeProcessingMode.EXECUTE_PERSISTED = oFF.InAMergeProcessingMode.create("ExecutePersisted");
};
oFF.InAMergeProcessingMode.create = function(name)
{
	var newConstant = oFF.XConstant.setupName(new oFF.InAMergeProcessingMode(), name);
	return newConstant;
};

oFF.ServiceApiLevel = function() {};
oFF.ServiceApiLevel.prototype = new oFF.XConstant();
oFF.ServiceApiLevel.prototype._ff_c = "ServiceApiLevel";

oFF.ServiceApiLevel.BOOTSTRAP = null;
oFF.ServiceApiLevel.READ_ONLY = null;
oFF.ServiceApiLevel.PERSONALIZATION = null;
oFF.ServiceApiLevel.staticSetup = function()
{
	oFF.ServiceApiLevel.BOOTSTRAP = oFF.ServiceApiLevel.create("Bootstrap", 0);
	oFF.ServiceApiLevel.READ_ONLY = oFF.ServiceApiLevel.create("UserProfile", 1);
	oFF.ServiceApiLevel.PERSONALIZATION = oFF.ServiceApiLevel.create("BootstrapLandscape", 2);
};
oFF.ServiceApiLevel.create = function(name, level)
{
	var type = new oFF.ServiceApiLevel();
	type._setupInternal(name);
	type.m_level = level;
	return type;
};
oFF.ServiceApiLevel.prototype.m_level = 0;
oFF.ServiceApiLevel.prototype.getLevel = function()
{
	return this.m_level;
};

oFF.ResourceType = function() {};
oFF.ResourceType.prototype = new oFF.XConstant();
oFF.ResourceType.prototype._ff_c = "ResourceType";

oFF.ResourceType.JAVASCRIPT = null;
oFF.ResourceType.CSS = null;
oFF.ResourceType.CONTAINER = null;
oFF.ResourceType.MODULE_REF = null;
oFF.ResourceType.MODULE = null;
oFF.ResourceType.PROGRAM = null;
oFF.ResourceType.staticSetup = function()
{
	oFF.ResourceType.JAVASCRIPT = oFF.XConstant.setupName(new oFF.ResourceType(), "Javascript");
	oFF.ResourceType.CSS = oFF.XConstant.setupName(new oFF.ResourceType(), "Css");
	oFF.ResourceType.MODULE = oFF.XConstant.setupName(new oFF.ResourceType(), "Module");
	oFF.ResourceType.MODULE_REF = oFF.XConstant.setupName(new oFF.ResourceType(), "ModuleRef");
	oFF.ResourceType.CONTAINER = oFF.XConstant.setupName(new oFF.ResourceType(), "Container");
	oFF.ResourceType.PROGRAM = oFF.XConstant.setupName(new oFF.ResourceType(), "Program");
};

oFF.SystemRole = function() {};
oFF.SystemRole.prototype = new oFF.XConstant();
oFF.SystemRole.prototype._ff_c = "SystemRole";

oFF.SystemRole.MASTER = null;
oFF.SystemRole.DATA_PROVIDER = null;
oFF.SystemRole.REPOSITORY = null;
oFF.SystemRole.USER_MANAGEMENT = null;
oFF.SystemRole.SYSTEM_LANDSCAPE = null;
oFF.SystemRole.PRIMARY_BLENDING_HOST = null;
oFF.SystemRole.s_roles = null;
oFF.SystemRole.s_lookup = null;
oFF.SystemRole.staticSetup = function()
{
	oFF.SystemRole.s_roles = oFF.XList.create();
	oFF.SystemRole.s_lookup = oFF.XHashMapByString.create();
	oFF.SystemRole.MASTER = oFF.SystemRole.create("Master");
	oFF.SystemRole.DATA_PROVIDER = oFF.SystemRole.create("DataProvider");
	oFF.SystemRole.REPOSITORY = oFF.SystemRole.create("Repository");
	oFF.SystemRole.USER_MANAGEMENT = oFF.SystemRole.create("UserManagement");
	oFF.SystemRole.SYSTEM_LANDSCAPE = oFF.SystemRole.create("SystemLandscape");
	oFF.SystemRole.PRIMARY_BLENDING_HOST = oFF.SystemRole.create("PrimaryBlendingHost");
};
oFF.SystemRole.create = function(name)
{
	var newConstant = new oFF.SystemRole();
	newConstant._setupInternal(name);
	oFF.SystemRole.s_roles.add(newConstant);
	oFF.SystemRole.s_lookup.put(name, newConstant);
	return newConstant;
};
oFF.SystemRole.getAllRoles = function()
{
	return oFF.SystemRole.s_roles;
};
oFF.SystemRole.lookup = function(name)
{
	return oFF.SystemRole.s_lookup.getByKey(name);
};

oFF.ProgramCategory = function() {};
oFF.ProgramCategory.prototype = new oFF.XConstant();
oFF.ProgramCategory.prototype._ff_c = "ProgramCategory";

oFF.ProgramCategory.GENERIC = null;
oFF.ProgramCategory.MISC = null;
oFF.ProgramCategory.TEST = null;
oFF.ProgramCategory.SYSTEM = null;
oFF.ProgramCategory.OLAP = null;
oFF.ProgramCategory.QUASAR = null;
oFF.ProgramCategory.MOBILE = null;
oFF.ProgramCategory.SHELL = null;
oFF.ProgramCategory.SUB_SYSTEM = null;
oFF.ProgramCategory.s_lookup = null;
oFF.ProgramCategory.staticSetup = function()
{
	oFF.ProgramCategory.s_lookup = oFF.XHashMapByString.create();
	oFF.ProgramCategory.GENERIC = oFF.ProgramCategory.create("Generic");
	oFF.ProgramCategory.MISC = oFF.ProgramCategory.create("Misc");
	oFF.ProgramCategory.TEST = oFF.ProgramCategory.create("Test");
	oFF.ProgramCategory.SYSTEM = oFF.ProgramCategory.create("System");
	oFF.ProgramCategory.OLAP = oFF.ProgramCategory.create("Olap");
	oFF.ProgramCategory.QUASAR = oFF.ProgramCategory.create("Quasar");
	oFF.ProgramCategory.MOBILE = oFF.ProgramCategory.create("Mobile");
	oFF.ProgramCategory.SHELL = oFF.ProgramCategory.create("Shell");
	oFF.ProgramCategory.SUB_SYSTEM = oFF.ProgramCategory.create("SubSystem");
};
oFF.ProgramCategory.create = function(name)
{
	var theConstant = oFF.XConstant.setupName(new oFF.ProgramCategory(), name);
	oFF.ProgramCategory.s_lookup.put(name, theConstant);
	oFF.ProgramCategory.s_lookup.put(oFF.XString.toLowerCase(name), theConstant);
	oFF.ProgramCategory.s_lookup.put(oFF.XString.toUpperCase(name), theConstant);
	return theConstant;
};
oFF.ProgramCategory.lookup = function(name)
{
	var namerLower = oFF.XString.toLowerCase(name);
	return oFF.ProgramCategory.s_lookup.getByKey(namerLower);
};
oFF.ProgramCategory.lookupwithDefault = function(name, defaultCategory)
{
	var tmpCategory = oFF.ProgramCategory.lookup(name);
	if (oFF.notNull(tmpCategory))
	{
		return tmpCategory;
	}
	return defaultCategory;
};

oFF.ProgramContainerType = function() {};
oFF.ProgramContainerType.prototype = new oFF.XConstant();
oFF.ProgramContainerType.prototype._ff_c = "ProgramContainerType";

oFF.ProgramContainerType.NONE = null;
oFF.ProgramContainerType.CONSOLE = null;
oFF.ProgramContainerType.WINDOW = null;
oFF.ProgramContainerType.DIALOG = null;
oFF.ProgramContainerType.STANDALONE = null;
oFF.ProgramContainerType.CONTENT = null;
oFF.ProgramContainerType.s_lookup = null;
oFF.ProgramContainerType.staticSetup = function()
{
	oFF.ProgramContainerType.s_lookup = oFF.XHashMapByString.create();
	oFF.ProgramContainerType.NONE = oFF.ProgramContainerType.create("None");
	oFF.ProgramContainerType.CONSOLE = oFF.ProgramContainerType.create("Console");
	oFF.ProgramContainerType.WINDOW = oFF.ProgramContainerType.create("Window").markUiContainer().markFloatingContainer();
	oFF.ProgramContainerType.DIALOG = oFF.ProgramContainerType.create("Dialog").markUiContainer().markFloatingContainer();
	oFF.ProgramContainerType.STANDALONE = oFF.ProgramContainerType.create("Standalone").markUiContainer().markEmbeddedContainer();
	oFF.ProgramContainerType.CONTENT = oFF.ProgramContainerType.create("Content").markUiContainer().markEmbeddedContainer();
};
oFF.ProgramContainerType.create = function(name)
{
	var theConstant = oFF.XConstant.setupName(new oFF.ProgramContainerType(), name);
	theConstant.m_isUiContainer = false;
	theConstant.m_isFloatingContainer = false;
	theConstant.m_isEmbeddedContainer = false;
	oFF.ProgramContainerType.s_lookup.put(name, theConstant);
	return theConstant;
};
oFF.ProgramContainerType.lookup = function(name)
{
	return oFF.ProgramContainerType.s_lookup.getByKey(name);
};
oFF.ProgramContainerType.prototype.m_isUiContainer = false;
oFF.ProgramContainerType.prototype.m_isFloatingContainer = false;
oFF.ProgramContainerType.prototype.m_isEmbeddedContainer = false;
oFF.ProgramContainerType.prototype.isUiContainer = function()
{
	return this.m_isUiContainer;
};
oFF.ProgramContainerType.prototype.isFloatingContainer = function()
{
	return this.m_isFloatingContainer;
};
oFF.ProgramContainerType.prototype.isEmbeddedContainer = function()
{
	return this.m_isEmbeddedContainer;
};
oFF.ProgramContainerType.prototype.markUiContainer = function()
{
	this.m_isUiContainer = true;
	return this;
};
oFF.ProgramContainerType.prototype.markFloatingContainer = function()
{
	this.m_isFloatingContainer = true;
	return this;
};
oFF.ProgramContainerType.prototype.markEmbeddedContainer = function()
{
	this.m_isEmbeddedContainer = true;
	return this;
};

oFF.ProcessEventType = function() {};
oFF.ProcessEventType.prototype = new oFF.XConstant();
oFF.ProcessEventType.prototype._ff_c = "ProcessEventType";

oFF.ProcessEventType.CREATED = null;
oFF.ProcessEventType.ACTIVE = null;
oFF.ProcessEventType.PROGRAM_STARTED = null;
oFF.ProcessEventType.PROGRAM_STARTUP_ERROR = null;
oFF.ProcessEventType.START_CFG_CHANGED = null;
oFF.ProcessEventType.PROGRAM_TITLE_CHANGED = null;
oFF.ProcessEventType.BEFORE_SHUTDOWN_REQUEST = null;
oFF.ProcessEventType.SHUTDOWN_REQUEST = null;
oFF.ProcessEventType.SHUTDOWN_STARTED = null;
oFF.ProcessEventType.TERMINATED = null;
oFF.ProcessEventType.staticSetup = function()
{
	oFF.ProcessEventType.CREATED = oFF.ProcessEventType.create("Created");
	oFF.ProcessEventType.ACTIVE = oFF.ProcessEventType.create("Active");
	oFF.ProcessEventType.PROGRAM_STARTED = oFF.ProcessEventType.create("ProgramStarted");
	oFF.ProcessEventType.PROGRAM_STARTUP_ERROR = oFF.ProcessEventType.create("ProgramStartupError");
	oFF.ProcessEventType.START_CFG_CHANGED = oFF.ProcessEventType.create("StartCfgChanged");
	oFF.ProcessEventType.PROGRAM_TITLE_CHANGED = oFF.ProcessEventType.create("ProgramTitleChanged");
	oFF.ProcessEventType.BEFORE_SHUTDOWN_REQUEST = oFF.ProcessEventType.create("BeforeShutdownRequest");
	oFF.ProcessEventType.SHUTDOWN_REQUEST = oFF.ProcessEventType.create("ShutdownRequest");
	oFF.ProcessEventType.SHUTDOWN_STARTED = oFF.ProcessEventType.create("ShutdownStarted");
	oFF.ProcessEventType.TERMINATED = oFF.ProcessEventType.create("Terminated");
};
oFF.ProcessEventType.create = function(name)
{
	var theConstant = oFF.XConstant.setupName(new oFF.ProcessEventType(), name);
	return theConstant;
};

oFF.ProcessType = function() {};
oFF.ProcessType.prototype = new oFF.XConstant();
oFF.ProcessType.prototype._ff_c = "ProcessType";

oFF.ProcessType.ROOT = null;
oFF.ProcessType.SUBSYSTEM = null;
oFF.ProcessType.PROGRAM = null;
oFF.ProcessType.SERVICE = null;
oFF.ProcessType.s_lookup = null;
oFF.ProcessType.staticSetup = function()
{
	oFF.ProcessType.s_lookup = oFF.XHashMapByString.create();
	oFF.ProcessType.ROOT = oFF.ProcessType.create("Root");
	oFF.ProcessType.PROGRAM = oFF.ProcessType.create("Program");
	oFF.ProcessType.SUBSYSTEM = oFF.ProcessType.create("SubSystem");
	oFF.ProcessType.SERVICE = oFF.ProcessType.create("Service");
};
oFF.ProcessType.create = function(name)
{
	var theConstant = oFF.XConstant.setupName(new oFF.ProcessType(), name);
	oFF.ProcessType.s_lookup.put(name, theConstant);
	return theConstant;
};
oFF.ProcessType.lookup = function(name)
{
	return oFF.ProcessType.s_lookup.getByKey(name);
};

oFF.SigSelDomain = function() {};
oFF.SigSelDomain.prototype = new oFF.XConstant();
oFF.SigSelDomain.prototype._ff_c = "SigSelDomain";

oFF.SigSelDomain.UI = null;
oFF.SigSelDomain.DATA = null;
oFF.SigSelDomain.CONTEXT = null;
oFF.SigSelDomain.SUBSYSTEM = null;
oFF.SigSelDomain.DIALOG = null;
oFF.SigSelDomain.ENVVARS = null;
oFF.SigSelDomain.s_all = null;
oFF.SigSelDomain.staticSetup = function()
{
	oFF.SigSelDomain.s_all = oFF.XSetOfNameObject.create();
	oFF.SigSelDomain.UI = oFF.SigSelDomain.create("ui");
	oFF.SigSelDomain.DATA = oFF.SigSelDomain.create("dp");
	oFF.SigSelDomain.CONTEXT = oFF.SigSelDomain.create("Context");
	oFF.SigSelDomain.SUBSYSTEM = oFF.SigSelDomain.create("subsys");
	oFF.SigSelDomain.DIALOG = oFF.SigSelDomain.create("dialog");
	oFF.SigSelDomain.ENVVARS = oFF.SigSelDomain.create("env");
};
oFF.SigSelDomain.create = function(name)
{
	var domain = new oFF.SigSelDomain();
	domain._setupInternal(name);
	oFF.SigSelDomain.s_all.add(domain);
	return domain;
};
oFF.SigSelDomain.lookup = function(name)
{
	return oFF.SigSelDomain.s_all.getByKey(name);
};

oFF.SigSelIndexType = function() {};
oFF.SigSelIndexType.prototype = new oFF.XConstant();
oFF.SigSelIndexType.prototype._ff_c = "SigSelIndexType";

oFF.SigSelIndexType.NONE = null;
oFF.SigSelIndexType.NAME = null;
oFF.SigSelIndexType.POSITION = null;
oFF.SigSelIndexType.staticSetup = function()
{
	oFF.SigSelIndexType.NONE = oFF.XConstant.setupName(new oFF.SigSelIndexType(), "None");
	oFF.SigSelIndexType.NAME = oFF.XConstant.setupName(new oFF.SigSelIndexType(), "Name");
	oFF.SigSelIndexType.POSITION = oFF.XConstant.setupName(new oFF.SigSelIndexType(), "Position");
};

oFF.SigSelType = function() {};
oFF.SigSelType.prototype = new oFF.XConstant();
oFF.SigSelType.prototype._ff_c = "SigSelType";

oFF.SigSelType.MATCH = null;
oFF.SigSelType.MATCH_NAME = null;
oFF.SigSelType.MATCH_ID = null;
oFF.SigSelType.WILDCARD = null;
oFF.SigSelType.staticSetup = function()
{
	oFF.SigSelType.MATCH = oFF.XConstant.setupName(new oFF.SigSelType(), "Match");
	oFF.SigSelType.MATCH_ID = oFF.XConstant.setupName(new oFF.SigSelType(), "MatchId");
	oFF.SigSelType.MATCH_NAME = oFF.XConstant.setupName(new oFF.SigSelType(), "MatchName");
	oFF.SigSelType.WILDCARD = oFF.XConstant.setupName(new oFF.SigSelType(), "Wildcard");
};

oFF.SubSystemStatus = function() {};
oFF.SubSystemStatus.prototype = new oFF.XConstant();
oFF.SubSystemStatus.prototype._ff_c = "SubSystemStatus";

oFF.SubSystemStatus.INITIAL = null;
oFF.SubSystemStatus.BOOTSTRAP = null;
oFF.SubSystemStatus.LOADING = null;
oFF.SubSystemStatus.ACTIVE = null;
oFF.SubSystemStatus.INACTIVE = null;
oFF.SubSystemStatus.CLOSED = null;
oFF.SubSystemStatus.staticSetup = function()
{
	oFF.SubSystemStatus.INITIAL = oFF.SubSystemStatus.create("Initial");
	oFF.SubSystemStatus.BOOTSTRAP = oFF.SubSystemStatus.create("Bootstrap");
	oFF.SubSystemStatus.LOADING = oFF.SubSystemStatus.create("Loading");
	oFF.SubSystemStatus.ACTIVE = oFF.SubSystemStatus.create("Active");
	oFF.SubSystemStatus.INACTIVE = oFF.SubSystemStatus.create("Inactive");
	oFF.SubSystemStatus.CLOSED = oFF.SubSystemStatus.create("Closed");
};
oFF.SubSystemStatus.create = function(name)
{
	var unitType = new oFF.SubSystemStatus();
	unitType._setupInternal(name);
	return unitType;
};

oFF.SubSystemType = function() {};
oFF.SubSystemType.prototype = new oFF.XConstant();
oFF.SubSystemType.prototype._ff_c = "SubSystemType";

oFF.SubSystemType.GUI = null;
oFF.SubSystemType.BOOTSTRAP_LANDSCAPE = null;
oFF.SubSystemType.SYSTEM_LANDSCAPE = null;
oFF.SubSystemType.USER_PROFILE = null;
oFF.SubSystemType.FILE_SYSTEM = null;
oFF.SubSystemType.VIRTUAL_FILE_SYSTEM = null;
oFF.SubSystemType.CACHE = null;
oFF.SubSystemType.CREDENTIALS_PROVIDER = null;
oFF.SubSystemType.CREDENTIALS_PROVIDER_LITE = null;
oFF.SubSystemType.s_instances = null;
oFF.SubSystemType.staticSetup = function()
{
	oFF.SubSystemType.s_instances = oFF.XHashMapByString.create();
	oFF.SubSystemType.GUI = oFF.SubSystemType.create("Gui");
	oFF.SubSystemType.USER_PROFILE = oFF.SubSystemType.create("UserProfile");
	oFF.SubSystemType.BOOTSTRAP_LANDSCAPE = oFF.SubSystemType.create("BootstrapLandscape");
	oFF.SubSystemType.SYSTEM_LANDSCAPE = oFF.SubSystemType.create("SystemLandscape");
	oFF.SubSystemType.FILE_SYSTEM = oFF.SubSystemType.create("FileSystem");
	oFF.SubSystemType.VIRTUAL_FILE_SYSTEM = oFF.SubSystemType.create("VirtualFileSystem");
	oFF.SubSystemType.CACHE = oFF.SubSystemType.create("Cache");
	oFF.SubSystemType.CREDENTIALS_PROVIDER = oFF.SubSystemType.create("CredentialsProvider");
	oFF.SubSystemType.CREDENTIALS_PROVIDER_LITE = oFF.SubSystemType.create("CredentialsProviderLite");
};
oFF.SubSystemType.create = function(name)
{
	var type = new oFF.SubSystemType();
	type._setupInternal(name);
	oFF.SubSystemType.s_instances.put(name, type);
	return type;
};
oFF.SubSystemType.lookup = function(name)
{
	return oFF.SubSystemType.s_instances.getByKey(name);
};

oFF.FileAttributeType = function() {};
oFF.FileAttributeType.prototype = new oFF.XConstantWithParent();
oFF.FileAttributeType.prototype._ff_c = "FileAttributeType";

oFF.FileAttributeType.STRING_BASED = null;
oFF.FileAttributeType.INTEGER_BASED = null;
oFF.FileAttributeType.BOOLEAN_BASED = null;
oFF.FileAttributeType.DATE_MS_BASED = null;
oFF.FileAttributeType.STRUCTURE_BASED = null;
oFF.FileAttributeType.LIST_BASED = null;
oFF.FileAttributeType.NAME = null;
oFF.FileAttributeType.DISPLAY_NAME = null;
oFF.FileAttributeType.DESCRIPTION = null;
oFF.FileAttributeType.ICON = null;
oFF.FileAttributeType.NODE_TYPE = null;
oFF.FileAttributeType.SEMANTIC_TYPE = null;
oFF.FileAttributeType.SIZE = null;
oFF.FileAttributeType.FILE_TYPE = null;
oFF.FileAttributeType.TARGET_URL = null;
oFF.FileAttributeType.IS_EXISTING = null;
oFF.FileAttributeType.IS_DIRECTORY = null;
oFF.FileAttributeType.IS_FILE = null;
oFF.FileAttributeType.IS_EXECUTABLE = null;
oFF.FileAttributeType.IS_HIDDEN = null;
oFF.FileAttributeType.IS_READABLE = null;
oFF.FileAttributeType.IS_WRITEABLE = null;
oFF.FileAttributeType.USER = null;
oFF.FileAttributeType.CREATED_BY = null;
oFF.FileAttributeType.CREATED_AT = null;
oFF.FileAttributeType.CHANGED_BY = null;
oFF.FileAttributeType.CHANGED_AT = null;
oFF.FileAttributeType.OLAP_DATASOURCE = null;
oFF.FileAttributeType.OLAP_DATASOURCE_NAME = null;
oFF.FileAttributeType.OLAP_DATASOURCE_SCHEMA = null;
oFF.FileAttributeType.OLAP_DATASOURCE_PACKAGE = null;
oFF.FileAttributeType.OLAP_DATASOURCE_TYPE = null;
oFF.FileAttributeType.OLAP_DATASOURCE_SYSTEM = null;
oFF.FileAttributeType.SYSTEM_TYPE = null;
oFF.FileAttributeType.SYSTEM_NAME = null;
oFF.FileAttributeType.UNIQUE_ID = null;
oFF.FileAttributeType.OWNER_FOLDER = null;
oFF.FileAttributeType.OWNER_TYPE = null;
oFF.FileAttributeType.PARENT_UNIQUE_ID = null;
oFF.FileAttributeType.UPDATE_COUNT = null;
oFF.FileAttributeType.ORIGINAL_LANGUAGE = null;
oFF.FileAttributeType.PACKAGE_ID = null;
oFF.FileAttributeType.NODE_SUB_TYPE = null;
oFF.FileAttributeType.MOBILE_SUPPORT = null;
oFF.FileAttributeType.CREATED_BY_DISPLAY_NAME = null;
oFF.FileAttributeType.CHANGED_BY_DISPLAY_NAME = null;
oFF.FileAttributeType.TEXTS = null;
oFF.FileAttributeType.VIEWS = null;
oFF.FileAttributeType.FAVOURTIE_RESOURCE_ID = null;
oFF.FileAttributeType.ANCESTOR_RESOURCE = null;
oFF.FileAttributeType.SOURCE_RESOURCE = null;
oFF.FileAttributeType.ANCESTOR_PATH = null;
oFF.FileAttributeType.IS_SHARED = null;
oFF.FileAttributeType.SHARED_TO_ANY = null;
oFF.FileAttributeType.SHARED = null;
oFF.FileAttributeType.SHAREABLE = null;
oFF.FileAttributeType.STORY_CONTENT = null;
oFF.FileAttributeType.METADATA = null;
oFF.FileAttributeType.DEPENDENT_OBJECTS = null;
oFF.FileAttributeType.SUB_OBJECTS = null;
oFF.FileAttributeType.IGNORE_QUICKFILTERS = null;
oFF.FileAttributeType.CAN_ASSIGN = null;
oFF.FileAttributeType.CAN_READ = null;
oFF.FileAttributeType.CAN_UPDATE = null;
oFF.FileAttributeType.CAN_DELETE = null;
oFF.FileAttributeType.CAN_CREATE_DOC = null;
oFF.FileAttributeType.CAN_CREATE_FOLDER = null;
oFF.FileAttributeType.CAN_COPY = null;
oFF.FileAttributeType.CAN_COMMENT_VIEW = null;
oFF.FileAttributeType.CAN_COMMENT_ADD = null;
oFF.FileAttributeType.CAN_COMMENT_DELETE = null;
oFF.FileAttributeType.CAN_MAINTAIN = null;
oFF.FileAttributeType.SUPPORTS_CARTESIAN_FILTER = null;
oFF.FileAttributeType.SUPPORTS_OFFSET = null;
oFF.FileAttributeType.SUPPORTS_MAX_ITEMS = null;
oFF.FileAttributeType.SUPPORTS_SINGLE_SORT = null;
oFF.FileAttributeType.SUPPORTS_SEARCH = null;
oFF.FileAttributeType.SUPPORTED_FILTER_ATTRIBUTES = null;
oFF.FileAttributeType.SUPPORTED_FILTER_TYPES = null;
oFF.FileAttributeType.SOURCE_PROGRAM = null;
oFF.FileAttributeType.s_lookup = null;
oFF.FileAttributeType.staticSetup = function()
{
	oFF.FileAttributeType.s_lookup = oFF.XHashMapByString.create();
	oFF.FileAttributeType.STRING_BASED = oFF.FileAttributeType.create("abstract.StringBasedAttribute", null);
	oFF.FileAttributeType.INTEGER_BASED = oFF.FileAttributeType.create("abstract.IntegerBasedAttribute", null);
	oFF.FileAttributeType.BOOLEAN_BASED = oFF.FileAttributeType.create("abstract.BooleanBased", null);
	oFF.FileAttributeType.STRUCTURE_BASED = oFF.FileAttributeType.create("abstract.StructureBased", null);
	oFF.FileAttributeType.LIST_BASED = oFF.FileAttributeType.create("abstract.ListBased", null);
	oFF.FileAttributeType.DATE_MS_BASED = oFF.FileAttributeType.create("abstract.DateMsBased", oFF.FileAttributeType.INTEGER_BASED);
	oFF.FileAttributeType.NAME = oFF.FileAttributeType.create("os.name", oFF.FileAttributeType.STRING_BASED);
	oFF.FileAttributeType.DISPLAY_NAME = oFF.FileAttributeType.create("os.displayName", oFF.FileAttributeType.STRING_BASED);
	oFF.FileAttributeType.DESCRIPTION = oFF.FileAttributeType.create("os.node.description", oFF.FileAttributeType.STRING_BASED);
	oFF.FileAttributeType.ICON = oFF.FileAttributeType.create("os.node.icon", oFF.FileAttributeType.STRING_BASED);
	oFF.FileAttributeType.NODE_TYPE = oFF.FileAttributeType.create("os.node.type", oFF.FileAttributeType.STRING_BASED);
	oFF.FileAttributeType.SEMANTIC_TYPE = oFF.FileAttributeType.create("os.res.type", oFF.FileAttributeType.STRING_BASED);
	oFF.FileAttributeType.FILE_TYPE = oFF.FileAttributeType.create("os.fileType", oFF.FileAttributeType.STRING_BASED);
	oFF.FileAttributeType.SIZE = oFF.FileAttributeType.create("os.size", oFF.FileAttributeType.INTEGER_BASED);
	oFF.FileAttributeType.IS_EXISTING = oFF.FileAttributeType.create("os.isExisting", oFF.FileAttributeType.BOOLEAN_BASED);
	oFF.FileAttributeType.IS_DIRECTORY = oFF.FileAttributeType.create("os.isDirectory", oFF.FileAttributeType.BOOLEAN_BASED);
	oFF.FileAttributeType.IS_FILE = oFF.FileAttributeType.create("os.isFile", oFF.FileAttributeType.BOOLEAN_BASED);
	oFF.FileAttributeType.IS_EXECUTABLE = oFF.FileAttributeType.create("os.isExecutable", oFF.FileAttributeType.BOOLEAN_BASED);
	oFF.FileAttributeType.IS_HIDDEN = oFF.FileAttributeType.create("os.isHidden", oFF.FileAttributeType.BOOLEAN_BASED);
	oFF.FileAttributeType.IS_READABLE = oFF.FileAttributeType.create("os.isReadable", oFF.FileAttributeType.BOOLEAN_BASED);
	oFF.FileAttributeType.IS_WRITEABLE = oFF.FileAttributeType.create("os.isWriteable", oFF.FileAttributeType.BOOLEAN_BASED);
	oFF.FileAttributeType.IGNORE_QUICKFILTERS = oFF.FileAttributeType.create("os.ignoreQuickFilters", oFF.FileAttributeType.BOOLEAN_BASED);
	oFF.FileAttributeType.TARGET_URL = oFF.FileAttributeType.create("os.targetUrl", oFF.FileAttributeType.STRING_BASED);
	oFF.FileAttributeType.USER = oFF.FileAttributeType.create("abstract.User", oFF.FileAttributeType.STRING_BASED);
	oFF.FileAttributeType.CREATED_BY = oFF.FileAttributeType.create("os.createdBy", oFF.FileAttributeType.USER);
	oFF.FileAttributeType.CREATED_AT = oFF.FileAttributeType.create("os.createdAt", oFF.FileAttributeType.DATE_MS_BASED);
	oFF.FileAttributeType.CHANGED_BY = oFF.FileAttributeType.create("os.changedBy", oFF.FileAttributeType.USER);
	oFF.FileAttributeType.CHANGED_AT = oFF.FileAttributeType.create("os.changedAt", oFF.FileAttributeType.DATE_MS_BASED);
	oFF.FileAttributeType.OLAP_DATASOURCE = oFF.FileAttributeType.create("abstract.OlapDataSource", oFF.FileAttributeType.STRING_BASED);
	oFF.FileAttributeType.OLAP_DATASOURCE_NAME = oFF.FileAttributeType.create("olap.ds.name", oFF.FileAttributeType.OLAP_DATASOURCE);
	oFF.FileAttributeType.OLAP_DATASOURCE_SCHEMA = oFF.FileAttributeType.create("olap.ds.schema", oFF.FileAttributeType.OLAP_DATASOURCE);
	oFF.FileAttributeType.OLAP_DATASOURCE_PACKAGE = oFF.FileAttributeType.create("olap.ds.package", oFF.FileAttributeType.OLAP_DATASOURCE);
	oFF.FileAttributeType.OLAP_DATASOURCE_TYPE = oFF.FileAttributeType.create("olap.ds.type", oFF.FileAttributeType.OLAP_DATASOURCE);
	oFF.FileAttributeType.OLAP_DATASOURCE_SYSTEM = oFF.FileAttributeType.create("olap.ds.system", oFF.FileAttributeType.OLAP_DATASOURCE);
	oFF.FileAttributeType.SYSTEM_TYPE = oFF.FileAttributeType.create("os.sys.type", oFF.FileAttributeType.STRING_BASED);
	oFF.FileAttributeType.SYSTEM_NAME = oFF.FileAttributeType.create("os.sys.name", oFF.FileAttributeType.STRING_BASED);
	oFF.FileAttributeType.UNIQUE_ID = oFF.FileAttributeType.create("os.uniqueId", oFF.FileAttributeType.STRING_BASED);
	oFF.FileAttributeType.OWNER_FOLDER = oFF.FileAttributeType.create("os.ownerFolder", oFF.FileAttributeType.STRING_BASED);
	oFF.FileAttributeType.OWNER_TYPE = oFF.FileAttributeType.create("os.ownerType", oFF.FileAttributeType.STRING_BASED);
	oFF.FileAttributeType.PARENT_UNIQUE_ID = oFF.FileAttributeType.create("os.parentUniqueId", oFF.FileAttributeType.STRING_BASED);
	oFF.FileAttributeType.UPDATE_COUNT = oFF.FileAttributeType.create("os.updateCount", oFF.FileAttributeType.INTEGER_BASED);
	oFF.FileAttributeType.ORIGINAL_LANGUAGE = oFF.FileAttributeType.create("os.originalLanguage", oFF.FileAttributeType.STRING_BASED);
	oFF.FileAttributeType.PACKAGE_ID = oFF.FileAttributeType.create("contentlib.packageId", oFF.FileAttributeType.STRING_BASED);
	oFF.FileAttributeType.NODE_SUB_TYPE = oFF.FileAttributeType.create("os.node.subType", oFF.FileAttributeType.STRING_BASED);
	oFF.FileAttributeType.MOBILE_SUPPORT = oFF.FileAttributeType.create("os.mobile.support", oFF.FileAttributeType.INTEGER_BASED);
	oFF.FileAttributeType.CREATED_BY_DISPLAY_NAME = oFF.FileAttributeType.create("os.createdBy.displayName", oFF.FileAttributeType.STRING_BASED);
	oFF.FileAttributeType.CHANGED_BY_DISPLAY_NAME = oFF.FileAttributeType.create("os.changedBy.displayName", oFF.FileAttributeType.STRING_BASED);
	oFF.FileAttributeType.SOURCE_RESOURCE = oFF.FileAttributeType.create("contentlib.sourceResource", oFF.FileAttributeType.STRUCTURE_BASED);
	oFF.FileAttributeType.ANCESTOR_RESOURCE = oFF.FileAttributeType.create("contentlib.ancestorResource", oFF.FileAttributeType.LIST_BASED);
	oFF.FileAttributeType.SHARED_TO_ANY = oFF.FileAttributeType.create("os.shared_to_any", oFF.FileAttributeType.BOOLEAN_BASED);
	oFF.FileAttributeType.IS_SHARED = oFF.FileAttributeType.create("os.is_shared", oFF.FileAttributeType.BOOLEAN_BASED);
	oFF.FileAttributeType.SHARED = oFF.FileAttributeType.create("os.shared", oFF.FileAttributeType.BOOLEAN_BASED);
	oFF.FileAttributeType.SHAREABLE = oFF.FileAttributeType.create("os.sharable", oFF.FileAttributeType.STRING_BASED);
	oFF.FileAttributeType.STORY_CONTENT = oFF.FileAttributeType.create("contentlib.storyContent", oFF.FileAttributeType.STRUCTURE_BASED);
	oFF.FileAttributeType.METADATA = oFF.FileAttributeType.create("contentlib.metadata", oFF.FileAttributeType.STRUCTURE_BASED);
	oFF.FileAttributeType.CAN_ASSIGN = oFF.FileAttributeType.create("auth.canAssign", oFF.FileAttributeType.STRING_BASED);
	oFF.FileAttributeType.CAN_READ = oFF.FileAttributeType.create("auth.canRead", oFF.FileAttributeType.STRING_BASED);
	oFF.FileAttributeType.CAN_UPDATE = oFF.FileAttributeType.create("auth.canUpdate", oFF.FileAttributeType.STRING_BASED);
	oFF.FileAttributeType.CAN_DELETE = oFF.FileAttributeType.create("auth.canDelete", oFF.FileAttributeType.STRING_BASED);
	oFF.FileAttributeType.CAN_CREATE_DOC = oFF.FileAttributeType.create("auth.canCreateDoc", oFF.FileAttributeType.STRING_BASED);
	oFF.FileAttributeType.CAN_CREATE_FOLDER = oFF.FileAttributeType.create("auth.canCreateDoc", oFF.FileAttributeType.STRING_BASED);
	oFF.FileAttributeType.CAN_COPY = oFF.FileAttributeType.create("auth.canCopy", oFF.FileAttributeType.STRING_BASED);
	oFF.FileAttributeType.CAN_COMMENT_VIEW = oFF.FileAttributeType.create("auth.canCommentView", oFF.FileAttributeType.STRING_BASED);
	oFF.FileAttributeType.CAN_COMMENT_ADD = oFF.FileAttributeType.create("auth.canCommentAdd", oFF.FileAttributeType.STRING_BASED);
	oFF.FileAttributeType.CAN_COMMENT_DELETE = oFF.FileAttributeType.create("auth.canCommentDelete", oFF.FileAttributeType.STRING_BASED);
	oFF.FileAttributeType.CAN_MAINTAIN = oFF.FileAttributeType.create("auth.canMaintain", oFF.FileAttributeType.STRING_BASED);
	oFF.FileAttributeType.SUPPORTS_CARTESIAN_FILTER = oFF.FileAttributeType.create("os.md.supportsCartesianFilter", oFF.FileAttributeType.BOOLEAN_BASED);
	oFF.FileAttributeType.SUPPORTS_OFFSET = oFF.FileAttributeType.create("os.md.supportsOffset", oFF.FileAttributeType.BOOLEAN_BASED);
	oFF.FileAttributeType.SUPPORTS_MAX_ITEMS = oFF.FileAttributeType.create("os.md.supportsMaxItems", oFF.FileAttributeType.BOOLEAN_BASED);
	oFF.FileAttributeType.SUPPORTS_SINGLE_SORT = oFF.FileAttributeType.create("os.md.supportsSingleSort", oFF.FileAttributeType.BOOLEAN_BASED);
	oFF.FileAttributeType.SUPPORTS_SEARCH = oFF.FileAttributeType.create("os.md.supportsSearch", oFF.FileAttributeType.BOOLEAN_BASED);
	oFF.FileAttributeType.SUPPORTED_FILTER_ATTRIBUTES = oFF.FileAttributeType.create("os.md.supportedFilterAttributes", oFF.FileAttributeType.LIST_BASED);
	oFF.FileAttributeType.SUPPORTED_FILTER_TYPES = oFF.FileAttributeType.create("os.md.supportedFilterTypes", oFF.FileAttributeType.LIST_BASED);
	oFF.FileAttributeType.SOURCE_PROGRAM = oFF.FileAttributeType.create("os.sourceProgram", oFF.FileAttributeType.STRING_BASED);
};
oFF.FileAttributeType.create = function(name, parent)
{
	var type = new oFF.FileAttributeType();
	type.setupExt(name, parent);
	oFF.FileAttributeType.s_lookup.put(name, type);
	return type;
};
oFF.FileAttributeType.lookup = function(name)
{
	return oFF.FileAttributeType.s_lookup.getByKey(name);
};
oFF.FileAttributeType.prototype.isBoolean = function()
{
	return this.isTypeOf(oFF.FileAttributeType.BOOLEAN_BASED);
};
oFF.FileAttributeType.prototype.isString = function()
{
	return this.isTypeOf(oFF.FileAttributeType.STRING_BASED);
};
oFF.FileAttributeType.prototype.isInteger = function()
{
	return this.isTypeOf(oFF.FileAttributeType.INTEGER_BASED);
};
oFF.FileAttributeType.prototype.isLong = function()
{
	return this.isTypeOf(oFF.FileAttributeType.INTEGER_BASED);
};
oFF.FileAttributeType.prototype.isDouble = function()
{
	return false;
};
oFF.FileAttributeType.prototype.isNumeric = function()
{
	return this.isTypeOf(oFF.FileAttributeType.INTEGER_BASED);
};
oFF.FileAttributeType.prototype.isObject = function()
{
	return false;
};
oFF.FileAttributeType.prototype.isList = function()
{
	return this.isTypeOf(oFF.FileAttributeType.LIST_BASED);
};

oFF.ResourceStatus = function() {};
oFF.ResourceStatus.prototype = new oFF.XConstantWithParent();
oFF.ResourceStatus.prototype._ff_c = "ResourceStatus";

oFF.ResourceStatus.UNDEFINED = null;
oFF.ResourceStatus.INITIAL = null;
oFF.ResourceStatus.LOADING = null;
oFF.ResourceStatus.FINISHED = null;
oFF.ResourceStatus.LOADED = null;
oFF.ResourceStatus.FAILED = null;
oFF.ResourceStatus.staticSetup = function()
{
	oFF.ResourceStatus.UNDEFINED = oFF.ResourceStatus.create("Undefined", null);
	oFF.ResourceStatus.INITIAL = oFF.ResourceStatus.create("Initial", null);
	oFF.ResourceStatus.LOADING = oFF.ResourceStatus.create("Loading", null);
	oFF.ResourceStatus.FINISHED = oFF.ResourceStatus.create("Finished", null);
	oFF.ResourceStatus.LOADED = oFF.ResourceStatus.create("Loaded", oFF.ResourceStatus.FINISHED);
	oFF.ResourceStatus.FAILED = oFF.ResourceStatus.create("Failed", oFF.ResourceStatus.FINISHED);
};
oFF.ResourceStatus.create = function(name, parent)
{
	var type = new oFF.ResourceStatus();
	type.setupExt(name, parent);
	return type;
};

oFF.KernelComponentType = function() {};
oFF.KernelComponentType.prototype = new oFF.XComponentType();
oFF.KernelComponentType.prototype._ff_c = "KernelComponentType";

oFF.KernelComponentType.SIGSEL_RESULT_LIST = null;
oFF.KernelComponentType.SYSTEM_DESCRIPTION = null;
oFF.KernelComponentType.SYSTEM_LANDSCAPE = null;
oFF.KernelComponentType.staticSetupKernelComponentTypes = function()
{
	oFF.KernelComponentType.SIGSEL_RESULT_LIST = oFF.KernelComponentType.createKernelType("SigSelResultList", oFF.XComponentType._ROOT);
	oFF.KernelComponentType.SYSTEM_DESCRIPTION = oFF.KernelComponentType.createKernelType("SystemDescription", oFF.XComponentType._ROOT);
	oFF.KernelComponentType.SYSTEM_LANDSCAPE = oFF.KernelComponentType.createKernelType("SystemLandscape", oFF.XComponentType._ROOT);
};
oFF.KernelComponentType.createKernelType = function(constant, parent)
{
	var mt = new oFF.KernelComponentType();
	if (oFF.isNull(parent))
	{
		mt.setupExt(constant, oFF.XComponentType._ROOT);
	}
	else
	{
		mt.setupExt(constant, parent);
	}
	return mt;
};

oFF.KernelApiModule = function() {};
oFF.KernelApiModule.prototype = new oFF.DfModule();
oFF.KernelApiModule.prototype._ff_c = "KernelApiModule";

oFF.KernelApiModule.s_module = null;
oFF.KernelApiModule.getInstance = function()
{
	if (oFF.isNull(oFF.KernelApiModule.s_module))
	{
		oFF.DfModule.checkInitialized(oFF.IoExtModule.getInstance());
		oFF.KernelApiModule.s_module = oFF.DfModule.startExt(new oFF.KernelApiModule());
		oFF.ResourceType.staticSetup();
		oFF.ResourceStatus.staticSetup();
		oFF.SubSystemType.staticSetup();
		oFF.ProgramContainerType.staticSetup();
		oFF.ProgramCategory.staticSetup();
		oFF.SystemRole.staticSetup();
		oFF.SigSelType.staticSetup();
		oFF.SigSelDomain.staticSetup();
		oFF.SigSelIndexType.staticSetup();
		oFF.SubSystemStatus.staticSetup();
		oFF.ServiceApiLevel.staticSetup();
		oFF.KernelComponentType.staticSetupKernelComponentTypes();
		oFF.ProcessType.staticSetup();
		oFF.ProcessEventType.staticSetup();
		oFF.FileAttributeType.staticSetup();
		oFF.XFileFilterType.staticSetup();
		oFF.DfModule.stopExt(oFF.KernelApiModule.s_module);
	}
	return oFF.KernelApiModule.s_module;
};
oFF.KernelApiModule.prototype.getName = function()
{
	return "ff1000.kernel.api";
};

oFF.KernelApiModule.getInstance();

return sap.firefly;
	} );