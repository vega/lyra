var svgm; //stores all active intermediate objects
var marks=[]; //intermediate link between the data, d3, and its dropzones
var markcount=0; //number of marks on screen

var dataset = [];
var zonewidth=50;
var n;
var allData=[];

var menus = {"rect":
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
								["Pallet A","Pallet B","Pallet C"]}};


var menulabels;
var extents;


function dataObjectsToColumn(objectArray,colname){
	var column=[];
	for(var i in objectArray) {
		column.push(objectArray[i][colname]);
	}
	return column;
}




$(document).ready(function(){
		
	//$.getJSON("./olympics.json",function(response){
	
	//Read in Data from CSV File
	d3.csv("./olympics.csv", function(response) {
		//console.log(response);
		
		//use d3 loader instead?
		for (var i in response) {
			allData[i]={};
			for(var attr in response[0]) {
				if(attr==="ISO Country code" || attr === "Country name" || attr === "Continent") {
					allData[i][attr] = response[i][attr];
				} else {
					allData[i][attr] = +response[i][attr]; //data holds number
				}
			}
		}
		
		//n=allData.length;
		allData.push(allData[0]); //push a fake piece of data on the end to serve as the chart selector
		console.log(allData);
		
		//populate list of columns
		for(var label in allData[0]) {
			var newelement=$("<li class=\"column\"></li>");
			newelement.text(label);
			newelement.appendTo($("#data ul"));
		}
		
		//Column class for each variable in the data
		$(".column").draggable({
			start:function(event,ui){
				$(".menudiv").show(); //show available attribute encoders
			},
			stop:function(event,ui){
				$(".menudiv").hide(500); //necessary or drop won't register
			}
		})
		.draggable("option","helper","clone");
	});
	
	
	//Mark boxes at top of screen	
  $(".mark").draggable()
						.draggable("option", "revert", "invalid") 
						.draggable("option", "helper", "clone"); //duplicate of draggable moves with cursor

	//Region is everything below the marks div								
  $("#region").droppable({
			accept: ".mark",
			drop: function( event, ui ) {
				var x,y;
				var dragged=ui.draggable;
				var visarea = $("#vis");
				x=event.pageX - visarea.offset().left;
				y=event.pageY - visarea.offset().top;
				xmlns = "http://www.w3.org/2000/svg";
				
				if(dragged.hasClass("mark")) {
					var markID = $(dragged).attr("id").split("_")[1];
					svgm = d3.select("svg#vis");
	
					dataset=[];
					n=allData.length;
					console.log(n);
					for(var i=0; i<n;i++) dataset.push(1);
	
					createMarks(x,y,markcount,markID);

					//make a 1st level menu for each graph
					createMenus(markID,markcount);

					markcount++;					
				}
			}
	});

});






var createMenus=function(markID,markcount) {
	console.log(markID);
	
	var menudivs=[];
	menulabels=d3.keys(menus[markID]);
	
	var menuitem;
	console.log(menulabels);
	
	for (var divnum=0; divnum<menulabels.length; divnum++) {
		menuitem=$("<div class=\"menudiv"+divnum+" menudiv\" id=\"menudiv_"+markcount+"_"+divnum+"\" style=\"position:absolute;\">"+menulabels[divnum]+ "</div>");
		
		menudivs.push(menuitem);
		menuitem.appendTo($("body"));
		menuitem.hide();
		
		//move menu item to rect
		var myid = menuitem.attr("id");
		var marknum = myid.split("_")[1];
		var menuindex = myid.split("_")[2];
		var markgroup = d3.select(".mark"+marknum);		
		//var attachedmarks = markgroup.selectAll("rect");
		var cleantrans = markgroup.attr("transform").substring(10).split(")")[0].split(",");
		var minx = +cleantrans[0];
		var maxy = +cleantrans[1];
		var visarea = $("#vis");
		 
		menuitem.css("left",(minx+visarea.offset().left)+"px");
		menuitem.css("top",maxy+visarea.offset().top+120+menuindex*20+"px");
		
		menuitem.droppable({
		
			accept: ".column",
			drop: function(event,ui){
				// TODO take default behavior
			},
			activate:function(event,ui){ },
			over:function(event,ui){
				var mytext = d3.select(this);
				var myid = mytext.attr("id");
				var marknum = myid.split("_")[1];
				var menuindex = myid.split("_")[2];
				mytext.classed("hoverselected",true);
				// reveal next level
				$(".optiondiv").hide();
				$(".optiondiv_"+marknum+"_"+menuindex).show();
			},
			out:function(event,ui){
				var mytext = d3.select(this);
				mytext.classed("hoverselected",false);
				//hide other elements
			}
			
		});
		
		menuitem.droppable("option","tolerance","pointer");
		
		// make a 2nd level menu for each 1st level menu
		var optionslist = menus[markID][menulabels[divnum]];
		for(var optionnum=0; optionnum<optionslist.length; optionnum++) {
			option=$("<div class=\"optiondiv_"+markcount+"_"+divnum+" optiondiv\" id=\"optiondiv_"+markcount+"_"+divnum+"_"+optionnum+"\" style=\"position:absolute;\">"+optionslist[optionnum]+ "</div>");
			option.appendTo($("body"));
			option.hide();

			var myid = option.attr("id");
			var marknum = myid.split("_")[1];
			var menuindex = myid.split("_")[2];
			var myparent = d3.select("#menudiv_"+marknum+"_"+menuindex);
			var parentX = +(myparent.style("left").split("px")[0]);
			var parentY = +(myparent.style("top").split("px")[0]);
			var visarea = $("#vis");
			
			option.css("left",(parentX+zonewidth*2)+"px");
			option.css("top",parentY+optionnum*20+"px");
			
			option.droppable({
				accept: ".column",
				drop:dropSubMenu,
				activate:function(event,ui){},
				deactivate:function(event,ui){
					$(this).hide(500);
				},
				over:function(event,ui){}
			});
			
			option.droppable("option","tolerance","touch");
		}
	}
}





var createMarks=function(x,y,markcount,type) {
	
	switch(type) {
		
		case "rect":
			var rectcont = svgm.append("g")
			.classed("mark"+markcount,true)
			.attr("transform", "translate(" + x + "," + y + ")")
			.attr("fill", "steelblue")
			.attr("stroke","#ccc")
			.attr("stroke-width","2");
	
			rectcont.selectAll("rect")
			.data(dataset)
			.enter()
			.append("rect")
			.attr("height",100)
			.attr("width",50)
			.attr("x",0)
			.attr("y",0)	
			.attr("fill", function(d,i) {
				if(i==n-1) { return "#ccc"; }
				return "steelblue"; })
			.attr("fill-opacity", function(d,i) {
				if(i==n-1) { return 0; }
				return 1; })
// 			.attr("stroke", function(d,i) {
// 				if(i==n-1) { return "#000"; }
// 				return "#ccc"; })
			.attr("stroke-width", function(d,i) {
				if(i==n-1) { return 0; }
				return 2; })
			.classed("realmark",true)
			.classed("tempmark",true);
			break;
		
		case "arc":
			var donut = d3.layout.pie(),
			arc = d3.svg.arc().innerRadius(0).outerRadius(50);
	
			var arcscont=svgm.append("g")
				.data([dataset])
				.attr("class","mark"+markcount)
				.attr("transform", "translate(" + x + "," + y + ")")
				.attr("stroke","#ccc")
				.classed("tempmark",true)
				.attr("stroke-width","2");
			
			var arcs=arcscont
				.selectAll(".mark"+markcount+" g.arc")
				.data(donut)
				.enter().append("g")		
				.attr("class", "arc");
				
			arcs.append("path")
				.attr("fill", "steelblue")
				.attr("d", arc)
				.classed("realmark",true);
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
	
	$("g.mark" + markcount).draggable({
		drag: function(e, ui) {
			$('body').css('cursor', scaleMode);
			tSpecs = transformSpecs(e.target);
			
			dx = parseInt(ui.position.left - mouseX);
			dy = parseInt(ui.position.top - mouseY);
			
			//console.log(groupX + " + " + ui.position.left + " - " + mouseX + " = " + parseInt(groupX+dx));
			//console.log("DRAG: " + ui.position.left);
			
			switch(scaleMode) {
				case "move":
					t = "translate(" + parseInt(groupX+dx) + "," + parseInt(groupY+dy) + ") ";
					t += "scale(" + tSpecs[2] + "," + tSpecs[3] + ")";
					$(e.target).attr("transform", t);
					break;
					
				case "e-resize":
					sx = (groupW+dx)/groupW;
					t = "translate(" + tSpecs[0] + "," + tSpecs[1] + ") ";
					t += "scale(" + sx*groupSX + ", " + tSpecs[3] + ")";
					$(e.target).attr("transform", t);
					break;
					
				case "w-resize":
					sx = (groupW-dx)/groupW;
					t = "translate(" + parseInt(groupX+dx) + "," + tSpecs[1] + ") ";
					t += "scale(" + sx*groupSX + ", " + tSpecs[3] + ")";
					$(e.target).attr("transform", t);
					break;
					
				case "n-resize":
					sy = (groupH-dy)/groupH;
					t = "translate(" + tSpecs[0] + "," + parseInt(groupY+dy) + ") ";
					t += "scale(" + tSpecs[2] + ", " + sy*groupSY + ")";
					$(e.target).attr("transform", t);
					break;
					
				case "s-resize":
					sy = (groupH+dy)/groupH;
					t = "translate(" + tSpecs[0] + "," + tSpecs[1] + ") ";
					t += "scale(" + tSpecs[2] + ", " + sy*groupSY + ")";
					$(e.target).attr("transform", t);
					break;
					
				case "se-resize":
					sx = (groupW+dx)/groupW;
					sy = (groupH+dy)/groupH;
					t = "translate(" + tSpecs[0] + "," + tSpecs[1] + ") ";
					t += "scale(" + sx*groupSX + ", " + sy*groupSY + ")";
					$(e.target).attr("transform", t);
					break;
					
				case "ne-resize":
					sx = (groupW+dx)/groupW;
					sy = (groupH-dy)/groupH;
					t = "translate(" + tSpecs[0] + "," + parseInt(groupY+dy) + ") ";
					t += "scale(" + sx*groupSX + ", " + sy*groupSY + ")";
					$(e.target).attr("transform", t);
					break;
					
				case "sw-resize":
					sx = (groupW-dx)/groupW;
					sy = (groupH+dy)/groupH;
					t = "translate(" + parseInt(groupX+dx) + "," + tSpecs[1] + ") ";
					t += "scale(" + sx*groupSX + ", " + sy*groupSY + ")";
					$(e.target).attr("transform", t);
					break;
				
				case "nw-resize":
					sx = (groupW-dx)/groupW;
					sy = (groupH-dy)/groupH;
					t = "translate(" + parseInt(groupX+dx) + "," + parseInt(groupY+dy) + ") ";
					t += "scale(" + sx*groupSX + ", " + sy*groupSY + ")";
					$(e.target).attr("transform", t);
					break;
							
				default:
					console.log("NADA");
			}	
		},
				
		
		start: function(e, ui) {
			console.log("-START");
			isDragging = true;
			
			tSpecs = transformSpecs(e.target);
			wh = getDimensions($(e.target).children());
			
			mouseX = parseInt(ui.position.left);
			mouseY = parseInt(ui.position.top);

			groupX = parseInt(tSpecs[0]);
			groupY = parseInt(tSpecs[1]);
			
			groupW = wh[0]*tSpecs[2];
			groupH = wh[1]*tSpecs[3];
			
			groupSX = tSpecs[2];
			groupSY = tSpecs[3];
		},
		
		
		stop: function(e, ui) {
			console.log("-STOP");
			isDragging = false;
			
			//note new width/height
			tSpecs = transformSpecs(this);
			wh = getDimensions($(this).children());
		  
			console.log("STOP");
			groupW = wh[0]*tSpecs[2];
			groupH = wh[1]*tSpecs[3];
			
			groupSX = tSpecs[2];
			groupSY = tSpecs[3];
    }})
      
    
    .mousedown(function(e) {
	    //append target to front of the group so it is in the front
	    //$(e.target).parent().append(e.target);
	    console.log("-MDOWN");
	  })
	  
	  
	  .mouseover(function(e) {
		  console.log("OVER");
		  if(!isDragging) {
			  tSpecs = transformSpecs(this);
				wh = getDimensions($(this).children());
				groupW = wh[0]*tSpecs[2];
				groupH = wh[1]*tSpecs[3];
			}
	  })
	  
	  
	  .mousemove(function(e) {
		  tSpecs = transformSpecs(this);
			
			//console.log(e.offsetX);
			//console.log(groupW + " | " + groupH);
			//console.log(s[1] + "|" + s[2] + "|" + wh[0] + "|" + wh[1] + "|" + e.offsetX + "|" + e.offsetY);
			
			if(!isDragging) {
				getCursorType(tSpecs[0], tSpecs[1], groupW, groupH, e.offsetX, e.offsetY);
			}
	  })
	  
	  
	  .mouseout(function(e) {
		  $('body').css('cursor', 'auto');
	  });

}


var scaleMode = "";



//Determine cursor type for moving/scaling
function getCursorType(shapeX, shapeY, shapeW, shapeH, mouseX, mouseY) {
	pX = (mouseX-shapeX)/shapeW; //percentage of X shape
	pY = (mouseY-shapeY)/shapeH; //percentage of Y shape
	
	if(pX<.1 && pY<.1) {
		scaleMode = "nw-resize";		
	} else if(pX<.1 && pY>.9) {
		scaleMode = "sw-resize";
	} else if(pX<.1) {
		scaleMode = "w-resize";
	} else if(pX>.9 && pY<.1) {
		scaleMode = "ne-resize";
	} else if(pX>.9 && pY>.9) {
		scaleMode = "se-resize";
	} else if(pX>.9) {
		scaleMode = "e-resize";
	} else if(pY<.1) {
		scaleMode = "n-resize";
	} else if(pY>.9) {
		scaleMode = "s-resize";
	} else {
		scaleMode = "move";
	}
	
	$('body').css('cursor', scaleMode);	
}


//Get specs from transform attribute of g group
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






var dropSubMenu=function(event,ui){
	//switch based on parent menu type
	var option = $(this);
	var myid = option.attr("id");
	var s = myid.split("_");
	
	//high-level mark, first-level menu, second-level menu option
	var marknum = s[1], menuindex = s[2], optionindex = s[3];
	var myparent = d3.select("#menudiv_"+marknum+"_"+menuindex);
	
	console.log("DROP "  + menulabels[menuindex]+" "+option.text());
	
	var parameter = menulabels[menuindex]; //second-level menu option
	var colname = ui.draggable.text(); //column name of data
	
	var datacolumn = dataObjectsToColumn(allData,colname);
	var extents = d3.extent(datacolumn); 

	var yscale;
	var colorscale;

	//Set scales to either linear or logarithmic
	var scaleselection = option.text();
	switch(scaleselection) {
		case "linear":
			yscale = d3.scale.linear()
				.domain(extents)
				.range([0, 100]);
			break;
		
		case "logarithmic":
			if(extents[0]<=0) extents[0]=1; //how to deal with zeroes?
			yscale = d3.scale.log()
				.domain(extents)
				.range([0, 100]);
			break;
		
		default: 
			var palletselection = option.text().split(" ")[1];
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
	}
			

	console.log("dropped "+ colname + " on mark"+marknum);	
	var attachedmarks = d3.selectAll(".mark"+marknum+" .realmark");
	
	var nodeType;
	d3.select(".mark"+marknum+" .realmark").each(function(d,i){nodeType=this.nodeName;}); // better way?
	
	var logextra = 0;
	svgm = d3.select("svg#vis");
	console.log(attachedmarks);
	
	
	
	
	/*if(nodeType==="rect"){
		var marks=svgm.selectAll(".mark"+marknum+" .realmark")
			.data(allData)
	}
	else if(nodeType==="path") {
		var marks=svgm.selectAll("g.mark"+marknum)
			.data([allData])	
	}
	
	
	if(scaleselection==="logarithmic") marks.classed("logX",true);
	if(marks.classed("logX")) logextra=1; // fixes 0 values */
	
	
	
	
/*	if(nodeType==="path")
	{
	}
	else if(nodeType==="rect")
	{
		marks.enter()
		.append("rect")
		.attr("stroke-width","2")
		.attr("class","mark"+marknum)
		.attr("fill","steelblue")
		.attr("stroke","#ccc");
	}	*/
	
	
	logextra = scaleselection==="logarithmic" ? 1 : 0;
	
	switch(nodeType) {
		case "rect":
			
			var marks=svgm.selectAll(".mark"+marknum+" .realmark")
										.data(allData);
										
			switch(parameter) {
				case "height":
					marks.transition()
						.attr("height",function(d,i){
							if(i==n-1) { return 100; } 
							return yscale(d[colname]+logextra);})
						.attr("width",function(d,i) {
							if(i==n-1) { return 20*(n-1); } 
							return 20;})
						.attr("x",function(d,i){
							if(i==n-1) { return 0; } 
							return i*20;})
						.attr("y",function(d,i){
							if(i==n-1) { return 0; } 
							return 100-yscale(d[colname]+logextra);});
					break;
					
				case "width":
					marks.transition()
						.attr("width",function(d,i){
							if(i==n-1) { return 100; }
							return yscale(d[colname]+logextra);})
						.attr("height", function(d,i) {
							if(i==n-1) { return 20*(n-1); } 
							return 20;})
						.attr("x",function(d,i){return 0;})	
						.attr("y",function(d,i){
							if(i==n-1) { return 0; } 
							return i*20;});
					break;
				
				case "fill":
					marks.attr("fill",function(d,i){return colorscale(d[colname]);})		
					break;
					
				case "stroke":
					marks.attr("stroke",function(d,i){return colorscale(d[colname]);})
					break;
			}
	
		case "path":
			
			var arc = d3.svg.arc();
			var marks=svgm.selectAll("g.mark"+marknum)
										.data([allData]);
			
			switch(parameter) {
				case "angle":
					marks.transition()
						.attr("height",function(d,i){return yscale(d[colname]+logextra);})
						.attr("width",20)
						.attr("x",function(d,i){return i*20;})
						.attr("y",function(d,i){return 100-yscale(d[colname]+logextra);});
					break;
					
				case "inner radius":
					arc.outerRadius(100);
					arc.innerRadius(function(d,i){
						return yscale(datacolumn[i]+logextra);
					});
					marks.selectAll("path").transition()
						.attr("d", arc); 						
					break;
				
				case "outer radius":
					arc.innerRadius(0);
					arc.outerRadius(function(d,i){
						return yscale(datacolumn[i]+logextra);
					});
					marks.selectAll("path").transition()
						.attr("d", arc); 			
					break;
					
				case "fill":
					marks.attr("fill",function(d,i){return colorscale(d[colname]);})
					break;
					
				case "stroke":
					marks.attr("stroke",function(d,i){return colorscale(d[colname]);})
					break;
			}
	}
	
	marks.exit().remove();

}



