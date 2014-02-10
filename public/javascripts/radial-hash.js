function radial_hash_demo() {
    var t_edges, t_nodes;
    var t_ajax_data = {
        type: 'GET',
        url: '_get_centric_data',
        success: function(data) {
            t_edges = data.edges;
            t_nodes = data.nodes;
        },
        async: false
    };
    t_ajax_data['data'] = 'center=414&max=2';
    // 698, 414, 0
    $.ajax(t_ajax_data);
    draw_radial_hash_graph(t_nodes, t_edges);
}

function draw_radial_hash_graph(t_nodes, t_edges) {
    var max = 10.1;
    var max_step = 2;
    var root_index = 0;
    var r = 300 / max_step;
    draw_axis(r, max_step);
    draw_ruler(r, max, max_step);
    var circles_info = draw_radial_hash_circles(t_nodes, r, max, max_step);
    draw_radial_hash_edges(t_nodes, t_edges, circles_info, max_step, max, r);
}

function draw_radial_hash_edges(t_nodes, t_edges, circles_info,
                                max_step, max, r) {
    var radial_hash_edges_info = calc_radial_hash_edges_info(t_nodes,
            t_edges, max_step);
    var radial_hash_lines_pos = calc_radial_hash_lines_pos(radial_hash_edges_info,
            circles_info, max_step, max, r);
    var line1 = [];
    var line2 = [];
    var path = [];
    for (var i = 0; i < radial_hash_lines_pos.length; i++) {
        var t = radial_hash_lines_pos[i];
        line1[i] = {'x1': t['x1'], 'x2': t['x2'], 'y1': t['y1'], 'y2': t['y2']};
        line2[i] = {'x1': t['x3'], 'x2': t['x4'], 'y1': t['y3'], 'y2': t['y4']};
        path[i] = {'sx': t['x2'], 'sy': t['y2'], 'tx': t['x3'], 'ty': t['y3'],
                   'large-arc': t['large-arc'], 'radius': t['radius'],
                   'angle1': t['angle1'], 'angle2': t['angle2'],
                   'clockwise': t['clockwise']};
    }
    draw_vertical_lines(line1, line2);
    draw_circular_paths(path);
}

function draw_circular_paths(path) {
    svg.selectAll('.path')
    .data(path)
    .enter()
    .append('path')
    .attr('class', 'path')
    .attr('angle1', function(d) {
        return d.angle1;
    })
    .attr('angle2', function(d) {
        return d.angle2;
    })
    .attr('d', function(d) {
        var s = 'M ';
        s += d.sx;
        s += ' ';
        s += d.sy;
        s += ' A ';
        s += d['radius'];
        s += ' ';
        s += d['radius'];
        s += '  0 ';
        s += d['large-arc'];
        s += ' ';
        s += d['clockwise'];
        s += ' ';
        s += d.tx;
        s += ' ';
        s += d.ty;
        return s;
    });
}

function draw_vertical_lines(line1, line2) {
    svg.selectAll('.line1')
       .data(line1)
       .enter()
       .append('line')
       .attr('class', 'line1')
       .attr('x1', function(d) {
           return d.x1;
       })
       .attr('y1', function(d) {
           return d.y1;
       })
       .attr('x2', function(d) {
           return d.x2;
       })
       .attr('y2', function(d) {
           return d.y2;
       });

    svg.selectAll('.line2')
       .data(line2)
       .enter()
       .append('line')
       .attr('class', 'line2')
       .attr('x1', function(d) {
           return d.x1;
       })
       .attr('y1', function(d) {
           return d.y1;
       })
       .attr('x2', function(d) {
           return d.x2;
       })
       .attr('y2', function(d) {
           return d.y2;
       });
}

function calc_radial_hash_lines_pos(radial_hash_edges_info, circles_info,
                                    max_step, max, r) {
    radial_hash_lines_pos = [];
    var cnt = 0;
    for (var i = 1; i < max_step; i++) {
        for (var key1 in radial_hash_edges_info[i])
            for (var key2 in radial_hash_edges_info[i][key1]) {
                var circle1 = circles_info[i][key1];
                var circle4 = circles_info[i + 1][key2];
                var delta_degree = Math.abs(circle1['angle'] - circle4['angle']) * 1;
                if (delta_degree > Math.PI * 2)
                    delta_degree = Math.PI * 2 - 0.1;
                var l = r * i + r * delta_degree / (2 * Math.PI);
                //var l = r * i + r * log2(1 + delta_degree) / log2(2 * Math.PI);
                var t_dict = {};
                var angle1 = circle1['angle'];
                var angle2 = circle4['angle'];
                if (angle1 - angle2 < 0 - Math.PI) {
                    t_dict['large-arc'] = 1;
                    t_dict['clockwise'] = 1;
                }else if (angle1 - angle2 >= 0 - Math.PI && angle1 - angle2 < 0) {
                    t_dict['large-arc'] = 0;
                    t_dict['clockwise'] = 1;
                }else if (angle1 - angle2 >= 0 && angle1 - angle2 < Math.PI) {
                    t_dict['large-arc'] = 1;
                    t_dict['clockwise'] = 1;
                }else {
                    t_dict['large-arc'] = 0;
                    t_dict['clockwise'] = 1;
                }
                t_dict['x1'] = circle1['x'];
                t_dict['y1'] = circle1['y'];
                t_dict['x2'] = width / 2 + l * Math.sin(circle1['angle']);
                t_dict['y2'] = height / 2 - l * Math.cos(circle1['angle']);
                t_dict['x3'] = width / 2 + l * Math.sin(circle4['angle']);
                t_dict['y3'] = height / 2 - l * Math.cos(circle4['angle']);
                t_dict['x4'] = circle4['x'];
                t_dict['y4'] = circle4['y'];
                t_dict['angle1'] = circle1['angle'];
                t_dict['angle2'] = circle4['angle'];
                t_dict['radius'] = l;
                t_dict['weight'] = radial_hash_edges_info[i][key1][key2];
                radial_hash_lines_pos[cnt] = t_dict;
                cnt += 1;
            }
    }
    return radial_hash_lines_pos;
}

function calc_radial_hash_edges_info(t_nodes, t_edges, max_step) {
    var edges = {};
    var nodes_degree = {};
    var nodes_steps = {};
    for (var i = 0; i < t_nodes.length; i++) {
        if (!nodes_degree[t_nodes[i]['name']]) {
            nodes_degree[t_nodes[i]['name']] = t_nodes[i]['degree'];
            nodes_steps[t_nodes[i]['name']] = t_nodes[i]['step'];
        }
    }
    var cnt = 0;
    var radial_hash_edges_info = [];
    for (var i = 0; i <= max_step; i++)
        radial_hash_edges_info[i] = {};
    for (var i = 0; i < t_edges.length; i++) {
        var src = t_edges[i]['source'];
        var tgt = t_edges[i]['target'];
        var src_step = nodes_steps[src];
        var tgt_step = nodes_steps[tgt];
        if (src_step != tgt_step && src_step != 0 && tgt_step != 0) {
            var t_dict;
            var id_1, id_2;
            if (src_step < tgt_step) {
                t_dict = radial_hash_edges_info[src_step];
                id_1 = src;
                id_2 = tgt;
            }else {
                t_dict = radial_hash_edges_info[tgt_step];
                id_1 = tgt;
                id_2 = src;
            }
            if (t_dict[nodes_degree[id_1]] == null) {
                t_dict[nodes_degree[id_1]] = {};
            }
            if (t_dict[nodes_degree[id_1]][nodes_degree[id_2]] == null) {
                t_dict[nodes_degree[id_1]][nodes_degree[id_2]] = 1;
            }else {
                t_dict[nodes_degree[id_1]][nodes_degree[id_2]] += 1;
            }
            cnt++;
        }
    }
    return radial_hash_edges_info;
}

function draw_radial_hash_circles(t_nodes, r, max, max_step) {
    var circles_info = calc_radial_hash_circles_info(t_nodes, r,
            max, max_step);
    var circles_pos = [];
    for (var i = 0; i <= max_step; i++) {
        var t_arr = Object.keys(circles_info[i]).map(function(key) {
            return circles_info[i][key];
        });
        circles_pos = circles_pos.concat(t_arr);
    }
    var nodes = svg.selectAll('g.node')
                   .data(circles_pos)
                   .enter()
                   .append('g')
                   .attr('class', function(d) {
                       if (d.step == 0)
                           return 'circle0';
                       else if (d.step == 1)
                           return 'circle1';
                       else if (d.step == 2)
                           return 'circle2';
                       else if (d.step == 3)
                           return 'circle3';
                   });

    var max_count = [];
    for (var i = 0; i <= max_step; i++) {
        max_count[i] = 0;
    }
    var tot_max = 0;
    for (var i = 0; i < circles_pos.length; i++)
        if (circles_pos[i]['count'] > max_count[circles_pos[i]['step']]) {
            max_count[circles_pos[i]['step']] = circles_pos[i]['count'];
            if (circles_pos[i]['count'] > tot_max)
                tot_max = circles_pos[i]['count'];
        }
    nodes.append('circle')
         .attr('class', 'circle')
         .attr('r', function(d) {

              //return 7;

             //var max = max_count[d.step];
             //var r_base = 4 + d.step * 4;
             //return 0.3 * r_base + (d.count / max) * 0.7 * r_base;

             return 0.3 * 10 + (d.count / tot_max) * 0.7 * 10;

             //return 0.3 * 10 + (log2(d.count) / log2(tot_max)) * 0.7 * 10;
         })
         .attr('cx', function(d) {
             return d.x;
         })
         .attr('cy', function(d) {
             return d.y;
         })
         .style('opacity', function(d) {
             var max = max_count[d.step];
             return 0.3 + 0.7 * (d.count / max);
             //return 0.3 + 0.7 * (log2(d.count) / log2(max));
         });
    return circles_info;
}

function calc_radial_hash_circles_info(nodes, r, max, max_step) {
    var circles_info = [];
    var cx = width / 2;
    var cy = height / 2;
    for (var i = 0; i <= max_step; i++) {
        circles_info[i] = {};
    }
    for (var i = 0; i < nodes.length; i++) {
        var t_degree = nodes[i]['degree'];
        var t_step = nodes[i]['step'];
        if (circles_info[t_step][t_degree]) {
            circles_info[t_step][t_degree]['count'] += 1;
        }else {
            var t_node = {};
            var t_f_degree = log2(nodes[i]['degree']);
            var t_portion = t_f_degree / max;
            var t_angle = t_portion * 2 * Math.PI;
            t_node['x'] = cx + r * nodes[i]['step'] * Math.sin(t_angle);
            t_node['y'] = cy - r * nodes[i]['step'] * Math.cos(t_angle);
            t_node['count'] = 1;
            t_node['angle'] = t_angle;
            t_node['degree'] = t_degree;
            t_node['step'] = nodes[i]['step'];
            circles_info[t_step][t_degree] = t_node;
        }
    }
    return circles_info;
}
