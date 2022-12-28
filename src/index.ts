import { Application, Sprite, Texture, SCALE_MODES,Ticker  } from 'pixi.js'
import { Tween, Group } from "tweedle.js";
import { Sound } from "@pixi/sound";
import map from './map';


const app = new Application({
	view: document.getElementById("pixi-canvas") as HTMLCanvasElement,
	autoDensity: true,
	backgroundColor: 0x6495ed
});


const stars = Sprite.from("star.png");
const success = Sound.from('success.mp3');

 // create a texture from an image path

const texture= Texture.from('background.JPG');
const backGround = new Sprite(texture);
backGround.anchor.set(0.5);
backGround.scale.set(1);
backGround.x = app.renderer.width/2;
backGround.y = app.renderer.height/2;

app.stage.addChild(backGround);


for (let i = 0; i < 16; i++) {
	const texture = Texture.from(`${i}.png`);

// Scale mode for pixelation
	texture.baseTexture.scaleMode = SCALE_MODES.NEAREST;
    createPuzzlePiece(
        Math.floor(Math.random() * app.screen.width),
        Math.floor(Math.random() * app.screen.height),
		texture,i
    );
}

function createPuzzlePiece(x:number, y:number,texture:Texture,id:number) {
    // create our little bunny friend..
    const puzzlePiece = new Sprite(texture);

    // enable the bunny to be interactive... this will allow it to respond to mouse and touch events
    puzzlePiece.interactive = true;

    // this button mode will mean the hand cursor appears when you roll over the bunny with your mouse
    puzzlePiece.cursor = 'pointer';

    // center the bunny's anchor point
    puzzlePiece.anchor.set(0.5);

    // make it a bit bigger, so it's easier to grab
    puzzlePiece.scale.set(1);
	
	// move the sprite to its designated position
	puzzlePiece.x = x;
    puzzlePiece.y = y;
	puzzlePiece.accessibleTitle=`${id}`;
	
    // setup events for mouse + touch using
    // the pointer events
    puzzlePiece.on('pointerdown', onDragStart, puzzlePiece);

    
    
    // add it to the stage
    app.stage.addChild(puzzlePiece);
}

let dragTarget:Sprite;

app.stage.interactive = true;
app.stage.hitArea = app.screen;
app.stage.on('pointerup', onDragEnd);
app.stage.on('pointerupoutside', onDragEnd);



function onDragMove(event:any) {
	//update the location to mouse pointer
    if (dragTarget) {
        dragTarget.parent.toLocal(event.global, null, dragTarget.position);
    }
}

function onDragStart(this:Sprite) {
    // store a reference to the data
    // the reason for this is because of multitouch
    // we want to track the movement of this particular touch
    // this.data = event.data;
    
	this.alpha = 0.5;
    dragTarget = this;
    app.stage.on('pointermove', onDragMove);
	
}

function onDragEnd() {
    if (dragTarget) {
		console.log(dragTarget.transform.position)
        app.stage.off('pointermove', onDragMove);
        dragTarget.alpha = 1;
        let index = parseInt(dragTarget.accessibleTitle, 10);
		if(detectIntersect(dragTarget,map[index]))
		{
			dragTarget.parent.toLocal(map[index], null, dragTarget.position);
			dragTarget.interactive=false;
			

			stars.anchor.set(0.5);
			stars.x = map[index].x;
			stars.y = map[index].y;


			Ticker.shared.add(update, this);

			//Tween chained to make stars animation
			//scale update from .1 to .3 in 700ms
			//onComplete remove stars
			
			new Tween(stars.scale.set(.1)).to({ x: 0.3, y: 0.3 }, 700).start().onComplete(handleOnComplete);
			
			app.stage.addChild(stars);
			success.play();
			
		}
		dragTarget = null;
    }
	
}

function detectIntersect (puzzlePiece: Sprite, point:{x:number,y:number}) {
	
	let bounds= puzzlePiece.getBounds();
	//Axis-aligned bounding boxes (AABB) algo
	return bounds.x+bounds.width>point.x &&
	bounds.x<point.x+10 &&
	bounds.y+bounds.height>point.y &&
	bounds.y<point.y+10;
}

function handleOnComplete (this:Sprite) {
	
	app.stage.removeChild(stars);
};

function update(): void {
	Group.shared.update()
}
