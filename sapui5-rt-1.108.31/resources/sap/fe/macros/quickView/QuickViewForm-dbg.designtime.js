/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define([], function () {
  "use strict";

  return {
    annotations: {
      /**
       * Describes the main information of the entity. This annotation is read for the navigation entity of the property, if present.
       * It is displayed in the header of the quickView card.
       *
       * <br>
       * <i>Example in OData V4 notation with HeaderInfo Data for Customer</i>
       *
       * <pre>
       * &lt;Annotations Target="com.c_salesordermanage_sd.Customer"&gt;
       *	  &lt;Annotation Term="UI.HeaderInfo"&gt
       *		 &lt;Record Type="UI.HeaderInfoType"&gt
       *			 &lt;PropertyValue Property="Description"&gt
       *				 &lt;Record Type="UI.DataField"&gt
       *				 	&lt;PropertyValue Property="Value" Path="CustomerName"/&gt
       *				 &lt;/Record&gt
       *			 &lt;/PropertyValue&gt
       *			 &lt;PropertyValue Property="Title"&gt
       *				 &lt;Record Type="UI.DataField"&gt
       *				 	&lt;PropertyValue Property="Value" Path="Customer"/&gt
       *				 &lt;/Record&gt
       *			 &lt;/PropertyValue&gt
       *			 &lt;PropertyValue Property="TypeName" String="Customer"/&gt
       *			 &lt;PropertyValue Property="TypeNamePlural" String="Customers"/&gt
       *			 &lt;PropertyValue Property="ImageUrl" Path="ImageUrl"/&gt
       *			 &lt;PropertyValue Property="Initials" Path="Initials"/&gt
       *		 &lt;/Record&gt
       *	 &lt;/Annotation&gt
       *	 &lt;/Annotations&gt
       * </pre>
       *
       * <br>
       * <i>HeaderInfo Type properties evaluated by this macro :</i>
       *
       * <ul>
       *   <li>Property <b>Title</b> <br/&gt
       *	   The title to be displayed in the pop up
       *   </li>
       *   <li>Property <b>Description</b><br/>
       *     Will be displayed below the title
       *   </li>
       *   <li>Property <b>ImageUrl</b><br/>
       *     The image in pop up header
       *   </li>
       *   <li>Property <b>Initials</b><br/>
       *     If the image is unavailable, the initials will be displayed
       *   </li>
       * </ul>
       * <br>
       * <i><b><u>Contact Documentation links</u></b></i>
       * <ul>
       *   <li>Namespace {@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/UI.md#HeaderInfoType  com.sap.vocabularies.UI.v1.HeaderInfo}
       *   </li>
       * </ul>
       */

      headerInfo: {
        namespace: "com.sap.vocabularies.UI.v1.HeaderInfo",
        annotation: "HeaderInfo",
        target: ["EntityType"],
        since: "1.75"
      },
      /**
       * Describes the facets that may be used for a quick overview of the object
       * It is displayed in the content of the quickView card.
       *
       * <br>
       * <i>Example in OData V4 notation with QuickViewFacets Data for Customer</i>
       *
       * <pre>
       * &lt;Annotations Target="com.c_salesordermanage_sd.Customer"&gt;
       *     &lt;Annotation Term="UI.QuickViewFacets"&gt
       *         &lt;Collection&gt
       *             &lt;Record Type="UI.ReferenceFacet"&gt
       *                 &lt;PropertyValue Property="Label" String="Address"/&gt
       *                 &lt;PropertyValue Property="Target" AnnotationPath="@Communication.Contact"/&gt
       *                 &lt;Annotation Term="UI.Hidden" Bool="false"/&gt
       *             &lt;/Record&gt
       *            &lt;Record Type="UI.ReferenceFacet"&gt
       *               &lt;PropertyValue Property="Label" String="Address"/&gt
       *                &lt;PropertyValue Property="Target" AnnotationPath="@UI.FieldGroup#SoldToQuickView"/&gt
       *            &lt;/Record&gt
       *         &lt;/Collection&gt
       *     &lt;/Annotation&gt
       * &lt;/Annotations&gt
       * </pre>
       *
       * <i><b><u>QuickViewFacets Documentation links</u></b></i>
       * <ul>
       *   <li>Namespace {@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/UI.md#QuickViewFacets com.sap.vocabularies.UI.v1.QuickViewFacets}
       *   </li>
       * </ul>
       */
      quickViewFacets: {
        namespace: "com.sap.vocabularies.UI.v1.QuickViewFacets",
        annotation: "QuickViewFacets",
        target: ["EntityType"],
        since: "1.75"
      },
      /**
       * This tag defines if the entity is represented a natural person and not a product/object entitty
       * It is read to decide the shape of the image in quiview card header - circular if true, otherwise square
       * It is also read to decide the fallback icon of the image : if no image and no initials are available, then a fallback icon will be displayed.
       *
       * <br>
       * <i>Example in OData V4 notation with isNaturalPerson Data for Customer</i>
       *
       * <pre>
       * &lt;Annotations Target="com.c_salesordermanage_sd.Customer"&gt;
       *     &lt;Annotation Term="Common.IsNaturalPerson" Bool="true"/&gt
       * &lt;/Annotations&gt
       * </pre>
       *
       * <i><b><u>IsNaturalPerson Documentation links</u></b></i>
       * <ul>
       *   <li>Namespace {@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/Common.md#IsNaturalPerson com.sap.vocabularies.Common.v1.IsNaturalPerson}
       *   </li>
       * </ul>
       */
      isNaturalPerson: {
        namespace: "com.sap.vocabularies.Common.v1.IsNaturalPerson",
        annotation: "IsNaturalPerson",
        target: ["EntityType"],
        since: "1.75"
      },
      /**
       * Defines a name of the <code>SemanticObject</code> represented as this entity type or identified by this property and is rendered as a link.
       *
       * <b>Note:</b> Navigation targets are determined using {@link sap.ushell.services.CrossApplicationNavigation CrossApplicationNavigation} of the unified shell service.
       *
       * <br>
       * <i>XML Example of OData V4 with SemanticObject annotation</i>
       * <pre>
       *   &lt;Annotations Target=&quot;ProductCollection.Product/Name&quot; xmlns=&quot;http://docs.oasis-open.org/odata/ns/edm&quot;&gt;
       *      &lt;Annotation Term=&quot;com.sap.vocabularies.Common.v1.SemanticObject&quot; String=&quot;Product&quot; /&gt;
       *   &lt;/Annotations&gt;
       * </pre>
       */
      semanticObject: {
        namespace: "com.sap.vocabularies.Common.v1",
        annotation: "SemanticObject",
        target: ["EntitySet", "EntityType", "Property"],
        since: "1.75"
      },
      /**
       * Maps properties of the annotated <code>EntityType</code> or sibling properties of the annotated property to properties of the
       * Semantic Object. This allows "renaming" of properties in the current context to match property names of the Semantic Object, e.g. SenderPartyID to PartyID.
       * Only properties explicitly listed in the mapping are renamed, all other properties are available for intent-based navigation with their "local" name.
       *
       * <br>
       * <i>XML Example of OData V4 with SemanticObjectMapping on Product/Name</i>
       *
       * <pre>
       *  &lt;Annotations Target=&quot;ProductCollection.Product/Name&quot; xmlns=&quot;http://docs.oasis-open.org/odata/ns/edm&quot;&gt;
       * 	    &lt;Annotation Term=&quot;com.sap.vocabularies.Common.v1.SemanticObject&quot; String=&quot;SemanticObjectName&quot; /&gt;
       * 	    &lt;Annotation Term=&quot;com.sap.vocabularies.Common.v1.SemanticObjectMapping&quot;&gt;
       * 		    &lt;Collection&gt;
       * 			    &lt;Record&gt;
       * 				    &lt;PropertyValue Property=&quot;LocalProperty&quot; PropertyPath=&quot;SupplierId&quot; /&gt;
       * 					&lt;PropertyValue Property=&quot;SemanticObjectProperty&quot; String=&quot;SupplierIdOfSemanticObjectName&quot; /&gt;
       * 				&lt;/Record&gt;
       * 			&lt;/Collection&gt;
       * 		&lt;/Annotation&gt;
       *  &lt;/Annotations&gt;
       * </pre>
       */
      semanticObjectMapping: {
        namespace: "com.sap.vocabularies.Common.v1",
        annotation: "SemanticObjectMapping",
        target: ["EntitySet", "EntityType", "Property"],
        defaultValue: null,
        since: "1.75"
      },
      /**
       * List of actions that are not available in the current state of the instance of the Semantic Object
       * The actions of this list will not be displayed in the list of links in the quick view cad.
       *
       * <br>
       * <i>XML Example of OData with SemanticObjectUnavailableActions on Product/CustomerId</i>
       *
       * <pre>
       *  &lt;Annotations Target=&quot;ProductCollection.Product/CustomerId&quot; xmlns=&quot;http://docs.oasis-open.org/odata/ns/edm&quot;&gt;
       * 	    &lt;Annotation Term=&quot;com.sap.vocabularies.Common.v1.SemanticObject&quot; String=&quot;CustomerSO&quot; /&gt;
       * 		&lt;Annotation Term=&quot;com.sap.vocabularies.Common.v1.SemanticObjectUnavailableActions&quot;&gt;
       * 			&lt;Collection&gt;
       * 				&lt;String&gt;DeleteCustomer&lt;String/&gt;
       * 			&lt;/Collection&gt;
       * 		&lt;/Annotation&gt;
       *  &lt;/Annotations&gt;
       * </pre>
       */
      semanticObjectUnavailableActions: {
        namespace: "com.sap.vocabularies.Common.v1",
        annotation: "SemanticObjectUnavailableActions",
        target: ["EntitySet", "EntityType", "Property"],
        defaultValue: null,
        since: "1.75"
      }
    }
  };
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhbm5vdGF0aW9ucyIsImhlYWRlckluZm8iLCJuYW1lc3BhY2UiLCJhbm5vdGF0aW9uIiwidGFyZ2V0Iiwic2luY2UiLCJxdWlja1ZpZXdGYWNldHMiLCJpc05hdHVyYWxQZXJzb24iLCJzZW1hbnRpY09iamVjdCIsInNlbWFudGljT2JqZWN0TWFwcGluZyIsImRlZmF1bHRWYWx1ZSIsInNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJRdWlja1ZpZXdGb3JtLmRlc2lnbnRpbWUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGRlZmF1bHQge1xuXHRhbm5vdGF0aW9uczoge1xuXHRcdC8qKlxuXHRcdCAqIERlc2NyaWJlcyB0aGUgbWFpbiBpbmZvcm1hdGlvbiBvZiB0aGUgZW50aXR5LiBUaGlzIGFubm90YXRpb24gaXMgcmVhZCBmb3IgdGhlIG5hdmlnYXRpb24gZW50aXR5IG9mIHRoZSBwcm9wZXJ0eSwgaWYgcHJlc2VudC5cblx0XHQgKiBJdCBpcyBkaXNwbGF5ZWQgaW4gdGhlIGhlYWRlciBvZiB0aGUgcXVpY2tWaWV3IGNhcmQuXG5cdFx0ICpcblx0XHQgKiA8YnI+XG5cdFx0ICogPGk+RXhhbXBsZSBpbiBPRGF0YSBWNCBub3RhdGlvbiB3aXRoIEhlYWRlckluZm8gRGF0YSBmb3IgQ3VzdG9tZXI8L2k+XG5cdFx0ICpcblx0XHQgKiA8cHJlPlxuXHRcdCAqICZsdDtBbm5vdGF0aW9ucyBUYXJnZXQ9XCJjb20uY19zYWxlc29yZGVybWFuYWdlX3NkLkN1c3RvbWVyXCImZ3Q7XG5cdFx0ICpcdCAgJmx0O0Fubm90YXRpb24gVGVybT1cIlVJLkhlYWRlckluZm9cIiZndFxuXHRcdCAqXHRcdCAmbHQ7UmVjb3JkIFR5cGU9XCJVSS5IZWFkZXJJbmZvVHlwZVwiJmd0XG5cdFx0ICpcdFx0XHQgJmx0O1Byb3BlcnR5VmFsdWUgUHJvcGVydHk9XCJEZXNjcmlwdGlvblwiJmd0XG5cdFx0ICpcdFx0XHRcdCAmbHQ7UmVjb3JkIFR5cGU9XCJVSS5EYXRhRmllbGRcIiZndFxuXHRcdCAqXHRcdFx0XHQgXHQmbHQ7UHJvcGVydHlWYWx1ZSBQcm9wZXJ0eT1cIlZhbHVlXCIgUGF0aD1cIkN1c3RvbWVyTmFtZVwiLyZndFxuXHRcdCAqXHRcdFx0XHQgJmx0Oy9SZWNvcmQmZ3Rcblx0XHQgKlx0XHRcdCAmbHQ7L1Byb3BlcnR5VmFsdWUmZ3Rcblx0XHQgKlx0XHRcdCAmbHQ7UHJvcGVydHlWYWx1ZSBQcm9wZXJ0eT1cIlRpdGxlXCImZ3Rcblx0XHQgKlx0XHRcdFx0ICZsdDtSZWNvcmQgVHlwZT1cIlVJLkRhdGFGaWVsZFwiJmd0XG5cdFx0ICpcdFx0XHRcdCBcdCZsdDtQcm9wZXJ0eVZhbHVlIFByb3BlcnR5PVwiVmFsdWVcIiBQYXRoPVwiQ3VzdG9tZXJcIi8mZ3Rcblx0XHQgKlx0XHRcdFx0ICZsdDsvUmVjb3JkJmd0XG5cdFx0ICpcdFx0XHQgJmx0Oy9Qcm9wZXJ0eVZhbHVlJmd0XG5cdFx0ICpcdFx0XHQgJmx0O1Byb3BlcnR5VmFsdWUgUHJvcGVydHk9XCJUeXBlTmFtZVwiIFN0cmluZz1cIkN1c3RvbWVyXCIvJmd0XG5cdFx0ICpcdFx0XHQgJmx0O1Byb3BlcnR5VmFsdWUgUHJvcGVydHk9XCJUeXBlTmFtZVBsdXJhbFwiIFN0cmluZz1cIkN1c3RvbWVyc1wiLyZndFxuXHRcdCAqXHRcdFx0ICZsdDtQcm9wZXJ0eVZhbHVlIFByb3BlcnR5PVwiSW1hZ2VVcmxcIiBQYXRoPVwiSW1hZ2VVcmxcIi8mZ3Rcblx0XHQgKlx0XHRcdCAmbHQ7UHJvcGVydHlWYWx1ZSBQcm9wZXJ0eT1cIkluaXRpYWxzXCIgUGF0aD1cIkluaXRpYWxzXCIvJmd0XG5cdFx0ICpcdFx0ICZsdDsvUmVjb3JkJmd0XG5cdFx0ICpcdCAmbHQ7L0Fubm90YXRpb24mZ3Rcblx0XHQgKlx0ICZsdDsvQW5ub3RhdGlvbnMmZ3Rcblx0XHQgKiA8L3ByZT5cblx0XHQgKlxuXHRcdCAqIDxicj5cblx0XHQgKiA8aT5IZWFkZXJJbmZvIFR5cGUgcHJvcGVydGllcyBldmFsdWF0ZWQgYnkgdGhpcyBtYWNybyA6PC9pPlxuXHRcdCAqXG5cdFx0ICogPHVsPlxuXHRcdCAqICAgPGxpPlByb3BlcnR5IDxiPlRpdGxlPC9iPiA8YnIvJmd0XG5cdFx0ICpcdCAgIFRoZSB0aXRsZSB0byBiZSBkaXNwbGF5ZWQgaW4gdGhlIHBvcCB1cFxuXHRcdCAqICAgPC9saT5cblx0XHQgKiAgIDxsaT5Qcm9wZXJ0eSA8Yj5EZXNjcmlwdGlvbjwvYj48YnIvPlxuXHRcdCAqICAgICBXaWxsIGJlIGRpc3BsYXllZCBiZWxvdyB0aGUgdGl0bGVcblx0XHQgKiAgIDwvbGk+XG5cdFx0ICogICA8bGk+UHJvcGVydHkgPGI+SW1hZ2VVcmw8L2I+PGJyLz5cblx0XHQgKiAgICAgVGhlIGltYWdlIGluIHBvcCB1cCBoZWFkZXJcblx0XHQgKiAgIDwvbGk+XG5cdFx0ICogICA8bGk+UHJvcGVydHkgPGI+SW5pdGlhbHM8L2I+PGJyLz5cblx0XHQgKiAgICAgSWYgdGhlIGltYWdlIGlzIHVuYXZhaWxhYmxlLCB0aGUgaW5pdGlhbHMgd2lsbCBiZSBkaXNwbGF5ZWRcblx0XHQgKiAgIDwvbGk+XG5cdFx0ICogPC91bD5cblx0XHQgKiA8YnI+XG5cdFx0ICogPGk+PGI+PHU+Q29udGFjdCBEb2N1bWVudGF0aW9uIGxpbmtzPC91PjwvYj48L2k+XG5cdFx0ICogPHVsPlxuXHRcdCAqICAgPGxpPk5hbWVzcGFjZSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1NBUC9vZGF0YS12b2NhYnVsYXJpZXMvYmxvYi9tYXN0ZXIvdm9jYWJ1bGFyaWVzL1VJLm1kI0hlYWRlckluZm9UeXBlICBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5IZWFkZXJJbmZvfVxuXHRcdCAqICAgPC9saT5cblx0XHQgKiA8L3VsPlxuXHRcdCAqL1xuXG5cdFx0aGVhZGVySW5mbzoge1xuXHRcdFx0bmFtZXNwYWNlOiBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkhlYWRlckluZm9cIixcblx0XHRcdGFubm90YXRpb246IFwiSGVhZGVySW5mb1wiLFxuXHRcdFx0dGFyZ2V0OiBbXCJFbnRpdHlUeXBlXCJdLFxuXHRcdFx0c2luY2U6IFwiMS43NVwiXG5cdFx0fSxcblx0XHQvKipcblx0XHQgKiBEZXNjcmliZXMgdGhlIGZhY2V0cyB0aGF0IG1heSBiZSB1c2VkIGZvciBhIHF1aWNrIG92ZXJ2aWV3IG9mIHRoZSBvYmplY3Rcblx0XHQgKiBJdCBpcyBkaXNwbGF5ZWQgaW4gdGhlIGNvbnRlbnQgb2YgdGhlIHF1aWNrVmlldyBjYXJkLlxuXHRcdCAqXG5cdFx0ICogPGJyPlxuXHRcdCAqIDxpPkV4YW1wbGUgaW4gT0RhdGEgVjQgbm90YXRpb24gd2l0aCBRdWlja1ZpZXdGYWNldHMgRGF0YSBmb3IgQ3VzdG9tZXI8L2k+XG5cdFx0ICpcblx0XHQgKiA8cHJlPlxuXHRcdCAqICZsdDtBbm5vdGF0aW9ucyBUYXJnZXQ9XCJjb20uY19zYWxlc29yZGVybWFuYWdlX3NkLkN1c3RvbWVyXCImZ3Q7XG5cdFx0ICogICAgICZsdDtBbm5vdGF0aW9uIFRlcm09XCJVSS5RdWlja1ZpZXdGYWNldHNcIiZndFxuXHRcdCAqICAgICAgICAgJmx0O0NvbGxlY3Rpb24mZ3Rcblx0XHQgKiAgICAgICAgICAgICAmbHQ7UmVjb3JkIFR5cGU9XCJVSS5SZWZlcmVuY2VGYWNldFwiJmd0XG5cdFx0ICogICAgICAgICAgICAgICAgICZsdDtQcm9wZXJ0eVZhbHVlIFByb3BlcnR5PVwiTGFiZWxcIiBTdHJpbmc9XCJBZGRyZXNzXCIvJmd0XG5cdFx0ICogICAgICAgICAgICAgICAgICZsdDtQcm9wZXJ0eVZhbHVlIFByb3BlcnR5PVwiVGFyZ2V0XCIgQW5ub3RhdGlvblBhdGg9XCJAQ29tbXVuaWNhdGlvbi5Db250YWN0XCIvJmd0XG5cdFx0ICogICAgICAgICAgICAgICAgICZsdDtBbm5vdGF0aW9uIFRlcm09XCJVSS5IaWRkZW5cIiBCb29sPVwiZmFsc2VcIi8mZ3Rcblx0XHQgKiAgICAgICAgICAgICAmbHQ7L1JlY29yZCZndFxuXHRcdCAqICAgICAgICAgICAgJmx0O1JlY29yZCBUeXBlPVwiVUkuUmVmZXJlbmNlRmFjZXRcIiZndFxuXHRcdCAqICAgICAgICAgICAgICAgJmx0O1Byb3BlcnR5VmFsdWUgUHJvcGVydHk9XCJMYWJlbFwiIFN0cmluZz1cIkFkZHJlc3NcIi8mZ3Rcblx0XHQgKiAgICAgICAgICAgICAgICAmbHQ7UHJvcGVydHlWYWx1ZSBQcm9wZXJ0eT1cIlRhcmdldFwiIEFubm90YXRpb25QYXRoPVwiQFVJLkZpZWxkR3JvdXAjU29sZFRvUXVpY2tWaWV3XCIvJmd0XG5cdFx0ICogICAgICAgICAgICAmbHQ7L1JlY29yZCZndFxuXHRcdCAqICAgICAgICAgJmx0Oy9Db2xsZWN0aW9uJmd0XG5cdFx0ICogICAgICZsdDsvQW5ub3RhdGlvbiZndFxuXHRcdCAqICZsdDsvQW5ub3RhdGlvbnMmZ3Rcblx0XHQgKiA8L3ByZT5cblx0XHQgKlxuXHRcdCAqIDxpPjxiPjx1PlF1aWNrVmlld0ZhY2V0cyBEb2N1bWVudGF0aW9uIGxpbmtzPC91PjwvYj48L2k+XG5cdFx0ICogPHVsPlxuXHRcdCAqICAgPGxpPk5hbWVzcGFjZSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1NBUC9vZGF0YS12b2NhYnVsYXJpZXMvYmxvYi9tYXN0ZXIvdm9jYWJ1bGFyaWVzL1VJLm1kI1F1aWNrVmlld0ZhY2V0cyBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5RdWlja1ZpZXdGYWNldHN9XG5cdFx0ICogICA8L2xpPlxuXHRcdCAqIDwvdWw+XG5cdFx0ICovXG5cdFx0cXVpY2tWaWV3RmFjZXRzOiB7XG5cdFx0XHRuYW1lc3BhY2U6IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuUXVpY2tWaWV3RmFjZXRzXCIsXG5cdFx0XHRhbm5vdGF0aW9uOiBcIlF1aWNrVmlld0ZhY2V0c1wiLFxuXHRcdFx0dGFyZ2V0OiBbXCJFbnRpdHlUeXBlXCJdLFxuXHRcdFx0c2luY2U6IFwiMS43NVwiXG5cdFx0fSxcblx0XHQvKipcblx0XHQgKiBUaGlzIHRhZyBkZWZpbmVzIGlmIHRoZSBlbnRpdHkgaXMgcmVwcmVzZW50ZWQgYSBuYXR1cmFsIHBlcnNvbiBhbmQgbm90IGEgcHJvZHVjdC9vYmplY3QgZW50aXR0eVxuXHRcdCAqIEl0IGlzIHJlYWQgdG8gZGVjaWRlIHRoZSBzaGFwZSBvZiB0aGUgaW1hZ2UgaW4gcXVpdmlldyBjYXJkIGhlYWRlciAtIGNpcmN1bGFyIGlmIHRydWUsIG90aGVyd2lzZSBzcXVhcmVcblx0XHQgKiBJdCBpcyBhbHNvIHJlYWQgdG8gZGVjaWRlIHRoZSBmYWxsYmFjayBpY29uIG9mIHRoZSBpbWFnZSA6IGlmIG5vIGltYWdlIGFuZCBubyBpbml0aWFscyBhcmUgYXZhaWxhYmxlLCB0aGVuIGEgZmFsbGJhY2sgaWNvbiB3aWxsIGJlIGRpc3BsYXllZC5cblx0XHQgKlxuXHRcdCAqIDxicj5cblx0XHQgKiA8aT5FeGFtcGxlIGluIE9EYXRhIFY0IG5vdGF0aW9uIHdpdGggaXNOYXR1cmFsUGVyc29uIERhdGEgZm9yIEN1c3RvbWVyPC9pPlxuXHRcdCAqXG5cdFx0ICogPHByZT5cblx0XHQgKiAmbHQ7QW5ub3RhdGlvbnMgVGFyZ2V0PVwiY29tLmNfc2FsZXNvcmRlcm1hbmFnZV9zZC5DdXN0b21lclwiJmd0O1xuXHRcdCAqICAgICAmbHQ7QW5ub3RhdGlvbiBUZXJtPVwiQ29tbW9uLklzTmF0dXJhbFBlcnNvblwiIEJvb2w9XCJ0cnVlXCIvJmd0XG5cdFx0ICogJmx0Oy9Bbm5vdGF0aW9ucyZndFxuXHRcdCAqIDwvcHJlPlxuXHRcdCAqXG5cdFx0ICogPGk+PGI+PHU+SXNOYXR1cmFsUGVyc29uIERvY3VtZW50YXRpb24gbGlua3M8L3U+PC9iPjwvaT5cblx0XHQgKiA8dWw+XG5cdFx0ICogICA8bGk+TmFtZXNwYWNlIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vU0FQL29kYXRhLXZvY2FidWxhcmllcy9ibG9iL21hc3Rlci92b2NhYnVsYXJpZXMvQ29tbW9uLm1kI0lzTmF0dXJhbFBlcnNvbiBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuSXNOYXR1cmFsUGVyc29ufVxuXHRcdCAqICAgPC9saT5cblx0XHQgKiA8L3VsPlxuXHRcdCAqL1xuXHRcdGlzTmF0dXJhbFBlcnNvbjoge1xuXHRcdFx0bmFtZXNwYWNlOiBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5Jc05hdHVyYWxQZXJzb25cIixcblx0XHRcdGFubm90YXRpb246IFwiSXNOYXR1cmFsUGVyc29uXCIsXG5cdFx0XHR0YXJnZXQ6IFtcIkVudGl0eVR5cGVcIl0sXG5cdFx0XHRzaW5jZTogXCIxLjc1XCJcblx0XHR9LFxuXHRcdC8qKlxuXHRcdCAqIERlZmluZXMgYSBuYW1lIG9mIHRoZSA8Y29kZT5TZW1hbnRpY09iamVjdDwvY29kZT4gcmVwcmVzZW50ZWQgYXMgdGhpcyBlbnRpdHkgdHlwZSBvciBpZGVudGlmaWVkIGJ5IHRoaXMgcHJvcGVydHkgYW5kIGlzIHJlbmRlcmVkIGFzIGEgbGluay5cblx0XHQgKlxuXHRcdCAqIDxiPk5vdGU6PC9iPiBOYXZpZ2F0aW9uIHRhcmdldHMgYXJlIGRldGVybWluZWQgdXNpbmcge0BsaW5rIHNhcC51c2hlbGwuc2VydmljZXMuQ3Jvc3NBcHBsaWNhdGlvbk5hdmlnYXRpb24gQ3Jvc3NBcHBsaWNhdGlvbk5hdmlnYXRpb259IG9mIHRoZSB1bmlmaWVkIHNoZWxsIHNlcnZpY2UuXG5cdFx0ICpcblx0XHQgKiA8YnI+XG5cdFx0ICogPGk+WE1MIEV4YW1wbGUgb2YgT0RhdGEgVjQgd2l0aCBTZW1hbnRpY09iamVjdCBhbm5vdGF0aW9uPC9pPlxuXHRcdCAqIDxwcmU+XG5cdFx0ICogICAmbHQ7QW5ub3RhdGlvbnMgVGFyZ2V0PSZxdW90O1Byb2R1Y3RDb2xsZWN0aW9uLlByb2R1Y3QvTmFtZSZxdW90OyB4bWxucz0mcXVvdDtodHRwOi8vZG9jcy5vYXNpcy1vcGVuLm9yZy9vZGF0YS9ucy9lZG0mcXVvdDsmZ3Q7XG5cdFx0ICogICAgICAmbHQ7QW5ub3RhdGlvbiBUZXJtPSZxdW90O2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5TZW1hbnRpY09iamVjdCZxdW90OyBTdHJpbmc9JnF1b3Q7UHJvZHVjdCZxdW90OyAvJmd0O1xuXHRcdCAqICAgJmx0Oy9Bbm5vdGF0aW9ucyZndDtcblx0XHQgKiA8L3ByZT5cblx0XHQgKi9cblx0XHRzZW1hbnRpY09iamVjdDoge1xuXHRcdFx0bmFtZXNwYWNlOiBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MVwiLFxuXHRcdFx0YW5ub3RhdGlvbjogXCJTZW1hbnRpY09iamVjdFwiLFxuXHRcdFx0dGFyZ2V0OiBbXCJFbnRpdHlTZXRcIiwgXCJFbnRpdHlUeXBlXCIsIFwiUHJvcGVydHlcIl0sXG5cdFx0XHRzaW5jZTogXCIxLjc1XCJcblx0XHR9LFxuXHRcdC8qKlxuXHRcdCAqIE1hcHMgcHJvcGVydGllcyBvZiB0aGUgYW5ub3RhdGVkIDxjb2RlPkVudGl0eVR5cGU8L2NvZGU+IG9yIHNpYmxpbmcgcHJvcGVydGllcyBvZiB0aGUgYW5ub3RhdGVkIHByb3BlcnR5IHRvIHByb3BlcnRpZXMgb2YgdGhlXG5cdFx0ICogU2VtYW50aWMgT2JqZWN0LiBUaGlzIGFsbG93cyBcInJlbmFtaW5nXCIgb2YgcHJvcGVydGllcyBpbiB0aGUgY3VycmVudCBjb250ZXh0IHRvIG1hdGNoIHByb3BlcnR5IG5hbWVzIG9mIHRoZSBTZW1hbnRpYyBPYmplY3QsIGUuZy4gU2VuZGVyUGFydHlJRCB0byBQYXJ0eUlELlxuXHRcdCAqIE9ubHkgcHJvcGVydGllcyBleHBsaWNpdGx5IGxpc3RlZCBpbiB0aGUgbWFwcGluZyBhcmUgcmVuYW1lZCwgYWxsIG90aGVyIHByb3BlcnRpZXMgYXJlIGF2YWlsYWJsZSBmb3IgaW50ZW50LWJhc2VkIG5hdmlnYXRpb24gd2l0aCB0aGVpciBcImxvY2FsXCIgbmFtZS5cblx0XHQgKlxuXHRcdCAqIDxicj5cblx0XHQgKiA8aT5YTUwgRXhhbXBsZSBvZiBPRGF0YSBWNCB3aXRoIFNlbWFudGljT2JqZWN0TWFwcGluZyBvbiBQcm9kdWN0L05hbWU8L2k+XG5cdFx0ICpcblx0XHQgKiA8cHJlPlxuXHRcdCAqICAmbHQ7QW5ub3RhdGlvbnMgVGFyZ2V0PSZxdW90O1Byb2R1Y3RDb2xsZWN0aW9uLlByb2R1Y3QvTmFtZSZxdW90OyB4bWxucz0mcXVvdDtodHRwOi8vZG9jcy5vYXNpcy1vcGVuLm9yZy9vZGF0YS9ucy9lZG0mcXVvdDsmZ3Q7XG5cdFx0ICogXHQgICAgJmx0O0Fubm90YXRpb24gVGVybT0mcXVvdDtjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuU2VtYW50aWNPYmplY3QmcXVvdDsgU3RyaW5nPSZxdW90O1NlbWFudGljT2JqZWN0TmFtZSZxdW90OyAvJmd0O1xuXHRcdCAqIFx0ICAgICZsdDtBbm5vdGF0aW9uIFRlcm09JnF1b3Q7Y29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlNlbWFudGljT2JqZWN0TWFwcGluZyZxdW90OyZndDtcblx0XHQgKiBcdFx0ICAgICZsdDtDb2xsZWN0aW9uJmd0O1xuXHRcdCAqIFx0XHRcdCAgICAmbHQ7UmVjb3JkJmd0O1xuXHRcdCAqIFx0XHRcdFx0ICAgICZsdDtQcm9wZXJ0eVZhbHVlIFByb3BlcnR5PSZxdW90O0xvY2FsUHJvcGVydHkmcXVvdDsgUHJvcGVydHlQYXRoPSZxdW90O1N1cHBsaWVySWQmcXVvdDsgLyZndDtcblx0XHQgKiBcdFx0XHRcdFx0Jmx0O1Byb3BlcnR5VmFsdWUgUHJvcGVydHk9JnF1b3Q7U2VtYW50aWNPYmplY3RQcm9wZXJ0eSZxdW90OyBTdHJpbmc9JnF1b3Q7U3VwcGxpZXJJZE9mU2VtYW50aWNPYmplY3ROYW1lJnF1b3Q7IC8mZ3Q7XG5cdFx0ICogXHRcdFx0XHQmbHQ7L1JlY29yZCZndDtcblx0XHQgKiBcdFx0XHQmbHQ7L0NvbGxlY3Rpb24mZ3Q7XG5cdFx0ICogXHRcdCZsdDsvQW5ub3RhdGlvbiZndDtcblx0XHQgKiAgJmx0Oy9Bbm5vdGF0aW9ucyZndDtcblx0XHQgKiA8L3ByZT5cblx0XHQgKi9cblx0XHRzZW1hbnRpY09iamVjdE1hcHBpbmc6IHtcblx0XHRcdG5hbWVzcGFjZTogXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjFcIixcblx0XHRcdGFubm90YXRpb246IFwiU2VtYW50aWNPYmplY3RNYXBwaW5nXCIsXG5cdFx0XHR0YXJnZXQ6IFtcIkVudGl0eVNldFwiLCBcIkVudGl0eVR5cGVcIiwgXCJQcm9wZXJ0eVwiXSxcblx0XHRcdGRlZmF1bHRWYWx1ZTogbnVsbCxcblx0XHRcdHNpbmNlOiBcIjEuNzVcIlxuXHRcdH0sXG5cdFx0LyoqXG5cdFx0ICogTGlzdCBvZiBhY3Rpb25zIHRoYXQgYXJlIG5vdCBhdmFpbGFibGUgaW4gdGhlIGN1cnJlbnQgc3RhdGUgb2YgdGhlIGluc3RhbmNlIG9mIHRoZSBTZW1hbnRpYyBPYmplY3Rcblx0XHQgKiBUaGUgYWN0aW9ucyBvZiB0aGlzIGxpc3Qgd2lsbCBub3QgYmUgZGlzcGxheWVkIGluIHRoZSBsaXN0IG9mIGxpbmtzIGluIHRoZSBxdWljayB2aWV3IGNhZC5cblx0XHQgKlxuXHRcdCAqIDxicj5cblx0XHQgKiA8aT5YTUwgRXhhbXBsZSBvZiBPRGF0YSB3aXRoIFNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zIG9uIFByb2R1Y3QvQ3VzdG9tZXJJZDwvaT5cblx0XHQgKlxuXHRcdCAqIDxwcmU+XG5cdFx0ICogICZsdDtBbm5vdGF0aW9ucyBUYXJnZXQ9JnF1b3Q7UHJvZHVjdENvbGxlY3Rpb24uUHJvZHVjdC9DdXN0b21lcklkJnF1b3Q7IHhtbG5zPSZxdW90O2h0dHA6Ly9kb2NzLm9hc2lzLW9wZW4ub3JnL29kYXRhL25zL2VkbSZxdW90OyZndDtcblx0XHQgKiBcdCAgICAmbHQ7QW5ub3RhdGlvbiBUZXJtPSZxdW90O2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5TZW1hbnRpY09iamVjdCZxdW90OyBTdHJpbmc9JnF1b3Q7Q3VzdG9tZXJTTyZxdW90OyAvJmd0O1xuXHRcdCAqIFx0XHQmbHQ7QW5ub3RhdGlvbiBUZXJtPSZxdW90O2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5TZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucyZxdW90OyZndDtcblx0XHQgKiBcdFx0XHQmbHQ7Q29sbGVjdGlvbiZndDtcblx0XHQgKiBcdFx0XHRcdCZsdDtTdHJpbmcmZ3Q7RGVsZXRlQ3VzdG9tZXImbHQ7U3RyaW5nLyZndDtcblx0XHQgKiBcdFx0XHQmbHQ7L0NvbGxlY3Rpb24mZ3Q7XG5cdFx0ICogXHRcdCZsdDsvQW5ub3RhdGlvbiZndDtcblx0XHQgKiAgJmx0Oy9Bbm5vdGF0aW9ucyZndDtcblx0XHQgKiA8L3ByZT5cblx0XHQgKi9cblx0XHRzZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9uczoge1xuXHRcdFx0bmFtZXNwYWNlOiBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MVwiLFxuXHRcdFx0YW5ub3RhdGlvbjogXCJTZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9uc1wiLFxuXHRcdFx0dGFyZ2V0OiBbXCJFbnRpdHlTZXRcIiwgXCJFbnRpdHlUeXBlXCIsIFwiUHJvcGVydHlcIl0sXG5cdFx0XHRkZWZhdWx0VmFsdWU6IG51bGwsXG5cdFx0XHRzaW5jZTogXCIxLjc1XCJcblx0XHR9XG5cdH1cbn07XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7U0FBZTtJQUNkQSxXQUFXLEVBQUU7TUFDWjtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O01BRUVDLFVBQVUsRUFBRTtRQUNYQyxTQUFTLEVBQUUsdUNBQXVDO1FBQ2xEQyxVQUFVLEVBQUUsWUFBWTtRQUN4QkMsTUFBTSxFQUFFLENBQUMsWUFBWSxDQUFDO1FBQ3RCQyxLQUFLLEVBQUU7TUFDUixDQUFDO01BQ0Q7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7TUFDRUMsZUFBZSxFQUFFO1FBQ2hCSixTQUFTLEVBQUUsNENBQTRDO1FBQ3ZEQyxVQUFVLEVBQUUsaUJBQWlCO1FBQzdCQyxNQUFNLEVBQUUsQ0FBQyxZQUFZLENBQUM7UUFDdEJDLEtBQUssRUFBRTtNQUNSLENBQUM7TUFDRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO01BQ0VFLGVBQWUsRUFBRTtRQUNoQkwsU0FBUyxFQUFFLGdEQUFnRDtRQUMzREMsVUFBVSxFQUFFLGlCQUFpQjtRQUM3QkMsTUFBTSxFQUFFLENBQUMsWUFBWSxDQUFDO1FBQ3RCQyxLQUFLLEVBQUU7TUFDUixDQUFDO01BQ0Q7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7TUFDRUcsY0FBYyxFQUFFO1FBQ2ZOLFNBQVMsRUFBRSxnQ0FBZ0M7UUFDM0NDLFVBQVUsRUFBRSxnQkFBZ0I7UUFDNUJDLE1BQU0sRUFBRSxDQUFDLFdBQVcsRUFBRSxZQUFZLEVBQUUsVUFBVSxDQUFDO1FBQy9DQyxLQUFLLEVBQUU7TUFDUixDQUFDO01BQ0Q7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7TUFDRUkscUJBQXFCLEVBQUU7UUFDdEJQLFNBQVMsRUFBRSxnQ0FBZ0M7UUFDM0NDLFVBQVUsRUFBRSx1QkFBdUI7UUFDbkNDLE1BQU0sRUFBRSxDQUFDLFdBQVcsRUFBRSxZQUFZLEVBQUUsVUFBVSxDQUFDO1FBQy9DTSxZQUFZLEVBQUUsSUFBSTtRQUNsQkwsS0FBSyxFQUFFO01BQ1IsQ0FBQztNQUNEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtNQUNFTSxnQ0FBZ0MsRUFBRTtRQUNqQ1QsU0FBUyxFQUFFLGdDQUFnQztRQUMzQ0MsVUFBVSxFQUFFLGtDQUFrQztRQUM5Q0MsTUFBTSxFQUFFLENBQUMsV0FBVyxFQUFFLFlBQVksRUFBRSxVQUFVLENBQUM7UUFDL0NNLFlBQVksRUFBRSxJQUFJO1FBQ2xCTCxLQUFLLEVBQUU7TUFDUjtJQUNEO0VBQ0QsQ0FBQztBQUFBIn0=