import { getScaleFromRadius, updateCameraPosition } from './math'

export default function ThreeIsoGameCamera({
    camera,
    renderer,
    THREE,
    d3,
    angleV = 45, // vertical angle
    angleH = 45, // horizontal angle
    distance = 100, // or radius
    distanceMax = Infinity,
    distanceMin = 0
}) {
    // Setup
    this.THREE = THREE
    this.angleV = angleV
    this.angleH = angleH
    this.distance = distance
    this.innerWidth = window.innerWidth
    this.innerHeight = window.innerHeight
    this.camera = camera
    this.renderer = renderer
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(this.innerWidth, this.innerHeight)

    //
    //
    //
    // d3
    const zoom = d3
        .zoom()
        .scaleExtent([
            getScaleFromRadius(distanceMax, this.camera.fov, this.innerHeight),
            getScaleFromRadius(distanceMin, this.camera.fov, this.innerHeight)
        ])
        .on('zoom', () => {
            this.d3Transform = d3.event.transform
            return updateCameraPosition(
                this.d3Transform,
                this.angleV,
                this.angleH,
                this.camera,
                this.innerWidth,
                this.innerHeight,
                THREE
            )
        })

    const view = d3.select(this.renderer.domElement)
    view.call(zoom)
    const initialScale = getScaleFromRadius(
        this.distance,
        this.camera.fov,
        this.innerHeight
    )
    const initialTransform = d3.zoomIdentity
        .translate(this.innerWidth / 2, this.innerHeight / 2)
        .scale(initialScale)

    zoom.transform(view, initialTransform)

    // binding
    this.startRender = this.startRender.bind(this)
    this.onWindowResize = this.onWindowResize.bind(this)
    window.addEventListener('resize', this.onWindowResize)
}

ThreeIsoGameCamera.prototype.startRender = function(scene) {
    const animate = () => {
        this.renderer.render(scene, this.camera)
        requestAnimationFrame(animate)
    }
    animate()
}

ThreeIsoGameCamera.prototype.onWindowResize = function() {
    const innerWidth = window.innerWidth
    const innerHeight = window.innerHeight
    this.innerWidth = innerWidth
    this.innerHeight = innerHeight
    updateCameraPosition(
        this.d3Transform,
        this.angleV,
        this.angleH,
        this.camera,
        this.innerWidth,
        this.innerHeight,
        this.THREE
    )
    this.renderer.setSize(innerWidth, innerHeight)
    this.camera.aspect = innerWidth / innerHeight
    this.camera.updateProjectionMatrix()
}
