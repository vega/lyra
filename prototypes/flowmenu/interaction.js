var svgm; //stores all active intermediate objects => svgm = d3.select("svg#vis")
var marks=[]; //intermediate link between the data, d3, and its dropzones
var markcount=0; //number of marks on screen, which increments any time a high-level mark is dropped onto the "region"

var dataset = []; //dataset for a mark
//var zonewidth=50; 
var n; //number of rows in your dataset
var allData=[]; //the entire CSV you imported
var markGroups=[]; //collection of MarkGroup objects

//colors10 used to cycle through background colors for markGroups
var colors10 = new Array("#1f77b4","#ff7f0e","#2ca02c","#d62728","#9467bd","#8c564b","#e377c2","#7f7f7f","#bcbd22","#17becf");
var activeMark = -1; //index of the active mark (the one whose property editor will work for)
var overMarks = false; //false if mouse is not over marks; true if mouse is over a mark group (to register clicks on non-marks)

//MARKGROUP OBJECT
function MarkGroup(markType) {
	this.scales = {}; //maps visual property -> scale object
	this.majorParameter = undefined; //major encoded parameter
	this.majorScale = undefined; //major scale
	this.majorAxis = undefined; //major axis, either xscale or yscale
	this.xScale = undefined; //xscale = makeQuantScale(xscaleselection, xdatacolumn, newwidth);
	this.yScale = undefined; //yscale = makeQuantScale(yscaleselection, ydatacolumn, newheight);
//	this.xParameter = "Data Index";
//	this.yParameter = "Data Index";
	this.radius = 50; //DEFAULT radius
	this.height = 100; //DEFAULT height
	this.width = 50; //DEFAULT width
	this.type = markType; //type of MarkGroup, namely: rect, arc, scatter
	
	//adds to scales array
	this.addScale = function(property, newscale) {
		this.scales[property] = newscale;
	}
}



//SCALE OBJECT
function Scale(scaleobj, colorscale, markType, columnName) {
	this.scaleobj = scaleobj;
	this.colorscale = colorscale;
	this.type = markType;
	this.columnName = columnName;
}



//MENUS ARRAY
var menus = {
			"rect":
							{"height":
								["linear","logarithmic"],
							"width":
								["linear","logarithmic"],
							"fill":
								["Pallet A","Pallet B","Pallet C"],
							"stroke":
								["Pallet A","Pallet B","Pallet C"]}, 
								
			"arc":
							{"angle":
								["linear","logarithmic"],
							"inner radius":
								["linear","logarithmic"],
							"outer radius":
								["linear","logarithmic"],
							"fill":
								["Pallet A","Pallet B","Pallet C"],
							"stroke":
								["Pallet A","Pallet B","Pallet C"]},
								
			"scatter":
							{"x":
								["linear","logarithmic"],
							"y":
								["linear","logarithmic"],
							"radius":
								["linear","logarithmic"],								
//							"shape":
//								["circle"],								
							"fill":
								["Pallet A","Pallet B","Pallet C"],
							"stroke":
								["Pallet A","Pallet B","Pallet C"]}, 								
			};


			
var menulabels;
var extents;




//CONVENIENCE METHOD TO GET THE MARK NUMBER OF A SELECTOR
function getMarkNum(selector) {
	return selector.attr("id").split("_")[1];
}




//GIVEN ALL THE DATA (OBJECTARRAY) AND A COLUMN NAME (LIKE "FEMALE COUNT"), RETURNS THE NUMBERS FOR FEMALE COUNT
function dataObjectsToColumn(objectArray,colname){
	var column=[];
	for(var i in objectArray) {
		column.push(objectArray[i][colname]);
	}
	return column;
}



//GRABBED THIS UTILITY FUNCTION ONLINE TO CONVERT RGB TO HEX VALUES
function rgb2hex(rgb) {
	console.log("RGB: " + rgb);
	
  rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\).*$/);

  function hex(x) {
  	return ("0" + parseInt(x).toString(16)).slice(-2);
  }
  return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
}



function setPropertyEditorDefaults() {
	//If there is a "note" active
	if($("div#note_" + activeMark).length==1) {
		$("input#barFillColor").val(rgb2hex($("div#note_" + activeMark).css("color")));
		$("input#barStrokeColor").val(rgb2hex($("div#note_" + activeMark).css("background-color")));
		
		fontSz = $("div#note_" + activeMark).css("font-size");
		fontSz = parseInt(fontSz.split("px")[0]);
		$("input#updateFontSize").val(fontSz);
		
		leftPos = $("div#note_" + activeMark).css("left");
		leftPos = parseInt(leftPos.split("px")[0]);
		$("input#updateXPos").val(leftPos); //leftPos-213 hardcoded
		
		topPos = $("div#note_" + activeMark).css("top");
		topPos = parseInt(topPos.split("px")[0]);
		$("input#updateYPos").val(topPos); //topPos-112 hardcoded
	} 
	
	//Otherwise, the active mark is not a "note"
	else {
		var markType = markGroups[activeMark].type;
		var markD3 = d3.select("g#mark_" + activeMark + "_group");
		var markJQ = $("g#mark_" + activeMark + "_group");		
		var tSpecs = transformSpecs(markD3[0][0]); //get translateX, translateY, {scaleX, scaleY}
		
		//TODO: get axis text props here
		
		switch(markType) {
			
			case "rect":
				var rect = markD3.select("rect.realmark");
				var axis = $(".axis_" + activeMark); 
				$("input#barFillColor").val(rect.attr("fill"));
				$("input#barStrokeColor").val(rect.attr("stroke"));
				
				if(axis.length>0){
				fontSz = axis.css("font-size");
				fontSz = parseInt(fontSz.split("px")[0]); 
				$("input#updateFontSize").val(fontSz); }
				
				$("input#updateXPos").val(tSpecs[0]);
				
				$("input#updateYPos").val(tSpecs[1]);
			break;
			
			case "arc":
				var myarcgroup = markD3.select("g.arc");
							console.log(myarcgroup[0][0]);
				var singlearc = myarcgroup.selectAll("path"); 	// if this is a select, bad bad things happen, d3 bug?
				$("input#barFillColor").val(singlearc.attr("fill"));
				$("input#barStrokeColor").val(singlearc.attr("stroke"));
				
				fontSz = markJQ.css("font-size");
				fontSz = parseInt(fontSz.split("px")[0]);
				$("input#updateFontSize").val(fontSz);
				
				$("input#updateXPos").val(tSpecs[0]);
				
				$("input#updateYPos").val(tSpecs[1]);			
			
				singlearc = 0;
			break;
		}

		//TODO: Do this for other marks besides text marks
	}
}




//EVERYTHING TO DO WHEN THE DOCUMENT LOADS
$(document).ready(function(){
		
	//Bar Width Slider Receive Events
// 	$("input#barWidthSlider").change(function() {
// 		v = $("input#barWidthSlider").val();
// 		
// 		maxWidth = $("g.mark" + activeMark).data("maxWidth");
// 		console.log("MAX WIDTH: " + maxWidth);
// 		
// 		
// 		v = maxWidth/n*v/100;
// 		console.log("V: " + v);
// 	});


	
	$("rect.guideline").hide();
	//Toggle Guidelines
	$("input#toggleGuidelines").click(function() {
		console.log("HERE");
		if($("rect.guideline").eq(0).css("display") == "none") {
			$(this).val("TURN OFF");
		} else {
			$(this).val("TURN ON");
		}
		$("rect.guideline").toggle();
	});

	//Property Editor Change: Bar Fill Color
	$("input#barFillColor").change(function() {
		v = $("input#barFillColor").val();
		
		if(activeMark==-1) { return; } //only change the active mark; if there is no active mark, activeMark set to -1
		

		if($("div#note_" + activeMark).length==1) {
			$("div#note_" + activeMark).css("color", v); //change color of "note"
		} 
		else {
			v = $("input#barFillColor").val();
			var markType = markGroups[activeMark].type;
			
			switch(markType) {
				case "rect" :
					updateRectMarks(activeMark, undefined, undefined, "fill", undefined, "logarithmic", v);
				break;
				
				case "arc" :
					updateArcMarks(activeMark, undefined, "fill", undefined, undefined, v);
				break;
			}
		}
	});
	
	
	//Property Editor Change: Bar Stroke Color
	$("input#barStrokeColor").change(function() {
		v = $("input#barStrokeColor").val();
		
		if(activeMark==-1) { return; } //only change the active mark; if there is no active mark, activeMark set to -1
		
		if($("div#note_" + activeMark).length==1) {
			$("div#note_" + activeMark).css("backgroundColor", v); //change background color of "note"
		} 
		else {
			v = $("input#barStrokeColor").val();
			var markType = markGroups[marknum].type;
			
			switch(markType) {
				case "rect" :
					updateRectMarks(activeMark, undefined, undefined, "stroke", undefined, "logarithmic", v);
				break;
				
				case "arc" :
					updateArcMarks(activeMark, undefined, "fill", undefined, undefined, v);
				break;
			}
		}
	});
	
	
	
	//Property Editor Change: Text Size
	$("input#updateFontSize").change(function() {
		if(activeMark==-1) { return; } //only change the active mark; if there is no active mark, activeMark set to -1
		
		
		if($("div#note_" + activeMark).length==1) {
			$("div#note_" + activeMark).css("font-size", $("input#updateFontSize").val() + "px");
		} else {
			$(".axis_" + activeMark).css("font-size", $("input#updateFontSize").val() + "px");
		}

	});
	
	
	//Property Editor Change: X Position
	$("input#updateXPos").change(function() {
		v = parseInt($("input#updateXPos").val());
		
		if($("div#note_" + activeMark).length==1) {
			$("div#note_" + activeMark).css("left", v); //v+213 hardcoded
		} else {
			tSpecs = transformSpecs($("g#mark_" + activeMark + "_group"));
			$("g#mark_" + activeMark + "_group").attr("transform", "translate(" + v + "," + tSpecs[1] + ")");
			positionAxes(activeMark);			
		}
	});

	
	//Property Editor Change: Y Position
	$("input#updateYPos").change(function() {
		v = parseInt($("input#updateYPos").val());

		if($("div#note_" + activeMark).length==1) {
			$("div#note_" + activeMark).css("top", v); //v+112 hardcoded
		} else {
			tSpecs = transformSpecs($("g#mark_" + activeMark + "_group"));
			$("g#mark_" + activeMark + "_group").attr("transform", "translate(" + tSpecs[0] + "," + v + ")");
			positionAxes(activeMark);			
		}
	});
	
	
	createDraggableIcons();	//create draggable icons (the top-level marks)

	
	

	//READ IN DATA FROM CSV FILE AND POPULATE LIST OF COLUMNS OF DATA VARIABLE NAMES
	d3.csv("./olympics.csv", function(response) {
		for (var i in response) {
			allData[i]={};
			for(var attr in response[0]) {
				if(attr==="ISO country code" || attr === "Country name" || attr === "Continent") {
					allData[i][attr] = response[i][attr];
				} else {
					allData[i][attr] = +response[i][attr]; //data holds number
				}
			}
			allData[i]["Data Index"] = +i; //include data index as variable as well
		}

		//populate list of columns
		for(var label in allData[0]) {
			var newelement=$("<li class='column'></li>");
			newelement.text(label);
			newelement.addClass(isNaN(allData[0][label]) ? "ordinal" : "quantitative");
			newelement.appendTo($("#data ul"));
		}

		//column class for each variable in the data
		$(".column").draggable({
			
			//When you start to drag a column, position its flow menu and text anchors appropriately
			start:function(event,ui){
				$(".menudivGroup").each(function(index) {		
					positionFlowMenu($(this).attr("id"));					
				});		

				$(".textanchor").each(function(i) {
					var marknum = getMarkNum($(this));
					if(markGroups[marknum].majorParameter !== undefined) {
						positionAnnotations(marknum);	
						$(this).show();
					}
				});
				
				//make its top-level flow menu DIVs visible
				$(".menudiv").css("visibility", "visible");	
				$(".menudivGroup").css("visibility", "visible");			
			},
			
			//make its top-level flow menu DIVs invisible/hidden
			stop:function(event,ui){
				$(".menudiv").css("visibility", "hidden");
				$(".menudivGroup").css("visibility", "hidden");
				$(".textanchor").hide();
			},
			
			helper: "clone"
		});
	});
	//END OF READING IN DATA
	
	
	

	//MARK BOXES AT TOP OF SCREEN	
  $(".mark").draggable()
						.draggable("option", "revert", "invalid") 
						.draggable("option", "helper", "clone"); //duplicate of draggable moves with cursor
						
	//When you drag an axismark...
	$(".axismark").draggable({
		revert:"invalid",
		
		helper:"clone",
		
		start:function(event,ui){
			$(".axisanchor").each(function(index) { //do so for everything of class axisanchor
				var marknum = getMarkNum($(this));
				positionAnnotations(marknum); //position annotations for the mark num
			});
			
			//only show allowed anchors
			$(".axisanchor").each(function(index) {
				var myid = $(this).attr("id");
				var marknum = getMarkNum($(this));
				var anchornum = +myid.split("_")[2];
				if(markGroups[marknum].majorParameter==="width" && (anchornum===1 || anchornum===3)) return;
				if(markGroups[marknum].majorParameter==="height" && (anchornum===0 || anchornum===2)) return;
				//TODO: change to support axes
				$(this).show();
			});
		},
		
		stop:function(event,ui){
			$(".axisanchor").hide(100); //necessary or drop won't register
		}
	
	});
	

	//When region is clicked, an active mark is no longer active
	$("div#region").click(function() {
		$(".note").draggable("enable"); //needed for text mark
		
		
		$(".note").each(function(){
			if($(this).text().length === 0) $(this).remove(); //clean empty marks
		});
		
		
		//Check if mouse over a markGroup since the region will intercept those click events too
		if(!overMarks) {
			d3.selectAll("#region .container").attr("opacity",0); //set all containers to transparent
			
			$("div.note").css("border", "1px solid #fff");
			$("div.note").removeClass("selectedNote");

			activeMark = -1; //reset activeMark status to -1
		}
	});
	
	
	
	
	//Region is everything below the marks div								
  $("#region").droppable({
		accept: ".mark",
		
		drop: function(event,ui) {
			var x,y;
			var dragged=ui.draggable;
			var visarea = $("#vis");
			x=event.pageX - visarea.offset().left; //TODO: remove if absolute positioning?
			y=event.pageY - visarea.offset().top; //TODO: remove if absolute positioning?
			xmlns = "http://www.w3.org/2000/svg";
			
			//Specifically handle text marks
			if(dragged.hasClass("textmark")) {
				var markID = $(dragged).attr("id").split("_")[1];
				svgm = d3.select("svg#vis");
				var textbox=$("<div class='note' id='note_" + markcount + "' style='position:absolute' contenteditable=true>Lorem Ipsum</div>");
				
				//Event handlers for textboxes
				textbox.focusin(function() {
					$(this).css("cursor", "text");
					var marknum = getMarkNum($(this));
					activeMark = marknum;
					setPropertyEditorDefaults();
					$(this).css("border", "2px solid " + colors10[marknum]);
					$(this).addClass("selectedNote");
				});
				
				textbox.focusout(function() {
					console.log("FOCUS OUT");
					$(this).css("cursor", "move");
				});
				
				textbox.mouseover(function() {
					if(!$(this).hasClass("selectedNote")) {
						$(this).css("border", "1px dashed #888");
						$(this).css("cursor", "move");
					} else {
						$(this).css("cursor", "text");
					}
					overMarks = true;
				});
				
				textbox.mouseout(function() {
					overMarks = false;
					if(!$(this).hasClass("selectedNote")) {
						$(this).css("border", "1px solid #fff");
					}
				});
				
				textbox.css("left", event.pageX + "px");
				textbox.css("top", event.pageY + "px");
				
				textbox.draggable();
				textbox.click(function(){
					textbox.draggable("disable");
					textbox.removeClass("ui-state-disabled"); // removes greying
				});
				
				textbox.appendTo($("body"));

				markcount++;
				markGroups.push(new MarkGroup("textbox"));
					
				return;
			}
			
			//If the dragged item is a mark
			if(dragged.hasClass("mark")) {
				var markID = $(dragged).attr("id").split("_")[1];
				svgm = d3.select("svg#vis");

				dataset=[];
				n=allData.length;

				for(var i=0; i<n;i++) {
					dataset.push(1);
				}

				createMarks(x,y,markcount,markID); //make mark svg element group and elements
				createMenus(markID,markcount); //make 1st and 2nd level menus for each graph
				createAnnotations(markID,markcount);
				
				markcount++;
			}
		}
	});

});
//END OF EVERYTHING TO DO WHEN THE DOCUMENT LOADS












//CREATE DRAGGABLE ICONS (THE TOP LEVEL MARKS)
var createDraggableIcons = function() {
		//Make arc icon
		var arc = d3.svg.arc();
		var dragmark = 	d3.select("#arcdrag");
		var group = dragmark.append("g");
		arc.startAngle(.1);
		arc.endAngle(1.2);
		arc.outerRadius(30);
		arc.innerRadius(0);
		group.attr("transform","translate(15,40)");
		group.append("path").attr("d", arc); 
		
		//Make axis icon
		var axis = d3.svg.axis();
		var dragmark = 	d3.select("#axisdrag");
		var group = dragmark.append("g");
		var normalscale = d3.scale.linear();
			normalscale.domain([0,5]).range([35,0]);
			axis.orient("left");
			
		axis.scale(normalscale);
		axis.ticks(5);
		group.attr("height",50);
		group.attr("transform","translate(25,8)");		
		group.call(axis);	
		
		//Make rect icon
		var dragmark = d3.select("#rectdrag");
		dragmark.append("rect")
				.attr("height",35)
				.attr("width",15)
				.attr("x",17.5)
				.attr("y",7.5);
				
		//Make scatter icon
		var dragmark = d3.select("#scatterdrag");
		var tempdata = [2, 1, 3, 2, 4, 6, 8, 6];
		var tempsymbol = d3.svg.symbol();
		tempsymbol.size(5);
		dragmark.selectAll("path").data(tempdata).enter().append("svg:path")
				.attr("transform",function(d,i)	// position
				{
					return "translate("+ (5*i + 5) + ","+ (50 - 5*tempdata[i] ) +")"; // 10*i
				})
				.attr("d", tempsymbol);
}








//CREATE ANNOTATIONS: CLOSE ICON & TEXT ANCHORS
var createAnnotations = function(markID,markcount) {
	
	//CLOSE ICON
	var closeicon=$("<div class='closeicon' id='closeicon_" + markcount + "' style='position:absolute;'>X</div>");
	
	closeicon.mouseenter(function() {
		var marknum = getMarkNum($(this));
		$(this).show();
		updateBackgroundHighlight(marknum, .3);
	});
	
	closeicon.click(function() {
		var marknum = getMarkNum($(this));
		destroyMark(marknum);
	});
	
	$("body").append(closeicon);
	closeicon.hide();
	
	
	//TEXT ANCHORS
	createTextAnchors(markcount);
	
	var axisanchor;
	
	for(var axisanchornum=0; axisanchornum<4; axisanchornum++) {
		axisanchor = $("<div class='axisanchor axisanchor_" + markcount + "' id='axisanchor_" + markcount + "_" + axisanchornum + "' style='position:absolute;'></div>")
	
		axisanchor.droppable({
			accept:".axismark",
			
			drop:function(event,ui) {
				
				//create axis
				var myid = $(this).attr("id");
				var marknum = getMarkNum($(this));
				var anchornum = +myid.split("_")[2];

				//no double axes
				if($("#axis_" + marknum + "_" + anchornum).length > 0) return;

				// bounce out for weird axes
//				if(markGroups[marknum].majorParameter==="width" && (anchornum===1 || anchornum===3)) return;
//				if(markGroups[marknum].majorParameter==="height" && (anchornum===0 || anchornum===2)) return;							
	
				var axisgroup = d3.select("#vis").append("g");
				axisgroup.classed("axis",true);
				axisgroup.classed("axis_" + marknum, true);				
				axisgroup.attr("id", "axis_" + marknum + "_" + anchornum);
				
				// make the axis itself draggable for customization / deletion
				$(axisgroup[0][0]).draggable({
					drag:function(e, ui) {
						dx = parseInt(ui.position.left - mouseX2);
						dy = parseInt(ui.position.top - mouseY2);

						var target;
						target=d3.select(this);
						
						var marknum = getMarkNum($(this));

						t = "translate(" + parseInt(groupX2+dx) + "," + parseInt(groupY2+dy) + ") ";
						$(e.target).attr("transform", t);					
					},
					
					start: function(e, ui) {
					//	isDragging = true;
						tSpecs2 = transformSpecs(e.target);					
						mouseX2 = parseInt(ui.position.left);
						mouseY2 = parseInt(ui.position.top);

						groupX2 = parseInt(tSpecs2[0]);
						groupY2 = parseInt(tSpecs2[1]);
					}
				});

				
			positionAxis($(axisgroup[0][0]));
				
			},
			tolerance:"pointer"
		});
	
		$("body").append(axisanchor);
		axisanchor.hide();
	}
}





var createTextAnchors = function(markcount) {
	var textanchor;
	
	for(var textanchornum=0; textanchornum<3; textanchornum++) {
		textanchor =  $("<div class='textanchor textanchor_" + markcount + "' id='textanchor_" + markcount + "_" + textanchornum + "' style='position:absolute'></div>")
	
		textanchor.droppable({
			accept:".column",
			
			drop:function(event,ui) {
				//create axis
				var myid = $(this).attr("id");
				var marknum = getMarkNum($(this));
				var anchornum = +myid.split("_")[2];

				// no double notes
//				if($("#text_" + marknum + "_" + anchornum).length > 0) return;

				// bounce out for weird axes
//				if(markGroups[marknum].majorParameter==="width" && (anchornum===1 || anchornum===3)) return;
//				if(markGroups[marknum].majorParameter==="height" && (anchornum===0 || anchornum===2)) return;	
						
				var colname = ui.draggable.text(); //column name of data		
				var datacolumn = dataObjectsToColumn(allData,colname);

				var markgroup;
				if($(".textcont_" + marknum) !== undefined) {
					markgroup = svgm.append("g");
					markgroup.classed("textcont_" + marknum,true);					
				}
				
				markgroup = d3.select(".textcont_" + marknum);
				markgroup.selectAll(".text_" + marknum + "_" + anchornum).data(datacolumn).enter().append("text").classed("text",true)
								.classed("text_" + marknum,true)
								.classed("text_" + marknum + "_" + anchornum,true);

				var textelems = svgm.selectAll(".text_" + marknum + "_" + anchornum);

				textelems.attr("id",function(d,i){ return "text_" + marknum + "_" + anchornum + "_" + i;});
				textelems.text(function(d,i){ return d;});
				
				positionTextAnnotations(marknum);
				
				$(".textanchor").hide();

/*				for(var textanchornum=0; textanchornum<3; textanchornum++)
				{
					var anchor = $("#textanchor_" + marknum + "_" + textanchornum);	
					var x,y;

					x = minx+visarea.offset().left+ +curmark.attr("x")+"px";
					switch(textanchornum){
						case 0:
							// top
							y = miny+ visarea.offset().top + +curmark.attr("y") - 10 + "px";
						break;
						case 1:
							// middle
							y = miny+visarea.offset().top + +curmark.attr("y") + .5*+curmark.attr("height")+"px";
						break;
						case 2:
							// bottom
							y = miny+visarea.offset().top + +curmark.attr("y") + +curmark.attr("height") + "px";		
						break;
									
					}
				
					anchor.css("left",x);
					anchor.css("top", y);
				}
				
				// make the axis itself draggable for customization / deletion
				$(text[0][0]).draggable(
				{
					drag:function(e, ui)
					{

				//		tSpecs2 = transformSpecs(e.target);
						
						dx = parseInt(ui.position.left - mouseX2);
						dy = parseInt(ui.position.top - mouseY2);

						var target;
						target=d3.select(this);
						console.log
						var marknum = $(this).attr("id").split("_")[1];	


						t = "translate(" + parseInt(groupX2+dx) + "," + parseInt(groupY2+dy) + ") ";
						$(e.target).attr("transform", t);					
					},
					start: function(e, ui) {
					//	isDragging = true;
						tSpecs2 = transformSpecs(e.target);					
						mouseX2 = parseInt(ui.position.left);
						mouseY2 = parseInt(ui.position.top);

						groupX2 = parseInt(tSpecs2[0]);
						groupY2 = parseInt(tSpecs2[1]);
					}
				});
			*/
				
	//		positionAxis($(axisgroup[0][0]));
				
			},
			tolerance:"pointer"
		});
	
		$("body").append(textanchor);
		textanchor.hide();
	}
}




//CREATE FLOW MENUS
var createMenus=function(markID,markcount) {
	
	var menudivs = [];
	var menulabels=d3.keys(menus[markID]); //top level menu items
	
	var menuitem;

	//append menudivGroup to body
	$("body").append("<div style='position:absolute' class='menudivGroup' id='menudivGroup_" + markcount + "'></div>");
	
	positionFlowMenu("menudivGroup_" + markcount);
	$("div#menudivGroup_" + markcount).css("visibility", "hidden");
	
	//For each top-level menu item
	for(var divnum=0; divnum<menulabels.length; divnum++) {
		menuitem=$("<div class='menudiv_" + markcount + " menudiv' id='menudiv_" + markcount + "_" + divnum + "' style='position:relative'>" + menulabels[divnum]+ "<div class='menuArrow'>&#9654;</div>" + "</div>");
		
		menuitem.data("vizAttribute", menulabels[divnum]);

		menudivs.push(menuitem);
		menuitem.appendTo($("div#menudivGroup_" + markcount));
		menuitem.css("visibility", "hidden");

		menuitem.droppable({
			accept: ".column",
			
			drop: dropSubMenu,
			
			activate:function(event,ui){ },
			
			over:function(event,ui){
				var myid = $(this).attr("id");
				var marknum = getMarkNum($(this));
				var menuindex = myid.split("_")[2];
				
				$("div.menudiv").removeClass("hoverselected");
				$(this).addClass("hoverselected");

				//hide so that events do not register on its children
				$("div.submenudivGroup").hide();
				$("div.submenudivGroup").css("visibility", "hidden");
				$("#submenudivGroup_" + marknum + "_" + menuindex).css("visibility", "visible");
				$("#submenudivGroup_" + marknum + "_" + menuindex).show();
				
				//disable/enable droppable optiondiv
				//$("div.optiondiv").droppable("disable");
				//$("div.optiondiv_" + marknum + "_" + menuindex).droppable("enable");
				
				//make all optiondiv not highlighted except first one of this group!!
				$("div.optiondiv").removeClass("hoverselected");
				$(this).children().eq(1).children().eq(0).addClass("hoverselected");
			},
			
			out:function(event,ui){}
		});
		
		menuitem.droppable("option","tolerance","pointer");
		menuitem.append("<div class='submenudivGroup' id='submenudivGroup_" +markcount+ "_" +divnum+ "'></div>");

		//need to keep it hidden, but need to "show" so that "over" will work
		$("div.submenudivGroup").css("visibility", "hidden");
		$("div#submenudivGroup_" +markcount+ "_" +divnum).show();
		
		//Make a 2nd level menu for each 1st level menu
		var optionslist = menus[markID][menulabels[divnum]];
		
		for(var optionnum=0; optionnum<optionslist.length; optionnum++) {
			option=$("<div class='optiondiv_" + markcount + "_" + divnum + " optiondiv' id='optiondiv_" + markcount + "_" + divnum + "_" + optionnum + "' style='position:relative;'>" + optionslist[optionnum]+ "</div>");

			$("div#submenudivGroup_" +markcount+ "_" + divnum).append(option);
					
			option.droppable({
				accept: ".column",
				
				drop: dropSubMenu,
				
				activate: {},
				
				deactivate:function(event,ui){
					//need to keep it hidden, but need to "show" so that "over" will work
					$("div.submenudivGroup").css("visibility", "hidden");
					$("div.submenudivGroup").show();
				},
				
				//*over* does not register unless shown at drag start
				over:function(event,ui){
					//console.log("OVER");
					//if($(this).parent().css("visibility")=="visible")
					$(this).addClass("hoverselected");
				}, 
				
				out:function(event,ui){
					//console.log("OUT");
					$(this).removeClass("hoverselected");
				}				
			});
			
			option.droppable("option","tolerance","touch");
		}
	}
}






var positionAnnotations = function(marknum) {
	positionCloseIcon(marknum);
	positionAxisAnchor(marknum);
	positionTextAnchors(marknum);
	positionTextAnnotations(marknum);
}




var hideAnnotations = function(marknum) {
	$("#closeicon_" + marknum).hide();	
	$(".axisanchor_" + marknum).hide();
}



var positionCloseIcon = function(marknum) {
	var icon = $("#closeicon_" + marknum);
	
	var markgroup = d3.select(".mark" + marknum);		
	var cleantrans = markgroup.attr("transform").substring(10).split(")")[0].split(",");
	var wh = getDimensions($("g.mark" + marknum));
	
	var minx = +cleantrans[0];
	var miny = +cleantrans[1];
	var visarea = $("#vis");
	var markType = markGroups[marknum].type;
	
	switch(markType) {
		case "rect":
			icon.css("left",(minx+visarea.offset().left+wh[0]-20)+"px");
			icon.css("top",miny+visarea.offset().top + "px");
		break;
		
		case "arc":
			var radius = markGroups[marknum].radius;
			icon.css("left",(minx+visarea.offset().left+Math.cos(45)*radius)+"px");
			icon.css("top",miny+visarea.offset().top-Math.sin(45)*radius + "px");
		break;
		
		case "scatter":
			icon.css("left",(minx+visarea.offset().left+wh[0]-40)+"px");
			icon.css("top",miny+visarea.offset().top + "px");
		break;
	}	
}




var positionTextAnchors = function(marknum) {
	var markgroup = d3.select(".mark" + marknum);		
	var cleantrans = markgroup.attr("transform").substring(10).split(")")[0].split(",");
	var wh = getDimensions($("g.mark" + marknum));
	var minx = +cleantrans[0];
	var miny = +cleantrans[1];
	var visarea = $("#vis");
	var markType = markGroups[marknum].type;

	if(markType==="rect"){
		var curmark = d3.select(markgroup.selectAll("rect.realmark")[0][Math.floor(n/2)]);
		
		for(var textanchornum=0; textanchornum<3; textanchornum++) {
			var anchor = $("#textanchor_" + marknum + "_" + textanchornum);	
			var x,y;

			x = minx+visarea.offset().left+ +curmark.attr("x")+"px";
			
			switch(textanchornum){
				//top
				case 0:
					y = miny+ visarea.offset().top + +curmark.attr("y") - 10 + "px";
				break;
				
				//middle
				case 1:
					y = miny+visarea.offset().top + +curmark.attr("y") + .5*+curmark.attr("height")+"px";
				break;
				
				//bottom
				case 2:
					y = miny+visarea.offset().top + +curmark.attr("y") + +curmark.attr("height") + "px";		
				break;		
			}
		
			anchor.css("left",x);
			anchor.css("top", y);
		}
	}
}







var positionTextAnnotations = function(marknum) {
	var parentgroup = d3.select(".mark" + marknum);
	var parenttrans = transformSpecs($(parentgroup[0][0]));

	var markgroup = d3.select(".mark" + marknum);
	var textmarkgroup = d3.selectAll(".textcont_" + marknum);

	if(textmarkgroup[0].length < 1) { return; }
	
	textmarkgroup.attr("transform","translate(" + parenttrans[0]+"," + parenttrans[1]+")");

	markgroup.selectAll("rect.realmark").each(function(d,i) {
		var curmark = d3.select(this);
		var myx = +d3.select(this).attr("x");
		var myy = +d3.select(this).attr("y");	
		var x;
		var y;
		var wh = getDimensions($("g.mark" + marknum));

		for(var anchornum=0; anchornum<3; anchornum++){
			var textelems = textmarkgroup.selectAll(".text_" + marknum + "_" + anchornum);
			
			if(textelems[0].length < 1) { continue; }
			
			var textbbox = getDimensions($(textelems[0][i]));
			var textanchornum = +d3.select(textelems[0][i]).attr("id").split("_")[2];		

			x=myx ;//+ .5*(wh[0]/(n+1)-textbbox[0]); // + .5*wh[0]/n;
			y=myy;
			
			switch(textanchornum){
				//top
				case 0:
					y = myy - 5;
				break;
				
				//middle
				case 1:
					y = myy + .5*Math.floor(+curmark.attr("height"));
				break;
				
				//bottom	
				case 2:
					y = myy + Math.floor(+curmark.attr("height")) + 15;		
				break;			
			}

			d3.select(textelems[0][i]).transition().duration(0).attr("x",x).attr("y",y);
		}
	});
}






var positionAxisAnchor = function(marknum) {
	var markgroup = d3.select(".mark" + marknum);		
	var cleantrans = markgroup.attr("transform").substring(10).split(")")[0].split(",");
	var wh = getDimensions($("g.mark" + marknum));
	var minx = +cleantrans[0];
	var miny = +cleantrans[1];
	var visarea = $("#vis");
	var markType = markGroups[marknum].type;
	
	for(var axisanchornum=0; axisanchornum<4; axisanchornum++) {
		var anchor = $("#axisanchor_" + marknum + "_" + axisanchornum);	
		var x,y;
		
		switch(axisanchornum){
			//north
			case 0:
				x = minx+visarea.offset().left+.5*wh[0]+"px";
				y = miny+visarea.offset().top - 15 + "px";
			break;
			
			//east
			case 1:
				x = minx+visarea.offset().left+wh[0]+"px";
				y = miny+visarea.offset().top + .5*wh[1]+"px";
			break;
			
			//south
			case 2:
				x = minx+visarea.offset().left+.5*wh[0]+"px";
				y = miny+visarea.offset().top + wh[1] + "px";		
			break;
			
			//west
			case 3:
				x = minx+visarea.offset().left-15 + "px";
				y = miny+visarea.offset().top + .5*wh[1]+"px";		
			break;		
		}
	
		switch(markType) {
			case "rect":
				anchor.css("left",x);
				anchor.css("top", y);
			break;
			
			case "arc":
				//TODO: handle this case
			break;
				
			case "scatter":
				anchor.css("left",x);
				anchor.css("top", y);	
			break;
		}
	}
}






//POSITION TOP-LEVEL FLOW MENU
var positionFlowMenu = function(id) {
	var menuitem = $("#" + id);
	var marknum = id.split("_")[1];
	
	var markgroup = d3.select(".mark" + marknum);		
	var cleantrans = markgroup.attr("transform").substring(10).split(")")[0].split(",");
	var wh = getDimensions($("g.mark" + marknum));
	var minx = +cleantrans[0];
	var miny = +cleantrans[1];
	var visarea = $("#vis");
	var markType = markGroups[marknum].type;
	
	switch(markType) {
		case "rect":
			menuitem.css("left",(minx+visarea.offset().left+.5*wh[0])+"px");
			menuitem.css("top",miny+visarea.offset().top+wh[1]+20 + "px");
		break;
		
		case "arc":
			menuitem.css("left",(minx+visarea.offset().left)+"px");
			menuitem.css("top",miny+visarea.offset().top+.5*wh[1]+20 + "px");
		break;
		
		case "scatter":	
			menuitem.css("left",(minx+visarea.offset().left+.5*wh[0])+"px");
			menuitem.css("top",miny+visarea.offset().top+wh[1]+20 + "px");
		break;
	}	
}




//CREATE MARKS
var createMarks = function(x, y, markcount, markType) {
	
	switch(markType) {
		case "rect":
			var rectcont = svgm.append("g")
				.classed("mark" + markcount, true)
				.classed("rectmark", true)
				.attr("transform", "translate(" + x + "," + y + ")")
				.attr("id","mark_" + markcount + "_group");
	
			rectcont.selectAll("rect")
				.data(dataset)
				.enter()
				.append("rect")
				.attr("height",100)
				.attr("width",50)
				.attr("x",0)
				.attr("y",0)	
				.attr("fill", function(d,i) {
					return "#4682B4"; })
				.attr("fill-opacity", function(d,i) {
					return 1; })
	 			.attr("stroke", function(d,i) {
	 				return "#cccccc"; })
				.attr("stroke-width", function(d,i) {
					return 2; })
				.classed("realmark",true);
			
			rectcont.append("rect")
				.classed("container",true);
			
			markGroups.push(new MarkGroup("rect"));
		break;
		
		case "arc":
			var donut = d3.layout.pie(),
			arc = d3.svg.arc().innerRadius(0).outerRadius(50);
	
			var arcscont=svgm.append("g")
				.data([dataset])
				.attr("class","mark" + markcount)
				.classed("arcmark",true)
				.attr("transform", "translate(" + x + "," + y + ")")
				.attr("stroke","#cccccc")
				.attr("stroke-width","2")
				.attr("id","mark_" + markcount + "_group");	
				
			arcscont.append("circle")
				.classed("container",true);	
			
			var arcs=arcscont
				.selectAll(".mark" + markcount + " g.arc")
				.data(donut)
				.enter().append("g")		
				.attr("class", "arc");
				
			arcs.append("path")
				.attr("fill", "#4682B4")
				.attr("stroke","#cccccc")				
				.attr("d", arc)
				.classed("realmark",true);
			
			markGroups.push(new MarkGroup("arc"));
		
		break;
		
		case "scatter":
			var scattercont = svgm.append("g")
				.classed("mark" + markcount,true)
				.classed("scattermark",true)
				.attr("transform", "translate(" + x + "," + y + ")")
				.attr("id","mark_" + markcount + "_group");
				
			var symbol = d3.svg.symbol();
			var yscale = d3.scale.linear()
				.domain([0, n-1])
				.range([0, 100]);
			
			scattercont.selectAll("path")
				.data(dataset)
				.enter()
				.append("svg:path")
				.attr("fill", function(d,i) {
					return "#4682B4"; })
				.attr("fill-opacity", function(d,i) {
					return 1; })
				.attr("stroke", function(d,i) {
					return "#cccccc"; })
				.attr("stroke-width", function(d,i) {
					return 2; })
				.classed("realmark",true)
				.attr("transform",function(d,i)	{
					//position
					return "translate("+ yscale(i) + ","+ yscale(i)+")"; // 10*i
				})
				.attr("d", symbol);
				
			scattercont.append("rect") //shape
				.classed("container",true);
				
			var markgroup = new MarkGroup("scatter");
			markgroup.addScale("x", new Scale(yscale, undefined, "linear", "Data Index"));
			markgroup.addScale("y", new Scale(yscale, undefined, "linear", "Data Index"));				
			markGroups.push(markgroup);									
		break;
	}
	
	mouseX = 0;
	mouseY = 0;
	groupX = 0;
	groupY = 0;
	groupW = 0;
	groupH = 0;
	groupSX = 1;
	groupSY = 1;
	isDragging = false;
	
	
	//G MARK GROUP - INCLUDING WHAT TO DO WHEN IN DRAGS
	$("g.mark" + markcount).draggable({
		drag: function(e, ui) {
			$('body').css('cursor', scaleMode);
			tSpecs = transformSpecs(e.target);
			
			dx = parseInt(ui.position.left - mouseX);
			dy = parseInt(ui.position.top - mouseY);
			
			var target;
			target=d3.select(this)
			var marknum = getMarkNum($(this));
			
			if(target.classed("rectmark")) {
				switch(scaleMode) {
					case "move":
						t = "translate(" + parseInt(groupX+dx) + "," + parseInt(groupY+dy) + ") ";							
						$(e.target).attr("transform", t);
						updateRectMarks(marknum, undefined, undefined);	 // TODO: check						
						break;
						
					case "e-resize":
						var newwidth = groupW+dx;
						updateRectMarks(marknum, newwidth, undefined);						
						break;
						
					case "w-resize":
						t = "translate(" + parseInt(groupX+dx) + "," + tSpecs[1] + ") ";
						$(e.target).attr("transform", t);
						var newwidth = groupW-dx;
						updateRectMarks(marknum, newwidth, undefined);
						break;
						
					case "n-resize":
						t = "translate(" + tSpecs[0] + "," + parseInt(groupY+dy) + ") ";
						var newheight = groupH-dy;
						$(e.target).attr("transform", t);		// causes wiggling, but unavoidable?	
						updateRectMarks(marknum, undefined, newheight);			// why does flipping with previous line === bad?			
						break;
						
					case "s-resize":
						var newheight = groupH+dy;
						updateRectMarks(marknum, undefined, newheight);
						break;
						
					case "se-resize":
						var newheight = groupH+dy;
						var newwidth = groupW+dx;						
						updateRectMarks(marknum, newwidth, newheight);
						break;
						
					case "ne-resize":
						t = "translate(" + tSpecs[0] + "," + parseInt(groupY+dy) + ") ";
						var newheight = groupH-dy;
						var newwidth = groupW+dx;						
						$(e.target).attr("transform", t);		// causes wiggling, but unavoidable?	
						updateRectMarks(marknum, newwidth, newheight);						
						break;
						
					case "sw-resize":
						t = "translate(" + parseInt(groupX+dx) + "," + tSpecs[1] + ") ";
						$(e.target).attr("transform", t);
						var newwidth = groupW-dx;					
						var newheight = groupH+dy;
						updateRectMarks(marknum, newwidth, newheight);
						break;
					
					case "nw-resize":
						var newwidth = groupW-dx;					
						t = "translate(" + parseInt(groupX+dx) + "," + parseInt(groupY+dy) + ") ";
						var newheight = groupH-dy;
						$(e.target).attr("transform", t);		// causes wiggling, but unavoidable?	
						updateRectMarks(marknum, newwidth, newheight);						
						break;
								
					default: console.log("Error Dragging");
				}
				
				updateBackgroundHighlight(marknum, .3);
				positionAnnotations(marknum);
				$("#closeicon_" + marknum).show();	
			}
			
			else if(target.classed("arcmark")) {
				switch(scaleMode) {
					case "move":
						t = "translate(" + parseInt(groupX+dx) + "," + parseInt(groupY+dy) + ") ";
						t += "scale(" + tSpecs[2] + "," + tSpecs[3] + ")";
						$(e.target).attr("transform", t);
					break;						
					
					default:					
						// ui.position.left/top is EVIL
						var visarea = $("#vis");	 					
						var	clickDist = Math.sqrt(Math.pow(groupX+visarea.offset().left-e.pageX,2)+Math.pow(groupY+visarea.offset().top-e.pageY,2));
						var marknum = getMarkNum($(this));
						updateArcMarks(marknum, clickDist);
						break;
				}
				
				var marknum = getMarkNum($(this));
				updateBackgroundHighlight(marknum, .3);
				positionAnnotations(marknum);			
				$("#closeicon_" + marknum).show();
			}
			
			else if(target.classed("scattermark")) {
				switch(scaleMode) {
					case "move":
						t = "translate(" + parseInt(groupX+dx) + "," + parseInt(groupY+dy) + ") ";							
						$(e.target).attr("transform", t);
						updateScatterMarks(marknum, undefined, undefined);	 // TODO: check						
					break;
						
					case "e-resize":
						var newwidth = groupW+dx;
						updateScatterMarks(marknum, newwidth, undefined);						
					break;
						
					case "w-resize":
						t = "translate(" + parseInt(groupX+dx) + "," + tSpecs[1] + ") ";
						$(e.target).attr("transform", t);
						var newwidth = groupW-dx;
						updateScatterMarks(marknum, newwidth, undefined);
					break;
						
					case "n-resize":
						t = "translate(" + tSpecs[0] + "," + parseInt(groupY+dy) + ") ";
						var newheight = groupH-dy;
						$(e.target).attr("transform", t);		// causes wiggling, but unavoidable?	
						updateScatterMarks(marknum, undefined, newheight);			// why does flipping with previous line === bad?			
					break;
						
					case "s-resize":
						var newheight = groupH+dy;
						updateScatterMarks(marknum, undefined, newheight);
					break;
						
					case "se-resize":
						var newheight = groupH+dy;
						var newwidth = groupW+dx;						
						updateScatterMarks(marknum, newwidth, newheight);
					break;
						
					case "ne-resize":
						t = "translate(" + tSpecs[0] + "," + parseInt(groupY+dy) + ") ";
						var newheight = groupH-dy;
						var newwidth = groupW+dx;						
						$(e.target).attr("transform", t);		// causes wiggling, but unavoidable?	
						updateScatterMarks(marknum, newwidth, newheight);						
					break;
						
					case "sw-resize":
						t = "translate(" + parseInt(groupX+dx) + "," + tSpecs[1] + ") ";
						$(e.target).attr("transform", t);
						var newwidth = groupW-dx;					
						var newheight = groupH+dy;
						updateScatterMarks(marknum, newwidth, newheight);
					break;
					
					case "nw-resize":
						var newwidth = groupW-dx;					
						t = "translate(" + parseInt(groupX+dx) + "," + parseInt(groupY+dy) + ") ";
						var newheight = groupH-dy;
						$(e.target).attr("transform", t);		// causes wiggling, but unavoidable?	
						updateScatterMarks(marknum, newwidth, newheight);						
					break;
								
					default: console.log("Error Dragging");
				}
				updateBackgroundHighlight(marknum, .3);
				positionAnnotations(marknum);
				$("#closeicon_" + marknum).show();		
			}
			
			//too easy?
			if(activeMark!==-1) {
				setPropertyEditorDefaults();
			}
		},
				
		
		start: function(e, ui) {
			isDragging = true;
			
			tSpecs = transformSpecs(e.target);
			wh = getDimensions($(e.target));
			
			mouseX = parseInt(ui.position.left); // Fix?
			mouseY = parseInt(ui.position.top);

			groupX = parseInt(tSpecs[0]);
			groupY = parseInt(tSpecs[1]);
			
			groupW = wh[0]*tSpecs[2];
			groupH = wh[1]*tSpecs[3];
		},
		
		
		stop: function(e, ui) {
			isDragging = false;
			
			//note new width/height
			tSpecs = transformSpecs(this);
			wh = getDimensions($(this));
		  
			groupW = wh[0]*tSpecs[2];
			groupH = wh[1]*tSpecs[3];
			
			groupSX = tSpecs[2];
			groupSY = tSpecs[3];
    }})
      
    
    .mousedown(function(e) {
	    //append target to front of the group so it is in the front
	    //$(e.target).parent().append(e.target);
	  })
	  
	  
	  .mouseover(function(e) {
		  if(!isDragging) {
			  tSpecs = transformSpecs(this);
				wh = getDimensions($(this));
				groupW = wh[0]*tSpecs[2];
				groupH = wh[1]*tSpecs[3];
			}
			
			var marknum = getMarkNum($(this));
			updateBackgroundHighlight(marknum, .3);
			positionAnnotations(marknum);		
			$("#closeicon_" + marknum).show();
			overMarks = true;
	  })
	  
	  
	  .mousemove(function(e) {
		  tSpecs = transformSpecs(this);
			
			//console.log(e.offsetX);
			//console.log(groupW + " | " + groupH);
			//console.log(s[1] + "|" + s[2] + "|" + wh[0] + "|" + wh[1] + "|" + e.offsetX + "|" + e.offsetY);
			
			var marknum = getMarkNum($(this));
			if(!isDragging) {
				getCursorType(marknum, tSpecs[0], tSpecs[1], groupW, groupH, e.offsetX, e.offsetY);
			}
	  })
	  
	  
	  .dblclick(function(e) {
		  var marknum = getMarkNum($(this));
		  
		  //set all other containers to transparent
			var group = svgm.selectAll(".container");
			group.attr("opacity",0);
	
			updateBackgroundHighlight(marknum, .3);
		  activeMark = marknum;		  
		  setPropertyEditorDefaults();
		  
		  //TODO: activate the property editor here
	  })
	  
	  
	  .mouseout(function(e) {
		  $('body').css('cursor', 'auto');
			var marknum = getMarkNum($(this));
			
			//If no active mark, then backgorund highlighted box should become transparent
			if(marknum!=activeMark) {
				updateBackgroundHighlight(marknum, 0);
			}
			$("#closeicon_" + marknum).hide();
			overMarks = false;
	  });

}




//DESTORY A MARK AND ALL ASSOCIATED MENUS
var destroyMark = function(marknum) {
	var marks = d3.select("#mark_" + marknum + "_group");
	marks.remove();

	var menus = $(".menudiv_" + marknum).each(function(index){
		var options = $(".optiondiv_" + marknum + "_" + index);
		options.remove();
	});
	
	menus.remove(); 
	
	$("#closeicon_" + marknum).remove();
	$(".axisanchor_" + marknum).remove();
	$(".axis_" + marknum).remove();
	$("#menudivGroup_" + marknum).remove();
	$(".textanchor_" + marknum).remove();	
	d3.selectAll(".textcont_" + marknum).remove();
}




var scaleMode = "";

//DETERMINE CURSOR TYPE FOR MOVING/SCALING
function getCursorType(marknum, shapeX, shapeY, shapeW, shapeH, mouseX, mouseY) {

	var markType = markGroups[marknum].type;
	var boundaryWidth = .1;
	var	clickDist;
	
	switch(markType) {
		case "rect":
			pX = (mouseX-shapeX)/shapeW; //percentage of X shape
			pY = (mouseY-shapeY)/shapeH; //percentage of Y shape
		break;
		
		case "arc":
			pX = (mouseX-shapeX+.5*shapeW)/shapeW; //percentage of X shape
			pY = (mouseY-shapeY+.5*shapeH)/shapeH; //percentage of Y shape	
			boundaryWidth = .5;
			clickDist = Math.sqrt(Math.pow(mouseX-shapeX,2)+Math.pow(mouseY-shapeY,2));
		break;
		
		case "scatter":
			pX = (mouseX-shapeX)/shapeW; //percentage of X shape
			pY = (mouseY-shapeY)/shapeH; //percentage of Y shape
		break;
	}	

	if(markType === "arc" && clickDist < (.5*shapeW)*(1-boundaryWidth)) {
		scaleMode = "move";
	} else if(pX<boundaryWidth && pY<boundaryWidth) {
		scaleMode = "nw-resize";		
	} else if(pX<boundaryWidth && pY>(1-boundaryWidth)) {
		scaleMode = "sw-resize";
	} else if(pX<boundaryWidth) {
		scaleMode = "w-resize";
	} else if(pX>(1-boundaryWidth) && pY<boundaryWidth) {
		scaleMode = "ne-resize";
	} else if(pX>(1-boundaryWidth) && pY>(1-boundaryWidth)) {
		scaleMode = "se-resize";
	} else if(pX>(1-boundaryWidth)) {
		scaleMode = "e-resize";
	} else if(pY<boundaryWidth) {
		scaleMode = "n-resize";
	} else if(pY>(1-boundaryWidth)) {
		scaleMode = "s-resize";
	} else {
		scaleMode = "move";
	}
	
	$('body').css('cursor', scaleMode);	
}





//GET SPECS FROM TRANSFORM ATTRIBUTE OF G GROUP
function transformSpecs(shape) {
	t = $(shape).attr("transform");
	p = /\(|\)|\,/g;
	s = t.split(p);
	
	//translateX, translateY, scaleX (default:1), scaleY (default:1)
	if(s.length<5) {
		return [s[1], s[2], 1, 1];
	} else {
		return [s[1], s[2], s[4], s[5]];
	}
}




/*
//Get the width and height of g group based on its SVG elements (only works for rect now)
function getDimensions(shapes) {
	mode = -1; //0 = bar graph horizontal; 1 = bar graph vertical
	
	maxW = +$(shapes).eq(0).attr("width");
	maxH = +$(shapes).eq(0).attr("height");
	
	
	//bar graph with bars of same width or same height?
	for(i=1; i<shapes.length-1; i++) {
		if(maxH !== +$(shapes).eq(i).attr("height")) {
			mode = 0;
			break;
		} else if(maxW !== +$(shapes).eq(i).attr("width")) {
			mode = 1;
			break;
		}
	}
	
	if(mode==-1) { return [maxW, maxH]; }
	
	maxW = 0, maxH = 0;

	//determine width and height of parent by finding max W/H or cumulative W/H
	for(i=0; i<shapes.length-1; i++) {
		if(mode==0) {
			maxW += +$(shapes).eq(i).attr("width");
			maxH = Math.max(maxH, +$(shapes).eq(i).attr("height"));
		}
		if(mode==1) {
			maxW = Math.max(maxW, +$(shapes).eq(i).attr("width"));
			maxH += +$(shapes).eq(i).attr("height");
		}
	}
	
	return [maxW, maxH];
}
*/




//GET SVG GROUP BOUNDING BOX
function getDimensions(shapes) {
	shapes=shapes[0];
	var bb = shapes.getBBox();
	//handle axis width here?
// 	console.log("W: " + bb["width"]);
// 	console.log("X: " + bb["x"]);
// 	console.log("H: " + bb["height"]);
// 	console.log("Y: " + bb["y"]);
	
	return [bb["width"]-bb["x"], bb["height"]-bb["y"]];
}





//HANDLE DROPPED COLUMN ONTO MENU LABEL AND UPDATE MARKS
var dropSubMenu=function(event,ui){
	//switch based on parent menu type
	var option = $(this);
	var myid = option.attr("id");
	var s = myid.split("_");
	var marknum = s[1], menuindex = s[2], optionindex;
	
	if(s.length<4) {
		// take default action
		optionindex = 0; 
	} else {
		optionindex = s[3];
	}
	
	//high-level mark, first-level menu, second-level menu option
	var myparent = d3.select("#menudiv_" + marknum + "_" + menuindex);
	myparent.classed("hoverselected",false);
	
	$(this).removeClass("hoverselected");
	$(this).addClass("optionselected"); //TODO: need to remove optionselected from other attributes that are no longer active
	
	
	//var parameter = myparent.text(); //parameter menu option
	var parameter = $("#menudiv_" + marknum + "_" + menuindex).data("vizAttribute");
	var colname = ui.draggable.text(); //column name of data
	
	var selectedoption = $("#optiondiv_" + marknum + "_" + menuindex + "_" + optionindex);

	
	//set scales to either linear or logarithmic or pallet color
	var scaleselection = selectedoption.text(); // option.text();
	
	var markType = markGroups[marknum].type;	
	
	//prevent crashing with ordinal types on quant parameters
	if(ui.draggable.hasClass("ordinal") && !(parameter === "fill" || parameter=== "stroke")) {
		return;
	}
	
	console.log("dropped "+ colname + " on mark" + marknum);	

	switch(markType) {
		case "rect":
			//why is second parameter n*20? it's the fixed width
			updateRectMarks(marknum, n*20, undefined, parameter, colname, scaleselection);	// remove constant
		break;
		
		case "arc":
			updateArcMarks(marknum, undefined, parameter, colname, scaleselection);
		break;
		
		case "scatter":
			updateScatterMarks(marknum, n*20, undefined, parameter, colname, scaleselection);
		break;
	}	
	
	//scale axes of current plot		
	positionAxes(marknum);
	positionAnnotations(marknum);	
}



var positionAxes = function(marknum) {
	var axes = d3.selectAll("g.axis_" + marknum);
	
	axes.each(function() {
		positionAxis($(this));
	});
}




//MAKE QUANTITATIVE SCALE
var makeQuantScale = function(scaleselection, datacolumn, range, min) {
	var yscale;
	var extents = d3.extent(datacolumn); 
	
	//set up scale based on menu choice	
	if(min===undefined) { min = 0; }
	
	switch(scaleselection) {
		case "linear":
			yscale = d3.scale.linear()
				.domain(extents)
				.range([min, range+min]);
		break;
		
		case "logarithmic":
			if(extents[0]<=0) extents[0]=1; //how to deal with zeroes?
			yscale = d3.scale.log()
				.domain(extents)
				.range([min, range+min]);
		break;
	}
	
	return yscale;
}



//MAKE COLOR SCALE
var makeColorScale= function(scaleselection, datacolumn) {
	var colorscale;
	
	//set up scale based on menu choice	
	var palletselection = scaleselection.split(" ")[1];
	
	switch(palletselection) {
		case "A": 
			colorscale=d3.scale.category20().domain(datacolumn);
		break;
		
		case "B":
			colorscale=d3.scale.category20b().domain(datacolumn);
		break;
		
		case "C":
			colorscale=d3.scale.category20c().domain(datacolumn);
		break;
	}
	
	return colorscale;
}





//MARK NUMBER, VISUAL PROPERTY, COLUMN NAME, TYPE OF SCALE
var updateRectMarks = function(marknum, newwidth, newheight, parameter, colname, scaleselection, constantValue) {
	var yscale;
	var colorscale;
	var nodeType;
	var dragupdate=false;
	var transduration = 250;
	
	d3.select(".mark" + marknum + " .realmark").each(function(d,i){
		nodeType = this.nodeName;
	}); 
	
	if(newheight===undefined) { newheight = markGroups[marknum].height; }
	else {  markGroups[marknum].height = newheight; }
	if(newwidth===undefined) { newwidth = markGroups[marknum].width; }
	else {  markGroups[marknum].width = newwidth; }

	if(constantValue===undefined) {
		$("g.mark" + marknum).data("maxWidth", newwidth);
	}
	
	// use established values if scale update
	// resize default
	if(markGroups[marknum].majorParameter === undefined && colname === undefined && scaleselection === undefined && parameter === undefined)
	{
		var marks = svgm.selectAll("g.mark" + marknum + " rect.realmark")
		.attr("height",newheight)
		.attr("width",newwidth)	
	}
	
	else
	{
		// regular update
		if(colname === undefined && scaleselection === undefined && parameter === undefined)
		{
			parameter = markGroups[marknum].majorParameter;
			colname = markGroups[marknum].scales[parameter].columnName;
			scaleselection = markGroups[marknum].scales[parameter].type;		
			dragupdate=true;
			transduration=0;
		}
		
		if(constantValue===undefined) {
			var datacolumn = dataObjectsToColumn(allData,colname);
		}
		
//		console.log(parameter + " " + colname + " " + scaleselection);
			
		var logextra;
		logextra = scaleselection==="logarithmic" ? 1 : 0;

		svgm = d3.select("svg#vis");

		var marks=svgm.selectAll(".mark" + marknum + " .realmark")
									.data(allData);

		if(constantValue===undefined) {							
			colorscale = makeColorScale(scaleselection, datacolumn);
		}
					
		switch(parameter) {
			case "height":	
			console.log("HEIGHT");				
				yscale = makeQuantScale(scaleselection, datacolumn, newheight);
				marks.transition().duration(transduration)
					.attr("height",function(d,i){
						return yscale(d[colname]+logextra);})
					.attr("width",function(d,i) {
						return newwidth/n;})
					.attr("x",function(d,i){
						return i*newwidth/n;})
					.attr("y",function(d,i){
						return newheight-yscale(d[colname]+logextra);});
				break;
				
			case "width":
				
// 				if(constantValue!==undefined) {
// 					maxWidth = $("g.mark" + marknum).data("maxWidth");
// 					avgWidth = maxWidth/n;
// 					
// 					marks.transition().duration(0)
// 						.attr("width", function(d,i) {
// 							return constantValue;})
// 						.attr("x",function(d,i){
// 							pad = (avgWidth-constantValue)/2;
// 							return i*avgWidth+pad;});
// 					break;
// 				}
				
				yscale = makeQuantScale(scaleselection, datacolumn, newwidth);
				marks.transition().duration(transduration)
					.attr("width",function(d,i){
						return yscale(d[colname]+logextra);})
					.attr("height", function(d,i) {
						return newheight/n;})
					.attr("x",function(d,i){return 0;})	
					.attr("y",function(d,i){
						return i*newheight/n;});
				break;
			
			case "fill":
				if(constantValue===undefined) {
					marks.attr("fill",function(d,i){
						return colorscale(d[colname]);
					})
				} else {
					marks.attr("fill",function(d,i){
						return constantValue;
					})
				}
				break;
				
			case "stroke":
				if(constantValue===undefined) {
					marks.attr("stroke",function(d,i){
						return colorscale(d[colname]);
					})
				} else {
					marks.attr("stroke",function(d,i){
						return constantValue;
					})
				}
				break;
		}
			

		// scale axes of current plot		
		var axes = d3.selectAll("g.axis_" + marknum);
		if((markGroups[marknum].majorParameter === "height" && parameter==="width") || (markGroups[marknum].majorParameter === "width" && parameter==="height"))	{
			axes.remove();
		}
		else {
			axes.each(function(){		
				positionAxis($(this));});		
		}
		
		markGroups[marknum].addScale(parameter, new Scale(yscale, colorscale, scaleselection, colname));

		if(constantValue===undefined) {
			if($.inArray(parameter, ["height", "width"])!==-1) { 
				markGroups[marknum].majorParameter = parameter;
				markGroups[marknum].majorScale = yscale;
			}
		}
		
		marks.exit().remove();
	
	}

}




var updateScatterMarks = function(marknum, newwidth, newheight, parameter, colname, scaleselection, constantValue)
{

	var xscale, yscale;
	var colorscale;
	var dragupdate=false;
	var transduration = 700;
	var xparameter, yparater;
	var xscaleselection, yscaleselection;
	var xcolname, ycolname;
	var xlogextra=0, ylogextra=0;

	
//	console.log("scatter");
	if(newheight===undefined) { newheight = markGroups[marknum].height; }
	else {  markGroups[marknum].height = newheight; }
	if(newwidth===undefined) { newwidth = markGroups[marknum].width; }
	else {  markGroups[marknum].width = newwidth; }

	if(constantValue===undefined) {
		$("g.mark" + marknum).data("maxWidth", newwidth);
	}
	
	// use established values if scale update
	// resize default
	// if(colname === undefined && scaleselection === undefined && parameter === undefined)
	// {
		// can't scale a single mark ?
//		var marks = svgm.selectAll("g.mark" + marknum + " rect.realmark")
//		.attr("height",newheight)
//		.attr("width",newwidth)	
	// }
	
	// else
	// {
	
			
		xcolname = markGroups[marknum].scales["x"].columnName;
		ycolname = markGroups[marknum].scales["y"].columnName;			
		xscaleselection = markGroups[marknum].scales["x"].type;		
		yscaleselection = markGroups[marknum].scales["y"].type;	
		
		// regular update
		if(colname === undefined && scaleselection === undefined && parameter === undefined)
		{	
			dragupdate=true;
			transduration=0;
			parameter = "update";
			console.log("update");
		}
		
		if(constantValue===undefined) {
			if(parameter === "x") {
				xcolname = colname;
				xscaleselection = scaleselection;
			}
			else if(parameter === "y")
			{
				ycolname = colname;		
				yscaleselection = scaleselection;
			}
		}
		
		if(constantValue===undefined) {
			var xdatacolumn = dataObjectsToColumn(allData,xcolname);
			var ydatacolumn = dataObjectsToColumn(allData,ycolname);	
			var datacolumn = dataObjectsToColumn(allData,colname);								

		}
		
		
//		console.log(parameter + " " + colname + " " + scaleselection);
			
		var logextra;
		logextra = scaleselection==="logarithmic" ? 1 : 0;
		xlogextra = xscaleselection==="logarithmic" ? 1 : 0;
		ylogextra = yscaleselection==="logarithmic" ? 1 : 0;

		svgm = d3.select("svg#vis");

		var marks=svgm.selectAll(".mark" + marknum + " .realmark")
									.data(allData);


		
		var symbol = d3.svg.symbol();
		
		switch(parameter) {
			case "update":
			case "x":	
			case "y":
				xscale = makeQuantScale(xscaleselection, xdatacolumn, newwidth);
				yscale = makeQuantScale(yscaleselection, ydatacolumn, newheight);
				marks.transition().duration(transduration)
				.attr("transform",function(d,i)
				{
					return "translate("+ xscale(d[xcolname]+xlogextra)  + ","+ yscale(d[ycolname]+ylogextra)+")";
				});
				break;
			case "radius":
				var scale = makeQuantScale(scaleselection, datacolumn, 200, 60);
				symbol.size(function(d,i){ return scale(d[colname]+logextra);});
				marks.transition().duration(transduration)
				.attr("d", symbol);	
				break;
			// case "width":			
				// yscale = makeQuantScale(scaleselection, datacolumn, newwidth);
				// marks.transition().duration(transduration)
					// .attr("width",function(d,i){
						// return yscale(d[colname]+logextra);})
					// .attr("height", function(d,i) {
						// return newheight/n;})
					// .attr("x",function(d,i){return 0;})	
					// .attr("y",function(d,i){
						// return i*newheight/n;});
				// .attr("transform",function(d,i)
				// {
					// return "translate("+ yscale(d[colname]+logextra) + "," + i*newheight/n + ")";
				// })
				// .attr("d", symbol);						
				// break;
				
			
			case "fill":
				if(constantValue===undefined) {
					colorscale = makeColorScale(scaleselection, datacolumn);
					marks.attr("fill",function(d,i){
						return colorscale(d[colname]);
					})
				} else {
					marks.attr("fill",function(d,i){
						return constantValue;
					})
				}
				break;
				
			case "stroke":
				if(constantValue===undefined) {
					colorscale = makeColorScale(scaleselection, datacolumn);				
					marks.attr("stroke",function(d,i){
						return colorscale(d[colname]);
					})
				} else {
					marks.attr("stroke",function(d,i){
						return constantValue;
					})
				}
				break;
		}
			

		// scale axes of current plot		
		var axes = d3.selectAll("g.axis_" + marknum);
		// if((markGroups[marknum].majorParameter === "height" && parameter==="width") || (markGroups[marknum].majorParameter === "width" && parameter==="height"))	{
			// axes.remove();
		// }
			axes.each(function(){		
				positionAxis($(this));});		
	

		if(constantValue===undefined) {
			if(parameter === "x")
			{
				markGroups[marknum].addScale("x", new Scale(xscale, colorscale, scaleselection, colname));			
				markGroups[marknum].xScale = xscale;
			}
			else if(parameter === "y")
			{
				markGroups[marknum].addScale("y", new Scale(yscale, colorscale, scaleselection, colname));				
				markGroups[marknum].yScale = yscale;			
			}
		}
		
		marks.exit().remove();
	
	// }

}






var positionAxis = function(curaxis) {
	var myid = curaxis.attr("id");
	var marknum = myid.split("_")[1];
	var anchornum = +myid.split("_")[2];
	var axisgroup = d3.select("#axis_" + marknum + "_" + anchornum);			
	
	var flippedscale = d3.scale.linear();
	var normalscale = d3.scale.linear();
	var axis = d3.svg.axis();				
	var range = markGroups[marknum].majorScale.range();
	
	normalscale.domain(markGroups[marknum].majorScale.domain())
				.range(markGroups[marknum].majorScale.range());
	flippedscale.domain(markGroups[marknum].majorScale.domain())
				.range([range[1], range[0]]);
	

	switch(anchornum) {
		case 0:
			axis.orient("top");
		break;
		
		case 1:
			axis.orient("right");
		break;
		
		case 2:
			axis.orient("bottom");
		break;
		
		case 3:
			axis.orient("left");
		break;
	}
		


	var wh = getDimensions($("g.mark" + marknum));
	var trans = transformSpecs($("g.mark" + marknum).get());
	
	if(anchornum===1 || anchornum===3) {
		axis.scale(flippedscale);
		axisgroup.attr("height",wh[1]);
		axisgroup.call(axis);
	} else {
		axis.scale(normalscale);
		axisgroup.attr("width",wh[0]);
		axisgroup.call(axis);
	}

	switch(anchornum) {
		case 0:
			axisgroup.attr("transform", "translate(" + trans[0] + "," + trans[1] + ")");			
		break;
		
		case 1:
			axisgroup.attr("transform", "translate(" + ((+trans[0])+(+wh[0])) + "," + trans[1] + ")");
		break;
		
		case 2:
			axisgroup.attr("transform", "translate(" + trans[0]  + "," + ((+trans[1])+(+wh[1])) + ")");
		break;	
						
		case 3:
			axisgroup.attr("transform", "translate(" + trans[0] + "," + trans[1] + ")");
		break;
	} 	
}





var updateArcMarks = function(marknum, radius, parameter, colname, scaleselection, constant) {
	var yscale;
	var colorscale;
	var nodeType;
	var dragupdate = false;
	var transduration = 250;
	
	d3.select(".mark" + marknum + " .realmark").each(function(d,i){
		nodeType=this.nodeName;
	}); 
	
	console.log(constant);
	
	if(radius === undefined) { radius = markGroups[marknum].radius; }
	else {	markGroups[marknum].radius = radius; }
	// use established values if scale update
	
	// resize default
	if(markGroups[marknum].majorParameter === undefined && colname === undefined && scaleselection === undefined && parameter === undefined && constant === undefined)
	{

		var marks=svgm.selectAll("g.mark" + marknum)
									.data([allData]);
		var arc = d3.svg.arc();
		arc.innerRadius(0);
		arc.outerRadius(radius);
		marks.selectAll("path")
			.attr("d", arc); 				
	}
	else
	{
		// regular update
		if(colname === undefined && scaleselection === undefined && parameter === undefined)
		{
			parameter = markGroups[marknum].majorParameter;
			colname = markGroups[marknum].scales[parameter].columnName;
			scaleselection = markGroups[marknum].scales[parameter].type;		
			dragupdate=true;
			transduration=0;
		}
		
		var datacolumn = dataObjectsToColumn(allData,colname);

		// set up scale based on menu choice	
		if($.inArray(parameter, ["outer radius", "inner radius"])!==-1)
		{
			for(var elem in datacolumn) datacolumn[elem] = Math.sqrt(datacolumn[elem]);
		}
		if(constant === undefined) {
			colorscale = makeColorScale(scaleselection, datacolumn);
			yscale = makeQuantScale(scaleselection, datacolumn, radius);
		}

		
		var logextra;
		logextra = scaleselection==="logarithmic" ? 1 : 0;

		svgm = d3.select("svg#vis");

		var arc = d3.svg.arc();
		var marks=svgm.selectAll("g.mark" + marknum)
									.data([allData]);
		var arcs = marks.selectAll("path");
//		console.log(arcs);
		
		switch(parameter) {
			case "angle":
				arc.innerRadius(0);
				arc.outerRadius(radius);
				
				sum = 0;
				cum = new Array();
				cum[0] = 0;
				for(i=0; i<n-1; i++) {
					sum += yscale(datacolumn[i]+logextra);
					cum[i+1] = sum;
				}
				cum[n] = sum;
				
				arc.startAngle(function(d,i) {
					return cum[i]/sum*2*Math.PI;
				})
				arc.endAngle(function(d,i) {
					return cum[i+1]/sum*2*Math.PI;
				})
				
				marks.selectAll("path").transition().duration(transduration)
					.attr("d", arc); 	
				break;
				
			case "inner radius":
				
				arc.outerRadius(radius);
				arc.innerRadius(function(d,i){
					return yscale(datacolumn[i]+logextra);
				});
				marks.selectAll("path").transition().duration(transduration)
					.attr("d", arc); 						
				break;
			
			case "outer radius":
				arc.innerRadius(0);
				arc.outerRadius(function(d,i){
					return yscale(datacolumn[i]+logextra);
				});
				marks.selectAll("path").transition().duration(transduration)
					.attr("d", arc); 			
				break;
				
			case "fill":
				if(constant!==undefined)
					arcs.attr("fill",constant);
				else
					arcs.attr("fill",function(d,i){return colorscale(datacolumn[i]);});
				break;
				
			case "stroke":
				if(constant!==undefined)
					arcs.attr("stroke",constant);
				else
					arcs.attr("stroke",function(d,i){return colorscale(datacolumn[i]);});
				break;
		}

		
		markGroups[marknum].addScale(parameter, new Scale(yscale, colorscale, scaleselection, colname));
		if(constant===undefined) {
			if($.inArray(parameter, ["outer radius", "inner radius", "angle"])!==-1) { markGroups[marknum].majorParameter = parameter; }
		}
		marks.exit().remove();
	
	}

}






//UPDATE BACKGROUND HIGHLIGHTED *CONTAINER* BOX
var updateBackgroundHighlight=function(marknum, opacity)
{
	//set all other containers to transparent
	//var group = svgm.selectAll(".container");
	//group.attr("opacity",0);
	

	var group = svgm.select("g.mark" + marknum);
	
	// set container to 0 size to avoid distorting bounding box
	var container = group.select(".container")
	container.attr("height",0);
	container.attr("width",0);
	
	var bbox = getDimensions($(group[0][0]));

	markType = markGroups[marknum].type;
	
	switch(markType) {
		case "arc":
			container.attr("r",(markGroups[marknum].radius)+5)
				.attr("fill",colors10[marknum%10])
				.attr("opacity",opacity);
		break;
		
		case "rect":
			container.attr("width",bbox[0]+10)
				.attr("height",bbox[1]+10)
				.attr("x",-5)
				.attr("y",-5)
				.attr("fill",colors10[marknum%10])
				.attr("opacity",opacity);	
		break;
		
		case "scatter":
			container.attr("width",bbox[0]+10)
				.attr("height",bbox[1]+10)
				.attr("x",-10)
				.attr("y",-10) 
				.attr("fill",colors10[marknum%10])
				.attr("opacity",opacity);
		break;
	}
}

