const tabList = document.querySelector('[role="tablist"]');
const projectTabs = [...document.querySelectorAll('[role="tab"]')];
const projectTypes = ['commercial', 'personal'];

function selectProjectTab(selectedTab, moveFocus = false) {
  for (const tab of projectTabs) {
    const isSelected = tab === selectedTab;
    tab.classList.toggle('is-active', isSelected);
    tab.setAttribute('aria-selected', String(isSelected));
    tab.tabIndex = isSelected ? 0 : -1;
    document.getElementById(tab.getAttribute('aria-controls')).hidden = !isSelected;
  }

  if (moveFocus) selectedTab.focus();
}

for (const [index, tab] of projectTabs.entries()) {
  tab.addEventListener('click', () => selectProjectTab(tab));
  tab.addEventListener('keydown', (event) => {
    let nextIndex;
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % projectTabs.length;
    if (event.key === 'ArrowLeft') nextIndex = (index - 1 + projectTabs.length) % projectTabs.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = projectTabs.length - 1;

    if (nextIndex !== undefined) {
      event.preventDefault();
      selectProjectTab(projectTabs[nextIndex], true);
    }
  });
}

function addText(parent, tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  element.textContent = text;
  parent.append(element);
  return element;
}

function addProjectLink(container, url, label) {
  if (!url) return;
  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.append(document.createTextNode((label || 'More info') + ' '));
  addText(link, 'span', '', '↗');
  container.append(link);
}

function createProjectCard(project, index) {
  const card = document.createElement('article');
  card.className = 'project-card';

  const visual = document.createElement('div');
  visual.className = `project-visual visual-${project.type}`;
  const image = document.createElement('img');
  image.src = project.image;
  image.alt = project.imageAlt || `${project.name} game artwork`;
  image.addEventListener('error', () => {
    visual.classList.add('image-missing');
    image.remove();
  }, { once: true });
  visual.append(image);
  addText(visual, 'span', 'visual-label', `${project.type === 'commercial' ? 'COMMERCIAL' : 'PERSONAL'} GAME / ${String(index + 1).padStart(2, '0')}`);
  card.append(visual);

  const info = document.createElement('div');
  info.className = 'project-info';
  const titleRow = document.createElement('div');
  titleRow.className = 'project-title-row';
  const title = document.createElement('div');
  const kicker = [project.type === 'commercial' ? 'COMMERCIAL' : 'PERSONAL', project.subtitle].filter(Boolean).join(' · ');
  addText(title, 'p', 'project-kicker', kicker);
  addText(title, 'h2', 'project-name', project.name);
  addText(title, 'h4', 'project-company', project.company || 'Personal Project');
  titleRow.append(title);
  addText(titleRow, 'span', 'project-number', String(index + 1).padStart(2, '0'));
  info.append(titleRow);

  if (project.categories?.length) {
    const tags = document.createElement('div');
    tags.className = 'tags';
    for (const category of project.categories) addText(tags, 'span', '', category);
    info.append(tags);
  }

  if (project.contributions?.length) {
    const detail = document.createElement('div');
    detail.className = 'project-detail';
    addText(detail, 'p', 'detail-label', 'MY CONTRIBUTIONS');
    const list = document.createElement('ul');
    for (const contribution of project.contributions) addText(list, 'li', '', contribution);
    detail.append(list);
    if (project.sampleContributions) {
      addText(detail, 'p', 'project-placeholder', '(Sample copy — replace these examples with your own.)');
    }
    info.append(detail);
  }

  const links = document.createElement('div');
  links.className = 'project-links';
  addProjectLink(links, project.playUrl, project.playLabel || 'Play game');
  addProjectLink(links, project.repositoryUrl, project.repositoryLabel || 'Source code');
  for (const extraLink of project.additionalLinks || []) {
    addProjectLink(links, extraLink.url, extraLink.label);
  }
  if (links.childElementCount) info.append(links);

  card.append(info);
  return card;
}

function renderProjects(projects) {
  for (const type of projectTypes) {
    const matching = projects.filter((project) => project.type === type);
    const list = document.getElementById(`${type}-projects`);
    const count = String(matching.length).padStart(2, '0');
    document.querySelector(`#tab-${type} .tab-count`).textContent = count;
    document.querySelector(`#panel-${type} .group-count`).textContent = `${count} —`;
    for (const [index, project] of matching.entries()) {
      list.append(createProjectCard(project, index));
    }
    if (!matching.length) addText(list, 'p', 'empty-projects', 'Projects coming soon.');
  }
}

async function loadProjects() {
  try {
    const response = await fetch('./projects.json', { cache: 'no-cache' });
    if (!response.ok) throw new Error(`Could not load projects.json (${response.status})`);
    const projects = await response.json();
    renderProjects(projects);
  } catch (error) {
    console.error(error);
    addText(tabList, 'p', 'project-load-error', 'Projects could not be loaded. Please check projects.json.');
  }
}

loadProjects();
