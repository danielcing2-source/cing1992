import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, useTexture, Center } from '@react-three/drei';
import * as THREE from 'three';

interface Room3DProps {
  image: string;
}

const RoomModel: React.FC<{ image: string }> = ({ image }) => {
  const texture = useTexture(image);
  
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#f0f0f0" />
      </mesh>

      {/* Main Wall (where the image is projected) */}
      <mesh position={[0, 0.5, -2]}>
        <planeGeometry args={[8, 5]} />
        <meshStandardMaterial map={texture} />
      </mesh>

      {/* Side Walls */}
      <mesh position={[-4, 0.5, 0.5]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[5, 5]} />
        <meshStandardMaterial color="#e5e5e5" />
      </mesh>
      <mesh position={[4, 0.5, 0.5]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[5, 5]} />
        <meshStandardMaterial color="#e5e5e5" />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 3, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  );
};

export const Room3D: React.FC<Room3DProps> = ({ image }) => {
  return (
    <div className="w-full aspect-video bg-brand-950 rounded-3xl overflow-hidden relative">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 0, 6]} fov={50} />
        <OrbitControls 
          enablePan={true} 
          enableZoom={true} 
          maxPolarAngle={Math.PI / 1.8} 
          minPolarAngle={Math.PI / 3}
          maxAzimuthAngle={Math.PI / 4}
          minAzimuthAngle={-Math.PI / 4}
        />
        
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <spotLight position={[0, 5, 5]} angle={0.3} penumbra={1} intensity={1} castShadow />

        <Suspense fallback={null}>
          <RoomModel image={image} />
        </Suspense>
      </Canvas>
      
      <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-[10px] text-white font-bold uppercase tracking-widest pointer-events-none">
        3D Perspective View
      </div>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full text-xs text-white/80 flex items-center gap-2 pointer-events-none">
        <span>Drag to rotate</span>
        <span className="w-1 h-1 rounded-full bg-white/40" />
        <span>Scroll to zoom</span>
      </div>
    </div>
  );
};
