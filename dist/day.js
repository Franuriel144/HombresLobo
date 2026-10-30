function votingMajority(players, states, offices) {
  const eligible = players.map((_, i) => i).filter(i => states[i]?.alive !== false && states[i]?.canVote !== false);
  const mayorVote = eligible.includes(offices?.alcalde) ? 1 : 0;
  const total = eligible.length + mayorVote;
  return {voters: eligible.length, total, majority: total ? Math.floor(total / 2) + 1 : 0, mayorVote};
}
function eliminateByVote(game, players, index) {
  const state = game.states[index], name = players[index];
  if (!state || state.alive === false) return {ok:false, text:'Selecciona un personaje vivo.'};
  if (name === 'Tonto de la aldea' && state.idiotRevealed) return {ok:false, text:'El Tonto revelado no puede volver a ser eliminado por votación.'};
  if (name === 'Tonto de la aldea' && !state.idiotRevealed) {
    state.idiotRevealed = true; state.canVote = false;
    if (game.offices.alcalde === index) game.offices.alcalde = null;
    return {ok:true, text:'El Tonto revela su carta, sobrevive y pierde su derecho a voto. Si era alcalde, el cargo queda vacante.'};
  }
  const deaths = [];
  const kill = (i, cause) => { const s = game.states[i]; if (!s || s.alive === false) return; s.alive = false; s.deathPhase = 'day'; s.deathNight = game.night; s.deathCause = cause; deaths.push(i); if (s.wolf || ['Hombre lobo','Lobo feroz','Infecto padre de los lobos','Hombre lobo albino','Niño salvaje','Perro lobo'].includes(players[i])) game.settings.fierce = false; };
  kill(index, 'vote');
  if (state.lover) game.states.forEach((s, i) => { if (s?.lover) kill(i, 'other'); });
  if (deaths.some(i => game.states[i].id === game.childModel)) game.states.forEach((s, i) => { if (players[i] === 'Niño salvaje' && s?.alive !== false) s.wolf = true; });
  const messages = [`Eliminados: ${deaths.map(i => `${i + 1}. ${players[i]}`).join(', ')}.`];
  if (deaths.some(i => players[i] === 'Cazador')) messages.push('El cazador debe elegir a quién disparar: resuélvelo manualmente.');
  if (name === 'Anciano') messages.push('El anciano ha sido votado: comprueba la pérdida de poderes de los aldeanos.');
  if (deaths.includes(game.offices.alcalde) || deaths.includes(game.offices.guardia)) messages.push('Hay un cargo cuyo titular ha sido eliminado: transfiérelo.');
  return {ok:true, text:messages.join(' ')};
}
if (typeof module !== 'undefined') module.exports = {votingMajority, eliminateByVote};
