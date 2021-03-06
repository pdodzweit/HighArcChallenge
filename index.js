

import * as THREE from './three.module.js';

let camera, scene, renderer;
let geometry, material, mesh;

init();

function init() {

    var hiddenCanvas = document.getElementById('hiddenCanvas');
    hiddenCanvas.style.display = "none";

    var width = 500;
    var height = 500;
    // use orthographic for "God mode" appearance
    camera = new THREE.OrthographicCamera(width / - 2, width / 2, height / 2, height / - 2, -2000, 2000);
    camera.position.z = 0;
    camera.position.y = 50;

    scene = new THREE.Scene();

    // make a plane with the same number of points as our height image will have
    geometry = new THREE.PlaneGeometry(width / 1.2, width / 1.2, 255, 255);

    // copied the "vertexShader" and "fragShader" out of this guy and modified them below
    var phongShader = THREE.ShaderLib.phong;

    var uniforms = THREE.UniformsUtils.clone(phongShader.uniforms);
    let material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        fragmentShader: fragmentShader(),
        vertexShader: vertexShader(),
        lights: true
    })

    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    scene.add(directionalLight);

    mesh.rotation.x = -Math.PI / 3;

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

    var src = 'https://api.mapbox.com/v4/mapbox.terrain-rgb/' + String(zoom) + '/' + String(tiles[0]) + '/' + String(tiles[1]) + '.pngraw?access_token=pk.eyJ1IjoicGRvZHp3ZWl0IiwiYSI6ImNra2tjY3dqMDBzODIycHFudHB5c3J0eDgifQ.jKlnMzp8nL4zySUnrQ-vKg';

    var canvas = document.getElementById('hiddenCanvas'),
        context = canvas.getContext('2d');

    var base_image = new Image();
    base_image.src = src;
    base_image.crossOrigin = "Anonymous";
    base_image.onload = function () {

        // need to copy the image into the hidden canvas so we can read the pixels
        context.drawImage(base_image, 0, 0);
        var imgd = context.getImageData(0, 0, 256, 256);
        var pix = imgd.data;

        var positionAttribute = geometry.attributes.position;

        var maxZ = 8800; // MT everest is 8.8km
        var minZ = 0; 
        var maxRange = maxZ - minZ;

        for (var i = 0; i < positionAttribute.count; i++) {

            var R = pix[i * 4];
            var G = pix[i * 4 + 1];
            var B = pix[i * 4 + 2];

            // formula from https://docs.mapbox.com/help/troubleshooting/access-elevation-data/
            var z = -10000 + ((R * 256 * 256 + G * 256 + B) * 0.1);

            // map z to the range 0 - 20
            z -= minZ;
            z = z / maxRange * 20.0;
            positionAttribute.setZ(i, z);
        }

        geometry.computeVertexNormals()
        geometry.attributes.position.needsUpdate = true;
    }
}

// shader based off the "phongShader.vertexShader" used above
function vertexShader() {
    return `
    #define PHONG
    varying float z;       // ADDED THIS 
    varying vec3 vViewPosition;
    #ifndef FLAT_SHADED
        varying vec3 vNormal;
    #endif
    #include <common>
    #include <uv_pars_vertex>
    #include <uv2_pars_vertex>
    #include <displacementmap_pars_vertex>
    #include <envmap_pars_vertex>
    #include <color_pars_vertex>
    #include <fog_pars_vertex>
    #include <morphtarget_pars_vertex>
    #include <skinning_pars_vertex>
    #include <shadowmap_pars_vertex>
    #include <logdepthbuf_pars_vertex>
    #include <clipping_planes_pars_vertex>
    void main() {
        z = position.z;     // ADDED THIS 
        #include <uv_vertex>
        #include <uv2_vertex>
        #include <color_vertex>
        #include <beginnormal_vertex>
        #include <morphnormal_vertex>
        #include <skinbase_vertex>
        #include <skinnormal_vertex>
        #include <defaultnormal_vertex>
    #ifndef FLAT_SHADED
        vNormal = normalize( transformedNormal );
    #endif
        #include <begin_vertex>
        #include <morphtarget_vertex>
        #include <skinning_vertex>
        #include <displacementmap_vertex>
        #include <project_vertex>
        #include <logdepthbuf_vertex>
        #include <clipping_planes_vertex>
        vViewPosition = - mvPosition.xyz;
        #include <worldpos_vertex>
        #include <envmap_vertex>
        #include <shadowmap_vertex>
        #include <fog_vertex>
    }
            
    `
}


// shader based off the "phongShader.fragmentShader" used above
// modifed to change the color based on the z-value
function fragmentShader() {
    return `
    #define PHONG
    uniform vec3 diffuse;
    uniform vec3 emissive;
    uniform vec3 specular;
    uniform float shininess;
    uniform float opacity;
    varying float z;          // ADDED THIS 
    #include <common>
    #include <packing>
    #include <dithering_pars_fragment>
    #include <color_pars_fragment>
    #include <uv_pars_fragment>
    #include <uv2_pars_fragment>
    #include <map_pars_fragment>
    #include <alphamap_pars_fragment>
    #include <aomap_pars_fragment>
    #include <lightmap_pars_fragment>
    #include <emissivemap_pars_fragment>
    #include <envmap_common_pars_fragment>
    #include <envmap_pars_fragment>
    #include <cube_uv_reflection_fragment>
    #include <fog_pars_fragment>
    #include <bsdfs>
    #include <lights_pars_begin>
    #include <lights_phong_pars_fragment>
    #include <shadowmap_pars_fragment>
    #include <bumpmap_pars_fragment>
    #include <normalmap_pars_fragment>
    #include <specularmap_pars_fragment>
    #include <logdepthbuf_pars_fragment>
    #include <clipping_planes_pars_fragment>
    void main() {
        #include <clipping_planes_fragment>
        vec4 diffuseColor = vec4( diffuse, opacity );
        ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
        vec3 totalEmissiveRadiance = emissive;
        #include <logdepthbuf_fragment>
        #include <map_fragment>
        #include <color_fragment>
        #include <alphamap_fragment>
        #include <alphatest_fragment>
        #include <specularmap_fragment>
        #include <normal_fragment_begin>
        #include <normal_fragment_maps>
        #include <emissivemap_fragment>
        #include <lights_phong_fragment>
        #include <lights_fragment_begin>
        #include <lights_fragment_maps>
        #include <lights_fragment_end>
        #include <aomap_fragment>
        vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
        #include <envmap_fragment>
        gl_FragColor = vec4( outgoingLight, diffuseColor.a );
        #include <tonemapping_fragment>
        #include <encodings_fragment>
        #include <fog_fragment>
        #include <premultiplied_alpha_fragment>
        #include <dithering_fragment>

        // ADDED FROM HERE ON
        vec3 blue = vec3( 0.05, 0.44, 0.91 );
        vec3 green = vec3( 0.2, 0.54, 0.07 );
        vec3 brown = vec3( 0.5, 0.25, 0.07 );
        vec3 white = vec3( 1.0, 1.0, 1.0 );

        vec3 color = mix(blue,  green, smoothstep(0.0, 0.01, z));
        color      = mix(color, brown, smoothstep(0.01, 3.0, z));
        color      = mix(color, white, smoothstep(3.0, 7.0, z));

        gl_FragColor *= vec4(color, 1.0);
    } 
`
}