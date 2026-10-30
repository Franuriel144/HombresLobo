function nightAction(game, players, action, targetId) {
  const night = game.nightData ||= {attacks: [], protection: null, done: {}, charmed: []};
  const resources = game.resources ||= {heal: true, poison: true, infection: true, previousProtection: null};
  const index = game.states.findIndex(state => state && state.id === targetId);
  const state = game.states[index], name = players[index];
  const fail = text => ({ok:false, text});
  const success = text => ({ok:true, text});
  const wolf = i => game.states[i]?.wolf || ['Hombre lobo','Lobo feroz','Infecto padre de los lobos','Hombre lobo albino'].includes(players[i]);
  if (!state || state.alive === false) return fail('Selecciona un personaje vivo.');
  if (action === 'protect') {
    if (resources.previousProtection === targetId) return fail('El defensor no puede proteger al mismo jugador dos noches seguidas.');
    if (name === 'Niña pequeña') return fail('El defensor no puede proteger a la niña pequeña.');
    night.protection = targetId; night.done.defender = true; return success('Protección registrada para esta noche.');
  }
  if (['wolves','fierce','white'].includes(action)) {
    if (night.done[action]) return fail('La acción ya se ha registrado esta noche.');
    if (action === 'white' && !wolf(index)) return fail('El lobo albino solo puede atacar a un hombre lobo.');
    if (action === 'fierce' && wolf(index)) return fail('El lobo feroz no puede atacar a un hombre lobo.');
    if (action === 'wolves' && wolf(index)) return fail('La manada no puede elegir a un hombre lobo.');
    night.attacks.push({target:targetId, source:action, saved:false}); night.done[action] = true;
    return success('Ataque registrado. La víctima se resolverá al amanecer.');
  }
  if (action === 'infect') {
    if (!resources.infection) return fail('El infecto ya ha utilizado su poder.');
    const attack = night.attacks.find(a => a.source === 'wolves' && a.target === targetId && !a.saved && !a.infected);
    if (!attack) return fail('Selecciona a la víctima de la manada de esta noche.');
    night.infectionUsed = true;
    if (name === 'Anciano' && !state.elderBitten) { state.elderBitten = true; attack.saved = true; resources.infection = false; return success('El anciano resiste la primera mordedura. El poder de infección se ha gastado.'); }
    attack.infected = true; state.wolf = true; resources.infection = false; return success('Infección registrada. El personaje conserva su poder.');
  }
  if (action === 'heal') {
    if (!resources.heal) return fail('La poción de vida ya se ha utilizado.');
    const attack = night.attacks.find(a => a.target === targetId && !a.saved && !a.infected && a.source !== 'poison' && !(a.source !== 'white' && night.protection === targetId));
    if (!attack) return fail('Elige una víctima pendiente de un ataque.');
    night.attacks.filter(a => a.target === targetId && a.source !== 'poison' && !a.infected).forEach(a => { a.saved = true; });
    resources.heal = false; night.witchActed = true; return success('Poción de vida utilizada. La víctima ha sido salvada de los ataques registrados.');
  }
  if (action === 'poison') {
    if (!resources.poison) return fail('La poción de muerte ya se ha utilizado.');
    night.attacks.push({target:targetId, source:'poison', saved:false}); resources.poison = false; night.witchActed = true; return success('Poción de muerte utilizada. La muerte se resolverá al amanecer.');
  }
  if (action === 'love') {
    if (state.lover) return fail('Este personaje ya está seleccionado como enamorado.');
    if (game.states.filter(s => s?.lover).length >= 2) return fail('Ya hay dos enamorados registrados.');
    state.lover = true; return success('Enamorado registrado.');
  }
  if (action === 'charm') {
    if (name === 'Flautista' && !state.wolf) return fail('El flautista no puede hechizarse a sí mismo.');
    if (state.charmed) return fail('Este personaje ya está hechizado.');
    if (night.charmed.length >= 2) return fail('El flautista ya ha hechizado a dos jugadores esta noche.');
    state.charmed = true; night.charmed.push(targetId); return success('Hechizo registrado.');
  }
  if (action === 'model') { if (name === 'Niño salvaje') return fail('El modelo debe ser otro jugador.'); game.childModel = targetId; return success('Modelo del niño salvaje registrado.'); }
  if (action === 'fox') {
    if (night.foxActed) return fail('El zorro ya ha utilizado su poder esta noche.');
    const alive = players.map((_, i) => i).filter(i => game.states[i]?.alive !== false); const position = alive.indexOf(index);
    if (alive.length < 3 || position < 0) return fail('Se necesitan al menos tres jugadores vivos para formar el grupo.');
    const group = [alive[(position + alive.length - 1) % alive.length], index, alive[(position + 1) % alive.length]];
    const found = group.some(wolf); night.foxActed = true;
    if (!found) { resources.foxLost = true; return success('No hay ningún lobo entre los tres. El zorro pierde su poder.'); }
    return success('Hay al menos un lobo entre los tres. El zorro conserva su poder.');
  }
  return fail('Acción no disponible.');
}
function resolveNight(game, players) {
  const night = game.nightData; if (!night || night.resolved) return [];
  const deaths = [];
  for (const attack of night.attacks) {
    if (attack.saved || attack.infected || (['wolves','fierce'].includes(attack.source) && attack.target === night.protection)) continue;
    const i = game.states.findIndex(s => s?.id === attack.target); const state = game.states[i];
    if (!state || state.alive === false) continue;
    if (players[i] === 'Anciano' && ['wolves','fierce'].includes(attack.source) && !state.elderBitten) { state.elderBitten = true; continue; }
    state.alive = false; state.deathPhase = 'night'; state.deathNight = game.night; state.deathCause = attack.source === 'wolves' ? 'wolves' : 'other'; deaths.push(i);
    if (state.wolf || ['Hombre lobo','Lobo feroz','Infecto padre de los lobos','Hombre lobo albino','Niño salvaje','Perro lobo'].includes(players[i])) game.settings.fierce = false;
  }
  if (deaths.some(i => game.states[i].lover)) for (let i = 0; i < players.length; i++) if (game.states[i]?.lover && game.states[i].alive !== false) { game.states[i].alive = false; game.states[i].deathPhase = 'night'; game.states[i].deathNight = game.night; game.states[i].deathCause = 'other'; deaths.push(i); }
  if (deaths.some(i => game.states[i].id === game.childModel)) for (let i = 0; i < players.length; i++) if (players[i] === 'Niño salvaje' && game.states[i].alive !== false) game.states[i].wolf = true;
  game.resources.previousProtection = night.protection; night.resolved = true; return deaths;
}
if (typeof module !== 'undefined') module.exports = {nightAction, resolveNight};
