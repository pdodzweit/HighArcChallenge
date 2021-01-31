
function getTerrainImage() {
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

function main() {
    const canvas = document.querySelector('#glcanvas');
    const gl = canvas.getContext('webgl');

    if (!gl) {
        alert('Unable to initialize WebGL. Your browser or machine may not support it.');
        return;
    }

    var vertices = [
        -0.5, 0.0, 0.5,
        -0.5, 0.0, -0.5,
        0.5, 0.0, -0.5,
        0.5, 0.0, 0.5
    ];

    indices = [3, 2, 1, 3, 1, 0];

    // Create an empty buffer object to store vertex buffer
    var vertex_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    var Index_Buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Index_Buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    /*====================== Shaders =======================*/

    // Vertex shader source code
    var vertCode =
        'attribute vec3 coordinates;' +
        'void main(void) {' +
        ' gl_Position = vec4(coordinates, 1.0);' +
        '}';

    var vertShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertShader, vertCode);
    gl.compileShader(vertShader);

    // Fragment shader source code
    var fragCode =
        'void main(void) {' +
        ' gl_FragColor = vec4(1.0, 0.0, 0.0, 0.1);' +
        '}';

    // Create fragment shader object 
    var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragShader, fragCode);
    gl.compileShader(fragShader);
    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertShader);
    gl.attachShader(shaderProgram, fragShader);
    gl.linkProgram(shaderProgram);
    gl.useProgram(shaderProgram);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Index_Buffer);

    var coord = gl.getAttribLocation(shaderProgram, "coordinates");

    gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(coord);

    gl.clearColor(0.5, 0.5, 0.5, 0.9);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

    getTerrainImage();

}


main();