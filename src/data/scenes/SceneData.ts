import { ISceneData } from '../types';

// This object contains all the visual configuration data for the main game scene.
// By defining it here, we can change the entire look and feel of the game—from the
// background to the post-processing effects—without altering the core scene logic.

export const sceneData: { [key: string]: ISceneData } = {
    game: {
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
};
