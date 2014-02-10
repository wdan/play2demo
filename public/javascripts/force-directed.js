function original() {
    var data = do_ajax('/_get_graph_data');
    if (inCentricView) {
        inCentricView = false;
        force.start();
    }
}

function search_single() {
    var data = do_ajax('/_get_single_data', 'n', '#search-single-text');
    if (inCentricView) {
        inCentricView = false;
        force.start();
    }
}

function search_k() {
    var data = do_ajax('/_get_k_large_data', 'k', '#search-k-text');
    if (inCentricView) {
        inCentricView = false;
        force.start();
    }
}

function set_attribute(nodes, edges) {
    svg.selectAll('.axis')
       .remove();
    svg.selectAll('.link')
       .transition().duration(1000)
       .style('visibility', 'visible')
       .attr('class', function(d, i)  {
           var temp_edge_highlight = 'common link';
           if (edges[i].highlight == 1) {
               temp_edge_highlight = 'highlight link';
           }
           return temp_edge_highlight;
       });
    svg.selectAll('.node')
       .transition().duration(1000)
       .style('fill', function(d, i) {
           var temp_node_color = color(d.group);
           if (nodes[i].highlight == 3) {
               temp_node_color = '#d62728';
           }else if (nodes[i].highlight == 2) {
               temp_node_color = '#f7b6d2';
           }else if (nodes[i].highlight == 1) {
               temp_node_color = '#7f7f7f';
           }
           return temp_node_color;
       });
    svg.selectAll('.circle')
       .transition().duration(1000)
       .attr('r', function(d, i) {
           var temp_node_highlight = 5;
           if (nodes[i].highlight == 3) {
               temp_node_highlight = 8;
           }
           return temp_node_highlight;
       });
}

function draw_force_directed_graph() {
    $.getJSON('/_get_graph_data', {}, function(data) {
        var link, node;
        var edges = data.edges;
        var nodes = data.nodes;

        force.nodes(nodes).links(edges).start();

        link = svg.selectAll('.link')
                .data(edges)
                .enter().append('line')
                .attr('class', function(d) {
                    if (d.highlight == 1) {
                        return 'highlight link';
                    }else {
                        return 'common link';
                    }
                })
                .style('stroke-width', function(d) {
                    return Math.sqrt(d.value);
                });

        node = svg.selectAll('g.node')
                .data(nodes)
                .enter().append('g')
                .attr('class', 'node')
                .style('fill', function(d) {
                    if (d.highlight == 3) {
                        return '#d62728';
                    }else if (d.highlight == 2) {
                        return '#f7b6d2';
                    }else if (d.highlight == 1) {
                        return '#7f7f7f';
                    }else {
                        return color(d.group);
                    }
                }).call(force.drag);

        node.append('circle')
            .attr('class', 'circle')
            .attr('r', function(d) {
                if (d.highlight == 3) {
                    return 8;
                }else {
                    return 5;
                }
            });

        node.append('text')
            .attr('fill', 'black')
            .attr('stroke', 'black')
            .text(function(d) {
                return d.name;
            });

        force.on('tick', function() {
            link.attr('x1', function(d) { return d.source.x; })
                .attr('y1', function(d) { return d.source.y; })
                .attr('x2', function(d) { return d.target.x; })
                .attr('y2', function(d) { return d.target.y; });

            node.select('.circle')
                .attr('cx', function(d) { return d.x; })
                .attr('cy', function(d) { return d.y; });

            node.select('text').attr('transform', function(d, i) {
                if (this.getClientRects()[0] === undefined) {
                    return ['translate(', d.x, ',', (d.y + 13), ')'].join('');
                }
                if (this.getAttribute('text-anchor') == 'start') {
                    return ['translate(', (d.x - this.getClientRects()[0]['width'] / 2),
                            ',', (d.y + 13), ')'].join('');
                } else if (this.getAttribute('text-anchor') == 'end') {
                    return ['translate(', (d.x + this.getClientRects()[0]['width'] / 2),
                            ',', (d.y + 13), ')'].join('');
                } else {
                    return ['translate(', d.x, ',', (d.y + 13), ')'].join('');
                }
            });
        });
    });
}
