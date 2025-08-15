import { IEngineTrailConfig } from '../effects/EngineTrail';

// --- DATA INTERFACES ---
// We define the "shape" of our data first. This ensures consistency and helps with autocompletion.

/**
 * @interface IDebrisConfig
 * @description Defines the debris to be spawned for an explosion.
 */
interface IDebrisConfig {
    // An array of texture keys to pick from randomly for each debris particle.
    parts: string[];
    // The number of particles to create. Can be a single number or a range.
    quantity: number | { min: number; max: number };
    // The scale of the debris. Can be a single number or a range.
    scale: number | { min: number; max: number };
}

/**
 * @interface IEnemyData
 * @description A comprehensive definition for a single enemy type.
 */
interface IEnemyData {
    key: string; // Unique identifier, e.g., 'fighter'
    texture: string; // Asset key for the sprite
    health: number;
    scoreValue: number;
    scale: number;
    speed: { min: number; max: number };
    // Optional engine trail configuration. If not provided, the enemy won't have a trail.
    engineTrail?: IEngineTrailConfig;
    // Defines the debris spawned when this enemy is destroyed.
    deathDebris: IDebrisConfig;
    // Defines the debris spawned when this enemy is hit but not destroyed.
    hitDebris: IDebrisConfig;
}

/**
 * @interface IPlayerData
 * @description Defines all properties for the player's ship.
 */
interface IPlayerData {
    texture: string;
    scale: number;
    moveSpeed: number;
    fireRate: number; // Milliseconds between shots
    engineTrail: IEngineTrailConfig;
}

/**
 * @interface IBackgroundLayerData
 * @description Defines a single layer for the parallax background.
 */
interface IBackgroundLayerData {
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
interface ISceneData {
    backgroundLayers: IBackgroundLayerData[];
    // Optional post-processing effects.
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

// --- MASTER GAME DATA OBJECT ---
// This is the single source of truth for all game configuration.

export const gameData = {
    player: <IPlayerData>{
        texture: 'player',
        scale: 0.75,
        moveSpeed: 400,
        fireRate: 250,
        engineTrail: {
            tint: { start: 0xaaaaff, end: 0x00aaff },
            scale: {
                x: { start: 1.2, end: 0 },
                y: { start: 0.4, end: 0 },
            },
            lifespan: 500,
            frequency: 40,
            idleFrequency: 200,
            idle: { speed: 50 },
            moving: { speed: { min: 100, max: 150 } },
            spawnOffset: 40,
            rotationSpeed: Math.PI * 4,
            spread: 10,
            pivot: 'static',
        },
    },

    enemies: <IEnemyData[]>[
        {
            key: 'enemy-medium',
            texture: 'enemy-medium',
            health: 1,
            scoreValue: 20,
            scale: 0.6,
            speed: { min: 100, max: 200 },
            engineTrail: {
                tint: { start: 0xff8800, end: 0xff0000 },
                scale: {
                    x: { start: 1.0, end: 0 },
                    y: { start: 0.5, end: 0 },
                },
                lifespan: 500,
                frequency: 60,
                idleFrequency: 150,
                idle: { speed: 40 },
                moving: { speed: { min: 100, max: 150 } },
                spawnOffset: 30,
                rotationSpeed: Math.PI * 2,
                spread: 20,
                pivot: 'dynamic',
            },
            deathDebris: {
                parts: ['part-cockpit-red', 'part-wing-red'],
                quantity: { min: 2, max: 4 },
                scale: { min: 0.3, max: 0.6 },
            },
            hitDebris: {
                parts: ['part-generic-1', 'part-generic-2'],
                quantity: { min: 1, max: 2 },
                scale: { min: 0.2, max: 0.4 },
            },
        },
        {
            key: 'enemy-big',
            texture: 'enemy-big',
            health: 3,
            scoreValue: 50,
            scale: 0.8,
            speed: { min: 50, max: 100 },
            // This enemy is an asteroid, so it has no engine trail.
            deathDebris: {
                parts: ['meteor-tiny-1', 'meteor-tiny-2'],
                quantity: { min: 6, max: 10 },
                scale: { min: 0.8, max: 1.2 },
            },
            hitDebris: {
                parts: ['meteor-tiny-1'],
                quantity: { min: 1, max: 3 },
                scale: { min: 0.4, max: 0.6 },
            },
        },
    ],

    scenes: {
        game: <ISceneData>{
            backgroundLayers: [
                {
                    textureKey: 'stars-background-contrast',
                    scrollSpeed: -0.1,
                    tint: 0x444444,
                    blendMode: 'NORMAL',
                    rotation: 0.2,
                },
                {
                    textureKey: 'stars-background-contrast',
                    scrollSpeed: -0.4,
                    tint: 0xbbbbbb,
                    blendMode: 'ADD',
                    rotation: -0.5,
                },
                {
                    textureKey: 'stars-background-contrast',
                    scrollSpeed: -0.7,
                    tint: 0xffffff,
                    blendMode: 'ADD',
                    rotation: 1.1,
                },
            ],
            effects: {
                bloom: {
                    intensity: 5,
                    strength: 0.25,
                },
                vignette: {
                    innerRadius: 0.55,
                    outerRadius: 0.8,
                },
            },
        },
    },
};
