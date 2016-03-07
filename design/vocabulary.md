---
layout: post
title: Vocabularly
type: design
---

Shared vocabulary in UX is a way to make sure everyone is communicating effectively on a project. On Lyra, there are a lot of words used that have a different context outside of talking about Lyra. To prevent any confusion we have documented those words.

**primitive** -- Objects in Lyra that typically correspond to things found in a Vega specification. Every Primitive is assigned a unique ID and stored in a central registry in the Model. These IDs are used throughout the rest of the app, rather than storing references to the objects to prevent us introducing the memory leaks that plagued Lyra 1 (e.g., by holding onto old references). Many Lyra primitives also have a parent-child relationship. For example, data fields, data sets, and data pipelines are all primitives; data fields are children of data sets (i.e., a data set may contain many fields, but a field has only one parent data set), and data sets are children of data pipelines.

Other primitives include data transformations, scales, guides (axes and legends) and marks. Later on, they may include interaction and narrative components.



**mark** -- graphical primitives whose properties are bound to data fields. Lyra 1 supported the following mark types: rect, arc, area, symbol, line, text. Lyra 1 also had partial support for “group” marks. We called these layers, and they allow you to unpack nested/hierarchical data structures (e.g., to create a small multiples display). Some of Vega’s other mark types were rolled into one of the above (e.g., Vega supports a “image” mark but in Lyra, this was just a rect mark with an image background).



**inspectors** -- list all the properties associated with a particular primitive, along with corresponding widgets (textboxes, sliders, etc.) to modify their raw values. Useful for fine-grained manipulation. Fields that can accept a data binding are indicated by the grey-blue circle. Users can drop data fields directly onto properties in the inspector. Doing so, however, is an “expert” feature -- no production rules will be evaluated, and thus no defaults set.



**manipulators** -- additional marks added by Lyra that allow users to directly manipulate their visualization without relying on the inspectors. These include:

  **handles** -- found in all graphics/publishing programs, allows users to move, resize, rotate marks.

  **dropzones** -- cyan regions that overlay the canvas; users drop data fields onto dropzones. Doing so triggers the Lyra magic: production rules are run, scale inference is performed, and defaults are set. Lyra 1 supported dropzones for spatial properties (x, y, x2, y2, width, height), setting specific properties (text value for text marks), and faceting/grouping.
  With Lyra 2, I’ve tweaked the terminology slightly. Dropzone refers to the bubble cursor like effect (achieved via a voronoi decomposition) you see when dragging fields near possible targets. Instead now, with Lyra 2, the old “dropzones” are called “channels” (or “altchannels” which are shown when the shift key is pressed). Channels may be represented

  **connectors** -- diamond shaped manipulators that are found in diagramming applications (e.g., omnigraffle). In Lyra 1, they would appear around the selected mark when the user started dragging a new mark off the toolbar. Allow marks to be chained together (i.e., the geometry of the host serves as input data to the target).

  **rules** -- run when a data field is dropped over a dropzone. Involves compiling a Vega-Lite specification, analyzing the produced Vega spec, and merging it with the Lyra model/primitives.

  **signals** -- dynamic variables in a Vega specification; when their value is changed, Vega automatically re-renders the visualization. Lyra uses signals extensively to coordinate state between the visualization and Lyra without having to perform expensive re-parses for simple operations. For example, hardcoded values for mark properties (e.g., a fill of “steelblue”) are actually modeled as signal values. So, when we change these in a property inspector, or via a manipulator, these signal values are manipulated (and Vega re-renders the visualization automatically). When we export a visualization, Lyra resolves signals it has added and ensures that their values appear in the specification instead.
  See https://github.com/vega/vega/wiki/Signals and the interactive examples online: http://vega.github.io/vega-editor/?mode=vega&spec=brush

**hints** -- little popovers that appear across the app to clue the user to what magic Lyra is performing. See https://github.com/vega/lyra/issues/239 for screenshots.
