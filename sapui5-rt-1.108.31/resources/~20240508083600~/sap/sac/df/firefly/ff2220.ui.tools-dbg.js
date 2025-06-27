/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap*/
sap.ui.define(
[
"sap/sac/df/firefly/ff2200.ui","sap/sac/df/firefly/ff2100.runtime"
],
function(oFF)
{
"use strict";

oFF.UiFormUtils = {

	areValuesEqual:function(value, otherValue)
	{
			if (oFF.isNull(value) && oFF.isNull(otherValue))
		{
			return true;
		}
		if (oFF.isNull(value) && oFF.notNull(otherValue))
		{
			return false;
		}
		if (oFF.notNull(value) && oFF.isNull(otherValue))
		{
			return false;
		}
		if (oFF.notNull(value))
		{
			return value.isEqualTo(otherValue);
		}
		return false;
	}
};

oFF.XFetch = {

	fetch:function(url, process)
	{
			var fetchPromise = oFF.XPromise.create( function(resolve, reject){
			var endpointUri = oFF.XUri.createFromUrl(url);
			var httpClient = oFF.HttpClientFactory.newInstanceByConnection(process, endpointUri);
			if (oFF.notNull(httpClient))
			{
				var request = httpClient.getRequest();
				request.setFromUri(endpointUri);
				request.setCorsSecured(false);
				httpClient.processHttpRequest(oFF.SyncType.NON_BLOCKING, oFF.UiLambdaHttpResponseListener.create( function(extResult, response){
					if (extResult.isValid())
					{
						var data = extResult.getData();
						if (oFF.notNull(data))
						{
							var jsonContent = data.getJsonContent();
							if (oFF.notNull(jsonContent))
							{
								if (jsonContent.isStructure())
								{
									resolve(jsonContent.asStructure());
								}
								else
								{
									reject("Invalid response!");
								}
							}
							else
							{
								reject("No json in response!");
							}
						}
						else
						{
							reject("No data available!");
						}
					}
					else
					{
						reject(extResult.getSummary());
					}
				}.bind(this)), null);
			}
			else
			{
				reject("Cannot create connection");
			}
		}.bind(this));
		return fetchPromise;
	}
};

oFF.XFilePromise = {

	saveContent:function(file, contentToSave)
	{
			var fileContentSavePromise = oFF.XPromise.create( function(resolve, reject){
			if (oFF.isNull(file))
			{
				reject("Missing file!");
				return;
			}
			if (file.isDirectory() || !file.isValid())
			{
				reject("Invalid file!");
				return;
			}
			if (oFF.isNull(contentToSave))
			{
				reject("Missing content!");
				return;
			}
			file.processSave(oFF.SyncType.NON_BLOCKING, oFF.UiLambdaFileSavedListener.create( function(extResult){
				if (oFF.notNull(extResult) && extResult.isValid())
				{
					resolve(file);
				}
				else if (oFF.notNull(extResult) && extResult.hasErrors())
				{
					reject(extResult.getFirstError().getText());
				}
				else
				{
					reject("Failed to save content to file. Unknown error!");
				}
			}.bind(this)), null, contentToSave, oFF.CompressionType.NONE);
		}.bind(this));
		return fileContentSavePromise;
	},
	saveContentRecursive:function(file, contentToSave)
	{
			return oFF.XPromise.create( function(resolve, reject){
			if (oFF.isNull(file))
			{
				reject("Missing file!");
				return;
			}
			if (file.isDirectory() || !file.isValid())
			{
				reject("Invalid file!");
				return;
			}
			if (oFF.isNull(contentToSave))
			{
				reject("Missing content!");
				return;
			}
			oFF.XFilePromise.mkdir(file.getParent(), true).then( function(directory){
				file.processSave(oFF.SyncType.NON_BLOCKING, oFF.UiLambdaFileSavedListener.create( function(extResult){
					if (oFF.notNull(extResult) && extResult.isValid())
					{
						resolve(file);
					}
					else if (oFF.notNull(extResult) && extResult.hasErrors())
					{
						reject(extResult.getFirstError().getText());
					}
					else
					{
						reject("Failed to save content to file. Unknown error!");
					}
				}.bind(this)), null, contentToSave, oFF.CompressionType.NONE);
				return directory;
			}.bind(this),  function(error){
				reject(error);
			}.bind(this));
		}.bind(this));
	},
	mkdir:function(directory, withSubDirectories)
	{
			return oFF.XPromise.create( function(resolve, reject){
			if (oFF.isNull(directory))
			{
				reject("Missing target directory path!");
				return;
			}
			if (!directory.isValid())
			{
				reject("Invalid target directory path!");
				return;
			}
			directory.processMkdir(oFF.SyncType.NON_BLOCKING, oFF.UiLambdaFileMkdirListener.create( function(extResult){
				if (extResult.isValid())
				{
					resolve(extResult.getData());
				}
				else if (!extResult.isValid() && extResult.getData().isExisting())
				{
					resolve(extResult.getData());
				}
				else if (extResult.hasErrors())
				{
					reject(extResult.getFirstError().getText());
				}
				else
				{
					reject("Failed to create directories. Unknown error!");
				}
			}.bind(this)), null, withSubDirectories);
		}.bind(this));
	},
	loadContent:function(file)
	{
			var fileContentLoadPromise = oFF.XPromise.create( function(resolve, reject){
			if (oFF.isNull(file))
			{
				reject("Missing file!");
				return;
			}
			if (file.isDirectory() || !file.isValid())
			{
				reject("Invalid file!");
				return;
			}
			file.processLoad(oFF.SyncType.NON_BLOCKING, oFF.UiLambdaFileLoadedListener.create( function(extResult, fileContent){
				if (oFF.notNull(extResult) && extResult.isValid() && oFF.notNull(fileContent))
				{
					resolve(fileContent);
				}
				else if (oFF.notNull(extResult) && extResult.hasErrors())
				{
					reject(extResult.getFirstError().getText());
				}
				else
				{
					reject("Failed to load the file content!");
				}
			}.bind(this)), null, oFF.CompressionType.NONE);
		}.bind(this));
		return fileContentLoadPromise;
	},
	loadJsonContent:function(file)
	{
			var fileJsonContentLoadPromise = oFF.XPromise.create( function(resolve, reject){
			oFF.XFilePromise.loadContent(file).then( function(loadedContent){
				if (oFF.notNull(loadedContent))
				{
					var jsonContent = loadedContent.getJsonContent();
					if (oFF.notNull(jsonContent) && jsonContent.isStructure())
					{
						var jsonObj = jsonContent.asStructure();
						resolve(jsonObj);
					}
					else
					{
						reject("Not a json document!");
					}
				}
				else
				{
					reject("Something went wrong! File content is empty!");
				}
				return loadedContent;
			}.bind(this),  function(errorMsg){
				reject(errorMsg);
			}.bind(this));
		}.bind(this));
		return fileJsonContentLoadPromise;
	},
	fetchChildren:function(dir)
	{
			var dirFetchChildrenPromise = oFF.XPromise.create( function(resolve, reject){
			if (oFF.isNull(dir))
			{
				reject("Missing file!");
				return;
			}
			if (!dir.isDirectory())
			{
				reject("File is not a directory!");
				return;
			}
			dir.processFetchChildren(oFF.SyncType.NON_BLOCKING, oFF.UiLambdaFileFetchChildrenListener.create( function(extResult, children){
				if (oFF.notNull(extResult) && extResult.isValid())
				{
					resolve(children);
				}
				else if (oFF.notNull(extResult) && extResult.hasErrors())
				{
					reject(extResult.getFirstError().getText());
				}
				else
				{
					reject("Failed to fetch the directory children!");
				}
			}.bind(this)), null, null);
		}.bind(this));
		return dirFetchChildrenPromise;
	},
	isExisting:function(file)
	{
			var fileExistsPromise = oFF.XPromise.create( function(resolve, reject){
			if (oFF.isNull(file))
			{
				reject("Missing file!");
				return;
			}
			if (!file.isValid())
			{
				reject("Invalid file!");
				return;
			}
			file.processIsExisting(oFF.SyncType.NON_BLOCKING, oFF.UiLambdaFileIsExistingListener.create( function(extResult, result){
				if (oFF.notNull(extResult) && extResult.isValid())
				{
					resolve(result);
				}
				else if (oFF.notNull(extResult) && extResult.hasErrors())
				{
					reject(extResult.getFirstError().getText());
				}
				else
				{
					reject("Failed to check file existence! Unknown error!");
				}
			}.bind(this)), null);
		}.bind(this));
		return fileExistsPromise;
	},
	duplicateFile:function(file)
	{
			var fileDuplicatePromise = oFF.XPromise.create( function(resolve, reject){
			if (oFF.isNull(file))
			{
				reject("Missing file!");
				return;
			}
			if (file.isDirectory())
			{
				reject("A directory cannot be duplicated!");
				return;
			}
			if (!file.isValid())
			{
				reject("Invalid file!");
				return;
			}
			var copyName = oFF.UiFileUtils.generateDuplicateName(file);
			var duplicateFile = file.newSibling(copyName);
			oFF.XFilePromise.loadContent(file).then( function(loadedContent){
				oFF.XFilePromise.saveContent(duplicateFile, loadedContent).then( function(savedFile){
					oFF.XFilePromise.isExisting(duplicateFile).then( function(result){
						if (result.getBoolean() === true)
						{
							resolve(duplicateFile);
						}
						else
						{
							reject("Failed to create duplicate file! Unknown error!");
						}
						return result;
					}.bind(this),  function(errorMsg3){
						reject(errorMsg3);
					}.bind(this));
					return savedFile;
				}.bind(this),  function(errorMsg2){
					reject(errorMsg2);
				}.bind(this));
				return loadedContent;
			}.bind(this),  function(errorMsg){
				reject(errorMsg);
			}.bind(this));
		}.bind(this));
		return fileDuplicatePromise;
	}
};

oFF.UiStylingHelper = {

	s_activeStylingProvider:null,
	getActiveProvider:function()
	{
			if (oFF.isNull(oFF.UiStylingHelper.s_activeStylingProvider))
		{
			var stylingProvider = new oFF.UiUi5StylingProvider();
			oFF.UiStylingHelper.s_activeStylingProvider = stylingProvider;
		}
		return oFF.UiStylingHelper.s_activeStylingProvider;
	}
};

oFF.UiUi5StylingProvider = function() {};
oFF.UiUi5StylingProvider.prototype = new oFF.XObject();
oFF.UiUi5StylingProvider.prototype._ff_c = "UiUi5StylingProvider";

oFF.UiUi5StylingProvider.MARGIN_TINY = "sapUiTinyMargin";
oFF.UiUi5StylingProvider.MARGIN_SMALL = "sapUiSmallMargin";
oFF.UiUi5StylingProvider.MARGIN_MEDIUM = "sapUiMediumMargin";
oFF.UiUi5StylingProvider.MARGIN_LARGE = "sapUiLargeMargin";
oFF.UiUi5StylingProvider.MARGIN_TINY_TOP = "sapUiTinyMarginTop";
oFF.UiUi5StylingProvider.MARGIN_SMALL_TOP = "sapUiSmallMarginTop";
oFF.UiUi5StylingProvider.MARGIN_MEDIUM_TOP = "sapUiMediumMarginTop";
oFF.UiUi5StylingProvider.MARGIN_LARGE_TOP = "sapUiLargeMarginTop";
oFF.UiUi5StylingProvider.MARGIN_TINY_BOTTOM = "sapUiTinyMarginBottom";
oFF.UiUi5StylingProvider.MARGIN_SMALL_BOTTOM = "sapUiSmallMarginBottom";
oFF.UiUi5StylingProvider.MARGIN_MEDIUM_BOTTOM = "sapUiMediumMarginBottom";
oFF.UiUi5StylingProvider.MARGIN_LARGE_BOTTOM = "sapUiLargeMarginBottom";
oFF.UiUi5StylingProvider.MARGIN_TINY_BEGIN = "sapUiTinyMarginBegin";
oFF.UiUi5StylingProvider.MARGIN_SMALL_BEGIN = "sapUiSmallMarginBegin";
oFF.UiUi5StylingProvider.MARGIN_MEDIUM_BEGIN = "sapUiMediumMarginBegin";
oFF.UiUi5StylingProvider.MARGIN_LARGE_BEGIN = "sapUiLargeMarginBegin";
oFF.UiUi5StylingProvider.MARGIN_TINY_END = "sapUiTinyMarginEnd";
oFF.UiUi5StylingProvider.MARGIN_SMALL_END = "sapUiSmallMarginEnd";
oFF.UiUi5StylingProvider.MARGIN_MEDIUM_END = "sapUiMediumMarginEnd";
oFF.UiUi5StylingProvider.MARGIN_LARGE_END = "sapUiLargeMarginEnd";
oFF.UiUi5StylingProvider.MARGIN_TINY_BEGIN_END = "sapUiTinyMarginBeginEnd";
oFF.UiUi5StylingProvider.MARGIN_SMALL_BEGIN_END = "sapUiSmallMarginBeginEnd";
oFF.UiUi5StylingProvider.MARGIN_MEDIUM_BEGIN_END = "sapUiMediumMarginBeginEnd";
oFF.UiUi5StylingProvider.MARGIN_LARGE_BEGIN_END = "sapUiLargeMarginBeginEnd";
oFF.UiUi5StylingProvider.MARGIN_TINY_TOP_BOTTOM = "sapUiTinyMarginTopBottom";
oFF.UiUi5StylingProvider.MARGIN_SMALL_TOP_BOTTOM = "sapUiSmallMarginTopBottom";
oFF.UiUi5StylingProvider.MARGIN_MEDIUM_TOP_BOTTOM = "sapUiMediumMarginTopBottom";
oFF.UiUi5StylingProvider.MARGIN_LARGE_TOP_BOTTOM = "sapUiLargeMarginTopBottom";
oFF.UiUi5StylingProvider.MARGIN_RESPONSIVE = "sapUiResponsiveMargin";
oFF.UiUi5StylingProvider.FORCE_WIDTH_AUTO = "sapUiForceWidthAuto";
oFF.UiUi5StylingProvider.NO_MARGIN = "sapUiNoMargin";
oFF.UiUi5StylingProvider.NO_MARGIN_TOP = "sapUiNoMarginTop";
oFF.UiUi5StylingProvider.NO_MARGIN_BOTTOM = "sapUiNoMarginBottom";
oFF.UiUi5StylingProvider.NO_MARGIN_BEGIN = "sapUiNoMarginBegin";
oFF.UiUi5StylingProvider.NO_MARGIN_END = "sapUiNoMarginEnd";
oFF.UiUi5StylingProvider.NO_CONTENT_PADDING = "sapUiNoContentPadding";
oFF.UiUi5StylingProvider.CONTENT_PADDING = "sapUiContentPadding";
oFF.UiUi5StylingProvider.CONTENT_PADDING_RESPONSIVE = "sapUiResponsiveContentPadding";
oFF.UiUi5StylingProvider.prototype.removeStyling = function(control)
{
	this.removeCssClass(control, oFF.UiUi5StylingProvider.MARGIN_TINY);
	this.removeCssClass(control, oFF.UiUi5StylingProvider.MARGIN_SMALL);
	this.removeCssClass(control, oFF.UiUi5StylingProvider.MARGIN_MEDIUM);
	this.removeCssClass(control, oFF.UiUi5StylingProvider.MARGIN_LARGE);
	this.removeCssClass(control, oFF.UiUi5StylingProvider.MARGIN_TINY_TOP);
	this.removeCssClass(control, oFF.UiUi5StylingProvider.MARGIN_SMALL_TOP);
	this.removeCssClass(control, oFF.UiUi5StylingProvider.MARGIN_MEDIUM_TOP);
	this.removeCssClass(control, oFF.UiUi5StylingProvider.MARGIN_LARGE_TOP);
	this.removeCssClass(control, oFF.UiUi5StylingProvider.MARGIN_TINY_BOTTOM);
	this.removeCssClass(control, oFF.UiUi5StylingProvider.MARGIN_SMALL_BOTTOM);
	this.removeCssClass(control, oFF.UiUi5StylingProvider.MARGIN_MEDIUM_BOTTOM);
	this.removeCssClass(control, oFF.UiUi5StylingProvider.MARGIN_LARGE_BOTTOM);
	this.removeCssClass(control, oFF.UiUi5StylingProvider.MARGIN_TINY_BEGIN);
	this.removeCssClass(control, oFF.UiUi5StylingProvider.MARGIN_SMALL_BEGIN);
	this.removeCssClass(control, oFF.UiUi5StylingProvider.MARGIN_MEDIUM_BEGIN);
	this.removeCssClass(control, oFF.UiUi5StylingProvider.MARGIN_LARGE_BEGIN);
	this.removeCssClass(control, oFF.UiUi5StylingProvider.MARGIN_TINY_END);
	this.removeCssClass(control, oFF.UiUi5StylingProvider.MARGIN_SMALL_END);
	this.removeCssClass(control, oFF.UiUi5StylingProvider.MARGIN_MEDIUM_END);
	this.removeCssClass(control, oFF.UiUi5StylingProvider.MARGIN_LARGE_END);
	this.removeCssClass(control, oFF.UiUi5StylingProvider.MARGIN_TINY_BEGIN_END);
	this.removeCssClass(control, oFF.UiUi5StylingProvider.MARGIN_SMALL_BEGIN_END);
	this.removeCssClass(control, oFF.UiUi5StylingProvider.MARGIN_MEDIUM_BEGIN_END);
	this.removeCssClass(control, oFF.UiUi5StylingProvider.MARGIN_LARGE_BEGIN_END);
	this.removeCssClass(control, oFF.UiUi5StylingProvider.MARGIN_TINY_TOP_BOTTOM);
	this.removeCssClass(control, oFF.UiUi5StylingProvider.MARGIN_SMALL_TOP_BOTTOM);
	this.removeCssClass(control, oFF.UiUi5StylingProvider.MARGIN_MEDIUM_TOP_BOTTOM);
	this.removeCssClass(control, oFF.UiUi5StylingProvider.MARGIN_LARGE_TOP_BOTTOM);
	this.removeCssClass(control, oFF.UiUi5StylingProvider.MARGIN_RESPONSIVE);
	this.removeCssClass(control, oFF.UiUi5StylingProvider.FORCE_WIDTH_AUTO);
	this.removeCssClass(control, oFF.UiUi5StylingProvider.NO_MARGIN);
	this.removeCssClass(control, oFF.UiUi5StylingProvider.NO_MARGIN_TOP);
	this.removeCssClass(control, oFF.UiUi5StylingProvider.NO_MARGIN_BOTTOM);
	this.removeCssClass(control, oFF.UiUi5StylingProvider.NO_MARGIN_BEGIN);
	this.removeCssClass(control, oFF.UiUi5StylingProvider.NO_MARGIN_END);
	this.removeCssClass(control, oFF.UiUi5StylingProvider.NO_CONTENT_PADDING);
	this.removeCssClass(control, oFF.UiUi5StylingProvider.CONTENT_PADDING);
	this.removeCssClass(control, oFF.UiUi5StylingProvider.CONTENT_PADDING_RESPONSIVE);
	return control;
};
oFF.UiUi5StylingProvider.prototype.applyMarginTiny = function(control)
{
	return this.addCssClass(control, oFF.UiUi5StylingProvider.MARGIN_TINY);
};
oFF.UiUi5StylingProvider.prototype.applyMarginSmall = function(control)
{
	return this.addCssClass(control, oFF.UiUi5StylingProvider.MARGIN_SMALL);
};
oFF.UiUi5StylingProvider.prototype.applyMarginMedium = function(control)
{
	return this.addCssClass(control, oFF.UiUi5StylingProvider.MARGIN_MEDIUM);
};
oFF.UiUi5StylingProvider.prototype.applyMarginLarge = function(control)
{
	return this.addCssClass(control, oFF.UiUi5StylingProvider.MARGIN_LARGE);
};
oFF.UiUi5StylingProvider.prototype.applyMarginTinyTop = function(control)
{
	return this.addCssClass(control, oFF.UiUi5StylingProvider.MARGIN_TINY_TOP);
};
oFF.UiUi5StylingProvider.prototype.applyMarginSmallTop = function(control)
{
	return this.addCssClass(control, oFF.UiUi5StylingProvider.MARGIN_SMALL_TOP);
};
oFF.UiUi5StylingProvider.prototype.applyMarginMediumTop = function(control)
{
	return this.addCssClass(control, oFF.UiUi5StylingProvider.MARGIN_MEDIUM_TOP);
};
oFF.UiUi5StylingProvider.prototype.applyMarginLargeTop = function(control)
{
	return this.addCssClass(control, oFF.UiUi5StylingProvider.MARGIN_LARGE_TOP);
};
oFF.UiUi5StylingProvider.prototype.applyMarginTinyBottom = function(control)
{
	return this.addCssClass(control, oFF.UiUi5StylingProvider.MARGIN_TINY_BOTTOM);
};
oFF.UiUi5StylingProvider.prototype.applyMarginSmallBottom = function(control)
{
	return this.addCssClass(control, oFF.UiUi5StylingProvider.MARGIN_SMALL_BOTTOM);
};
oFF.UiUi5StylingProvider.prototype.applyMarginMediumBottom = function(control)
{
	return this.addCssClass(control, oFF.UiUi5StylingProvider.MARGIN_MEDIUM_BOTTOM);
};
oFF.UiUi5StylingProvider.prototype.applyMarginLargeBottom = function(control)
{
	return this.addCssClass(control, oFF.UiUi5StylingProvider.MARGIN_LARGE_BOTTOM);
};
oFF.UiUi5StylingProvider.prototype.applyMarginTinyBegin = function(control)
{
	return this.addCssClass(control, oFF.UiUi5StylingProvider.MARGIN_TINY_BEGIN);
};
oFF.UiUi5StylingProvider.prototype.applyMarginSmallBegin = function(control)
{
	return this.addCssClass(control, oFF.UiUi5StylingProvider.MARGIN_SMALL_BEGIN);
};
oFF.UiUi5StylingProvider.prototype.applyMarginMediumBegin = function(control)
{
	return this.addCssClass(control, oFF.UiUi5StylingProvider.MARGIN_MEDIUM_BEGIN);
};
oFF.UiUi5StylingProvider.prototype.applyMarginLargeBegin = function(control)
{
	return this.addCssClass(control, oFF.UiUi5StylingProvider.MARGIN_LARGE_BEGIN);
};
oFF.UiUi5StylingProvider.prototype.applyMarginTinyEnd = function(control)
{
	return this.addCssClass(control, oFF.UiUi5StylingProvider.MARGIN_TINY_END);
};
oFF.UiUi5StylingProvider.prototype.applyMarginSmallEnd = function(control)
{
	return this.addCssClass(control, oFF.UiUi5StylingProvider.MARGIN_SMALL_END);
};
oFF.UiUi5StylingProvider.prototype.applyMarginMediumEnd = function(control)
{
	return this.addCssClass(control, oFF.UiUi5StylingProvider.MARGIN_MEDIUM_END);
};
oFF.UiUi5StylingProvider.prototype.applyMarginLargeEnd = function(control)
{
	return this.addCssClass(control, oFF.UiUi5StylingProvider.MARGIN_LARGE_END);
};
oFF.UiUi5StylingProvider.prototype.applyMarginTinyBeginEnd = function(control)
{
	return this.addCssClass(control, oFF.UiUi5StylingProvider.MARGIN_TINY_BEGIN_END);
};
oFF.UiUi5StylingProvider.prototype.applyMarginSmallBeginEnd = function(control)
{
	return this.addCssClass(control, oFF.UiUi5StylingProvider.MARGIN_SMALL_BEGIN_END);
};
oFF.UiUi5StylingProvider.prototype.applyMarginMediumBeginEnd = function(control)
{
	return this.addCssClass(control, oFF.UiUi5StylingProvider.MARGIN_MEDIUM_BEGIN_END);
};
oFF.UiUi5StylingProvider.prototype.applyMarginLargeBeginEnd = function(control)
{
	return this.addCssClass(control, oFF.UiUi5StylingProvider.MARGIN_LARGE_BEGIN_END);
};
oFF.UiUi5StylingProvider.prototype.applyMarginTinyTopBottom = function(control)
{
	return this.addCssClass(control, oFF.UiUi5StylingProvider.MARGIN_TINY_TOP_BOTTOM);
};
oFF.UiUi5StylingProvider.prototype.applyMarginSmallTopBottom = function(control)
{
	return this.addCssClass(control, oFF.UiUi5StylingProvider.MARGIN_SMALL_TOP_BOTTOM);
};
oFF.UiUi5StylingProvider.prototype.applyMarginMediumTopBottom = function(control)
{
	return this.addCssClass(control, oFF.UiUi5StylingProvider.MARGIN_MEDIUM_TOP_BOTTOM);
};
oFF.UiUi5StylingProvider.prototype.applyMarginLargeTopBottom = function(control)
{
	return this.addCssClass(control, oFF.UiUi5StylingProvider.MARGIN_LARGE_TOP_BOTTOM);
};
oFF.UiUi5StylingProvider.prototype.applyMarginResponsive = function(control)
{
	return this.addCssClass(control, oFF.UiUi5StylingProvider.MARGIN_RESPONSIVE);
};
oFF.UiUi5StylingProvider.prototype.applyNoMargin = function(control)
{
	return this.addCssClass(control, oFF.UiUi5StylingProvider.NO_MARGIN);
};
oFF.UiUi5StylingProvider.prototype.applyNoMarginTop = function(control)
{
	return this.addCssClass(control, oFF.UiUi5StylingProvider.NO_MARGIN_TOP);
};
oFF.UiUi5StylingProvider.prototype.applyNoMarginBottom = function(control)
{
	return this.addCssClass(control, oFF.UiUi5StylingProvider.NO_MARGIN_BOTTOM);
};
oFF.UiUi5StylingProvider.prototype.applyNoMarginBegin = function(control)
{
	return this.addCssClass(control, oFF.UiUi5StylingProvider.NO_MARGIN_BEGIN);
};
oFF.UiUi5StylingProvider.prototype.applyNoMarginEnd = function(control)
{
	return this.addCssClass(control, oFF.UiUi5StylingProvider.NO_MARGIN_END);
};
oFF.UiUi5StylingProvider.prototype.applyForceAutoWidth = function(control)
{
	return this.addCssClass(control, oFF.UiUi5StylingProvider.FORCE_WIDTH_AUTO);
};
oFF.UiUi5StylingProvider.prototype.applyNoContentPadding = function(control)
{
	return this.addCssClass(control, oFF.UiUi5StylingProvider.NO_CONTENT_PADDING);
};
oFF.UiUi5StylingProvider.prototype.applyContentPadding = function(control)
{
	return this.addCssClass(control, oFF.UiUi5StylingProvider.CONTENT_PADDING);
};
oFF.UiUi5StylingProvider.prototype.applyContentPaddingResponsive = function(control)
{
	return this.addCssClass(control, oFF.UiUi5StylingProvider.CONTENT_PADDING_RESPONSIVE);
};
oFF.UiUi5StylingProvider.prototype.addCssClass = function(control, cssClass)
{
	if (oFF.notNull(control) && oFF.XStringUtils.isNotNullAndNotEmpty(cssClass))
	{
		control.addCssClass(cssClass);
	}
	return control;
};
oFF.UiUi5StylingProvider.prototype.removeCssClass = function(control, cssClass)
{
	if (oFF.notNull(control) && oFF.XStringUtils.isNotNullAndNotEmpty(cssClass))
	{
		control.removeCssClass(cssClass);
	}
	return control;
};

oFF.UiTheme = {

	DEFAULT:null,
	SAC:null,
	s_singeltonInstance:null,
	s_themeMap:null,
	staticSetup:function()
	{
			oFF.UiTheme.s_themeMap = oFF.XHashMapByString.create();
		oFF.UiTheme.DEFAULT = oFF.UiTheme.create(oFF.UiThemeDefault.createDefaultTheme(), "default");
		oFF.UiTheme.SAC = oFF.UiTheme.create(oFF.UiThemeSac.createSacTheme(), "sac");
	},
	create:function(theme, name)
	{
			if (oFF.UiTheme.s_themeMap.containsKey(name))
		{
			throw oFF.XException.createIllegalArgumentException(oFF.XStringUtils.concatenate2("Theme already exists: ", name));
		}
		oFF.UiTheme.s_themeMap.put(name, theme);
		oFF.UiTheme.s_themeMap.put(oFF.XString.toLowerCase(name), theme);
		oFF.UiTheme.s_themeMap.put(oFF.XString.toUpperCase(name), theme);
		return theme;
	},
	lookup:function(value)
	{
			return oFF.UiTheme.s_themeMap.getByKey(value);
	},
	getCurrentTheme:function()
	{
			if (oFF.isNull(oFF.UiTheme.s_singeltonInstance))
		{
			oFF.UiTheme.setCurrentTheme(oFF.UiTheme.DEFAULT);
		}
		return oFF.UiTheme.s_singeltonInstance;
	},
	setCurrentTheme:function(themeInstance)
	{
			if (oFF.notNull(oFF.UiTheme.s_singeltonInstance))
		{
			oFF.UiTheme.s_singeltonInstance = oFF.XObjectExt.release(oFF.UiTheme.s_singeltonInstance);
		}
		oFF.UiTheme.s_singeltonInstance = themeInstance;
	}
};

oFF.UiThemeDefault = function() {};
oFF.UiThemeDefault.prototype = new oFF.XObject();
oFF.UiThemeDefault.prototype._ff_c = "UiThemeDefault";

oFF.UiThemeDefault.createDefaultTheme = function()
{
	var newUiTheme = new oFF.UiThemeDefault();
	return newUiTheme;
};
oFF.UiThemeDefault.prototype.getDialogWidth = function()
{
	return oFF.UiCssLength.create("600px");
};
oFF.UiThemeDefault.prototype.getDialogPadding = function()
{
	return oFF.UiCssBoxEdges.create("1rem");
};
oFF.UiThemeDefault.prototype.getDialogBtnMinWidth = function()
{
	return oFF.UiCssLength.create("80px");
};
oFF.UiThemeDefault.prototype.getLightGrayColor = function()
{
	return oFF.UiColor.create("#cbc2c2");
};
oFF.UiThemeDefault.prototype.getSuccessColor = function()
{
	return oFF.UiColor.create("#38a238");
};
oFF.UiThemeDefault.prototype.getInformationColor = function()
{
	return oFF.UiColor.create("#427cac");
};
oFF.UiThemeDefault.prototype.getWarningColor = function()
{
	return oFF.UiColor.create("#f9a429");
};
oFF.UiThemeDefault.prototype.getErrorColor = function()
{
	return oFF.UiColor.create("#e00");
};
oFF.UiThemeDefault.prototype.getErrorBackgroundColor = function()
{
	return oFF.UiColor.create("#ffe4e4");
};
oFF.UiThemeDefault.prototype.getWarningBackgroundColor = function()
{
	return oFF.UiColor.create("#fef0db");
};
oFF.UiThemeDefault.prototype.getCustomActivityIndicatorIcon = function()
{
	return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAsQAAALEBxi1JjQAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAMUSURBVEiJrZZLbFVVFIa/f5/Ti7UWq4bYFNHgQEwkyqAiieiAxGBMjGmJqEQiAx048ZmYaNL2WkwLEZSXGlNmTUysASJOQElQGBGMKWEAxoF1QlQMYNPXvfec/TvoU0ofof2Ha6/z/Wutfc7ZW8ykom9RyH8XnIjmMLXJMd7R8Iz5M0gzruzzEl3L+4D6scigxNG4Ktl6+jGaJb7AvLT+Pv0wm0G4YfTDrEnX8l+nwAFqiFxhs3IFlgJ3ElgG8O0FNx885zfn7sBWaM92W3p7vGqgBkDmy9iavI5kgJ8v+dbGBg0dP+eagSXu7+tH764N0wr+XyC055+NwS37Y8ekEUCiayocoLFBQwAbH9HgPyUdWlpQ1+wdtGevCrqAaLONtrR7bFzP4+QQRcUbAaaq86zvHyn5yL9l/bRng94ASAEoul7knwIYvU9b0j3xVFv6zVzgcWUl1lwZ0cPG6cRUAILyD4DbgDPEsGu+wOvVsl6HC4FNaaLHx2Maex3/BOosb6Sl6vubNRjX1uNeeXmIF9edY2fK1exJpDrgEnl6YqFwgBD5/HLFT59crZGUEBqxEZzyPDZyPvpjhGOJWHF7HV+lIXq5Bdi/LQYc4Mcm7QX2AqSIaoAYQmmxDB7o8fKBgXx/JefrFPsvJIJdvyjzASplmoczNUVzbxoV+oQxrFokPlcrdAexuhDDLlH0gwr5BaDimNRT1JXFMgIIFHURdB6oIomvLBSYHqg8lezOhsKOyp5RA8BwAEB2Kx1etqCKS7rbw65GapiM9jhRe96r9sxqz06yz0tuiv6eR/ex03eMhyb/psXyGoVwCqgFvnNMXqao/nmBP3F1GMgPesRbHDnKjqrnJjqaNCj0Wt4MlIFnFbKzbM+emRO+vbJBA/GMM7ZQGj2Lpi5PP5M/Kq9TDD3AitEM/WJzBOJplP4NZMTsHhQelb0JWEvZUCK64LfoKOyf3QCgw3eFctbqoNdg9EufJgNlw4hMlc9b6Qt06uL1aTPfKgBa/BAx2ybpCeyVNrXKVUAexBp2iCdR1U461DsT4j8tvEUHScegaAAAAABJRU5ErkJggg==";
};
oFF.UiThemeDefault.prototype.getCustomActivityIndicatorIconAlt = function()
{
	return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAsQAAALEBxi1JjQAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAOgSURBVEiJnZVvTNVlFMc/57k/hHTYBVkRpqzJ8EUNa7iFLuLmi3Bt+aKCRRK0srBpKxxZbZW3tl4UswihPwaJU8Hl5qauFm8aW5PlnAOkco4UUTIJ5Z8wg/u7z+mN9/a7VyTg++p3znPO93vOc357jjBLPFlWthzXVyfwqAqXRXXH0eamQ/+XJ7MhDwSCzuKMC6dAcjxuK0YDR/Y3/TxTrhPvKAoGFyQNjWf7jNvfVFMzAuDP6F1lMTlxoUYtzwEzChiv8cLWqsDCqxN9xkq3ugmD5Vu2vwNgrWOnTxeNfA0OXy+4MjRa0turSdMKFBUV+RRpAdKj3Yl+VLalas3YlWXdQEccuxXLfoCBq6PPW2vbRGlelDwWM5eoQHLaikwPebREAw+3tQVdR3wbgMMKQ6CnReSZIwf3tAOIaEEkQYWAlyA6Ayc8dCnsu3MYSIkp02e6AA4faOgHno6/JACrNIuwEUgSaIyp0GuUb92+AXQfsBhQoGZvXfW26UjjMTAwfnfYp6kZaclnbisA8FJlZao7lfAQRi/s3VV9bjbkXpy7PLQc3M1gxkIJWi+v1dYm+qect0QpRPjTqHwYfPPVX+dKDNDT05Moi/xngUwAEY6Z1MmET0X5AFiLUmTRtmD1l3fNR8Dc4c+MkAOoUmAUfTYubkkYfXw+AheXpp0HfovYAkcd4BqQ6g0U4dp8BB4Tcfv6RvJDzlQpxowNpy9pdozo21alBVhwM67VjP/dOh8BgMxM/zCwK1oswLsff7HSiKxDbL+ZGPw+GAze5mmYGb909eQh0gjcA9Tl5WS9H/Ob1u/5Lj3khgtEufT6KyXtcxY4/cdZIDtiWzQQfSo+/+ZAbsh1z4AeVNHjNbubv5oLuaoKyFKvTzD3RgUs5j3A7zmtqGnct3K2AiKiCrujgnDRxfnBsw/Uf0uW69zq86D1+MkHCJtyREZDOPVrclZsO9HZ04pIunUSj+Xfv2w4OoPPGlpeFNXoQyXQnWSv56akZCfekH92CJIHetJMarC09ImxH9tPZUmYLmDhzQI7R/86v7q4uDjsLSJ6RZWbSr5FtBhoUeWTkGVdRUVF6IZM1gpSBTwCUmkT5WsALOv/IweQB5Mz7suK7zJmZb6xaeMhIH6RF8aaUgggYX6P3YeMmIkF/fECJt4RD1HpjPVoB0BhQe5PilaB9qrQoaJPFRaumpixg+nghtmc4GiDImsVToialyNn6/NX7wR2zpT/L/sqUVMZd9+sAAAAAElFTkSuQmCC";
};

oFF.UiFileUtils = {

	getParentDirPath:function(file)
	{
			if (oFF.notNull(file) && file.getParent() !== null && file.getParent().isDirectory())
		{
			return file.getParent().getUri().getPath();
		}
		return null;
	},
	generateDuplicateName:function(file)
	{
			if (oFF.isNull(file))
		{
			return null;
		}
		var copyName = file.getName();
		var lastDotIndex = oFF.XString.lastIndexOf(copyName, ".");
		if (lastDotIndex > 0)
		{
			var startStr = oFF.XString.substring(copyName, 0, lastDotIndex);
			var endStr = oFF.XString.substring(copyName, lastDotIndex, -1);
			copyName = oFF.XStringUtils.concatenate3(startStr, "_copy", endStr);
		}
		else
		{
			copyName = oFF.XStringUtils.concatenate2(copyName, "_copy");
		}
		return copyName;
	}
};

oFF.UiStringUtils = {

	HIGHLIGHTED_STYLE_DEFAULT:"style=\"background-color: #cfe4f6;\"",
	getHighlightedText:function(text, textToHighlight)
	{
			return oFF.UiStringUtils.getHighlightedTextExt(text, textToHighlight, null);
	},
	getHighlightedTextExt:function(text, textToHighlight, styleToApply)
	{
			if (oFF.XStringUtils.isNullOrEmpty(text) || oFF.XStringUtils.isNullOrEmpty(textToHighlight))
		{
			return text;
		}
		var highlightedText = oFF.XStringBuffer.create();
		var startIndex = oFF.XString.indexOf(oFF.XString.toUpperCase(text), oFF.XString.toUpperCase(textToHighlight));
		if (startIndex !== -1)
		{
			var firstPart = oFF.XString.substring(text, 0, startIndex);
			if (oFF.XString.size(firstPart) > 0)
			{
				highlightedText.append("<span>");
				highlightedText.append(firstPart);
				highlightedText.append("</span>");
			}
			var highlightPart = oFF.XString.substring(text, startIndex, startIndex + oFF.XString.size(textToHighlight));
			highlightedText.append("<span ");
			highlightedText.append(oFF.notNull(styleToApply) ? styleToApply : oFF.UiStringUtils.HIGHLIGHTED_STYLE_DEFAULT);
			highlightedText.append(">");
			highlightedText.append(highlightPart);
			highlightedText.append("</span>");
			var lastPart = oFF.XString.substring(text, startIndex + oFF.XString.size(textToHighlight), oFF.XString.size(text));
			if (oFF.XString.size(lastPart) > 0)
			{
				highlightedText.append("<span>");
				highlightedText.append(lastPart);
				highlightedText.append("</span>");
			}
			return highlightedText.toString();
		}
		else
		{
			return text;
		}
	}
};

oFF.UtToolbarWidgetMenuItem = function() {};
oFF.UtToolbarWidgetMenuItem.prototype = new oFF.XObject();
oFF.UtToolbarWidgetMenuItem.prototype._ff_c = "UtToolbarWidgetMenuItem";

oFF.UtToolbarWidgetMenuItem.create = function(parentMenu, text, icon)
{
	var menuItem = new oFF.UtToolbarWidgetMenuItem();
	menuItem.setupInternal(parentMenu, text, icon);
	return menuItem;
};
oFF.UtToolbarWidgetMenuItem.prototype.m_parentMenu = null;
oFF.UtToolbarWidgetMenuItem.prototype.m_item = null;
oFF.UtToolbarWidgetMenuItem.prototype.addMenuItem = function(text, icon)
{
	return this.m_item.addNewItem().setText(text).setIcon(icon);
};
oFF.UtToolbarWidgetMenuItem.prototype.setTooltip = function(tooltip)
{
	this.m_item.setTooltip(tooltip);
};
oFF.UtToolbarWidgetMenuItem.prototype.addCssClass = function(cssClass)
{
	this.m_item.addCssClass(cssClass);
};
oFF.UtToolbarWidgetMenuItem.prototype.addToggleButton = function(activeText, inactiveText, activeIcon, inactiveIcon, defaultState)
{
	var toggleButton = oFF.UtToolbarWidgetMenuToggleButton.create(this.m_item, activeText, inactiveText, activeIcon, inactiveIcon, defaultState);
	return toggleButton.getItem();
};
oFF.UtToolbarWidgetMenuItem.prototype.remove = function()
{
	this.m_parentMenu.removeItem(this.m_item);
};
oFF.UtToolbarWidgetMenuItem.prototype.setPressConsumer = function(consumer)
{
	this.m_item.registerOnPress(oFF.UiLambdaPressListener.create(consumer));
};
oFF.UtToolbarWidgetMenuItem.prototype.releaseObject = function()
{
	this.m_item = oFF.XObjectExt.release(this.m_item);
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.UtToolbarWidgetMenuItem.prototype.setupInternal = function(parentMenu, text, icon)
{
	this.m_parentMenu = parentMenu;
	this.m_item = parentMenu.addNewItem().setText(text).setIcon(icon);
};
oFF.UtToolbarWidgetMenuItem.prototype.isEnabled = function()
{
	return this.m_item.isEnabled();
};
oFF.UtToolbarWidgetMenuItem.prototype.setEnabled = function(enabled)
{
	return this.m_item.setEnabled(enabled);
};

oFF.UtToolbarWidgetMenuToggleButton = function() {};
oFF.UtToolbarWidgetMenuToggleButton.prototype = new oFF.XObject();
oFF.UtToolbarWidgetMenuToggleButton.prototype._ff_c = "UtToolbarWidgetMenuToggleButton";

oFF.UtToolbarWidgetMenuToggleButton.create = function(menu, activeText, inactiveText, activeIcon, inactiveIcon, defaultState)
{
	var menuToggle = new oFF.UtToolbarWidgetMenuToggleButton();
	menuToggle.setupInternal(menu, activeText, inactiveText, activeIcon, inactiveIcon, defaultState);
	return menuToggle;
};
oFF.UtToolbarWidgetMenuToggleButton.prototype.m_activeText = null;
oFF.UtToolbarWidgetMenuToggleButton.prototype.m_inactiveText = null;
oFF.UtToolbarWidgetMenuToggleButton.prototype.m_activeIcon = null;
oFF.UtToolbarWidgetMenuToggleButton.prototype.m_inactiveIcon = null;
oFF.UtToolbarWidgetMenuToggleButton.prototype.m_state = false;
oFF.UtToolbarWidgetMenuToggleButton.prototype.m_item = null;
oFF.UtToolbarWidgetMenuToggleButton.prototype.m_consumer = null;
oFF.UtToolbarWidgetMenuToggleButton.prototype.stateChange = function(event)
{
	if (this.m_state)
	{
		this.m_state = false;
		this.setItemInactive();
	}
	else
	{
		this.m_state = true;
		this.setItemActive();
	}
	if (oFF.notNull(this.m_consumer))
	{
		this.m_consumer(event);
	}
};
oFF.UtToolbarWidgetMenuToggleButton.prototype.getItem = function()
{
	return this.m_item;
};
oFF.UtToolbarWidgetMenuToggleButton.prototype.isPressed = function()
{
	return this.m_state;
};
oFF.UtToolbarWidgetMenuToggleButton.prototype.setPressConsumer = function(consumer)
{
	this.m_consumer = consumer;
};
oFF.UtToolbarWidgetMenuToggleButton.prototype.releaseObject = function()
{
	this.m_item = oFF.XObjectExt.release(this.m_item);
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.UtToolbarWidgetMenuToggleButton.prototype.setItemActive = function()
{
	this.m_item.setText(this.m_activeText).setIcon(this.m_activeIcon);
};
oFF.UtToolbarWidgetMenuToggleButton.prototype.setItemInactive = function()
{
	this.m_item.setText(this.m_inactiveText).setIcon(this.m_inactiveIcon);
};
oFF.UtToolbarWidgetMenuToggleButton.prototype.setupInternal = function(menu, activeText, inactiveText, activeIcon, inactiveIcon, defaultState)
{
	this.m_activeText = activeText;
	this.m_inactiveText = inactiveText;
	this.m_activeIcon = activeIcon;
	this.m_inactiveIcon = inactiveIcon;
	this.m_state = defaultState;
	this.m_item = menu.addNewItem().registerOnPress(oFF.UiLambdaPressListener.create( function(controlEvent){
		this.stateChange(controlEvent);
	}.bind(this)));
	if (this.m_state)
	{
		this.setItemActive();
	}
	else
	{
		this.setItemInactive();
	}
};

oFF.UtToolbarWidgetSectionGroup = function() {};
oFF.UtToolbarWidgetSectionGroup.prototype = new oFF.XObject();
oFF.UtToolbarWidgetSectionGroup.prototype._ff_c = "UtToolbarWidgetSectionGroup";

oFF.UtToolbarWidgetSectionGroup.create = function(genesis, parentSection)
{
	var group = new oFF.UtToolbarWidgetSectionGroup();
	group.setupInternal(genesis, parentSection);
	return group;
};
oFF.UtToolbarWidgetSectionGroup.prototype.m_genesis = null;
oFF.UtToolbarWidgetSectionGroup.prototype.m_parentSection = null;
oFF.UtToolbarWidgetSectionGroup.prototype.m_items = null;
oFF.UtToolbarWidgetSectionGroup.prototype.releaseObject = function()
{
	oFF.XObject.prototype.releaseObject.call( this );
	this.m_genesis = null;
	this.m_parentSection = null;
	this.m_items = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_items);
};
oFF.UtToolbarWidgetSectionGroup.prototype.addMenu = function(text)
{
	var menu = oFF.UtToolbarWidgetMenu.create(this.m_genesis, text);
	this.m_items.add(menu);
	this.m_parentSection.rebuild();
	return menu;
};
oFF.UtToolbarWidgetSectionGroup.prototype.addButton = function(text, tooltip, icon)
{
	var button = oFF.UtToolbarWidgetButton.create(this.m_genesis, text, tooltip, icon);
	this.m_items.add(button);
	this.m_parentSection.rebuild();
	return button;
};
oFF.UtToolbarWidgetSectionGroup.prototype.addToggleButton = function(text, tooltip, icon)
{
	var button = oFF.UtToolbarWidgetToggleButton.create(this.m_genesis, text, tooltip, icon);
	this.m_items.add(button);
	this.m_parentSection.rebuild();
	return button;
};
oFF.UtToolbarWidgetSectionGroup.prototype.getItems = function()
{
	return this.m_items;
};
oFF.UtToolbarWidgetSectionGroup.prototype.removeItemAtIndex = function(index)
{
	if (index >= 0 && index < this.m_items.size())
	{
		var removedItem = this.m_items.removeAt(index);
		this.m_parentSection.rebuild();
		return removedItem;
	}
	return null;
};
oFF.UtToolbarWidgetSectionGroup.prototype.removeItem = function(item)
{
	if (this.m_items.contains(item))
	{
		var removedItem = this.m_items.removeElement(item);
		this.m_parentSection.rebuild();
		return removedItem;
	}
	return null;
};
oFF.UtToolbarWidgetSectionGroup.prototype.setupInternal = function(genesis, parentSection)
{
	this.m_genesis = genesis;
	this.m_parentSection = parentSection;
	this.m_items = oFF.XList.create();
};

oFF.UiNumberFormatterCenter = function() {};
oFF.UiNumberFormatterCenter.prototype = new oFF.XObject();
oFF.UiNumberFormatterCenter.prototype._ff_c = "UiNumberFormatterCenter";

oFF.UiNumberFormatterCenter.DATE_DISPLAY_FORMAT = "yyyy-MM-dd";
oFF.UiNumberFormatterCenter.DATE_VALUE_FORMAT = "yyyy-MM-dd";
oFF.UiNumberFormatterCenter.s_singletonInstance = null;
oFF.UiNumberFormatterCenter.s_externalPlugin = null;
oFF.UiNumberFormatterCenter.getCenter = function()
{
	if (oFF.isNull(oFF.UiNumberFormatterCenter.s_singletonInstance))
	{
		var newCenter = new oFF.UiNumberFormatterCenter();
		newCenter.setupCenter();
		oFF.UiNumberFormatterCenter.s_singletonInstance = newCenter;
	}
	return oFF.UiNumberFormatterCenter.s_singletonInstance;
};
oFF.UiNumberFormatterCenter.setExternalNumberFormatter = function(externalPlugin)
{
	oFF.UiNumberFormatterCenter.s_externalPlugin = externalPlugin;
};
oFF.UiNumberFormatterCenter.prototype.setupCenter = function()
{
	this.setup();
};
oFF.UiNumberFormatterCenter.prototype.format = function(value)
{
	return oFF.notNull(oFF.UiNumberFormatterCenter.s_externalPlugin) ? oFF.UiNumberFormatterCenter.s_externalPlugin.format(value) : value;
};
oFF.UiNumberFormatterCenter.prototype.parseFormattedNumber = function(value)
{
	if (oFF.notNull(oFF.UiNumberFormatterCenter.s_externalPlugin))
	{
		return oFF.UiNumberFormatterCenter.s_externalPlugin.parseFormattedNumber(value);
	}
	if (oFF.XString.containsString(value, "NaN"))
	{
		return null;
	}
	try
	{
		if (oFF.XStringUtils.isNotNullAndNotEmpty(value))
		{
			var dValue = oFF.XDouble.convertFromString(value);
			return oFF.XDouble.convertToString(dValue);
		}
	}
	catch (e)
	{
		return null;
	}
	return value;
};
oFF.UiNumberFormatterCenter.prototype.formatTextForDateTimeKey = function(textValue, keyValue, keyValueType)
{
	return oFF.notNull(oFF.UiNumberFormatterCenter.s_externalPlugin) ? oFF.UiNumberFormatterCenter.s_externalPlugin.formatTextForDateTimeKey(textValue, keyValue, keyValueType) : oFF.notNull(textValue) ? textValue : keyValue;
};
oFF.UiNumberFormatterCenter.prototype.getDateDisplayFormat = function()
{
	var displayFormat = oFF.notNull(oFF.UiNumberFormatterCenter.s_externalPlugin) ? oFF.UiNumberFormatterCenter.s_externalPlugin.getDateDisplayFormat() : oFF.UiNumberFormatterCenter.DATE_DISPLAY_FORMAT;
	return oFF.notNull(displayFormat) ? displayFormat : oFF.UiNumberFormatterCenter.DATE_DISPLAY_FORMAT;
};

oFF.DfUiFormControl = function() {};
oFF.DfUiFormControl.prototype = new oFF.XObject();
oFF.DfUiFormControl.prototype._ff_c = "DfUiFormControl";

oFF.DfUiFormControl.prototype.m_genesis = null;
oFF.DfUiFormControl.prototype.m_customObject = null;
oFF.DfUiFormControl.prototype.m_control = null;
oFF.DfUiFormControl.prototype.m_name = null;
oFF.DfUiFormControl.prototype.setupFormControl = function(genesis, name)
{
	if (oFF.isNull(genesis))
	{
		throw oFF.XException.createRuntimeException("Cannot create a form control. Please sepcify a genesis object!");
	}
	this.m_genesis = genesis;
	this.m_name = name;
	this.m_control = this.createFormUiControl(genesis);
};
oFF.DfUiFormControl.prototype.releaseObject = function()
{
	this.m_genesis = null;
	this.m_customObject = null;
	this.m_control = oFF.XObjectExt.release(this.m_control);
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.DfUiFormControl.prototype.getName = function()
{
	return this.m_name;
};
oFF.DfUiFormControl.prototype.getCustomObject = function()
{
	return this.m_customObject;
};
oFF.DfUiFormControl.prototype.setCustomObject = function(customObject)
{
	this.m_customObject = customObject;
};
oFF.DfUiFormControl.prototype.setFlex = function(flex)
{
	this.getFormControl().setFlex(flex);
	return this;
};
oFF.DfUiFormControl.prototype.setVisible = function(visible)
{
	this.getFormControl().setVisible(visible);
	return this;
};
oFF.DfUiFormControl.prototype.addCssClass = function(cssClass)
{
	this.getFormControl().addCssClass(cssClass);
	return this;
};
oFF.DfUiFormControl.prototype.removeCssClass = function(cssClass)
{
	this.getFormControl().removeCssClass(cssClass);
	return this;
};
oFF.DfUiFormControl.prototype.getFormControl = function()
{
	return this.m_control;
};
oFF.DfUiFormControl.prototype.hasModelValue = function()
{
	return this.isModelItem();
};
oFF.DfUiFormControl.prototype.getGenesis = function()
{
	return this.m_genesis;
};
oFF.DfUiFormControl.prototype.isModelItem = function()
{
	return false;
};

oFF.DfUiSimpleView = function() {};
oFF.DfUiSimpleView.prototype = new oFF.XObject();
oFF.DfUiSimpleView.prototype._ff_c = "DfUiSimpleView";

oFF.DfUiSimpleView.prototype.m_genesis = null;
oFF.DfUiSimpleView.prototype.releaseObject = function()
{
	this.m_genesis = oFF.XObjectExt.release(this.m_genesis);
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.DfUiSimpleView.prototype.initView = function(genesis)
{
	if (oFF.isNull(genesis))
	{
		throw oFF.XException.createRuntimeException("You need to specify a genesis instance in order to create a simple view!");
	}
	this.m_genesis = genesis;
	this.setupView();
	this.buildViewUi(genesis);
};
oFF.DfUiSimpleView.prototype.getGenesis = function()
{
	return this.m_genesis;
};

oFF.DfUiView = function() {};
oFF.DfUiView.prototype = new oFF.XObject();
oFF.DfUiView.prototype._ff_c = "DfUiView";

oFF.DfUiView.prototype.m_genesis = null;
oFF.DfUiView.prototype.m_viewWrapper = null;
oFF.DfUiView.prototype.releaseObject = function()
{
	this.m_viewWrapper = oFF.XObjectExt.release(this.m_viewWrapper);
	this.m_genesis = oFF.XObjectExt.release(this.m_genesis);
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.DfUiView.prototype.initView = function(genesis)
{
	if (oFF.isNull(genesis))
	{
		throw oFF.XException.createRuntimeException("You need to specify a genesis instance in order to create a view!");
	}
	this.m_viewWrapper = this.getWrapperControl(genesis);
	if (oFF.notNull(this.m_viewWrapper))
	{
		this.m_viewWrapper.addCssClass("ffViewWrapper");
		this.m_viewWrapper.useMaxSpace();
		var innerGenesis = oFF.UiGenesis.create(this.m_viewWrapper);
		this.m_genesis = innerGenesis;
		this.setupView();
		this.buildViewUi(innerGenesis);
	}
	else
	{
		throw oFF.XException.createRuntimeException("Missing wrapper control! Cannot create view.");
	}
};
oFF.DfUiView.prototype.getView = function()
{
	return this.m_viewWrapper;
};
oFF.DfUiView.prototype.getGenesis = function()
{
	return this.m_genesis;
};

oFF.UiLambdaFileFetchChildrenListener = function() {};
oFF.UiLambdaFileFetchChildrenListener.prototype = new oFF.XObject();
oFF.UiLambdaFileFetchChildrenListener.prototype._ff_c = "UiLambdaFileFetchChildrenListener";

oFF.UiLambdaFileFetchChildrenListener.create = function(consumer)
{
	var obj = new oFF.UiLambdaFileFetchChildrenListener();
	obj.m_consumer = consumer;
	return obj;
};
oFF.UiLambdaFileFetchChildrenListener.prototype.m_consumer = null;
oFF.UiLambdaFileFetchChildrenListener.prototype.onChildrenFetched = function(extResult, file, children, resultset, customIdentifier)
{
	this.m_consumer(extResult, children);
};
oFF.UiLambdaFileFetchChildrenListener.prototype.releaseObject = function()
{
	this.m_consumer = null;
	oFF.XObject.prototype.releaseObject.call( this );
};

oFF.UiLambdaFileFetchMetadataListener = function() {};
oFF.UiLambdaFileFetchMetadataListener.prototype = new oFF.XObject();
oFF.UiLambdaFileFetchMetadataListener.prototype._ff_c = "UiLambdaFileFetchMetadataListener";

oFF.UiLambdaFileFetchMetadataListener.create = function(consumer)
{
	var obj = new oFF.UiLambdaFileFetchMetadataListener();
	obj.m_consumer = consumer;
	return obj;
};
oFF.UiLambdaFileFetchMetadataListener.prototype.m_consumer = null;
oFF.UiLambdaFileFetchMetadataListener.prototype.onFileFetchMetadata = function(extResult, file, metadata, customIdentifier)
{
	this.m_consumer(extResult, file, metadata);
};
oFF.UiLambdaFileFetchMetadataListener.prototype.releaseObject = function()
{
	this.m_consumer = null;
	oFF.XObject.prototype.releaseObject.call( this );
};

oFF.UiLambdaFileIsExistingListener = function() {};
oFF.UiLambdaFileIsExistingListener.prototype = new oFF.XObject();
oFF.UiLambdaFileIsExistingListener.prototype._ff_c = "UiLambdaFileIsExistingListener";

oFF.UiLambdaFileIsExistingListener.create = function(consumer)
{
	var obj = new oFF.UiLambdaFileIsExistingListener();
	obj.m_consumer = consumer;
	return obj;
};
oFF.UiLambdaFileIsExistingListener.prototype.m_consumer = null;
oFF.UiLambdaFileIsExistingListener.prototype.onFileExistsCheck = function(extResult, file, isExisting, customIdentifier)
{
	this.m_consumer(extResult, oFF.XBooleanValue.create(isExisting));
};
oFF.UiLambdaFileIsExistingListener.prototype.releaseObject = function()
{
	this.m_consumer = null;
	oFF.XObject.prototype.releaseObject.call( this );
};

oFF.UiLambdaFileLoadedListener = function() {};
oFF.UiLambdaFileLoadedListener.prototype = new oFF.XObject();
oFF.UiLambdaFileLoadedListener.prototype._ff_c = "UiLambdaFileLoadedListener";

oFF.UiLambdaFileLoadedListener.create = function(consumer)
{
	var obj = new oFF.UiLambdaFileLoadedListener();
	obj.m_consumer = consumer;
	return obj;
};
oFF.UiLambdaFileLoadedListener.prototype.m_consumer = null;
oFF.UiLambdaFileLoadedListener.prototype.onFileLoaded = function(extResult, file, fileContent, customIdentifier)
{
	this.m_consumer(extResult, fileContent);
};
oFF.UiLambdaFileLoadedListener.prototype.releaseObject = function()
{
	this.m_consumer = null;
	oFF.XObject.prototype.releaseObject.call( this );
};

oFF.UiLambdaFileMkdirListener = function() {};
oFF.UiLambdaFileMkdirListener.prototype = new oFF.XObject();
oFF.UiLambdaFileMkdirListener.prototype._ff_c = "UiLambdaFileMkdirListener";

oFF.UiLambdaFileMkdirListener.create = function(consumer)
{
	var obj = new oFF.UiLambdaFileMkdirListener();
	obj.m_consumer = consumer;
	return obj;
};
oFF.UiLambdaFileMkdirListener.prototype.m_consumer = null;
oFF.UiLambdaFileMkdirListener.prototype.onDirectoryCreated = function(extResult, file, customIdentifier)
{
	this.m_consumer(extResult);
};
oFF.UiLambdaFileMkdirListener.prototype.releaseObject = function()
{
	this.m_consumer = null;
	oFF.XObject.prototype.releaseObject.call( this );
};

oFF.UiLambdaFileSavedListener = function() {};
oFF.UiLambdaFileSavedListener.prototype = new oFF.XObject();
oFF.UiLambdaFileSavedListener.prototype._ff_c = "UiLambdaFileSavedListener";

oFF.UiLambdaFileSavedListener.create = function(consumer)
{
	var obj = new oFF.UiLambdaFileSavedListener();
	obj.m_consumer = consumer;
	return obj;
};
oFF.UiLambdaFileSavedListener.prototype.m_consumer = null;
oFF.UiLambdaFileSavedListener.prototype.onFileSaved = function(extResult, file, fileContent, customIdentifier)
{
	this.m_consumer(extResult);
};
oFF.UiLambdaFileSavedListener.prototype.releaseObject = function()
{
	this.m_consumer = null;
	oFF.XObject.prototype.releaseObject.call( this );
};

oFF.UiLambdaFunctionExecutedListener = function() {};
oFF.UiLambdaFunctionExecutedListener.prototype = new oFF.XObject();
oFF.UiLambdaFunctionExecutedListener.prototype._ff_c = "UiLambdaFunctionExecutedListener";

oFF.UiLambdaFunctionExecutedListener.create = function(consumer)
{
	var obj = new oFF.UiLambdaFunctionExecutedListener();
	obj.m_consumer = consumer;
	return obj;
};
oFF.UiLambdaFunctionExecutedListener.prototype.m_consumer = null;
oFF.UiLambdaFunctionExecutedListener.prototype.onFunctionExecuted = function(extResult, response, customIdentifier)
{
	this.m_consumer(extResult);
};
oFF.UiLambdaFunctionExecutedListener.prototype.releaseObject = function()
{
	this.m_consumer = null;
	oFF.XObject.prototype.releaseObject.call( this );
};

oFF.UiLambdaHttpResponseListener = function() {};
oFF.UiLambdaHttpResponseListener.prototype = new oFF.XObject();
oFF.UiLambdaHttpResponseListener.prototype._ff_c = "UiLambdaHttpResponseListener";

oFF.UiLambdaHttpResponseListener.create = function(consumer)
{
	var obj = new oFF.UiLambdaHttpResponseListener();
	obj.m_consumer = consumer;
	return obj;
};
oFF.UiLambdaHttpResponseListener.prototype.m_consumer = null;
oFF.UiLambdaHttpResponseListener.prototype.onHttpResponse = function(extResult, response, customIdentifier)
{
	this.m_consumer(extResult, response);
};
oFF.UiLambdaHttpResponseListener.prototype.releaseObject = function()
{
	this.m_consumer = null;
	oFF.XObject.prototype.releaseObject.call( this );
};

oFF.UiThemeSac = function() {};
oFF.UiThemeSac.prototype = new oFF.UiThemeDefault();
oFF.UiThemeSac.prototype._ff_c = "UiThemeSac";

oFF.UiThemeSac.createSacTheme = function()
{
	var newTheme = new oFF.UiThemeSac();
	return newTheme;
};

oFF.UiIntegrationInfoCenter = function() {};
oFF.UiIntegrationInfoCenter.prototype = new oFF.XObject();
oFF.UiIntegrationInfoCenter.prototype._ff_c = "UiIntegrationInfoCenter";

oFF.UiIntegrationInfoCenter.s_singletonInstance = null;
oFF.UiIntegrationInfoCenter.s_externalPlugin = null;
oFF.UiIntegrationInfoCenter.getCenter = function()
{
	if (oFF.isNull(oFF.UiIntegrationInfoCenter.s_singletonInstance))
	{
		var newCenter = new oFF.UiIntegrationInfoCenter();
		newCenter.setupCenter();
		oFF.UiIntegrationInfoCenter.s_singletonInstance = newCenter;
	}
	return oFF.UiIntegrationInfoCenter.s_singletonInstance;
};
oFF.UiIntegrationInfoCenter.setExternalIntegrationInfo = function(externalPlugin)
{
	oFF.UiIntegrationInfoCenter.s_externalPlugin = externalPlugin;
};
oFF.UiIntegrationInfoCenter.prototype.setupCenter = function()
{
	this.setup();
};
oFF.UiIntegrationInfoCenter.prototype.isEmbedded = function()
{
	if (oFF.notNull(oFF.UiIntegrationInfoCenter.s_externalPlugin))
	{
		return oFF.UiIntegrationInfoCenter.s_externalPlugin.isEmbedded();
	}
	return false;
};

oFF.UiConfigurationCenter = function() {};
oFF.UiConfigurationCenter.prototype = new oFF.XObject();
oFF.UiConfigurationCenter.prototype._ff_c = "UiConfigurationCenter";

oFF.UiConfigurationCenter.s_singletonInstance = null;
oFF.UiConfigurationCenter.s_externalPlugin = null;
oFF.UiConfigurationCenter.getCenter = function()
{
	if (oFF.isNull(oFF.UiConfigurationCenter.s_singletonInstance))
	{
		var newCenter = new oFF.UiConfigurationCenter();
		newCenter.setupCenter();
		oFF.UiConfigurationCenter.s_singletonInstance = newCenter;
	}
	return oFF.UiConfigurationCenter.s_singletonInstance;
};
oFF.UiConfigurationCenter.setExternalConfigurationChecker = function(externalPlugin)
{
	oFF.UiConfigurationCenter.s_externalPlugin = externalPlugin;
};
oFF.UiConfigurationCenter.prototype.setupCenter = function()
{
	this.setup();
};
oFF.UiConfigurationCenter.prototype.isActive = function(name)
{
	if (oFF.notNull(oFF.UiConfigurationCenter.s_externalPlugin))
	{
		return oFF.UiConfigurationCenter.s_externalPlugin.isActive(name);
	}
	return true;
};

oFF.UiFeatureToggleCenter = function() {};
oFF.UiFeatureToggleCenter.prototype = new oFF.XObject();
oFF.UiFeatureToggleCenter.prototype._ff_c = "UiFeatureToggleCenter";

oFF.UiFeatureToggleCenter.s_singletonInstance = null;
oFF.UiFeatureToggleCenter.s_externalPlugin = null;
oFF.UiFeatureToggleCenter.s_disabledToggles = null;
oFF.UiFeatureToggleCenter.getCenter = function()
{
	if (oFF.isNull(oFF.UiFeatureToggleCenter.s_singletonInstance))
	{
		var newCenter = new oFF.UiFeatureToggleCenter();
		newCenter.setupCenter();
		oFF.UiFeatureToggleCenter.s_disabledToggles = oFF.XHashSetOfString.create();
		oFF.UiFeatureToggleCenter.s_singletonInstance = newCenter;
	}
	return oFF.UiFeatureToggleCenter.s_singletonInstance;
};
oFF.UiFeatureToggleCenter.setExternalFeatureToggleChecker = function(externalPlugin)
{
	oFF.UiFeatureToggleCenter.s_externalPlugin = externalPlugin;
};
oFF.UiFeatureToggleCenter.prototype.setupCenter = function()
{
	this.setup();
};
oFF.UiFeatureToggleCenter.prototype.isActive = function(name)
{
	if (oFF.notNull(oFF.UiFeatureToggleCenter.s_externalPlugin))
	{
		return oFF.UiFeatureToggleCenter.s_externalPlugin.isActive(name);
	}
	return !oFF.UiFeatureToggleCenter.s_disabledToggles.contains(name);
};
oFF.UiFeatureToggleCenter.prototype.setFeatureToggleEnabled = function(name, enabled)
{
	if (enabled)
	{
		oFF.UiFeatureToggleCenter.s_disabledToggles.removeElement(name);
	}
	else
	{
		oFF.UiFeatureToggleCenter.s_disabledToggles.add(name);
	}
};

oFF.UiLocalizationCenter = function() {};
oFF.UiLocalizationCenter.prototype = new oFF.XObject();
oFF.UiLocalizationCenter.prototype._ff_c = "UiLocalizationCenter";

oFF.UiLocalizationCenter.s_singeltonInstance = null;
oFF.UiLocalizationCenter.s_externalPlugin = null;
oFF.UiLocalizationCenter.getCenter = function()
{
	if (oFF.isNull(oFF.UiLocalizationCenter.s_singeltonInstance))
	{
		var newCenter = new oFF.UiLocalizationCenter();
		newCenter.setupCenter();
		oFF.UiLocalizationCenter.s_singeltonInstance = newCenter;
	}
	return oFF.UiLocalizationCenter.s_singeltonInstance;
};
oFF.UiLocalizationCenter.setExternalLocalizationProvider = function(externalPlugin)
{
	oFF.UiLocalizationCenter.s_externalPlugin = externalPlugin;
};
oFF.UiLocalizationCenter.getExternalLocalizationProvider = function()
{
	return oFF.UiLocalizationCenter.s_externalPlugin;
};
oFF.UiLocalizationCenter.prototype.m_localizationProviders = null;
oFF.UiLocalizationCenter.prototype.setupCenter = function()
{
	this.setup();
	this.m_localizationProviders = oFF.XHashMapByString.create();
};
oFF.UiLocalizationCenter.prototype.registerLocalizationProvider = function(provider)
{
	if (oFF.notNull(provider) && !this.m_localizationProviders.containsKey(provider.getName()))
	{
		this.m_localizationProviders.put(provider.getName(), provider);
	}
};
oFF.UiLocalizationCenter.prototype.getLocalizationProviderByName = function(name)
{
	return this.m_localizationProviders.getByKey(name);
};
oFF.UiLocalizationCenter.prototype.getText = function(key)
{
	var foundProvider = oFF.XCollectionUtils.findFirst(this.m_localizationProviders,  function(provider){
		var providerText = provider.getText(key);
		return !oFF.XString.isEqual(key, providerText) && oFF.XStringUtils.isNotNullAndNotEmpty(providerText);
	}.bind(this));
	if (oFF.notNull(foundProvider))
	{
		return foundProvider.getText(key);
	}
	return key;
};
oFF.UiLocalizationCenter.prototype.getTextWithPlaceholder = function(key, replacement)
{
	var foundProvider = oFF.XCollectionUtils.findFirst(this.m_localizationProviders,  function(provider){
		var providerText = provider.getText(key);
		return !oFF.XString.isEqual(key, providerText) && oFF.XStringUtils.isNotNullAndNotEmpty(providerText);
	}.bind(this));
	if (oFF.notNull(foundProvider))
	{
		return foundProvider.getTextWithPlaceholder(key, replacement);
	}
	return key;
};
oFF.UiLocalizationCenter.prototype.getTextWithPlaceholder2 = function(key, replacement1, replacement2)
{
	var foundProvider = oFF.XCollectionUtils.findFirst(this.m_localizationProviders,  function(provider){
		var providerText = provider.getText(key);
		return !oFF.XString.isEqual(key, providerText) && oFF.XStringUtils.isNotNullAndNotEmpty(providerText);
	}.bind(this));
	if (oFF.notNull(foundProvider))
	{
		return foundProvider.getTextWithPlaceholder2(key, replacement1, replacement2);
	}
	return key;
};
oFF.UiLocalizationCenter.prototype.getName = function()
{
	return "LocalizationCenterProvider";
};
oFF.UiLocalizationCenter.prototype.setProductive = function(isProductive)
{
	oFF.XCollectionUtils.forEach(this.m_localizationProviders,  function(provider){
		provider.setProductive(isProductive);
	}.bind(this));
};
oFF.UiLocalizationCenter.prototype.getComment = function(key)
{
	var foundProvider = oFF.XCollectionUtils.findFirst(this.m_localizationProviders,  function(provider){
		var providerComment = provider.getComment(key);
		return !oFF.XStringUtils.isNotNullAndNotEmpty(providerComment);
	}.bind(this));
	if (oFF.notNull(foundProvider))
	{
		return foundProvider.getComment(key);
	}
	return null;
};
oFF.UiLocalizationCenter.prototype.getLocalizationTexts = function()
{
	var allTextsMap = oFF.XHashMapOfStringByString.create();
	oFF.XCollectionUtils.forEach(this.m_localizationProviders,  function(provider){
		allTextsMap.putAll(provider.getLocalizationTexts());
	}.bind(this));
	return allTextsMap;
};

oFF.DfUiLocalizationProvider = function() {};
oFF.DfUiLocalizationProvider.prototype = new oFF.XObject();
oFF.DfUiLocalizationProvider.prototype._ff_c = "DfUiLocalizationProvider";

oFF.DfUiLocalizationProvider.prototype.m_localizationTexts = null;
oFF.DfUiLocalizationProvider.prototype.m_localizationComments = null;
oFF.DfUiLocalizationProvider.prototype.m_name = null;
oFF.DfUiLocalizationProvider.prototype.m_isProductive = false;
oFF.DfUiLocalizationProvider.prototype.setupProvider = function(name, isProductive)
{
	if (oFF.XStringUtils.isNullOrEmpty(name))
	{
		throw oFF.XException.createRuntimeException("A name is required for a localization provider!");
	}
	this.m_name = name;
	this.m_isProductive = isProductive;
	this.m_localizationTexts = oFF.XHashMapOfStringByString.create();
	this.m_localizationComments = oFF.XHashMapOfStringByString.create();
	oFF.UiLocalizationCenter.getCenter().registerLocalizationProvider(this);
};
oFF.DfUiLocalizationProvider.prototype.releaseObject = function()
{
	this.m_localizationTexts = oFF.XObjectExt.release(this.m_localizationTexts);
	this.m_localizationComments = oFF.XObjectExt.release(this.m_localizationComments);
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.DfUiLocalizationProvider.prototype.addTexts = function(newTexts)
{
	this.m_localizationTexts.putAll(newTexts);
	return this;
};
oFF.DfUiLocalizationProvider.prototype.addText = function(key, text)
{
	this.m_localizationTexts.put(key, text);
	return this;
};
oFF.DfUiLocalizationProvider.prototype.addComment = function(key, comment)
{
	this.m_localizationComments.put(key, comment);
	return this;
};
oFF.DfUiLocalizationProvider.prototype.isProductive = function()
{
	return this.m_isProductive;
};
oFF.DfUiLocalizationProvider.prototype.getText = function(key)
{
	var text = this.getTextOrNull(key);
	if (oFF.isNull(text))
	{
		return key;
	}
	return text;
};
oFF.DfUiLocalizationProvider.prototype.getTextWithPlaceholder = function(key, replacement)
{
	var text = this.getTextOrNull(key);
	if (oFF.isNull(text))
	{
		return key;
	}
	if (oFF.XString.containsString(text, "{0}"))
	{
		text = oFF.XString.replace(text, "{0}", replacement);
	}
	return text;
};
oFF.DfUiLocalizationProvider.prototype.getTextWithPlaceholder2 = function(key, replacement1, replacement2)
{
	var text = this.getTextOrNull(key);
	if (oFF.isNull(text))
	{
		return key;
	}
	if (oFF.XString.containsString(text, "{0}"))
	{
		text = oFF.XString.replace(text, "{0}", replacement1);
	}
	if (oFF.XString.containsString(text, "{1}"))
	{
		text = oFF.XString.replace(text, "{1}", replacement2);
	}
	return text;
};
oFF.DfUiLocalizationProvider.prototype.getName = function()
{
	return this.m_name;
};
oFF.DfUiLocalizationProvider.prototype.setProductive = function(isProductive)
{
	this.m_isProductive = isProductive;
};
oFF.DfUiLocalizationProvider.prototype.getComment = function(key)
{
	return this.m_localizationComments.getByKey(key);
};
oFF.DfUiLocalizationProvider.prototype.getLocalizationTexts = function()
{
	return this.m_localizationTexts;
};
oFF.DfUiLocalizationProvider.prototype.getTextOrNull = function(key)
{
	var text = null;
	if (this.isProductive() && oFF.UiLocalizationCenter.getExternalLocalizationProvider() !== null)
	{
		text = oFF.UiLocalizationCenter.getExternalLocalizationProvider().getText(key);
	}
	return oFF.isNull(text) ? this.m_localizationTexts.getByKey(key) : text;
};

oFF.UiMessageCenter = function() {};
oFF.UiMessageCenter.prototype = new oFF.XObject();
oFF.UiMessageCenter.prototype._ff_c = "UiMessageCenter";

oFF.UiMessageCenter.s_singeltonInstance = null;
oFF.UiMessageCenter.s_externalPlugin = null;
oFF.UiMessageCenter.getCenter = function()
{
	if (oFF.isNull(oFF.UiMessageCenter.s_singeltonInstance))
	{
		oFF.UiMessageCenter.s_singeltonInstance = oFF.UiMessageCenter.createMessageCenter(null);
	}
	return oFF.UiMessageCenter.s_singeltonInstance;
};
oFF.UiMessageCenter.createMessageCenter = function(uiManager)
{
	var obj = new oFF.UiMessageCenter();
	obj.setupCenter(uiManager);
	return obj;
};
oFF.UiMessageCenter.setExternalMessagePoster = function(externalPlugin)
{
	oFF.UiMessageCenter.s_externalPlugin = externalPlugin;
};
oFF.UiMessageCenter.prototype.m_uiManager = null;
oFF.UiMessageCenter.prototype.setupCenter = function(uiManager)
{
	this.setup();
	this.m_uiManager = uiManager;
};
oFF.UiMessageCenter.prototype.postMessage = function(type, message, component)
{
	if (oFF.notNull(oFF.UiMessageCenter.s_externalPlugin))
	{
		if (type === oFF.UiMessageType.INFORMATION)
		{
			oFF.UiMessageCenter.s_externalPlugin.postInfoExt(message, component);
		}
		else if (type === oFF.UiMessageType.WARNING)
		{
			oFF.UiMessageCenter.s_externalPlugin.postWarningExt(message, component);
		}
		else if (type === oFF.UiMessageType.ERROR)
		{
			oFF.UiMessageCenter.s_externalPlugin.postErrorExt(message, component);
		}
		else if (type === oFF.UiMessageType.SUCCESS)
		{
			oFF.UiMessageCenter.s_externalPlugin.postSuccessExt(message, component);
		}
		return;
	}
	if (oFF.notNull(this.m_uiManager))
	{
		if (type === oFF.UiMessageType.INFORMATION)
		{
			this.m_uiManager.getFreeGenesis().showInfoToast(message);
		}
		else if (type === oFF.UiMessageType.WARNING)
		{
			this.m_uiManager.getFreeGenesis().showWarningToast(message);
		}
		else if (type === oFF.UiMessageType.ERROR)
		{
			this.m_uiManager.getFreeGenesis().showErrorToast(message);
		}
		else if (type === oFF.UiMessageType.SUCCESS)
		{
			this.m_uiManager.getFreeGenesis().showSuccessToast(message);
		}
	}
};
oFF.UiMessageCenter.prototype.postInfoExt = function(message, component)
{
	this.postMessage(oFF.UiMessageType.INFORMATION, message, component);
};
oFF.UiMessageCenter.prototype.postWarningExt = function(message, component)
{
	this.postMessage(oFF.UiMessageType.WARNING, message, component);
};
oFF.UiMessageCenter.prototype.postErrorExt = function(message, component)
{
	this.postMessage(oFF.UiMessageType.ERROR, message, component);
};
oFF.UiMessageCenter.prototype.postSuccessExt = function(message, component)
{
	this.postMessage(oFF.UiMessageType.SUCCESS, message, component);
};
oFF.UiMessageCenter.prototype.postInfo = function(message)
{
	this.postInfoExt(message, null);
};
oFF.UiMessageCenter.prototype.postWarning = function(message)
{
	this.postWarningExt(message, null);
};
oFF.UiMessageCenter.prototype.postError = function(message)
{
	this.postErrorExt(message, null);
};
oFF.UiMessageCenter.prototype.postSuccess = function(message)
{
	this.postSuccessExt(message, null);
};
oFF.UiMessageCenter.prototype.releaseObject = function()
{
	this.m_uiManager = null;
	oFF.XObject.prototype.releaseObject.call( this );
};

oFF.UiPerformanceCenter = function() {};
oFF.UiPerformanceCenter.prototype = new oFF.DfUiLockedObject();
oFF.UiPerformanceCenter.prototype._ff_c = "UiPerformanceCenter";

oFF.UiPerformanceCenter.s_singeltonInstance = null;
oFF.UiPerformanceCenter.s_externalPlugin = null;
oFF.UiPerformanceCenter.getCenter = function()
{
	if (oFF.isNull(oFF.UiPerformanceCenter.s_singeltonInstance))
	{
		var newCenter = new oFF.UiPerformanceCenter();
		newCenter.setupCenter();
		oFF.UiPerformanceCenter.s_singeltonInstance = newCenter;
	}
	return oFF.UiPerformanceCenter.s_singeltonInstance;
};
oFF.UiPerformanceCenter.setExternalPerformanceTool = function(externalPlugin)
{
	oFF.UiPerformanceCenter.s_externalPlugin = externalPlugin;
};
oFF.UiPerformanceCenter.prototype.m_runningMeasurments = null;
oFF.UiPerformanceCenter.prototype.setupCenter = function()
{
	this.m_runningMeasurments = oFF.PrFactory.createStructure();
	this.setup();
};
oFF.UiPerformanceCenter.prototype.startMeasure = function(name)
{
	if (oFF.notNull(oFF.UiPerformanceCenter.s_externalPlugin))
	{
		oFF.UiPerformanceCenter.s_externalPlugin.startMeasure(name);
	}
	else
	{
		var message = oFF.XStringUtils.concatenate2("[PerformanceCenter] Starting measurment for: ", name);
		oFF.XLogger.println(message);
		this.m_runningMeasurments.putLong(name, oFF.XSystemUtils.getCurrentTimeInMilliseconds());
	}
};
oFF.UiPerformanceCenter.prototype.endMeasure = function(name)
{
	if (oFF.notNull(oFF.UiPerformanceCenter.s_externalPlugin))
	{
		oFF.UiPerformanceCenter.s_externalPlugin.endMeasure(name);
	}
	else
	{
		if (this.m_runningMeasurments.containsKey(name))
		{
			var startMillis = this.m_runningMeasurments.getLongByKey(name);
			var current = oFF.XSystemUtils.getCurrentTimeInMilliseconds();
			var diff = current - startMillis;
			var message = oFF.XStringUtils.concatenate5("[PerformanceCenter] Finished measurment for: ", name, ". Result -> ", oFF.XLong.convertToString(diff), "ms");
			oFF.XLogger.println(message);
			this.m_runningMeasurments.remove(name);
		}
	}
};

oFF.DfUiFormItem = function() {};
oFF.DfUiFormItem.prototype = new oFF.DfUiFormControl();
oFF.DfUiFormItem.prototype._ff_c = "DfUiFormItem";

oFF.DfUiFormItem.VALUE_REQUIRED_TEXT = "The value is required";
oFF.DfUiFormItem.REQUIRED_TEXT = " is required";
oFF.DfUiFormItem.INITIAL_BLUR_DELAY = 400;
oFF.DfUiFormItem.prototype.m_valueChangedConsumer = null;
oFF.DfUiFormItem.prototype.m_enterPressedProcedure = null;
oFF.DfUiFormItem.prototype.m_value = null;
oFF.DfUiFormItem.prototype.m_text = null;
oFF.DfUiFormItem.prototype.m_customRequiredText = null;
oFF.DfUiFormItem.prototype.m_customValidator = null;
oFF.DfUiFormItem.prototype.m_formItemControl = null;
oFF.DfUiFormItem.prototype.m_formLabel = null;
oFF.DfUiFormItem.prototype.m_isRequired = false;
oFF.DfUiFormItem.prototype.m_isValid = false;
oFF.DfUiFormItem.prototype.m_isPristine = false;
oFF.DfUiFormItem.prototype.m_isUntouched = false;
oFF.DfUiFormItem.prototype.m_internalBlurProcedure = null;
oFF.DfUiFormItem.prototype.m_internalValueChangedConsumer = null;
oFF.DfUiFormItem.prototype.m_internalEnterPressedProcedure = null;
oFF.DfUiFormItem.prototype.m_blurTimeoutId = null;
oFF.DfUiFormItem.prototype.setupFormItem = function(genesis, key, value, text)
{
	this.setValueSafe(value);
	this.m_text = text;
	this.m_isRequired = false;
	this.m_isValid = true;
	this.m_isPristine = true;
	this.m_isUntouched = true;
	this.setupFormControl(genesis, key);
	this.m_formLabel = this.createFormLabel(genesis);
	this.m_formItemControl = this.createFormItemUiControl(genesis);
	this.layoutFormItem();
	if (oFF.XStringUtils.isNullOrEmpty(key))
	{
		this.setEditable(false);
	}
	if (oFF.notNull(this.m_formLabel))
	{
		this.m_formLabel.setLabelFor(this.m_formItemControl);
	}
};
oFF.DfUiFormItem.prototype.releaseObject = function()
{
	this.m_valueChangedConsumer = null;
	this.m_enterPressedProcedure = null;
	this.m_value = oFF.XObjectExt.release(this.m_value);
	this.m_formItemControl = oFF.XObjectExt.release(this.m_formItemControl);
	this.m_formLabel = oFF.XObjectExt.release(this.m_formLabel);
	this.m_customValidator = null;
	this.m_internalBlurProcedure = null;
	this.m_internalValueChangedConsumer = null;
	this.m_internalEnterPressedProcedure = null;
	oFF.XTimeout.clear(this.m_blurTimeoutId);
	oFF.DfUiFormControl.prototype.releaseObject.call( this );
};
oFF.DfUiFormItem.prototype.createFormUiControl = function(genesis)
{
	var formItemWrapper = genesis.newControl(oFF.UiType.FLEX_LAYOUT);
	formItemWrapper.setName(this.getKey());
	formItemWrapper.setFlex("0 0 auto");
	formItemWrapper.setOverflow(oFF.UiOverflow.HIDDEN);
	return formItemWrapper;
};
oFF.DfUiFormItem.prototype.createFormLabel = function(genesis)
{
	var formItemLabel = oFF.UiFormLabel.create(genesis, null, this.getFormattedText(), this.getText());
	formItemLabel.setRequired(this.isRequired());
	formItemLabel.setVisible(oFF.XStringUtils.isNotNullAndNotEmpty(this.getText()));
	formItemLabel.setFontWeight(oFF.UiFontWeight.BOLD);
	return formItemLabel;
};
oFF.DfUiFormItem.prototype.isValid = function()
{
	return this.m_isValid;
};
oFF.DfUiFormItem.prototype.validate = function()
{
	this.m_isUntouched = false;
	this.refreshModelValue();
	if (!this.isRequiredValid())
	{
		this.setInvalid(this.getValueRequiredText());
		return;
	}
	else
	{
		this.setValid();
	}
	this.executeCustomValidator();
};
oFF.DfUiFormItem.prototype.getKey = function()
{
	return this.getName();
};
oFF.DfUiFormItem.prototype.getValue = function()
{
	return this.m_value;
};
oFF.DfUiFormItem.prototype.setValue = function(value)
{
	var areEqual = oFF.UiFormUtils.areValuesEqual(this.getValue(), value);
	if (!areEqual)
	{
		this.setValueSafe(value);
		this.updateControlValue();
		this.handleItemValueManualSet();
	}
	return this;
};
oFF.DfUiFormItem.prototype.getText = function()
{
	return this.m_text;
};
oFF.DfUiFormItem.prototype.setText = function(text)
{
	this.m_text = text;
	if (this.getFormLabel() !== null)
	{
		this.getFormLabel().setText(this.getFormattedText());
	}
	return this;
};
oFF.DfUiFormItem.prototype.isRequired = function()
{
	return this.m_isRequired;
};
oFF.DfUiFormItem.prototype.setRequired = function(isRequired)
{
	this.m_isRequired = true;
	if (this.getFormLabel() !== null)
	{
		this.getFormLabel().setRequired(isRequired);
	}
	return this;
};
oFF.DfUiFormItem.prototype.setLabelFontWeight = function(fontWeight)
{
	if (this.getFormLabel() !== null)
	{
		this.getFormLabel().setFontWeight(fontWeight);
	}
	return this;
};
oFF.DfUiFormItem.prototype.isEmpty = function()
{
	return this.getValueType() === oFF.XValueType.STRING && oFF.XStringUtils.isNullOrEmpty(this.getModelValueAsString());
};
oFF.DfUiFormItem.prototype.focus = function()
{
	if (this.getFormItemControl() !== null)
	{
		this.getFormItemControl().focus();
	}
};
oFF.DfUiFormItem.prototype.setCustomRequiredText = function(requiredText)
{
	this.m_customRequiredText = requiredText;
};
oFF.DfUiFormItem.prototype.setCustomValidator = function(consumer)
{
	this.m_customValidator = consumer;
};
oFF.DfUiFormItem.prototype.setValueChangedConsumer = function(consumer)
{
	this.m_valueChangedConsumer = consumer;
	return this;
};
oFF.DfUiFormItem.prototype.setEnterPressedProcedure = function(procedure)
{
	this.m_enterPressedProcedure = procedure;
	return this;
};
oFF.DfUiFormItem.prototype.setInvalid = function(reason)
{
	this.m_isValid = false;
	this.setInvalidState(reason);
};
oFF.DfUiFormItem.prototype.setValid = function()
{
	this.m_isValid = true;
	this.setValidState();
};
oFF.DfUiFormItem.prototype.isRequiredValid = function()
{
	if (this.isRequired() && this.isEmpty())
	{
		return false;
	}
	return true;
};
oFF.DfUiFormItem.prototype.executeCustomValidator = function()
{
	if (oFF.notNull(this.m_customValidator))
	{
		this.m_customValidator(this);
	}
};
oFF.DfUiFormItem.prototype.getFormItemControl = function()
{
	return this.m_formItemControl;
};
oFF.DfUiFormItem.prototype.handleItemValueManualSet = function()
{
	this.itemValueUpdated();
	this.notifyValueChanged(false);
};
oFF.DfUiFormItem.prototype.handleItemValueChanged = function()
{
	this.itemValueUpdated();
	this.notifyValueChanged(true);
};
oFF.DfUiFormItem.prototype.handleItemEnterPressed = function()
{
	this.notifyEnterPressed();
};
oFF.DfUiFormItem.prototype.handleItemBlured = function()
{
	if (this.isUntouched())
	{
		this.m_blurTimeoutId = oFF.XTimeout.timeout(oFF.DfUiFormItem.INITIAL_BLUR_DELAY,  function(){
			this.validate();
		}.bind(this));
	}
	this.m_isUntouched = false;
	this.notifyBlur();
};
oFF.DfUiFormItem.prototype.getValueRequiredText = function()
{
	if (oFF.XStringUtils.isNotNullAndNotEmpty(this.getCustomRequiredText()))
	{
		return this.getCustomRequiredText();
	}
	else if (oFF.XStringUtils.isNotNullAndNotEmpty(this.getText()))
	{
		return oFF.XStringUtils.concatenate2(this.getText(), oFF.DfUiFormItem.REQUIRED_TEXT);
	}
	return oFF.DfUiFormItem.VALUE_REQUIRED_TEXT;
};
oFF.DfUiFormItem.prototype.getCustomRequiredText = function()
{
	return this.m_customRequiredText;
};
oFF.DfUiFormItem.prototype.getFormLabel = function()
{
	return this.m_formLabel;
};
oFF.DfUiFormItem.prototype.isPristine = function()
{
	return this.m_isPristine;
};
oFF.DfUiFormItem.prototype.isDirty = function()
{
	return !this.m_isPristine;
};
oFF.DfUiFormItem.prototype.isUntouched = function()
{
	return this.m_isUntouched;
};
oFF.DfUiFormItem.prototype.isTouched = function()
{
	return !this.m_isUntouched;
};
oFF.DfUiFormItem.prototype.setInternalBlurConsumer = function(procedure)
{
	this.m_internalBlurProcedure = procedure;
};
oFF.DfUiFormItem.prototype.setInternalValueChangedConsumer = function(consumer)
{
	this.m_internalValueChangedConsumer = consumer;
};
oFF.DfUiFormItem.prototype.setInternalEnterPressedProcedure = function(procedure)
{
	this.m_internalEnterPressedProcedure = procedure;
};
oFF.DfUiFormItem.prototype.refreshItemModel = function()
{
	this.refreshModelValue();
};
oFF.DfUiFormItem.prototype.getModelValueAsString = function()
{
	if (oFF.notNull(this.m_value))
	{
		return oFF.XValueUtil.getString(this.m_value);
	}
	return null;
};
oFF.DfUiFormItem.prototype.updateModelValueByString = function(newValue)
{
	if (oFF.XStringUtils.isNotNullAndNotEmpty(newValue))
	{
		if (oFF.notNull(this.m_value))
		{
			var tmpStrVal = this.m_value;
			tmpStrVal.setString(newValue);
		}
		else
		{
			this.m_value = oFF.XStringValue.create(newValue);
		}
	}
	else
	{
		this.m_value = oFF.XStringValue.create(null);
	}
};
oFF.DfUiFormItem.prototype.getModelValueAsBoolean = function()
{
	if (oFF.notNull(this.m_value))
	{
		return oFF.XValueUtil.getBoolean(this.m_value, false, true);
	}
	return false;
};
oFF.DfUiFormItem.prototype.updateModelValueByBoolean = function(newValue)
{
	if (oFF.notNull(this.m_value))
	{
		var tmpBoolVal = this.m_value;
		tmpBoolVal.setBoolean(newValue);
	}
	else
	{
		this.m_value = oFF.XBooleanValue.create(newValue);
	}
};
oFF.DfUiFormItem.prototype.getFormattedText = function()
{
	return this.getText();
};
oFF.DfUiFormItem.prototype.isModelItem = function()
{
	return true;
};
oFF.DfUiFormItem.prototype.setValueSafe = function(value)
{
	if (oFF.notNull(value) && value.getValueType() !== this.getValueType())
	{
		var errMsg = oFF.XStringUtils.concatenate4("Error! Cannot set form item value! Invalid value type, expected: ", this.getValueType().getName(), " but got: ", value.getValueType().getName());
		throw oFF.XException.createRuntimeException(errMsg);
	}
	this.m_value = value;
};
oFF.DfUiFormItem.prototype.itemValueUpdated = function()
{
	this.m_isPristine = false;
	if (this.isTouched())
	{
		this.validate();
	}
	else
	{
		this.refreshModelValue();
	}
};
oFF.DfUiFormItem.prototype.notifyValueChanged = function(notifyConsumer)
{
	if (notifyConsumer && oFF.notNull(this.m_valueChangedConsumer))
	{
		this.m_valueChangedConsumer(this.getKey(), this.getValue());
	}
	if (oFF.notNull(this.m_internalValueChangedConsumer))
	{
		this.m_internalValueChangedConsumer(this.getKey(), this.getValue());
	}
};
oFF.DfUiFormItem.prototype.notifyEnterPressed = function()
{
	if (oFF.notNull(this.m_enterPressedProcedure))
	{
		this.m_enterPressedProcedure();
	}
	if (oFF.notNull(this.m_internalEnterPressedProcedure))
	{
		this.m_internalEnterPressedProcedure();
	}
};
oFF.DfUiFormItem.prototype.notifyBlur = function()
{
	if (oFF.notNull(this.m_internalBlurProcedure))
	{
		this.m_internalBlurProcedure();
	}
};

oFF.UiForm = function() {};
oFF.UiForm.prototype = new oFF.XObject();
oFF.UiForm.prototype._ff_c = "UiForm";

oFF.UiForm.create = function(genesis)
{
	var form = new oFF.UiForm();
	form.setupform(genesis);
	return form;
};
oFF.UiForm.prototype.m_genesis = null;
oFF.UiForm.prototype.m_itemEnterPressedConsumer = null;
oFF.UiForm.prototype.m_modelChangedConsumer = null;
oFF.UiForm.prototype.m_formLayout = null;
oFF.UiForm.prototype.m_dataModel = null;
oFF.UiForm.prototype.m_formItemMap = null;
oFF.UiForm.prototype.m_formControlMap = null;
oFF.UiForm.prototype.m_internalItemBlurConsumer = null;
oFF.UiForm.prototype.releaseObject = function()
{
	this.m_genesis = null;
	this.m_itemEnterPressedConsumer = null;
	this.m_modelChangedConsumer = null;
	this.m_internalItemBlurConsumer = null;
	this.m_dataModel = oFF.XObjectExt.release(this.m_dataModel);
	this.m_formItemMap = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_formItemMap);
	this.m_formControlMap = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_formControlMap);
	this.m_formLayout = oFF.XObjectExt.release(this.m_formLayout);
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.UiForm.prototype.setupform = function(genesis)
{
	this.m_genesis = genesis;
	this.m_dataModel = oFF.PrStructure.create();
	this.m_formItemMap = oFF.XLinkedHashMapByString.create();
	this.m_formControlMap = oFF.XLinkedHashMapByString.create();
	this.m_formLayout = this.createFormWrapper(genesis);
};
oFF.UiForm.prototype.createFormWrapper = function(genesis)
{
	var layout = genesis.newControl(oFF.UiType.FLEX_LAYOUT);
	layout.useMaxWidth();
	layout.setHeight(oFF.UiCssLength.AUTO);
	layout.setDirection(oFF.UiFlexDirection.COLUMN);
	layout.setWrap(oFF.UiFlexWrap.NO_WRAP);
	layout.setAlignItems(oFF.UiFlexAlignItems.STRETCH);
	layout.setGap(oFF.UiCssGap.create("10px"));
	return layout;
};
oFF.UiForm.prototype.getView = function()
{
	return this.m_formLayout;
};
oFF.UiForm.prototype.getGenesis = function()
{
	return this.m_genesis;
};
oFF.UiForm.prototype.isValid = function()
{
	var isValid = true;
	var formItemIterator = this.m_formItemMap.getIterator();
	while (formItemIterator.hasNext())
	{
		var formItem = formItemIterator.next();
		isValid = formItem.isValid();
		if (!isValid)
		{
			break;
		}
	}
	return isValid;
};
oFF.UiForm.prototype.validate = function()
{
	var formItemIterator = this.m_formItemMap.getIterator();
	while (formItemIterator.hasNext())
	{
		var formItem = formItemIterator.next();
		formItem.validate();
	}
};
oFF.UiForm.prototype.getJsonModel = function()
{
	this.refreshModel();
	return this.m_dataModel;
};
oFF.UiForm.prototype.submit = function()
{
	this.validate();
};
oFF.UiForm.prototype.setItemEnterPressedConsumer = function(consumer)
{
	this.m_itemEnterPressedConsumer = consumer;
};
oFF.UiForm.prototype.setModelChangedConsumer = function(modelChangedConsumer)
{
	this.m_modelChangedConsumer = modelChangedConsumer;
};
oFF.UiForm.prototype.setGap = function(gap)
{
	this.m_formLayout.setGap(gap);
	return this;
};
oFF.UiForm.prototype.getAllFormItems = function()
{
	return this.m_formItemMap.getValuesAsReadOnlyList();
};
oFF.UiForm.prototype.getFormItemByKey = function(key)
{
	return this.m_formItemMap.getByKey(key);
};
oFF.UiForm.prototype.removeFormItemByKey = function(key)
{
	this.m_dataModel.remove(key);
	var formItem = this.m_formItemMap.remove(key);
	this.m_formControlMap.remove(key);
	if (oFF.notNull(formItem))
	{
		var tmpFormItem = formItem;
		tmpFormItem.setInternalBlurConsumer(null);
		tmpFormItem.setInternalValueChangedConsumer(null);
		tmpFormItem.setInternalEnterPressedProcedure(null);
		this.m_formLayout.removeItem(tmpFormItem.getFormControl());
	}
	return formItem;
};
oFF.UiForm.prototype.hasFormItems = function()
{
	return this.m_formItemMap.hasElements();
};
oFF.UiForm.prototype.clearFormItems = function()
{
	var keysIterator = this.m_formItemMap.getKeysAsIteratorOfString();
	while (keysIterator.hasNext())
	{
		var tmpKey = keysIterator.next();
		this.removeFormItemByKey(tmpKey);
	}
};
oFF.UiForm.prototype.getFormControlByName = function(name)
{
	return this.m_formControlMap.getByKey(name);
};
oFF.UiForm.prototype.removeFormControlByName = function(name)
{
	var formControl = this.getFormControlByName(name);
	if (oFF.notNull(formControl))
	{
		var tmpFormControl = formControl;
		if (tmpFormControl.hasModelValue())
		{
			this.removeFormItemByKey(name);
		}
		else
		{
			this.m_formControlMap.remove(name);
			this.m_formLayout.removeItem(tmpFormControl.getFormControl());
		}
	}
	return formControl;
};
oFF.UiForm.prototype.addInput = function(key, value, text, placeholder, inputType, valueHelpProcedure)
{
	var inputFormItem = oFF.UiFormItemInput.create(this.m_genesis, key, oFF.XStringValue.create(value), text, placeholder, inputType, valueHelpProcedure);
	this.addFormItem(inputFormItem);
	return inputFormItem;
};
oFF.UiForm.prototype.addSwitch = function(key, value, text)
{
	var switchFormItem = oFF.UiFormItemSwitch.create(this.m_genesis, key, oFF.XBooleanValue.create(value), text);
	this.addFormItem(switchFormItem);
	return switchFormItem;
};
oFF.UiForm.prototype.addCheckbox = function(key, value, text)
{
	var checkboxFormItem = oFF.UiFormItemCheckbox.create(this.m_genesis, key, oFF.XBooleanValue.create(value), text);
	this.addFormItem(checkboxFormItem);
	return checkboxFormItem;
};
oFF.UiForm.prototype.addDropdown = function(key, value, text, dropdownItems, addEmptyItem)
{
	var dropdownFormItem = oFF.UiFormItemDropdown.create(this.m_genesis, key, oFF.XStringValue.create(value), text, dropdownItems, addEmptyItem);
	this.addFormItem(dropdownFormItem);
	return dropdownFormItem;
};
oFF.UiForm.prototype.addComboBox = function(key, value, text, dropdownItems, addEmptyItem)
{
	var comboBoxFormItem = oFF.UiFormItemComboBox.create(this.m_genesis, key, oFF.XStringValue.create(value), text, dropdownItems, addEmptyItem);
	this.addFormItem(comboBoxFormItem);
	return comboBoxFormItem;
};
oFF.UiForm.prototype.addSegmentedButton = function(key, value, text, segmentedButtonItems)
{
	var segmentedButtonFormItem = oFF.UiFormItemSegmentedButton.create(this.m_genesis, key, oFF.XStringValue.create(value), text, segmentedButtonItems);
	this.addFormItem(segmentedButtonFormItem);
	return segmentedButtonFormItem;
};
oFF.UiForm.prototype.addRadioGroup = function(key, value, text, radioGroupItems)
{
	var radioGroupFormItem = oFF.UiFormItemRadioGroup.create(this.m_genesis, key, oFF.XStringValue.create(value), text, radioGroupItems);
	this.addFormItem(radioGroupFormItem);
	return radioGroupFormItem;
};
oFF.UiForm.prototype.addFormSection = function(key, text, isHorizontal)
{
	var formSection = oFF.UiFormSection.create(this.m_genesis, key, text, isHorizontal);
	this.addFormItem(formSection);
	return formSection;
};
oFF.UiForm.prototype.addFormButton = function(name, text, tooltip, icon, pressProcedure)
{
	var formButton = oFF.UiFormButton.create(this.m_genesis, name, text, tooltip, icon, pressProcedure);
	this.addFormControl(formButton);
	return formButton;
};
oFF.UiForm.prototype.addFormLabel = function(name, text, tooltip)
{
	var formLabel = oFF.UiFormLabel.create(this.m_genesis, name, text, tooltip);
	this.addFormControl(formLabel);
	return formLabel;
};
oFF.UiForm.prototype.addFormTitle = function(name, text, tooltip)
{
	var formTitle = oFF.UiFormTitle.create(this.m_genesis, name, text, tooltip);
	this.addFormControl(formTitle);
	return formTitle;
};
oFF.UiForm.prototype.addFormCustomControl = function(name, customControl)
{
	var formCustomControl = oFF.UiFormCustomControl.create(this.m_genesis, name, customControl);
	this.addFormControl(formCustomControl);
	return formCustomControl;
};
oFF.UiForm.prototype.addFormControl = function(formControl)
{
	if (oFF.notNull(formControl))
	{
		var tmpFormControl = formControl;
		var formControlControl = tmpFormControl.getFormControl();
		this.m_formLayout.addItem(formControlControl);
		if (oFF.XStringUtils.isNotNullAndNotEmpty(formControl.getName()))
		{
			this.m_formControlMap.put(formControl.getName(), tmpFormControl);
		}
	}
};
oFF.UiForm.prototype.addFormItem = function(formItem)
{
	if (oFF.notNull(formItem))
	{
		this.addFormControl(formItem);
		var key = formItem.getKey();
		if (oFF.XStringUtils.isNotNullAndNotEmpty(key) && !this.m_formItemMap.containsKey(key))
		{
			this.m_formItemMap.put(key, formItem);
			this.updateModelValue(key, formItem.getValue(), true);
			var tmpFormItem = formItem;
			tmpFormItem.setInternalBlurConsumer( function(){
				this.notifyInternalItemBlur(tmpFormItem);
			}.bind(this));
			tmpFormItem.setInternalValueChangedConsumer( function(valKey, value){
				this.updateModelValue(valKey, value, true);
			}.bind(this));
			tmpFormItem.setInternalEnterPressedProcedure( function(){
				this.notifyItemEnterPressed(tmpFormItem);
			}.bind(this));
		}
	}
};
oFF.UiForm.prototype.setHorizontal = function(isHorizontal)
{
	if (isHorizontal)
	{
		this.m_formLayout.setDirection(oFF.UiFlexDirection.ROW);
		this.m_formLayout.setWrap(oFF.UiFlexWrap.WRAP);
		this.m_formLayout.setAlignItems(oFF.UiFlexAlignItems.END);
		this.m_formLayout.setSize(oFF.UiSize.createByCss("100%", "auto"));
	}
	else
	{
		this.m_formLayout.setDirection(oFF.UiFlexDirection.COLUMN);
		this.m_formLayout.setWrap(oFF.UiFlexWrap.NO_WRAP);
		this.m_formLayout.setAlignItems(oFF.UiFlexAlignItems.STRETCH);
		this.m_formLayout.useMaxSpace();
	}
};
oFF.UiForm.prototype.setInternalItemBlurConsumer = function(consumer)
{
	this.m_internalItemBlurConsumer = consumer;
};
oFF.UiForm.prototype.collectModelValues = function()
{
	var formItemIterator = this.m_formItemMap.getIterator();
	while (formItemIterator.hasNext())
	{
		var formItem = formItemIterator.next();
		formItem.refreshItemModel();
	}
};
oFF.UiForm.prototype.refreshModel = function()
{
	var keyIterator = this.m_formItemMap.getKeysAsIteratorOfString();
	while (keyIterator.hasNext())
	{
		var key = keyIterator.next();
		var formItem = this.m_formItemMap.getByKey(key);
		this.updateModelValue(key, formItem.getValue(), false);
	}
};
oFF.UiForm.prototype.updateModelValue = function(key, value, notifyChanged)
{
	if (oFF.XStringUtils.isNotNullAndNotEmpty(key))
	{
		if (oFF.notNull(value))
		{
			var valueType = value.getValueType();
			if (valueType === oFF.XValueType.STRING)
			{
				var strVal = value;
				this.m_dataModel.putString(key, strVal.getString());
			}
			else if (valueType === oFF.XValueType.BOOLEAN)
			{
				var boolVal = value;
				this.m_dataModel.putBoolean(key, boolVal.getBoolean());
			}
			else if (valueType === oFF.XValueType.STRUCTURE)
			{
				var structValue = value;
				this.m_dataModel.put(key, structValue);
			}
		}
		else
		{
			this.m_dataModel.putNull(key);
		}
		if (notifyChanged)
		{
			this.notifyModelChanged();
		}
	}
};
oFF.UiForm.prototype.notifyModelChanged = function()
{
	if (oFF.notNull(this.m_modelChangedConsumer))
	{
		this.m_modelChangedConsumer(this.m_dataModel);
	}
};
oFF.UiForm.prototype.notifyItemEnterPressed = function(formItem)
{
	if (oFF.notNull(this.m_itemEnterPressedConsumer))
	{
		this.m_itemEnterPressedConsumer(formItem);
	}
};
oFF.UiForm.prototype.notifyInternalItemBlur = function(formItem)
{
	if (oFF.notNull(this.m_internalItemBlurConsumer))
	{
		this.m_internalItemBlurConsumer(formItem);
	}
};

oFF.UiFormButton = function() {};
oFF.UiFormButton.prototype = new oFF.DfUiFormControl();
oFF.UiFormButton.prototype._ff_c = "UiFormButton";

oFF.UiFormButton.create = function(genesis, name, text, tooltip, icon, pressProcedure)
{
	var newFormItem = new oFF.UiFormButton();
	newFormItem.setupFormButton(genesis, name, text, tooltip, icon, pressProcedure);
	return newFormItem;
};
oFF.UiFormButton.prototype.m_text = null;
oFF.UiFormButton.prototype.m_tooltip = null;
oFF.UiFormButton.prototype.m_icon = null;
oFF.UiFormButton.prototype.m_pressProcedure = null;
oFF.UiFormButton.prototype.setupFormButton = function(genesis, name, text, tooltip, icon, pressProcedure)
{
	this.m_text = text;
	this.m_tooltip = tooltip;
	this.m_icon = icon;
	this.m_pressProcedure = pressProcedure;
	this.setupFormControl(genesis, name);
};
oFF.UiFormButton.prototype.releaseObject = function()
{
	this.m_pressProcedure = null;
	oFF.DfUiFormControl.prototype.releaseObject.call( this );
};
oFF.UiFormButton.prototype.createFormUiControl = function(genesis)
{
	var newBtn = genesis.newControl(oFF.UiType.BUTTON);
	newBtn.setName(this.getName());
	newBtn.setText(this.m_text);
	newBtn.setTooltip(this.m_tooltip);
	newBtn.setIcon(this.m_icon);
	newBtn.setFlex("none");
	newBtn.registerOnPress(this);
	return newBtn;
};
oFF.UiFormButton.prototype.setEnabled = function(enabled)
{
	this.getButtonControl().setEnabled(enabled);
	return this;
};
oFF.UiFormButton.prototype.setButtonType = function(buttonType)
{
	this.getButtonControl().setButtonType(buttonType);
	return this;
};
oFF.UiFormButton.prototype.getButtonControl = function()
{
	return this.getFormControl();
};
oFF.UiFormButton.prototype.onPress = function(event)
{
	if (oFF.notNull(this.m_pressProcedure))
	{
		this.m_pressProcedure();
	}
};

oFF.UiFormCustomControl = function() {};
oFF.UiFormCustomControl.prototype = new oFF.DfUiFormControl();
oFF.UiFormCustomControl.prototype._ff_c = "UiFormCustomControl";

oFF.UiFormCustomControl.create = function(genesis, name, control)
{
	var newFormItem = new oFF.UiFormCustomControl();
	newFormItem.setupFormCustomControl(genesis, name, control);
	return newFormItem;
};
oFF.UiFormCustomControl.prototype.m_customControl = null;
oFF.UiFormCustomControl.prototype.setupFormCustomControl = function(genesis, name, control)
{
	this.m_customControl = control;
	this.setupFormControl(genesis, name);
};
oFF.UiFormCustomControl.prototype.releaseObject = function()
{
	this.m_customControl = null;
	oFF.DfUiFormControl.prototype.releaseObject.call( this );
};
oFF.UiFormCustomControl.prototype.createFormUiControl = function(genesis)
{
	return this.m_customControl;
};
oFF.UiFormCustomControl.prototype.setEnabled = function(enabled)
{
	this.getCustomControl().setEnabled(enabled);
	return this;
};
oFF.UiFormCustomControl.prototype.getCustomControl = function()
{
	return this.m_customControl;
};

oFF.UiFormLabel = function() {};
oFF.UiFormLabel.prototype = new oFF.DfUiFormControl();
oFF.UiFormLabel.prototype._ff_c = "UiFormLabel";

oFF.UiFormLabel.create = function(genesis, name, text, tooltip)
{
	var newFormItem = new oFF.UiFormLabel();
	newFormItem.setupFormLabel(genesis, name, text, tooltip);
	return newFormItem;
};
oFF.UiFormLabel.prototype.m_text = null;
oFF.UiFormLabel.prototype.m_tooltip = null;
oFF.UiFormLabel.prototype.setupFormLabel = function(genesis, name, text, tooltip)
{
	this.m_text = text;
	this.m_tooltip = tooltip;
	this.setupFormControl(genesis, name);
};
oFF.UiFormLabel.prototype.releaseObject = function()
{
	oFF.DfUiFormControl.prototype.releaseObject.call( this );
};
oFF.UiFormLabel.prototype.createFormUiControl = function(genesis)
{
	var newLbl = genesis.newControl(oFF.UiType.LABEL);
	newLbl.setName(this.getName());
	newLbl.setText(this.m_text);
	newLbl.setTooltip(this.m_tooltip);
	newLbl.setFlex("0 0 auto");
	newLbl.setFontWeight(oFF.UiFontWeight.BOLD);
	return newLbl;
};
oFF.UiFormLabel.prototype.setEnabled = function(enabled)
{
	return this;
};
oFF.UiFormLabel.prototype.setText = function(text)
{
	this.getLabelControl().setText(text);
	return this;
};
oFF.UiFormLabel.prototype.setTooltip = function(tooltip)
{
	this.getLabelControl().setTooltip(tooltip);
	return this;
};
oFF.UiFormLabel.prototype.setRequired = function(isRequired)
{
	this.getLabelControl().setRequired(isRequired);
	return this;
};
oFF.UiFormLabel.prototype.setFontWeight = function(fontWeight)
{
	this.getLabelControl().setFontWeight(fontWeight);
	return this;
};
oFF.UiFormLabel.prototype.setTextDecoration = function(textDecoration)
{
	this.getLabelControl().setTextDecoration(textDecoration);
	return this;
};
oFF.UiFormLabel.prototype.setTextAlign = function(textAlign)
{
	this.getLabelControl().setTextAlign(textAlign);
	return this;
};
oFF.UiFormLabel.prototype.setLabelFor = function(control)
{
	this.getLabelControl().setLabelFor(control);
	return this;
};
oFF.UiFormLabel.prototype.getLabelControl = function()
{
	return this.getFormControl();
};

oFF.UiFormTitle = function() {};
oFF.UiFormTitle.prototype = new oFF.DfUiFormControl();
oFF.UiFormTitle.prototype._ff_c = "UiFormTitle";

oFF.UiFormTitle.create = function(genesis, name, text, tooltip)
{
	var newFormItem = new oFF.UiFormTitle();
	newFormItem.setupFormTitle(genesis, name, text, tooltip);
	return newFormItem;
};
oFF.UiFormTitle.prototype.m_text = null;
oFF.UiFormTitle.prototype.m_tooltip = null;
oFF.UiFormTitle.prototype.setupFormTitle = function(genesis, name, text, tooltip)
{
	this.m_text = text;
	this.m_tooltip = tooltip;
	this.setupFormControl(genesis, name);
};
oFF.UiFormTitle.prototype.releaseObject = function()
{
	oFF.DfUiFormControl.prototype.releaseObject.call( this );
};
oFF.UiFormTitle.prototype.createFormUiControl = function(genesis)
{
	var newTitle = genesis.newControl(oFF.UiType.LABEL);
	newTitle.setName(this.getName());
	newTitle.setText(this.m_text);
	newTitle.setTooltip(this.m_tooltip);
	newTitle.setFlex("0 0 auto");
	return newTitle;
};
oFF.UiFormTitle.prototype.setEnabled = function(enabled)
{
	return this;
};
oFF.UiFormTitle.prototype.setText = function(text)
{
	this.getTitleControl().setText(text);
	return this;
};
oFF.UiFormTitle.prototype.setTooltip = function(tooltip)
{
	this.getTitleControl().setTooltip(tooltip);
	return this;
};
oFF.UiFormTitle.prototype.setTextAlign = function(textAlign)
{
	this.getTitleControl().setTextAlign(textAlign);
	return this;
};
oFF.UiFormTitle.prototype.setTitleLevel = function(titleLevel)
{
	this.getTitleControl().setTitleLevel(titleLevel);
	return this;
};
oFF.UiFormTitle.prototype.setTitleStyle = function(titleStyle)
{
	this.getTitleControl().setTitleStyle(titleStyle);
	return this;
};
oFF.UiFormTitle.prototype.getTitleControl = function()
{
	return this.getFormControl();
};

oFF.DfUiContentView = function() {};
oFF.DfUiContentView.prototype = new oFF.DfUiView();
oFF.DfUiContentView.prototype._ff_c = "DfUiContentView";

oFF.DfUiContentView.prototype.getWrapperControl = function(genesis)
{
	return genesis.newControl(oFF.UiType.CONTENT_WRAPPER);
};

oFF.DfUiPageView = function() {};
oFF.DfUiPageView.prototype = new oFF.DfUiView();
oFF.DfUiPageView.prototype._ff_c = "DfUiPageView";

oFF.DfUiPageView.prototype.getWrapperControl = function(genesis)
{
	return genesis.newControl(oFF.UiType.PAGE);
};

oFF.DfUiScrollContainerView = function() {};
oFF.DfUiScrollContainerView.prototype = new oFF.DfUiView();
oFF.DfUiScrollContainerView.prototype._ff_c = "DfUiScrollContainerView";

oFF.DfUiScrollContainerView.prototype.getWrapperControl = function(genesis)
{
	return genesis.newControl(oFF.UiType.SCROLL_CONTAINER);
};

oFF.DfUiWidget = function() {};
oFF.DfUiWidget.prototype = new oFF.DfUiSimpleView();
oFF.DfUiWidget.prototype._ff_c = "DfUiWidget";

oFF.DfUiWidget.prototype.m_widgetWrapper = null;
oFF.DfUiWidget.prototype.initView = function(genesis)
{
	oFF.DfUiSimpleView.prototype.initView.call( this , genesis);
};
oFF.DfUiWidget.prototype.releaseObject = function()
{
	this.m_widgetWrapper = oFF.XObjectExt.release(this.m_widgetWrapper);
	oFF.DfUiSimpleView.prototype.releaseObject.call( this );
};
oFF.DfUiWidget.prototype.getView = function()
{
	return this.m_widgetWrapper;
};
oFF.DfUiWidget.prototype.setupView = function() {};
oFF.DfUiWidget.prototype.buildViewUi = function(genesis)
{
	this.m_widgetWrapper = genesis.newControl(oFF.UiType.FLEX_LAYOUT);
	this.m_widgetWrapper.addCssClass("ffUiWidget");
	this.setupWidget(this.m_widgetWrapper);
	this.buildWidgetUi(this.m_widgetWrapper);
};
oFF.DfUiWidget.prototype.initWidget = function(genesis)
{
	this.initView(genesis);
};
oFF.DfUiWidget.prototype.setName = function(name)
{
	if (this.getView() !== null)
	{
		this.getView().setName(name);
	}
	return this;
};
oFF.DfUiWidget.prototype.addCssClass = function(cssClass)
{
	if (this.getView() !== null)
	{
		this.getView().addCssClass(cssClass);
	}
	return this;
};
oFF.DfUiWidget.prototype.removeCssClass = function(cssClass)
{
	if (this.getView() !== null)
	{
		this.getView().removeCssClass(cssClass);
	}
	return this;
};

oFF.UiLambdaAfterCloseListener = function() {};
oFF.UiLambdaAfterCloseListener.prototype = new oFF.XObject();
oFF.UiLambdaAfterCloseListener.prototype._ff_c = "UiLambdaAfterCloseListener";

oFF.UiLambdaAfterCloseListener.create = function(consumer)
{
	var obj = new oFF.UiLambdaAfterCloseListener();
	obj.m_consumer = consumer;
	return obj;
};
oFF.UiLambdaAfterCloseListener.prototype.m_consumer = null;
oFF.UiLambdaAfterCloseListener.prototype.onAfterClose = function(event)
{
	this.m_consumer(event);
};
oFF.UiLambdaAfterCloseListener.prototype.releaseObject = function()
{
	this.m_consumer = null;
	oFF.XObject.prototype.releaseObject.call( this );
};

oFF.UiLambdaAfterOpenListener = function() {};
oFF.UiLambdaAfterOpenListener.prototype = new oFF.XObject();
oFF.UiLambdaAfterOpenListener.prototype._ff_c = "UiLambdaAfterOpenListener";

oFF.UiLambdaAfterOpenListener.create = function(consumer)
{
	var obj = new oFF.UiLambdaAfterOpenListener();
	obj.m_consumer = consumer;
	return obj;
};
oFF.UiLambdaAfterOpenListener.prototype.m_consumer = null;
oFF.UiLambdaAfterOpenListener.prototype.onAfterOpen = function(event)
{
	this.m_consumer(event);
};
oFF.UiLambdaAfterOpenListener.prototype.releaseObject = function()
{
	this.m_consumer = null;
	oFF.XObject.prototype.releaseObject.call( this );
};

oFF.UiLambdaBackListener = function() {};
oFF.UiLambdaBackListener.prototype = new oFF.XObject();
oFF.UiLambdaBackListener.prototype._ff_c = "UiLambdaBackListener";

oFF.UiLambdaBackListener.create = function(consumer)
{
	var obj = new oFF.UiLambdaBackListener();
	obj.m_consumer = consumer;
	return obj;
};
oFF.UiLambdaBackListener.prototype.m_consumer = null;
oFF.UiLambdaBackListener.prototype.onBack = function(event)
{
	this.m_consumer(event);
};
oFF.UiLambdaBackListener.prototype.releaseObject = function()
{
	this.m_consumer = null;
	oFF.XObject.prototype.releaseObject.call( this );
};

oFF.UiLambdaBeforeCloseListener = function() {};
oFF.UiLambdaBeforeCloseListener.prototype = new oFF.XObject();
oFF.UiLambdaBeforeCloseListener.prototype._ff_c = "UiLambdaBeforeCloseListener";

oFF.UiLambdaBeforeCloseListener.create = function(consumer)
{
	var obj = new oFF.UiLambdaBeforeCloseListener();
	obj.m_consumer = consumer;
	return obj;
};
oFF.UiLambdaBeforeCloseListener.prototype.m_consumer = null;
oFF.UiLambdaBeforeCloseListener.prototype.onBeforeClose = function(event)
{
	this.m_consumer(event);
};
oFF.UiLambdaBeforeCloseListener.prototype.releaseObject = function()
{
	this.m_consumer = null;
	oFF.XObject.prototype.releaseObject.call( this );
};

oFF.UiLambdaBeforeOpenListener = function() {};
oFF.UiLambdaBeforeOpenListener.prototype = new oFF.XObject();
oFF.UiLambdaBeforeOpenListener.prototype._ff_c = "UiLambdaBeforeOpenListener";

oFF.UiLambdaBeforeOpenListener.create = function(consumer)
{
	var obj = new oFF.UiLambdaBeforeOpenListener();
	obj.m_consumer = consumer;
	return obj;
};
oFF.UiLambdaBeforeOpenListener.prototype.m_consumer = null;
oFF.UiLambdaBeforeOpenListener.prototype.onBeforeOpen = function(event)
{
	this.m_consumer(event);
};
oFF.UiLambdaBeforeOpenListener.prototype.releaseObject = function()
{
	this.m_consumer = null;
	oFF.XObject.prototype.releaseObject.call( this );
};

oFF.UiLambdaChangeListener = function() {};
oFF.UiLambdaChangeListener.prototype = new oFF.XObject();
oFF.UiLambdaChangeListener.prototype._ff_c = "UiLambdaChangeListener";

oFF.UiLambdaChangeListener.create = function(consumer)
{
	var obj = new oFF.UiLambdaChangeListener();
	obj.m_consumer = consumer;
	return obj;
};
oFF.UiLambdaChangeListener.prototype.m_consumer = null;
oFF.UiLambdaChangeListener.prototype.onChange = function(event)
{
	this.m_consumer(event);
};
oFF.UiLambdaChangeListener.prototype.releaseObject = function()
{
	this.m_consumer = null;
	oFF.XObject.prototype.releaseObject.call( this );
};

oFF.UiLambdaClickListener = function() {};
oFF.UiLambdaClickListener.prototype = new oFF.XObject();
oFF.UiLambdaClickListener.prototype._ff_c = "UiLambdaClickListener";

oFF.UiLambdaClickListener.create = function(consumer)
{
	var obj = new oFF.UiLambdaClickListener();
	obj.m_consumer = consumer;
	return obj;
};
oFF.UiLambdaClickListener.prototype.m_consumer = null;
oFF.UiLambdaClickListener.prototype.onClick = function(event)
{
	this.m_consumer(event);
};
oFF.UiLambdaClickListener.prototype.releaseObject = function()
{
	this.m_consumer = null;
	oFF.XObject.prototype.releaseObject.call( this );
};

oFF.UiLambdaCloseListener = function() {};
oFF.UiLambdaCloseListener.prototype = new oFF.XObject();
oFF.UiLambdaCloseListener.prototype._ff_c = "UiLambdaCloseListener";

oFF.UiLambdaCloseListener.create = function(consumer)
{
	var obj = new oFF.UiLambdaCloseListener();
	obj.m_consumer = consumer;
	return obj;
};
oFF.UiLambdaCloseListener.prototype.m_consumer = null;
oFF.UiLambdaCloseListener.prototype.onClose = function(event)
{
	this.m_consumer(event);
};
oFF.UiLambdaCloseListener.prototype.releaseObject = function()
{
	this.m_consumer = null;
	oFF.XObject.prototype.releaseObject.call( this );
};

oFF.UiLambdaCollapseListener = function() {};
oFF.UiLambdaCollapseListener.prototype = new oFF.XObject();
oFF.UiLambdaCollapseListener.prototype._ff_c = "UiLambdaCollapseListener";

oFF.UiLambdaCollapseListener.create = function(consumer)
{
	var obj = new oFF.UiLambdaCollapseListener();
	obj.m_consumer = consumer;
	return obj;
};
oFF.UiLambdaCollapseListener.prototype.m_consumer = null;
oFF.UiLambdaCollapseListener.prototype.onCollapse = function(event)
{
	this.m_consumer(event);
};
oFF.UiLambdaCollapseListener.prototype.releaseObject = function()
{
	this.m_consumer = null;
	oFF.XObject.prototype.releaseObject.call( this );
};

oFF.UiLambdaContextMenuListener = function() {};
oFF.UiLambdaContextMenuListener.prototype = new oFF.XObject();
oFF.UiLambdaContextMenuListener.prototype._ff_c = "UiLambdaContextMenuListener";

oFF.UiLambdaContextMenuListener.create = function(consumer)
{
	var obj = new oFF.UiLambdaContextMenuListener();
	obj.m_consumer = consumer;
	return obj;
};
oFF.UiLambdaContextMenuListener.prototype.m_consumer = null;
oFF.UiLambdaContextMenuListener.prototype.onContextMenu = function(event)
{
	this.m_consumer(event);
};
oFF.UiLambdaContextMenuListener.prototype.releaseObject = function()
{
	this.m_consumer = null;
	oFF.XObject.prototype.releaseObject.call( this );
};

oFF.UiLambdaDoubleClickListener = function() {};
oFF.UiLambdaDoubleClickListener.prototype = new oFF.XObject();
oFF.UiLambdaDoubleClickListener.prototype._ff_c = "UiLambdaDoubleClickListener";

oFF.UiLambdaDoubleClickListener.create = function(consumer)
{
	var obj = new oFF.UiLambdaDoubleClickListener();
	obj.m_consumer = consumer;
	return obj;
};
oFF.UiLambdaDoubleClickListener.prototype.m_consumer = null;
oFF.UiLambdaDoubleClickListener.prototype.onDoubleClick = function(event)
{
	this.m_consumer(event);
};
oFF.UiLambdaDoubleClickListener.prototype.releaseObject = function()
{
	this.m_consumer = null;
	oFF.XObject.prototype.releaseObject.call( this );
};

oFF.UiLambdaDragEndListener = function() {};
oFF.UiLambdaDragEndListener.prototype = new oFF.XObject();
oFF.UiLambdaDragEndListener.prototype._ff_c = "UiLambdaDragEndListener";

oFF.UiLambdaDragEndListener.create = function(consumer)
{
	var obj = new oFF.UiLambdaDragEndListener();
	obj.m_consumer = consumer;
	return obj;
};
oFF.UiLambdaDragEndListener.prototype.m_consumer = null;
oFF.UiLambdaDragEndListener.prototype.onDragEnd = function(event)
{
	this.m_consumer(event);
};
oFF.UiLambdaDragEndListener.prototype.releaseObject = function()
{
	this.m_consumer = null;
	oFF.XObject.prototype.releaseObject.call( this );
};

oFF.UiLambdaDragStartListener = function() {};
oFF.UiLambdaDragStartListener.prototype = new oFF.XObject();
oFF.UiLambdaDragStartListener.prototype._ff_c = "UiLambdaDragStartListener";

oFF.UiLambdaDragStartListener.create = function(consumer)
{
	var obj = new oFF.UiLambdaDragStartListener();
	obj.m_consumer = consumer;
	return obj;
};
oFF.UiLambdaDragStartListener.prototype.m_consumer = null;
oFF.UiLambdaDragStartListener.prototype.onDragStart = function(event)
{
	this.m_consumer(event);
};
oFF.UiLambdaDragStartListener.prototype.releaseObject = function()
{
	this.m_consumer = null;
	oFF.XObject.prototype.releaseObject.call( this );
};

oFF.UiLambdaDropListener = function() {};
oFF.UiLambdaDropListener.prototype = new oFF.XObject();
oFF.UiLambdaDropListener.prototype._ff_c = "UiLambdaDropListener";

oFF.UiLambdaDropListener.create = function(consumer)
{
	var obj = new oFF.UiLambdaDropListener();
	obj.m_consumer = consumer;
	return obj;
};
oFF.UiLambdaDropListener.prototype.m_consumer = null;
oFF.UiLambdaDropListener.prototype.onDrop = function(event)
{
	this.m_consumer(event);
};
oFF.UiLambdaDropListener.prototype.releaseObject = function()
{
	this.m_consumer = null;
	oFF.XObject.prototype.releaseObject.call( this );
};

oFF.UiLambdaEditingEndListener = function() {};
oFF.UiLambdaEditingEndListener.prototype = new oFF.XObject();
oFF.UiLambdaEditingEndListener.prototype._ff_c = "UiLambdaEditingEndListener";

oFF.UiLambdaEditingEndListener.create = function(consumer)
{
	var obj = new oFF.UiLambdaEditingEndListener();
	obj.m_consumer = consumer;
	return obj;
};
oFF.UiLambdaEditingEndListener.prototype.m_consumer = null;
oFF.UiLambdaEditingEndListener.prototype.onEditingEnd = function(event)
{
	this.m_consumer(event);
};
oFF.UiLambdaEditingEndListener.prototype.releaseObject = function()
{
	this.m_consumer = null;
	oFF.XObject.prototype.releaseObject.call( this );
};

oFF.UiLambdaEnterListener = function() {};
oFF.UiLambdaEnterListener.prototype = new oFF.XObject();
oFF.UiLambdaEnterListener.prototype._ff_c = "UiLambdaEnterListener";

oFF.UiLambdaEnterListener.create = function(consumer)
{
	var obj = new oFF.UiLambdaEnterListener();
	obj.m_consumer = consumer;
	return obj;
};
oFF.UiLambdaEnterListener.prototype.m_consumer = null;
oFF.UiLambdaEnterListener.prototype.onEnter = function(event)
{
	this.m_consumer(event);
};
oFF.UiLambdaEnterListener.prototype.releaseObject = function()
{
	this.m_consumer = null;
	oFF.XObject.prototype.releaseObject.call( this );
};

oFF.UiLambdaErrorListener = function() {};
oFF.UiLambdaErrorListener.prototype = new oFF.XObject();
oFF.UiLambdaErrorListener.prototype._ff_c = "UiLambdaErrorListener";

oFF.UiLambdaErrorListener.create = function(consumer)
{
	var obj = new oFF.UiLambdaErrorListener();
	obj.m_consumer = consumer;
	return obj;
};
oFF.UiLambdaErrorListener.prototype.m_consumer = null;
oFF.UiLambdaErrorListener.prototype.onError = function(event)
{
	this.m_consumer(event);
};
oFF.UiLambdaErrorListener.prototype.releaseObject = function()
{
	this.m_consumer = null;
	oFF.XObject.prototype.releaseObject.call( this );
};

oFF.UiLambdaEscapeListener = function() {};
oFF.UiLambdaEscapeListener.prototype = new oFF.XObject();
oFF.UiLambdaEscapeListener.prototype._ff_c = "UiLambdaEscapeListener";

oFF.UiLambdaEscapeListener.create = function(consumer)
{
	var obj = new oFF.UiLambdaEscapeListener();
	obj.m_consumer = consumer;
	return obj;
};
oFF.UiLambdaEscapeListener.prototype.m_consumer = null;
oFF.UiLambdaEscapeListener.prototype.onEscape = function(event)
{
	this.m_consumer(event);
};
oFF.UiLambdaEscapeListener.prototype.releaseObject = function()
{
	this.m_consumer = null;
	oFF.XObject.prototype.releaseObject.call( this );
};

oFF.UiLambdaExpandListener = function() {};
oFF.UiLambdaExpandListener.prototype = new oFF.XObject();
oFF.UiLambdaExpandListener.prototype._ff_c = "UiLambdaExpandListener";

oFF.UiLambdaExpandListener.create = function(consumer)
{
	var obj = new oFF.UiLambdaExpandListener();
	obj.m_consumer = consumer;
	return obj;
};
oFF.UiLambdaExpandListener.prototype.m_consumer = null;
oFF.UiLambdaExpandListener.prototype.onExpand = function(event)
{
	this.m_consumer(event);
};
oFF.UiLambdaExpandListener.prototype.releaseObject = function()
{
	this.m_consumer = null;
	oFF.XObject.prototype.releaseObject.call( this );
};

oFF.UiLambdaFileDropListener = function() {};
oFF.UiLambdaFileDropListener.prototype = new oFF.XObject();
oFF.UiLambdaFileDropListener.prototype._ff_c = "UiLambdaFileDropListener";

oFF.UiLambdaFileDropListener.create = function(consumer)
{
	var obj = new oFF.UiLambdaFileDropListener();
	obj.m_consumer = consumer;
	return obj;
};
oFF.UiLambdaFileDropListener.prototype.m_consumer = null;
oFF.UiLambdaFileDropListener.prototype.onFileDrop = function(event)
{
	this.m_consumer(event);
};
oFF.UiLambdaFileDropListener.prototype.releaseObject = function()
{
	this.m_consumer = null;
	oFF.XObject.prototype.releaseObject.call( this );
};

oFF.UiLambdaHoverEndListener = function() {};
oFF.UiLambdaHoverEndListener.prototype = new oFF.XObject();
oFF.UiLambdaHoverEndListener.prototype._ff_c = "UiLambdaHoverEndListener";

oFF.UiLambdaHoverEndListener.create = function(consumer)
{
	var obj = new oFF.UiLambdaHoverEndListener();
	obj.m_consumer = consumer;
	return obj;
};
oFF.UiLambdaHoverEndListener.prototype.m_consumer = null;
oFF.UiLambdaHoverEndListener.prototype.onHoverEnd = function(event)
{
	this.m_consumer(event);
};
oFF.UiLambdaHoverEndListener.prototype.releaseObject = function()
{
	this.m_consumer = null;
	oFF.XObject.prototype.releaseObject.call( this );
};

oFF.UiLambdaHoverListener = function() {};
oFF.UiLambdaHoverListener.prototype = new oFF.XObject();
oFF.UiLambdaHoverListener.prototype._ff_c = "UiLambdaHoverListener";

oFF.UiLambdaHoverListener.create = function(consumer)
{
	var obj = new oFF.UiLambdaHoverListener();
	obj.m_consumer = consumer;
	return obj;
};
oFF.UiLambdaHoverListener.prototype.m_consumer = null;
oFF.UiLambdaHoverListener.prototype.onHover = function(event)
{
	this.m_consumer(event);
};
oFF.UiLambdaHoverListener.prototype.releaseObject = function()
{
	this.m_consumer = null;
	oFF.XObject.prototype.releaseObject.call( this );
};

oFF.UiLambdaItemSelectListener = function() {};
oFF.UiLambdaItemSelectListener.prototype = new oFF.XObject();
oFF.UiLambdaItemSelectListener.prototype._ff_c = "UiLambdaItemSelectListener";

oFF.UiLambdaItemSelectListener.create = function(consumer)
{
	var obj = new oFF.UiLambdaItemSelectListener();
	obj.m_consumer = consumer;
	return obj;
};
oFF.UiLambdaItemSelectListener.prototype.m_consumer = null;
oFF.UiLambdaItemSelectListener.prototype.onItemSelect = function(event)
{
	this.m_consumer(event);
};
oFF.UiLambdaItemSelectListener.prototype.releaseObject = function()
{
	this.m_consumer = null;
	oFF.XObject.prototype.releaseObject.call( this );
};

oFF.UiLambdaLiveChangeListener = function() {};
oFF.UiLambdaLiveChangeListener.prototype = new oFF.XObject();
oFF.UiLambdaLiveChangeListener.prototype._ff_c = "UiLambdaLiveChangeListener";

oFF.UiLambdaLiveChangeListener.create = function(consumer)
{
	var obj = new oFF.UiLambdaLiveChangeListener();
	obj.m_consumer = consumer;
	return obj;
};
oFF.UiLambdaLiveChangeListener.prototype.m_consumer = null;
oFF.UiLambdaLiveChangeListener.prototype.onLiveChange = function(event)
{
	this.m_consumer(event);
};
oFF.UiLambdaLiveChangeListener.prototype.releaseObject = function()
{
	this.m_consumer = null;
	oFF.XObject.prototype.releaseObject.call( this );
};

oFF.UiLambdaLiveChangeWithDebounceListener = function() {};
oFF.UiLambdaLiveChangeWithDebounceListener.prototype = new oFF.XObject();
oFF.UiLambdaLiveChangeWithDebounceListener.prototype._ff_c = "UiLambdaLiveChangeWithDebounceListener";

oFF.UiLambdaLiveChangeWithDebounceListener.create = function(consumer, debounce)
{
	var obj = new oFF.UiLambdaLiveChangeWithDebounceListener();
	obj.m_consumer = consumer;
	obj.m_debounce = debounce;
	return obj;
};
oFF.UiLambdaLiveChangeWithDebounceListener.prototype.m_consumer = null;
oFF.UiLambdaLiveChangeWithDebounceListener.prototype.m_debounce = 0;
oFF.UiLambdaLiveChangeWithDebounceListener.prototype.m_runningTimeoutId = null;
oFF.UiLambdaLiveChangeWithDebounceListener.prototype.onLiveChange = function(event)
{
	if (oFF.XStringUtils.isNotNullAndNotEmpty(this.m_runningTimeoutId))
	{
		oFF.XTimeout.clear(this.m_runningTimeoutId);
	}
	this.m_runningTimeoutId = oFF.XTimeout.timeout(this.m_debounce,  function(){
		this.m_consumer(event);
		oFF.XTimeout.clear(this.m_runningTimeoutId);
	}.bind(this));
};
oFF.UiLambdaLiveChangeWithDebounceListener.prototype.releaseObject = function()
{
	this.m_consumer = null;
	this.m_runningTimeoutId = null;
	oFF.XObject.prototype.releaseObject.call( this );
};

oFF.UiLambdaLoadFinishedListener = function() {};
oFF.UiLambdaLoadFinishedListener.prototype = new oFF.XObject();
oFF.UiLambdaLoadFinishedListener.prototype._ff_c = "UiLambdaLoadFinishedListener";

oFF.UiLambdaLoadFinishedListener.create = function(consumer)
{
	var obj = new oFF.UiLambdaLoadFinishedListener();
	obj.m_consumer = consumer;
	return obj;
};
oFF.UiLambdaLoadFinishedListener.prototype.m_consumer = null;
oFF.UiLambdaLoadFinishedListener.prototype.onLoadFinished = function(event)
{
	this.m_consumer(event);
};
oFF.UiLambdaLoadFinishedListener.prototype.releaseObject = function()
{
	this.m_consumer = null;
	oFF.XObject.prototype.releaseObject.call( this );
};

oFF.UiLambdaMenuPressListener = function() {};
oFF.UiLambdaMenuPressListener.prototype = new oFF.XObject();
oFF.UiLambdaMenuPressListener.prototype._ff_c = "UiLambdaMenuPressListener";

oFF.UiLambdaMenuPressListener.create = function(consumer)
{
	var obj = new oFF.UiLambdaMenuPressListener();
	obj.m_consumer = consumer;
	return obj;
};
oFF.UiLambdaMenuPressListener.prototype.m_consumer = null;
oFF.UiLambdaMenuPressListener.prototype.onMenuPress = function(event)
{
	this.m_consumer(event);
};
oFF.UiLambdaMenuPressListener.prototype.releaseObject = function()
{
	this.m_consumer = null;
	oFF.XObject.prototype.releaseObject.call( this );
};

oFF.UiLambdaPressListener = function() {};
oFF.UiLambdaPressListener.prototype = new oFF.XObject();
oFF.UiLambdaPressListener.prototype._ff_c = "UiLambdaPressListener";

oFF.UiLambdaPressListener.create = function(consumer)
{
	var obj = new oFF.UiLambdaPressListener();
	obj.m_consumer = consumer;
	return obj;
};
oFF.UiLambdaPressListener.prototype.m_consumer = null;
oFF.UiLambdaPressListener.prototype.onPress = function(event)
{
	this.m_consumer(event);
};
oFF.UiLambdaPressListener.prototype.releaseObject = function()
{
	this.m_consumer = null;
	oFF.XObject.prototype.releaseObject.call( this );
};

oFF.UiLambdaResizeListener = function() {};
oFF.UiLambdaResizeListener.prototype = new oFF.XObject();
oFF.UiLambdaResizeListener.prototype._ff_c = "UiLambdaResizeListener";

oFF.UiLambdaResizeListener.create = function(consumer)
{
	var obj = new oFF.UiLambdaResizeListener();
	obj.m_consumer = consumer;
	return obj;
};
oFF.UiLambdaResizeListener.prototype.m_consumer = null;
oFF.UiLambdaResizeListener.prototype.onResize = function(event)
{
	this.m_consumer(event);
};
oFF.UiLambdaResizeListener.prototype.releaseObject = function()
{
	this.m_consumer = null;
	oFF.XObject.prototype.releaseObject.call( this );
};

oFF.UiLambdaSearchListener = function() {};
oFF.UiLambdaSearchListener.prototype = new oFF.XObject();
oFF.UiLambdaSearchListener.prototype._ff_c = "UiLambdaSearchListener";

oFF.UiLambdaSearchListener.create = function(consumer)
{
	var obj = new oFF.UiLambdaSearchListener();
	obj.m_consumer = consumer;
	return obj;
};
oFF.UiLambdaSearchListener.prototype.m_consumer = null;
oFF.UiLambdaSearchListener.prototype.onSearch = function(event)
{
	this.m_consumer(event);
};
oFF.UiLambdaSearchListener.prototype.releaseObject = function()
{
	this.m_consumer = null;
	oFF.XObject.prototype.releaseObject.call( this );
};

oFF.UiLambdaSelectListener = function() {};
oFF.UiLambdaSelectListener.prototype = new oFF.XObject();
oFF.UiLambdaSelectListener.prototype._ff_c = "UiLambdaSelectListener";

oFF.UiLambdaSelectListener.create = function(consumer)
{
	var obj = new oFF.UiLambdaSelectListener();
	obj.m_consumer = consumer;
	return obj;
};
oFF.UiLambdaSelectListener.prototype.m_consumer = null;
oFF.UiLambdaSelectListener.prototype.onSelect = function(event)
{
	this.m_consumer(event);
};
oFF.UiLambdaSelectListener.prototype.releaseObject = function()
{
	this.m_consumer = null;
	oFF.XObject.prototype.releaseObject.call( this );
};

oFF.UiLambdaSelectionChangeListener = function() {};
oFF.UiLambdaSelectionChangeListener.prototype = new oFF.XObject();
oFF.UiLambdaSelectionChangeListener.prototype._ff_c = "UiLambdaSelectionChangeListener";

oFF.UiLambdaSelectionChangeListener.create = function(consumer)
{
	var obj = new oFF.UiLambdaSelectionChangeListener();
	obj.m_consumer = consumer;
	return obj;
};
oFF.UiLambdaSelectionChangeListener.prototype.m_consumer = null;
oFF.UiLambdaSelectionChangeListener.prototype.onSelectionChange = function(event)
{
	this.m_consumer(event);
};
oFF.UiLambdaSelectionChangeListener.prototype.releaseObject = function()
{
	this.m_consumer = null;
	oFF.XObject.prototype.releaseObject.call( this );
};

oFF.UiLambdaValueHelpRequestListener = function() {};
oFF.UiLambdaValueHelpRequestListener.prototype = new oFF.XObject();
oFF.UiLambdaValueHelpRequestListener.prototype._ff_c = "UiLambdaValueHelpRequestListener";

oFF.UiLambdaValueHelpRequestListener.create = function(consumer)
{
	var obj = new oFF.UiLambdaValueHelpRequestListener();
	obj.m_consumer = consumer;
	return obj;
};
oFF.UiLambdaValueHelpRequestListener.prototype.m_consumer = null;
oFF.UiLambdaValueHelpRequestListener.prototype.onValueHelpRequest = function(event)
{
	this.m_consumer(event);
};
oFF.UiLambdaValueHelpRequestListener.prototype.releaseObject = function()
{
	this.m_consumer = null;
	oFF.XObject.prototype.releaseObject.call( this );
};

oFF.UiPanelList = function() {};
oFF.UiPanelList.prototype = new oFF.DfUiSimpleView();
oFF.UiPanelList.prototype._ff_c = "UiPanelList";

oFF.UiPanelList.create = function(genesis)
{
	var obj = new oFF.UiPanelList();
	obj.initView(genesis);
	return obj;
};
oFF.UiPanelList.prototype.m_root = null;
oFF.UiPanelList.prototype.m_list = null;
oFF.UiPanelList.prototype.m_headerLayout = null;
oFF.UiPanelList.prototype.setupView = function() {};
oFF.UiPanelList.prototype.releaseObject = function()
{
	this.m_list = null;
	this.m_headerLayout = null;
	this.m_root = oFF.XObjectExt.release(this.m_root);
	oFF.DfUiSimpleView.prototype.releaseObject.call( this );
};
oFF.UiPanelList.prototype.buildViewUi = function(genesis)
{
	this.m_root = genesis.newControl(oFF.UiType.PANEL);
	this.m_root.setBackgroundDesign(oFF.UiBackgroundDesign.TRANSPARENT);
	this.m_headerLayout = this.m_root.setNewHeader(oFF.UiType.FLEX_LAYOUT);
	this.m_headerLayout.useMaxWidth();
	this.m_headerLayout.setDirection(oFF.UiFlexDirection.ROW);
	this.m_headerLayout.setOverflow(oFF.UiOverflow.HIDDEN);
	this.m_headerLayout.setAlignItems(oFF.UiFlexAlignItems.CENTER);
};
oFF.UiPanelList.prototype.getView = function()
{
	return this.m_root;
};
oFF.UiPanelList.prototype.getList = function()
{
	return this.m_list;
};
oFF.UiPanelList.prototype.activateList = function()
{
	if (oFF.isNull(this.m_list))
	{
		this.m_root.setExpandable(true);
		this.m_list = this.m_root.setNewContent(oFF.UiType.LIST);
	}
	return this.m_list;
};
oFF.UiPanelList.prototype.getHeaderLayout = function()
{
	return this.m_headerLayout;
};
oFF.UiPanelList.prototype.addNewPanelListItem = function()
{
	var listItem = this.getGenesis().newControl(oFF.UiType.CUSTOM_LIST_ITEM);
	var panelList = oFF.UiPanelList.create(this.getGenesis());
	listItem.setContent(panelList.getView());
	this.activateList().addItem(listItem);
	return panelList;
};

oFF.UiSearchableListView = function() {};
oFF.UiSearchableListView.prototype = new oFF.DfUiSimpleView();
oFF.UiSearchableListView.prototype._ff_c = "UiSearchableListView";

oFF.UiSearchableListView.create = function(genesis, initialListItems)
{
	var newSearchableList = new oFF.UiSearchableListView();
	newSearchableList.setupInternal(genesis, initialListItems);
	return newSearchableList;
};
oFF.UiSearchableListView.prototype.m_wrapperLayout = null;
oFF.UiSearchableListView.prototype.m_list = null;
oFF.UiSearchableListView.prototype.m_searchInput = null;
oFF.UiSearchableListView.prototype.m_allListItems = null;
oFF.UiSearchableListView.prototype.m_listChangedConsumer = null;
oFF.UiSearchableListView.prototype.m_listItemSelectedConsumer = null;
oFF.UiSearchableListView.prototype.releaseObject = function()
{
	this.m_list = oFF.XObjectExt.release(this.m_list);
	this.m_searchInput = oFF.XObjectExt.release(this.m_searchInput);
	this.m_allListItems = oFF.XObjectExt.release(this.m_allListItems);
	this.m_wrapperLayout = oFF.XObjectExt.release(this.m_wrapperLayout);
	this.m_listChangedConsumer = null;
	this.m_listItemSelectedConsumer = null;
	oFF.DfUiSimpleView.prototype.releaseObject.call( this );
};
oFF.UiSearchableListView.prototype.getView = function()
{
	return this.m_wrapperLayout;
};
oFF.UiSearchableListView.prototype.setupInternal = function(genesis, initialListItems)
{
	oFF.DfUiSimpleView.prototype.initView.call( this , genesis);
	this.fillList(initialListItems);
};
oFF.UiSearchableListView.prototype.setupView = function()
{
	this.m_allListItems = oFF.XList.create();
};
oFF.UiSearchableListView.prototype.buildViewUi = function(genesis)
{
	this.m_wrapperLayout = genesis.newControl(oFF.UiType.FLEX_LAYOUT);
	this.m_wrapperLayout.setDirection(oFF.UiFlexDirection.COLUMN);
	this.m_wrapperLayout.setHeight(oFF.UiCssLength.create("100%"));
	this.m_wrapperLayout.setWidth(oFF.UiCssLength.create("300px"));
	this.m_wrapperLayout.setFlex("0 1 300px ");
	this.m_searchInput = this.m_wrapperLayout.addNewItemOfType(oFF.UiType.SEARCH_FIELD);
	this.m_searchInput.setPlaceholder("Search...");
	this.m_searchInput.setPadding(oFF.UiCssBoxEdges.create("5px"));
	this.m_searchInput.setHeight(oFF.UiCssLength.create("36px"));
	this.m_searchInput.setFlex("0 0 36px");
	this.m_searchInput.registerOnSearch(oFF.UiLambdaSearchListener.create( function(controlEvent){
		this.handleSearch(controlEvent);
	}.bind(this)));
	this.m_searchInput.registerOnLiveChange(oFF.UiLambdaLiveChangeWithDebounceListener.create( function(controlEven2){
		this.filterList(this.m_searchInput.getText(), false);
	}.bind(this), 1000));
	this.m_searchInput.setBorderWidth(oFF.UiCssBoxEdges.create("0px 0px 1px 0px"));
	this.m_searchInput.setBorderColor(oFF.UiColor.GREY);
	this.m_searchInput.setBorderStyle(oFF.UiBorderStyle.SOLID);
	var listScrollContainer = this.m_wrapperLayout.addNewItemOfType(oFF.UiType.SCROLL_CONTAINER);
	listScrollContainer.useMaxWidth();
	this.m_list = listScrollContainer.setNewContent(oFF.UiType.LIST);
	this.m_list.useMaxSpace();
	this.m_list.registerOnSelect(oFF.UiLambdaSelectListener.create( function(selectEvent){
		this.handleSelect(selectEvent);
	}.bind(this)));
	this.m_list.setSelectionMode(oFF.UiSelectionMode.SINGLE_SELECT_MASTER);
};
oFF.UiSearchableListView.prototype.setListItems = function(listItems)
{
	this.fillList(listItems);
};
oFF.UiSearchableListView.prototype.getListItems = function()
{
	var tmpList = oFF.XList.create();
	oFF.XCollectionUtils.forEach(this.m_list.getItems(),  function(tmpItem){
		tmpList.add(tmpItem);
	}.bind(this));
	return tmpList;
};
oFF.UiSearchableListView.prototype.selectItem = function(listItem)
{
	if (oFF.notNull(this.m_list) && this.m_list.hasItems())
	{
		this.m_list.clearSelectedItems();
		var indexToSelect = this.m_list.getIndexOfItem(listItem);
		if (indexToSelect !== -1)
		{
			this.m_list.setSelectedItem(listItem);
		}
	}
};
oFF.UiSearchableListView.prototype.setSearchFieldPlaceholder = function(placeholder)
{
	if (oFF.notNull(this.m_searchInput))
	{
		this.m_searchInput.setPlaceholder(placeholder);
	}
};
oFF.UiSearchableListView.prototype.selectItemByName = function(itemName)
{
	if (oFF.notNull(this.m_list) && this.m_list.hasItems())
	{
		var listItem = this.m_list.getItemByName(itemName);
		this.selectItem(listItem);
	}
};
oFF.UiSearchableListView.prototype.scrollToItem = function(listItem)
{
	if (oFF.notNull(this.m_list) && this.m_list.hasItems())
	{
		var indexToSelect = this.m_list.getIndexOfItem(listItem);
		if (indexToSelect !== -1)
		{
			this.m_list.scrollToIndex(indexToSelect);
		}
	}
};
oFF.UiSearchableListView.prototype.scrollToItemByName = function(itemName)
{
	if (oFF.notNull(this.m_list) && this.m_list.hasItems())
	{
		var listItem = this.m_list.getItemByName(itemName);
		this.scrollToItem(listItem);
	}
};
oFF.UiSearchableListView.prototype.setListChangdConsumer = function(consumer)
{
	this.m_listChangedConsumer = consumer;
};
oFF.UiSearchableListView.prototype.setListItemSelectedConsumer = function(consumer)
{
	this.m_listItemSelectedConsumer = consumer;
};
oFF.UiSearchableListView.prototype.setListSelectionMode = function(mode)
{
	this.m_list.setSelectionMode(mode);
};
oFF.UiSearchableListView.prototype.fillList = function(listItems)
{
	if (oFF.notNull(this.m_list))
	{
		this.m_list.clearItems();
		this.m_searchInput.setText("");
		this.m_allListItems.clear();
		if (oFF.notNull(listItems) && listItems.hasElements())
		{
			oFF.XCollectionUtils.forEach(listItems,  function(listItem){
				this.m_list.addItem(listItem);
				this.m_allListItems.add(listItem);
			}.bind(this));
		}
	}
};
oFF.UiSearchableListView.prototype.filterList = function(searchText, clearButtonPressed)
{
	this.m_list.clearItems();
	if (clearButtonPressed === false)
	{
		for (var a = 0; a < this.m_allListItems.size(); a++)
		{
			var tmpListItem = this.m_allListItems.get(a);
			if (oFF.XString.containsString(oFF.XString.toLowerCase(tmpListItem.getText()), oFF.XString.toLowerCase(searchText)))
			{
				this.m_list.addItem(tmpListItem);
			}
		}
	}
	else
	{
		oFF.XCollectionUtils.forEach(this.m_allListItems,  function(listItem){
			this.m_list.addItem(listItem);
		}.bind(this));
	}
	if (oFF.notNull(this.m_listChangedConsumer))
	{
		this.m_listChangedConsumer(this.m_allListItems);
	}
};
oFF.UiSearchableListView.prototype.handleSearch = function(controlEvent)
{
	if (oFF.notNull(controlEvent))
	{
		var didPressClearButton = controlEvent.getParameters().getBooleanByKeyExt(oFF.UiControlEvent.PARAM_CLEAR_BUTTON_PRESSED, false);
		var searchText = controlEvent.getParameters().getStringByKeyExt(oFF.UiControlEvent.PARAM_SEARCH_TEXT, "");
		this.filterList(searchText, didPressClearButton);
	}
};
oFF.UiSearchableListView.prototype.handleSelect = function(event)
{
	if (oFF.notNull(event))
	{
		var selectedListItem = event.getSelectedItem();
		this.selectItem(selectedListItem);
		if (oFF.notNull(selectedListItem) && oFF.notNull(this.m_listItemSelectedConsumer))
		{
			this.m_listItemSelectedConsumer(selectedListItem);
		}
	}
};

oFF.UiTextFilterWidget = function() {};
oFF.UiTextFilterWidget.prototype = new oFF.DfUiSimpleView();
oFF.UiTextFilterWidget.prototype._ff_c = "UiTextFilterWidget";

oFF.UiTextFilterWidget.create = function(genesis, listToFilter)
{
	var newWidget = new oFF.UiTextFilterWidget();
	newWidget.setupInternal(genesis, listToFilter);
	return newWidget;
};
oFF.UiTextFilterWidget.prototype.m_listToFilter = null;
oFF.UiTextFilterWidget.prototype.m_textFunction = null;
oFF.UiTextFilterWidget.prototype.m_filterChangedConsumer = null;
oFF.UiTextFilterWidget.prototype.m_searchInput = null;
oFF.UiTextFilterWidget.prototype.m_filteredList = null;
oFF.UiTextFilterWidget.prototype.releaseObject = function()
{
	this.m_searchInput = oFF.XObjectExt.release(this.m_searchInput);
	this.m_filteredList = oFF.XObjectExt.release(this.m_filteredList);
	this.m_listToFilter = null;
	this.m_textFunction = null;
	this.m_filterChangedConsumer = null;
	oFF.DfUiSimpleView.prototype.releaseObject.call( this );
};
oFF.UiTextFilterWidget.prototype.getView = function()
{
	return this.m_searchInput;
};
oFF.UiTextFilterWidget.prototype.setupInternal = function(genesis, listToFilter)
{
	this.m_listToFilter = listToFilter;
	this.initView(genesis);
};
oFF.UiTextFilterWidget.prototype.setupView = function()
{
	this.m_filteredList = oFF.XList.create();
	this.reinitFilteredList();
};
oFF.UiTextFilterWidget.prototype.buildViewUi = function(genesis)
{
	this.m_searchInput = genesis.newControl(oFF.UiType.SEARCH_FIELD);
	this.m_searchInput.setPlaceholder("Search...");
	this.m_searchInput.registerOnSearch(oFF.UiLambdaSearchListener.create( function(controlEvent){
		this.handleSearch(controlEvent);
	}.bind(this)));
	this.m_searchInput.registerOnLiveChange(oFF.UiLambdaLiveChangeListener.create( function(controlEven2){
		this.filterItems(this.m_searchInput.getText(), false);
	}.bind(this)));
	this.m_searchInput.setDebounceTime(1000);
};
oFF.UiTextFilterWidget.prototype.setFilterList = function(listToFilter)
{
	this.m_listToFilter = listToFilter;
	this.reinitFilteredList();
};
oFF.UiTextFilterWidget.prototype.getFilteredList = function()
{
	return this.m_filteredList;
};
oFF.UiTextFilterWidget.prototype.setPlaceholder = function(placeholder)
{
	this.m_searchInput.setPlaceholder(placeholder);
};
oFF.UiTextFilterWidget.prototype.setTextFunction = function(_function)
{
	this.m_textFunction = _function;
};
oFF.UiTextFilterWidget.prototype.setFilterChangedConsumer = function(consumer)
{
	this.m_filterChangedConsumer = consumer;
};
oFF.UiTextFilterWidget.prototype.reinitFilteredList = function()
{
	this.m_filteredList.clear();
	oFF.XCollectionUtils.forEach(this.m_listToFilter,  function(listItem){
		this.m_filteredList.add(listItem);
	}.bind(this));
};
oFF.UiTextFilterWidget.prototype.filterItems = function(searchText, clearButtonPressed)
{
	if (oFF.notNull(this.m_listToFilter) && this.m_listToFilter.hasElements())
	{
		this.m_filteredList.clear();
		if (clearButtonPressed === false)
		{
			for (var a = 0; a < this.m_listToFilter.size(); a++)
			{
				var tmpListItem = this.m_listToFilter.get(a);
				if (this.testItem(searchText, tmpListItem))
				{
					this.m_filteredList.add(tmpListItem);
				}
			}
		}
		else
		{
			oFF.XCollectionUtils.forEach(this.m_listToFilter,  function(listItem){
				this.m_filteredList.add(listItem);
			}.bind(this));
		}
		if (oFF.notNull(this.m_filterChangedConsumer))
		{
			this.m_filterChangedConsumer(this.m_filteredList);
		}
	}
};
oFF.UiTextFilterWidget.prototype.testItem = function(searchText, item)
{
	if (oFF.notNull(this.m_textFunction))
	{
		var itemText = this.m_textFunction(item);
		return oFF.XString.containsString(oFF.XString.toLowerCase(itemText), oFF.XString.toLowerCase(searchText));
	}
	return true;
};
oFF.UiTextFilterWidget.prototype.handleSearch = function(controlEvent)
{
	if (oFF.notNull(controlEvent))
	{
		var didPressClearButton = controlEvent.getParameters().getBooleanByKeyExt(oFF.UiControlEvent.PARAM_CLEAR_BUTTON_PRESSED, false);
		var searchText = controlEvent.getParameters().getStringByKeyExt(oFF.UiControlEvent.PARAM_SEARCH_TEXT, "");
		this.filterItems(searchText, didPressClearButton);
	}
};

oFF.DfUtToolbarWidgetItem = function() {};
oFF.DfUtToolbarWidgetItem.prototype = new oFF.XObject();
oFF.DfUtToolbarWidgetItem.prototype._ff_c = "DfUtToolbarWidgetItem";

oFF.DfUtToolbarWidgetItem.prototype.setOverflowPriority = function(overflowPriority)
{
	var layoutData = oFF.UiOverflowToolbarLayoutData.create();
	layoutData.setPriority(overflowPriority);
	this.getView().setLayoutData(layoutData);
};
oFF.DfUtToolbarWidgetItem.prototype.setName = function(name)
{
	return this.getView().setName(name);
};
oFF.DfUtToolbarWidgetItem.prototype.getName = function()
{
	return this.getView().getName();
};
oFF.DfUtToolbarWidgetItem.prototype.setEnabled = function(enabled)
{
	return this.getView().setEnabled(enabled);
};
oFF.DfUtToolbarWidgetItem.prototype.isEnabled = function()
{
	return this.getView().isEnabled();
};

oFF.UtToolbarWidgetFixedSection = function() {};
oFF.UtToolbarWidgetFixedSection.prototype = new oFF.DfUiSimpleView();
oFF.UtToolbarWidgetFixedSection.prototype._ff_c = "UtToolbarWidgetFixedSection";

oFF.UtToolbarWidgetFixedSection.create = function(genesis)
{
	var section = new oFF.UtToolbarWidgetFixedSection();
	section.setupInternal(genesis);
	return section;
};
oFF.UtToolbarWidgetFixedSection.prototype.m_layout = null;
oFF.UtToolbarWidgetFixedSection.prototype.releaseObject = function()
{
	this.m_layout = oFF.XObjectExt.release(this.m_layout);
	oFF.DfUiSimpleView.prototype.releaseObject.call( this );
};
oFF.UtToolbarWidgetFixedSection.prototype.getView = function()
{
	return this.m_layout;
};
oFF.UtToolbarWidgetFixedSection.prototype.setupInternal = function(genesis)
{
	this.initView(genesis);
};
oFF.UtToolbarWidgetFixedSection.prototype.setupView = function()
{
	this.m_layout = this.getGenesis().newControl(oFF.UiType.FLEX_LAYOUT);
};
oFF.UtToolbarWidgetFixedSection.prototype.buildViewUi = function(genesis)
{
	this.clearItems();
	this.m_layout.setJustifyContent(oFF.UiFlexJustifyContent.END);
	this.m_layout.setAlignItems(oFF.UiFlexAlignItems.CENTER);
	this.m_layout.addCssClass("sapMTBStandard");
	this.m_layout.setBackgroundDesign(oFF.UiBackgroundDesign.TRANSPARENT);
	this.m_layout.setPadding(oFF.UiCssBoxEdges.create("0 1rem 0 0"));
	this.m_layout.setHeight(oFF.UiCssLength.create("2.5rem"));
	this.m_layout.setOverflow(oFF.UiOverflow.VISIBLE);
};
oFF.UtToolbarWidgetFixedSection.prototype.newButton = function(text, tooltip, icon)
{
	var button = this.getGenesis().newControl(oFF.UiType.BUTTON).setButtonType(oFF.UiButtonType.TRANSPARENT).setText(text).setTooltip(tooltip).setIcon(icon);
	return button;
};
oFF.UtToolbarWidgetFixedSection.prototype.addNewButton = function(text, tooltip, icon)
{
	var button = this.newButton(text, tooltip, icon);
	this.addControl(button);
	return button;
};
oFF.UtToolbarWidgetFixedSection.prototype.newToggleButton = function(text, tooltip, icon)
{
	var toggleButton = this.getGenesis().newControl(oFF.UiType.TOGGLE_BUTTON).setText(text).setTooltip(tooltip).setIcon(icon);
	oFF.UiStylingHelper.getActiveProvider().applyMarginSmallBegin(toggleButton);
	return toggleButton;
};
oFF.UtToolbarWidgetFixedSection.prototype.addNewToggleButton = function(text, tooltip, icon)
{
	var toggleButton = this.newToggleButton(text, tooltip, icon);
	this.addControl(toggleButton);
	return toggleButton;
};
oFF.UtToolbarWidgetFixedSection.prototype.addControl = function(control)
{
	this.m_layout.addItem(control);
	return control;
};
oFF.UtToolbarWidgetFixedSection.prototype.removeItem = function(item)
{
	return this.m_layout.removeItem(item);
};
oFF.UtToolbarWidgetFixedSection.prototype.clearItems = function()
{
	this.m_layout.clearItems();
};

oFF.UtToolbarWidgetSection = function() {};
oFF.UtToolbarWidgetSection.prototype = new oFF.DfUiSimpleView();
oFF.UtToolbarWidgetSection.prototype._ff_c = "UtToolbarWidgetSection";

oFF.UtToolbarWidgetSection.create = function(genesis)
{
	var section = new oFF.UtToolbarWidgetSection();
	section.setupInternal(genesis);
	return section;
};
oFF.UtToolbarWidgetSection.prototype.m_groups = null;
oFF.UtToolbarWidgetSection.prototype.m_toolbar = null;
oFF.UtToolbarWidgetSection.prototype.releaseObject = function()
{
	this.m_groups = oFF.XObjectExt.release(this.m_groups);
	this.m_toolbar = oFF.XObjectExt.release(this.m_toolbar);
	oFF.DfUiSimpleView.prototype.releaseObject.call( this );
};
oFF.UtToolbarWidgetSection.prototype.getView = function()
{
	return this.m_toolbar;
};
oFF.UtToolbarWidgetSection.prototype.setupInternal = function(genesis)
{
	this.initView(genesis);
};
oFF.UtToolbarWidgetSection.prototype.setupView = function()
{
	this.m_groups = oFF.XList.create();
	this.m_toolbar = this.getGenesis().newControl(oFF.UiType.OVERFLOW_TOOLBAR);
};
oFF.UtToolbarWidgetSection.prototype.buildViewUi = function(genesis)
{
	this.clearItems();
	this.m_toolbar.setWidth(oFF.UiCssLength.create("100%"));
	this.m_toolbar.setHeight(oFF.UiCssLength.create("2.5rem"));
};
oFF.UtToolbarWidgetSection.prototype.newGroup = function()
{
	var group = oFF.UtToolbarWidgetSectionGroup.create(this.getGenesis(), this);
	return group;
};
oFF.UtToolbarWidgetSection.prototype.addNewGroup = function()
{
	var group = this.newGroup();
	this.addGroup(group);
	return group;
};
oFF.UtToolbarWidgetSection.prototype.addGroup = function(group)
{
	this.m_groups.add(group);
	this.rebuild();
	return group;
};
oFF.UtToolbarWidgetSection.prototype.getGroupCount = function()
{
	return this.m_groups.size();
};
oFF.UtToolbarWidgetSection.prototype.getGroups = function()
{
	return this.m_groups;
};
oFF.UtToolbarWidgetSection.prototype.removeGroup = function(group)
{
	var removedGroup = this.m_groups.removeElement(group);
	this.rebuild();
	return removedGroup;
};
oFF.UtToolbarWidgetSection.prototype.clearItems = function()
{
	this.m_toolbar.clearItems();
	this.m_groups.clear();
};
oFF.UtToolbarWidgetSection.prototype.rebuild = function()
{
	this.m_toolbar.clearItems();
	for (var i = 0; i < this.m_groups.size(); i++)
	{
		var group = this.m_groups.get(i);
		var groupItems = group.getItems();
		for (var j = 0; j < groupItems.size(); j++)
		{
			this.m_toolbar.addItem(groupItems.get(j).getView());
		}
		this.m_toolbar.addItem(this.createNewSeparator());
	}
};
oFF.UtToolbarWidgetSection.prototype.createNewSeparator = function()
{
	var layoutData = oFF.UiOverflowToolbarLayoutData.create();
	return this.getGenesis().newControl(oFF.UiType.SEPARATOR).setLayoutData(layoutData);
};

oFF.UiCommonI18n = function() {};
oFF.UiCommonI18n.prototype = new oFF.DfUiLocalizationProvider();
oFF.UiCommonI18n.prototype._ff_c = "UiCommonI18n";

oFF.UiCommonI18n.OK = "FF_COMMON_OK";
oFF.UiCommonI18n.APPLY = "FF_COMMON_APPLY";
oFF.UiCommonI18n.SAVE = "FF_COMMON_SAVE";
oFF.UiCommonI18n.CANCEL = "FF_COMMON_CANCEL";
oFF.UiCommonI18n.CLOSE = "FF_COMMON_CLOSE";
oFF.UiCommonI18n.WARNING = "FF_COMMON_WARNING";
oFF.UiCommonI18n.ERROR = "FF_COMMON_ERROR";
oFF.UiCommonI18n.OVERWRITE = "FF_COMMON_OVERWRITE";
oFF.UiCommonI18n.staticSetup = function()
{
	var tmpProvider = new oFF.UiCommonI18n();
	tmpProvider.setupProvider("CommonProvider", false);
	tmpProvider.addText(oFF.UiCommonI18n.OK, "OK");
	tmpProvider.addComment(oFF.UiCommonI18n.OK, "#XBUT: Confirmation button in a dialog");
	tmpProvider.addText(oFF.UiCommonI18n.APPLY, "Apply");
	tmpProvider.addComment(oFF.UiCommonI18n.APPLY, "#XBUT: Apply button in a dialog");
	tmpProvider.addText(oFF.UiCommonI18n.SAVE, "Save");
	tmpProvider.addComment(oFF.UiCommonI18n.SAVE, "#XBUT: Save button in a dialog");
	tmpProvider.addText(oFF.UiCommonI18n.CANCEL, "Cancel");
	tmpProvider.addComment(oFF.UiCommonI18n.CANCEL, "#XBUT: Cancel button in a dialog");
	tmpProvider.addText(oFF.UiCommonI18n.CLOSE, "Close");
	tmpProvider.addComment(oFF.UiCommonI18n.CLOSE, "#XBUT: Close button in a dialog");
	tmpProvider.addText(oFF.UiCommonI18n.WARNING, "Warning");
	tmpProvider.addComment(oFF.UiCommonI18n.WARNING, "#XTIT: the title of a dialog showing a warning");
	tmpProvider.addText(oFF.UiCommonI18n.ERROR, "Error");
	tmpProvider.addComment(oFF.UiCommonI18n.ERROR, "#XTIT: the title of a dialog showing an error");
	tmpProvider.addText(oFF.UiCommonI18n.OVERWRITE, "Overwrite");
	tmpProvider.addComment(oFF.UiCommonI18n.OVERWRITE, "#XBUT: Button on a dialog to overwrite a setting");
	return tmpProvider;
};

oFF.DfUiFormItemHorizontal = function() {};
oFF.DfUiFormItemHorizontal.prototype = new oFF.DfUiFormItem();
oFF.DfUiFormItemHorizontal.prototype._ff_c = "DfUiFormItemHorizontal";

oFF.DfUiFormItemHorizontal.prototype.layoutFormItem = function()
{
	var wrapperLayout = this.getFormControl();
	wrapperLayout.setDirection(oFF.UiFlexDirection.ROW);
	wrapperLayout.setAlignItems(oFF.UiFlexAlignItems.CENTER);
	wrapperLayout.addItem(this.getFormItemControl());
	wrapperLayout.addItem(this.getFormLabel().getFormControl());
};

oFF.DfUiFormItemVertical = function() {};
oFF.DfUiFormItemVertical.prototype = new oFF.DfUiFormItem();
oFF.DfUiFormItemVertical.prototype._ff_c = "DfUiFormItemVertical";

oFF.DfUiFormItemVertical.prototype.layoutFormItem = function()
{
	var wrapperLayout = this.getFormControl();
	wrapperLayout.setDirection(oFF.UiFlexDirection.COLUMN);
	var formItemLbl = this.getFormLabel().getFormControl();
	formItemLbl.setMargin(oFF.UiCssBoxEdges.create("0px 0px 3px 0px"));
	wrapperLayout.addItem(this.getFormLabel().getFormControl());
	wrapperLayout.addItem(this.getFormItemControl());
};
oFF.DfUiFormItemVertical.prototype.getFormattedText = function()
{
	var formattedText = this.getText();
	if (oFF.XStringUtils.isNotNullAndNotEmpty(formattedText))
	{
		formattedText = !oFF.XString.endsWith(formattedText, ":") && !oFF.XString.endsWith(formattedText, "?") ? oFF.XStringUtils.concatenate2(formattedText, ":") : formattedText;
	}
	return formattedText;
};

oFF.UiFormSection = function() {};
oFF.UiFormSection.prototype = new oFF.DfUiFormItem();
oFF.UiFormSection.prototype._ff_c = "UiFormSection";

oFF.UiFormSection.FORM_SECTION_ERROR_WRAPPER_TAG = "ffFormSectionErrorWrapper";
oFF.UiFormSection.FORM_SECTION_ERROR_LABEL_TAG = "ffFormSectionErrorLabel";
oFF.UiFormSection.create = function(genesis, key, text, isHorizontal)
{
	var newFormItem = new oFF.UiFormSection();
	newFormItem.setupInternal(genesis, key, text, isHorizontal);
	return newFormItem;
};
oFF.UiFormSection.prototype.m_internalForm = null;
oFF.UiFormSection.prototype.m_errorWrapper = null;
oFF.UiFormSection.prototype.m_errorLbl = null;
oFF.UiFormSection.prototype.m_alwaysShowSectionMarker = false;
oFF.UiFormSection.prototype.m_showSectionMarkerDuringValidation = false;
oFF.UiFormSection.prototype.m_sectionBlurTimeoutId = null;
oFF.UiFormSection.prototype.releaseObject = function()
{
	this.m_errorLbl = oFF.XObjectExt.release(this.m_errorLbl);
	this.m_errorWrapper = oFF.XObjectExt.release(this.m_errorWrapper);
	this.m_internalForm = oFF.XObjectExt.release(this.m_internalForm);
	oFF.XTimeout.clear(this.m_sectionBlurTimeoutId);
	oFF.DfUiFormItem.prototype.releaseObject.call( this );
};
oFF.UiFormSection.prototype.setupInternal = function(genesis, key, text, isHorizontal)
{
	this.m_alwaysShowSectionMarker = false;
	this.m_showSectionMarkerDuringValidation = true;
	var newForm = oFF.UiForm.create(genesis);
	this.m_internalForm = newForm;
	this.m_internalForm.setHorizontal(isHorizontal);
	this.m_internalForm.setInternalItemBlurConsumer( function(bluredItem){
		this.onSectionItemBlured();
	}.bind(this));
	this.m_internalForm.setItemEnterPressedConsumer( function(tmpItem){
		this.handleItemEnterPressed();
	}.bind(this));
	this.m_internalForm.setModelChangedConsumer( function(formModel){
		this.handleItemValueChanged();
	}.bind(this));
	this.setupFormItem(genesis, key, null, text);
	this.createErrorWrapper();
};
oFF.UiFormSection.prototype.createErrorWrapper = function()
{
	var sectionWrapper = this.getFormControl();
	this.m_errorWrapper = sectionWrapper.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	this.m_errorWrapper.setTag(oFF.UiFormSection.FORM_SECTION_ERROR_WRAPPER_TAG);
	this.m_errorWrapper.setDirection(oFF.UiFlexDirection.ROW);
	this.m_errorWrapper.setAlignItems(oFF.UiFlexAlignItems.CENTER);
	this.m_errorWrapper.useMaxWidth();
	this.m_errorWrapper.setPadding(oFF.UiCssBoxEdges.create("0.2rem 0.3rem 0 0"));
	this.m_errorWrapper.setVisible(false);
	var alertIcon = this.m_errorWrapper.addNewItemOfType(oFF.UiType.ICON);
	alertIcon.setIcon("alert");
	alertIcon.setEnabled(false);
	alertIcon.setColor(oFF.UiTheme.getCurrentTheme().getErrorColor());
	alertIcon.setIconSize(oFF.UiCssLength.create("0.75rem"));
	alertIcon.setMargin(oFF.UiCssBoxEdges.create("0 5px 0 0"));
	this.m_errorLbl = this.m_errorWrapper.addNewItemOfType(oFF.UiType.LABEL);
	this.m_errorLbl.setTag(oFF.UiFormSection.FORM_SECTION_ERROR_LABEL_TAG);
	this.m_errorLbl.setFontColor(oFF.UiTheme.getCurrentTheme().getErrorColor());
	this.m_errorLbl.setFontSize(oFF.UiCssLength.create("0.75rem"));
	this.m_errorLbl.setWrapping(false);
};
oFF.UiFormSection.prototype.createFormItemUiControl = function(genesis)
{
	return this.m_internalForm.getView();
};
oFF.UiFormSection.prototype.layoutFormItem = function()
{
	var wrapperLayout = this.getFormControl();
	wrapperLayout.setDirection(oFF.UiFlexDirection.COLUMN);
	var formItemLbl = this.getFormLabel().getFormControl();
	formItemLbl.setFontWeight(null);
	formItemLbl.setOpacity(0.9);
	formItemLbl.setFontSize(oFF.UiCssLength.create("0.9rem"));
	formItemLbl.setMargin(null);
	formItemLbl.setPadding(oFF.UiCssBoxEdges.create("0.2rem 0.3rem 0 0"));
	wrapperLayout.addItem(this.getFormItemControl());
	wrapperLayout.addItem(this.getFormLabel().getFormControl());
};
oFF.UiFormSection.prototype.isRequiredValid = function()
{
	return true;
};
oFF.UiFormSection.prototype.refreshModelValue = function()
{
	this.m_internalForm.collectModelValues();
};
oFF.UiFormSection.prototype.setInvalidState = function(reason)
{
	if (this.m_showSectionMarkerDuringValidation)
	{
		this.showSectionMarkerInternal(true, oFF.UiTheme.getCurrentTheme().getErrorColor());
		if (oFF.XStringUtils.isNotNullAndNotEmpty(reason))
		{
			this.m_errorWrapper.setVisible(true);
			this.m_errorWrapper.setTooltip(reason);
			this.m_errorLbl.setText(reason);
		}
	}
};
oFF.UiFormSection.prototype.setValidState = function()
{
	if (this.m_showSectionMarkerDuringValidation)
	{
		this.showSectionMarkerInternal(this.m_alwaysShowSectionMarker, oFF.UiTheme.getCurrentTheme().getLightGrayColor());
		this.m_errorWrapper.setVisible(false);
		this.m_errorWrapper.setTooltip(null);
		this.m_errorLbl.setText(null);
	}
};
oFF.UiFormSection.prototype.updateControlValue = function() {};
oFF.UiFormSection.prototype.validate = function()
{
	this.m_internalForm.validate();
	this.checkSectionValidationState();
};
oFF.UiFormSection.prototype.getValue = function()
{
	return this.m_internalForm.getJsonModel();
};
oFF.UiFormSection.prototype.setValue = function(value)
{
	return this;
};
oFF.UiFormSection.prototype.getValueType = function()
{
	return oFF.XValueType.STRUCTURE;
};
oFF.UiFormSection.prototype.isRequired = function()
{
	return false;
};
oFF.UiFormSection.prototype.isEmpty = function()
{
	var isEmpty = true;
	var formItemIterator = this.getAllFormItems().getIterator();
	while (formItemIterator.hasNext())
	{
		var tmpFormItem = formItemIterator.next();
		if (!tmpFormItem.isEmpty())
		{
			isEmpty = false;
			break;
		}
	}
	return isEmpty;
};
oFF.UiFormSection.prototype.setEditable = function(editable)
{
	return this;
};
oFF.UiFormSection.prototype.focus = function()
{
	if (oFF.notNull(this.m_internalForm) && this.m_internalForm.getAllFormItems().hasElements())
	{
		this.m_internalForm.getAllFormItems().get(0).focus();
	}
};
oFF.UiFormSection.prototype.alwaysShowSectionMarker = function(alwaysShow)
{
	this.m_alwaysShowSectionMarker = alwaysShow;
	this.showSectionMarkerInternal(alwaysShow, oFF.UiTheme.getCurrentTheme().getLightGrayColor());
};
oFF.UiFormSection.prototype.showSectionMarkerDuringValidation = function(showDuringValidation)
{
	this.m_showSectionMarkerDuringValidation = showDuringValidation;
};
oFF.UiFormSection.prototype.setEnabled = function(enabled)
{
	return this;
};
oFF.UiFormSection.prototype.setGap = function(gap)
{
	return this.m_internalForm.setGap(gap);
};
oFF.UiFormSection.prototype.getAllFormItems = function()
{
	return this.m_internalForm.getAllFormItems();
};
oFF.UiFormSection.prototype.getFormItemByKey = function(key)
{
	return this.m_internalForm.getFormItemByKey(key);
};
oFF.UiFormSection.prototype.removeFormItemByKey = function(key)
{
	return this.m_internalForm.removeFormItemByKey(key);
};
oFF.UiFormSection.prototype.hasFormItems = function()
{
	return this.m_internalForm.hasFormItems();
};
oFF.UiFormSection.prototype.clearFormItems = function()
{
	this.m_internalForm.clearFormItems();
};
oFF.UiFormSection.prototype.getFormControlByName = function(name)
{
	return this.m_internalForm.getFormControlByName(name);
};
oFF.UiFormSection.prototype.removeFormControlByName = function(name)
{
	return this.m_internalForm.removeFormControlByName(name);
};
oFF.UiFormSection.prototype.addInput = function(key, value, text, placeholder, inputType, valueHelpProcedure)
{
	return this.m_internalForm.addInput(key, value, text, placeholder, inputType, valueHelpProcedure);
};
oFF.UiFormSection.prototype.addSwitch = function(key, value, text)
{
	return this.m_internalForm.addSwitch(key, value, text);
};
oFF.UiFormSection.prototype.addCheckbox = function(key, value, text)
{
	return this.m_internalForm.addCheckbox(key, value, text);
};
oFF.UiFormSection.prototype.addDropdown = function(key, value, text, dropdownItems, addEmptyItem)
{
	return this.m_internalForm.addDropdown(key, value, text, dropdownItems, addEmptyItem);
};
oFF.UiFormSection.prototype.addComboBox = function(key, value, text, dropdownItems, addEmptyItem)
{
	return this.m_internalForm.addComboBox(key, value, text, dropdownItems, addEmptyItem);
};
oFF.UiFormSection.prototype.addSegmentedButton = function(key, value, text, segmentedButtonItems)
{
	return this.m_internalForm.addSegmentedButton(key, value, text, segmentedButtonItems);
};
oFF.UiFormSection.prototype.addRadioGroup = function(key, value, text, radioGroupItems)
{
	return this.m_internalForm.addRadioGroup(key, value, text, radioGroupItems);
};
oFF.UiFormSection.prototype.addFormSection = function(key, text, isHorizontal)
{
	return this.m_internalForm.addFormSection(key, text, isHorizontal);
};
oFF.UiFormSection.prototype.addFormButton = function(name, text, tooltip, icon, pressProcedure)
{
	return this.m_internalForm.addFormButton(name, text, tooltip, icon, pressProcedure);
};
oFF.UiFormSection.prototype.addFormLabel = function(name, text, tooltip)
{
	return this.m_internalForm.addFormLabel(name, text, tooltip);
};
oFF.UiFormSection.prototype.addFormTitle = function(name, text, tooltip)
{
	return this.m_internalForm.addFormTitle(name, text, tooltip);
};
oFF.UiFormSection.prototype.addFormCustomControl = function(name, customControl)
{
	return this.m_internalForm.addFormCustomControl(name, customControl);
};
oFF.UiFormSection.prototype.showSectionMarkerInternal = function(showMarker, borderColor)
{
	if (showMarker)
	{
		this.getFormControl().setBorderStyle(oFF.UiBorderStyle.SOLID);
		this.getFormControl().setBorderWidth(oFF.UiCssBoxEdges.create("0px 0px 0px 2px"));
		this.getFormControl().setBorderColor(borderColor);
		this.getFormControl().setPadding(oFF.UiCssBoxEdges.create("0px 0px 0px 5px"));
	}
	else
	{
		this.getFormControl().setBorderStyle(null);
		this.getFormControl().setBorderWidth(null);
		this.getFormControl().setBorderColor(null);
		this.getFormControl().setPadding(null);
	}
};
oFF.UiFormSection.prototype.onSectionItemBlured = function()
{
	this.m_sectionBlurTimeoutId = oFF.XTimeout.timeout(oFF.DfUiFormItem.INITIAL_BLUR_DELAY,  function(){
		this.checkSectionValidationState();
	}.bind(this));
};
oFF.UiFormSection.prototype.checkSectionValidationState = function()
{
	if (this.m_internalForm.isValid())
	{
		this.setValid();
	}
	else
	{
		this.setInvalid("");
	}
	this.executeCustomValidator();
};

oFF.DfUiPopup = function() {};
oFF.DfUiPopup.prototype = new oFF.XObject();
oFF.DfUiPopup.prototype._ff_c = "DfUiPopup";

oFF.DfUiPopup.prototype.m_genesis = null;
oFF.DfUiPopup.prototype.m_dialog = null;
oFF.DfUiPopup.prototype.m_customObject = null;
oFF.DfUiPopup.prototype.m_closeProcedure = null;
oFF.DfUiPopup.prototype.setupPopup = function(genesis)
{
	if (oFF.isNull(genesis))
	{
		throw oFF.XException.createRuntimeException("Cannot create a popup. Please sepcify a genesis object!");
	}
	this.createDialog(genesis);
	if (oFF.notNull(this.m_dialog))
	{
		this.configurePopup(this.m_dialog);
		var innerGenesis = oFF.UiGenesis.create(this.m_dialog);
		this.m_genesis = innerGenesis;
		this.buildPopupContent(innerGenesis);
	}
};
oFF.DfUiPopup.prototype.releaseObject = function()
{
	this.m_dialog = oFF.XObjectExt.release(this.m_dialog);
	this.m_genesis = oFF.XObjectExt.release(this.m_genesis);
	this.m_customObject = null;
	this.m_closeProcedure = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.DfUiPopup.prototype.getCustomObject = function()
{
	return this.m_customObject;
};
oFF.DfUiPopup.prototype.setCustomObject = function(customObject)
{
	this.m_customObject = customObject;
};
oFF.DfUiPopup.prototype.open = function()
{
	if (oFF.notNull(this.m_dialog))
	{
		this.m_dialog.open();
	}
};
oFF.DfUiPopup.prototype.close = function()
{
	if (oFF.notNull(this.m_dialog))
	{
		this.m_dialog.close();
	}
	this.fireCloseProcedure();
};
oFF.DfUiPopup.prototype.shake = function()
{
	if (oFF.notNull(this.m_dialog))
	{
		this.m_dialog.shake();
	}
};
oFF.DfUiPopup.prototype.setBusy = function(busy)
{
	if (oFF.notNull(this.m_dialog))
	{
		this.m_dialog.setBusy(busy);
	}
};
oFF.DfUiPopup.prototype.setCloseProcedure = function(procedure)
{
	this.m_closeProcedure = procedure;
};
oFF.DfUiPopup.prototype.getGenesis = function()
{
	return this.m_genesis;
};
oFF.DfUiPopup.prototype.getDialog = function()
{
	return this.m_dialog;
};
oFF.DfUiPopup.prototype.setContent = function(content)
{
	if (oFF.notNull(this.m_dialog))
	{
		this.m_dialog.setContent(content);
	}
};
oFF.DfUiPopup.prototype.getContent = function()
{
	if (oFF.notNull(this.m_dialog))
	{
		return this.m_dialog.getContent();
	}
	return oFF.UiContextDummy.getSingleton().getContent();
};
oFF.DfUiPopup.prototype.addButton = function(name, btnType, text, icon, listner)
{
	if (oFF.notNull(this.m_dialog))
	{
		var tmpDialogBtn = this.m_dialog.addNewDialogButton();
		tmpDialogBtn.setName(name);
		tmpDialogBtn.setButtonType(oFF.notNull(btnType) ? btnType : oFF.UiButtonType.DEFAULT);
		tmpDialogBtn.setMinWidth(oFF.UiTheme.getCurrentTheme().getDialogBtnMinWidth());
		tmpDialogBtn.setText(text);
		tmpDialogBtn.setIcon(icon);
		tmpDialogBtn.registerOnPress(listner);
		return tmpDialogBtn;
	}
	return oFF.UiContextDummy.getSingleton().getContent();
};
oFF.DfUiPopup.prototype.createDialog = function(genesis)
{
	if (oFF.notNull(genesis))
	{
		this.m_dialog = genesis.newControl(oFF.UiType.DIALOG);
		this.m_dialog.setPadding(oFF.UiTheme.getCurrentTheme().getDialogPadding());
		this.m_dialog.registerOnAfterOpen(this);
		this.m_dialog.registerOnAfterClose(this);
	}
};
oFF.DfUiPopup.prototype.fireCloseProcedure = function()
{
	if (oFF.notNull(this.m_closeProcedure))
	{
		this.m_closeProcedure();
	}
};

oFF.UtToolbarWidget = function() {};
oFF.UtToolbarWidget.prototype = new oFF.DfUiWidget();
oFF.UtToolbarWidget.prototype._ff_c = "UtToolbarWidget";

oFF.UtToolbarWidget.create = function(genesis)
{
	var toolbar = new oFF.UtToolbarWidget();
	toolbar.setupInternal(genesis);
	return toolbar;
};
oFF.UtToolbarWidget.prototype.m_toolbarSection = null;
oFF.UtToolbarWidget.prototype.m_fixedSection = null;
oFF.UtToolbarWidget.prototype.releaseObject = function()
{
	this.m_toolbarSection = oFF.XObjectExt.release(this.m_toolbarSection);
	this.m_fixedSection = oFF.XObjectExt.release(this.m_fixedSection);
	oFF.DfUiWidget.prototype.releaseObject.call( this );
};
oFF.UtToolbarWidget.prototype.setupInternal = function(genesis)
{
	this.initWidget(genesis);
};
oFF.UtToolbarWidget.prototype.setupWidget = function(widgetWrapper)
{
	this.m_toolbarSection = this.createToolbarSection();
	this.m_fixedSection = this.createFixedSection();
};
oFF.UtToolbarWidget.prototype.buildWidgetUi = function(widgetWrapper)
{
	widgetWrapper.clearItems();
	widgetWrapper.setWidth(oFF.UiCssLength.create("100%"));
	widgetWrapper.addItem(this.m_toolbarSection.getView());
	widgetWrapper.addItem(this.m_fixedSection.getView());
};
oFF.UtToolbarWidget.prototype.getToolbarSection = function()
{
	return this.m_toolbarSection;
};
oFF.UtToolbarWidget.prototype.getFixedToolbarSection = function()
{
	return this.m_fixedSection;
};
oFF.UtToolbarWidget.prototype.clearItems = function()
{
	this.m_toolbarSection.clearItems();
	this.m_fixedSection.clearItems();
};
oFF.UtToolbarWidget.prototype.createToolbarSection = function()
{
	return oFF.UtToolbarWidgetSection.create(this.getGenesis());
};
oFF.UtToolbarWidget.prototype.createFixedSection = function()
{
	return oFF.UtToolbarWidgetFixedSection.create(this.getGenesis());
};

oFF.UtToolbarWidgetButton = function() {};
oFF.UtToolbarWidgetButton.prototype = new oFF.DfUtToolbarWidgetItem();
oFF.UtToolbarWidgetButton.prototype._ff_c = "UtToolbarWidgetButton";

oFF.UtToolbarWidgetButton.create = function(genesis, text, tooltip, icon)
{
	var toolbarButton = new oFF.UtToolbarWidgetButton();
	toolbarButton.setupInternal(genesis, text, tooltip, icon);
	return toolbarButton;
};
oFF.UtToolbarWidgetButton.prototype.m_button = null;
oFF.UtToolbarWidgetButton.prototype.releaseObject = function()
{
	this.m_button = oFF.XObjectExt.release(this.m_button);
	oFF.DfUtToolbarWidgetItem.prototype.releaseObject.call( this );
};
oFF.UtToolbarWidgetButton.prototype.getView = function()
{
	return this.m_button;
};
oFF.UtToolbarWidgetButton.prototype.setPressConsumer = function(consumer)
{
	this.m_button.registerOnPress(oFF.UiLambdaPressListener.create(consumer));
};
oFF.UtToolbarWidgetButton.prototype.setupInternal = function(genesis, text, tooltip, icon)
{
	this.m_button = genesis.newControl(oFF.UiType.OVERFLOW_BUTTON).setButtonType(oFF.UiButtonType.TRANSPARENT).setText(text).setTooltip(tooltip).setIcon(icon);
};

oFF.UtToolbarWidgetMenu = function() {};
oFF.UtToolbarWidgetMenu.prototype = new oFF.DfUtToolbarWidgetItem();
oFF.UtToolbarWidgetMenu.prototype._ff_c = "UtToolbarWidgetMenu";

oFF.UtToolbarWidgetMenu.create = function(genesis, text)
{
	var toolbarMenu = new oFF.UtToolbarWidgetMenu();
	toolbarMenu.setupInternal(genesis, text);
	return toolbarMenu;
};
oFF.UtToolbarWidgetMenu.prototype.m_genesis = null;
oFF.UtToolbarWidgetMenu.prototype.m_button = null;
oFF.UtToolbarWidgetMenu.prototype.m_menu = null;
oFF.UtToolbarWidgetMenu.prototype.addMenuItem = function(text, icon)
{
	return oFF.UtToolbarWidgetMenuItem.create(this.m_menu, text, icon);
};
oFF.UtToolbarWidgetMenu.prototype.addToggleButton = function(activeText, inactiveText, activeIcon, inactiveIcon, defaultState)
{
	return oFF.UtToolbarWidgetMenuToggleButton.create(this.m_menu, activeText, inactiveText, activeIcon, inactiveIcon, defaultState);
};
oFF.UtToolbarWidgetMenu.prototype.removeItem = function(menuItem)
{
	if (oFF.notNull(menuItem))
	{
		menuItem.remove();
	}
};
oFF.UtToolbarWidgetMenu.prototype.getView = function()
{
	return this.m_button;
};
oFF.UtToolbarWidgetMenu.prototype.setPressConsumer = function(consumer)
{
	this.m_button.registerOnPress(oFF.UiLambdaPressListener.create(consumer));
};
oFF.UtToolbarWidgetMenu.prototype.releaseObject = function()
{
	this.m_button = oFF.XObjectExt.release(this.m_button);
	this.m_menu = oFF.XObjectExt.release(this.m_menu);
	oFF.DfUtToolbarWidgetItem.prototype.releaseObject.call( this );
};
oFF.UtToolbarWidgetMenu.prototype.setupInternal = function(genesis, text)
{
	this.m_genesis = genesis;
	this.m_button = this.m_genesis.newControl(oFF.UiType.MENU_BUTTON).setButtonType(oFF.UiButtonType.TRANSPARENT).setText(text).setTooltip(text);
	this.m_menu = this.m_genesis.newControl(oFF.UiType.MENU);
	this.m_button.setMenu(this.m_menu);
};
oFF.UtToolbarWidgetMenu.prototype.setIcon = function(icon)
{
	this.m_button.setIcon(icon);
};
oFF.UtToolbarWidgetMenu.prototype.setTooltip = function(toolTip)
{
	this.m_button.setTooltip(toolTip);
};

oFF.UtToolbarWidgetToggleButton = function() {};
oFF.UtToolbarWidgetToggleButton.prototype = new oFF.DfUtToolbarWidgetItem();
oFF.UtToolbarWidgetToggleButton.prototype._ff_c = "UtToolbarWidgetToggleButton";

oFF.UtToolbarWidgetToggleButton.create = function(genesis, text, tooltip, icon)
{
	var toolbarButton = new oFF.UtToolbarWidgetToggleButton();
	toolbarButton.setupInternal(genesis, text, tooltip, icon);
	return toolbarButton;
};
oFF.UtToolbarWidgetToggleButton.prototype.m_button = null;
oFF.UtToolbarWidgetToggleButton.prototype.getView = function()
{
	return this.m_button;
};
oFF.UtToolbarWidgetToggleButton.prototype.setPressConsumer = function(consumer)
{
	this.m_button.registerOnPress(oFF.UiLambdaPressListener.create(consumer));
};
oFF.UtToolbarWidgetToggleButton.prototype.isPressed = function()
{
	return this.m_button.isPressed();
};
oFF.UtToolbarWidgetToggleButton.prototype.setupInternal = function(genesis, text, tooltip, icon)
{
	this.m_button = genesis.newControl(oFF.UiType.OVERFLOW_TOGGLE_BUTTON).setButtonType(oFF.UiButtonType.TRANSPARENT).setTooltip(tooltip).setIcon(icon).setText(text);
};
oFF.UtToolbarWidgetToggleButton.prototype.setPressed = function(pressed)
{
	this.m_button.setPressed(pressed);
};

oFF.UiFormItemCheckbox = function() {};
oFF.UiFormItemCheckbox.prototype = new oFF.DfUiFormItemHorizontal();
oFF.UiFormItemCheckbox.prototype._ff_c = "UiFormItemCheckbox";

oFF.UiFormItemCheckbox.create = function(genesis, key, value, text)
{
	var newFormItem = new oFF.UiFormItemCheckbox();
	newFormItem.setupInternal(genesis, key, value, text);
	return newFormItem;
};
oFF.UiFormItemCheckbox.prototype.releaseObject = function()
{
	oFF.DfUiFormItemHorizontal.prototype.releaseObject.call( this );
};
oFF.UiFormItemCheckbox.prototype.setupInternal = function(genesis, key, value, text)
{
	this.setupFormItem(genesis, key, value, text);
};
oFF.UiFormItemCheckbox.prototype.createFormItemUiControl = function(genesis)
{
	var formItemCheckbox = genesis.newControl(oFF.UiType.CHECKBOX);
	formItemCheckbox.setChecked(this.getModelValueAsBoolean());
	formItemCheckbox.registerOnChange(this);
	return formItemCheckbox;
};
oFF.UiFormItemCheckbox.prototype.isRequiredValid = function()
{
	return true;
};
oFF.UiFormItemCheckbox.prototype.refreshModelValue = function()
{
	this.updateModelValueByBoolean(this.getCheckboxControl().isChecked());
};
oFF.UiFormItemCheckbox.prototype.setInvalidState = function(reason)
{
	var formLabel = this.getFormLabel().getFormControl();
	formLabel.setFontColor(oFF.UiTheme.getCurrentTheme().getErrorColor());
	formLabel.setTooltip(reason);
};
oFF.UiFormItemCheckbox.prototype.setValidState = function()
{
	var formLabel = this.getFormLabel().getFormControl();
	formLabel.setFontColor(null);
	formLabel.setTooltip(null);
};
oFF.UiFormItemCheckbox.prototype.updateControlValue = function()
{
	this.getCheckboxControl().setChecked(this.getModelValueAsBoolean());
};
oFF.UiFormItemCheckbox.prototype.getValueType = function()
{
	return oFF.XValueType.BOOLEAN;
};
oFF.UiFormItemCheckbox.prototype.isEmpty = function()
{
	return false;
};
oFF.UiFormItemCheckbox.prototype.setEditable = function(editable)
{
	this.getCheckboxControl().setEnabled(editable);
	return this;
};
oFF.UiFormItemCheckbox.prototype.setEnabled = function(enabled)
{
	this.getCheckboxControl().setEnabled(enabled);
	return this;
};
oFF.UiFormItemCheckbox.prototype.getCheckboxControl = function()
{
	return this.getFormItemControl();
};
oFF.UiFormItemCheckbox.prototype.onChange = function(event)
{
	this.handleItemValueChanged();
	this.handleItemBlured();
};

oFF.UiFormItemComboBox = function() {};
oFF.UiFormItemComboBox.prototype = new oFF.DfUiFormItemVertical();
oFF.UiFormItemComboBox.prototype._ff_c = "UiFormItemComboBox";

oFF.UiFormItemComboBox.COMBO_BOX_EMPTY_ITEM_NAME = "UiFormItemComboBoxEmptyItem";
oFF.UiFormItemComboBox.create = function(genesis, key, value, text, dropdownItems, addEmptyItem)
{
	var newFormItem = new oFF.UiFormItemComboBox();
	newFormItem.setupInternal(genesis, key, value, text, dropdownItems, addEmptyItem);
	return newFormItem;
};
oFF.UiFormItemComboBox.prototype.m_comboBoxItems = null;
oFF.UiFormItemComboBox.prototype.m_addEmptyItem = false;
oFF.UiFormItemComboBox.prototype.m_emptyItemText = null;
oFF.UiFormItemComboBox.prototype.releaseObject = function()
{
	this.m_comboBoxItems = null;
	oFF.DfUiFormItemVertical.prototype.releaseObject.call( this );
};
oFF.UiFormItemComboBox.prototype.setupInternal = function(genesis, key, value, text, dropdownItems, addEmptyItem)
{
	this.m_comboBoxItems = dropdownItems;
	this.m_addEmptyItem = addEmptyItem;
	this.m_emptyItemText = "";
	this.setupFormItem(genesis, key, value, text);
	this.fillDropdownItems();
};
oFF.UiFormItemComboBox.prototype.createFormItemUiControl = function(genesis)
{
	var formItemDropdown = genesis.newControl(oFF.UiType.COMBO_BOX);
	formItemDropdown.setRequired(this.isRequired());
	formItemDropdown.registerOnSelectionChange(this);
	return formItemDropdown;
};
oFF.UiFormItemComboBox.prototype.refreshModelValue = function()
{
	var value = this.getComboBoxControl().getSelectedName();
	value = oFF.XString.isEqual(value, oFF.UiFormItemComboBox.COMBO_BOX_EMPTY_ITEM_NAME) ? null : value;
	this.updateModelValueByString(value);
};
oFF.UiFormItemComboBox.prototype.setInvalidState = function(reason)
{
	this.getComboBoxControl().setValueState(oFF.UiValueState.ERROR);
	this.getComboBoxControl().setValueStateText(reason);
};
oFF.UiFormItemComboBox.prototype.setValidState = function()
{
	this.getComboBoxControl().setValueState(oFF.UiValueState.NONE);
	this.getComboBoxControl().setValueStateText(null);
};
oFF.UiFormItemComboBox.prototype.updateControlValue = function()
{
	this.getComboBoxControl().setSelectedName(this.getModelValueAsString());
};
oFF.UiFormItemComboBox.prototype.getValueType = function()
{
	return oFF.XValueType.STRING;
};
oFF.UiFormItemComboBox.prototype.setEditable = function(editable)
{
	return null;
};
oFF.UiFormItemComboBox.prototype.setEnabled = function(enabled)
{
	this.getComboBoxControl().setEnabled(enabled);
	return this;
};
oFF.UiFormItemComboBox.prototype.setComboBoxItems = function(comboBoxItems)
{
	this.m_comboBoxItems = comboBoxItems;
	this.fillDropdownItems();
	return this;
};
oFF.UiFormItemComboBox.prototype.setEmptyItemText = function(emptyItemText)
{
	this.m_emptyItemText = emptyItemText;
	if (this.getComboBoxControl() !== null && this.m_addEmptyItem)
	{
		var emptyItem = this.getComboBoxControl().getItemByName(oFF.UiFormItemComboBox.COMBO_BOX_EMPTY_ITEM_NAME);
		if (oFF.notNull(emptyItem))
		{
			emptyItem.setText(this.m_emptyItemText);
		}
	}
	return this;
};
oFF.UiFormItemComboBox.prototype.getComboBoxControl = function()
{
	return this.getFormItemControl();
};
oFF.UiFormItemComboBox.prototype.fillDropdownItems = function()
{
	if (this.getComboBoxControl() !== null)
	{
		this.getComboBoxControl().clearItems();
		if (oFF.notNull(this.m_comboBoxItems) && this.m_comboBoxItems.size() > 0)
		{
			if (this.m_addEmptyItem)
			{
				var emptyDdItem = this.getComboBoxControl().addNewItem();
				emptyDdItem.setName(oFF.UiFormItemComboBox.COMBO_BOX_EMPTY_ITEM_NAME);
				emptyDdItem.setText(this.m_emptyItemText);
			}
			oFF.XCollectionUtils.forEachString(this.m_comboBoxItems.getKeysAsReadOnlyListOfString(),  function(key){
				var tmpText = this.m_comboBoxItems.getByKey(key);
				var tmpDdItem = this.getComboBoxControl().addNewItem();
				tmpDdItem.setName(key);
				tmpDdItem.setText(tmpText);
			}.bind(this));
			if (this.getValue() !== null && this.m_comboBoxItems.containsKey(this.getModelValueAsString()))
			{
				this.getComboBoxControl().setSelectedName(this.getModelValueAsString());
			}
			else
			{
				this.getComboBoxControl().setSelectedItemByIndex(0);
			}
		}
	}
};
oFF.UiFormItemComboBox.prototype.onSelectionChange = function(event)
{
	this.handleItemValueChanged();
	this.handleItemBlured();
};

oFF.UiFormItemDropdown = function() {};
oFF.UiFormItemDropdown.prototype = new oFF.DfUiFormItemVertical();
oFF.UiFormItemDropdown.prototype._ff_c = "UiFormItemDropdown";

oFF.UiFormItemDropdown.DROPDOWN_EMPTY_ITEM_NAME = "UiFormItemDropdownEmptyItem";
oFF.UiFormItemDropdown.create = function(genesis, key, value, text, dropdownItems, addEmptyItem)
{
	var newFormItem = new oFF.UiFormItemDropdown();
	newFormItem.setupInternal(genesis, key, value, text, dropdownItems, addEmptyItem);
	return newFormItem;
};
oFF.UiFormItemDropdown.prototype.m_dropdownItems = null;
oFF.UiFormItemDropdown.prototype.m_addEmptyItem = false;
oFF.UiFormItemDropdown.prototype.m_emptyItemText = null;
oFF.UiFormItemDropdown.prototype.releaseObject = function()
{
	this.m_dropdownItems = null;
	oFF.DfUiFormItemVertical.prototype.releaseObject.call( this );
};
oFF.UiFormItemDropdown.prototype.setupInternal = function(genesis, key, value, text, dropdownItems, addEmptyItem)
{
	this.m_dropdownItems = dropdownItems;
	this.m_addEmptyItem = addEmptyItem;
	this.m_emptyItemText = "";
	this.setupFormItem(genesis, key, value, text);
	this.fillDropdownItems();
};
oFF.UiFormItemDropdown.prototype.createFormItemUiControl = function(genesis)
{
	var formItemDropdown = genesis.newControl(oFF.UiType.DROPDOWN);
	formItemDropdown.setRequired(this.isRequired());
	formItemDropdown.registerOnSelect(this);
	return formItemDropdown;
};
oFF.UiFormItemDropdown.prototype.refreshModelValue = function()
{
	var value = this.getDropdownControl().getSelectedName();
	value = oFF.XString.isEqual(value, oFF.UiFormItemDropdown.DROPDOWN_EMPTY_ITEM_NAME) ? null : value;
	this.updateModelValueByString(value);
};
oFF.UiFormItemDropdown.prototype.setInvalidState = function(reason)
{
	this.getDropdownControl().setValueState(oFF.UiValueState.ERROR);
	this.getDropdownControl().setValueStateText(reason);
};
oFF.UiFormItemDropdown.prototype.setValidState = function()
{
	this.getDropdownControl().setValueState(oFF.UiValueState.NONE);
	this.getDropdownControl().setValueStateText(null);
};
oFF.UiFormItemDropdown.prototype.updateControlValue = function()
{
	this.getDropdownControl().setSelectedName(this.getModelValueAsString());
};
oFF.UiFormItemDropdown.prototype.getValueType = function()
{
	return oFF.XValueType.STRING;
};
oFF.UiFormItemDropdown.prototype.setEditable = function(editable)
{
	this.getDropdownControl().setEditable(editable);
	return this;
};
oFF.UiFormItemDropdown.prototype.setEnabled = function(enabled)
{
	this.getDropdownControl().setEnabled(enabled);
	return this;
};
oFF.UiFormItemDropdown.prototype.setDropdownItems = function(dropdownItems)
{
	this.m_dropdownItems = dropdownItems;
	this.fillDropdownItems();
	return this;
};
oFF.UiFormItemDropdown.prototype.setEmptyItemText = function(emptyItemText)
{
	this.m_emptyItemText = emptyItemText;
	if (this.getDropdownControl() !== null && this.m_addEmptyItem)
	{
		var emptyItem = this.getDropdownControl().getItemByName(oFF.UiFormItemDropdown.DROPDOWN_EMPTY_ITEM_NAME);
		if (oFF.notNull(emptyItem))
		{
			emptyItem.setText(this.m_emptyItemText);
		}
	}
	return this;
};
oFF.UiFormItemDropdown.prototype.getDropdownControl = function()
{
	return this.getFormItemControl();
};
oFF.UiFormItemDropdown.prototype.fillDropdownItems = function()
{
	if (this.getDropdownControl() !== null)
	{
		this.getDropdownControl().clearItems();
		if (oFF.notNull(this.m_dropdownItems) && this.m_dropdownItems.size() > 0)
		{
			if (this.m_addEmptyItem)
			{
				var emptyDdItem = this.getDropdownControl().addNewItem();
				emptyDdItem.setName(oFF.UiFormItemDropdown.DROPDOWN_EMPTY_ITEM_NAME);
				emptyDdItem.setText(this.m_emptyItemText);
			}
			oFF.XCollectionUtils.forEachString(this.m_dropdownItems.getKeysAsReadOnlyListOfString(),  function(key){
				var tmpText = this.m_dropdownItems.getByKey(key);
				var tmpDdItem = this.getDropdownControl().addNewItem();
				tmpDdItem.setName(key);
				tmpDdItem.setText(tmpText);
			}.bind(this));
			if (this.getValue() !== null && this.m_dropdownItems.containsKey(this.getModelValueAsString()))
			{
				this.getDropdownControl().setSelectedName(this.getModelValueAsString());
			}
			else
			{
				this.getDropdownControl().setSelectedItemByIndex(0);
			}
		}
	}
};
oFF.UiFormItemDropdown.prototype.onSelect = function(event)
{
	this.handleItemValueChanged();
	this.handleItemBlured();
};

oFF.UiFormItemInput = function() {};
oFF.UiFormItemInput.prototype = new oFF.DfUiFormItemVertical();
oFF.UiFormItemInput.prototype._ff_c = "UiFormItemInput";

oFF.UiFormItemInput.create = function(genesis, key, value, text, placeholder, inputType, valueHelpProcedure)
{
	var newFormItem = new oFF.UiFormItemInput();
	newFormItem.setupInternal(genesis, key, value, text, placeholder, inputType, valueHelpProcedure);
	return newFormItem;
};
oFF.UiFormItemInput.prototype.m_placeholder = null;
oFF.UiFormItemInput.prototype.m_inputType = null;
oFF.UiFormItemInput.prototype.m_valueHelpProcedure = null;
oFF.UiFormItemInput.prototype.releaseObject = function()
{
	oFF.DfUiFormItemVertical.prototype.releaseObject.call( this );
};
oFF.UiFormItemInput.prototype.setupInternal = function(genesis, key, value, text, placeholder, inputType, valueHelpProcedure)
{
	this.m_placeholder = placeholder;
	this.m_inputType = oFF.notNull(inputType) ? inputType : oFF.UiInputType.TEXT;
	this.m_valueHelpProcedure = valueHelpProcedure;
	this.setupFormItem(genesis, key, value, text);
};
oFF.UiFormItemInput.prototype.createFormItemUiControl = function(genesis)
{
	var formItemInput = genesis.newControl(oFF.UiType.INPUT);
	formItemInput.setPlaceholder(this.m_placeholder);
	formItemInput.setText(this.getModelValueAsString());
	formItemInput.setInputType(this.m_inputType);
	formItemInput.setRequired(this.isRequired());
	formItemInput.registerOnLiveChange(this);
	formItemInput.registerOnEditingEnd(this);
	formItemInput.registerOnEnter(this);
	if (oFF.notNull(this.m_valueHelpProcedure))
	{
		formItemInput.setShowValueHelp(true);
		formItemInput.registerOnValueHelpRequest(oFF.UiLambdaValueHelpRequestListener.create( function(control){
			this.m_valueHelpProcedure();
		}.bind(this)));
	}
	return formItemInput;
};
oFF.UiFormItemInput.prototype.refreshModelValue = function()
{
	this.updateModelValueByString(this.getInputControl().getText());
};
oFF.UiFormItemInput.prototype.setInvalidState = function(reason)
{
	this.getInputControl().setValueState(oFF.UiValueState.ERROR);
	this.getInputControl().setValueStateText(reason);
};
oFF.UiFormItemInput.prototype.setValidState = function()
{
	this.getInputControl().setValueState(oFF.UiValueState.NONE);
	this.getInputControl().setValueStateText(null);
};
oFF.UiFormItemInput.prototype.updateControlValue = function()
{
	this.getInputControl().setText(this.getModelValueAsString());
};
oFF.UiFormItemInput.prototype.getValueType = function()
{
	return oFF.XValueType.STRING;
};
oFF.UiFormItemInput.prototype.setEditable = function(editable)
{
	this.getInputControl().setEditable(editable);
	return this;
};
oFF.UiFormItemInput.prototype.setEnabled = function(enabled)
{
	this.getInputControl().setEnabled(enabled);
	return this;
};
oFF.UiFormItemInput.prototype.setAutoComplete = function(autocomplete)
{
	this.getInputControl().setAutocomplete(autocomplete);
	return this;
};
oFF.UiFormItemInput.prototype.setValueHelpOnly = function(valueHelpOnly)
{
	this.getInputControl().setValueHelpOnly(valueHelpOnly);
	return this;
};
oFF.UiFormItemInput.prototype.getInputControl = function()
{
	return this.getFormItemControl();
};
oFF.UiFormItemInput.prototype.onLiveChange = function(event)
{
	this.handleItemValueChanged();
};
oFF.UiFormItemInput.prototype.onEnter = function(event)
{
	this.handleItemEnterPressed();
};
oFF.UiFormItemInput.prototype.onEditingEnd = function(event)
{
	this.handleItemBlured();
};

oFF.UiFormItemRadioGroup = function() {};
oFF.UiFormItemRadioGroup.prototype = new oFF.DfUiFormItemVertical();
oFF.UiFormItemRadioGroup.prototype._ff_c = "UiFormItemRadioGroup";

oFF.UiFormItemRadioGroup.create = function(genesis, key, value, text, radioGroupItems)
{
	var newFormItem = new oFF.UiFormItemRadioGroup();
	newFormItem.setupInternal(genesis, key, value, text, radioGroupItems);
	return newFormItem;
};
oFF.UiFormItemRadioGroup.prototype.m_radioGroupItems = null;
oFF.UiFormItemRadioGroup.prototype.releaseObject = function()
{
	this.m_radioGroupItems = null;
	oFF.DfUiFormItemVertical.prototype.releaseObject.call( this );
};
oFF.UiFormItemRadioGroup.prototype.setupInternal = function(genesis, key, value, text, radioGroupItems)
{
	this.m_radioGroupItems = radioGroupItems;
	this.setupFormItem(genesis, key, value, text);
};
oFF.UiFormItemRadioGroup.prototype.createFormItemUiControl = function(genesis)
{
	var radioGroup = genesis.newControl(oFF.UiType.RADIO_BUTTON_GROUP);
	radioGroup.registerOnSelect(this);
	this.fillRadioGroup(radioGroup);
	return radioGroup;
};
oFF.UiFormItemRadioGroup.prototype.refreshModelValue = function()
{
	var value = this.getRadioGroup().getSelectedName();
	this.updateModelValueByString(value);
};
oFF.UiFormItemRadioGroup.prototype.setInvalidState = function(reason)
{
	this.getRadioGroup().setValueState(oFF.UiValueState.ERROR);
};
oFF.UiFormItemRadioGroup.prototype.setValidState = function()
{
	this.getRadioGroup().setValueState(oFF.UiValueState.NONE);
};
oFF.UiFormItemRadioGroup.prototype.updateControlValue = function()
{
	this.getRadioGroup().setSelectedName(this.getModelValueAsString());
};
oFF.UiFormItemRadioGroup.prototype.getValueType = function()
{
	return oFF.XValueType.STRING;
};
oFF.UiFormItemRadioGroup.prototype.setEditable = function(editable)
{
	return this;
};
oFF.UiFormItemRadioGroup.prototype.setEnabled = function(enabled)
{
	this.getRadioGroup().setEnabled(enabled);
	return this;
};
oFF.UiFormItemRadioGroup.prototype.getRadioGroup = function()
{
	return this.getFormItemControl();
};
oFF.UiFormItemRadioGroup.prototype.fillRadioGroup = function(formItemRadioGroup)
{
	if (oFF.notNull(this.m_radioGroupItems) && this.m_radioGroupItems.size() > 0)
	{
		oFF.XCollectionUtils.forEachString(this.m_radioGroupItems.getKeysAsReadOnlyListOfString(),  function(key){
			var tmpText = this.m_radioGroupItems.getByKey(key);
			var tmpRb = formItemRadioGroup.addNewRadioButton();
			tmpRb.setName(key);
			tmpRb.setText(tmpText);
		}.bind(this));
		if (this.getValue() !== null && this.m_radioGroupItems.containsKey(this.getModelValueAsString()))
		{
			formItemRadioGroup.setSelectedName(this.getModelValueAsString());
		}
		else
		{
			formItemRadioGroup.setSelectedItemByIndex(0);
		}
	}
};
oFF.UiFormItemRadioGroup.prototype.onSelect = function(event)
{
	this.handleItemValueChanged();
	this.handleItemBlured();
};

oFF.UiFormItemSegmentedButton = function() {};
oFF.UiFormItemSegmentedButton.prototype = new oFF.DfUiFormItemVertical();
oFF.UiFormItemSegmentedButton.prototype._ff_c = "UiFormItemSegmentedButton";

oFF.UiFormItemSegmentedButton.create = function(genesis, key, value, text, segmentedButtonItems)
{
	var newFormItem = new oFF.UiFormItemSegmentedButton();
	newFormItem.setupInternal(genesis, key, value, text, segmentedButtonItems);
	return newFormItem;
};
oFF.UiFormItemSegmentedButton.prototype.m_segmentedButtonItems = null;
oFF.UiFormItemSegmentedButton.prototype.releaseObject = function()
{
	this.m_segmentedButtonItems = null;
	oFF.DfUiFormItemVertical.prototype.releaseObject.call( this );
};
oFF.UiFormItemSegmentedButton.prototype.setupInternal = function(genesis, key, value, text, segmentedButtonItems)
{
	this.m_segmentedButtonItems = segmentedButtonItems;
	this.setupFormItem(genesis, key, value, text);
};
oFF.UiFormItemSegmentedButton.prototype.createFormItemUiControl = function(genesis)
{
	var formItemSegmentedButton = genesis.newControl(oFF.UiType.SEGMENTED_BUTTON);
	formItemSegmentedButton.setWidth(oFF.UiCssLength.create("100%"));
	formItemSegmentedButton.registerOnSelectionChange(this);
	this.fillSegmentedButtonItems(formItemSegmentedButton);
	return formItemSegmentedButton;
};
oFF.UiFormItemSegmentedButton.prototype.refreshModelValue = function()
{
	var value = this.getSegmentedButtonControl().getSelectedName();
	this.updateModelValueByString(value);
};
oFF.UiFormItemSegmentedButton.prototype.setInvalidState = function(reason)
{
	var formLabel = this.getFormLabel().getFormControl();
	formLabel.setFontColor(oFF.UiTheme.getCurrentTheme().getErrorColor());
	formLabel.setTooltip(reason);
};
oFF.UiFormItemSegmentedButton.prototype.setValidState = function()
{
	var formLabel = this.getFormLabel().getFormControl();
	formLabel.setFontColor(null);
	formLabel.setTooltip(null);
};
oFF.UiFormItemSegmentedButton.prototype.updateControlValue = function()
{
	this.getSegmentedButtonControl().setSelectedName(this.getModelValueAsString());
};
oFF.UiFormItemSegmentedButton.prototype.getValueType = function()
{
	return oFF.XValueType.STRING;
};
oFF.UiFormItemSegmentedButton.prototype.setEditable = function(editable)
{
	this.setEnabled(editable);
	return this;
};
oFF.UiFormItemSegmentedButton.prototype.setEnabled = function(enabled)
{
	this.getSegmentedButtonControl().setEnabled(enabled);
	return this;
};
oFF.UiFormItemSegmentedButton.prototype.getSegmentedButtonControl = function()
{
	return this.getFormItemControl();
};
oFF.UiFormItemSegmentedButton.prototype.fillSegmentedButtonItems = function(formItemSegmentedButton)
{
	if (oFF.notNull(this.m_segmentedButtonItems) && this.m_segmentedButtonItems.size() > 0)
	{
		oFF.XCollectionUtils.forEachString(this.m_segmentedButtonItems.getKeysAsReadOnlyListOfString(),  function(key){
			var tmpText = this.m_segmentedButtonItems.getByKey(key);
			var tmpSbItem = formItemSegmentedButton.addNewItem();
			tmpSbItem.setName(key);
			tmpSbItem.setText(tmpText);
		}.bind(this));
		if (this.getValue() !== null && this.m_segmentedButtonItems.containsKey(this.getModelValueAsString()))
		{
			formItemSegmentedButton.setSelectedName(this.getModelValueAsString());
		}
		else
		{
			formItemSegmentedButton.setSelectedItemByIndex(0);
		}
	}
};
oFF.UiFormItemSegmentedButton.prototype.onSelectionChange = function(event)
{
	this.handleItemValueChanged();
	this.handleItemBlured();
};

oFF.UiFormItemSwitch = function() {};
oFF.UiFormItemSwitch.prototype = new oFF.DfUiFormItemHorizontal();
oFF.UiFormItemSwitch.prototype._ff_c = "UiFormItemSwitch";

oFF.UiFormItemSwitch.create = function(genesis, key, value, text)
{
	var newFormItem = new oFF.UiFormItemSwitch();
	newFormItem.setupInternal(genesis, key, value, text);
	return newFormItem;
};
oFF.UiFormItemSwitch.prototype.releaseObject = function()
{
	oFF.DfUiFormItemHorizontal.prototype.releaseObject.call( this );
};
oFF.UiFormItemSwitch.prototype.setupInternal = function(genesis, key, value, text)
{
	this.setupFormItem(genesis, key, value, text);
};
oFF.UiFormItemSwitch.prototype.createFormItemUiControl = function(genesis)
{
	var formItemSwitch = genesis.newControl(oFF.UiType.SWITCH);
	formItemSwitch.setOn(this.getModelValueAsBoolean());
	formItemSwitch.setMargin(oFF.UiCssBoxEdges.create("0px 0.5rem 0px 0px"));
	formItemSwitch.registerOnChange(this);
	return formItemSwitch;
};
oFF.UiFormItemSwitch.prototype.isRequiredValid = function()
{
	return true;
};
oFF.UiFormItemSwitch.prototype.refreshModelValue = function()
{
	this.updateModelValueByBoolean(this.getSwitchControl().isOn());
};
oFF.UiFormItemSwitch.prototype.setInvalidState = function(reason)
{
	var formLabel = this.getFormLabel().getFormControl();
	formLabel.setFontColor(oFF.UiTheme.getCurrentTheme().getErrorColor());
	formLabel.setTooltip(reason);
};
oFF.UiFormItemSwitch.prototype.setValidState = function()
{
	var formLabel = this.getFormLabel().getFormControl();
	formLabel.setFontColor(null);
	formLabel.setTooltip(null);
};
oFF.UiFormItemSwitch.prototype.updateControlValue = function()
{
	this.getSwitchControl().setOn(this.getModelValueAsBoolean());
};
oFF.UiFormItemSwitch.prototype.getValueType = function()
{
	return oFF.XValueType.BOOLEAN;
};
oFF.UiFormItemSwitch.prototype.isEmpty = function()
{
	return false;
};
oFF.UiFormItemSwitch.prototype.setEditable = function(editable)
{
	this.getSwitchControl().setEnabled(editable);
	return this;
};
oFF.UiFormItemSwitch.prototype.setEnabled = function(enabled)
{
	this.getSwitchControl().setEnabled(enabled);
	return this;
};
oFF.UiFormItemSwitch.prototype.getSwitchControl = function()
{
	return this.getFormItemControl();
};
oFF.UiFormItemSwitch.prototype.onChange = function(event)
{
	this.handleItemValueChanged();
	this.handleItemBlured();
};

oFF.UiConfirmPopup = function() {};
oFF.UiConfirmPopup.prototype = new oFF.DfUiPopup();
oFF.UiConfirmPopup.prototype._ff_c = "UiConfirmPopup";

oFF.UiConfirmPopup.POPUP_TAG = "SuConfirmationDialog";
oFF.UiConfirmPopup.POPUP_CONFIRM_BTN_NAME = "SuConfirmationPopupConfirmBtn";
oFF.UiConfirmPopup.POPUP_CANCEL_BTN_NAME = "SuConfirmationPopupCancelBtn";
oFF.UiConfirmPopup.create = function(genesis, title, text)
{
	var newPopup = new oFF.UiConfirmPopup();
	newPopup.setupInternal(genesis, title, text);
	return newPopup;
};
oFF.UiConfirmPopup.prototype.m_title = null;
oFF.UiConfirmPopup.prototype.m_text = null;
oFF.UiConfirmPopup.prototype.m_confirmProcedure = null;
oFF.UiConfirmPopup.prototype.m_confirmBtn = null;
oFF.UiConfirmPopup.prototype.m_cancelBtn = null;
oFF.UiConfirmPopup.prototype.releaseObject = function()
{
	this.m_confirmBtn = oFF.XObjectExt.release(this.m_confirmBtn);
	this.m_cancelBtn = oFF.XObjectExt.release(this.m_cancelBtn);
	this.m_confirmProcedure = null;
	oFF.DfUiPopup.prototype.releaseObject.call( this );
};
oFF.UiConfirmPopup.prototype.setupInternal = function(genesis, title, text)
{
	this.m_title = title;
	this.m_text = text;
	this.setupPopup(genesis);
};
oFF.UiConfirmPopup.prototype.configurePopup = function(dialog)
{
	dialog.setTag(oFF.UiConfirmPopup.POPUP_TAG);
	dialog.setTitle(this.m_title);
	dialog.setWidth(oFF.UiCssLength.create("auto"));
	dialog.setMaxWidth(oFF.UiCssLength.create("600px"));
	dialog.setState(oFF.UiValueState.WARNING);
	this.m_confirmBtn = this.addButton(oFF.UiConfirmPopup.POPUP_CONFIRM_BTN_NAME, oFF.UiButtonType.PRIMARY, "Confirm", "sys-cancel-2", oFF.UiLambdaPressListener.create( function(controlEvent){
		this.confirmInternal();
	}.bind(this)));
	this.m_cancelBtn = this.addButton(oFF.UiConfirmPopup.POPUP_CANCEL_BTN_NAME, oFF.UiButtonType.DEFAULT, "Cancel", "sys-cancel-2", oFF.UiLambdaPressListener.create( function(controlEvent2){
		this.close();
	}.bind(this)));
};
oFF.UiConfirmPopup.prototype.buildPopupContent = function(genesis)
{
	var dlgLabel = genesis.newControl(oFF.UiType.LABEL);
	dlgLabel.setWrapping(true);
	dlgLabel.setText(this.m_text);
	genesis.setRoot(dlgLabel);
};
oFF.UiConfirmPopup.prototype.setConfirmProcedure = function(procedure)
{
	this.m_confirmProcedure = procedure;
};
oFF.UiConfirmPopup.prototype.setConfirmButtonText = function(text)
{
	if (oFF.notNull(this.m_confirmBtn))
	{
		this.m_confirmBtn.setText(text);
	}
};
oFF.UiConfirmPopup.prototype.setConfirmButtonIcon = function(icon)
{
	if (oFF.notNull(this.m_confirmBtn))
	{
		this.m_confirmBtn.setIcon(icon);
	}
};
oFF.UiConfirmPopup.prototype.setConfirmButtonType = function(btnType)
{
	if (oFF.notNull(this.m_confirmBtn))
	{
		this.m_confirmBtn.setButtonType(btnType);
	}
};
oFF.UiConfirmPopup.prototype.setCancelButtonText = function(text)
{
	if (oFF.notNull(this.m_cancelBtn))
	{
		this.m_cancelBtn.setText(text);
	}
};
oFF.UiConfirmPopup.prototype.setCancelButtonIcon = function(icon)
{
	if (oFF.notNull(this.m_cancelBtn))
	{
		this.m_cancelBtn.setIcon(icon);
	}
};
oFF.UiConfirmPopup.prototype.confirmInternal = function()
{
	if (oFF.notNull(this.m_confirmProcedure))
	{
		this.m_confirmProcedure();
	}
	this.close();
};
oFF.UiConfirmPopup.prototype.onAfterOpen = function(event) {};
oFF.UiConfirmPopup.prototype.onAfterClose = function(event) {};

oFF.UiErrorPopup = function() {};
oFF.UiErrorPopup.prototype = new oFF.DfUiPopup();
oFF.UiErrorPopup.prototype._ff_c = "UiErrorPopup";

oFF.UiErrorPopup.POPUP_TAG = "SuErrorDialog";
oFF.UiErrorPopup.POPUP_CLOSE_BTN_NAME = "SuErrorPopupCloseBtn";
oFF.UiErrorPopup.create = function(genesis, text)
{
	var newPopup = new oFF.UiErrorPopup();
	newPopup.setupInternal(genesis, text);
	return newPopup;
};
oFF.UiErrorPopup.prototype.m_text = null;
oFF.UiErrorPopup.prototype.m_closeBtn = null;
oFF.UiErrorPopup.prototype.releaseObject = function()
{
	this.m_closeBtn = oFF.XObjectExt.release(this.m_closeBtn);
	oFF.DfUiPopup.prototype.releaseObject.call( this );
};
oFF.UiErrorPopup.prototype.setupInternal = function(genesis, text)
{
	this.m_text = text;
	this.setupPopup(genesis);
};
oFF.UiErrorPopup.prototype.configurePopup = function(dialog)
{
	dialog.setTag(oFF.UiErrorPopup.POPUP_TAG);
	dialog.setTitle(this.getLocalization().getText(oFF.UiCommonI18n.ERROR));
	dialog.setWidth(oFF.UiCssLength.create("auto"));
	dialog.setMaxWidth(oFF.UiCssLength.create("25rem"));
	dialog.setState(oFF.UiValueState.ERROR);
	this.m_closeBtn = this.addButton(oFF.UiErrorPopup.POPUP_CLOSE_BTN_NAME, oFF.UiButtonType.PRIMARY, this.getLocalization().getText(oFF.UiCommonI18n.CLOSE), "", oFF.UiLambdaPressListener.create( function(controlEvent){
		this.close();
	}.bind(this)));
};
oFF.UiErrorPopup.prototype.buildPopupContent = function(genesis)
{
	var dlgLabel = genesis.newControl(oFF.UiType.LABEL);
	dlgLabel.setWrapping(true);
	dlgLabel.setText(this.m_text);
	genesis.setRoot(dlgLabel);
};
oFF.UiErrorPopup.prototype.setCloseButtonText = function(text)
{
	if (oFF.notNull(this.m_closeBtn))
	{
		this.m_closeBtn.setText(text);
	}
};
oFF.UiErrorPopup.prototype.setCloseButtonIcon = function(icon)
{
	if (oFF.notNull(this.m_closeBtn))
	{
		this.m_closeBtn.setIcon(icon);
	}
};
oFF.UiErrorPopup.prototype.setCloseButtonType = function(btnType)
{
	if (oFF.notNull(this.m_closeBtn))
	{
		this.m_closeBtn.setButtonType(btnType);
	}
};
oFF.UiErrorPopup.prototype.getLocalization = function()
{
	return oFF.UiLocalizationCenter.getCenter();
};
oFF.UiErrorPopup.prototype.onAfterOpen = function(event) {};
oFF.UiErrorPopup.prototype.onAfterClose = function(event) {};

oFF.UiFormPopup = function() {};
oFF.UiFormPopup.prototype = new oFF.DfUiPopup();
oFF.UiFormPopup.prototype._ff_c = "UiFormPopup";

oFF.UiFormPopup.POPUP_TAG = "SuFormPopup";
oFF.UiFormPopup.POPUP_SUBMIT_BTN_NAME = "SuFormPopupSubmitBtn";
oFF.UiFormPopup.POPUP_CANCEL_BTN_NAME = "SuFormPopupCancelBtn";
oFF.UiFormPopup.create = function(genesis, title, submitConsumer)
{
	var dialog = new oFF.UiFormPopup();
	dialog.setupFormPopup(genesis, title, submitConsumer);
	return dialog;
};
oFF.UiFormPopup.prototype.m_title = null;
oFF.UiFormPopup.prototype.m_submitConsumer = null;
oFF.UiFormPopup.prototype.m_form = null;
oFF.UiFormPopup.prototype.m_submitBtn = null;
oFF.UiFormPopup.prototype.m_cancelBtn = null;
oFF.UiFormPopup.prototype.m_mainLayout = null;
oFF.UiFormPopup.prototype.m_cancelBtnText = null;
oFF.UiFormPopup.prototype.m_cancelBtnIcon = null;
oFF.UiFormPopup.prototype.m_beforeSubmitPredicate = null;
oFF.UiFormPopup.prototype.m_afterOpenConsumer = null;
oFF.UiFormPopup.prototype.releaseObject = function()
{
	this.m_submitConsumer = null;
	this.m_beforeSubmitPredicate = null;
	this.m_afterOpenConsumer = null;
	this.m_form = oFF.XObjectExt.release(this.m_form);
	this.m_submitBtn = oFF.XObjectExt.release(this.m_submitBtn);
	this.m_cancelBtn = oFF.XObjectExt.release(this.m_cancelBtn);
	this.m_mainLayout = oFF.XObjectExt.release(this.m_mainLayout);
	oFF.DfUiPopup.prototype.releaseObject.call( this );
};
oFF.UiFormPopup.prototype.setupFormPopup = function(genesis, title, submitConsumer)
{
	this.m_title = title;
	this.m_submitConsumer = submitConsumer;
	this.setupPopup(genesis);
};
oFF.UiFormPopup.prototype.configurePopup = function(dialog)
{
	dialog.setTitle(this.m_title);
	dialog.setTag(oFF.UiFormPopup.POPUP_TAG);
	dialog.setWidth(oFF.UiCssLength.create("600px"));
	this.m_submitBtn = this.addButton(oFF.UiFormPopup.POPUP_SUBMIT_BTN_NAME, oFF.UiButtonType.PRIMARY, "Submit", "sys-enter-2", this);
	this.m_cancelBtn = this.addButton(oFF.UiFormPopup.POPUP_CANCEL_BTN_NAME, oFF.UiButtonType.DEFAULT, "Cancel", "sys-cancel-2", this);
};
oFF.UiFormPopup.prototype.buildPopupContent = function(genesis)
{
	this.m_form = oFF.UiForm.create(genesis);
	this.m_form.setItemEnterPressedConsumer( function(tmpItem){
		this.submitFormInternal();
	}.bind(this));
	genesis.setRoot(this.m_form.getView());
};
oFF.UiFormPopup.prototype.isValid = function()
{
	return this.m_form.isValid();
};
oFF.UiFormPopup.prototype.validate = function()
{
	this.m_form.validate();
};
oFF.UiFormPopup.prototype.setGap = function(gap)
{
	return this.m_form.setGap(gap);
};
oFF.UiFormPopup.prototype.getAllFormItems = function()
{
	return this.m_form.getAllFormItems();
};
oFF.UiFormPopup.prototype.getFormItemByKey = function(key)
{
	return this.m_form.getFormItemByKey(key);
};
oFF.UiFormPopup.prototype.removeFormItemByKey = function(key)
{
	return this.m_form.removeFormItemByKey(key);
};
oFF.UiFormPopup.prototype.hasFormItems = function()
{
	return this.m_form.hasFormItems();
};
oFF.UiFormPopup.prototype.clearFormItems = function()
{
	this.m_form.clearFormItems();
};
oFF.UiFormPopup.prototype.getFormControlByName = function(name)
{
	return this.m_form.getFormControlByName(name);
};
oFF.UiFormPopup.prototype.removeFormControlByName = function(name)
{
	return this.m_form.removeFormControlByName(name);
};
oFF.UiFormPopup.prototype.addInput = function(key, value, text, placeholder, inputType, valueHelpProcedure)
{
	return this.m_form.addInput(key, value, text, placeholder, inputType, valueHelpProcedure);
};
oFF.UiFormPopup.prototype.addSwitch = function(key, value, text)
{
	return this.m_form.addSwitch(key, value, text);
};
oFF.UiFormPopup.prototype.addCheckbox = function(key, value, text)
{
	return this.m_form.addCheckbox(key, value, text);
};
oFF.UiFormPopup.prototype.addDropdown = function(key, value, text, dropdownItems, addEmptyItem)
{
	return this.m_form.addDropdown(key, value, text, dropdownItems, addEmptyItem);
};
oFF.UiFormPopup.prototype.addComboBox = function(key, value, text, dropdownItems, addEmptyItem)
{
	return this.m_form.addComboBox(key, value, text, dropdownItems, addEmptyItem);
};
oFF.UiFormPopup.prototype.addSegmentedButton = function(key, value, text, segmentedButtonItems)
{
	return this.m_form.addSegmentedButton(key, value, text, segmentedButtonItems);
};
oFF.UiFormPopup.prototype.addRadioGroup = function(key, value, text, radioGroupItems)
{
	return this.m_form.addRadioGroup(key, value, text, radioGroupItems);
};
oFF.UiFormPopup.prototype.addFormSection = function(key, text, isHorizontal)
{
	return this.m_form.addFormSection(key, text, isHorizontal);
};
oFF.UiFormPopup.prototype.addFormButton = function(name, text, tooltip, icon, pressProcedure)
{
	return this.m_form.addFormButton(name, text, tooltip, icon, pressProcedure);
};
oFF.UiFormPopup.prototype.addFormLabel = function(name, text, tooltip)
{
	return this.m_form.addFormLabel(name, text, tooltip);
};
oFF.UiFormPopup.prototype.addFormTitle = function(name, text, tooltip)
{
	return this.m_form.addFormTitle(name, text, tooltip);
};
oFF.UiFormPopup.prototype.addFormCustomControl = function(name, customControl)
{
	return this.m_form.addFormCustomControl(name, customControl);
};
oFF.UiFormPopup.prototype.setSubmitConsumer = function(submitConsumer)
{
	this.m_submitConsumer = submitConsumer;
};
oFF.UiFormPopup.prototype.setAfterOpenConsumer = function(afterOpenConsumer)
{
	this.m_afterOpenConsumer = afterOpenConsumer;
};
oFF.UiFormPopup.prototype.setBeforeSubmitPredicate = function(beforeSubmitPredicate)
{
	this.m_beforeSubmitPredicate = beforeSubmitPredicate;
};
oFF.UiFormPopup.prototype.setReadOnly = function()
{
	this.getDialog().clearDialogButtons();
	this.m_submitBtn = oFF.XObjectExt.release(this.m_submitBtn);
	var cancelBtnText = oFF.XStringUtils.isNotNullAndNotEmpty(this.m_cancelBtnText) ? this.m_cancelBtnText : "Close";
	var cancelBtnIcon = oFF.XStringUtils.isNotNullAndNotEmpty(this.m_cancelBtnIcon) ? this.m_cancelBtnIcon : "accept";
	this.m_cancelBtn = this.addButton(oFF.UiFormPopup.POPUP_CANCEL_BTN_NAME, oFF.UiButtonType.PRIMARY, cancelBtnText, cancelBtnIcon, this);
};
oFF.UiFormPopup.prototype.setSubmitButtonText = function(text)
{
	if (oFF.notNull(this.m_submitBtn))
	{
		this.m_submitBtn.setText(text);
	}
};
oFF.UiFormPopup.prototype.setCancelButtonText = function(text)
{
	this.m_cancelBtnText = text;
	if (oFF.notNull(this.m_cancelBtn))
	{
		this.m_cancelBtn.setText(text);
	}
};
oFF.UiFormPopup.prototype.setSubmitButtonIcon = function(icon)
{
	if (oFF.notNull(this.m_submitBtn))
	{
		this.m_submitBtn.setIcon(icon);
	}
};
oFF.UiFormPopup.prototype.setCancelButtonIcon = function(icon)
{
	this.m_cancelBtnIcon = icon;
	if (oFF.notNull(this.m_cancelBtn))
	{
		this.m_cancelBtn.setIcon(icon);
	}
};
oFF.UiFormPopup.prototype.setPopupState = function(state)
{
	if (this.getDialog() !== null)
	{
		this.getDialog().setState(state);
	}
};
oFF.UiFormPopup.prototype.setWidth = function(length)
{
	if (this.getDialog() !== null)
	{
		this.getDialog().setWidth(length);
	}
};
oFF.UiFormPopup.prototype.submit = function()
{
	this.submitFormInternal();
};
oFF.UiFormPopup.prototype.getJsonModel = function()
{
	return this.m_form.getJsonModel();
};
oFF.UiFormPopup.prototype.submitFormInternal = function()
{
	if (oFF.isNull(this.m_beforeSubmitPredicate) || this.m_beforeSubmitPredicate(this.m_form))
	{
		this.m_form.submit();
		if (this.m_form.isValid())
		{
			if (oFF.notNull(this.m_submitConsumer))
			{
				this.m_submitConsumer(this.m_form.getJsonModel());
			}
			this.close();
		}
		else
		{
			this.getDialog().shake();
		}
	}
};
oFF.UiFormPopup.prototype.onPress = function(event)
{
	switch (event.getControl().getName())
	{
		case oFF.UiFormPopup.POPUP_SUBMIT_BTN_NAME:
			this.submitFormInternal();
			break;

		case oFF.UiFormPopup.POPUP_CANCEL_BTN_NAME:
			this.close();
			break;

		default:
	}
};
oFF.UiFormPopup.prototype.onAfterOpen = function(event)
{
	if (oFF.notNull(this.m_afterOpenConsumer))
	{
		this.m_afterOpenConsumer(this.m_form);
	}
	else if (this.m_form.getAllFormItems().hasElements())
	{
		this.m_form.getAllFormItems().get(0).focus();
	}
};
oFF.UiFormPopup.prototype.onAfterClose = function(event) {};

oFF.UiInputPopup = function() {};
oFF.UiInputPopup.prototype = new oFF.DfUiPopup();
oFF.UiInputPopup.prototype._ff_c = "UiInputPopup";

oFF.UiInputPopup.POPUP_TAG = "SuInputPopup";
oFF.UiInputPopup.create = function(genesis, title, text)
{
	var dialog = new oFF.UiInputPopup();
	dialog.setupInternal(genesis, title, text);
	return dialog;
};
oFF.UiInputPopup.prototype.m_title = null;
oFF.UiInputPopup.prototype.m_text = null;
oFF.UiInputPopup.prototype.m_inputConsumer = null;
oFF.UiInputPopup.prototype.m_okBtn = null;
oFF.UiInputPopup.prototype.m_input = null;
oFF.UiInputPopup.prototype.releaseObject = function()
{
	this.m_inputConsumer = null;
	this.m_input = oFF.XObjectExt.release(this.m_input);
	this.m_okBtn = oFF.XObjectExt.release(this.m_okBtn);
	oFF.DfUiPopup.prototype.releaseObject.call( this );
};
oFF.UiInputPopup.prototype.setupInternal = function(genesis, title, text)
{
	this.m_title = title;
	this.m_text = text;
	this.setupPopup(genesis);
};
oFF.UiInputPopup.prototype.configurePopup = function(dialog)
{
	dialog.setTitle(this.m_title);
	dialog.setTag(oFF.UiInputPopup.POPUP_TAG);
	dialog.setWidth(oFF.UiCssLength.create("600px"));
	this.m_okBtn = this.addButton(null, oFF.UiButtonType.PRIMARY, "Ok", "sys-enter-2", oFF.UiLambdaPressListener.create( function(controlEvent){
		this.fireConsumer();
	}.bind(this)));
	this.addButton(null, oFF.UiButtonType.DEFAULT, "Cancel", "sys-cancel-2", oFF.UiLambdaPressListener.create( function(controlEvent2){
		this.close();
	}.bind(this)));
};
oFF.UiInputPopup.prototype.buildPopupContent = function(genesis)
{
	var mainLayout = genesis.newControl(oFF.UiType.FLEX_LAYOUT);
	mainLayout.useMaxSpace();
	mainLayout.setDirection(oFF.UiFlexDirection.COLUMN);
	if (oFF.XStringUtils.isNotNullAndNotEmpty(this.m_text))
	{
		var dlgLabel = mainLayout.addNewItemOfType(oFF.UiType.LABEL);
		dlgLabel.setText(this.m_text);
	}
	this.m_input = mainLayout.addNewItemOfType(oFF.UiType.INPUT);
	this.m_input.registerOnEnter(oFF.UiLambdaEnterListener.create( function(controlEvent){
		this.fireConsumer();
	}.bind(this)));
	genesis.setRoot(mainLayout);
};
oFF.UiInputPopup.prototype.setInputConsumer = function(consumer)
{
	this.m_inputConsumer = consumer;
};
oFF.UiInputPopup.prototype.setInputValue = function(value)
{
	if (oFF.notNull(this.m_input))
	{
		this.m_input.setText(value);
	}
};
oFF.UiInputPopup.prototype.setInputPlaceholder = function(placeholder)
{
	if (oFF.notNull(this.m_input))
	{
		this.m_input.setPlaceholder(placeholder);
	}
};
oFF.UiInputPopup.prototype.selectText = function(startIndex, endIndex)
{
	if (oFF.notNull(this.m_input))
	{
		this.m_input.selectText(startIndex, endIndex);
	}
};
oFF.UiInputPopup.prototype.setOkButtonText = function(text)
{
	if (oFF.notNull(this.m_okBtn))
	{
		this.m_okBtn.setText(text);
	}
};
oFF.UiInputPopup.prototype.setOkButtonIcon = function(icon)
{
	if (oFF.notNull(this.m_okBtn))
	{
		this.m_okBtn.setIcon(icon);
	}
};
oFF.UiInputPopup.prototype.setOkButtonType = function(btnType)
{
	if (oFF.notNull(this.m_okBtn))
	{
		this.m_okBtn.setButtonType(btnType);
	}
};
oFF.UiInputPopup.prototype.fireConsumer = function()
{
	if (oFF.notNull(this.m_inputConsumer) && oFF.notNull(this.m_input))
	{
		this.m_inputConsumer(this.m_input.getText());
	}
	this.close();
};
oFF.UiInputPopup.prototype.onAfterOpen = function(event)
{
	if (oFF.notNull(this.m_input))
	{
		this.m_input.focus();
	}
};
oFF.UiInputPopup.prototype.onAfterClose = function(event) {};

oFF.UiToolsModule = function() {};
oFF.UiToolsModule.prototype = new oFF.DfModule();
oFF.UiToolsModule.prototype._ff_c = "UiToolsModule";

oFF.UiToolsModule.s_module = null;
oFF.UiToolsModule.getInstance = function()
{
	if (oFF.isNull(oFF.UiToolsModule.s_module))
	{
		oFF.DfModule.checkInitialized(oFF.UiModule.getInstance());
		oFF.DfModule.checkInitialized(oFF.RuntimeModule.getInstance());
		oFF.UiToolsModule.s_module = oFF.DfModule.startExt(new oFF.UiToolsModule());
		oFF.UiTheme.staticSetup();
		oFF.UiCommonI18n.staticSetup();
		oFF.DfModule.stopExt(oFF.UiToolsModule.s_module);
	}
	return oFF.UiToolsModule.s_module;
};
oFF.UiToolsModule.prototype.getName = function()
{
	return "ff2220.ui.tools";
};

oFF.UiToolsModule.getInstance();

return sap.firefly;
	} );