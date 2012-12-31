var primitives = {
    rect: {
        type: 'mark',

        delegate: {
            html: '<div class="primitive" style="top: 0px; left: 20px; width: 60px; height: 150px"></div>',
            height: 170,
            width: 100
        },

        properties: {
            height: {
                label: 'Height',
                if_mapped: false,
                value: 7,
                range: [1, 30],  // How to set dynamically?
                step: 1,
                type: 'slider'
            },
            heightScale: {
                label: 'Scale',
                type: 'menu',
                if_mapped: 'height',
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
            },
            widthScale: {
                label: 'Scale',
                type: 'menu',
                if_mapped: 'width',
                value: 'Linear',
                options: ['Linear', 'Logarithmic']
            }, 
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

                properties: ['height', 'heightScale']
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

                properties: ['width', 'widthScale']
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

                properties: ['fillColor', 'fillOpacity', 'strokeColor', 'strokeWidth']
            }
        },

        defaultDataMapping: 'height',
        mappingXors: [['height', 'width']],

        visualization: function(preview) {
            var xScale, yScale;
            var x, y, height, width;
            var primitive = this;   // For callbacks
            var heightMapped = this.properties.height.hasOwnProperty('mapped');
            var dataCol = heightMapped ? this.properties.height.mapped : this.properties.width.mapped;
            var extents = d3.extent(fullData, function(d) { return d[dataCol] });
            var group = d3.select('svg#vis-stage_' + this.panelId)
                .select('g#' + this.id);
 
            if(group.empty())
                group = d3.select('svg#vis-stage_' + this.panelId)
                    .append('g')
                        .attr('id', this.id);

            group.attr('transform', 'translate(' + this.x + ', ' + this.y + ')')
                .attr('width',  this.width)
                .attr('height', this.height);

            if(heightMapped) {
                xScale = d3.scale.linear()
                    .domain([0, fullData.length])
                    .range([0, this.width]);

                yScale = d3.scale.linear()
                    .domain(extents)
                    .range([0, this.height]);

                width  = this.properties.width.value;
                height = function(d, i) { return yScale(d[dataCol]); };

                x = function(d, i) { return xScale(i); };
                y = function(d, i) { return primitive.height - yScale(d[dataCol]); };

            } else {
                xScale = d3.scale.linear()
                    .domain(extents)
                    .range([0, this.width]);

                yScale = d3.scale.linear()
                    .domain([0, fullData.length])
                    .range([0, this.height]);                    

                width  = function(d, i) { return xScale(d[dataCol]); };
                height = this.properties.height.value;

                x = 0;
                y = function(d, i) { return yScale(i); }
            }

            var marks = group.selectAll('rect.mark_' + this.id)
                .data(fullData);

            marks.enter()
                .append('rect')
                .attr('class', 'mark_' + this.id);

            marks.transition()
                // .duration(0)
                // .delay(function(d, i) { return 30*i; })
                .attr('width', width)
                .attr('height', height)
                .attr('x', x)
                .attr('y', y)
                .attr('fill', this.properties.fillColor.value)
                .attr('fill-opacity', this.properties.fillOpacity.value)
                .attr('stroke', this.properties.strokeColor.value)
                .attr('stroke-width', this.properties.strokeWidth.value)
                .attr('opacity', function() { 
                    return preview ? 0.5 : 1; 
                });
        },

        // Properties of the mark that get defined when the mark
        // is added to a panel/visualization
        id: 0,
        panelId: 0,
        x: 100,
        y: 100,
        width: 500,
        height: 250
    },

    // arc: {

    // }

};

function setMapping(mark, dropzone, value) {
    // Automatically map to the first property of the dropzone
    var property = mark.dropzones[dropzone].properties[0];
    var xors = mark.mappingXors;
    for(var i in xors) {
        if(xors[i].indexOf(property) == -1)
            continue;

        for(var j in xors[i])
            delete mark.properties[xors[i][j]].mapped;
    }

    mark.properties[property].mapped = value;

    return mark;
}