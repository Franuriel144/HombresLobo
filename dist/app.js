const characters = {
  'Los Aldeanos': ['Aldeano', 'Aldeano-aldeano', 'Vidente', 'Bruja', 'Cazador', 'Cupido', 'Niña pequeña', 'Tonto de la aldea', 'Anciano', 'Cabeza de turco', 'Defensor', 'Zorro', 'Hermana', 'Hermano', 'Domador de osos', 'Comediante', 'Caballero de la espada oxidada', 'Juez tartamudo'],
  'Los Hombres Lobo': ['Hombre lobo', 'Lobo feroz', 'Infecto padre de los lobos'],
  'Los Ambiguos': ['Niño salvaje', 'Perro lobo', 'Sirvienta fiel', 'Ladrón'],
  'Los Solitarios': ['Ángel', 'Flautista', 'Abominable sectario', 'Hombre lobo albino']
};
const images = {
  'Aldeano': 'el-aldeano-comun', 'Hombre lobo': 'los-hombres-lobo-comunes', 'Vidente': 'la-vidente', 'Bruja': 'la-bruja', 'Cazador': 'el-cazador', 'Cupido': 'cupido', 'Niña pequeña': 'la-nina-pequena', 'Ladrón': 'el-ladron',
  'Tonto de la aldea': 'el-tonto-de-la-aldea', 'Anciano': 'el-anciano', 'Cabeza de turco': 'el-cabeza-de-turco', 'Defensor': 'el-protector', 'Flautista': 'el-flautista',
  'Niño salvaje': 'el-nino-salvaje', 'Zorro': 'el-zorro', 'Sirvienta fiel': 'la-abnegada-sirvienta', 'Hermana': 'las-dos-hermanas', 'Hermano': 'los-tres-hermanos', 'Domador de osos': 'el-domador-de-osos', 'Comediante': 'el-comediante', 'Caballero de la espada oxidada': 'el-caballero-de-la-espada-oxidada', 'Ángel': 'el-angel', 'Abominable sectario': 'el-abominable-sectario', 'Infecto padre de los lobos': 'el-infecto-padre-de-todos-los-lobos', 'Perro lobo': 'el-perro-lobo', 'Aldeano-aldeano': 'el-aldeano-aldeano', 'Lobo feroz': 'el-lobo-feroz', 'Juez tartamudo': 'el-juez-tartamudo', 'Hombre lobo albino': 'el-hombre-lobo-albino'
};
function cardImage(name, className) { const img = document.createElement('img'); img.className = className; img.src = `share/cartas/${images[name]}.png`; img.alt = ''; img.draggable = false; return img; }
const seats = document.querySelector('#seats');
const list = document.querySelector('#player-list');
const dialog = document.querySelector('#character-dialog');
const optionsContainer = document.querySelector('#character-options');
const storageKey = 'castronegro-characters-v1';
let players = [];
let editingIndex = null;
const gameKey = 'castronegro-day-v1';
let game = {phase: 'preparation', offices: {alcalde: null, guardia: null}};
try {
  const savedGame = JSON.parse(localStorage.getItem(gameKey) || 'null');
  if (savedGame && ['day', 'night'].includes(savedGame.phase)) game = {...game, ...savedGame, offices: {alcalde: Number.isInteger(savedGame.offices?.alcalde) ? savedGame.offices.alcalde : null, guardia: Number.isInteger(savedGame.offices?.guardia) ? savedGame.offices.guardia : null}};
} catch (_) {}
game.night = Number.isInteger(game.night) ? game.night : 0;
game.step = Number.isInteger(game.step) ? game.step : 0;
game.states = Array.isArray(game.states) ? game.states : [];
game.settings = {...{fox: true, fierce: true, father: true, witch: true, actor: true, siblingConsult: false}, ...game.settings};
if (game.phase === 'night') { game.nightData ||= {attacks: [], protection: null, done: {}, charmed: []}; game.resources ||= {heal: true, poison: true, infection: true, previousProtection: null}; }
function stateAt(index) { const state = game.states[index] ||= {alive: true, wolf: false}; state.id ||= `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`; return state; }
let selectedTarget = null;
let actionMessage = '';
let voteTarget = '';
const officeInfo = {alcalde: {name: 'Alcalde', image: 'el-alguacil'}, guardia: {name: 'Guardia', image: 'el-guardia'}};
function saveGame() { try { localStorage.setItem(gameKey, JSON.stringify(game)); } catch (_) {} }
function assignOffice(office, index) { game.offices[office] = index; saveGame(); render(); }
function openSelector(index = null) {
  editingIndex = index;
  document.querySelector('#dialog-title').textContent = index === null ? 'Añadir personaje' : `Cambiar personaje · asiento ${index + 1}`;
  document.querySelector('.dialog-help').textContent = index === null ? 'Elige una carta para añadirla a la mesa.' : 'Elige la nueva carta para este asiento.';
  dialog.showModal();
}
function movePlayer(from, to) {
  if (from === to || to < 0 || to >= players.length) return;
  selectedTarget = null;
  players.forEach((_, index) => stateAt(index));
  const [player] = players.splice(from, 1); players.splice(to, 0, player); const [state] = game.states.splice(from, 1); game.states.splice(to, 0, state);
  for (const office of Object.keys(officeInfo)) { const index = game.offices[office]; if (index === from) game.offices[office] = to; else if (from < to && index > from && index <= to) game.offices[office]--; else if (to < from && index >= to && index < from) game.offices[office]++; }
  save(); saveGame(); render();
}
function removePlayer(index) {
  selectedTarget = null;
  players.splice(index, 1);
  game.states.splice(index, 1);
  for (const office of Object.keys(officeInfo)) { const holder = game.offices[office]; if (holder === index) game.offices[office] = null; else if (holder !== null && holder > index) game.offices[office]--; }
  save(); saveGame(); render();
}
function makeOfficeToken(office, onBoard = false) {
  const token = document.createElement('button'); token.type = 'button'; token.className = `office-token${onBoard ? ' office-token-board' : ''}`;
  token.setAttribute('aria-label', `Arrastrar ${officeInfo[office].name} a un personaje`); token.title = `Arrastra el cargo de ${officeInfo[office].name}`;
  const img = document.createElement('img'); img.src = `share/cartas/${officeInfo[office].image}.png`; img.alt = ''; img.draggable = false; token.append(img);
  let start = null, moved = false, target = null;
  function clearTarget() { if (target) target.element.classList.remove('drop-target'); target = null; }
  token.addEventListener('pointerdown', event => { if (event.button !== 0) return; start = {x: event.clientX, y: event.clientY}; moved = false; token.setPointerCapture(event.pointerId); });
  token.addEventListener('pointermove', event => {
    if (!start) return; const dx = event.clientX - start.x, dy = event.clientY - start.y;
    if (Math.hypot(dx, dy) < 8 && !moved) return;
    moved = true; token.classList.add('dragging-office'); token.style.translate = `${dx}px ${dy}px`; clearTarget();
    const closest = [...seats.querySelectorAll('.seat')].map(element => { const r = element.getBoundingClientRect(); return {element, index: Number(element.dataset.index), distance: Math.hypot(event.clientX - (r.left + r.width / 2), event.clientY - (r.top + r.height / 2))}; }).sort((a, b) => a.distance - b.distance)[0];
    if (closest && closest.distance < 75) { target = closest; target.element.classList.add('drop-target'); }
  });
  token.addEventListener('pointerup', () => { if (!start) return; start = null; token.style.translate = ''; token.classList.remove('dragging-office'); const chosen = target; clearTarget(); if (moved && chosen) assignOffice(office, chosen.index); });
  token.addEventListener('pointercancel', () => { start = null; moved = false; clearTarget(); token.style.translate = ''; token.classList.remove('dragging-office'); });
  token.addEventListener('click', () => { if (moved) { moved = false; return; } document.querySelector(`#select-${office}`).focus(); });
  return token;
}
function nightSteps() {
  const living = name => players.some((p, i) => p === name && stateAt(i).alive);
  const wolfRoles = ['Hombre lobo', 'Lobo feroz', 'Infecto padre de los lobos', 'Hombre lobo albino'];
  const hasWolf = players.some((p, i) => stateAt(i).alive && (wolfRoles.includes(p) || stateAt(i).wolf));
  const first = game.night === 1, steps = [];
  const add = (condition, id, title, detail) => { if (condition) steps.push({id, title, detail}); };
  add(first && living('Ladrón'), 'thief', 'Ladrón', 'Muéstrale las dos cartas sobrantes. Cambia su personaje en la mesa si elige una.');
  add(first && living('Cupido'), 'cupid', 'Cupido', 'Elige dos enamorados. Anota quiénes son y llama después a los enamorados.');
  add(first && living('Cupido'), 'lovers', 'Los enamorados', 'Toca discretamente a los dos elegidos para que se reconozcan. Si uno muere, el otro también.');
  add(first && living('Juez tartamudo'), 'judge', 'Juez tartamudo', 'Acuerda la señal que permitirá solicitar una segunda votación una vez por partida.');
  add(first && living('Hermana'), 'sisters', 'Las hermanas', 'Despiertan juntas para reconocerse.');
  add(first && living('Hermano'), 'brothers', 'Los hermanos', 'Despiertan juntos para reconocerse.');
  add(first && living('Niño salvaje'), 'child', 'Niño salvaje', 'Elige su modelo. Si este muere, marca al niño como convertido en lobo para las noches siguientes.');
  add(first && living('Domador de osos'), 'bear', 'Domador de osos', 'Identifica su asiento. Al amanecer, comprueba si tiene un lobo como vecino vivo.');
  add(first && living('Perro lobo'), 'dog', 'Perro lobo', 'Elige ser aldeano o lobo. Si elige lobo, marca «Convertido en lobo» en su asiento.');
  add(living('Comediante') && game.settings.actor, 'actor', 'Comediante', 'Puede elegir una de sus tres cartas disponibles. Retira la carta utilizada y resuelve su poder según corresponda.');
  add(living('Vidente'), 'seer', 'Vidente', 'Señala a un jugador; muéstrale su carta.');
  add(living('Zorro') && game.settings.fox && (!game.resources?.foxLost || game.nightData?.foxActed), 'fox', 'Zorro', 'Puede señalar al jugador central de un grupo de tres vecinos vivos.');
  add(living('Defensor'), 'defender', 'Defensor', 'Elige a quién proteger. No puede proteger a la misma persona dos noches consecutivas.');
  add(hasWolf, 'wolves', 'Hombres lobo', 'La manada elige una víctima. Incluye a los personajes convertidos; la niña pequeña puede espiar sin ser llamada.');
  add(living('Hombre lobo albino') && game.night % 2 === 0, 'white', 'Hombre lobo albino', 'Puede elegir a un hombre lobo como víctima. Actúa una noche de cada dos, desde la segunda.');
  add(living('Infecto padre de los lobos') && game.settings.father && (game.resources?.infection !== false || game.nightData?.infectionUsed), 'father', 'Infecto padre de los lobos', 'Pregunta en silencio si infecta a la víctima de la manada en vez de matarla.');
  add(living('Lobo feroz') && game.settings.fierce, 'fierce', 'Lobo feroz', 'Puede elegir una segunda víctima. Pierde este ataque si muere un lobo, el Niño Salvaje o el Perro Lobo.');
  add(living('Bruja') && game.settings.witch && (game.resources?.heal !== false || game.resources?.poison !== false || game.nightData?.witchActed), 'witch', 'Bruja', 'Indícale la víctima que puede salvar. Puede usar sus pociones disponibles; cada una se utiliza una sola vez.');
  add(living('Flautista'), 'piper', 'Flautista', 'Puede hechizar a dos jugadores. Después llama a los hechizados para que se reconozcan.');
  add(living('Flautista'), 'charmed', 'Jugadores hechizados', 'Los jugadores hechizados se despiertan y se reconocen. Comprueba si el Flautista cumple su objetivo.');
  add(!first && game.settings.siblingConsult && living('Hermana'), 'sisterConsult', 'Las hermanas', 'Consulta opcional y silenciosa según la variante para jugadores experimentados.');
  add(!first && game.settings.siblingConsult && living('Hermano'), 'brotherConsult', 'Los hermanos', 'Consulta opcional y silenciosa según la variante para jugadores experimentados.');
  steps.push({id:'dawn', title:'Amanece', detail:'Resuelve y anuncia las víctimas, efectos encadenados y el gruñido del oso. Después sigue con el día y la votación.'});
  return steps;
}
function renderNight() {
  const steps = nightSteps(), list = document.querySelector('#night-steps'); list.replaceChildren();
  game.step = Math.max(0, Math.min(game.step, steps.length - 1));
  document.querySelector('#night-title').textContent = `Noche ${game.night}`;
  steps.forEach((step, index) => { const item = document.createElement('li'); item.textContent = step.title; if (index === game.step) item.className = 'current'; if (index < game.step) item.className = 'completed'; list.append(item); });
  const detail = document.querySelector('#night-detail'); detail.replaceChildren(); const title = document.createElement('strong'); title.textContent = steps[game.step].title; const text = document.createElement('p'); text.textContent = steps[game.step].detail; detail.append(title, text);
  const actions = {wolves:[['wolves','Atacar']], fierce:[['fierce','Atacar']], white:[['white','Atacar']], defender:[['protect','Proteger']], father:[['infect','Infectar']], witch:[['heal','Curar'],['poison','Matar']], cupid:[['love','Enamorar']], piper:[['charm','Hechizar']], child:[['model','Elegir modelo']], fox:[['fox','Comprobar vecinos']]};
  const currentId = steps[game.step].id;
  if (actions[currentId] || currentId === 'seer') {
    const prompt = document.createElement('p'); prompt.className = 'target-prompt'; prompt.textContent = selectedTarget === null ? 'Toca una carta de la mesa o elige un asiento:' : `Seleccionado: asiento ${selectedTarget + 1} · ${players[selectedTarget]}`; detail.append(prompt);
    const select = document.createElement('select'); select.className = 'target-select'; select.setAttribute('aria-label', 'Seleccionar personaje para la acción');
    const placeholder = document.createElement('option'); placeholder.value = ''; placeholder.textContent = 'Seleccionar personaje'; select.append(placeholder);
    players.forEach((name, i) => { if (stateAt(i).alive === false) return; const option = document.createElement('option'); option.value = String(i); option.textContent = `${i + 1}. ${name}`; select.append(option); });
    select.value = selectedTarget === null ? '' : String(selectedTarget); select.addEventListener('change', () => { selectedTarget = select.value === '' ? null : Number(select.value); actionMessage = ''; render(); }); detail.append(select);
    if (currentId === 'seer' && selectedTarget !== null) { const result = document.createElement('p'); result.className = 'action-feedback'; result.textContent = `La carta es ${players[selectedTarget]}. Muéstrala discretamente a la vidente.`; detail.append(result); }
    for (const [action, label] of actions[currentId] || []) { const button = document.createElement('button'); button.type = 'button'; button.className = 'confirm action-button'; button.textContent = label; button.disabled = selectedTarget === null; button.addEventListener('click', () => { if (selectedTarget === null) return; const result = nightAction(game, players, action, stateAt(selectedTarget).id); actionMessage = result.text; saveGame(); render(); }); detail.append(button); }
  }
  if (currentId === 'dog') for (const [label, wolf] of [['Aldeano', false], ['Hombre lobo', true]]) { const button = document.createElement('button'); button.className = 'confirm action-button'; button.type = 'button'; button.textContent = label; button.addEventListener('click', () => { const i = players.findIndex((name, index) => name === 'Perro lobo' && stateAt(index).alive); if (i >= 0) { stateAt(i).wolf = wolf; actionMessage = `Perro lobo: ${label}.`; saveGame(); render(); } }); detail.append(button); }
  if (actionMessage) { const feedback = document.createElement('p'); feedback.className = 'action-feedback'; feedback.setAttribute('role','status'); feedback.textContent = actionMessage; detail.append(feedback); }
  const pending = game.nightData?.attacks?.filter(a => !a.saved && !a.infected) || [];
  if (pending.length) { const status = document.createElement('p'); status.className = 'pending-summary'; status.textContent = `Ataques pendientes: ${pending.map(a => { const i = game.states.findIndex(s => s?.id === a.target); return i < 0 ? 'asiento retirado' : `${i + 1}. ${players[i]}`; }).join(', ')}. Se resuelven al amanecer.`; detail.append(status); }
  document.querySelector('#previous-step').disabled = game.step === 0;
  document.querySelector('#next-step').textContent = game.step === steps.length - 1 ? 'Comenzar el día →' : 'Siguiente →';
  const settings = document.createElement('details'); const summary = document.createElement('summary'); summary.textContent = 'Ajustar poderes y variantes'; settings.append(summary);
  for (const [key, labelText] of [['fox','Zorro conserva su poder'], ['fierce','Lobo feroz conserva su ataque'], ['father','Infecto aún puede infectar'], ['witch','Bruja tiene alguna poción'], ['actor','Comediante tiene cartas'], ['siblingConsult','Consulta opcional de hermanos']]) { const label = document.createElement('label'); const input = document.createElement('input'); input.type = 'checkbox'; input.checked = game.settings[key]; input.addEventListener('change', () => { const current = nightSteps()[game.step]?.id; game.settings[key] = input.checked; const index = nightSteps().findIndex(step => step.id === current); if (index >= 0) game.step = index; saveGame(); renderNight(); }); label.append(input, document.createTextNode(labelText)); settings.append(label); }
  detail.append(settings);
}
document.querySelector('#previous-step').addEventListener('click', () => { game.step = Math.max(0, game.step - 1); selectedTarget = null; actionMessage = ''; saveGame(); render(); });
document.querySelector('#next-step').addEventListener('click', () => { const steps = nightSteps(); if (game.step >= steps.length - 1) { const deaths = resolveNight(game, players); game.dawnReport = deaths.length ? `Víctimas de la noche: ${deaths.map(i => `${i + 1}. ${players[i]}`).join(', ')}. Comprueba los efectos especiales pendientes.` : 'No se ha registrado ninguna muerte nocturna. Comprueba los efectos especiales pendientes.'; game.phase = 'day'; game.step = 0; game.voteFeedback = ''; voteTarget = ''; } else game.step++; selectedTarget = null; actionMessage = ''; saveGame(); render(); });
for (const [group, names] of Object.entries(characters)) {
  const section = document.createElement('section'); const heading = document.createElement('h3'); heading.textContent = group; section.append(heading);
  const grid = document.createElement('div'); grid.className = 'character-grid';
  for (const name of names) { const button = document.createElement('button'); button.type = 'button'; button.className = 'character-option'; button.append(cardImage(name, 'option-card')); const label = document.createElement('span'); label.textContent = name; button.append(label); button.addEventListener('click', () => { if (editingIndex === null) { players.push(name); game.states.push({alive: true, wolf: false}); } else players[editingIndex] = name; save(); saveGame(); render(); dialog.close(); }); grid.append(button); }
  section.append(grid); optionsContainer.append(section);
}
try {
  const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
  if (Array.isArray(saved)) {
    const keep = saved.map((name, index) => ({name, index})).filter(p => Object.values(characters).some(group => group.includes(p.name)));
    players = keep.map(p => p.name);
    if (keep.length !== saved.length) {
      game.states = keep.map(p => game.states[p.index] || {alive: true, wolf: false});
      for (const office of Object.keys(officeInfo)) { const mapped = keep.findIndex(p => p.index === game.offices[office]); game.offices[office] = mapped < 0 ? null : mapped; }
      if (game.phase === 'night') { game.step = 0; actionMessage = 'Se han retirado personajes del catálogo; revisa de nuevo la secuencia de esta noche.'; }
      save(); saveGame();
    }
  }
} catch (_) {}
function save() { try { localStorage.setItem(storageKey, JSON.stringify(players)); } catch (_) {} }
function render() {
  const previousScroll = list.scrollTop; seats.replaceChildren(); list.replaceChildren();
  const started = game.phase !== 'preparation';
  const victory = victoryFor(players, game.states, game);
  const alert = document.querySelector('#victory-alert'); alert.hidden = !victory; alert.textContent = victory ? `🏆 ${victory} Comprueba antes los efectos pendientes y las condiciones especiales.` : '';
  document.querySelector('#phase-icon').textContent = game.phase === 'day' ? '☀' : '☾';
  document.querySelector('#phase-label').textContent = game.phase === 'night' ? `NOCHE ${game.night}` : started ? `DÍA ${game.night + 1}` : 'PREPARANDO LA PARTIDA';
  document.querySelector('#start-day').hidden = started;
  document.querySelector('#start-night').hidden = game.phase !== 'day';
  document.querySelector('#vote-panel').hidden = game.phase !== 'day';
  document.querySelector('#offices').hidden = !started;
  document.querySelector('#night-panel').hidden = game.phase !== 'night';
  const reminder = document.querySelector('#day-reminder'); reminder.hidden = game.phase !== 'day';
  reminder.textContent = game.night === 0 ? (players.includes('Ángel') ? 'El Ángel está en juego: debate y votación eliminatoria antes de la primera noche. Elige también alcalde y guardia.' : 'Elige alcalde y guardia antes de comenzar la noche.') : `${game.dawnReport || 'Comprueba las víctimas y efectos pendientes.'} Consulta al guardia si corresponde y abre el debate y la votación.`;
  document.querySelector('.workspace').classList.toggle('night-layout', game.phase === 'night');
  document.querySelector('.center-sub').textContent = game.phase === 'night' ? `NOCHE ${game.night}` : started ? `DÍA ${game.night + 1}` : 'LA ALDEA DUERME';
  document.querySelector('#counter').textContent = `${players.length} ${players.length === 1 ? 'personaje' : 'personajes'}`;
  document.querySelector('#list-count').textContent = players.length;
  document.querySelector('#empty').hidden = players.length > 0;
  const board = document.querySelector('#board');
  const available = document.querySelector('.board-scroll').clientWidth;
  const size = Math.max(300, available, players.length * 78 / (310 * Math.PI / 180 * .38));
  board.style.width = `${size}px`; board.style.height = `${size}px`; board.style.minHeight = `${size}px`;
  board.style.minWidth = '0';
  players.forEach((name, i) => {
    // The 310° arc starts just after the narrator's 50° opening at the bottom.
    const angle = (115 + 310 * (i + .5) / players.length) * Math.PI / 180;
    const seat = document.createElement('button'); seat.type = 'button'; seat.className = 'seat'; seat.dataset.index = i; seat.setAttribute('aria-label', `${name}, asiento ${i + 1}. Pulsar para cambiar personaje; arrastrar para mover.`);
    if (!stateAt(i).alive) seat.classList.add('dead');
    if (selectedTarget === i && game.phase === 'night') seat.classList.add('selected-target');
    if (game.phase === 'night' && game.nightData?.attacks?.some(a => a.target === stateAt(i).id && !a.saved && !a.infected)) seat.classList.add('pending-target');
    seat.style.left = `${50 + 38 * Math.cos(angle)}%`; seat.style.top = `${50 + 38 * Math.sin(angle)}%`;
    const avatar = cardImage(name, 'avatar');
    const label = document.createElement('span'); label.className = 'seat-name'; label.textContent = name; label.title = name;
    const number = document.createElement('span'); number.className = 'seat-number'; number.textContent = String(i + 1).padStart(2, '0') + (players.includes('Abominable sectario') ? ` · ${i % 2 ? 'A' : 'B'}` : '');
    seat.append(avatar, label, number); seats.append(seat);
    let start = null; let moved = false; let dropTarget = null;
    function nearestTarget(x, y) {
      return [...seats.querySelectorAll('.seat')].filter(other => other !== seat).map(other => {
        const r = other.getBoundingClientRect();
        return {element: other, index: Number(other.dataset.index), distance: Math.hypot(x - (r.left + r.width / 2), y - (r.top + r.height / 2))};
      }).sort((a, b) => a.distance - b.distance)[0];
    }
    function clearTarget() { if (dropTarget) dropTarget.element.classList.remove('drop-target'); dropTarget = null; }
    seat.addEventListener('pointerdown', event => { if (event.button !== 0) return; start = {x: event.clientX, y: event.clientY}; moved = false; seat.setPointerCapture(event.pointerId); });
    seat.addEventListener('pointermove', event => { if (!start) return; const dx = event.clientX - start.x; const dy = event.clientY - start.y; if (Math.hypot(dx, dy) > 8) { moved = true; seat.classList.add('dragging'); seat.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`; clearTarget(); const target = nearestTarget(event.clientX, event.clientY); if (target && target.distance < 90) { dropTarget = target; target.element.classList.add('drop-target'); } } });
    seat.addEventListener('pointerup', event => {
      if (!start) return;
      start = null; seat.classList.remove('dragging'); seat.style.transform = '';
      if (moved) {
        const target = dropTarget; clearTarget();
        if (target) movePlayer(i, target.index);
      }
    });
    seat.addEventListener('pointercancel', () => { start = null; moved = false; clearTarget(); seat.classList.remove('dragging'); seat.style.transform = ''; });
    seat.addEventListener('click', () => { if (moved) { moved = false; return; } const step = game.phase === 'night' ? nightSteps()[game.step]?.id : ''; if (['wolves','fierce','white','defender','father','witch','cupid','piper','child','seer','fox'].includes(step)) { selectedTarget = i; actionMessage = ''; render(); } else openSelector(i); });
    const item = document.createElement('li'); item.className = 'player-item';
    const icon = cardImage(name, 'list-avatar');
    const info = document.createElement('div'); info.className = 'player-info';
    const title = document.createElement('strong'); title.textContent = name;
    const position = document.createElement('small'); position.textContent = `Asiento ${i + 1}${players.includes('Abominable sectario') ? ` · Grupo ${(i + 1) % 2 === 0 ? 'A' : 'B'}` : ''}${stateAt(i).alive ? '' : ' · eliminado'}${stateAt(i).wolf ? ' · lobo' : ''}`; info.append(title, position);
    const controls = document.createElement('div'); controls.className = 'player-controls';
    for (const [symbol, direction, labelText] of [['↑', -1, 'Mover antes'], ['↓', 1, 'Mover después']]) { const move = document.createElement('button'); move.type = 'button'; move.className = 'player-action'; move.textContent = symbol; move.disabled = i + direction < 0 || i + direction >= players.length; move.setAttribute('aria-label', `${labelText}: ${name}, asiento ${i + 1}`); move.addEventListener('click', () => movePlayer(i, i + direction)); controls.append(move); }
    const edit = document.createElement('button'); edit.type = 'button'; edit.className = 'player-action'; edit.textContent = '✎'; edit.setAttribute('aria-label', `Cambiar ${name}, asiento ${i + 1}`); edit.addEventListener('click', () => openSelector(i));
    const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'remove'; remove.textContent = '×'; remove.setAttribute('aria-label', `Eliminar ${name}, asiento ${i + 1}`); remove.addEventListener('click', () => removePlayer(i));
    controls.append(edit, remove); item.append(icon, info, controls);
    if (started) {
      const stateControls = document.createElement('div'); stateControls.className = 'state-controls';
      const fields = [['alive', 'Vivo'], ['wolf', 'Convertido en lobo'], ['canVote', 'Puede votar']];
      if (players.includes('Cupido')) fields.push(['lover', 'Enamorado']);
      if (players.includes('Flautista')) fields.push(['charmed', 'Hechizado']);
      for (const [key, labelText] of fields) {
        const label = document.createElement('label'); const check = document.createElement('input'); check.type = 'checkbox'; check.checked = key === 'canVote' ? stateAt(i).canVote !== false : !!stateAt(i)[key];
        check.addEventListener('change', () => {
          const current = game.phase === 'night' ? nightSteps()[game.step]?.id : null; const state = stateAt(i); state[key] = check.checked;
          if (key === 'alive') { if (!check.checked) { state.deathPhase = game.phase; state.deathNight = game.night; state.deathCause = ''; } else { state.deathPhase = null; state.deathNight = null; state.deathCause = ''; } }
          if (key === 'alive' && !check.checked && (state.wolf || ['Hombre lobo', 'Lobo feroz', 'Infecto padre de los lobos', 'Hombre lobo albino', 'Niño salvaje', 'Perro lobo'].includes(name))) game.settings.fierce = false;
          if (current) { const index = nightSteps().findIndex(step => step.id === current); if (index >= 0) game.step = index; } saveGame(); render();
        });
        label.append(check, document.createTextNode(labelText)); stateControls.append(label);
      }
      if (name === 'Ángel' && !stateAt(i).alive && ((stateAt(i).deathPhase === 'day' && stateAt(i).deathNight === 0) || (stateAt(i).deathPhase === 'night' && stateAt(i).deathNight === 1))) {
        const cause = document.createElement('select'); cause.setAttribute('aria-label', 'Causa de eliminación del Ángel');
        for (const [value, labelText] of [['', 'Causa del Ángel…'], ['vote', 'Votación de la aldea'], ['wolves', 'Ataque de los lobos'], ['other', 'Otra causa']]) { const option = document.createElement('option'); option.value = value; option.textContent = labelText; cause.append(option); }
        cause.value = stateAt(i).deathCause || ''; cause.addEventListener('change', () => { stateAt(i).deathCause = cause.value; saveGame(); render(); }); stateControls.append(cause);
      }
      item.append(stateControls);
    }
    list.append(item);
  });
  if (list.children.length > 3) list.style.maxHeight = `${[...list.children].slice(0, 3).reduce((sum, item) => sum + item.offsetHeight, 0)}px`; else list.style.maxHeight = '';
  list.scrollTop = previousScroll;
  const count = votingMajority(players, game.states, game.offices);
  document.querySelector('#majority-count').textContent = count.majority || '—';
  document.querySelector('#vote-total').textContent = `${count.voters} votantes · ${count.total} votos posibles${count.mayorVote ? ' (incluye el voto doble del alcalde)' : ''}`;
  if (game.phase === 'day') {
    const voteSelect = document.querySelector('#vote-target'); voteSelect.replaceChildren();
    const placeholder = document.createElement('option'); placeholder.value = ''; placeholder.textContent = 'Selecciona un asiento'; voteSelect.append(placeholder);
    players.forEach((name, i) => { if (!stateAt(i).alive) return; const option = document.createElement('option'); option.value = stateAt(i).id; option.textContent = `${i + 1}. ${name}`; voteSelect.append(option); });
    voteSelect.value = voteTarget; if (!voteSelect.value) voteTarget = '';
    const feedback = document.querySelector('#vote-feedback'); feedback.hidden = !game.voteFeedback; feedback.textContent = game.voteFeedback || '';
  }
  const controls = document.querySelector('#office-controls'); controls.replaceChildren();
  if (started) for (const [office, info] of Object.entries(officeInfo)) {
    const row = document.createElement('div'); row.className = 'office-row'; row.append(makeOfficeToken(office));
    const field = document.createElement('div'); field.className = 'office-field'; const label = document.createElement('label'); label.htmlFor = `select-${office}`; label.textContent = info.name; field.append(label);
    const select = document.createElement('select'); select.id = `select-${office}`; select.setAttribute('aria-label', `Asignar ${info.name}`);
    const unassigned = document.createElement('option'); unassigned.value = ''; unassigned.textContent = 'Sin asignar'; select.append(unassigned);
    players.forEach((name, index) => { const option = document.createElement('option'); option.value = String(index); option.textContent = `${index + 1}. ${name}`; select.append(option); });
    const holder = game.offices[office]; select.value = holder !== null && holder < players.length ? String(holder) : ''; select.addEventListener('change', () => assignOffice(office, select.value === '' ? null : Number(select.value))); field.append(select); row.append(field); controls.append(row);
    if (holder !== null && holder >= 0 && holder < players.length) {
      const holderSeat = seats.querySelector(`[data-index="${holder}"]`); const token = makeOfficeToken(office, true); token.style.left = holderSeat.style.left; token.style.top = holderSeat.style.top; token.classList.add(`office-${office}`); seats.append(token);
    }
  }
  if (game.phase === 'night') renderNight();
}
document.querySelector('#open-selector').addEventListener('click', () => openSelector());
document.querySelector('#close-selector').addEventListener('click', () => dialog.close());
document.querySelector('#start-day').addEventListener('click', () => { game.phase = 'day'; saveGame(); render(); });
document.querySelector('#start-night').addEventListener('click', () => { players.forEach((_, i) => stateAt(i)); game.phase = 'night'; game.night++; game.step = 0; game.nightData = {attacks:[], protection:null, done:{}, charmed:[]}; game.resources ||= {heal:true, poison:true, infection:true, previousProtection:null}; selectedTarget = null; actionMessage = ''; saveGame(); render(); });
document.querySelector('#vote-target').addEventListener('change', event => { voteTarget = event.target.value; });
document.querySelector('#vote-eliminate').addEventListener('click', () => {
  const index = game.states.findIndex(state => state?.id === voteTarget);
  const result = eliminateByVote(game, players, index); game.voteFeedback = result.text; if (result.ok) voteTarget = ''; saveGame(); render();
});
document.querySelector('#reset-game').addEventListener('click', () => {
  if (!window.confirm('¿Reiniciar la partida? Se borrarán los personajes, cargos y estados guardados en este navegador.')) return;
  players = []; selectedTarget = null; voteTarget = ''; actionMessage = ''; game = {phase: 'preparation', offices: {alcalde: null, guardia: null}, night: 0, step: 0, states: [], settings: {fox: true, fierce: true, father: true, witch: true, actor: true, siblingConsult: false}};
  save(); saveGame(); render();
});
window.addEventListener('resize', render);
render();
