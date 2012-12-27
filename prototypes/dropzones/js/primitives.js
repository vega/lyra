var primitives = {
    rect: {
        type: 'mark',

        delegate: {
            html: '<div class="primitive" style="top: 0px; left: 20px; width: 60px; height: 150px"></div>',
            height: 170,
            width: 100
        },

        dropzones: {
            height: {
                label: {
                    text: 'Height',
                    x: -50,
                    y: 0
                },
                x: 0,
                y: 0,
                width: 15,
                height: 150,

                fields: [{
                    label: 'Scale',
                    type: 'menu',
                    options: ['Linear', 'Logarithmic']
                }, {
                    label: 'Margin',
                    if_unlinked: true,
                    type: 'slider'
                }]
            },
            width: {
                label: {
                    text: 'Width',
                    x: 0,
                    y: 15
                },
                x: 20,
                y: 155,
                width: 60,
                height: 15,

                fields: [{
                    label: 'Scale',
                    type: 'menu',
                    options: ['Linear', 'Logarithmic']
                }, {
                    label: 'Margin',
                    if_unlinked: true,
                    type: 'slider'
                }]
            },
            // fill: {
            //     label: 'Fill',
            //     fields: [{
            //         label: 'Fill Color',
            //         if_unlinked: true,
            //         type: 'colorpicker'
            //     }, {
            //         label: 'Fill Opacity',
            //         type: 'slider'
            //     }, {
            //         label: 'Stroke Color',
            //         type: 'colorpicker'
            //     }, {
            //         label: 'Stroke Width',
            //         type: 'slider'
            //     }]
            // }
        },

        defaultDataMapping: 'height',
        mappingXors: [['height', 'width']],

        visualization: function(panelId, preview) {
            var xScale, yScale;
            var x, y, height, width;
            var heightMapped = this.dropzones.height.hasOwnProperty('mapped');
            var dataCol = heightMapped ? this.dropzones.height.mapped : this.dropzones.width.mapped;
            var data = [];
            for(var i = 0; i < fullData.length; i++)
                data.push(fullData[i][dataCol]);
            var extents = d3.extent(data);
            var stage = d3.select('svg#vis-stage_' + panelId);

            if(heightMapped) {
                xScale = d3.scale.linear()
                    .domain([0, data.length])
                    .range([0, parseInt(stage.style('width'))]);

                yScale = d3.scale.linear()
                    .domain(extents)
                    .range([0, parseInt(stage.style('height'))]);

                width  = 20;
                height = function(d, i) { return yScale(d); };

                x = function(d, i) { return xScale(i); };
                y = function(d, i) { 
                    return parseInt(stage.style('height')) - yScale(d); 
                };

            } else {
                xScale = d3.scale.linear()
                    .domain(extents)
                    .range([0, parseInt(stage.style('width'))]);

                yScale = d3.scale.linear()
                    .domain([0, data.length])
                    .range([0, parseInt(stage.style('height'))]);                    

                width  = function(d, i) { return xScale(d); };
                height = 15;

                x = 0;
                y = function(d, i) { return yScale(i); }
            }

            var marks = stage.selectAll('rect.mark_' + this.id)
                .data(data);

            marks.enter()
                .append('rect')
                .attr('class', 'mark_' + this.id)

            marks.transition()
                .duration(500)
                .attr('width', width)
                .attr('height', height)
                .attr('x', x)
                .attr('y', y)
                .attr('fill', 'steelblue')
                .attr('opacity', function() { 
                    return preview ? 0.5 : 1; 
                });
        }
    },

    // arc: {

    // }

};

function setMapping(mark, dropzone, value) {
    var dropzones = mark.dropzones;
    var xors = mark.mappingXors;
    for(var i in xors) {
        if(xors[i].indexOf(dropzone) == -1)
            continue;

        for(var j in xors[i])
            delete dropzones[xors[i][j]].mapped;
    }

    dropzones[dropzone].mapped = value;

    return mark;
}