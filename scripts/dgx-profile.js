/* Real, curated Nsight intervals; all timestamps are relative to one graph launch. */
(async () => {
  const chart = document.getElementById('trace-chart');
  if (!chart) return;
  try {
    const response = await fetch('data/dgx-spark-inference-profile.json');
    if (!response.ok) throw new Error('Trace data unavailable');
    const { step } = await response.json();
    const full = document.getElementById('trace-full');
    const detail = document.getElementById('trace-detail');
    const pan = document.getElementById('trace-pan');
    const offset = document.getElementById('trace-offset');
    const position = document.getElementById('trace-position');
    const status = document.getElementById('trace-window');
    let zoomed = false;
    const svgNS = 'http://www.w3.org/2000/svg';
    const element = (name, attributes, text) => {
      const node = document.createElementNS(svgNS, name);
      for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, value);
      if (text !== undefined) node.textContent = text;
      return node;
    };
    offset.max = Math.max(0, step.durationMs - 5);
    function draw() {
      const width = chart.clientWidth;
      if (width < 1) return;
      const left = 2, right = width - 12, height = 286;
      const start = zoomed ? Math.min(Number(offset.value), step.durationMs - 5) : 0;
      const span = zoomed ? 5 : step.durationMs;
      const x = (time) => left + (time - start) / span * (right - left);
      const svg = element('svg', { width, height, role: 'img', 'aria-label': `Measured timeline from ${start.toFixed(1)} to ${(start + span).toFixed(1)} milliseconds. Four labeled rows show CPU submission and three GPU kernel categories.` });
      svg.append(element('title', {}, 'One measured decode step on NVIDIA GB10'));
      svg.append(element('desc', {}, 'CPU graph submission, Q4_K matrix-vector kernels, Q6_K matrix-vector kernels, and other GPU kernels. Bars in different rows can overlap in time.'));
      const rows = ['CPU · graph submission', 'GPU · Q4_K matrix-vector', 'GPU · Q6_K matrix-vector', 'GPU · other kernels'];
      rows.forEach((label, i) => {
        const y = i * 60;
        svg.append(element('text', { x: left, y: y + 14, class: 'trace-label' }, label));
        svg.append(element('rect', { x: left, y: y + 23, width: right - left, height: 22, class: 'trace-track' }));
      });
      const marks = [[0, step.graphLaunchMs, -1], ...step.kernels];
      for (const [a, duration, category] of marks) {
        const b = a + duration;
        if (b <= start || a >= start + span) continue;
        const clippedA = Math.max(a, start), clippedB = Math.min(b, start + span);
        const row = category + 1;
        svg.append(element('rect', { x: x(clippedA), y: row * 60 + 23, width: x(clippedB) - x(clippedA), height: 22,
          class: ['cpu-launch', 'kernel-q4', 'kernel-q6', 'kernel-other'][row] }));
      }
      const ticks = width < 420 ? 2 : 4;
      for (let i = 0; i <= ticks; i++) {
        const value = start + span * i / ticks, xpos = x(value);
        svg.append(element('line', { x1: xpos, x2: xpos, y1: 237, y2: 242, class: 'trace-grid' }));
        svg.append(element('text', { x: xpos, y: 258, 'text-anchor': i === 0 ? 'start' : i === ticks ? 'end' : 'middle', class: 'trace-tick' }, `${value.toFixed(1)} ms`));
      }
      chart.replaceChildren(svg);
      position.textContent = `${start.toFixed(1)} ms`;
      status.textContent = `${start.toFixed(1)}–${(start + span).toFixed(1)} ms shown · ${step.kernelCount.toLocaleString()} kernels in the complete step`;
    }
    function select(detailMode) {
      zoomed = detailMode;
      full.setAttribute('aria-pressed', String(!zoomed));
      detail.setAttribute('aria-pressed', String(zoomed));
      pan.hidden = !zoomed;
      draw();
    }
    full.addEventListener('click', () => select(false));
    detail.addEventListener('click', () => select(true));
    offset.addEventListener('input', draw);
    new ResizeObserver(draw).observe(chart);
    document.getElementById('trace-controls').hidden = false;
    draw();
  } catch {
    // The article, measurements, and data link remain readable without the enhancement.
    document.getElementById('trace-window').textContent = 'Interactive trace unavailable. The measured results and data download remain available.';
  }
})();
