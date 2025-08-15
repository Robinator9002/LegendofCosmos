import { IEngineTrailConfig } from '../effects/EngineTrail';

// --- DATA INTERFACES ---
// By centralizing our type definitions, we ensure that all data files adhere to the
// same structure, preventing inconsistencies and making the codebase easier to maintain.

/**
 * @interface IDebrisConfig
 * @description Defines the debris to be spawned for an explosion.
 */
export interface IDebrisConfig {
    parts: string[];
    quantity: number | { min: number; max: number };
    scale: number | { min: number; max: number };
}

/**
 * @interface IEnemyData
 * @description A comprehensive definition for a single enemy type.
 */
export interface IEnemyData {
    key: string;
    texture: string;
    health: number;
    scoreValue: number;
    scale: number;
    speed: { min: number; max: number };
    engineTrail?: IEngineTrailConfig;
    deathDebris: IDebrisConfig;
    hitDebris: IDebrisConfig;
}

/**
 * @interface IPlayerData
 * @description Defines all properties for the player's ship.
 */
export interface IPlayerData {
    texture: string;
    scale: number;
    moveSpeed: number;
    fireRate: number;
    engineTrail: IEngineTrailConfig;
}

/**
 * @interface IBackgroundLayerData
 * @description Defines a single layer for the parallax background.
 */
export interface IBackgroundLayerData {
    textureKey: string;
    scrollSpeed: number;
    alpha?: number;
    tint?: number;
    blendMode?: Phaser.BlendModes | string;
    rotation?: number;
}

/**
 * @interface ISceneData
 * @description Defines the visual configuration for a scene.
 */
export interface ISceneData {
    backgroundLayers: IBackgroundLayerData[];
    effects?: {
        bloom?: {
            intensity: number;
            strength: number;
        };
        vignette?: {
            innerRadius: number;
            outerRadius: number;
        };
    };
}
