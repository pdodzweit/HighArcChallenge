

import * as THREE from './three.js/build/three.module.js';

let camera, scene, renderer;
let geometry, material, mesh;

init();

function init() {

    var width = 500;
    var height = 500;
    camera = new THREE.OrthographicCamera(width / - 2, width / 2, height / 2, height / - 2, -2000, 2000);
    camera.position.z = 1;

    scene = new THREE.Scene();

    geometry = new THREE.PlaneGeometry(width / 2, width / 2, 255, 255);
    material = new THREE.MeshNormalMaterial();

    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    mesh.rotation.x = -Math.PI / 4;


    var canvasElm = document.getElementById('canvas');
    renderer = new THREE.WebGLRenderer({ canvas: canvasElm, antialias: true });
    renderer.setSize(width, height);
    renderer.setAnimationLoop(animation);

    document.getElementById('btn').onclick = function () {
        getTerrainImage();
    }
}

function animation(time) {

    mesh.rotation.z = time / 10000;

    renderer.render(scene, camera);

}


function getTerrainImage() {
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

        var positionAttribute = geometry.attributes.position;
		
		for( var i = 0; i < positionAttribute.count; i ++ ) {

            var z = positionAttribute.getZ( i );
            
            var R = 255 - pix[i*4]; 
            var G = 255 - pix[i*4 + 1]; 
            var B = 255 - pix[i*4 + 2]; 
			
            z += ( -10000 + ((R * 256 * 256 + G * 256 + B) * 0.1) ) * 0.005;
			
            positionAttribute.setZ( i,z );
        }

        geometry.attributes.position.needsUpdate = true;
    }
}