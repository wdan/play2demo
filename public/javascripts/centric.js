
function search_center() {
    var data = do_ajax('/_get_centric_data', 'center', '#search-center-text');
    if (!inCentricView) {
        inCentricView = true;
    }
    draw_centric_graph(data[0], data[1]);
}


function draw_centric_graph(nodes, edges) {
    var max = 0;
    var root_index = 0;
    var edge_matrix = new Array(nodes.length);
    for (var i = 0; i < nodes.length; i++) {
        edge_matrix[i] = new Array(nodes.length);
        if (max < nodes[i]['step'])
            max = nodes[i]['step'];
        if (nodes[i]['step'] == 0)
            root_index = i;
    }
    for (var i = 0; i < nodes.length; i++)
        for (var j = 0; j < nodes.length; j++)
            edge_matrix[i][j] = 0;
    var r = (Math.min(height, width) - 20) / (2 * max);
    var positions = calc_nodes_positions(nodes, root_index, r, edge_matrix);
    force.stop();
    update_centric_svg(positions, nodes, edges, r, max, edge_matrix);
}

function update_centric_svg(positions, nodes, edges, r, max, edge_matrix) {
    draw_axis(r, max);

    svg.selectAll('.circle')
       .transition().duration(1000)
       .attr('r', 5)
       .attr('cx', function(d, i) {
           return positions[i]['x'];
       })
       .attr('cy', function(d, i) {
           return positions[i]['y'];
       });

    svg.selectAll('.node')
       .transition().duration(1000)
       .style('fill', function(d, i) {
           return color(d.group);
       });

    svg.selectAll('.link')
       .transition().duration(1000)
       .attr('class', 'common link')
       .attr('x1', function(d, i) {
           return positions[edges[i]['source']]['x'];
       })
       .attr('y1', function(d, i) {
           return positions[edges[i]['source']]['y'];
       })
       .attr('x2', function(d, i) {
           return positions[edges[i]['target']]['x'];
       })
       .attr('y2', function(d, i) {
           return positions[edges[i]['target']]['y'];
       })
       .style('stroke-opacity', function(d, i) {
           if (!edge_matrix[edges[i]['source']][edges[i]['target']] == 1)
               return 0.1;
           else
               return 1;
       });

    svg.selectAll('.node')
       .select('text')
       .transition().duration(1000)
       .attr('transform', function(d, i) {
           if (this.getClientRects()[0] == undefined) {
               return ['translate(', positions[i]['x'], ',', (positions[i]['y'] + 13), ')'].join('');
           }
           if (this.getAttribute('text-anchor') == 'start') {
               return ['translate(', (positions[i]['x'] - this.getClientRects()[0]['width'] / 2),
                       ',', (positions[i]['y'] + 13), ')'].join('');
           } else if (this.getAttribute('text-anchor') == 'end') {
               return ['translate(', (positions[i]['x'] + this.getClientRects()[0]['width'] / 2),
                       ',', (positions[i]['y'] + 13), ')'].join('');
           } else {
               return ['translate(', positions[i]['x'], ',',
                       (positions[i]['y'] + 13), ')'].join('');
           }
       });
}

function calc_nodes_positions(nodes, root_index, r, edge_matrix) {
    var res = {};
    var cx = width / 2;
    var cy = height / 2;
    calc_node(cx, cy, r, 0, root_index, nodes, res, 0, Math.PI * 2, edge_matrix);
    return res;
}

function calc_node(cx, cy, r, c, now, nodes, res, theta1, theta2, edge_matrix) {
    var l = r * c;
    var theta = theta1 + (theta2 - theta1) / 2;
    res[now] = {};
    res[now]['x'] = calc_tx(cx, l, theta);
    res[now]['y'] = calc_ty(cy, l, theta);
    if (nodes[now]['subtree-num'] == 1)
        return;
    var children = nodes[now]['children'];
    var sum = nodes[now]['subtree-num'] - 1;
    var portion = 0;
    for (var i = 0; i < children.length; i++) {
        var t_index = children[i];
        edge_matrix[now][t_index] = 1;
        edge_matrix[t_index][now] = 1;
        var left_theta = theta1 + (theta2 - theta1) * portion;
        portion += nodes[t_index]['subtree-num'] * 1.0 / sum;
        var right_theta = theta1 + (theta2 - theta1) * portion;
        var delta_theta = Math.acos(c / (c + 1));
        if (right_theta - left_theta > 2 * delta_theta) {
            var t = (right_theta - left_theta - 2 * delta_theta) / 2;
            calc_node(cx, cy, r, c + 1, t_index, nodes, res, left_theta + t,
                      right_theta - t, edge_matrix);
        }
        else {
            calc_node(cx, cy, r, c + 1, t_index, nodes, res,
                      left_theta, right_theta, edge_matrix);
        }
    }
}

function calc_tx(cx, l, theta) {
    return cx + l * Math.sin(theta);
}

function calc_ty(cy, l, theta) {
    return cy - l * Math.cos(theta);
}
