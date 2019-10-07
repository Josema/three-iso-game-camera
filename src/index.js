import {
    getScaleFromRadius,
    getRadiusFromScale,
    polarToCartesian,
    panCamera
} from './math'

function ThreeIsoGameCamera({
    THREE,
    d3,
    camera,
    domElement,
    canvasWidth,
    canvasHeight,
    angleV = 45, // vertical angle
    angleH = 45, // horizontal angle
    distance = 100, // or radius
    distanceMax = Infinity,
    distanceMin = 0,
    fixedY = false,
    onStart,
    onChange,
    onEnd
}) {
    //
    //
    //
    // Setup
    const tigc = {} // ThreeIsoGameCamera
    tigc.camera = camera
    tigc.domElement = domElement
    tigc.angleV = angleV
    tigc.angleH = angleH
    tigc.distance = distance
    tigc.canvasWidth = canvasWidth
    tigc.canvasHeight = canvasHeight
    tigc.onStart = onStart
    tigc.onChange = onChange
    tigc.onEnd = onEnd
    tigc.THREE = THREE

    //
    //
    //
    // Methods
    tigc.getCameraPosition = function() {
        const fov = tigc.camera.fov
        const scale = tigc.d3Transform.k
        const newRadius = getRadiusFromScale(scale, fov, tigc.canvasHeight)
        const cameraAngle = polarToCartesian(
            tigc.angleV,
            tigc.angleH,
            newRadius
        )
        const x = (tigc.d3Transform.x - tigc.canvasWidth / 2) / scale
        const y = (tigc.d3Transform.y - tigc.canvasHeight / 2) / scale

        const cameraPaned = panCamera(
            new THREE.Vector3(cameraAngle.x, cameraAngle.y, cameraAngle.z),
            new THREE.Vector3(0, 0, 0),
            x,
            y,
            THREE
        )
        return cameraPaned
    }

    tigc.updateCameraPosition = function() {
        const { position, lookAt } = tigc.getCameraPosition()
        // if (fixedY) {
        //     const lookAty = lookAt.y
        //     lookAt.y = 0
        //     position.y -= lookAty
        //     console.log(lookAt, position)
        // }
        tigc.camera.position.set(position.x, position.y, position.z)
        tigc.camera.lookAt(lookAt)
    }

    //
    //
    //
    // d3
    tigc.zoom = d3
        .zoom()
        .scaleExtent([
            getScaleFromRadius(distanceMax, tigc.camera.fov, tigc.canvasHeight),
            getScaleFromRadius(distanceMin, tigc.camera.fov, tigc.canvasHeight)
        ])
        .on('start', e => {
            if (typeof tigc.onStart == 'function') {
                tigc.onStart(d3.event)
            }
        })
        .on('end', e => {
            if (typeof tigc.onEnd == 'function') {
                tigc.onEnd(d3.event)
            }
            // If d3Transform is not the current because onChange we returned false
            // then we have to update the last transform
            if (
                d3.event.sourceEvent &&
                tigc.d3Transform !== d3.event.transform
            ) {
                tigc.zoom.transform(tigc.view, tigc.d3Transform)
            }
        })
        .on('zoom', () => {
            const event = d3.event
            if (
                tigc.onChange === undefined ||
                tigc.onChange(event) ||
                event.sourceEvent === null
            ) {
                tigc.d3Transform = event.transform
                tigc.updateCameraPosition()
            }
        })

    tigc.view = d3.select(domElement)
    tigc.view.call(tigc.zoom) //.on('dblclick.zoom', null)
    const initialScale = getScaleFromRadius(
        tigc.distance,
        tigc.camera.fov,
        tigc.canvasHeight
    )
    const initialTransform = d3.zoomIdentity
        .translate(tigc.canvasWidth / 2, tigc.canvasHeight / 2)
        .scale(initialScale)

    tigc.zoom.transform(tigc.view, initialTransform)

    return tigc
}

export default ThreeIsoGameCamera
