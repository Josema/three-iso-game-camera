const angleV = 30
const angleH = 45
const distance = 100
const fov = 10
const near = 1
const far = 999999

const scene = new THREE.Scene()
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)

// camera
const camera = new THREE.PerspectiveCamera(
    fov, // fov
    window.innerWidth / window.innerHeight, // aspect
    near, // near
    far // far
)

// OrbitControls
const controls = new THREE.OrbitControls(camera, renderer.domElement)
// controls.enableRotate = true
controls.mouseButtons = { LEFT: THREE.MOUSE.PAN, RIGHT: THREE.MOUSE.ROTATE }
controls.touches = { ONE: THREE.TOUCH.PAN, TWO: THREE.TOUCH.DOLLY_PAN }
// controls.enableDamping = true // if true has a bug when zooming on limits
// controls.dampingFactor = 0.1
// controls.screenSpacePanning = true // this is what three-iso-game-camera actually does
// controls.minDistance = 10
// controls.maxDistance = 50
// controls.maxPolarAngle = Math.PI / 2

changePolarToCartesian({ angleV, angleH, distance })

controls.addEventListener('change', e => {})

// .... setup and run demo-code
function animate(time) {
    document.getElementById('output').innerHTML = `${Math.round(
        (controls.getPolarAngle() * 180) / Math.PI
    )} ${Math.round(
        (controls.getAzimuthalAngle() * 180) / Math.PI
    )} ${Math.round(camera.position.distanceTo(controls.target))}`

    renderer.render(scene, camera)
    requestAnimationFrame(animate)
}
animate()

// .... bind events
window.addEventListener('resize', ev => {
    renderer.setSize(window.innerWidth, window.innerHeight)
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
})

document.body.appendChild(renderer.domElement)

// geometry
scene.add(new THREE.GridHelper(50, 100, 0xaaaaaa, 0x999999))
scene.add(new THREE.AxesHelper(5))
scene.add(
    new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshStandardMaterial({
            roughness: 0.4,
            metalness: 0.1
        })
    )
)
// lights
const dirLight = new THREE.DirectionalLight()
dirLight.position.set(1, 0.4, 0.2)
scene.add(dirLight, new THREE.AmbientLight(0x444444))
