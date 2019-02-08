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
    canvasWidth,
    canvasHeight,
    onChange,
    THREE,
    d3
}) {
    // Setup
    this.THREE = THREE
    this.angleV = angleV
    this.angleH = angleH
    this.distance = distance
    this.canvasWidth = canvasWidth || window.innerWidth
    this.canvasHeight = canvasHeight || window.innerHeight
    this.camera = camera
    this.domElement = domElement
    this.onChange = onChange

    //
    //
    //
    // d3
    const zoom = d3
        .zoom()
        .scaleExtent([
            getScaleFromRadius(distanceMax, this.camera.fov, this.canvasHeight),
            getScaleFromRadius(distanceMin, this.camera.fov, this.canvasHeight)
        ])
        .on('zoom', () => {
            const event = d3.event
            this.d3Transform = event.transform
            if (
                event.sourceEvent === null ||
                this.onChange === undefined ||
                this.onChange(event)
            ) {
                this.updateCameraPosition()
            }
        })

    const view = d3.select(domElement)
    view.call(zoom)
    const initialScale = getScaleFromRadius(
        this.distance,
        this.camera.fov,
        this.canvasHeight
    )
    const initialTransform = d3.zoomIdentity
        .translate(this.canvasWidth / 2, this.canvasHeight / 2)
        .scale(initialScale)

    zoom.transform(view, initialTransform)
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
