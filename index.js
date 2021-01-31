
function getTerrainImage() {
    document.getElementById('btn').onclick = function () {
        var zoom = document.getElementById('zoom').value;
        var lat = document.getElementById('lat').value
        var lon = document.getElementById('lon').value

        var tiles = pointToTile(lon, lat, zoom)
        console.log(tiles)

        var src = 'https://api.mapbox.com/v4/mapbox.terrain-rgb/' + String(zoom) + '/' + String(tiles[0]) + '/' + String(tiles[1]) + '.pngraw?access_token=pk.eyJ1IjoicGRvZHp3ZWl0IiwiYSI6ImNra2tjY3dqMDBzODIycHFudHB5c3J0eDgifQ.jKlnMzp8nL4zySUnrQ-vKg';

        var canvas = document.getElementById('hiddenCanvas'),
            context = canvas.getContext('2d');

        var base_image = new Image();
        base_image.src = src;
        base_image.crossOrigin = "Anonymous";
        base_image.onload = function () {
            context.drawImage(base_image, 0, 0);

            // Get the CanvasPixelArray from the given coordinates and dimensions.
            var imgd = context.getImageData(0, 0, 256, 256);
            var pix = imgd.data;

            // Loop over each pixel and invert the color.
            for (var i = 0, n = pix.length; i < n; i += 4) {
                pix[i] = 255 - pix[i]; // red
                pix[i + 1] = 255 - pix[i + 1]; // green
                pix[i + 2] = 255 - pix[i + 2]; // blue
                // i+3 is alpha (the fourth element)
            }

            // Draw the ImageData at the given (x,y) coordinates.
            context.putImageData(imgd, 0, 0);
        }
    }
}

import * as THREE from './three.js/build/three.module.js';

let camera, scene, renderer;
let geometry, material, mesh;

init();

function init() {

	camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 10 );
	camera.position.z = 1;

	scene = new THREE.Scene();

	geometry = new THREE.BoxGeometry( 0.2, 0.2, 0.2 );
	material = new THREE.MeshNormalMaterial();

	mesh = new THREE.Mesh( geometry, material );
	scene.add( mesh );


    var canvasElm = document.getElementById('canvas');
    renderer = new THREE.WebGLRenderer( { canvas: canvasElm, antialias: true } );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setAnimationLoop( animation );
    
    getTerrainImage();

}

function animation( time ) {

	mesh.rotation.x = time / 2000;
	mesh.rotation.y = time / 1000;

	renderer.render( scene, camera );

}