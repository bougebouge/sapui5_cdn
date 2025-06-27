/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["../DefBase"],function(t){"use strict";var e=t.extend("sap.gantt.def.gradient.LinearGradient",{metadata:{library:"sap.gantt",properties:{x1:{type:"string",defaultValue:"0"},y1:{type:"string",defaultValue:"0"},x2:{type:"string",defaultValue:"100"},y2:{type:"string",defaultValue:"15"}},aggregations:{stops:{type:"sap.gantt.def.gradient.Stop",multiple:true,singularName:"stop"}}}});e.prototype.getDefString=function(){var t="<linearGradient id='"+this.getId()+"' x1='"+this.getX1()+"' y1='"+this.getY1()+"' x2='"+this.getX2()+"' y2='"+this.getY2()+"'>";var e=this.getStops();for(var a=0;a<e.length;a++){t=t.concat(e[a].getDefString())}t=t.concat("</linearGradient>");return t};return e},true);
//# sourceMappingURL=LinearGradient.js.map