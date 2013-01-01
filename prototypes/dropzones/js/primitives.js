var primitives = {
    rect: {
        type: 'mark',

        delegate: {
            html: '<div class="primitive" style="top: 0px; left: 20px; width: 60px; height: 150px"></div>',
            x: 75,
            y: 30,
            height: 170,
            width: 100,
        },

        properties: {
            height: {
                label: 'Height',
                if_mapped: false,
                value: 7,
                range: function() {
                    return [1, Math.floor(this.yScale()(1))];
                },
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
                range: function() {
                    return [1, Math.floor(this.xScale()(1))];
                },
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
                    x: 0,
                    y: 80,
                    rotate: -90
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
                    y: 0,
                    rotate: 0
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
                    x: 0,
                    y: 0,
                    rotate: 0
                },

                properties: ['fillColor', 'fillOpacity', 'strokeColor', 'strokeWidth']
            }
        },

        defaultDataMapping: 'height',
        mappingXors: [['height', 'width']],

        anchors: {
            left: {
                type: 'edge',
                points: function() {
                    return [[this.x, this.y], [this.x, this.y + this.height]];
                },
                scale: function() {
                    return this.yScale();
                },
                delegate: [[0, 5], [0, 145]]
            },
            right: {
                type: 'edge',
                points: function() {
                    return [[this.x + this.width, this.y], [this.x + this.width, this.y + this.height]];
                },
                scale: function() {
                    return this.yScale();
                },
                delegate: [[95, 5], [95, 145]]
            },
            top: {
                type: 'edge',
                points: function() {
                    return [[this.x, this.y], [this.x + this.width, this.y]];
                },
                scale: function() {
                    return this.xScale();
                },
                delegate: [[25, -10], [75, -10]]
            },
            bottom: {
                type: 'edge',
                points: function() {
                    return [[this.x, this.y + this.height], [this.x + this.width, this.y + this.height]];
                },
                scale: function() {
                    return this.xScale();
                },
                delegate: [[25, 165], [75, 165]]
            }
        },

        dataCol: function() {
            var heightMapped = this.properties.height.hasOwnProperty('mapped');
            return heightMapped ? this.properties.height.mapped : this.properties.width.mapped;
        },

        xScale: function() {
            var xScale;

            if(this.properties.height.hasOwnProperty('mapped'))
                xScale = d3.scale.ordinal()
                    .domain(d3.range(0, fullData.length))
                    .rangeBands([0, this.width]);
            else
                xScale = d3.scale.linear()
                    .domain(this.extents())
                    .range([0, this.width]);

            return xScale;
        },

        yScale: function() {
            var yScale;

            if(this.properties.height.hasOwnProperty('mapped'))
                yScale = d3.scale.linear()
                    .domain(this.extents())
                    .range([this.height, 0]);
            else
                yScale = d3.scale.ordinal()
                    .domain(d3.range(0, fullData.length))
                    .rangeBands([0, this.height]); 

            return yScale;
        },

        extents: function() {
            var dataCol = this.dataCol();
            return d3.extent(fullData, function(d) { return d[dataCol] });
        },

        visualization: function(preview) {
            var mark    = this;   // For callbacks
            var dataCol = this.dataCol();
            var xScale  = this.xScale();
            var yScale  = this.yScale();
            var x, y, height, width;

            var group = createGroup.call(this);

            group.attr('transform', 'translate(' + [this.x, this.y].join(',') + ')')
                .attr('width',  this.width)
                .attr('height', this.height);

            if(this.properties.height.hasOwnProperty('mapped')) {
                width  = this.properties.width.value;
                height = function(d, i) { return mark.height - yScale(d[dataCol]); };

                x = function(d, i) { return xScale(i); };
                y = function(d, i) { return yScale(d[dataCol]); };

            } else {
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

    cartesian_axes: {
        type: 'axes',
        anchors_to: ['edge'],

        // This is awful, the delegate should just re-use the
        // visualization, somehow. 
        // This is some crazy black magic.
        // Basically, position approx to anchor.delegate but
        // outside the boundaries of host.delegate. 
        delegate: function() {
            var primitive = this;   // For callbacks
            var host   = this.host();
            var anchor = host.anchors[this.anchoredTo];
            var width  = anchor.delegate[1][0] - anchor.delegate[0][0];
            var height = anchor.delegate[1][1] - anchor.delegate[0][1];
            var x = host.delegate.x + anchor.delegate[0][0];
            var y = host.delegate.y + anchor.delegate[0][1];

            if(width == 0)
                width = 20;
            if(height == 0)
                height = 20;

            switch(this.anchoredTo) {
                case 'left':
                    x -= width;
                    translate = [19, -5];
                break;

                case 'right':
                    translate = [0, -5];
                break;

                case 'top':
                    y -= height;
                    translate = [-1, 19];
                break;

                case 'bottom':
                    translate = [-1, 0];
                break;
            }

            var drawAxes = function() {
                var axis = d3.svg.axis()
                    .orient(this.anchoredTo)
                    .scale(anchor.scale.call(host));

                d3.select('#' + primitive.id)
                    .append("svg")
                        .attr("class", "axis")
                        .attr("width", width)
                        .attr("height", height)
                        .append("g")
                            .attr("transform", "translate(" + translate.join(',') + ")")
                            .call(axis);
            };

            return {
                html: '',
                script: drawAxes,
                x: x,
                y: y,
                width: width,
                height: height
            };
        },

        host: function() {
            return panels[this.panelId][this.hostId];
        },

        axis: function() {
            var host  = this.host();
            var scale = host.anchors[this.anchoredTo].scale.call(host);

            return d3.svg.axis()
                .scale(scale)
                .orient(this.anchoredTo);
        },

        visualization: function(preview) {
            var host  = this.host();
            var group = createGroup.call(this);

            var translate = host.anchors[this.anchoredTo].points.call(host)[0];

            group.attr('class', 'axis')
                .attr('transform', 'translate(' + translate.join(',') + ')')
                .attr('width',  host.width)
                .attr('height', host.height)
                .attr('opacity', function() { 
                    return preview ? 0.5 : 1; 
                });

            group.call(this.axis());
        }
    }

};

function setMapping(dzId, value) {
    // Automatically map to the first property of the dropzone
    var property = this.dropzones[dzId].properties[0];
    var xors = this.mappingXors;
    for(var i in xors) {
        if(xors[i].indexOf(property) == -1)
            continue;

        for(var j in xors[i])
            delete this.properties[xors[i][j]].mapped;
    }

    this.properties[property].mapped = value;
}

function createGroup() {
    var group = d3.select('svg#vis-stage_' + this.panelId)
        .select('g#' + this.id);

    if(group.empty())
        group = d3.select('svg#vis-stage_' + this.panelId)
            .append('g')
                .attr('id', this.id);

    return group;
}