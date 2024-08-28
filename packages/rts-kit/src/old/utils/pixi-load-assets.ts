import * as PIXI from "pixi.js";

export async function pixiLoadAssets(): Promise<void> {
  const toLoad = [
    ["warrior/knight", "./assets/game/sprites/warriors/knight_1/Knight.json"],
    ["warrior/fire-worm", "./assets/game/sprites/warriors/FireWorm/FireWorm.json"],
    ["effects/debufs", "./assets/game/sprites/effects/Debuf/Debufs.json"],
    ["warrior/huntress", "./assets/game/sprites/warriors/Huntress/Huntress.json"],
    ["warrior/wizard", "./assets/game/sprites/warriors/Wizard/Wizard.json"],
    ["warrior/dark-wizard", "./assets/game/sprites/warriors/DarkWizard/DarkWizard2.json"],
    ["warrior/catapult", "./assets/game/sprites/warriors/Catapult/Catapult.json"],
    ["castle/bloodMoonTower", "./assets/game/sprites/bloodMoonTower/bloodMoonTower.json"],
    ["flappyBird", "./assets/simpleSpriteSheet.json"],
    ["movableMap", "./assets/movable-map.png"],
    [
      "castleIdle",
      "./assets/game/sprites/tower/idle/206-2069595_this-cartoon-castle-clip-art-is-perfect-for-use-on-castle-clipart.png",
    ],
    ["castleAttack", "./assets/game/sprites/tower/idle/castle-png-clipart-12.png"],
    ["grass", "./assets/grass.png"],
    ["arrow", "./assets/arrow.png"],
    ["archer", "./assets/archer.png"],
    ["game_background_1", "./assets/game/Elven_Land_Game_Battle_Backgrounds/game_background_1.png"],
    ["game_background_2", "./assets/game/Elven_Land_Game_Battle_Backgrounds/game_background_2.png"],
    ["game_background_3", "./assets/game/Elven_Land_Game_Battle_Backgrounds/game_background_3.png"],
    ["game_background_4", "./assets/game/Elven_Land_Game_Battle_Backgrounds/game_background_4.png"],
  ];

  for (const [key, path] of toLoad) {
    PIXI.Assets.add( {
      alias: key || undefined,
      src: path,
    });
  }

  await PIXI.Assets.load(toLoad.map((one) => one[0]));
}
