import { IEnemyData } from '../types';

// This is the new "database" for all enemy types in the game.
// By defining them here, we can easily add new enemies, tweak existing ones,
// and balance the game without touching the core game logic.

export const enemyTypes: IEnemyData[] = [
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
];
