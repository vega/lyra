var svgm;
// stores all active intermediate objects
var marks=[];
// intermediate link between the data, d3, and its dropzones
var markcount=0;
var dataset = [ 5, 10, 15, 20, 25 ];
var zonewidth=50;
var n;
var data=[];
var menus = {"height":["linear","logarithmic"],"width":["linear","logarithmic"],"fill":["Pallet A","Pallet B","Pallet C"],"stroke":["Pallet A","Pallet B","Pallet C"]};
var menulabels;

function dataObjectsToColumn(objectarray,colname)
{
	var column=[];
	for(var i in objectarray)
	{
		column.push(objectarray[i][colname]);
	}
	return column;
}
$(document).ready(function(){
		
	$.getJSON("./olympics.json",function(response){
		// use d3 loader instead?
		for (var attr in response) {
			data[attr] = response[attr];
		}
		n=data.length;
		
		// populate list of columns
		for( var label in data[0]) {
			var newelement=$("<li class=\"column\"></li>");
			newelement.text(label);
			newelement.appendTo($("#data ul"));
		}
		$(".column").draggable({
			start:function(event,ui){
				$(".menudiv").show();
			},
			stop:function(event,ui){
				$(".menudiv").hide(500); // necessary or drop won't register
			}
		})
		.draggable("option","helper","clone");
	});
		
    $(".mark").draggable()
	.draggable("option","revert","invalid")
	.draggable("option","helper","clone");

     $( "#region" ).droppable({
		accept: ".mark",
        drop: function( event, ui ) {
			var x,y;
			var dragged=ui.draggable;
			var visarea = $("#vis");
			x=event.pageX - visarea.offset().left;
			y=event.pageY - visarea.offset().top;
			xmlns = "http://www.w3.org/2000/svg";
			if(dragged.hasClass("mark")) {


				svgm = d3.select("svg#vis");
				svgm.selectAll(".mark"+markcount)
					.data(dataset)
					.enter()
					.append("rect")
					.attr("height",100)
					.attr("width",50)
					.attr("x",x)
					.attr("y",y)
					.attr("fill","steelblue")
					.attr("stroke","#ccc")
					.attr("stroke-width","2")
					.attr("class","mark"+markcount);
				
				var menudivs=[];
				menulabels=d3.keys(menus);
				var menuitem;
//				console.log(menulabels);
				// make a 1st level menu for each graph
				for (var divnum=0; divnum<menulabels.length; divnum++)
				{
	//				console.log(menulabels[divnum]);
					menuitem=$("<div class=\"menudiv"+divnum+" menudiv\" id=\"menudiv_"+markcount+"_"+divnum+"\" style=\"position:absolute;\">"+menulabels[divnum]+ "</div>");
					
				
					menudivs.push(menuitem);
					menuitem.appendTo($("body"));
					menuitem.hide();
												//move menu item to rect
					var myid = menuitem.attr("id");
					var marknum = myid.split("_")[1];
					var menuindex = myid.split("_")[2];
					var attachedmarks = d3.selectAll(".mark"+marknum);
					
					var minx = +d3.min(attachedmarks, function(d,i){return this.attr("x")});
					var maxy = +d3.max(attachedmarks, function(d,i){return this.attr("y")});
					var visarea = $("#vis");
					 
					menuitem.css("left",(minx+visarea.offset().left-zonewidth-10)+"px");
					menuitem.css("top",maxy+visarea.offset().top+menuindex*20+"px");
					menuitem.droppable({
					
						accept: ".column",
						drop: function(event,ui){
						// TODO take default behavior
						/*
							var marknum=+(($(this).attr("id")).substr(10));
							var colname=ui.draggable.text();
							var datacolumn=[],
							extents=[];
							datacolumn=dataObjectsToColumn(data,colname);
							extents = d3.extent(datacolumn);
							console.log(extents);
							var yscale = d3.scale.linear()
							.domain(extents)
							.range([0, 100]);
							console.log("dropped "+ colname + " on mark"+marknum);		
							svgm = d3.select("svg#vis");
							svgm.selectAll(".mark"+marknum).remove();
							svgm.selectAll(".mark"+marknum)
								.data(data)
								.enter()
								.append("rect")
								.attr("height",function(d,i){return yscale(d[colname]);})
								.attr("width",20)
								.attr("x",function(d,i){return i*20+x;})
								.attr("y",function(d,i){return y+100-yscale(d[colname]);})
								.attr("fill","steelblue")
								.attr("stroke","#ccc")
								.attr("stroke-width","2")
								.attr("class","mark"+marknum);
								*/
							
						},
						activate:function(event,ui){

							
							
							
						},
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
							// Hide other elements
						}
						
					});
					menuitem.droppable("option","tolerance","pointer");
					// make a 2nd level menu for each 1st level menu
					var optionslist = menus[menulabels[divnum]];
					for(var optionnum=0; optionnum<optionslist.length; optionnum++)
					{
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
						option.css("left",(parentX-zonewidth*2)+"px");
						option.css("top",parentY+optionnum*20+"px");
						option.droppable({
							accept: ".column",
							drop:function(event,ui){
								// switch based on parent menu type
								var option = $(this);
								var myid = option.attr("id");
								var marknum = myid.split("_")[1];
								var menuindex = myid.split("_")[2];
								var myparent = d3.select("#menudiv_"+marknum+"_"+menuindex);
								console.log("drop "  + menulabels[menuindex]+" "+option.text());
							},
							activate:function(event,ui){

							},
							deactivate:function(event,ui){
								$(this).hide(500);
							},
							over:function(event,ui)
							{
								
					
							}
						});
						option.droppable("option","tolerance","intersect");
					}
				}
				
				markcount++;					

			}

		}
	});

		






});

		

