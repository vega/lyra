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
                x: 0,
                y: 0,
                width: 15,
                height: 150,

                label: {
                    text: 'Height',
                    x: -50,
                    y: 0
                },

                fields: {
                    scale: {
                        label: 'Scale',
                        type: 'menu',
                        if_mapped: true,
                        value: 'Linear',
                        options: ['Linear', 'Logarithmic']
                    }, 
                    height: {
                        label: 'Height',
                        if_mapped: false,
                        value: 15,
                        range: [1, 30],  // How to set dynamically?
                        step: 1,
                        type: 'slider'
                    }
                }
            },
            width: {
                x: 20,
                y: 155,
                width: 60,
                height: 15,

                label: {
                    text: 'Width',
                    x: 0,
                    y: 15
                },

                fields: {
                    scale: {
                        label: 'Scale',
                        type: 'menu',
                        if_mapped: true,
                        value: 'Linear',
                        options: ['Linear', 'Logarithmic']
                    }, 
                    width: {
                        label: 'Width',
                        if_mapped: false,
                        value: 20,
                        range: [1, 50],  // How to set dynamically?
                        step: 1,
                        type: 'slider'
                    }
                }
            },
            fill: {
                x: 50,
                y: 75,
                width: 75,
                height: 15,

                label: {
                    text: 'Fill',
                    x: 31,
                    y: 15
                },

                fields: {
                    fillColor: {
                        label: 'Fill Color',
                        if_mapped: false,
                        value: '#4682b4',
                        type: 'colorpicker'
                    }, 
                    fillOpacity: {
                        label: 'Fill Opacity',
                        value: 1,
                        range: [0, 1],
                        step: 0.1,
                        type: 'slider'
                    }, 
                    strokeColor: {
                        label: 'Stroke Color',
                        value: '#000000',
                        type: 'colorpicker'
                    }, 
                    strokeWidth: {
                        label: 'Stroke Width',
                        value: 0,
                        range: [0, 5],
                        step: 0.5,
                        type: 'slider'
                    }
                }
            }
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

                width  = this.dropzones.width.fields.width.value;
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
                height = this.dropzones.height.fields.height.value;

                x = 0;
                y = function(d, i) { return yScale(i); }
            }

            var marks = stage.selectAll('rect.mark_' + this.id)
                .data(data);

            marks.enter()
                .append('rect')
                .attr('class', 'mark_' + this.id);

            marks.transition()
                .duration(500)
                .delay(function(d, i) { return 30*i; })
                .attr('width', width)
                .attr('height', height)
                .attr('x', x)
                .attr('y', y)
                .attr('fill', this.dropzones.fill.fields.fillColor.value)
                .attr('fill-opacity', this.dropzones.fill.fields.fillOpacity.value)
                .attr('stroke', this.dropzones.fill.fields.strokeColor.value)
                .attr('stroke-width', this.dropzones.fill.fields.strokeWidth.value)
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