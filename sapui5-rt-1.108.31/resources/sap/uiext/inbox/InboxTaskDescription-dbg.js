 /*!
 * SAPUI5
 * (c) Copyright 2009-2022 SAP SE. All rights reserved.
 */

jQuery.sap.declare("sap.uiext.inbox.InboxTaskDescription");
jQuery.sap.declare("sap.uiext.inbox.InboxTaskDetails");
jQuery.sap.declare("sap.uiext.inbox.Inbox");

sap.ui.commons.FormattedTextView.extend("sap.uiext.inbox.InboxTaskDescription", {
    metadata: {
        properties: {
            wrapping: {type: "boolean",defaultValue: true},
            maxLines: {type: "int",defaultValue: 1}
        }
    },
    renderer: function(oRm, oControl) {
        sap.ui.commons.FormattedTextViewRenderer.render.apply(this, arguments);
    }
});

sap.uiext.inbox.InboxTaskDescription.prototype.setMaxLines = function(value) {
    this.setProperty('maxLines', value);
    var oFormattedTextViewDiv = this.getTextDomRef();
    if (oFormattedTextViewDiv) {
        if (this.getWrapping() && this.getMaxLines() > 0) {
            if (!this.canUseNativeLineClamp()) {
                this.clampHeight();
                jQuery(oFormattedTextViewDiv).css({"text-overflow": "ellipsis","overflow": "hidden","max-width": "100%"});
            } else {
                jQuery(oFormattedTextViewDiv).css({"display": "-webkit-box","-webkit-box-orient": "vertical","overflow": "hidden","-webkit-line-clamp": this.getMaxLines() + ""});
            }
        } else if (!this.getWrapping()) {
            jQuery(oFormattedTextViewDiv).css({"text-overflow": "ellipsis","overflow": "hidden","max-width": "100%","whitespace": "nowrap"});
        }
    }
    return this;
};

sap.uiext.inbox.InboxTaskDescription.prototype.onAfterRendering = function() {
	var oTaskDescriptionDiv = this.getTextDomRef();
	
	if(oTaskDescriptionDiv){
		if (this.getWrapping() && this.getMaxLines() > 0) {
			if(!this.canUseNativeLineClamp()){
				this.clampHeight()
				jQuery(oTaskDescriptionDiv).css({"text-overflow":"ellipsis","overflow":"hidden","max-width": "100%"});
			}else{
				jQuery(oTaskDescriptionDiv).css({"display":"-webkit-box","-webkit-box-orient":"vertical","overflow":"hidden", "-webkit-line-clamp": this.getMaxLines()+""});
			}
		}else if (!this.getWrapping()){
			jQuery(oTaskDescriptionDiv).css({"text-overflow":"ellipsis","overflow":"hidden","max-width": "100%", "whitespace" : "nowrap"});
		}	
    }
};



sap.uiext.inbox.InboxTaskDescription.hasNativeLineClamp = (function() {
    return (typeof document.documentElement.style.webkitLineClamp != 'undefined');
});


sap.uiext.inbox.InboxTaskDescription.prototype.canUseNativeLineClamp = function() {
    if (!sap.uiext.inbox.InboxTaskDescription.hasNativeLineClamp) {
        return false;
    }
    return true;
};

sap.uiext.inbox.InboxTaskDescription.prototype.getClampHeight = function(d) {
    var oTaskDescriptionDiv = oTaskDescriptionDiv || this.getTextDomRef();
    return this.getMaxLines() * this.getLineHeight(oTaskDescriptionDiv);
};

sap.uiext.inbox.InboxTaskDescription.prototype.getTextDomRef = function() {
 
	var oTaskDescriptionDiv = this.getDomRef();
    return oTaskDescriptionDiv && (oTaskDescriptionDiv.firstElementChild || oTaskDescriptionDiv);
};


sap.uiext.inbox.InboxTaskDescription.prototype.getLineHeight = function(d) {
    var oTaskDescriptionDiv = oTaskDescriptionDiv || this.getTextDomRef();
    if (!oTaskDescriptionDiv) {
        return ;
    }
    var oStyleObject = window.getComputedStyle(oTaskDescriptionDiv), iLineHeightValue = parseFloat(oStyleObject.lineHeight);
    if (!iLineHeightValue) {
        iLineHeightValue = parseFloat(oStyleObject.fontSize) * this.normalLineHeight;
    }
    var iLineHeight = Math.floor(iLineHeightValue);
    return iLineHeight;
};
sap.uiext.inbox.InboxTaskDescription.prototype.isClamped = function() {
    var oTaskDescriptionDiv = oTaskDescriptionDiv || this.getTextDomRef();
    if (!oTaskDescriptionDiv) {
        return ;
    }
    var sTaskDescriptionText = this.getHtmlText(true);
    var iClampHeight = this.getClampHeight(oTaskDescriptionDiv);
   
    var iTextLength = iTextLength || sTaskDescriptionText.length;
    oTaskDescriptionDiv.textContent = sTaskDescriptionText.slice(0, iTextLength);
    if (oTaskDescriptionDiv.scrollHeight > iClampHeight) {
        return true;
    }
    return false;
};

sap.uiext.inbox.InboxTaskDescription.prototype.removeClamp = function() {

    var oTaskDescriptionDiv = oTaskDescriptionDiv || this.getTextDomRef();
    if (!oTaskDescriptionDiv) {
        return
    }
    jQuery(oTaskDescriptionDiv).css("-webkit-line-clamp", '');
    jQuery(oTaskDescriptionDiv).css("max-height", '');
    jQuery(oTaskDescriptionDiv).css("height", 'auto');

};


sap.ui.core.Control.extend("sap.uiext.inbox.InboxTaskDetails", {
    metadata: {
        properties: {
			showMore : {type: "string",defaultValue: 'auto'
				
			}
		},
        
        aggregations: {
            fTV: {
                type: "sap.ui.commons.FormattedTextView",
                multiple: false,
                visibility: "public"
            },
            taskDescriptionLink: {
                type: "sap.ui.commons.Link",
                multiple: false,
                visibility: "hidden"
            }
        },
        events: {
            showMoreClick: {enablePreventDefault: true}
        }
    },
    
    init: function() {
    	var that = this;
    	this._oBundle = sap.ui.getCore().getLibraryResourceBundle("sap.uiext.inbox");
        this.setAggregation('taskDescriptionLink', new sap.ui.commons.Link({ text:  that._oBundle.getText("INBOX_SHOW_MORE_TEXT"), tooltip: that._oBundle.getText("INBOX_SHOW_MORE_LINK_TOOLTIP"),visible: false}).attachPress(jQuery.proxy(this.showMoreClick, this)));
    },
    
    renderer: {
        render: function(oRm, oControl) {
            
            oRm.write("<div");
            oRm.writeControlData(oControl);
            oRm.addClass("inboxTaskDetails");
            oRm.writeClasses();
            oRm.write(">");
            
            oRm.write("<div");
            oRm.addClass("fTV");
            oRm.writeClasses();
            oRm.writeStyles();
            oRm.write(">");
            oRm.renderControl(oControl.getAggregation("fTV"));
            oRm.write("</div>");
            
            if (oControl.getAggregation('taskDescriptionLink').getVisible()) {
                oRm.write("<div");
                oRm.addClass("taskDescriptionLink");
                oRm.writeClasses();
                oRm.writeStyles();
                oRm.write(">");
                oRm.renderControl(oControl.getAggregation("taskDescriptionLink"));
                oRm.write("</div>");
            }
            
            oRm.write("</div>");
        }
    
    },
    
    onAfterRendering: function() {
        var oFTV = this.getAggregation('fTV');
        if (this.getShowMore() === 'true' ||(oFTV.isClamped() && this.getShowMore() === 'auto')) {
            this.getAggregation('taskDescriptionLink').setVisible(true);
        
        } 
    },
    
    showMoreClick: function(oEvent) {
    	var _oBundle = sap.ui.getCore().getLibraryResourceBundle("sap.uiext.inbox");
    	var sShowMoreLinkText = _oBundle.getText("INBOX_SHOW_MORE_TEXT");
    	var sShowLessLinkText = _oBundle.getText("INBOX_SHOW_LESS_TEXT");
    	
        if (oEvent.getSource().getText() ===  sShowMoreLinkText) {
            oEvent.getSource().setText(_oBundle.getText("INBOX_SHOW_LESS_TEXT"));
            oEvent.getSource().setTooltip(_oBundle.getText("INBOX_SHOW_LESS_LINK_TOOLTIP"))
            this.fireShowMoreClick({text: sShowMoreLinkText});
        } else {
            oEvent.getSource().setText(sShowMoreLinkText);
            oEvent.getSource().setTooltip(_oBundle.getText("INBOX_SHOW_MORE_LINK_TOOLTIP"));
            this.fireShowMoreClick({text: sShowLessLinkText});
        }
    
    }

});


