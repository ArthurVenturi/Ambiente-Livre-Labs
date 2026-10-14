function toTitle(slug) {
  return slug.split('-').map((chunk) => chunk[0].toUpperCase() + chunk.slice(1)).join(' ');
}

function bySort(sort) {
  if (sort === 'updated') return (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt);
  if (sort === 'stars') return (a, b) => (b.stargazersCount || 0) - (a.stargazersCount || 0);
  return (a, b) => a.name.localeCompare(b.name);
}

function updateURL(filters) {
  const url = new URL(window.location.href);
  Object.entries(filters).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
    else url.searchParams.delete(key);
  });
  history.replaceState(null, '', url);
}

export function initPluginCatalog() {
  const root = document.querySelector('[data-plugin-catalog]');
  const payloadNode = document.getElementById('plugin-data');
  if (!root || !payloadNode) return;

  const results = document.querySelector('[data-results]');
  const template = document.querySelector('[data-result-template]');
  const countNode = document.querySelector('[data-result-count]');
  const emptyNode = document.querySelector('[data-empty]');
  const resetButton = root.querySelector('[data-action="reset"]');

  const plugins = JSON.parse(payloadNode.textContent || '[]');
  const searchInput = root.querySelector('[data-filter="search"]');
  const softwareInput = root.querySelector('[data-filter="software"]');
  const categoryInput = root.querySelector('[data-filter="category"]');
  const sortInput = root.querySelector('[data-filter="sort"]');

  const query = new URLSearchParams(window.location.search);
  searchInput.value = query.get('q') || '';
  softwareInput.value = query.get('software') || '';
  categoryInput.value = query.get('category') || '';
  sortInput.value = query.get('sort') || 'name';

  const render = () => {
    const active = {
      q: searchInput.value.trim().toLowerCase(),
      software: softwareInput.value,
      category: categoryInput.value,
      sort: sortInput.value
    };

    const filtered = plugins
      .filter((plugin) => {
        if (active.software && plugin.software !== active.software) return false;
        if (active.category && !(plugin.categories || []).includes(active.category)) return false;
        if (!active.q) return true;
        const haystack = [plugin.name, plugin.description, plugin.purpose, ...(plugin.verifiedCapabilities || [])]
          .join(' ')
          .toLowerCase();
        return haystack.includes(active.q);
      })
      .sort(bySort(active.sort));

    results.innerHTML = '';
    filtered.forEach((plugin) => {
      const clone = template.content.cloneNode(true);
      clone.querySelector('[data-field="name"]').textContent = plugin.name;
      clone.querySelector('[data-field="description"]').textContent = plugin.description || plugin.purpose || 'No summary available.';
      clone.querySelector('[data-field="software"]').textContent = toTitle(plugin.software || 'uncurated');
      clone.querySelector('[data-field="categories"]').textContent = (plugin.categories || []).map(toTitle).join(', ');
      clone.querySelector('[data-field="language"]').textContent = plugin.language || 'Unknown';
      clone.querySelector('[data-field="stars"]').textContent = String(plugin.stargazersCount ?? 0);
      clone.querySelector('[data-field="repoLink"]').href = plugin.htmlUrl;
      const detailsPath = `/plugins/${plugin.slug}/`;
      clone.querySelector('[data-field="detailsLink"]').href = detailsPath;
      clone.querySelector('[data-field="detailsLinkSecondary"]').href = detailsPath;
      results.append(clone);
    });

    countNode.textContent = `${filtered.length} plugin${filtered.length === 1 ? '' : 's'} found`;
    emptyNode.hidden = filtered.length !== 0;
    updateURL(active);
  };

  [searchInput, softwareInput, categoryInput, sortInput].forEach((input) => {
    input.addEventListener('input', render);
    input.addEventListener('change', render);
  });

  resetButton.addEventListener('click', () => {
    searchInput.value = '';
    softwareInput.value = '';
    categoryInput.value = '';
    sortInput.value = 'name';
    render();
  });

  render();
}
