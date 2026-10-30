import * as THREE from './vendor/three/three.module.min.js';
import { snowHeight, trees, rails, ramps, FINISH } from './mountain';

// This view reads the same Mountain state and geometry as the original renderer.
export function createMountainThree(canvas) {
  const renderer = new THREE.WebGLRenderer({canvas, antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#b1cad4');
  scene.fog = new THREE.Fog('#b1cad4', 120, 290);
  scene.add(new THREE.HemisphereLight('#fce8d5','#759da6',2));
  const sun = new THREE.DirectionalLight('#fff3db',1.2); sun.position.set(-40,100,-50);scene.add(sun);
  const camera = new THREE.PerspectiveCamera(55, 1, .3, 400);
  const mat = color => new THREE.MeshLambertMaterial({color});
  const snow = mat('#dceff2'), dark = mat('#315a60'), orange = mat('#f2a15e');
  // Sample the actual gameplay height function, including lips and central ridge.
  const cols=37, rows=259, positions=[], indices=[];
  for(let j=0;j<rows;j++) for(let i=0;i<cols;i++) {const x=-54+i*3,z=-24+j*4;positions.push(x,snowHeight(x,z),z);}
  for(let j=0;j<rows-1;j++) for(let i=0;i<cols-1;i++){const a=j*cols+i,b=a+1,c=a+cols,d=c+1;indices.push(a,c,b,b,c,d);}
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setIndex(indices);geometry.computeVertexNormals();
  scene.add(new THREE.Mesh(geometry,snow));
  for(const tree of trees){const y=snowHeight(tree.x,tree.z);const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.3,.45,3,6),dark);trunk.position.set(tree.x,y+1.5,tree.z);scene.add(trunk);const crown=new THREE.Mesh(new THREE.ConeGeometry(2.3,6,7),mat('#285765'));crown.position.set(tree.x,y+5,tree.z);scene.add(crown);}
  for(const rail of rails){for(let z=rail.z;z<rail.end;z+=2){const y=snowHeight(rail.x,z)+.8;const nextY=snowHeight(rail.x,z+2)+.8;const a=new THREE.Vector3(rail.x,y,z),b=new THREE.Vector3(rail.x,nextY,z+2),bar=new THREE.Mesh(new THREE.CylinderGeometry(.11,.11,a.distanceTo(b),6),orange);bar.position.copy(a).add(b).multiplyScalar(.5);bar.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),b.sub(a).normalize());scene.add(bar);}}
  for(const ramp of ramps){const marker=new THREE.Mesh(new THREE.BoxGeometry(ramp.width*2,.12,.25),mat('#4aafbe'));marker.position.set(ramp.x,snowHeight(ramp.x,ramp.z-1)+.12,ramp.z-1);scene.add(marker);}
  const rider=new THREE.Group();scene.add(rider);const body=new THREE.Mesh(new THREE.BoxGeometry(.55,1.1,.4),mat('#ed835b'));body.position.y=.85;rider.add(body);const head=new THREE.Mesh(new THREE.SphereGeometry(.25,12,8),mat('#f5c5a5'));head.position.y=1.6;rider.add(head);const board=new THREE.Mesh(new THREE.BoxGeometry(1.5,.12,.35),mat('#13364d'));board.position.y=.1;rider.add(board);
  const rival=rider.clone();rival.children[0].material=mat('#af7add');scene.add(rival);
  const gate=new THREE.Mesh(new THREE.BoxGeometry(60,.3,.3),mat('#eea76e'));gate.position.set(0,snowHeight(0,FINISH)+5,FINISH);scene.add(gate);
  function render(m,w,h){renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
    const sin=Math.sin(m.cameraHeading),cos=Math.cos(m.cameraHeading);camera.position.set(m.x-sin*11,m.y+5.5,m.z-cos*11);camera.lookAt(m.x+sin*9,m.y-1.5,m.z+cos*9);
    rider.position.set(m.x,m.y,m.z);rider.rotation.set(m.air?m.flip:0,-m.heading-(m.air?m.spin:0),0);body.scale.y=1-m.charge*.25;
    const rx=Math.sin(m.time*.3)*3;rival.position.set(rx,snowHeight(rx,m.rivalZ),m.rivalZ);renderer.render(scene,camera);
  }
  return { render, dispose:()=>renderer.dispose() };
}
