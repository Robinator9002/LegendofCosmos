import { Scene, GameObjects } from 'phaser';

// This interface defines the structure for a single layer in our parallax background.
// Using an interface makes our code cleaner and more predictable.
interface IParallaxLayer {
    sprite: GameObjects.TileSprite;
    scrollSpeed: number;
}

// This class manages the creation and updating of a multi-layered parallax background.
// This creates a sense of depth and makes the game visually more appealing.
export class ParallaxBackground {
    private scene: Scene;
    private layers: IParallaxLayer[] = [];

    constructor(scene: Scene) {
        this.scene = scene;
    }

    // A public method to add a new layer to the background.
    public addLayer(textureKey: string, scrollSpeed: number): void {
        const { width, height } = this.scene.scale;

        const tileSprite = this.scene.add
            .tileSprite(0, 0, width, height, textureKey)
            .setOrigin(0, 0)
            .setScrollFactor(0); // This ensures the background isn't affected by the camera scroll.

        this.layers.push({
            sprite: tileSprite,
            scrollSpeed: scrollSpeed,
        });
    }

    // The update method should be called from the main Game scene's update loop.
    public update(): void {
        // Iterate over each layer and scroll its tilePosition based on its speed.
        for (const layer of this.layers) {
            layer.sprite.tilePositionY += layer.scrollSpeed;
        }
    }
}
