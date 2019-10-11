const RAD2DEG = 180 / Math.PI
const DEG2RAD = Math.PI / 180

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

// Limits
const maxX = 25
const minX = -25
const maxZ = 25
const minZ = -Infinity
// State
let positionX
let positionZ
let phi
let theta

changePolarToCartesian({ angleV, angleH, distance })
controls.addEventListener('change', e => {
    const x = controls.target.x
    const z = controls.target.z
    let shallWeUpdateAngle = false

    if (x < minX || x > maxX) {
        controls.target.setX(x < minX ? minX : maxX)
        camera.position.setX(positionX)
        shallWeUpdateAngle = true
    }
    if (z < minZ || z > maxZ) {
        controls.target.setZ(z < minZ ? minZ : maxZ)
        camera.position.setZ(positionZ)
        shallWeUpdateAngle = true
    }

    if (shallWeUpdateAngle) {
        const distance = camera.position.distanceTo(controls.target)
        camera.position.set(
            distance * Math.sin(phi) * Math.sin(theta) + controls.target.x,
            distance * Math.cos(phi) + controls.target.y,
            distance * Math.sin(phi) * Math.cos(theta) + controls.target.z
        )
    }

    // Updating state
    positionX = camera.position.x
    positionZ = camera.position.z
    phi = controls.getPolarAngle()
    theta = controls.getAzimuthalAngle()
})

function targetTo(x, z, controls, camera) {
    const diffX = controls.target.x - x
    const diffZ = controls.target.z - z
    controls.target.setX(x)
    controls.target.setZ(z)
    camera.position.setX(camera.position.x - diffX)
    camera.position.setZ(camera.position.z - diffZ)
}

function changePolarToCartesian({
    angleV,
    angleH,
    distance = camera.position.distanceTo(controls.target)
}) {
    const point = polarToCartesian(angleV, angleH, distance)
    camera.position.set(
        point.x + controls.target.x,
        point.y + controls.target.y,
        point.z + controls.target.z
    )
    controls.update()
}

//  https://gist.github.com/jhermsmeier/72626d5fd79c5875248fd2c1e8162489
function polarToCartesian(angleV, angleH, radius) {
    const phi = angleV * DEG2RAD
    const theta = angleH * DEG2RAD
    return {
        x: radius * Math.sin(phi) * Math.sin(theta),
        y: radius * Math.cos(phi),
        z: radius * Math.sin(phi) * Math.cos(theta)
    }
}

// .... setup and run demo-code
function animate(time) {
    document.getElementById('output').innerHTML = `${Math.round(
        controls.getPolarAngle() * RAD2DEG
    )} ${Math.round(controls.getAzimuthalAngle() * RAD2DEG)} ${Math.round(
        camera.position.distanceTo(controls.target)
    )}`

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

// const panLimits = panLimitsOrbitControls({ camera, controls })
// function panLimitsOrbitControls({ camera, controls }) {
//     let positionX
//     let positionY
//     let positionZ
//     let targetX
//     let targetY
//     let targetZ

//     return {
//         update: ({
//             maxX = Infinity,
//             minX = -Infinity,
//             maxZ = Infinity,
//             minZ = -Infinity
//         }) => {
//             if (minX <= controls.target.x && maxX >= controls.target.x) {
//                 positionX = camera.position.x
//             } else if (controls.target.x > maxX) {
//                 // camera.position.setX(positionX)
//                 controls.target.setX(maxX)
//                 changePolarToCartesian(angleV, angleH)
//             }
//         }
//     }
// }
