// Each workspace is also a regular section when scripting is unavailable.
const views = [...document.querySelectorAll('.view')];
const papers = [...document.querySelectorAll('.paper-list li')];
const roles = [...document.querySelectorAll('.role')];
const viewNames = {
  desk: 'Flight desk',
  hangar: 'Aircraft hangar',
  flow: 'Flow bench',
  papers: 'Paper library',
  logbook: 'Engineering logbook'
};
const finder = document.querySelector('#finder');
const findButton = document.querySelector('#find');
const query = document.querySelector('#query');
const matches = document.querySelector('#matches');

function filterPapers(kind) {
  let count = 0;
  for (const paper of papers) {
    paper.hidden = kind !== 'all' && paper.dataset.kind !== kind;
    if (!paper.hidden) count++;
  }
  for (const button of document.querySelectorAll('[data-filter]')) {
    button.setAttribute('aria-pressed', String(button.dataset.filter === kind));
  }
  document.querySelector('#paper-count').textContent = count + (count === 1 ? ' paper shown' : ' papers shown');
}

function showView(moveFocus) {
  const target = document.getElementById(location.hash.slice(1));
  const current = target?.closest('.view') || views[0];
  for (const view of views) view.hidden = view !== current;
  document.title = 'Rawad Al Harake | ' + viewNames[current.id];
  document.querySelector('#crumb').textContent = current.id === 'desk' ? '' : ' / ' + viewNames[current.id];
  for (const link of document.querySelectorAll('footer a')) {
    if (link.hash === '#' + current.id) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
  if (target?.matches('.role')) target.open = true;
  if (target?.matches('.paper-list li') && target.hidden) filterPapers('all');
  if (target && target !== current) {
    target.scrollIntoView({block: 'center'});
    if (moveFocus) (target.querySelector('summary, a') || target).focus({preventScroll: true});
  } else {
    window.scrollTo(0, 0);
    if (moveFocus) current.querySelector('h1, h2').focus({preventScroll: true});
  }
}

document.querySelector('#camera').hidden = false;
for (const button of document.querySelectorAll('[data-camera]')) {
  button.addEventListener('click', () => {
    const camera = button.dataset.camera;
    for (const image of document.querySelectorAll('#aircraft-views img')) image.hidden = image.id !== 'view-' + camera;
    for (const note of document.querySelectorAll('[data-note]')) note.hidden = note.dataset.note !== camera;
    for (const option of document.querySelectorAll('[data-camera]')) option.setAttribute('aria-pressed', String(option === button));
  });
}

const offset = document.querySelector('#offset');
document.querySelector('#offset-control').hidden = false;
offset.addEventListener('input', () => {
  const step = Number(offset.value);
  const name = ['Low', 'Below centre', 'Centre', 'Above centre', 'High'][step + 2];
  document.querySelector('#cylinder').style.setProperty('--offset', (-step * 1.65) + 'rem');
  document.querySelector('#position').value = name;
  offset.setAttribute('aria-valuetext', name);
  document.querySelector('#apparatus').setAttribute('aria-label', 'Heated cylinder in a tilted square enclosure. Position: ' + name);
});

document.querySelector('.filters').hidden = false;
for (const button of document.querySelectorAll('[data-filter]')) {
  button.addEventListener('click', () => filterPapers(button.dataset.filter));
}

// Build the search index from the same records visitors can read.
const records = views.slice(1).map(view => ({
  id: view.id,
  title: viewNames[view.id] + ' · ' + view.querySelector('h2').textContent,
  text: view.querySelector('.summary').textContent
}));
records.push({
  id: 'flapping-wings', title: 'MSc research · Flapping-wing aerodynamics',
  text: document.querySelector('.research-note').textContent
});
for (const paper of papers) records.push({id: paper.id, title: paper.querySelector('h3').textContent, text: paper.textContent});
for (const role of roles) records.push({id: role.id, title: role.querySelector('strong').textContent, text: role.textContent});
records.push({id: 'toolkit', title: 'Engineering tools & education', text: document.querySelector('.bio').textContent});

function updateMatches() {
  const term = query.value.trim().toLowerCase();
  const words = term.split(/\s+/);
  const results = term ? records.filter(record => words.every(word => (record.title + ' ' + record.text).toLowerCase().includes(word))) : records.slice(0, 4);
  matches.replaceChildren();
  for (const result of results) {
    const row = document.createElement('li');
    const link = document.createElement('a');
    link.href = '#' + result.id;
    link.textContent = result.title;
    link.addEventListener('click', () => {
      finder.close();
      if (location.hash === link.hash) showView(true);
    });
    row.append(link);
    matches.append(row);
  }
  document.querySelector('#match-count').textContent = results.length ? (term ? results.length + ' found' : '') : 'No matches. Try an aircraft, a tool or a paper title.';
}

function openFinder() {
  if (finder.open) return;
  query.value = '';
  updateMatches();
  finder.showModal();
  query.focus();
}

if (typeof finder.showModal === 'function') {
  findButton.hidden = false;
  findButton.addEventListener('click', openFinder);
  query.addEventListener('input', updateMatches);
  document.querySelector('#close-finder').addEventListener('click', () => finder.close());
  document.addEventListener('keydown', event => {
    if (event.key !== '/' || event.ctrlKey || event.altKey || event.metaKey || event.target.closest('input, textarea, [contenteditable]')) return;
    event.preventDefault();
    openFinder();
  });
}
document.querySelector('.skip').addEventListener('click', event => {
  event.preventDefault();
  document.getElementById('content').focus();
});
window.addEventListener('hashchange', () => showView(true));
showView(false);
