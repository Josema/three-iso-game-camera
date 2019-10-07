const RAD2DEG = 180 / Math.PI
const DEG2RAD = Math.PI / 180

const distance = 10
const fov = 50
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
controls.dampingFactor = 0.1
// controls.screenSpacePanning = true // this is what three-iso-game-camera actually does
controls.minDistance = 10
controls.maxDistance = 50
// controls.maxPolarAngle = Math.PI / 2

camera.position.set(5, 5, 5)
controls.update()

// .... setup and run demo-code
const panLimits = panLimitsOrbitControls({ camera, controls })
function animate(time) {
    panLimits.update({ maxX: 25, maxZ: 25 })
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

function targetTo(x, z, controls, camera) {
    const diffX = controls.target.x - x
    const diffZ = controls.target.z - z
    controls.target.setX(x)
    controls.target.setZ(z)
    camera.position.setX(camera.position.x - diffX)
    camera.position.setZ(camera.position.z - diffZ)
    controls.update()
}

function changePolarToCartesian(angleV, angleH, distance) {
    distance = distance || camera.position.distanceTo(controls.target)
    const point = polarToCartesian(angleV, angleH, distance)
    camera.position.set(
        point.x + controls.target.x,
        point.y + controls.target.y,
        point.z + controls.target.z
    )
    // camera.lookAt(new THREE.Vector3(0, 0, 0))
    controls.update()
}

function panLimitsOrbitControls({ camera, controls }) {
    let positionX
    let positionZ
    return {
        update: ({
            maxX = Infinity,
            minX = -Infinity,
            maxZ = Infinity,
            minZ = -Infinity
        }) => {
            // console.log(controls.getPolarAngle())
            const targetX = controls.target.x
            if (minX <= targetX && maxX >= targetX) {
                positionX = camera.position.x
            } else if (targetX > maxX) {
                camera.position.setX(positionX)
                controls.target.setX(maxX)
            } else if (targetX < minX) {
                camera.position.setX(positionX)
                controls.target.setX(minX)
            }

            const targetZ = controls.target.z
            if (minZ <= targetZ && maxZ >= targetZ) {
                positionZ = camera.position.z
            } else if (targetZ > maxZ) {
                camera.position.setZ(positionZ)
                controls.target.setZ(maxZ)
            } else if (targetZ < minZ) {
                camera.position.setZ(positionZ)
                controls.target.setZ(minZ)
            }
        }
    }
}

//  https://gist.github.com/jhermsmeier/72626d5fd79c5875248fd2c1e8162489
function polarToCartesian(angleV, angleH, radius) {
    var phi = (90 - angleV) * DEG2RAD
    var theta = (angleH + 180) * DEG2RAD
    return {
        x: -(radius * Math.sin(phi) * Math.sin(theta)),
        y: radius * Math.cos(phi),
        z: -radius * Math.sin(phi) * Math.cos(theta)
    }
}

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
