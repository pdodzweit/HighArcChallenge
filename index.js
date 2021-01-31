
function main() {
    const canvas = document.querySelector('#glcanvas');
    // Initialize the GL context
    const gl = canvas.getContext('webgl');

    // If we don't have a GL context, give up now
    // Only continue if WebGL is available and working

    if (!gl) {
        alert('Unable to initialize WebGL. Your browser or machine may not support it.');
        return;
    }

    // Set clear color to black, fully opaque
    gl.clearColor(1.0, 1.0, 0.0, 1.0);
    // Clear the color buffer with specified clear color
    gl.clear(gl.COLOR_BUFFER_BIT);

    document.getElementById('btn').onclick = function () {
        zoom = document.getElementById('zoom').value;
        lat = document.getElementById('lat').value
        lon = document.getElementById('lon').value

        tiles = pointToTile(lon, lat, zoom)
        console.log(tiles)

        src = 'https://api.mapbox.com/v4/mapbox.terrain-rgb/' + String(zoom) + '/' + String(tiles[0]) + '/' + String(tiles[1]) + '.pngraw?access_token=pk.eyJ1IjoicGRvZHp3ZWl0IiwiYSI6ImNra2tjY3dqMDBzODIycHFudHB5c3J0eDgifQ.jKlnMzp8nL4zySUnrQ-vKg';

        var canvas = document.getElementById('hiddenCanvas'),
            context = canvas.getContext('2d');

        base_image = new Image();
        base_image.src = src;
        base_image.onload = function () {
            context.drawImage(base_image, 0, 0);
        }
    }

}


main();