function updateURL(filters) {
  const url = new URL(window.location.href);
  Object.entries(filters).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
    else url.searchParams.delete(key);
  });
  history.replaceState(null, '', url);
}

export function initTalksCatalog() {
  const root = document.querySelector('[data-talks-catalog]');
  const payloadNode = document.getElementById('talk-data');
  if (!root || !payloadNode) return;

  const talks = JSON.parse(payloadNode.textContent || '[]');
  const results = document.querySelector('[data-results]');
  const template = document.querySelector('[data-result-template]');
  const countNode = document.querySelector('[data-result-count]');
  const emptyNode = document.querySelector('[data-empty]');
  const resetButton = root.querySelector('[data-action="reset"]');

  const searchInput = root.querySelector('[data-filter="search"]');
  const eventInput = root.querySelector('[data-filter="event"]');
  const yearInput = root.querySelector('[data-filter="year"]');

  const years = [...new Set(talks.map((talk) => talk.eventYear).filter(Boolean))].sort((a, b) => b - a);
  years.forEach((year) => {
    const option = document.createElement('option');
    option.value = String(year);
    option.textContent = String(year);
    yearInput.append(option);
  });

  const query = new URLSearchParams(window.location.search);
  searchInput.value = query.get('q') || '';
  eventInput.value = query.get('event') || '';
  yearInput.value = query.get('year') || '';

  const render = () => {
    const active = {
      q: searchInput.value.trim().toLowerCase(),
      event: eventInput.value,
      year: yearInput.value
    };

    const filtered = talks.filter((talk) => {
      if (active.event && talk.eventSlug !== active.event) return false;
      if (active.year && String(talk.eventYear) !== active.year) return false;
      if (!active.q) return true;
      return `${talk.title} ${talk.summary}`.toLowerCase().includes(active.q);
    });

    results.innerHTML = '';
    filtered.forEach((talk) => {
      const clone = template.content.cloneNode(true);
      clone.querySelector('[data-field="title"]').textContent = talk.title;
      clone.querySelector('[data-field="summary"]').textContent = talk.summary || 'No summary available.';
      clone.querySelector('[data-field="event"]').textContent = talk.event;
      clone.querySelector('[data-field="eventYear"]').textContent = talk.eventYear || '—';
      const safeSlug = typeof talk.slug === 'string' && /^[a-z0-9-]+$/.test(talk.slug) ? talk.slug : null;
      const safeTalkLink = safeSlug ? `/talks/${encodeURIComponent(safeSlug)}/` : null;
      if (safeTalkLink) {
        clone.querySelector('[data-field="link"]').href = safeTalkLink;
        clone.querySelector('[data-field="linkSecondary"]').href = safeTalkLink;
      } else {
        clone.querySelector('[data-field="link"]').removeAttribute('href');
        clone.querySelector('[data-field="linkSecondary"]').removeAttribute('href');
      }
      results.append(clone);
    });

    countNode.textContent = `${filtered.length} talk${filtered.length === 1 ? '' : 's'} found`;
    emptyNode.hidden = filtered.length !== 0;
    updateURL(active);
  };

  [searchInput, eventInput, yearInput].forEach((input) => {
    input.addEventListener('input', render);
    input.addEventListener('change', render);
  });

  resetButton.addEventListener('click', () => {
    searchInput.value = '';
    eventInput.value = '';
    yearInput.value = '';
    render();
  });

  render();
}
