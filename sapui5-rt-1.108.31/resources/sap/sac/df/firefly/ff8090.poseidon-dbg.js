/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap*/
sap.ui.define(
[
"sap/sac/df/firefly/ff3100.system.ui","sap/sac/df/firefly/ff8050.application.ui"
],
function(oFF)
{
"use strict";

oFF.StoryCache = function() {};
oFF.StoryCache.prototype = new oFF.XObject();
oFF.StoryCache.prototype._ff_c = "StoryCache";

oFF.StoryCache.create = function(rm, wtm, storyProviderRef)
{
	var sp = new oFF.StoryCache();
	sp.m_currentStory = null;
	sp.m_repositoryManager = rm;
	sp.m_workingTaskManager = wtm;
	sp.m_provider = storyProviderRef;
	sp.m_storyCacheHandle = null;
	return sp;
};
oFF.StoryCache.prototype.m_currentStory = null;
oFF.StoryCache.prototype.m_repositoryManager = null;
oFF.StoryCache.prototype.m_workingTaskManager = null;
oFF.StoryCache.prototype.m_storyId = null;
oFF.StoryCache.prototype.m_provider = null;
oFF.StoryCache.prototype.m_storyMD = null;
oFF.StoryCache.prototype.m_storyCacheHandle = null;
oFF.StoryCache.prototype.loadCached = function(storyId)
{
	this.m_storyId = storyId;
	this.m_currentStory = null;
	if (oFF.XLanguage.getLanguage() === oFF.XLanguage.OBJECTIVE_C && !this.m_provider.getIsProgressCancelled())
	{
		this.m_storyMD = oFF.StoryCacheUtil.loadStoryInfoFromDisk(this.m_repositoryManager, storyId, "storyMD");
		if (oFF.notNull(this.m_storyMD))
		{
			this.m_provider.setIsCacheLoading(true);
			var workingTaskManager = this.m_workingTaskManager;
			this.m_storyCacheHandle = workingTaskManager.createHandle(this);
			this.m_storyCacheHandle.processSynchronization(oFF.SyncType.NON_BLOCKING);
		}
	}
};
oFF.StoryCache.prototype.getRepositoryManager = function()
{
	return this.m_repositoryManager;
};
oFF.StoryCache.prototype.setRepositoryManager = function(repositoryManager)
{
	this.m_repositoryManager = repositoryManager;
};
oFF.StoryCache.prototype.releaseObject = function()
{
	oFF.XObjectExt.release(this.m_currentStory);
	oFF.XObjectExt.release(this.m_storyMD);
};
oFF.StoryCache.prototype.processInputOnWorkerThread = function(handle)
{
	var mainHandle = handle;
	var connectorHandle = mainHandle.getTask();
	var storyId = connectorHandle.m_storyId;
	if (oFF.notNull(this.m_storyMD) && !this.m_provider.getIsProgressCancelled())
	{
		var sMDPrObject = this.m_storyMD.asStructure();
		var layoutType = sMDPrObject.getIntegerByKey("layoutType");
		if (layoutType === this.m_provider.getMainLayout().getCode())
		{
			var storyName = sMDPrObject.getStringByKey("text");
			var psloadedStory = oFF.OcCacheableQuasarStory.create(storyId, storyName);
			var pagesNames = sMDPrObject.getListByKey("pages");
			var pages = oFF.XList.create();
			for (var idIndex = 0; idIndex < pagesNames.size(); idIndex++)
			{
				var pageIdName = pagesNames.getStructureAt(idIndex).asStructure();
				var pageId = pageIdName.getKeysAsReadOnlyListOfString().get(0);
				var storyPage = oFF.StoryCacheUtil.loadStoryInfoFromDisk(this.m_repositoryManager, storyId, pageId).asStructure();
				var currentPage = oFF.OcQuasarStoryPage.create(pageId, pageId, storyPage);
				pages.add(currentPage);
			}
			psloadedStory.setPages(pages);
			psloadedStory.setMediaUrl(sMDPrObject.getStringByKey("mediaUrl"));
			psloadedStory.setModifiedBy(sMDPrObject.getStringByKey("modifiedBy"));
			psloadedStory.setModifiedTime(sMDPrObject.getStringByKey("mdTime"));
			psloadedStory.setCreatedBy(sMDPrObject.getStringByKey("creatorName"));
			psloadedStory.setCreateTime(sMDPrObject.getStringByKey("crTime"));
			psloadedStory.setUpdateCounter(sMDPrObject.getIntegerByKeyExt("updateCounter", 0));
			psloadedStory.setDescription(sMDPrObject.getStringByKey("desc"));
			this.m_currentStory = psloadedStory;
		}
		else
		{
			oFF.XObjectExt.release(this.m_storyMD);
			oFF.XObjectExt.release(this.m_storyCacheHandle);
		}
	}
};
oFF.StoryCache.prototype.isFinishedOnWorkerThread = function(handle)
{
	return true;
};
oFF.StoryCache.prototype.processOutputOnMainThread = function(handle)
{
	var ocHandle = handle.getTask();
	var story = this.m_currentStory;
	if (oFF.notNull(story) && oFF.XString.isEqual(story.getName(), this.m_storyId) && !this.m_provider.getIsProgressCancelled())
	{
		ocHandle.m_provider.publishStoryDefinition(story, true);
		this.m_storyMD = null;
		this.m_storyId = null;
	}
	else
	{
		oFF.XObjectExt.release(this.m_currentStory);
	}
};
oFF.StoryCache.prototype.cancelProgress = function()
{
	if (oFF.notNull(this.m_storyCacheHandle))
	{
		this.m_storyCacheHandle.requestCancelling();
	}
};

oFF.StoryCacheUtil = {

	loadStoryInfoFromDisk:function(repositoryManager, storyID, infoPath)
	{
			var cache = oFF.StoryCacheUtil.getStoryCache(repositoryManager, storyID);
		return cache.getByKey(infoPath);
	},
	loadStoryListFromDisk:function(repositoryManager, domainRef)
	{
			var cache = oFF.StoryCacheUtil.getStoryCache(repositoryManager, oFF.XStringUtils.concatenate2(domainRef, "/"));
		return cache.getByKey("StoryList");
	},
	saveStoryListToDisk:function(repositoryManager, domainRef, storyList)
	{
			var cache = oFF.StoryCacheUtil.getStoryCache(repositoryManager, oFF.XStringUtils.concatenate2(domainRef, "/"));
		cache.put("StoryList", storyList, null);
	},
	loadSessionFromDisk:function(repositoryManager, url)
	{
			var cache = oFF.StoryCacheUtil.getStoryCache(repositoryManager, url);
		return cache.getByKey(url);
	},
	saveSessionToDisk:function(repositoryManager, url, sessionObject)
	{
			var cache = oFF.StoryCacheUtil.getStoryCache(repositoryManager, url);
		cache.put(url, sessionObject, null);
	},
	saveStoryPageToStore:function(repositoryManager, storyID, pageId, pageJson)
	{
			var cache = oFF.StoryCacheUtil.getStoryCache(repositoryManager, storyID);
		cache.put(pageId, pageJson, null);
	},
	saveStoryToStore:function(repositoryManager, storyData, layoutType)
	{
			if (oFF.notNull(repositoryManager) && oFF.XLanguage.getLanguage() === oFF.XLanguage.OBJECTIVE_C)
		{
			var storyInfo = oFF.PrFactory.createStructure();
			storyInfo.putString("text", storyData.getText());
			storyInfo.putString("desc", storyData.getDescription());
			storyInfo.putString("id", storyData.getName());
			storyInfo.putInteger("layoutType", layoutType.getCode());
			storyInfo.putString("creator", storyData.getCreatedBy());
			storyInfo.putString("crTime", storyData.getCreateTime());
			storyInfo.putString("mediaUrl", storyData.getMediaUrl());
			storyInfo.putString("mdTime", storyData.getModifiedTime());
			storyInfo.putString("modifiedBy", storyData.getModifiedBy());
			storyInfo.putInteger("updateCounter", storyData.getUpdateCounter());
			var pages = storyInfo.putNewList("pages");
			var pageList = storyData.getPages();
			var storyId = storyData.getName();
			for (var pageIndex = 0; pageIndex < pageList.size(); pageIndex++)
			{
				var psOrcaStoryPageInfo = pageList.get(pageIndex);
				var pageNameID = pages.addNewStructure();
				pageNameID.putString(psOrcaStoryPageInfo.getName(), psOrcaStoryPageInfo.getName());
				oFF.StoryCacheUtil.saveStoryPageToStore(repositoryManager, storyId, psOrcaStoryPageInfo.getName(), psOrcaStoryPageInfo.getPageContent());
			}
			var cache = oFF.StoryCacheUtil.getStoryCache(repositoryManager, storyId);
			cache.put("storyMD", storyInfo, null);
		}
	},
	getStoryCache:function(repositoryManager, storyId)
	{
			var process = repositoryManager.getApplication().getProcess();
		var cacheManager = process.getCacheManager();
		var atlasCache = cacheManager.getSubCache(oFF.Atlas.ATLAS_KEY);
		var storiesCache = atlasCache.getSubCache("story");
		var cache = storiesCache.getSubCache(storyId);
		return cache;
	},
	main:function()
	{
			oFF.IoNativeModule.getInstance();
	}
};

oFF.StoryProvider = function() {};
oFF.StoryProvider.prototype = new oFF.XObject();
oFF.StoryProvider.prototype._ff_c = "StoryProvider";

oFF.StoryProvider.create = function(storyService, storyLoadListener, workingTaskManager, repositoryManager)
{
	var spr = new oFF.StoryProvider();
	spr.setWorkingTaskManager(workingTaskManager);
	spr.m_mainLayout = oFF.OcLayoutType.FLOW;
	spr.m_storyHttp = oFF.StoryRest.create(repositoryManager, workingTaskManager, storyService, spr);
	spr.m_storyCache = oFF.StoryCache.create(repositoryManager, workingTaskManager, spr);
	spr.m_storyLoadListener = storyLoadListener;
	return spr;
};
oFF.StoryProvider.prototype.m_workingTaskManager = null;
oFF.StoryProvider.prototype.m_storyHttp = null;
oFF.StoryProvider.prototype.m_storyCache = null;
oFF.StoryProvider.prototype.m_currentStory = null;
oFF.StoryProvider.prototype.m_cacheProceeded = false;
oFF.StoryProvider.prototype.m_triggerPublish = false;
oFF.StoryProvider.prototype.m_cacheLoad = false;
oFF.StoryProvider.prototype.m_isProgressCancelled = false;
oFF.StoryProvider.prototype.m_mainLayout = null;
oFF.StoryProvider.prototype.m_storyLoadListener = null;
oFF.StoryProvider.prototype.getWorkingTaskManager = function()
{
	return this.m_workingTaskManager;
};
oFF.StoryProvider.prototype.setWorkingTaskManager = function(workingTaskManager)
{
	this.m_workingTaskManager = workingTaskManager;
};
oFF.StoryProvider.prototype.getStoryDefinition = function(storyId)
{
	this.m_isProgressCancelled = false;
	this.m_storyCache.loadCached(storyId);
	this.m_storyHttp.fetchSelectedStory(storyId);
};
oFF.StoryProvider.prototype.publishStoryDefinition = function(parsedStory, isFromCache)
{
	this.m_cacheLoad = isFromCache;
	this.m_triggerPublish = false;
	if (oFF.notNull(parsedStory))
	{
		if (isFromCache)
		{
			this.m_currentStory = parsedStory;
			this.m_triggerPublish = true;
		}
		else
		{
			if (oFF.notNull(this.m_currentStory))
			{
				var modified = oFF.StoryUtils.isStoryModified(parsedStory, this.m_currentStory);
				if (modified)
				{
					this.m_currentStory = parsedStory;
					this.m_triggerPublish = true;
				}
			}
			else
			{
				this.m_currentStory = parsedStory;
				this.m_triggerPublish = true;
			}
		}
	}
	if (oFF.XLanguage.getLanguage() === oFF.XLanguage.JAVASCRIPT)
	{
		if (!this.m_isProgressCancelled)
		{
			this.m_storyLoadListener.publishStory(this.m_currentStory, this.m_cacheLoad);
		}
		else
		{
			oFF.XObjectExt.release(this.m_currentStory);
		}
	}
	else
	{
		var storyProvider = this.m_workingTaskManager.createHandle(this);
		storyProvider.processSynchronization(oFF.SyncType.NON_BLOCKING);
	}
};
oFF.StoryProvider.prototype.getIsCacheProceed = function()
{
	return this.m_cacheProceeded;
};
oFF.StoryProvider.prototype.getStorySession = function()
{
	return this.m_storyHttp;
};
oFF.StoryProvider.prototype.setStorySession = function(ss)
{
	this.m_storyHttp = ss;
};
oFF.StoryProvider.prototype.setIsCacheLoading = function(isSuccessful)
{
	this.m_cacheProceeded = isSuccessful;
};
oFF.StoryProvider.prototype.processInputOnWorkerThread = function(handle) {};
oFF.StoryProvider.prototype.isFinishedOnWorkerThread = function(handle)
{
	return true;
};
oFF.StoryProvider.prototype.processOutputOnMainThread = function(handle)
{
	if (this.m_triggerPublish && !this.m_isProgressCancelled)
	{
		this.m_storyLoadListener.publishStory(this.m_currentStory, this.m_cacheLoad);
	}
};
oFF.StoryProvider.prototype.cancelProgress = function()
{
	this.m_storyHttp.cancelProgress();
	this.m_isProgressCancelled = true;
	this.m_currentStory = oFF.XObjectExt.release(this.m_currentStory);
	if (oFF.notNull(this.m_storyCache))
	{
		this.m_storyCache.cancelProgress();
	}
};
oFF.StoryProvider.prototype.getIsProgressCancelled = function()
{
	return this.m_isProgressCancelled;
};
oFF.StoryProvider.prototype.setMainLayout = function(layoutType)
{
	this.m_mainLayout = layoutType;
};
oFF.StoryProvider.prototype.getMainLayout = function()
{
	return this.m_mainLayout;
};
oFF.StoryProvider.prototype.releaseObject = function()
{
	this.m_currentStory = oFF.XObjectExt.release(this.m_currentStory);
	this.m_storyCache = oFF.XObjectExt.release(this.m_storyCache);
	this.m_storyHttp = oFF.XObjectExt.release(this.m_storyHttp);
};

oFF.StoryUtils = {

	normalizeString:function(name)
	{
			var newName = name;
		if (oFF.notNull(newName))
		{
			newName = oFF.XString.replace(newName, "  ", "_");
			newName = oFF.XString.replace(newName, ",", "_");
			newName = oFF.XString.replace(newName, " ", "_");
			newName = oFF.XString.replace(newName, "-", "_");
			newName = oFF.XString.replace(newName, ".", "");
			newName = oFF.XString.replace(newName, "\\", "_");
			newName = oFF.XString.replace(newName, "/", "_");
			newName = oFF.XString.replace(newName, "(", "_");
			newName = oFF.XString.replace(newName, ")", "_");
			newName = oFF.XString.replace(newName, "+", "_");
			newName = oFF.XString.replace(newName, ":", "_");
			newName = oFF.XString.replace(newName, "<", "_");
			newName = oFF.XString.replace(newName, ">", "_");
			newName = oFF.XString.toLowerCase(newName);
		}
		return newName;
	},
	isStoryModified:function(cachedStory, orcaStory)
	{
			var isTimeEqual = oFF.XString.isEqual(cachedStory.getModifiedTime(), orcaStory.getModifiedTime());
		if (isTimeEqual)
		{
			var pageList = cachedStory.getPages();
			var pageList2 = orcaStory.getPages();
			if (pageList.size() === pageList2.size())
			{
				for (var pageIndex = 0; pageIndex < pageList.size(); pageIndex++)
				{
					var psOrcaStoryPageInfo = pageList.get(pageIndex);
					var pageString = psOrcaStoryPageInfo.getPageContent().toString();
					var psOrcaStoryPageInfo2 = pageList2.get(pageIndex);
					var pageString2 = psOrcaStoryPageInfo2.getPageContent().toString();
					if (oFF.XString.size(pageString) === oFF.XString.size(pageString2))
					{
						return false;
					}
				}
			}
		}
		return true;
	},
	processTime:function(time)
	{
			var processedTime = oFF.XString.replace(time, "T", " ");
		return oFF.XStringUtils.stripRight(processedTime, 8);
	},
	extractDomain:function(url)
	{
			var cleanString = oFF.XString.replace(url, ".", "");
		cleanString = oFF.XString.replace(cleanString, "-", "");
		return oFF.XString.replace(cleanString, "/", "");
	}
};

oFF.StoryRest = function() {};
oFF.StoryRest.prototype = new oFF.XObject();
oFF.StoryRest.prototype._ff_c = "StoryRest";

oFF.StoryRest.create = function(rm, wtm, storyService, storyProvider)
{
	var sp = new oFF.StoryRest();
	sp.m_currentStory = null;
	sp.m_workingTaskManager = wtm;
	sp.m_storyRestHandle = null;
	sp.m_repoManager = rm;
	sp.m_storyService = storyService;
	sp.m_sp = storyProvider;
	return sp;
};
oFF.StoryRest.prototype.m_currentStory = null;
oFF.StoryRest.prototype.m_storyJson = null;
oFF.StoryRest.prototype.m_workingTaskManager = null;
oFF.StoryRest.prototype.m_repoManager = null;
oFF.StoryRest.prototype.m_storyRestHandle = null;
oFF.StoryRest.prototype.m_sp = null;
oFF.StoryRest.prototype.m_storyId = null;
oFF.StoryRest.prototype.m_storyService = null;
oFF.StoryRest.prototype.m_isStoryPublished = false;
oFF.StoryRest.prototype.getStory = function()
{
	return this.m_currentStory;
};
oFF.StoryRest.prototype.releaseObject = function()
{
	oFF.XObjectExt.release(this.m_currentStory);
	oFF.XObjectExt.release(this.m_storyJson);
	this.m_storyId = null;
};
oFF.StoryRest.prototype.fetchSelectedStory = function(storyId)
{
	this.m_currentStory = null;
	this.m_isStoryPublished = false;
	this.m_storyId = storyId;
	if (!this.m_sp.getIsCacheProceed())
	{
		this.m_storyService.processStoryLoad(this.m_storyService.getSession().getDefaultSyncType(), this, null, storyId);
	}
	else
	{
		var storyRestHandler = this.m_workingTaskManager.createHandle(this);
		storyRestHandler.processSynchronization(oFF.SyncType.NON_BLOCKING);
	}
};
oFF.StoryRest.prototype.processInputOnWorkerThread = function(handle)
{
	if (!this.m_sp.getIsProgressCancelled())
	{
		if (oFF.isNull(this.m_storyJson) && oFF.isNull(this.m_currentStory))
		{
			this.m_storyService.processStoryLoad(oFF.SyncType.NON_BLOCKING, this, null, this.m_storyId);
		}
		else if (oFF.notNull(this.m_storyJson))
		{
			this.m_currentStory = this.createQuasarStory();
			this.m_storyJson = null;
		}
		if (oFF.notNull(this.m_currentStory))
		{
			oFF.StoryCacheUtil.saveStoryToStore(this.m_repoManager, this.m_currentStory, this.m_sp.getMainLayout());
		}
	}
};
oFF.StoryRest.prototype.createQuasarStory = function()
{
	var connection = this.m_storyService.getServiceConfig().getConnectionContainer();
	var context = oFF.OcOrcaContext.create(this.m_storyJson.asStructure(), null, oFF.OcConnection.createByConnection(connection));
	var story = oFF.OcOrcaStory.create(context);
	var quasarStory = oFF.OcQuasarStory.create(story);
	quasarStory.setQuasarMainLayoutType(this.m_sp.getMainLayout());
	return quasarStory.getCacheableQuasarStory();
};
oFF.StoryRest.prototype.isFinishedOnWorkerThread = function(handle)
{
	return true;
};
oFF.StoryRest.prototype.processOutputOnMainThread = function(handle)
{
	var ocHandle = handle.getTask();
	if (oFF.notNull(this.m_currentStory) && !this.m_isStoryPublished && oFF.XString.isEqual(this.m_storyId, this.m_currentStory.getName()))
	{
		ocHandle.m_sp.publishStoryDefinition(this.m_currentStory, false);
		this.m_isStoryPublished = true;
	}
};
oFF.StoryRest.prototype.onStoryLoaded = function(extResult, story, customIdentifier)
{
	if (oFF.notNull(story) && !this.m_sp.getIsProgressCancelled())
	{
		var quasarStory = oFF.OcQuasarStory.create(story);
		quasarStory.setQuasarMainLayoutType(this.m_sp.getMainLayout());
		var quasarStoryInfo = quasarStory.getCacheableQuasarStory();
		this.m_sp.publishStoryDefinition(quasarStoryInfo, false);
		this.m_isStoryPublished = true;
		this.m_currentStory = quasarStoryInfo;
		this.m_storyRestHandle = this.m_workingTaskManager.createHandle(this);
		this.m_storyRestHandle.processSynchronization(oFF.SyncType.NON_BLOCKING);
	}
};
oFF.StoryRest.prototype.cancelProgress = function()
{
	if (oFF.notNull(this.m_storyRestHandle))
	{
		this.m_storyRestHandle.requestCancelling();
	}
};

oFF.Atlas = function() {};
oFF.Atlas.prototype = new oFF.XObjectExt();
oFF.Atlas.prototype._ff_c = "Atlas";

oFF.Atlas.ATLAS_KEY = "atlas";
oFF.Atlas.ORCA_STORY_CONNECTOR_LOG_LEVEL_DEBUG = "debug";
oFF.Atlas.ORCA_STORY_CONNECTOR_LOG_LEVEL_ERROR = "error";
oFF.Atlas.ORCA_STORY_CONNECTOR_LOG_LEVEL_WARNING = "warning";
oFF.Atlas.ORCA_STORY_CONNECTOR_LOG_LEVEL_INFO = "info";
oFF.Atlas.ORCA_STORY_CONNECTOR_LOG_LEVEL_PRINT = "print";
oFF.Atlas.SETTINGS_ORCA_URL_KEY = "orcaStoryConnector_orcaUrl";
oFF.Atlas.SETTINGS_MAIN_LAYOUT_KEY = "orcaStoryConnector_mainLayout";
oFF.Atlas.SETTINGS_LOG_LEVEL_KEY = "orcaStoryConnector_logLevel";
oFF.Atlas.SELECTED_PAGE_KEY = "selectedPage";
oFF.Atlas.create = function(nativeParentId, nativeParentObject, webdispatcher)
{
	var newObj = new oFF.Atlas();
	newObj.setupExt(nativeParentId, nativeParentObject, webdispatcher);
	return newObj;
};
oFF.Atlas.prototype.m_orcaService = null;
oFF.Atlas.prototype.m_application = null;
oFF.Atlas.prototype.m_uiManager = null;
oFF.Atlas.prototype.m_tridentClient = null;
oFF.Atlas.prototype.m_navigationContainer = null;
oFF.Atlas.prototype.m_startPage = null;
oFF.Atlas.prototype.m_nativeParentId = null;
oFF.Atlas.prototype.m_nativeParentObject = null;
oFF.Atlas.prototype.m_orcaUrl = null;
oFF.Atlas.prototype.m_currentCatalogOptions = null;
oFF.Atlas.prototype.m_PosClientList = null;
oFF.Atlas.prototype.m_curPosClient = null;
oFF.Atlas.prototype.m_curNavigationPage = null;
oFF.Atlas.prototype.m_hostDict = null;
oFF.Atlas.prototype.m_hostNameDict = null;
oFF.Atlas.prototype.m_hostIdList = null;
oFF.Atlas.prototype.m_logLevel = null;
oFF.Atlas.prototype.m_layout = null;
oFF.Atlas.prototype.m_currentStoryListItems = null;
oFF.Atlas.prototype.setupExt = function(nativeParentId, nativeParentObject, webdispatcher)
{
	this.m_nativeParentId = nativeParentId;
	this.m_nativeParentObject = nativeParentObject;
	var session = oFF.DefaultSession.createWithVersion(oFF.XVersion.MAX);
	session.getLogWriterBase().setLogFilterSeverity(oFF.Severity.ERROR);
	session.getProxySettings().setWebdispatcherTemplate(webdispatcher);
	this.m_application = oFF.ApplicationFactory.createApplication(session);
	this.m_application.setDefaultSyncType(oFF.SyncType.NON_BLOCKING);
	this.m_uiManager = this.m_application.getUiManager();
	this.m_tridentClient = oFF.TridentClient.create(this.m_application.newSubApplication(null), null);
	this.m_tridentClient.setNativeAnchorId(this.m_nativeParentId);
	this.m_tridentClient.setNativeAnchorObject(this.m_nativeParentObject);
	this.m_tridentClient.runProgram();
	this.setupApp();
	this.renderUi();
};
oFF.Atlas.prototype.setupApp = function()
{
	this.prepareHostList();
	this.m_currentCatalogOptions = new oFF.OcStoryCatalogLoadOptions();
	this.setOrcaUrl(oFF.XLocalStorage.getInstance().getStringByKeyExt(oFF.Atlas.SETTINGS_ORCA_URL_KEY, ""));
	var mainLayout = oFF.OcLayoutType.CANVAS;
	if (this.m_uiManager.getPlatform().isTypeOf(oFF.XPlatform.IPHONE))
	{
		mainLayout = oFF.OcLayoutType.FLOW;
	}
	this.setMainLayout(oFF.OcLayoutType.getByName(oFF.XLocalStorage.getInstance().getStringByKeyExt(oFF.Atlas.SETTINGS_MAIN_LAYOUT_KEY, mainLayout.getName())));
	this.setLogLevel(oFF.XLocalStorage.getInstance().getStringByKeyExt(oFF.Atlas.SETTINGS_LOG_LEVEL_KEY, oFF.Atlas.ORCA_STORY_CONNECTOR_LOG_LEVEL_ERROR));
};
oFF.Atlas.prototype.releaseObject = function()
{
	this.clearPoseidonClients();
	if (oFF.notNull(this.m_hostIdList))
	{
		this.m_hostIdList.clear();
		oFF.XObjectExt.release(this.m_hostIdList);
		this.m_hostIdList = null;
	}
	if (oFF.notNull(this.m_hostDict))
	{
		this.m_hostDict.clear();
		oFF.XObjectExt.release(this.m_hostDict);
		this.m_hostDict = null;
	}
	if (oFF.notNull(this.m_hostNameDict))
	{
		this.m_hostNameDict.clear();
		oFF.XObjectExt.release(this.m_hostNameDict);
		this.m_hostNameDict = null;
	}
	this.m_nativeParentObject = null;
	this.m_navigationContainer = oFF.XObjectExt.release(this.m_navigationContainer);
	this.m_startPage = oFF.XObjectExt.release(this.m_startPage);
	this.m_curNavigationPage = oFF.XObjectExt.release(this.m_curNavigationPage);
	this.m_currentStoryListItems = oFF.XObjectExt.release(this.m_currentStoryListItems);
	this.m_orcaService = oFF.XObjectExt.release(this.m_orcaService);
	this.m_tridentClient = oFF.XObjectExt.release(this.m_tridentClient);
	this.m_currentCatalogOptions = oFF.XObjectExt.release(this.m_currentCatalogOptions);
	this.m_uiManager = null;
	this.m_application = oFF.XObjectExt.release(this.m_application);
	oFF.XObjectExt.prototype.releaseObject.call( this );
};
oFF.Atlas.prototype.reset = function()
{
	this.logout();
	oFF.XObjectExt.release(this.m_orcaService);
	this.clearPoseidonClients();
	this.m_navigationContainer = oFF.XObjectExt.release(this.m_navigationContainer);
	this.m_startPage = oFF.XObjectExt.release(this.m_startPage);
	this.m_curNavigationPage = oFF.XObjectExt.release(this.m_curNavigationPage);
	this.m_currentStoryListItems = oFF.XObjectExt.release(this.m_currentStoryListItems);
	this.backToLoginScreen();
};
oFF.Atlas.prototype.refreshVisiblePageData = function()
{
	if (oFF.notNull(this.m_curPosClient))
	{
		this.m_curPosClient.refreshBindings();
	}
};
oFF.Atlas.prototype.loadStoryList = function()
{
	var config = oFF.OcOrcaServiceConfig.create(this.m_application, oFF.OcOrcaServiceConfig.ORCA_MASTER_SYSTEM_NAME);
	config.processOrcaServiceCreation(oFF.SyncType.NON_BLOCKING, this, null);
};
oFF.Atlas.prototype.setOrcaUrl = function(orcaUrl)
{
	this.m_orcaUrl = orcaUrl;
	var sysUri = oFF.XUri.createFromUrl(orcaUrl);
	var systemLandscape = this.m_application.getSystemLandscape();
	systemLandscape.setSystemByUri(oFF.OcOrcaServiceConfig.ORCA_MASTER_SYSTEM_NAME, sysUri, null);
};
oFF.Atlas.prototype.setMainLayout = function(layout)
{
	this.m_layout = layout;
};
oFF.Atlas.prototype.setLogLevel = function(logLevel)
{
	this.m_logLevel = logLevel;
	var tmpSession = this.m_application.getSession();
	var newLogLevel = oFF.Severity.ERROR;
	if (oFF.XString.isEqual(oFF.Atlas.ORCA_STORY_CONNECTOR_LOG_LEVEL_DEBUG, logLevel))
	{
		newLogLevel = oFF.Severity.DEBUG;
	}
	else if (oFF.XString.isEqual(oFF.Atlas.ORCA_STORY_CONNECTOR_LOG_LEVEL_ERROR, logLevel))
	{
		newLogLevel = oFF.Severity.ERROR;
	}
	else if (oFF.XString.isEqual(oFF.Atlas.ORCA_STORY_CONNECTOR_LOG_LEVEL_WARNING, logLevel))
	{
		newLogLevel = oFF.Severity.WARNING;
	}
	else if (oFF.XString.isEqual(oFF.Atlas.ORCA_STORY_CONNECTOR_LOG_LEVEL_INFO, logLevel))
	{
		newLogLevel = oFF.Severity.INFO;
	}
	else if (oFF.XString.isEqual(oFF.Atlas.ORCA_STORY_CONNECTOR_LOG_LEVEL_PRINT, logLevel))
	{
		newLogLevel = oFF.Severity.PRINT;
	}
	tmpSession.getLogWriterBase().setLogFilterSeverity(newLogLevel);
};
oFF.Atlas.prototype.backToLoginScreen = function()
{
	this.renderUi();
};
oFF.Atlas.prototype.logout = function()
{
	this.m_application.getConnectionPool().clearConnections();
};
oFF.Atlas.prototype.clearPoseidonClients = function()
{
	if (oFF.notNull(this.m_PosClientList))
	{
		for (var j = 0; j < this.m_PosClientList.size(); j++)
		{
			var tmpClient = this.m_PosClientList.get(j);
			oFF.XObjectExt.release(tmpClient);
		}
		this.m_PosClientList.clear();
	}
	this.m_PosClientList = oFF.XObjectExt.release(this.m_PosClientList);
	this.m_curPosClient = null;
};
oFF.Atlas.prototype.prepareHostList = function()
{
	this.m_hostIdList = oFF.XListOfString.create();
	this.m_hostDict = oFF.PrFactory.createStructure();
	this.m_hostNameDict = oFF.PrFactory.createStructure();
	this.m_hostIdList.add("apollo");
	this.m_hostDict.putString("apollo", oFF.XStringUtils.concatenate5("http:", "//::", "basic@apollo.oe", "mapi.only.sa", "p:8000?system_type=orca"));
	this.m_hostNameDict.putString("apollo", "Apollo");
	this.m_hostIdList.add("monsunproxy");
	this.m_hostDict.putString("monsunproxy", oFF.XStringUtils.concatenate5("http:", "//::basic@mo-9eeb3", "641b.mo.s", "ap.corp?sys", "tem_type=orca"));
	this.m_hostNameDict.putString("monsunproxy", "Monsun - proxy");
	this.m_hostIdList.add("monsun");
	this.m_hostDict.putString("monsun", oFF.XStringUtils.concatenate5("http:", "//::", "basic@bw.ac", "ioem.c.eu-de-1.cloud.s", "ap:8001?system_type=orca"));
	this.m_hostNameDict.putString("monsun", "Monsun");
	this.m_hostIdList.add("canary");
	this.m_hostDict.putString("canary", oFF.XStringUtils.concatenate5("http:", "//::", "saml@master-liveconn-successf", "actor.cnry.projecto", "rca.cloud?system_type=orca_cloud"));
	this.m_hostNameDict.putString("canary", "Canary - SF");
	this.m_hostIdList.add("orcareporting");
	this.m_hostDict.putString("orcareporting", oFF.XStringUtils.concatenate5("http:", "//::", "saml@or", "careporting.us2.sapbusinesso", "bjects.cloud?system_type=orca_cloud"));
	this.m_hostNameDict.putString("orcareporting", "Orca reporting");
	this.m_hostIdList.add("demoeu");
	this.m_hostDict.putString("demoeu", oFF.XStringUtils.concatenate5("http:", "//::", "saml@demo-stan", "dard.eu1.sa", "pbusinessobjects.cloud?system_type=orca_cloud"));
	this.m_hostNameDict.putString("demoeu", "Demo EU");
	this.m_hostIdList.add("vand00592075a");
	this.m_hostDict.putString("vand00592075a", oFF.XStringUtils.concatenate5("http:", "//::", "basic@vand00592075a.amer.global.co", "rp.s", "ap?system_type=orca"));
	this.m_hostNameDict.putString("vand00592075a", "Performance system (vand)");
	this.m_hostIdList.add("redbull");
	this.m_hostDict.putString("redbull", oFF.XStringUtils.concatenate5("http://::", "basic@ld3780.w", "df.sa", "p.cor", "p:8020?system_type=orca"));
	this.m_hostNameDict.putString("redbull", "Red Bull test system");
	this.m_hostIdList.add("vandevvmwin");
	this.m_hostDict.putString("vandevvmwin", oFF.XStringUtils.concatenate5("http:", "//::", "saml@vandevvmwin038.dhc", "p.pgdev.sa", "p.corp:9074?system_type=orca_cloud"));
	this.m_hostNameDict.putString("vandevvmwin", "A77F0 - Vandev performance");
	this.m_hostIdList.add("vanpgc34b9");
	this.m_hostDict.putString("vanpgc34b9", oFF.XStringUtils.concatenate5("http:", "//::", "basic@vanpgc34b9.d", "hcp.pgdev.sa", "p.corp?system_type=orca"));
	this.m_hostNameDict.putString("vanpgc34b9", "Hana PnR system");
	this.m_hostIdList.add("vandevhanamdc01t13");
	this.m_hostDict.putString("vandevhanamdc01t13", oFF.XStringUtils.concatenate5("http:", "//::", "basic@vandevhanamdc01t13.van.sa", "p.co", "rp:8000?system_type=orca"));
	this.m_hostNameDict.putString("vandevhanamdc01t13", "HANA MDC Benny");
	this.m_hostIdList.add("relmastercanarysf");
	this.m_hostDict.putString("relmastercanarysf", oFF.XStringUtils.concatenate5("http:", "//::", "saml@rel-success", "factors-1.eu2cnry.projec", "torca.cloud?system_type=orca_cloud"));
	this.m_hostNameDict.putString("relmastercanarysf", "SF rel master canary");
	this.m_hostIdList.add("s4mastercanary");
	this.m_hostDict.putString("s4mastercanary", oFF.XStringUtils.concatenate5("http:", "//::", "sa", "ml@master-s4.eu2cnry.proje", "ctorca.cloud?system_type=orca_cloud"));
	this.m_hostNameDict.putString("s4mastercanary", "S4 master canary");
};
oFF.Atlas.prototype.renderUi = function()
{
	var appTabBar = this.m_tridentClient.createUiElement(oFF.UiType.ICON_TAB_BAR);
	appTabBar.useMaxSpace();
	appTabBar.setName("appTabBar");
	var tabBarItemHome = appTabBar.addNewItem();
	tabBarItemHome.setName("home");
	tabBarItemHome.setText("Home");
	if (this.m_uiManager.getPlatform().isTypeOf(oFF.XPlatform.UI5))
	{
		tabBarItemHome.setIcon("home");
	}
	else
	{
		tabBarItemHome.setIcon("fa-home");
	}
	this.createHomeTab(tabBarItemHome);
	var tabBarItemSettings = appTabBar.addNewItem();
	tabBarItemSettings.setName("settings");
	tabBarItemSettings.setText("Settings");
	if (this.m_uiManager.getPlatform().isTypeOf(oFF.XPlatform.UI5))
	{
		tabBarItemSettings.setIcon("settings");
	}
	else
	{
		tabBarItemSettings.setIcon("fa-cog");
	}
	this.createSettingsTab(tabBarItemSettings);
	this.m_tridentClient.setRootUiElement(appTabBar);
};
oFF.Atlas.prototype.createHomeTab = function(tabBar)
{
	var homeFloatingLayoutVert = tabBar.setNewContent(oFF.UiType.FLEX_LAYOUT);
	homeFloatingLayoutVert.useMaxSpace();
	homeFloatingLayoutVert.setDirection(oFF.UiFlexDirection.COLUMN);
	homeFloatingLayoutVert.setAlignItems(oFF.UiFlexAlignItems.CENTER);
	homeFloatingLayoutVert.addNewItemOfType(oFF.UiType.SPACER).setWidth(oFF.UiCssLength.create("100%"));
	homeFloatingLayoutVert.addNewItemOfType(oFF.UiType.SPACER).setHeight(oFF.UiCssLength.create("10px"));
	homeFloatingLayoutVert.addNewItemOfType(oFF.UiType.LABEL).setText("Select server");
	var hostDropdown = homeFloatingLayoutVert.addNewItemOfType(oFF.UiType.DROPDOWN);
	hostDropdown.setName("hostDropdown");
	hostDropdown.setWidth(oFF.UiCssLength.createExt(350, oFF.UiCssSizeUnit.PIXEL));
	hostDropdown.setHeight(oFF.UiCssLength.createExt(200, oFF.UiCssSizeUnit.PIXEL));
	hostDropdown.registerOnSelect(this);
	hostDropdown.addNewItem().setText("Custom").setName("custom");
	var didPreselectDropdown = false;
	for (var hostIndex = 0; hostIndex < this.m_hostIdList.size(); hostIndex++)
	{
		var hostId = this.m_hostIdList.get(hostIndex);
		var hostName = this.m_hostNameDict.getStringByKey(hostId);
		var hostUrl = this.m_hostDict.getStringByKey(hostId);
		hostDropdown.addNewItem().setText(hostName).setName(hostId);
		if (oFF.XString.containsString(this.m_orcaUrl, hostUrl) && didPreselectDropdown === false)
		{
			hostDropdown.setSelectedName(hostId);
			didPreselectDropdown = true;
		}
	}
	if (didPreselectDropdown === false)
	{
		hostDropdown.setSelectedName("custom");
	}
	homeFloatingLayoutVert.addNewItemOfType(oFF.UiType.LABEL).setText("Orca URL");
	var urlInput = homeFloatingLayoutVert.addNewItemOfType(oFF.UiType.INPUT);
	urlInput.setName("urlInput");
	urlInput.setPlaceholder("URL");
	urlInput.setText(this.m_orcaUrl);
	urlInput.setWidth(oFF.UiCssLength.createExt(350, oFF.UiCssSizeUnit.PIXEL));
	urlInput.registerOnLiveChange(this);
	urlInput.registerOnEnter(this);
	var loginBtn = homeFloatingLayoutVert.addNewItemOfType(oFF.UiType.BUTTON);
	loginBtn.setName("loginBtn");
	loginBtn.setText("Login");
	if (this.m_uiManager.getPlatform().isTypeOf(oFF.XPlatform.UI5))
	{
		loginBtn.setIcon("visits");
	}
	else
	{
		loginBtn.setIcon("fa-sign-in-alt");
	}
	loginBtn.registerOnPress(this);
};
oFF.Atlas.prototype.createSettingsTab = function(tabBar)
{
	var settingsFloatingLayoutVert = tabBar.setNewContent(oFF.UiType.FLEX_LAYOUT);
	settingsFloatingLayoutVert.useMaxSpace();
	settingsFloatingLayoutVert.setDirection(oFF.UiFlexDirection.COLUMN);
	settingsFloatingLayoutVert.setAlignItems(oFF.UiFlexAlignItems.CENTER);
	settingsFloatingLayoutVert.addNewItemOfType(oFF.UiType.SPACER).setWidth(oFF.UiCssLength.create("100%"));
	settingsFloatingLayoutVert.addNewItemOfType(oFF.UiType.SPACER).setHeight(oFF.UiCssLength.create("10px"));
	var clearCacheBtn = settingsFloatingLayoutVert.addNewItemOfType(oFF.UiType.BUTTON);
	clearCacheBtn.setName("clearCacheBtn");
	clearCacheBtn.setText("Clear Cache");
	if (this.m_uiManager.getPlatform().isTypeOf(oFF.XPlatform.UI5))
	{
		clearCacheBtn.setIcon("delete");
	}
	else
	{
		clearCacheBtn.setIcon("fa-trash-alt");
	}
	clearCacheBtn.setButtonType(oFF.UiButtonType.DESTRUCTIVE);
	clearCacheBtn.registerOnPress(this);
	var spacerCaccheBtn = settingsFloatingLayoutVert.addNewItemOfType(oFF.UiType.SPACER);
	spacerCaccheBtn.setName("spacerCaccheBtn");
	spacerCaccheBtn.setHeight(oFF.UiCssLength.createExt(20, oFF.UiCssSizeUnit.PIXEL));
	settingsFloatingLayoutVert.addNewItemOfType(oFF.UiType.LABEL).setText("Select layout");
	var layoutDropdown = settingsFloatingLayoutVert.addNewItemOfType(oFF.UiType.DROPDOWN);
	layoutDropdown.setName("layoutDropdown");
	layoutDropdown.setWidth(oFF.UiCssLength.createExt(350, oFF.UiCssSizeUnit.PIXEL));
	layoutDropdown.setHeight(oFF.UiCssLength.createExt(125, oFF.UiCssSizeUnit.PIXEL));
	layoutDropdown.registerOnSelect(this);
	layoutDropdown.addNewItem().setText("Canvas").setName(oFF.OcLayoutType.CANVAS.getName());
	layoutDropdown.addNewItem().setText("Flow").setName(oFF.OcLayoutType.FLOW.getName());
	layoutDropdown.addNewItem().setText("Flow simple (only charts and data grids)").setName(oFF.OcLayoutType.FLOW_SIMPLE.getName());
	layoutDropdown.setSelectedName(this.m_layout.getName());
	var spacerLayoutDrp = settingsFloatingLayoutVert.addNewItemOfType(oFF.UiType.SPACER);
	spacerLayoutDrp.setName("spacerLayoutDrp");
	spacerLayoutDrp.setHeight(oFF.UiCssLength.createExt(20, oFF.UiCssSizeUnit.PIXEL));
	settingsFloatingLayoutVert.addNewItemOfType(oFF.UiType.LABEL).setText("Log level");
	var logLevelDropdown = settingsFloatingLayoutVert.addNewItemOfType(oFF.UiType.DROPDOWN);
	logLevelDropdown.setName("logLevelDropdown");
	logLevelDropdown.setWidth(oFF.UiCssLength.createExt(350, oFF.UiCssSizeUnit.PIXEL));
	logLevelDropdown.setHeight(oFF.UiCssLength.createExt(125, oFF.UiCssSizeUnit.PIXEL));
	logLevelDropdown.registerOnSelect(this);
	logLevelDropdown.addNewItem().setText("Debug").setName(oFF.Atlas.ORCA_STORY_CONNECTOR_LOG_LEVEL_DEBUG);
	logLevelDropdown.addNewItem().setText("Error").setName(oFF.Atlas.ORCA_STORY_CONNECTOR_LOG_LEVEL_ERROR);
	logLevelDropdown.addNewItem().setText("Warning").setName(oFF.Atlas.ORCA_STORY_CONNECTOR_LOG_LEVEL_WARNING);
	logLevelDropdown.addNewItem().setText("Info").setName(oFF.Atlas.ORCA_STORY_CONNECTOR_LOG_LEVEL_INFO);
	logLevelDropdown.addNewItem().setText("Print").setName(oFF.Atlas.ORCA_STORY_CONNECTOR_LOG_LEVEL_PRINT);
	logLevelDropdown.setSelectedName(this.m_logLevel);
};
oFF.Atlas.prototype.loadStoryCatalog = function(storyCatalog)
{
	if (oFF.isNull(this.m_startPage))
	{
		this.m_navigationContainer = this.m_tridentClient.createUiElement(oFF.UiType.NAVIGATION_CONTAINER);
		this.m_navigationContainer.useMaxSpace();
		this.m_navigationContainer.registerOnBack(this);
		this.m_startPage = this.m_navigationContainer.pushNewPage();
		this.m_startPage.setName("orcaStoryListContainer");
		this.m_startPage.setTitle("All stories");
		var storySearchField = this.m_tridentClient.createUiElement(oFF.UiType.SEARCH_FIELD);
		storySearchField.setName("storyListSearchField");
		storySearchField.setPlaceholder("Search story...");
		storySearchField.registerOnSearch(this);
		storySearchField.registerOnLiveChange(this);
		storySearchField.setDebounceTime(1000);
		this.m_startPage.setSubHeader(storySearchField);
		var refreshAction = this.m_startPage.addNewPageButton();
		refreshAction.setName("startPageRefreshList");
		refreshAction.setText("Refresh");
		if (this.m_uiManager.getPlatform().isTypeOf(oFF.XPlatform.UI5))
		{
			refreshAction.setIcon("refresh");
		}
		else
		{
			refreshAction.setIcon("fa-sync-alt");
		}
		refreshAction.registerOnPress(this);
		var favoritesAction = this.m_startPage.addNewPageButton();
		favoritesAction.setName("startPageGetFavorites");
		favoritesAction.setText("Favorites");
		if (this.m_uiManager.getPlatform().isTypeOf(oFF.XPlatform.UI5))
		{
			favoritesAction.setIcon("favorite");
		}
		else
		{
			favoritesAction.setIcon("fa-star");
		}
		favoritesAction.registerOnPress(this);
		this.m_tridentClient.setRootUiElement(this.m_navigationContainer);
	}
	else
	{
		var pageButtonsIterator = this.m_startPage.getPageButtons().getIterator();
		while (pageButtonsIterator.hasNext())
		{
			var action = pageButtonsIterator.next();
			action.setEnabled(true);
		}
	}
	if (oFF.isNull(this.m_currentStoryListItems))
	{
		this.m_currentStoryListItems = oFF.XList.create();
	}
	else
	{
		this.m_currentStoryListItems.clear();
	}
	var listView = this.m_startPage.setNewContent(oFF.UiType.LIST);
	listView.setName("orcaStoryList");
	listView.setSelectionMode(oFF.UiSelectionMode.NONE);
	listView.useMaxSpace();
	var iterator = storyCatalog.getCatalogItems().getIterator();
	while (iterator.hasNext())
	{
		var tmpStory = iterator.next();
		var desc = tmpStory.getDescription();
		var modifiedBy = tmpStory.getModifiedByDisplayName();
		if (oFF.XStringUtils.isNullOrEmpty(modifiedBy))
		{
			modifiedBy = tmpStory.getModifiedBy();
		}
		var modify = oFF.XStringUtils.concatenate2(oFF.XStringUtils.concatenate2("Modified: ", tmpStory.getModifiedTime()), oFF.XStringUtils.concatenate2(" by ", modifiedBy));
		var fullDesc = oFF.XStringUtils.concatenate3(modify, "\n", desc);
		var listItem = listView.addNewItem();
		listItem.setText(tmpStory.getName());
		listItem.setListItemType(oFF.UiListType.NAVIGATION);
		listItem.registerOnPress(this);
		listItem.setDescription(fullDesc);
		listItem.setCustomObject(tmpStory);
		if (this.m_uiManager.getPlatform().isTypeOf(oFF.XPlatform.UI5))
		{
			listItem.setIcon("business-objects-experience");
		}
		else
		{
			listItem.setIcon("fa-chart-pie");
		}
		this.m_currentStoryListItems.add(listItem);
	}
};
oFF.Atlas.prototype.loadStory = function(story)
{
	var selectedContainer = this.m_navigationContainer.getCustomObject();
	selectedContainer.getPageButtonByName("storyDetailsRefreshStory").setEnabled(true);
	selectedContainer.clearContent();
	this.clearPoseidonClients();
	this.m_PosClientList = oFF.XList.create();
	var quasarStory = oFF.OcQuasarStory.create(story);
	quasarStory.setQuasarMainLayoutType(this.m_layout);
	var pageList = quasarStory.getQuasarPages();
	var messages = quasarStory.getMessages();
	if (messages.hasErrors())
	{
		var error = messages.getFirstError();
		this.m_tridentClient.showTridentErrorToast(error.getText());
		this.log("--==An error occured:==--");
		this.log(error.getText());
		if (error.getErrorCause() !== null)
		{
			this.log("--==Error cause:==--");
			this.log(error.getErrorCause().getText());
		}
		this.log("--==Summary (other errors and messages):==--");
		this.log(messages.getSummary());
	}
	else if (messages.getMessages().hasElements())
	{
		var firstWarning = messages.getFirstWithSeverity(oFF.Severity.WARNING);
		if (oFF.notNull(firstWarning))
		{
			this.m_tridentClient.showTridentWarningToast(firstWarning.getText());
		}
		this.log("--==Warnings and info messages:==--");
		this.log(messages.getSummary());
	}
	var pageCount = pageList.size();
	if (pageCount > 0)
	{
		var storyId = this.generateStoryIdForCache(quasarStory);
		var cacheManager = this.m_application.getProcess().getCacheManager();
		var cache = cacheManager.getSubCache(oFF.Atlas.SELECTED_PAGE_KEY);
		var activePageId = cache.getStringByKey(storyId);
		var tabBar = selectedContainer.setNewContent(oFF.UiType.ICON_TAB_BAR).useMaxSpace();
		tabBar.setName(quasarStory.getName());
		tabBar.setCustomObject(quasarStory);
		tabBar.registerOnSelect(this);
		var didSelectPage = false;
		for (var pageIndex = 0; pageIndex < pageCount; pageIndex++)
		{
			var newPage = pageList.get(pageIndex);
			var tabBarItem = tabBar.addNew(oFF.UiType.ICON_TAB_BAR_ITEM);
			tabBarItem.setName(newPage.getId());
			tabBarItem.setText(newPage.getName());
			if (this.m_uiManager.getPlatform().isTypeOf(oFF.XPlatform.UI5))
			{
				tabBarItem.setIcon("document");
			}
			else
			{
				tabBarItem.setIcon("fa-file-alt");
			}
			tabBarItem.setNewContent(oFF.UiType.ACTIVITY_INDICATOR).setText("Loading page...").useMaxSpace();
			var storyDef = newPage.getPageContent();
			if (oFF.isNull(storyDef))
			{
				var textItem = selectedContainer.setNewContent(oFF.UiType.TEXT).setText("This page has no widgets!");
				textItem.setBackgroundColor(oFF.UiColor.create("#cc0033"));
				textItem.setFontColor(oFF.UiColor.create("#ffffff"));
				textItem.setFontSize(oFF.UiCssLength.createExt(15, oFF.UiCssSizeUnit.PIXEL));
			}
			else
			{
				var poseidonClient = oFF.PoseidonClient.createWithDocument(this.m_application.newSubApplication(null), storyDef);
				this.m_PosClientList.add(poseidonClient);
				tabBarItem.setCustomObject(poseidonClient);
				if (oFF.notNull(activePageId))
				{
					if (oFF.XString.isEqual(activePageId, newPage.getId()))
					{
						poseidonClient.runOnElement(tabBarItem);
						tabBar.setSelectedItem(tabBarItem);
						this.m_PosClientList.add(poseidonClient);
						this.m_curPosClient = poseidonClient;
						didSelectPage = true;
					}
				}
			}
		}
		if (didSelectPage === false && pageCount > 0)
		{
			var tempClient = tabBar.get(0).getCustomObject();
			tempClient.runOnElement(tabBar.get(0));
			this.m_curPosClient = tempClient;
		}
	}
	else
	{
		var textItem2 = selectedContainer.setNewContent(oFF.UiType.TEXT).setText("This story has no content!");
		textItem2.setBackgroundColor(oFF.UiColor.create("#cc0033"));
		textItem2.setFontColor(oFF.UiColor.create("#ffffff"));
		textItem2.setFontSize(oFF.UiCssLength.createExt(15, oFF.UiCssSizeUnit.PIXEL));
	}
};
oFF.Atlas.prototype.generateStoryIdForCache = function(story)
{
	var storyId = oFF.XStringUtils.concatenate3(story.getName(), "_", story.getId());
	return oFF.XString.replace(storyId, " ", "_");
};
oFF.Atlas.prototype.filterStoryListOnStartPage = function(searchText, clearButtonPressed)
{
	var storyList = this.m_startPage.getContent();
	storyList.clearItems();
	if (clearButtonPressed === false)
	{
		for (var a = 0; a < this.m_currentStoryListItems.size() - 1; a++)
		{
			var tmpListItem = this.m_currentStoryListItems.get(a);
			if (oFF.XString.containsString(oFF.XString.toLowerCase(tmpListItem.getText()), oFF.XString.toLowerCase(searchText)))
			{
				storyList.addItem(tmpListItem);
			}
		}
	}
	else
	{
		for (var i = 0; i < this.m_currentStoryListItems.size() - 1; i++)
		{
			storyList.addItem(this.m_currentStoryListItems.get(i));
		}
	}
};
oFF.Atlas.prototype.onOrcaServiceCreated = function(extResult, orcaService, customIdentifier)
{
	if (extResult.isValid())
	{
		this.m_orcaService = orcaService;
		orcaService.processSystemLandscapeLoad(oFF.SyncType.NON_BLOCKING, this, null, null);
	}
	else
	{
		this.log("#1 failure logon");
		this.log(extResult.getSummary());
	}
};
oFF.Atlas.prototype.onSystemsLoaded = function(extResult, systems, customIdentifier)
{
	if (extResult.isValid())
	{
		var systemLandscape = this.m_application.getSystemLandscape();
		for (var i = 0; i < systems.size(); i++)
		{
			var systemDescription = systems.get(i);
			systemLandscape.setSystemByDescription(systemDescription);
		}
		this.m_orcaService.processStoryCatalogLoad(oFF.SyncType.NON_BLOCKING, this, null, null);
	}
	else
	{
		this.log("#2 failure system loaded");
		this.log(extResult.getSummary());
	}
};
oFF.Atlas.prototype.onStoryCatalogLoaded = function(extResult, storyCatalog, customIdentifier)
{
	if (extResult.isValid())
	{
		this.loadStoryCatalog(extResult.getData());
	}
	else
	{
		this.log("#3 failure story catalog loaded");
		this.log(extResult.getSummary());
	}
};
oFF.Atlas.prototype.onStoryLoaded = function(extResult, story, customIdentifier)
{
	if (extResult.isValid())
	{
		this.loadStory(story);
	}
	else
	{
		this.log("#4 failure story loaded");
		this.log(extResult.getSummary());
	}
};
oFF.Atlas.prototype.onLiveChange = function(event)
{
	if (event.getControl().getUiType() === oFF.UiType.INPUT)
	{
		if (oFF.XString.isEqual(event.getControl().getName(), "urlInput"))
		{
			this.setOrcaUrl(event.getControl().getText());
			event.getControl().getUiManager().select("hostDropdown").setSelectedName("custom");
			oFF.XLocalStorage.getInstance().putString(oFF.Atlas.SETTINGS_ORCA_URL_KEY, this.m_orcaUrl);
		}
	}
	else if (event.getControl().getUiType() === oFF.UiType.SEARCH_FIELD)
	{
		if (oFF.XString.isEqual(event.getControl().getName(), "storyListSearchField"))
		{
			this.filterStoryListOnStartPage(event.getControl().getText(), false);
		}
	}
};
oFF.Atlas.prototype.onPress = function(event)
{
	if (oFF.XString.isEqual(event.getControl().getName(), "loginBtn") || oFF.XString.containsString(event.getControl().getName(), "Input"))
	{
		this.m_tridentClient.showActivity("Loading stories...");
		this.loadStoryList();
	}
	else if (oFF.XString.isEqual(event.getControl().getName(), "clearCacheBtn"))
	{
		if (oFF.notNull(this.m_application) && this.m_application.getRepositoryManager() !== null)
		{
			this.m_application.getProcess().getCacheManager().getSubCache(oFF.Atlas.ATLAS_KEY).clear();
		}
	}
	else if (oFF.XString.isEqual(event.getControl().getName(), "errorBackBtn"))
	{
		this.backToLoginScreen();
	}
	else if (event.getControl().getUiType() === oFF.UiType.LIST_ITEM)
	{
		var storyCatalogItem = event.getControl().getCustomObject();
		this.m_curNavigationPage = this.m_navigationContainer.pushNewPage();
		this.m_curNavigationPage.setName(storyCatalogItem.getId());
		this.m_curNavigationPage.setTitle(storyCatalogItem.getName());
		this.m_curNavigationPage.setNewContent(oFF.UiType.ACTIVITY_INDICATOR).setText("Loading story...").useMaxSpace();
		this.m_navigationContainer.setCustomObject(this.m_curNavigationPage);
		var refreshStoryAction = this.m_curNavigationPage.addNewPageButton();
		refreshStoryAction.setName("storyDetailsRefreshStory");
		refreshStoryAction.setText("Refresh");
		if (this.m_uiManager.getPlatform().isTypeOf(oFF.XPlatform.UI5))
		{
			refreshStoryAction.setIcon("refresh");
		}
		else
		{
			refreshStoryAction.setIcon("fa-sync-alt");
		}
		refreshStoryAction.registerOnPress(this);
		this.m_orcaService.processStoryLoad(oFF.SyncType.NON_BLOCKING, this, null, storyCatalogItem.getId());
	}
	else if (event.getControl().getUiType() === oFF.UiType.PAGE_BUTTON)
	{
		if (oFF.XString.isEqual(event.getControl().getName(), "startPageRefreshList") || oFF.XString.containsString(event.getControl().getName(), "startPageGetFavorites"))
		{
			this.m_startPage.setNewContent(oFF.UiType.ACTIVITY_INDICATOR).setText("Loading stories...").useMaxSpace();
			var storySearchField = this.m_startPage.getSubHeader();
			storySearchField.setText("");
			var iterator = this.m_startPage.getPageButtons().getIterator();
			while (iterator.hasNext())
			{
				var action = iterator.next();
				action.setEnabled(false);
			}
			if (oFF.XString.isEqual(event.getControl().getName(), "startPageRefreshList"))
			{
				this.m_orcaService.processStoryCatalogLoad(oFF.SyncType.NON_BLOCKING, this, null, this.m_currentCatalogOptions);
			}
			else if (oFF.XString.isEqual(event.getControl().getName(), "startPageGetFavorites"))
			{
				if (oFF.XString.isEqual(event.getControl().getIcon(), "fa-star") || oFF.XString.isEqual(event.getControl().getIcon(), "favorite"))
				{
					if (this.m_uiManager.getPlatform().isTypeOf(oFF.XPlatform.UI5))
					{
						event.getControl().setIcon("globe");
					}
					else
					{
						event.getControl().setIcon("fa-globe-asia");
					}
					event.getControl().setText("All Stories");
					this.m_startPage.setTitle("Favorites");
					this.m_currentCatalogOptions.setCatalogType(oFF.OcStoryCatalogType.FAVORITE);
				}
				else
				{
					if (this.m_uiManager.getPlatform().isTypeOf(oFF.XPlatform.UI5))
					{
						event.getControl().setIcon("favorite");
					}
					else
					{
						event.getControl().setIcon("fa-star");
					}
					event.getControl().setText("Favorites");
					this.m_startPage.setTitle("All stories");
					this.m_currentCatalogOptions.setCatalogType(oFF.OcStoryCatalogType.SEARCH_LIST);
				}
				this.m_orcaService.processStoryCatalogLoad(oFF.SyncType.NON_BLOCKING, this, null, this.m_currentCatalogOptions);
			}
		}
		else if (oFF.XString.isEqual(event.getControl().getName(), "startPageLogout"))
		{
			this.reset();
		}
		else if (oFF.XString.isEqual(event.getControl().getName(), "storyDetailsRefreshStory"))
		{
			this.clearPoseidonClients();
			this.m_curNavigationPage.getPageButtonByName("storyDetailsRefreshStory").setEnabled(false);
			this.m_curNavigationPage.setNewContent(oFF.UiType.ACTIVITY_INDICATOR).setText("Loading story...").useMaxSpace();
			var storyId = this.m_curNavigationPage.getName();
			this.m_orcaService.processStoryLoad(oFF.SyncType.NON_BLOCKING, this, null, storyId);
		}
	}
};
oFF.Atlas.prototype.onEnter = function(event)
{
	this.onPress(event);
};
oFF.Atlas.prototype.onSelect = function(event)
{
	if (event.getControl().getUiType() === oFF.UiType.ICON_TAB_BAR)
	{
		var poseidonClient = event.getSelectedItem().getCustomObject();
		if (poseidonClient.isContentRendered() === false)
		{
			poseidonClient.runOnElement(event.getSelectedItem());
		}
		this.m_curPosClient = poseidonClient;
		var tmpQuasarStory = event.getControl().getCustomObject();
		var storyId = this.generateStoryIdForCache(tmpQuasarStory);
		var pageId = event.getSelectedItem().getName();
		var cacheManager = this.m_application.getProcess().getCacheManager();
		var cache = cacheManager.getSubCache(oFF.Atlas.SELECTED_PAGE_KEY);
		cache.putString(storyId, pageId);
	}
	else if (event.getControl().getUiType() === oFF.UiType.DROPDOWN)
	{
		if (oFF.XString.isEqual(event.getControl().getName(), "hostDropdown"))
		{
			if (oFF.XString.isEqual(event.getControl().getSelectedName(), "custom") === false)
			{
				this.setOrcaUrl(this.m_hostDict.getStringByKey(event.getControl().getSelectedName()));
				oFF.XLocalStorage.getInstance().putString(oFF.Atlas.SETTINGS_ORCA_URL_KEY, this.m_orcaUrl);
			}
			event.getControl().getUiManager().select("urlInput").setText(this.m_orcaUrl);
		}
		else if (oFF.XString.isEqual(event.getControl().getName(), "layoutDropdown"))
		{
			this.setMainLayout(oFF.OcLayoutType.getByName(event.getControl().getSelectedName()));
			oFF.XLocalStorage.getInstance().putString(oFF.Atlas.SETTINGS_MAIN_LAYOUT_KEY, this.m_layout.getName());
		}
		else if (oFF.XString.isEqual(event.getControl().getName(), "logLevelDropdown"))
		{
			if (event.getControl().getSelectedName() !== null)
			{
				this.setLogLevel(event.getControl().getSelectedName());
			}
			oFF.XLocalStorage.getInstance().putString(oFF.Atlas.SETTINGS_LOG_LEVEL_KEY, this.m_logLevel);
		}
	}
};
oFF.Atlas.prototype.onBack = function(event)
{
	if (oFF.notNull(this.m_curNavigationPage))
	{
		oFF.XObjectExt.release(this.m_curNavigationPage);
		this.m_curNavigationPage = null;
	}
	this.clearPoseidonClients();
};
oFF.Atlas.prototype.onSearch = function(event)
{
	var didPressClearButton = event.getParameters().getBooleanByKeyExt(oFF.UiControlEvent.PARAM_CLEAR_BUTTON_PRESSED, false);
	var searchText = event.getParameters().getStringByKeyExt(oFF.UiControlEvent.PARAM_SEARCH_TEXT, "");
	this.filterStoryListOnStartPage(searchText, didPressClearButton);
};

oFF.PsAppInfo = function() {};
oFF.PsAppInfo.prototype = new oFF.DfNameTextObject();
oFF.PsAppInfo.prototype._ff_c = "PsAppInfo";

oFF.PsAppInfo.create = function(name)
{
	var newObj = new oFF.PsAppInfo();
	newObj._setupInternal(name);
	return newObj;
};
oFF.PsAppInfo.prototype.m_imageName = null;
oFF.PsAppInfo.prototype.m_appFile = null;
oFF.PsAppInfo.prototype.m_imageFile = null;
oFF.PsAppInfo.prototype.getImageName = function()
{
	return this.m_imageName;
};
oFF.PsAppInfo.prototype.setImageName = function(imageName)
{
	this.m_imageName = imageName;
};
oFF.PsAppInfo.prototype.getAppFile = function()
{
	return this.m_appFile;
};
oFF.PsAppInfo.prototype.setAppFile = function(file)
{
	this.m_appFile = file;
};
oFF.PsAppInfo.prototype.getImageFile = function()
{
	return this.m_imageFile;
};
oFF.PsAppInfo.prototype.setImageFile = function(file)
{
	this.m_imageFile = file;
};
oFF.PsAppInfo.prototype.releaseObject = function()
{
	this.m_appFile = null;
	this.m_imageFile = null;
	oFF.DfNameTextObject.prototype.releaseObject.call( this );
};

oFF.Asteria = function() {};
oFF.Asteria.prototype = new oFF.DfUiProgram();
oFF.Asteria.prototype._ff_c = "Asteria";

oFF.Asteria.DEFAULT_PROGRAM_NAME = "Asteria";
oFF.Asteria.createRunner = function()
{
	var runner = oFF.KernelBoot.createByName(oFF.Asteria.DEFAULT_PROGRAM_NAME);
	return runner;
};
oFF.Asteria.createStudioProgram = function(application)
{
	var client = oFF.Asteria.create(application, null);
	return client;
};
oFF.Asteria.createPoseidonApp = function(nativeParentId, nativeParentObject)
{
	oFF.ApplicationUiModule.getInstance();
	var client = oFF.Asteria.create(null, null);
	client.setNativeAnchorId(nativeParentId);
	client.setNativeAnchorObject(nativeParentObject);
	return client;
};
oFF.Asteria.create = function(application, systemType)
{
	var client = new oFF.Asteria();
	client.setup();
	client.setInitialSystemType(systemType);
	client.setApplication(application);
	client.initializeProgram();
	return client;
};
oFF.Asteria.prototype.m_uiTestsDir = null;
oFF.Asteria.prototype.m_navigationContainer = null;
oFF.Asteria.prototype.newProgram = function()
{
	var prg = new oFF.Asteria();
	prg.setup();
	return prg;
};
oFF.Asteria.prototype.getProgramName = function()
{
	return oFF.Asteria.DEFAULT_PROGRAM_NAME;
};
oFF.Asteria.prototype.doSetupProgramMetadata = function(metadata)
{
	oFF.DfUiProgram.prototype.doSetupProgramMetadata.call( this , metadata);
};
oFF.Asteria.prototype.evalArguments = function()
{
	oFF.DfUiProgram.prototype.evalArguments.call( this );
};
oFF.Asteria.prototype.releaseObject = function()
{
	this.m_navigationContainer = oFF.XObjectExt.release(this.m_navigationContainer);
	this.m_uiTestsDir = oFF.XObjectExt.release(this.m_uiTestsDir);
	oFF.DfUiProgram.prototype.releaseObject.call( this );
};
oFF.Asteria.prototype.setupProgram = function()
{
	return null;
};
oFF.Asteria.prototype.buildUi = function(genesis)
{
	this.setTitle("Asteria - Quasar UI Testsuite");
	var activity = genesis.newControl(oFF.UiType.ACTIVITY_INDICATOR).setText("Loading...");
	genesis.setRoot(activity);
	if (oFF.isNull(this.m_uiTestsDir) || this.m_uiTestsDir.isDirectory() === false)
	{
		this.setTestAppFilesDirByPath("/production/queries/simplex/quasarUiTestApps/");
	}
	this.m_uiTestsDir.processFetchChildren(oFF.SyncType.NON_BLOCKING, this, null, null);
};
oFF.Asteria.prototype.setTestAppFilesDirByPath = function(dirPath)
{
	if (oFF.notNull(dirPath))
	{
		var galleryDir = oFF.XFile.createFromEnvVar(this.getProcess(), oFF.XEnvironmentConstants.FIREFLY_SDK, dirPath);
		this.setDir(galleryDir);
	}
};
oFF.Asteria.prototype.setDir = function(dir)
{
	this.m_uiTestsDir = dir;
};
oFF.Asteria.prototype.onChildrenFetched = function(extResult, file, children, resultset, customIdentifier)
{
	if (extResult.isValid())
	{
		this.m_navigationContainer = this.m_genesis.newControl(oFF.UiType.NAVIGATION_CONTAINER);
		this.m_navigationContainer.useMaxSpace();
		var startPage = this.m_navigationContainer.pushNewPage();
		startPage.setTitle("Quasar Ui Tests");
		var verticalLayout = startPage.setNewContent(oFF.UiType.FLOW_LAYOUT);
		for (var i = 0; i < children.size(); i++)
		{
			var element = children.get(i);
			var childFile = element;
			var name = childFile.getName();
			var dotIndex = oFF.XString.lastIndexOf(name, ".");
			if (dotIndex !== -1 && oFF.XString.isEqual(".index.json", name) === false)
			{
				var simpleName = oFF.XString.substring(name, 0, dotIndex);
				var postfix = oFF.XString.substring(name, dotIndex + 1, -1);
				if (oFF.XString.isEqual("qsa", postfix))
				{
					var appButton = verticalLayout.addNewItemOfType(oFF.UiType.BUTTON);
					appButton.setText(simpleName);
					appButton.setCustomObject(childFile);
					appButton.registerOnPress(this);
					verticalLayout.addNewItemOfType(oFF.UiType.SPACER);
				}
			}
		}
		this.m_genesis.setRoot(this.m_navigationContainer);
	}
	else
	{
		oFF.UiMessageUtils.showErrorWithMessage(this.getGenesis(), "Failed to fetch test applications!");
	}
};
oFF.Asteria.prototype.onPress = function(event)
{
	var appFile = event.getControl().getCustomObject();
	if (oFF.notNull(appFile))
	{
		var newView = this.m_navigationContainer.pushNewPage();
		newView.setTitle(event.getControl().getText());
		var poseidonClient = oFF.PoseidonClient.createWithFile(this.getApplication().newSubApplication(null), appFile, null);
		var subGenesis = oFF.UiGenesis.create(newView);
		poseidonClient.renderUi(subGenesis);
	}
};

oFF.AtlasSimpleProgram = function() {};
oFF.AtlasSimpleProgram.prototype = new oFF.DfUiProgram();
oFF.AtlasSimpleProgram.prototype._ff_c = "AtlasSimpleProgram";

oFF.AtlasSimpleProgram.DEFAULT_PROGRAM_NAME = "StoryRenderer";
oFF.AtlasSimpleProgram.PARAM_OPTION_EXTERNAL_SYSTEM_USERNAME = "ExtSysUsername";
oFF.AtlasSimpleProgram.PARAM_OPTION_EXTERNAL_SYSTEM_PASSWORD = "ExtSysPassword";
oFF.AtlasSimpleProgram.PARAM_1_SYSTEM_NAME = "SystemName";
oFF.AtlasSimpleProgram.PARAM_2_STORY_ID = "StoryId";
oFF.AtlasSimpleProgram.PARAM_3_PAGE_NUMBER = "PageNumber";
oFF.AtlasSimpleProgram.prototype.m_orcaService = null;
oFF.AtlasSimpleProgram.prototype.m_systemName = null;
oFF.AtlasSimpleProgram.prototype.m_storyId = null;
oFF.AtlasSimpleProgram.prototype.m_pageNumber = 0;
oFF.AtlasSimpleProgram.prototype.m_activityIndicator = null;
oFF.AtlasSimpleProgram.prototype.newProgram = function()
{
	var client = new oFF.AtlasSimpleProgram();
	client.setup();
	return client;
};
oFF.AtlasSimpleProgram.prototype.getProgramName = function()
{
	return oFF.AtlasSimpleProgram.DEFAULT_PROGRAM_NAME;
};
oFF.AtlasSimpleProgram.prototype.releaseObject = function()
{
	this.m_orcaService = oFF.XObjectExt.release(this.m_orcaService);
	oFF.DfUiProgram.prototype.releaseObject.call( this );
};
oFF.AtlasSimpleProgram.prototype.doSetupProgramMetadata = function(metadata)
{
	oFF.DfUiProgram.prototype.doSetupProgramMetadata.call( this , metadata);
	metadata.addOption(oFF.AtlasSimpleProgram.PARAM_OPTION_EXTERNAL_SYSTEM_USERNAME, "Username for external data source system.", "", oFF.XValueType.STRING);
	metadata.addOption(oFF.AtlasSimpleProgram.PARAM_OPTION_EXTERNAL_SYSTEM_PASSWORD, "Password for external data source system.", "", oFF.XValueType.STRING);
	metadata.addParameter(oFF.AtlasSimpleProgram.PARAM_1_SYSTEM_NAME, "The system name as used in the system landscape.");
	metadata.addParameter(oFF.AtlasSimpleProgram.PARAM_2_STORY_ID, "The story id.");
	metadata.addParameter(oFF.AtlasSimpleProgram.PARAM_3_PAGE_NUMBER, "The page number, starting with 0.");
};
oFF.AtlasSimpleProgram.prototype.evalArguments = function()
{
	oFF.DfUiProgram.prototype.evalArguments.call( this );
	var origReturn = oFF.DfUiProgram.prototype.getSystemLandscapeUrl.call( this );
	if (oFF.isNull(origReturn))
	{
		this.setSystemLandscapeUrl("${ff_sdk}/production/systems/SystemLandscapeAllWithPwds.json");
	}
};
oFF.AtlasSimpleProgram.prototype.setupProgram = function()
{
	return null;
};
oFF.AtlasSimpleProgram.prototype.buildUi = function(genesis)
{
	this.m_activityIndicator = genesis.newControl(oFF.UiType.ACTIVITY_INDICATOR);
	this.m_activityIndicator.setText("Connecting to remote system...");
	genesis.setRoot(this.m_activityIndicator);
	this.runApp();
};
oFF.AtlasSimpleProgram.prototype.runApp = function()
{
	this.resolveArgs();
	var systemLandscape = this.getApplication().getSystemLandscape();
	var systemName = this.m_systemName;
	if (oFF.XStringUtils.containsString(this.m_systemName, "http://", true) || oFF.XStringUtils.containsString(this.m_systemName, "https://", true))
	{
		var sysUri = oFF.XUri.createFromUrl(this.m_systemName);
		systemName = oFF.OcOrcaServiceConfig.ORCA_MASTER_SYSTEM_NAME;
		systemLandscape.setSystemByUri(systemName, sysUri, null);
	}
	else
	{
		systemLandscape.setMasterSystemName(this.m_systemName);
	}
	var config = oFF.OcOrcaServiceConfig.create(this.getApplication(), systemName);
	config.processOrcaServiceCreation(oFF.SyncType.NON_BLOCKING, this, null);
};
oFF.AtlasSimpleProgram.prototype.resolveArgs = function()
{
	var initArguments = this.getArgumentStructure();
	var buffer = oFF.XStringBuffer.create().append("AtlasSimple");
	if (oFF.notNull(initArguments))
	{
		this.m_systemName = initArguments.getStringByKey(oFF.AtlasSimpleProgram.PARAM_1_SYSTEM_NAME);
		this.m_storyId = initArguments.getStringByKey(oFF.AtlasSimpleProgram.PARAM_2_STORY_ID);
		this.m_pageNumber = oFF.XInteger.convertFromString(initArguments.getStringByKeyExt(oFF.AtlasSimpleProgram.PARAM_3_PAGE_NUMBER, "0"));
	}
	this.setTitle(buffer.toString());
};
oFF.AtlasSimpleProgram.prototype.showProgressMessage = function(text, isError)
{
	if (oFF.notNull(this.m_activityIndicator))
	{
		if (isError === false)
		{
			this.m_activityIndicator.setText(text);
		}
		else
		{
			var flexLayout = this.m_genesis.newControl(oFF.UiType.FLEX_LAYOUT);
			flexLayout.setName("errorWrapperLayout");
			flexLayout.useMaxSpace();
			flexLayout.setDirection(oFF.UiFlexDirection.COLUMN);
			flexLayout.setAlignItems(oFF.UiFlexAlignItems.CENTER);
			flexLayout.setJustifyContent(oFF.UiFlexJustifyContent.CENTER);
			var errorIcon = flexLayout.newItemOfType(oFF.UiType.ICON);
			errorIcon.setIcon("alert");
			errorIcon.setColor(oFF.UiColor.RED);
			errorIcon.setSize(oFF.UiSize.createByCss("30px", "30px"));
			flexLayout.addItem(errorIcon);
			var errorLbl = flexLayout.newItemOfType(oFF.UiType.LABEL);
			errorLbl.setText(text);
			errorLbl.setFontColor(oFF.UiColor.RED);
			flexLayout.addItem(errorLbl);
			this.m_genesis.setRoot(flexLayout);
			this.m_activityIndicator = oFF.XObjectExt.release(this.m_activityIndicator);
		}
	}
};
oFF.AtlasSimpleProgram.prototype.onOrcaServiceCreated = function(extResult, orcaService, customIdentifier)
{
	if (extResult.isValid())
	{
		this.log("#1 success logon");
		this.showProgressMessage("Loading systems...", false);
		this.m_orcaService = orcaService;
		orcaService.processSystemLandscapeLoad(null, this, null, null);
	}
	else
	{
		this.log("#1 failure logon");
		this.showProgressMessage("Connection failed!", true);
		this.log(extResult.getSummary());
		oFF.UiMessageUtils.showErrorWithMessage(this.getGenesis(), extResult.getSummary());
	}
};
oFF.AtlasSimpleProgram.prototype.onSystemsLoaded = function(extResult, systems, customIdentifier)
{
	if (extResult.isValid())
	{
		var initArguments = this.getArgumentStructure();
		var extSysUser = initArguments.getStringByKey(oFF.AtlasSimpleProgram.PARAM_OPTION_EXTERNAL_SYSTEM_USERNAME);
		var extSysPwd = initArguments.getStringByKey(oFF.AtlasSimpleProgram.PARAM_OPTION_EXTERNAL_SYSTEM_PASSWORD);
		this.log("#2 success system loaded");
		this.showProgressMessage("Loading story...", false);
		var systemLandscape = this.getApplication().getSystemLandscape();
		for (var i = 0; i < systems.size(); i++)
		{
			var systemDescription = systems.get(i);
			if (oFF.XStringUtils.isNotNullAndNotEmpty(extSysUser) && oFF.XStringUtils.isNotNullAndNotEmpty(extSysPwd))
			{
				systemDescription.setUser(extSysUser);
				systemDescription.setPassword(extSysPwd);
			}
			systemLandscape.setSystemByDescription(systemDescription);
		}
		this.m_orcaService.processStoryLoad(null, this, null, this.m_storyId);
	}
	else
	{
		this.log("#2 failure system loaded");
		this.showProgressMessage("Failed to retrieve systems!", true);
		this.log(extResult.getSummary());
	}
};
oFF.AtlasSimpleProgram.prototype.onStoryLoaded = function(extResult, story, customIdentifier)
{
	if (extResult.isValid())
	{
		this.log("#4 success story loaded");
		this.showProgressMessage("Rendering story...", false);
		var quasarStory = oFF.OcQuasarStory.create(story);
		quasarStory.setQuasarMainLayoutType(oFF.OcLayoutType.CANVAS);
		var pageContentList = quasarStory.getQuasarPageDocuments();
		if (pageContentList.size() > this.m_pageNumber)
		{
			var storyDef = pageContentList.get(this.m_pageNumber);
			var poseidonClient = oFF.PoseidonClient.createWithDocument(this.getApplication().newSubApplication(null), storyDef);
			poseidonClient.runWithGenesis(this.m_genesis);
		}
		else
		{
			this.log("The specified page doesn't exist!");
			this.showProgressMessage("Story rendering failed!", true);
		}
	}
	else
	{
		this.log("#4 failure story loaded");
		this.showProgressMessage("Failed to load the specified story!", true);
		this.log(extResult.getSummary());
	}
};

oFF.NotosSimpleProgram = function() {};
oFF.NotosSimpleProgram.prototype = new oFF.DfUiProgram();
oFF.NotosSimpleProgram.prototype._ff_c = "NotosSimpleProgram";

oFF.NotosSimpleProgram.DEFAULT_PROGRAM_NAME = "NotosSimple";
oFF.NotosSimpleProgram.PARAM_OPTION_EXTERNAL_SYSTEM_USERNAME = "ExtSysUsername";
oFF.NotosSimpleProgram.PARAM_OPTION_EXTERNAL_SYSTEM_PASSWORD = "ExtSysPassword";
oFF.NotosSimpleProgram.PARAM_1_SYSTEM_NAME = "SystemName";
oFF.NotosSimpleProgram.PARAM_2_STORY_ID = "StoryId";
oFF.NotosSimpleProgram.prototype.m_orcaService = null;
oFF.NotosSimpleProgram.prototype.m_systemName = null;
oFF.NotosSimpleProgram.prototype.m_storyId = null;
oFF.NotosSimpleProgram.prototype.m_activityIndicator = null;
oFF.NotosSimpleProgram.prototype.newProgram = function()
{
	var client = new oFF.NotosSimpleProgram();
	client.setup();
	return client;
};
oFF.NotosSimpleProgram.prototype.getProgramName = function()
{
	return oFF.NotosSimpleProgram.DEFAULT_PROGRAM_NAME;
};
oFF.NotosSimpleProgram.prototype.releaseObject = function()
{
	this.m_orcaService = oFF.XObjectExt.release(this.m_orcaService);
	oFF.DfUiProgram.prototype.releaseObject.call( this );
};
oFF.NotosSimpleProgram.prototype.doSetupProgramMetadata = function(metadata)
{
	oFF.DfUiProgram.prototype.doSetupProgramMetadata.call( this , metadata);
	metadata.addOption(oFF.NotosSimpleProgram.PARAM_OPTION_EXTERNAL_SYSTEM_USERNAME, "Username for external data source system.", "", oFF.XValueType.STRING);
	metadata.addOption(oFF.NotosSimpleProgram.PARAM_OPTION_EXTERNAL_SYSTEM_PASSWORD, "Password for external data source system.", "", oFF.XValueType.STRING);
	metadata.addParameter(oFF.NotosSimpleProgram.PARAM_1_SYSTEM_NAME, "The system name as used in the system landscape.");
	metadata.addParameter(oFF.NotosSimpleProgram.PARAM_2_STORY_ID, "The story id.");
};
oFF.NotosSimpleProgram.prototype.evalArguments = function()
{
	oFF.DfUiProgram.prototype.evalArguments.call( this );
	var origReturn = oFF.DfUiProgram.prototype.getSystemLandscapeUrl.call( this );
	if (oFF.isNull(origReturn))
	{
		this.setSystemLandscapeUrl("${ff_sdk}/production/systems/SystemLandscapeAllWithPwds.json");
	}
};
oFF.NotosSimpleProgram.prototype.setupProgram = function()
{
	return null;
};
oFF.NotosSimpleProgram.prototype.buildUi = function(genesis)
{
	this.m_activityIndicator = genesis.newControl(oFF.UiType.ACTIVITY_INDICATOR);
	this.m_activityIndicator.setText("Connecting to remote system...");
	genesis.setRoot(this.m_activityIndicator);
	this.runApp();
};
oFF.NotosSimpleProgram.prototype.runApp = function()
{
	this.resolveArgs();
	var systemLandscape = this.getApplication().getSystemLandscape();
	var systemName = this.m_systemName;
	if (oFF.XStringUtils.containsString(this.m_systemName, "http://", true) || oFF.XStringUtils.containsString(this.m_systemName, "https://", true))
	{
		var sysUri = oFF.XUri.createFromUrl(this.m_systemName);
		systemName = oFF.OcOrcaServiceConfig.ORCA_MASTER_SYSTEM_NAME;
		systemLandscape.setSystemByUri(systemName, sysUri, null);
	}
	else
	{
		systemLandscape.setMasterSystemName(this.m_systemName);
	}
	var config = oFF.OcOrcaServiceConfig.create(this.getApplication(), systemName);
	var action = config.processOrcaServiceCreation(oFF.SyncType.BLOCKING, this, null);
	this.log(action.getSummary());
};
oFF.NotosSimpleProgram.prototype.resolveArgs = function()
{
	var initArguments = this.getArgumentStructure();
	var buffer = oFF.XStringBuffer.create().append("AtlasSimple");
	if (oFF.notNull(initArguments))
	{
		this.m_systemName = initArguments.getStringByKey(oFF.NotosSimpleProgram.PARAM_1_SYSTEM_NAME);
		this.m_storyId = initArguments.getStringByKey(oFF.NotosSimpleProgram.PARAM_2_STORY_ID);
	}
	this.setTitle(buffer.toString());
};
oFF.NotosSimpleProgram.prototype.showProgressMessage = function(text, isError)
{
	if (oFF.notNull(this.m_activityIndicator))
	{
		if (isError === false)
		{
			this.m_activityIndicator.setText(text);
		}
		else
		{
			var flexLayout = this.m_genesis.newControl(oFF.UiType.FLEX_LAYOUT);
			flexLayout.setName("errorWrapperLayout");
			flexLayout.useMaxSpace();
			flexLayout.setDirection(oFF.UiFlexDirection.COLUMN);
			flexLayout.setAlignItems(oFF.UiFlexAlignItems.CENTER);
			flexLayout.setJustifyContent(oFF.UiFlexJustifyContent.CENTER);
			var errorIcon = flexLayout.newItemOfType(oFF.UiType.ICON);
			errorIcon.setIcon("alert");
			errorIcon.setColor(oFF.UiColor.RED);
			errorIcon.setSize(oFF.UiSize.createByCss("30px", "30px"));
			flexLayout.addItem(errorIcon);
			var errorLbl = flexLayout.newItemOfType(oFF.UiType.LABEL);
			errorLbl.setText(text);
			errorLbl.setFontColor(oFF.UiColor.RED);
			flexLayout.addItem(errorLbl);
			this.m_genesis.setRoot(flexLayout);
			this.m_activityIndicator = oFF.XObjectExt.release(this.m_activityIndicator);
		}
	}
};
oFF.NotosSimpleProgram.prototype.onOrcaServiceCreated = function(extResult, orcaService, customIdentifier)
{
	if (extResult.isValid())
	{
		this.log("#1 success logon");
		this.showProgressMessage("Loading systems...", false);
		this.m_orcaService = orcaService;
		orcaService.processSystemLandscapeLoad(null, this, null, null);
	}
	else
	{
		this.log("#1 failure logon");
		this.showProgressMessage("Connection failed!", true);
		this.log(extResult.getSummary());
		oFF.UiMessageUtils.showErrorWithMessage(this.getGenesis(), extResult.getSummary());
	}
};
oFF.NotosSimpleProgram.prototype.onSystemsLoaded = function(extResult, systems, customIdentifier)
{
	if (extResult.isValid())
	{
		var initArguments = this.getArgumentStructure();
		var extSysUser = initArguments.getStringByKey(oFF.NotosSimpleProgram.PARAM_OPTION_EXTERNAL_SYSTEM_USERNAME);
		var extSysPwd = initArguments.getStringByKey(oFF.NotosSimpleProgram.PARAM_OPTION_EXTERNAL_SYSTEM_PASSWORD);
		this.log("#2 success system loaded");
		this.showProgressMessage("Loading story...", false);
		var systemLandscape = this.getApplication().getSystemLandscape();
		for (var i = 0; i < systems.size(); i++)
		{
			var systemDescription = systems.get(i);
			if (oFF.XStringUtils.isNotNullAndNotEmpty(extSysUser) && oFF.XStringUtils.isNotNullAndNotEmpty(extSysPwd))
			{
				systemDescription.setUser(extSysUser);
				systemDescription.setPassword(extSysPwd);
			}
			systemLandscape.setSystemByDescription(systemDescription);
		}
		this.m_orcaService.processStoryLoad(null, this, null, this.m_storyId);
	}
	else
	{
		this.log("#2 failure system loaded");
		this.showProgressMessage("Failed to retrieve systems!", true);
		this.log(extResult.getSummary());
	}
};
oFF.NotosSimpleProgram.prototype.onStoryLoaded = function(extResult, story, customIdentifier)
{
	if (extResult.isValid())
	{
		this.log("#4 success story loaded");
		this.showProgressMessage("Rendering story...", false);
		var quasarStory = oFF.OcQuasarStory.create(story);
		quasarStory.setQuasarMainLayoutType(oFF.OcLayoutType.CANVAS);
		var analyticalCardQuasarDoc = quasarStory.getQuasarAnalyticalCardDocument();
		if (oFF.notNull(analyticalCardQuasarDoc))
		{
			var poseidonClient = oFF.PoseidonClient.createWithDocument(this.getApplication().newSubApplication(null), analyticalCardQuasarDoc);
			poseidonClient.runWithGenesis(this.m_genesis);
		}
		else
		{
			this.log("Failed to extract KPI from story");
			this.showProgressMessage("Story rendering failed!", true);
		}
	}
	else
	{
		this.log("#4 failure story loaded");
		this.showProgressMessage("Failed to load the specified story!", true);
		this.log(extResult.getSummary());
	}
};

oFF.PoseidonClient = function() {};
oFF.PoseidonClient.prototype = new oFF.DfUiProgram();
oFF.PoseidonClient.prototype._ff_c = "PoseidonClient";

oFF.PoseidonClient.DEFAULT_PROGRAM_NAME = "Poseidon";
oFF.PoseidonClient.createRunner = function()
{
	var runner = oFF.KernelBoot.createByName(oFF.PoseidonClient.DEFAULT_PROGRAM_NAME);
	return runner;
};
oFF.PoseidonClient.createWithNativeJson = function(application, nativeJson)
{
	var client = oFF.PoseidonClient.create(application, null);
	client.setNativeJson(nativeJson);
	client.setFile(null);
	client.setDocument(null);
	return client;
};
oFF.PoseidonClient.createWithFile = function(application, file, fileLoadedListener)
{
	var client = oFF.PoseidonClient.create(application, null);
	client.setNativeJson(null);
	client.setFile(file);
	client.setDocument(null);
	client.setFileLoadedListener(fileLoadedListener);
	return client;
};
oFF.PoseidonClient.createWithDocument = function(application, doc)
{
	var client = oFF.PoseidonClient.create(application, null);
	client.setNativeJson(null);
	client.setFile(null);
	client.setDocument(doc);
	return client;
};
oFF.PoseidonClient.createPoseidonApp = function(nativeParentId, nativeParentObject)
{
	oFF.PoseidonModule.getInstance();
	var client = oFF.PoseidonClient.create(null, null);
	client.setNativeAnchorId(nativeParentId);
	client.setNativeAnchorObject(nativeParentObject);
	return client;
};
oFF.PoseidonClient.create = function(application, systemType)
{
	var client = new oFF.PoseidonClient();
	client.setup();
	client.setApplication(application);
	client.setInitialSystemType(systemType);
	client.initializeProgram();
	return client;
};
oFF.PoseidonClient.prototype.m_nativeJson = null;
oFF.PoseidonClient.prototype.m_file = null;
oFF.PoseidonClient.prototype.m_fileLoadedListener = null;
oFF.PoseidonClient.prototype.m_document = null;
oFF.PoseidonClient.prototype.m_core = null;
oFF.PoseidonClient.prototype.m_isContentRendered = false;
oFF.PoseidonClient.prototype.m_internalGenesis = null;
oFF.PoseidonClient.prototype.newProgram = function()
{
	var prg = new oFF.PoseidonClient();
	prg.setup();
	return prg;
};
oFF.PoseidonClient.prototype.getProgramName = function()
{
	return oFF.PoseidonClient.DEFAULT_PROGRAM_NAME;
};
oFF.PoseidonClient.prototype.doSetupProgramMetadata = function(metadata)
{
	oFF.DfUiProgram.prototype.doSetupProgramMetadata.call( this , metadata);
	metadata.addOption(oFF.DfProgram.PARAM_FILE, "Specify the poseidon file with a quasar template", "Relative URI", oFF.XValueType.STRING);
};
oFF.PoseidonClient.prototype.evalArguments = function()
{
	oFF.DfUiProgram.prototype.evalArguments.call( this );
	var argStruct = this.getArgumentStructure();
	var fileName = argStruct.getStringByKey(oFF.DfProgram.PARAM_FILE);
	if (oFF.notNull(fileName))
	{
		this.setPoseidonFileByPath(fileName, null);
	}
};
oFF.PoseidonClient.prototype.releaseObject = function()
{
	this.m_core = oFF.XObjectExt.release(this.m_core);
	this.m_internalGenesis = oFF.XObjectExt.release(this.m_internalGenesis);
	this.m_nativeJson = null;
	this.m_document = null;
	this.m_file = null;
	this.m_fileLoadedListener = null;
	oFF.DfUiProgram.prototype.releaseObject.call( this );
};
oFF.PoseidonClient.prototype.getLogSeverity = function()
{
	return oFF.DfUiProgram.prototype.getLogSeverity.call( this );
};
oFF.PoseidonClient.prototype.getMenuBarDisplayName = function()
{
	return "Poseidon";
};
oFF.PoseidonClient.prototype.isOpenContainerMaximized = function()
{
	return false;
};
oFF.PoseidonClient.prototype.isShowMenuBar = function()
{
	return true;
};
oFF.PoseidonClient.prototype.setupProgram = function()
{
	this.m_isContentRendered = false;
	return null;
};
oFF.PoseidonClient.prototype.buildUi = function(genesis)
{
	this.setTitle("Poseidon Quasar Renderer");
	this.addMenuBarButton("Refresh", "refresh", null,  function(controlEvent){
		this.refreshCurrentDocument();
	}.bind(this));
	this.m_core = oFF.QuasarEngine.create(this.getApplication());
	this.m_core.setRenderFinishedProcedure( function(){
		this.m_isContentRendered = true;
	}.bind(this));
	if (oFF.notNull(this.m_nativeJson))
	{
		this.m_core.setDocumentByNativeJson(this.m_nativeJson);
		this.m_core.renderUi(this.getInternalGenesis());
	}
	else if (oFF.notNull(this.m_document))
	{
		this.m_core.setDocument(this.m_document);
		this.m_core.renderUi(this.getInternalGenesis());
	}
	else if (oFF.notNull(this.m_file))
	{
		this.m_core.setDocumentByFile(this.m_file, this);
		this.setTitle(oFF.XStringUtils.concatenate2(this.m_file.getName(), "@Poseidon"));
		this.m_core.renderUi(this.getInternalGenesis());
	}
	else
	{
		oFF.UiMessageUtils.showErrorWithMessage(this.getGenesis(), "No file specified!");
	}
};
oFF.PoseidonClient.prototype.runOnElement = function(uiParent)
{
	this.m_genesis = oFF.UiGenesis.create(uiParent);
	this.buildUi(this.m_genesis);
};
oFF.PoseidonClient.prototype.runWithGenesis = function(genesis)
{
	this.buildUi(genesis);
};
oFF.PoseidonClient.prototype.refreshBindings = function()
{
	if (oFF.notNull(this.m_core))
	{
		this.m_core.initBindings();
	}
};
oFF.PoseidonClient.prototype.reset = function()
{
	if (oFF.notNull(this.m_core))
	{
		this.m_core.reset();
	}
	this.m_genesis.clearUi();
	this.buildUi(this.m_genesis);
};
oFF.PoseidonClient.prototype.isContentRendered = function()
{
	return this.m_isContentRendered;
};
oFF.PoseidonClient.prototype.setPoseidonFileByPath = function(filePath, fileLoadedListener)
{
	if (oFF.notNull(filePath))
	{
		var process = this.getProcess();
		var scriptFile = oFF.XFile.createWithVars(process, filePath);
		if (oFF.isNull(scriptFile) || scriptFile.hasErrors() || scriptFile.isExisting() === false)
		{
			this.log2("File does not exist: ", filePath);
			return;
		}
		this.setFile(scriptFile);
		this.setFileLoadedListener(fileLoadedListener);
	}
};
oFF.PoseidonClient.prototype.setNativeJson = function(nativeJson)
{
	this.m_nativeJson = nativeJson;
};
oFF.PoseidonClient.prototype.setFile = function(file)
{
	this.m_file = file;
};
oFF.PoseidonClient.prototype.setDocument = function(document)
{
	this.m_document = document;
};
oFF.PoseidonClient.prototype.setFileLoadedListener = function(fileLoadedListener)
{
	this.m_fileLoadedListener = fileLoadedListener;
};
oFF.PoseidonClient.prototype.refreshCurrentDocument = function()
{
	if (this.m_isContentRendered)
	{
		this.m_core.setDocument(null);
		if (oFF.notNull(this.m_nativeJson))
		{
			this.m_core.setDocumentByNativeJson(this.m_nativeJson);
		}
		else if (oFF.notNull(this.m_document))
		{
			this.m_core.setDocument(this.m_document);
		}
		else if (oFF.notNull(this.m_file))
		{
			this.m_core.setDocumentByFile(this.m_file, this);
		}
		this.m_core.renderUi(this.getInternalGenesis());
		this.m_isContentRendered = true;
	}
};
oFF.PoseidonClient.prototype.getInternalGenesis = function()
{
	if (oFF.isNull(this.m_internalGenesis))
	{
		var scrollContainer = this.getGenesis().newRoot(oFF.UiType.SCROLL_CONTAINER);
		scrollContainer.useMaxSpace();
		this.m_internalGenesis = oFF.UiGenesis.create(scrollContainer);
	}
	return this.m_internalGenesis;
};
oFF.PoseidonClient.prototype.onFileLoaded = function(extResult, file, fileContent, customIdentifier)
{
	this.log("File loaded!");
	if (oFF.notNull(this.m_fileLoadedListener))
	{
		this.m_fileLoadedListener.onFileLoaded(extResult, file, fileContent, customIdentifier);
	}
};

oFF.TridentClient = function() {};
oFF.TridentClient.prototype = new oFF.DfUiProgram();
oFF.TridentClient.prototype._ff_c = "TridentClient";

oFF.TridentClient.createStudioProgram = function(application)
{
	var client = oFF.TridentClient.create(application, null);
	return client;
};
oFF.TridentClient.createPoseidonApp = function(nativeParentId, nativeParentObject)
{
	oFF.PoseidonModule.getInstance();
	var newApplication = oFF.ApplicationFactory.createDefaultApplicationWithVersion(oFF.XVersion.MAX);
	newApplication.getSession().setDefaultSyncType(oFF.SyncType.NON_BLOCKING);
	var client = oFF.TridentClient.create(newApplication, null);
	client.setNativeAnchorId(nativeParentId);
	client.setNativeAnchorObject(nativeParentObject);
	return client;
};
oFF.TridentClient.create = function(application, systemType)
{
	var client = new oFF.TridentClient();
	client.setup();
	client.setInitialSystemType(systemType);
	client.setApplication(application);
	client.initializeProgram();
	return client;
};
oFF.TridentClient.prototype.m_quasarDocument = null;
oFF.TridentClient.prototype.newProgram = function()
{
	var prg = new oFF.TridentClient();
	prg.setup();
	return prg;
};
oFF.TridentClient.prototype.getProgramName = function()
{
	return "TridentClient";
};
oFF.TridentClient.prototype.releaseObject = function()
{
	this.m_quasarDocument = null;
	oFF.DfUiProgram.prototype.releaseObject.call( this );
};
oFF.TridentClient.prototype.setupProgram = function()
{
	return null;
};
oFF.TridentClient.prototype.buildUi = function(genesis)
{
	this.setTitle("Embedding client");
	this.showActivity("");
};
oFF.TridentClient.prototype.setContentByDocument = function(doc)
{
	if (oFF.notNull(doc))
	{
		this.m_quasarDocument = doc;
		this.m_genesis.clearUi();
		var poseidonClient = oFF.PoseidonClient.createWithDocument(this.getApplication(), this.m_quasarDocument);
		poseidonClient.runWithGenesis(this.m_genesis);
	}
	else
	{
		this.showMessage("The page has no content.");
	}
};
oFF.TridentClient.prototype.showMessage = function(msg)
{
	this.m_quasarDocument = null;
	var errorLbl = this.m_genesis.newControl(oFF.UiType.LABEL).setText(msg);
	this.m_genesis.setRoot(errorLbl);
};
oFF.TridentClient.prototype.showActivity = function(msg)
{
	this.m_quasarDocument = null;
	var loadingIndicator = this.m_genesis.newControl(oFF.UiType.ACTIVITY_INDICATOR).setText(msg).useMaxSpace();
	this.m_genesis.setRoot(loadingIndicator);
};
oFF.TridentClient.prototype.createUiElement = function(elementType)
{
	var newElement = this.m_genesis.newControl(elementType);
	return newElement;
};
oFF.TridentClient.prototype.setRootUiElement = function(rootElement)
{
	this.m_quasarDocument = null;
	this.m_genesis.setRoot(rootElement);
};
oFF.TridentClient.prototype.showTridentErrorToast = function(message)
{
	this.getGenesis().showErrorToast(message);
};
oFF.TridentClient.prototype.showTridentSuccessToast = function(message)
{
	this.getGenesis().showSuccessToast(message);
};
oFF.TridentClient.prototype.showTridentWarningToast = function(message)
{
	this.getGenesis().showWarningToast(message);
};
oFF.TridentClient.prototype.showTridentInfoToast = function(message)
{
	this.getGenesis().showInfoToast(message);
};

oFF.AppGallery = function() {};
oFF.AppGallery.prototype = new oFF.DfUiProgram();
oFF.AppGallery.prototype._ff_c = "AppGallery";

oFF.AppGallery.DEFAULT_PROGRAM_NAME = "AppGallery";
oFF.AppGallery.PARAM_PATH = "resourcesPath";
oFF.AppGallery.createRunner = function()
{
	var runner = oFF.KernelBoot.createByName(oFF.AppGallery.DEFAULT_PROGRAM_NAME);
	return runner;
};
oFF.AppGallery.createStudioProgram = function(application)
{
	var client = oFF.AppGallery.create(application, null);
	return client;
};
oFF.AppGallery.createPoseidonApp = function(nativeParentId, nativeParentObject)
{
	oFF.PoseidonModule.getInstance();
	var client = oFF.AppGallery.create(null, null);
	client.setNativeAnchorId(nativeParentId);
	client.setNativeAnchorObject(nativeParentObject);
	return client;
};
oFF.AppGallery.create = function(application, systemType)
{
	var client = new oFF.AppGallery();
	client.setup();
	client.setInitialSystemType(systemType);
	client.setApplication(application);
	client.initializeProgram();
	return client;
};
oFF.AppGallery.prototype.m_appGalleryDir = null;
oFF.AppGallery.prototype.m_navigationContainer = null;
oFF.AppGallery.prototype.m_startPage = null;
oFF.AppGallery.prototype.m_apps = null;
oFF.AppGallery.prototype.newProgram = function()
{
	var prg = new oFF.AppGallery();
	prg.setup();
	return prg;
};
oFF.AppGallery.prototype.getProgramName = function()
{
	return oFF.AppGallery.DEFAULT_PROGRAM_NAME;
};
oFF.AppGallery.prototype.doSetupProgramMetadata = function(metadata)
{
	oFF.DfUiProgram.prototype.doSetupProgramMetadata.call( this , metadata);
	metadata.addOption(oFF.AppGallery.PARAM_PATH, "Specify the path to the directory with the applications", "Relative URI", oFF.XValueType.STRING);
};
oFF.AppGallery.prototype.evalArguments = function()
{
	oFF.DfUiProgram.prototype.evalArguments.call( this );
	var argStruct = this.getArgumentStructure();
	var resourcesPath = argStruct.getStringByKey(oFF.AppGallery.PARAM_PATH);
	if (oFF.notNull(resourcesPath))
	{
		this.setAppGalleryDirByPath(resourcesPath);
	}
};
oFF.AppGallery.prototype.releaseObject = function()
{
	this.m_navigationContainer = oFF.XObjectExt.release(this.m_navigationContainer);
	this.m_startPage = oFF.XObjectExt.release(this.m_startPage);
	this.m_appGalleryDir = oFF.XObjectExt.release(this.m_appGalleryDir);
	var appIterator = this.m_apps.getKeysAsIteratorOfString();
	while (appIterator.hasNext())
	{
		var appKey = appIterator.next();
		var tmpApp = this.m_apps.getByKey(appKey);
		oFF.XObjectExt.release(tmpApp);
	}
	this.m_apps.clear();
	this.m_apps = oFF.XObjectExt.release(this.m_apps);
	oFF.DfUiProgram.prototype.releaseObject.call( this );
};
oFF.AppGallery.prototype.setupProgram = function()
{
	return null;
};
oFF.AppGallery.prototype.setDir = function(dir)
{
	this.m_appGalleryDir = dir;
};
oFF.AppGallery.prototype.getAppInfo = function(simpleName)
{
	var info = this.m_apps.getByKey(simpleName);
	if (oFF.isNull(info))
	{
		info = oFF.PsAppInfo.create(simpleName);
		this.m_apps.add(info);
	}
	return info;
};
oFF.AppGallery.prototype.setAppGalleryDirByPath = function(dirPath)
{
	if (oFF.notNull(dirPath))
	{
		var galleryDir = oFF.XFile.createFromEnvVar(this.getProcess(), oFF.XEnvironmentConstants.FIREFLY_SDK, dirPath);
		this.setDir(galleryDir);
	}
};
oFF.AppGallery.prototype.buildUi = function(genesis)
{
	this.setTitle("App Gallery");
	var activity = genesis.newControl(oFF.UiType.ACTIVITY_INDICATOR).setText("Loading...");
	genesis.setRoot(activity);
	if (oFF.isNull(this.m_appGalleryDir) || this.m_appGalleryDir.isDirectory() === false)
	{
		this.setAppGalleryDirByPath("/production/queries/poseidon/");
	}
	this.m_appGalleryDir.processFetchChildren(oFF.SyncType.NON_BLOCKING, this, null, null);
};
oFF.AppGallery.prototype.onChildrenFetched = function(extResult, file, children, resultset, customIdentifier)
{
	if (extResult.isValid())
	{
		this.m_apps = oFF.XSetOfNameObject.create();
		for (var i = 0; i < children.size(); i++)
		{
			var element = children.get(i);
			var childFile = element;
			var name = childFile.getName();
			var dotIndex = oFF.XString.lastIndexOf(name, ".");
			if (dotIndex !== -1 && oFF.XString.isEqual(".index.json", name) === false)
			{
				var simpleName = oFF.XString.substring(name, 0, dotIndex);
				var postfix = oFF.XString.substring(name, dotIndex + 1, -1);
				var info;
				if (oFF.XString.isEqual("manifest", postfix))
				{
					info = this.getAppInfo(simpleName);
					info.setText(simpleName);
				}
				else if (oFF.XString.isEqual("json", postfix))
				{
					info = this.getAppInfo(simpleName);
					info.setAppFile(childFile);
				}
				else if (oFF.XString.isEqual("png", postfix))
				{
					info = this.getAppInfo(simpleName);
					info.setImageName(oFF.XStringUtils.concatenate2(simpleName, ".png"));
					info.setImageFile(childFile);
				}
			}
		}
		this.m_navigationContainer = this.m_genesis.newControl(oFF.UiType.NAVIGATION_CONTAINER);
		this.m_navigationContainer.useMaxSpace();
		this.m_startPage = this.m_navigationContainer.pushNewPage();
		this.m_startPage.setTitle("Start Page");
		var layout = this.m_startPage.setNewContent(oFF.UiType.TILE_CONTAINER);
		layout.setPadding(oFF.UiCssBoxEdges.create("10px"));
		var iterator = this.m_apps.getKeysAsIteratorOfString();
		while (iterator.hasNext())
		{
			var key = iterator.next();
			var info2 = this.m_apps.getByKey(key);
			var element2 = layout.addNew(oFF.UiType.FILE_ICON);
			element2.setText(info2.getName());
			element2.setCustomObject(info2);
			element2.registerOnPress(this);
			element2.setSrc(info2.getImageFile().getTargetUri().getUrl());
		}
		this.m_genesis.setRoot(this.m_navigationContainer);
	}
	else
	{
		oFF.UiMessageUtils.showErrorWithMessage(this.getGenesis(), "Failed to fetch application list!");
	}
};
oFF.AppGallery.prototype.onPress = function(event)
{
	var appInfo = event.getControl().getCustomObject();
	this.log(appInfo.getName());
	var newTab = this.m_navigationContainer.pushNewPage();
	newTab.setTitle(appInfo.getName());
	var tmpFile = appInfo.getAppFile();
	if (oFF.isNull(tmpFile))
	{
		var textItem = newTab.setNewContent(oFF.UiType.TEXT).setText("App file not found!");
		textItem.setBackgroundColor(oFF.UiColor.create("#cc0033"));
		textItem.setFontColor(oFF.UiColor.create("#ffffff"));
		textItem.setFontSize(oFF.UiCssLength.createExt(15, oFF.UiCssSizeUnit.PIXEL));
	}
	else
	{
		var poseidonClient = oFF.PoseidonClient.createWithFile(this.getApplication().newSubApplication(null), tmpFile, null);
		var subGenesis = oFF.UiGenesis.create(newTab);
		poseidonClient.renderUi(subGenesis);
	}
};

oFF.PoseidonModule = function() {};
oFF.PoseidonModule.prototype = new oFF.DfModule();
oFF.PoseidonModule.prototype._ff_c = "PoseidonModule";

oFF.PoseidonModule.s_module = null;
oFF.PoseidonModule.getInstance = function()
{
	if (oFF.isNull(oFF.PoseidonModule.s_module))
	{
		oFF.DfModule.checkInitialized(oFF.SystemUiModule.getInstance());
		oFF.DfModule.checkInitialized(oFF.ApplicationUiModule.getInstance());
		oFF.PoseidonModule.s_module = oFF.DfModule.startExt(new oFF.PoseidonModule());
		oFF.ProgramRegistration.setProgramFactory(new oFF.PoseidonClient());
		oFF.ProgramRegistration.setProgramFactory(new oFF.AppGallery());
		oFF.ProgramRegistration.setProgramFactory(new oFF.AtlasSimpleProgram());
		oFF.ProgramRegistration.setProgramFactory(new oFF.NotosSimpleProgram());
		oFF.ProgramRegistration.setProgramFactory(new oFF.Asteria());
		oFF.DfModule.stopExt(oFF.PoseidonModule.s_module);
	}
	return oFF.PoseidonModule.s_module;
};
oFF.PoseidonModule.prototype.getName = function()
{
	return "ff8090.poseidon";
};

oFF.PoseidonModule.getInstance();

return sap.firefly;
	} );