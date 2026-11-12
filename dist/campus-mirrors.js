'use strict';
// A planar render of the actual room, from the camera reflected in the glass.
window.makeCampusMirror=function(T,width,height){
 const target=new T.WebGLRenderTarget(512,512,{depthBuffer:true});
 target.texture.colorSpace=T.LinearSRGBColorSpace;
 const matrix=new T.Matrix4();
 const mat=new T.ShaderMaterial({uniforms:{reflectionReady:{value:0},reflected:{value:target.texture},projection:{value:matrix}},vertexShader:'uniform mat4 projection; varying vec4 reflectedUv; void main(){ reflectedUv=projection*vec4(position,1.0); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',fragmentShader:'uniform sampler2D reflected; uniform float reflectionReady; varying vec4 reflectedUv; void main(){ vec3 c=texture2DProj(reflected,reflectedUv).rgb; gl_FragColor=vec4(mix(vec3(0.66,0.75,0.78),mix(c,vec3(0.58,0.68,0.70),0.06),reflectionReady),1.0); #include <tonemapping_fragment>\n #include <colorspace_fragment> }'});
 // Three r160 uses colorspace_fragment. The currently bundled revision exposes
 // encodings_fragment instead; keep this local module aligned with that bundle.
 if(!T.ShaderChunk.colorspace_fragment)mat.fragmentShader=mat.fragmentShader.replace('colorspace_fragment','encodings_fragment');
 mat.fragmentShader=mat.fragmentShader.replace('; #include',';\n#include');
 const mesh=new T.Mesh(new T.PlaneGeometry(width,height),mat);mesh.userData.noBatch=true;mesh.userData.planarMirror=true;
 const virtual=new T.PerspectiveCamera(),normal=new T.Vector3(),position=new T.Vector3(),view=new T.Vector3(),look=new T.Vector3(),rot=new T.Matrix4(),plane=new T.Plane(),clip=new T.Vector4(),q=new T.Vector4();let last=-Infinity;
 mesh.onBeforeRender=function(renderer,scene,camera){
  if(window.campusMirrorRendering||!renderer.getRenderTarget||!camera.isPerspectiveCamera)return;
  mesh.updateWorldMatrix(true,false);position.setFromMatrixPosition(mesh.matrixWorld);rot.extractRotation(mesh.matrixWorld);normal.set(0,0,1).applyMatrix4(rot).normalize();view.copy(position).sub(camera.position);
  if(view.dot(normal)>0||view.length()>7.5||Date.now()-last<110)return;
  last=Date.now();view.reflect(normal).negate().add(position);virtual.position.copy(view);
  camera.getWorldDirection(look);look.add(camera.position).sub(position).reflect(normal).add(position);
  rot.extractRotation(camera.matrixWorld);virtual.up.set(0,1,0).applyMatrix4(rot).reflect(normal);virtual.lookAt(look);virtual.far=camera.far;virtual.near=camera.near;virtual.updateMatrixWorld();virtual.projectionMatrix.copy(camera.projectionMatrix);
  matrix.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1).multiply(virtual.projectionMatrix).multiply(virtual.matrixWorldInverse).multiply(mesh.matrixWorld);
  // Clip everything behind the physical wall to prevent seeing through it.
  plane.setFromNormalAndCoplanarPoint(normal,position).applyMatrix4(virtual.matrixWorldInverse);clip.set(plane.normal.x,plane.normal.y,plane.normal.z,plane.constant);const p=virtual.projectionMatrix.elements;
  q.set((Math.sign(clip.x)+p[8])/p[0],(Math.sign(clip.y)+p[9])/p[5],-1,(1+p[10])/p[14]);clip.multiplyScalar(2/clip.dot(q));p[2]=clip.x;p[6]=clip.y;p[10]=clip.z+1-.002;p[14]=clip.w;virtual.projectionMatrixInverse.copy(virtual.projectionMatrix).invert();
  const previous=renderer.getRenderTarget(),shadow=renderer.shadowMap.autoUpdate,xr=renderer.xr?.enabled,hidden=[];scene.traverse(o=>{if(o.userData.planarMirror&&o.visible){hidden.push(o);o.visible=false;}});
  window.campusMirrorRendering=true;renderer.shadowMap.autoUpdate=false;if(renderer.xr)renderer.xr.enabled=false;
  try{renderer.setRenderTarget(target);renderer.clear();renderer.render(scene,virtual);mat.uniforms.reflectionReady.value=1;}finally{renderer.setRenderTarget(previous);renderer.shadowMap.autoUpdate=shadow;if(renderer.xr)renderer.xr.enabled=xr;for(const o of hidden)o.visible=true;window.campusMirrorRendering=false;}
  if(camera.viewport)renderer.state.viewport(camera.viewport);
 };return mesh;
};
