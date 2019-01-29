import { getScaleFromRadius, updateCameraPosition } from './math'

export default function ThreeGameCamera({
    renderer,
    canvas,
    THREE,
    d3,
    angleV = 45, // vertical angle
    angleH = 45, // horizontal angle
    radius = 100, // or distance
    fov = 10
}) {
    // Setup
    this.THREE = THREE
    this.angleV = angleV
    this.angleH = angleH
    this.radius = radius
    this.fov = fov
    this.innerWidth = window.innerWidth
    this.innerHeight = window.innerHeight
    this.camera = new THREE.PerspectiveCamera(
        this.fov,
        this.innerWidth / this.innerHeight, // aspect
        10, // near
        500 // far
    )
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
            getScaleFromRadius(radius * 4, fov, innerHeight),
            getScaleFromRadius(radius / 1.5, fov, innerHeight)
        ])
        .on('zoom', () => {
            this.d3Transform = d3.event.transform
            return updateCameraPosition(
                this.d3Transform,
                this.angleV,
                this.angleH,
                this.camera,
                this.fov,
                this.innerWidth,
                this.innerHeight,
                THREE
            )
        })

    const view = d3.select(canvas)
    view.call(zoom)
    const initialScale = getScaleFromRadius(
        this.radius,
        this.fov,
        this.innerHeight
    )
    const initialTransform = d3.zoomIdentity
        .translate(this.innerWidth / 2, this.innerHeight / 2)
        .scale(initialScale)

    zoom.transform(view, initialTransform)

    // binding
    this.onWindowResize = this.onWindowResize.bind(this)
}

ThreeGameCamera.prototype.onWindowResize = function() {
    const innerWidth = window.innerWidth
    const innerHeight = window.innerHeight
    this.innerWidth = innerWidth
    this.innerHeight = innerHeight
    updateCameraPosition(
        this.d3Transform,
        this.angleV,
        this.angleH,
        this.camera,
        this.fov,
        this.innerWidth,
        this.innerHeight,
        this.THREE
    )
    this.renderer.setSize(innerWidth, innerHeight)
    this.camera.aspect = innerWidth / innerHeight
    this.camera.updateProjectionMatrix()
}
