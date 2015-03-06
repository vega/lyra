![The Lyra Visualization Design Environment](http://idl.cs.washington.edu/static/images/projects/lyra/playfair-new.png)

Lyra is an interactive environment that enables custom visualization design without writing any code. Graphical “marks” can be bound to data fields using property drop zones; dynamically positioned using connectors; and directly moved, rotated, and resized using handles. Lyra also provides a data pipeline interface for iterative visual specification of data transformations and layout algorithms. Lyra is more expressive than interactive systems like Tableau, allowing designers to create custom visualizations comparable to hand-coded visualizations built with D3 or Processing. These visualizations can then be easily published and reused on the Web.

A deployed version of Lyra is [available online](http://idl.cs.washington.edu/projects/lyra/). For more information, check out the [Lyra wiki.](https://github.com/uwdata/lyra/wiki)

# Running locally

You can run lyra locally with [docker](https://docs.docker.com/).

    # Build
    sudo docker build -t uwdata/lyra .

    # Serves on port 9009
    sudo docker run -d -p 9009:8080 uwdata/lyra
