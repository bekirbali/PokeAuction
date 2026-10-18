import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MOVE_POOL = {
  Normal: [
    { name: "Hyper Beam", type: "Normal", power: 120, category: "special", accuracy: 90 },
    { name: "Body Slam", type: "Normal", power: 85, category: "physical", accuracy: 100 },
    { name: "Slash", type: "Normal", power: 70, category: "physical", accuracy: 100 },
    { name: "Quick Attack", type: "Normal", power: 40, category: "physical", accuracy: 100 }
  ],
  Fire: [
    { name: "Fire Blast", type: "Fire", power: 110, category: "special", accuracy: 85 },
    { name: "Flamethrower", type: "Fire", power: 90, category: "special", accuracy: 100 },
    { name: "Fire Punch", type: "Fire", power: 75, category: "physical", accuracy: 100 }
  ],
  Water: [
    { name: "Hydro Pump", type: "Water", power: 110, category: "special", accuracy: 85 },
    { name: "Surf", type: "Water", power: 90, category: "special", accuracy: 100 },
    { name: "Waterfall", type: "Water", power: 80, category: "physical", accuracy: 100 }
  ],
  Grass: [
    { name: "Solar Beam", type: "Grass", power: 120, category: "special", accuracy: 95 },
    { name: "Energy Ball", type: "Grass", power: 90, category: "special", accuracy: 100 },
    { name: "Razor Leaf", type: "Grass", power: 70, category: "physical", accuracy: 95 }
  ],
  Electric: [
    { name: "Thunder", type: "Electric", power: 110, category: "special", accuracy: 85 },
    { name: "Thunderbolt", type: "Electric", power: 90, category: "special", accuracy: 100 },
    { name: "Spark", type: "Electric", power: 65, category: "physical", accuracy: 100 }
  ],
  Ice: [
    { name: "Blizzard", type: "Ice", power: 110, category: "special", accuracy: 85 },
    { name: "Ice Beam", type: "Ice", power: 90, category: "special", accuracy: 100 },
    { name: "Ice Punch", type: "Ice", power: 75, category: "physical", accuracy: 100 }
  ],
  Fighting: [
    { name: "Close Combat", type: "Fighting", power: 120, category: "physical", accuracy: 90 },
    { name: "Cross Chop", type: "Fighting", power: 100, category: "physical", accuracy: 85 },
    { name: "Brick Break", type: "Fighting", power: 75, category: "physical", accuracy: 100 }
  ],
  Poison: [
    { name: "Sludge Bomb", type: "Poison", power: 90, category: "special", accuracy: 100 },
    { name: "Poison Jab", type: "Poison", power: 80, category: "physical", accuracy: 100 },
    { name: "Cross Poison", type: "Poison", power: 70, category: "physical", accuracy: 100 }
  ],
  Ground: [
    { name: "Earthquake", type: "Ground", power: 100, category: "physical", accuracy: 100 },
    { name: "Earth Power", type: "Ground", power: 90, category: "special", accuracy: 100 },
    { name: "Dig", type: "Ground", power: 80, category: "physical", accuracy: 100 }
  ],
  Flying: [
    { name: "Brave Bird", type: "Flying", power: 120, category: "physical", accuracy: 90 },
    { name: "Air Slash", type: "Flying", power: 75, category: "special", accuracy: 95 },
    { name: "Wing Attack", type: "Flying", power: 60, category: "physical", accuracy: 100 }
  ],
  Psychic: [
    { name: "Psychic", type: "Psychic", power: 90, category: "special", accuracy: 100 },
    { name: "Psyshock", type: "Psychic", power: 80, category: "special", accuracy: 100 },
    { name: "Psybeam", type: "Psychic", power: 65, category: "special", accuracy: 100 }
  ],
  Bug: [
    { name: "Megahorn", type: "Bug", power: 120, category: "physical", accuracy: 85 },
    { name: "Bug Buzz", type: "Bug", power: 90, category: "special", accuracy: 100 },
    { name: "X-Scissor", type: "Bug", power: 80, category: "physical", accuracy: 100 }
  ],
  Rock: [
    { name: "Stone Edge", type: "Rock", power: 100, category: "physical", accuracy: 85 },
    { name: "Rock Slide", type: "Rock", power: 75, category: "physical", accuracy: 90 },
    { name: "Ancient Power", type: "Rock", power: 60, category: "special", accuracy: 100 }
  ],
  Ghost: [
    { name: "Shadow Ball", type: "Ghost", power: 80, category: "special", accuracy: 100 },
    { name: "Shadow Claw", type: "Ghost", power: 70, category: "physical", accuracy: 100 }
  ],
  Dragon: [
    { name: "Outrage", type: "Dragon", power: 120, category: "physical", accuracy: 90 },
    { name: "Dragon Pulse", type: "Dragon", power: 85, category: "special", accuracy: 100 },
    { name: "Dragon Claw", type: "Dragon", power: 80, category: "physical", accuracy: 100 }
  ],
  Steel: [
    { name: "Flash Cannon", type: "Steel", power: 80, category: "special", accuracy: 100 },
    { name: "Iron Head", type: "Steel", power: 80, category: "physical", accuracy: 100 }
  ],
  Fairy: [
    { name: "Moonblast", type: "Fairy", power: 95, category: "special", accuracy: 100 },
    { name: "Dazzling Gleam", type: "Fairy", power: 80, category: "special", accuracy: 100 }
  ]
};

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function getTier(totalStats, id) {
  if (id === 150 || id === 151 || id === 144 || id === 145 || id === 146) return 'Legendary';
  if (id === 129) return 'Meme'; // Magikarp
  if (id === 10 || id === 11 || id === 13 || id === 14) return 'Common';
  if (totalStats >= 500) return 'Epic';
  if (totalStats >= 420) return 'Rare';
  return 'Common';
}

function assignMoves(types, name, id) {
  if (id === 129) {
    return [
      { name: "Splash", type: "Normal", power: 0, category: "physical", accuracy: 100 },
      { name: "Tackle", type: "Normal", power: 30, category: "physical", accuracy: 100 },
      { name: "Flail", type: "Normal", power: 50, category: "physical", accuracy: 100 }
    ];
  }
  const moves = [];
  types.forEach(t => {
    const pool = MOVE_POOL[t] || MOVE_POOL.Normal;
    if (pool.length > 0) moves.push(pool[0]);
    if (pool.length > 1) moves.push(pool[1]);
  });
  // Add a normal coverage move if less than 3
  if (moves.length < 3) {
    moves.push(MOVE_POOL.Normal[1]);
  }
  if (moves.length < 4) {
    moves.push(MOVE_POOL.Normal[3]);
  }
  return moves.slice(0, 4);
}

async function fetchAllGen1() {
  console.log("Fetching 151 Pokemon from PokeAPI in batches...");
  const allPokemon = [];
  
  for (let i = 1; i <= 151; i += 25) {
    const batchIds = [];
    for (let j = i; j < i + 25 && j <= 151; j++) batchIds.push(j);
    
    const results = await Promise.all(batchIds.map(async id => {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
      return res.json();
    }));
    
    results.forEach(d => {
      const types = d.types.map(t => capitalize(t.type.name));
      const statsMap = {};
      d.stats.forEach(s => {
        const key = s.stat.name.replace('-', '_');
        statsMap[key] = s.base_stat;
      });
      
      const stats = {
        hp: statsMap['hp'] || 50,
        attack: statsMap['attack'] || 50,
        defense: statsMap['defense'] || 50,
        sp_attack: statsMap['special_attack'] || 50,
        sp_defense: statsMap['special_defense'] || 50,
        speed: statsMap['speed'] || 50
      };
      
      const total = Object.values(stats).reduce((a, b) => a + b, 0);
      const cleanName = d.name.split('-')[0];
      const displayName = capitalize(cleanName);
      
      // Showdown animated sprites
      // special cases for showdown animated names
      let showdownName = d.name.toLowerCase();
      if (showdownName === 'nidoran-f') showdownName = 'nidoranf';
      if (showdownName === 'nidoran-m') showdownName = 'nidoranm';
      if (showdownName === 'mr-mime') showdownName = 'mrmime';
      
      allPokemon.push({
        id: d.id,
        name: displayName,
        slug: showdownName,
        types: types,
        stats: stats,
        totalStats: total,
        tier: getTier(total, d.id),
        sprite: `https://play.pokemonshowdown.com/sprites/ani/${showdownName}.gif`,
        spriteBack: `https://play.pokemonshowdown.com/sprites/ani-back/${showdownName}.gif`,
        icon: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${d.id}.png`,
        cryUrl: `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${d.id}.ogg`,
        moves: assignMoves(types, displayName, d.id)
      });
    });
    console.log(`Processed up to Pokemon #${Math.min(i + 24, 151)}`);
  }
  
  allPokemon.sort((a, b) => a.id - b.id);
  const outPath = path.join(__dirname, 'pokemon_gen1.json');
  fs.writeFileSync(outPath, JSON.stringify(allPokemon, null, 2), 'utf8');
  console.log(`SUCCESS! Generated ${allPokemon.length} Gen 1 Pokemon in pokemon_gen1.json`);
}

fetchAllGen1().catch(err => {
  console.error("Error fetching Pokemon data:", err);
  process.exit(1);
});
