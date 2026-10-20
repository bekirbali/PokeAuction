import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const typeChartPath = path.join(__dirname, '../data/type_chart.json');
const typeChart = JSON.parse(fs.readFileSync(typeChartPath, 'utf8'));

export class BattleEngine {
  static getEffectiveness(moveType, targetTypes) {
    let multiplier = 1;
    const matchups = typeChart[moveType] || {};
    for (const t of targetTypes) {
      if (matchups[t] !== undefined) {
        multiplier *= matchups[t];
      }
    }
    return multiplier;
  }

  static calculateDamage(attacker, defender, move) {
    const isSpecial = move.category === 'special';
    const atk = isSpecial ? attacker.stats.sp_attack : attacker.stats.attack;
    const def = isSpecial ? defender.stats.sp_defense : defender.stats.defense;
    
    if (move.power === 0) {
      return { damage: 0, isCrit: false, effectiveness: 1 };
    }

    const effectiveness = this.getEffectiveness(move.type, defender.types);
    if (effectiveness === 0) {
      return { damage: 0, isCrit: false, effectiveness: 0 };
    }

    const isCrit = Math.random() < 0.12;
    const critMult = isCrit ? 1.5 : 1.0;
    const stab = attacker.types.includes(move.type) ? 1.25 : 1.0;
    const variance = 0.85 + Math.random() * 0.15;

    // Scaled Pokemon formula suitable for ~200-350 HP pool
    const baseDamage = (((2 * 50 / 5 + 2) * move.power * (atk / Math.max(def, 10))) / 50 + 2);
    const finalDamage = Math.max(1, Math.floor(baseDamage * effectiveness * stab * critMult * variance));

    return {
      damage: finalDamage,
      isCrit,
      effectiveness
    };
  }

  static selectBestMove(attacker, defender) {
    let bestMove = attacker.moves[0];
    let highestExpected = -1;

    for (const move of attacker.moves) {
      const eff = this.getEffectiveness(move.type, defender.types);
      const isSpecial = move.category === 'special';
      const stat = isSpecial ? attacker.stats.sp_attack : attacker.stats.attack;
      const expected = move.power * eff * (attacker.types.includes(move.type) ? 1.25 : 1.0) * stat;
      if (expected > highestExpected) {
        highestExpected = expected;
        bestMove = move;
      }
    }
    return bestMove;
  }

  static simulate(p1, p2) {
    // Clone rosters & calculate initial battle HP
    const initTeam = (player) => {
      return {
        id: player.id,
        name: player.name,
        roster: player.lineup.map(p => {
          const maxHp = Math.floor(p.stats.hp * 2.6 + 50);
          return {
            ...p,
            maxHp,
            currentHp: maxHp,
            damageDealt: 0,
            kills: 0
          };
        })
      };
    };

    const team1 = initTeam(p1);
    const team2 = initTeam(p2);

    let idx1 = 0;
    let idx2 = 0;
    const timeline = [];
    let turnCount = 0;

    // Initial enters
    timeline.push({
      type: 'ENTER_FIELD',
      turn: 0,
      playerId: team1.id,
      pokemon: { ...team1.roster[0] }
    });
    timeline.push({
      type: 'ENTER_FIELD',
      turn: 0,
      playerId: team2.id,
      pokemon: { ...team2.roster[0] }
    });

    let activeMatchupKey = null;
    let speedTieWinner = 1;

    while (idx1 < team1.roster.length && idx2 < team2.roster.length && turnCount < 100) {
      turnCount++;
      const pk1 = team1.roster[idx1];
      const pk2 = team2.roster[idx2];

      const matchupKey = `${idx1}_${idx2}`;
      if (activeMatchupKey !== matchupKey) {
        activeMatchupKey = matchupKey;
        speedTieWinner = Math.random() < 0.5 ? 1 : 2;
      }

      // --- DITTO TRANSFORM MECHANIC ---
      // If pk1 is Ditto and hasn't transformed against an opponent:
      if (pk1.id === 132 && !pk1.transformed && pk2.id !== 132) {
        pk1.transformed = true;
        pk1.transformedInto = pk2.name;
        pk1.name = `Ditto (${pk2.name})`;
        pk1.types = [...pk2.types];
        pk1.stats = {
          ...pk2.stats,
          hp: pk1.stats.hp // Ditto keeps its own base HP
        };
        pk1.moves = pk2.moves.map(m => ({ ...m }));
        pk1.sprite = pk2.sprite;
        pk1.spriteBack = pk2.spriteBack;
        pk1.cryUrl = pk2.cryUrl;
        timeline.push({
          type: 'TRANSFORM',
          turn: turnCount,
          playerId: team1.id,
          targetName: pk2.name,
          targetPokemon: {
            ...pk2,
            currentHp: pk1.currentHp,
            maxHp: pk1.maxHp
          }
        });
      }

      // If pk2 is Ditto and hasn't transformed against an opponent:
      if (pk2.id === 132 && !pk2.transformed && pk1.id !== 132) {
        pk2.transformed = true;
        pk2.transformedInto = pk1.name;
        pk2.name = `Ditto (${pk1.name})`;
        pk2.types = [...pk1.types];
        pk2.stats = {
          ...pk1.stats,
          hp: pk2.stats.hp
        };
        pk2.moves = pk1.moves.map(m => ({ ...m }));
        pk2.sprite = pk1.sprite;
        pk2.spriteBack = pk1.spriteBack;
        pk2.cryUrl = pk1.cryUrl;
        timeline.push({
          type: 'TRANSFORM',
          turn: turnCount,
          playerId: team2.id,
          targetName: pk1.name,
          targetPokemon: {
            ...pk1,
            currentHp: pk2.currentHp,
            maxHp: pk2.maxHp
          }
        });
      }

      // Speed check (speed ties maintain consistent initiative throughout the duel)
      const speed1 = pk1.stats.speed;
      const speed2 = pk2.stats.speed;
      const p1First = speed1 > speed2 ? true : (speed1 < speed2 ? false : speedTieWinner === 1);

      const firstFighter = p1First ? { pk: pk1, team: team1, oppPk: pk2, oppTeam: team2 } : { pk: pk2, team: team2, oppPk: pk1, oppTeam: team1 };
      const secondFighter = p1First ? { pk: pk2, team: team2, oppPk: pk1, oppTeam: team1 } : { pk: pk1, team: team1, oppPk: pk2, oppTeam: team2 };

      // 1. First Attack
      const move1 = this.selectBestMove(firstFighter.pk, firstFighter.oppPk);
      const attackRes1 = this.calculateDamage(firstFighter.pk, firstFighter.oppPk, move1);
      
      firstFighter.oppPk.currentHp = Math.max(0, firstFighter.oppPk.currentHp - attackRes1.damage);
      firstFighter.pk.damageDealt += attackRes1.damage;

      timeline.push({
        type: 'ATTACK',
        turn: turnCount,
        attackerPlayerId: firstFighter.team.id,
        attackerPokemon: firstFighter.pk.name,
        defenderPlayerId: firstFighter.oppTeam.id,
        defenderPokemon: firstFighter.oppPk.name,
        move: move1,
        damage: attackRes1.damage,
        isCrit: attackRes1.isCrit,
        effectiveness: attackRes1.effectiveness,
        defenderRemainingHp: firstFighter.oppPk.currentHp,
        defenderMaxHp: firstFighter.oppPk.maxHp
      });

      // Check if defender fainted
      if (firstFighter.oppPk.currentHp <= 0) {
        firstFighter.pk.kills += 1;
        timeline.push({
          type: 'FAINT',
          turn: turnCount,
          playerId: firstFighter.oppTeam.id,
          pokemon: firstFighter.oppPk.name
        });

        if (firstFighter.oppTeam.id === team1.id) {
          idx1++;
          if (idx1 < team1.roster.length) {
            timeline.push({
              type: 'ENTER_FIELD',
              turn: turnCount,
              playerId: team1.id,
              pokemon: { ...team1.roster[idx1] }
            });
          }
        } else {
          idx2++;
          if (idx2 < team2.roster.length) {
            timeline.push({
              type: 'ENTER_FIELD',
              turn: turnCount,
              playerId: team2.id,
              pokemon: { ...team2.roster[idx2] }
            });
          }
        }
        continue; // Round ends immediately on faint
      }

      // 2. Second Attack (Counter Attack)
      const move2 = this.selectBestMove(secondFighter.pk, secondFighter.oppPk);
      const attackRes2 = this.calculateDamage(secondFighter.pk, secondFighter.oppPk, move2);

      secondFighter.oppPk.currentHp = Math.max(0, secondFighter.oppPk.currentHp - attackRes2.damage);
      secondFighter.pk.damageDealt += attackRes2.damage;

      timeline.push({
        type: 'ATTACK',
        turn: turnCount,
        attackerPlayerId: secondFighter.team.id,
        attackerPokemon: secondFighter.pk.name,
        defenderPlayerId: secondFighter.oppTeam.id,
        defenderPokemon: secondFighter.oppPk.name,
        move: move2,
        damage: attackRes2.damage,
        isCrit: attackRes2.isCrit,
        effectiveness: attackRes2.effectiveness,
        defenderRemainingHp: secondFighter.oppPk.currentHp,
        defenderMaxHp: secondFighter.oppPk.maxHp
      });

      if (secondFighter.oppPk.currentHp <= 0) {
        secondFighter.pk.kills += 1;
        timeline.push({
          type: 'FAINT',
          turn: turnCount,
          playerId: secondFighter.oppTeam.id,
          pokemon: secondFighter.oppPk.name
        });

        if (secondFighter.oppTeam.id === team1.id) {
          idx1++;
          if (idx1 < team1.roster.length) {
            timeline.push({
              type: 'ENTER_FIELD',
              turn: turnCount,
              playerId: team1.id,
              pokemon: { ...team1.roster[idx1] }
            });
          }
        } else {
          idx2++;
          if (idx2 < team2.roster.length) {
            timeline.push({
              type: 'ENTER_FIELD',
              turn: turnCount,
              playerId: team2.id,
              pokemon: { ...team2.roster[idx2] }
            });
          }
        }
      }
    }

    const winnerId = idx1 >= team1.roster.length ? team2.id : team1.id;
    const loserId = winnerId === team1.id ? team2.id : team1.id;

    // Calculate MVP
    const allPk = [...team1.roster, ...team2.roster];
    allPk.sort((a, b) => (b.kills * 1000 + b.damageDealt) - (a.kills * 1000 + a.damageDealt));
    const mvp = allPk[0];

    timeline.push({
      type: 'VICTORY',
      winnerId,
      loserId,
      mvp: {
        name: mvp.name,
        sprite: mvp.sprite,
        kills: mvp.kills,
        damageDealt: mvp.damageDealt
      }
    });

    return {
      winnerId,
      loserId,
      mvp,
      timeline,
      team1Final: team1.roster,
      team2Final: team2.roster
    };
  }
}
