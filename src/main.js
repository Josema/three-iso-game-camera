import {
    getScaleFromRadius,
    getRadiusFromScale,
    polarToCartesian,
    panCamera
} from './math'

export default function ThreeIsoGameCamera({
    camera,
    domElement,
    angleV = 45, // vertical angle
    angleH = 45, // horizontal angle
    distance = 100, // or radius
    distanceMax = Infinity,
    distanceMin = 0,
    canvasWidth = window.innerWidth,
    canvasHeight = window.innerHeight,
    onStart,
    onChange,
    onEnd,
    THREE,
    d3
}) {
    // Setup
    this.camera = camera
    this.domElement = domElement
    this.angleV = angleV
    this.angleH = angleH
    this.distance = distance
    this.canvasWidth = canvasWidth
    this.canvasHeight = canvasHeight
    this.onStart = onStart
    this.onChange = onChange
    this.onEnd = onEnd
    this.THREE = THREE

    //
    //
    //
    // d3
    this.zoom = d3
        .zoom()
        .scaleExtent([
            getScaleFromRadius(distanceMax, this.camera.fov, this.canvasHeight),
            getScaleFromRadius(distanceMin, this.camera.fov, this.canvasHeight)
        ])
        .on('start', e => {
            if (typeof this.onStart == 'function') this.onStart(d3.event)
        })
        .on('end', e => {
            if (typeof this.onEnd == 'function') this.onEnd(d3.event)
            // If d3Transform is not the current because onChange we returned false
            // then we have to update the last transform
            if (
                d3.event.sourceEvent &&
                this.d3Transform !== d3.event.transform
            ) {
                this.zoom.transform(view, this.d3Transform)
            }
        })
        .on('zoom', () => {
            const event = d3.event
            if (
                this.onChange === undefined ||
                this.onChange(event) ||
                event.sourceEvent === null
            ) {
                this.d3Transform = event.transform
                this.updateCameraPosition()
            }
        })

    const view = d3.select(domElement)
    view.call(this.zoom).on('dblclick.zoom', null)
    const initialScale = getScaleFromRadius(
        this.distance,
        this.camera.fov,
        this.canvasHeight
    )
    const initialTransform = d3.zoomIdentity
        .translate(this.canvasWidth / 2, this.canvasHeight / 2)
        .scale(initialScale)

    this.zoom.transform(view, initialTransform)
}

ThreeIsoGameCamera.prototype.getCameraPosition = function() {
    const fov = this.camera.fov
    const scale = this.d3Transform.k
    const newRadius = getRadiusFromScale(scale, fov, this.canvasHeight)
    const cameraAngle = polarToCartesian(this.angleV, this.angleH, newRadius)
    const x = (this.d3Transform.x - this.canvasWidth / 2) / scale
    const y = (this.d3Transform.y - this.canvasHeight / 2) / scale
    const cameraPaned = panCamera(
        new this.THREE.Vector3(cameraAngle.x, cameraAngle.y, cameraAngle.z),
        new this.THREE.Vector3(0, 0, 0),
        x,
        y,
        this.THREE
    )
    return cameraPaned
}

ThreeIsoGameCamera.prototype.updateCameraPosition = function() {
    const cameraPaned = this.getCameraPosition()
    const position = cameraPaned.position
    this.camera.position.set(position.x, position.y, position.z)
    this.camera.lookAt(cameraPaned.lookAt)
}
