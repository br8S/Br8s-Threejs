import * as THREE from '/build/three.module.js';
import {OrbitControls} from '/jsm/controls/OrbitControls.js';
import {GLTFLoader} from '/jsm/loaders/GLTFLoader.js';
import {EffectComposer} from '/jsm/postprocessing/EffectComposer.js'
import {RenderPass} from '/jsm/postprocessing/RenderPass.js'
import { GlitchPass } from '/jsm/postprocessing/GlitchPass.js';
import { UnrealBloomPass } from '/jsm/postprocessing/UnrealBloomPass.js';
import { DotScreenPass} from '/jsm/postprocessing/DotScreenPass.js';
import { FilmPass} from '/jsm/postprocessing/FilmPass.js';
import { RGBShiftShader } from './jsm/shaders/RGBShiftShader.js';
import { DotScreenShader } from './jsm/shaders/DotScreenShader.js';
import { ShaderPass } from './jsm/postprocessing/ShaderPass.js';
import { LuminosityShader } from '/jsm/shaders/LuminosityShader.js'

        var scene, camera, composer, hemiLight, light, object, object1, object2, br8s, mesh;
        var renderer;

        function init(){
            scene = new THREE.Scene;

            camera = new THREE.PerspectiveCamera(70, window.innerWidth/window.innerHeight, 500, 10000);
            camera.position.set(0, 900, 1600);
            camera.lookAt(new THREE.Vector3(0,0,0));

            const loadingManager = new THREE.LoadingManager(() => {

                const loadingScreen = document.querySelector('loading-screen');
                document.querySelector('.loading-wrapper').parentElement.removeChild(document.querySelector('.loading-wrapper'));
                //loadingScreen.classList.add('fade-out');
            
                // optional: remove loader from DOM via event listener
                loadingScreen.addEventListener('transitionend', onTransitionEnd);
            
            });


            scene.fog = new THREE.Fog( 0x000000, 300, 30000 );

            hemiLight = new THREE.HemisphereLight(0xffeeb1, 0x080820, 4)
            scene.add(hemiLight);

            light = new THREE.SpotLight(0xD8BFD8,3); //cyan: E0FFFF pink: D8BFD8 FFE4B5 F8F8FF
            light.position.set(-50,50,50);
            light.castShadow = true;
            light.shadow.bias = -0.0001;
            light.shadow.mapSize.width = 1024*4;
            light.shadow.mapSize.height = 1024*4;
            scene.add( light );

            renderer = new THREE.WebGLRenderer();
            renderer.setSize(window.innerWidth, window.innerHeight);
            document.querySelector('.jsscene').appendChild(renderer.domElement);

            window.addEventListener('resize', () => {
                renderer.setSize(window.innerWidth, window.innerHeight);
                camera.aspect = window.innerWidth/window.innerHeight;
 
                camera.updateProjectionMatrix();
            }) 

            composer = new EffectComposer(renderer);
            composer.addPass(new RenderPass(scene, camera));

            composer.addPass(new GlitchPass());
            composer.addPass(new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 ));
            composer.addPass(new FilmPass(0.1, 0.325, 256, false));

            const effect1 = new ShaderPass( DotScreenShader );
			effect1.uniforms[ 'scale' ].value = 1000;
			//composer.addPass( effect1 );

			const effect2 = new ShaderPass( RGBShiftShader );
			effect2.uniforms[ 'amount' ].value = 0.015;
			composer.addPass( effect2 );
            //composer.addPass(new DotScreenPass());

            composer.addPass(new ShaderPass(LuminosityShader));

            object = new THREE.Object3D();
			scene.add( object );

			const geometry = new THREE.SphereGeometry( 0.3, 4, 4 );
			const material = new THREE.MeshPhongMaterial( { color: 0xC0C0C0} );

			for ( let i = 0; i < 100; i ++ ) {

				const mesh = new THREE.Mesh( geometry, material );
				mesh.position.set( Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5 ).normalize() + 2000 ;
				mesh.position.multiplyScalar( Math.random() * 1000 );
				mesh.rotation.set( Math.random() * 2, Math.random() * 2, Math.random() * 2 );
				mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 20;
				object.add( mesh );
            }

            object1 = new THREE.Object3D();
			scene.add( object1 );

			const geometry1 = new THREE.SphereGeometry( 0.3, 4, 4 );
			const material1 = new THREE.MeshPhongMaterial( { color: 0xC0C0C0} );

			for ( let i = 0; i < 100; i ++ ) {

				const mesh = new THREE.Mesh( geometry1, material1 );
				mesh.position.set( Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5 ).normalize() + 2000 ;
				mesh.position.multiplyScalar( Math.random() * 1000 );
				mesh.rotation.set( Math.random() * 2, Math.random() * 2, Math.random() * 2 );
				mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 20;
				object1.add( mesh );
            }

            object2 = new THREE.Object3D();
			scene.add( object2 );

			const geometry2 = new THREE.SphereGeometry( 0.25, 4, 4 );
			const material2 = new THREE.MeshPhongMaterial( { color: 0xC8F1BE} );

			for ( let i = 0; i < 100; i ++ ) {

				const mesh = new THREE.Mesh( geometry2, material2 );
				mesh.position.set( Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5 ).normalize() ;
				mesh.position.multiplyScalar( Math.random() * 1000 );
				mesh.rotation.set( Math.random() * 2, Math.random() * 2, Math.random() * 2 );
				mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 20;
				object2.add( mesh );
            }


            var loader = new GLTFLoader( loadingManager );
            loader.load('scene.gltf', function(gltf){
                br8s = gltf.scene;
                mesh = gltf.scene.children[0];
                mesh.position.set(0,-600,0);
                mesh.traverse(n => { 
                    if ( n.isMesh ) {
                    n.castShadow = true; 
                    n.receiveShadow = true;
                    if(n.material.map) n.material.map.anisotropy = 16; 
                }});
                scene.add(br8s);
            })
        

            let controls = new OrbitControls(camera, renderer.domElement);
            controls.addEventListener('change', renderer);
            controls.enableZoom = false;

            let materialArray = [];
            
            let texture_bk = new THREE.TextureLoader().load("images/cave3_bk.png");
            let texture_ft = new THREE.TextureLoader().load("images/cave3_ft.png");
            let texture_rt = new THREE.TextureLoader().load("images/cave3_rt.png");
            let texture_lf = new THREE.TextureLoader().load("images/cave3_lf.png");
            let texture_up = new THREE.TextureLoader().load("images/cave3_up.png");
            let texture_dn = new THREE.TextureLoader().load("images/cave3_dn.png");  

            materialArray.push(new THREE.MeshBasicMaterial( { map: texture_ft }));
            materialArray.push(new THREE.MeshBasicMaterial( { map: texture_bk }));
            materialArray.push(new THREE.MeshBasicMaterial( { map: texture_up }));
            materialArray.push(new THREE.MeshBasicMaterial( { map: texture_dn }));
            materialArray.push(new THREE.MeshBasicMaterial( { map: texture_rt }));
            materialArray.push(new THREE.MeshBasicMaterial( { map: texture_lf }));

        
            materialArray.push(new THREE.MeshBasicMaterial({map: texture_rt}));
            materialArray.push(new THREE.MeshBasicMaterial({map: texture_lf}));
            materialArray.push(new THREE.MeshBasicMaterial({map: texture_up}));
            materialArray.push(new THREE.MeshBasicMaterial({map: texture_dn}));
            materialArray.push(new THREE.MeshBasicMaterial({map: texture_bk}));
            materialArray.push(new THREE.MeshBasicMaterial({map: texture_ft}));

            for (let i = 0; i < 6; i++){
                materialArray[i].side = THREE.BackSide;
            }

            let skyboxGeo = new THREE.BoxGeometry(10000, 10000, 10000);
            let skybox = new THREE.Mesh(skyboxGeo, materialArray);
            scene.add(skybox);

            animate();
        }

        function animate(){
            requestAnimationFrame(animate);
            composer.render();
            //renderer.render(scene, camera);
            // renderer.shadowMap.enabled = true;
            light.position.set( 
                 camera.position.x + 10,
                 camera.position.y + 10,
                 camera.position.z + 10,
             );
 
            for ( let i = 0; i < 100; i ++ ) {
                object.rotation.z += 0.0000001;
                object.rotation.y += 0.000001;
                object1.rotation.z -= 0.0000001;
                object1.rotation.y -= 0.000001;
                object2.rotation.z += 0.0000004;
                object2.rotation.y += 0.000001;
            }
        }

        init();