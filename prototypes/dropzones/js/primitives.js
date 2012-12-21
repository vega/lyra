var primitives = {
    rect: {
        type: 'mark',

        delegate: {
            html: '<div class="primitive" style="top: 0px; left: 20px; width: 60px; height: 150px"></div>',
            height: 175,
            width: 100,
            x: 75,
            y: 15
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
            fill: {
                label: 'Fill',
                fields: [{
                    label: 'Fill Color',
                    if_unlinked: true,
                    type: 'colorpicker'
                }, {
                    label: 'Fill Opacity',
                    type: 'slider'
                }, {
                    label: 'Stroke Color',
                    type: 'colorpicker'
                }, {
                    label: 'Stroke Width',
                    type: 'slider'
                }]
            }
        }
    },

    arc: {
        
    }
};