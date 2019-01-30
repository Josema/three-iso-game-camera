export function polarToCartesian(angleV, angleH, radius) {
    const phi = ((90 - angleV) * Math.PI) / 180
    const theta = ((angleH - 90) * Math.PI) / 180
    return {
        x: -radius * Math.sin(phi) * Math.sin(theta),
        y: radius * Math.cos(phi),
        z: -radius * Math.sin(phi) * Math.cos(theta)
    }
}

export function getScaleFromRadius(camera_radius_position, fov, innerHeight) {
    const half_fov = fov / 2
    const half_fov_radians = (half_fov * Math.PI) / 180
    const half_fov_height = Math.tan(half_fov_radians) * camera_radius_position
    const fov_height = half_fov_height * 2
    const scale = innerHeight / fov_height // Divide visualization height by height derived from field of view
    return scale
}

export function getRadiusFromScale(scale, fov, innerHeight) {
    const half_fov = fov / 2
    const half_fov_radians = (half_fov * Math.PI) / 180
    const scale_height = innerHeight / scale
    const camera_radius_position =
        scale_height / (2 * Math.tan(half_fov_radians))
    return camera_radius_position
}

export function updateCameraPosition(
    d3_transform,
    angleV,
    angleH,
    camera,
    innerWidth,
    innerHeight,
    THREE
) {
    const fov = camera.fov
    const scale = d3_transform.k
    const newRadius = getRadiusFromScale(scale, fov, innerHeight)
    const cameraAngle = polarToCartesian(angleV, angleH, newRadius)
    const x = (d3_transform.x - innerWidth / 2) / scale
    const y = (d3_transform.y - innerHeight / 2) / scale
    const cameraPaned = panCamera(
        new THREE.Vector3(cameraAngle.x, cameraAngle.y, cameraAngle.z),
        new THREE.Vector3(0, 0, 0),
        x,
        y,
        THREE
    )
    const position = cameraPaned.position
    camera.position.set(position.x, position.y, position.z)
    camera.lookAt(cameraPaned.lookAt)
}

export function panCamera(position, lookAt, x, y, THREE) {
    const worldUp = new THREE.Vector3(0, 1, 0).normalize()
    const distance = lookAt
        .clone()
        .sub(position)
        .normalize()
    const right = distance
        .clone()
        .cross(worldUp)
        .normalize()
    const up = distance.clone().cross(right)
    right.multiplyScalar(-x)
    up.multiplyScalar(-y)
    position = position
        .clone()
        .add(right)
        .add(up)
    lookAt = lookAt
        .clone()
        .add(right)
        .add(up)
    return {
        position: position,
        lookAt: lookAt
    }
}
