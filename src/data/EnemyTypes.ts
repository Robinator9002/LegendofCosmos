// This interface defines the "contract" for all enemy data.
// By using an interface, we ensure that every enemy type we create
// has a consistent set of properties, which prevents errors and helps with autocompletion.
export interface IEnemyType {
    key: string; // A unique identifier for this enemy type, e.g., 'medium-fighter'
    texture: string; // The texture key loaded in Preloader.ts
    health: number;
    scoreValue: number;
    scale: number;
    speed: { min: number; max: number }; // Use a range for more varied movement
}

// This is our new "database" of enemies.
// To add a new enemy to the game, you will just need to add a new object to this array.
// No more 'if/else' statements in the Enemy class itself.
export const EnemyTypes: IEnemyType[] = [
    {
        key: 'enemy-medium',
        texture: 'enemy-medium',
        health: 10,
        scoreValue: 20,
        scale: 0.6,
        speed: { min: 100, max: 200 },
    },
    {
        key: 'enemy-big',
        texture: 'enemy-big',
        health: 3,
        scoreValue: 50,
        scale: 0.8,
        speed: { min: 50, max: 100 },
    },
];
