import * as d3 from 'd3';

interface GraphNode {
  id: string;
  label: string;
  type: 'entity' | 'event' | 'market' | 'narrative';
  slug: string;
}

interface GraphLink {
  source: string;
  target: string;
}

export function initRelationshipGraph(containerId: string) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const entity = container.dataset.entity || '';
  const events: string[] = JSON.parse(container.dataset.events || '[]');
  const markets: string[] = JSON.parse(container.dataset.markets || '[]');

  const nodes: GraphNode[] = [
    { id: entity, label: entity, type: 'entity', slug: entity },
    ...events.map(s => ({ id: s, label: s, type: 'event' as const, slug: `/events/${s}` })),
    ...markets.map(s => ({ id: s, label: s, type: 'market' as const, slug: `/markets/${s}` })),
  ];

  const links: GraphLink[] = nodes.slice(1).map(n => ({ source: entity, target: n.id }));

  const width = container.clientWidth || 600;
  const height = container.clientHeight || 256;

  d3.select(`#${containerId}`).selectAll('*').remove();

  const svg = d3.select(`#${containerId}`)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', [0, 0, width, height]);

  const colorMap: Record<string, string> = {
    entity: '#3b82f6',
    event: '#f59e0b',
    market: '#10b981',
    narrative: '#a855f7',
  };

  const simulation = d3.forceSimulation(nodes as d3.SimulationNodeDatum[])
    .force('link', d3.forceLink(links).id((d: any) => d.id).distance(80))
    .force('charge', d3.forceManyBody().strength(-200))
    .force('center', d3.forceCenter(width / 2, height / 2));

  const link = svg.append('g')
    .selectAll('line')
    .data(links)
    .join('line')
    .attr('stroke', 'rgba(255,255,255,0.1)')
    .attr('stroke-width', 1.5);

  const node = svg.append('g')
    .selectAll('g')
    .data(nodes)
    .join('g')
    .attr('cursor', 'pointer')
    .call(drag(simulation) as any);

  node.append('circle')
    .attr('r', 8)
    .attr('fill', (d: any) => colorMap[d.type] || '#888');

  node.append('text')
    .text((d: any) => d.label.length > 20 ? d.label.slice(0, 20) + '…' : d.label)
    .attr('dy', 20)
    .attr('text-anchor', 'middle')
    .attr('fill', '#8a8f98')
    .attr('font-size', '11px')
    .attr('font-family', 'JetBrains Mono, monospace');

  node.on('click', (_: any, d: any) => {
    if (d.slug) window.location.href = d.slug;
  });

  node.append('title').text((d: any) => `${d.type}: ${d.label}`);

  simulation.on('tick', () => {
    link
      .attr('x1', (d: any) => d.source.x)
      .attr('y1', (d: any) => d.source.y)
      .attr('x2', (d: any) => d.target.x)
      .attr('y2', (d: any) => d.target.y);

    node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
  });
}

function drag(simulation: d3.Simulation<any, any>) {
  function dragstarted(event: any) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }
  function dragged(event: any) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }
  function dragended(event: any) {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
  }
  return d3.drag()
    .on('start', dragstarted)
    .on('drag', dragged)
    .on('end', dragended);
}
