import { enemyTypes } from './enemies/EnemyTypes';
import { playerData } from './player/PlayerData';
import { sceneData } from './scenes/SceneData';

// This is the main entry point for all game configuration data.
// It imports the separated data files and assembles them into a single,
// globally accessible object. This makes the data structure clean,
// modular, and easy to manage.

export const gameData = {
    player: playerData,
    enemies: enemyTypes,
    scenes: sceneData,
};
