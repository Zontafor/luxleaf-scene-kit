import React, { useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Canvas, useFrame } from '@react-three/fiber'
import { record } from './capture.js'
import './style.css'
function Sculpture({ position, kind, color, paused }) {
  const mesh = useRef()
  useFrame((state, delta) => {
    if (!paused) {
      mesh.current.rotation.y += delta * 0.35
      mesh.current.rotation.x += delta * 0.12
    }
  })
  return (
    <mesh ref={mesh} position={position} castShadow receiveShadow>
      {kind === 'knot' ? (
        <torusKnotGeometry args={[0.68, 0.22, 180, 32]} />
      ) : kind === 'box' ? (
        <boxGeometry args={[1.15, 1.15, 1.15]} />
      ) : (
        <icosahedronGeometry args={[0.82, 2]} />
      )}
      <meshStandardMaterial color={color} metalness={0.62} roughness={0.24} />
    </mesh>
  )
}
function App() {
  const [paused, pause] = useState(false),
    [busy, setBusy] = useState(false),
    [status, setStatus] = useState('Live geometry · real lighting · animated transforms')
  return (
    <main>
      <header>
        LUXLEAF <span>SCENE KIT / MOTION STUDY</span>
      </header>
      <h1>Form meets motion.</h1>
      <p>Three geometries. One live scene.</p>
      <div className="stage">
        <Canvas shadows dpr={1} gl={{ preserveDrawingBuffer: true }} camera={{ position: [0, 2.6, 7.4], fov: 39 }}>
          <color attach="background" args={['#0c1e1d']} />
          <ambientLight intensity={1.1} />
          <directionalLight position={[3, 6, 5]} intensity={4} castShadow shadow-mapSize={[1024, 1024]} />
          <pointLight position={[-3, 2, 2]} intensity={28} color="#d7f5c5" />
          <Sculpture kind="ico" position={[-2.1, 0.1, 0]} color="#b2cfb5" paused={paused} />
          <Sculpture kind="knot" position={[0, 0.1, 0]} color="#d8ac6b" paused={paused} />
          <Sculpture kind="box" position={[2.1, 0.1, 0]} color="#7db4a2" paused={paused} />
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
            <planeGeometry args={[200, 200]} />
            <meshStandardMaterial color="#142c28" roughness={0.8} />
          </mesh>
        </Canvas>
      </div>
      <section>
        <button disabled={busy} onClick={() => pause(!paused)}>
          {paused ? 'Play motion' : 'Pause motion'}
        </button>
        <button
          disabled={busy}
          onClick={async () => {
            pause(false)
            setBusy(true)
            setStatus('Recording 10 seconds…')
            try {
              await record(document.querySelector('.stage canvas'), 'scene-kit-motion')
              setStatus('Saved actual scene recording')
            } catch (e) {
              setStatus(String(e))
            } finally {
              setBusy(false)
            }
          }}>
          {busy ? 'Recording…' : 'Record video'}
        </button>
        <span role="status">{status}</span>
      </section>
      <footer>LuxLeaf composition using the licensed React Three Fiber foundation. No generated footage.</footer>
    </main>
  )
}
createRoot(document.getElementById('root')).render(<App />)
