import { IPlayerData } from '../types';

// This object contains all the configuration data for the player's ship.
// By centralizing it here, we can easily tweak the player's feel and performance.

export const playerData: IPlayerData = {
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
    // --- NEW: Added the player's specific death debris configuration ---
    deathDebris: {
        parts: ['part-generic-1', 'part-generic-2', 'part-generic-3'],
        quantity: { min: 5, max: 8 },
        scale: { min: 0.4, max: 0.7 },
    },
};
