var width = 760;
var height = 760;
var nodes_backup, edges_backup;
var inCentricView;

d3.select('#vis_force_div')
  .style('overflow', 'hidden')
  .style('width', width + 'px')
  .style('height', height + 'px');

var color = d3.scale.category20();

var force = d3.layout.force()
              .charge(-180)
              .linkDistance(60)
              .size([width, height]);

var svg = d3.select('#paint_zone').append('svg')
            .attr('width', width * 2)
            .attr('height', height * 2);

var visdiv_draging = false;
var draging_updating_page = {};

set_mouse_event_handler();
draw_force_directed_graph();
// radial_hash_demo();
