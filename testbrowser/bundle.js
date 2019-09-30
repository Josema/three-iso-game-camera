(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = global || self, global.howLongUntilLunch = factory());
}(this, function () { 'use strict';

    function polarToCartesian(angleV, angleH, radius) {
        var phi = (90 - angleV) * Math.PI / 180;
        var theta = (90 - angleH) * Math.PI / 180;
        return {
            x: radius * Math.sin(phi) * Math.sin(theta),
            y: radius * Math.cos(phi),
            z: radius * Math.sin(phi) * Math.cos(theta)
        };
    }

    function getScaleFromRadius(camera_radius_position, fov, innerHeight) {
        var half_fov = fov / 2;
        var half_fov_radians = half_fov * Math.PI / 180;
        var half_fov_height = Math.tan(half_fov_radians) * camera_radius_position;
        var fov_height = half_fov_height * 2;
        var scale = innerHeight / fov_height; // Divide visualization height by height derived from field of view
        return scale;
    }

    function getRadiusFromScale(scale, fov, innerHeight) {
        var half_fov = fov / 2;
        var half_fov_radians = half_fov * Math.PI / 180;
        var scale_height = innerHeight / scale;
        var camera_radius_position = scale_height / (2 * Math.tan(half_fov_radians));
        return camera_radius_position;
    }

    function panCamera(position, lookAt, x, y, THREE) {
        var worldUp = new THREE.Vector3(0, 1, 0).normalize();
        var distance = lookAt.clone().sub(position).normalize();
        var right = distance.clone().cross(worldUp).normalize();
        var up = distance.clone().cross(right);
        right.multiplyScalar(-x);
        up.multiplyScalar(-y);
        position = position.clone().add(right).add(up);
        lookAt = lookAt.clone().add(right).add(up);
        return {
            position: position,
            lookAt: lookAt
        };
    }

    function ThreeIsoGameCamera(_ref) {
        var THREE = _ref.THREE,
            d3 = _ref.d3,
            camera = _ref.camera,
            domElement = _ref.domElement,
            canvasWidth = _ref.canvasWidth,
            canvasHeight = _ref.canvasHeight,
            _ref$angleV = _ref.angleV,
            angleV = _ref$angleV === undefined ? 45 : _ref$angleV,
            _ref$angleH = _ref.angleH,
            angleH = _ref$angleH === undefined ? 45 : _ref$angleH,
            _ref$distance = _ref.distance,
            distance = _ref$distance === undefined ? 100 : _ref$distance,
            _ref$distanceMax = _ref.distanceMax,
            distanceMax = _ref$distanceMax === undefined ? Infinity : _ref$distanceMax,
            _ref$distanceMin = _ref.distanceMin,
            distanceMin = _ref$distanceMin === undefined ? 0 : _ref$distanceMin,
            onStart = _ref.onStart,
            onChange = _ref.onChange,
            onEnd = _ref.onEnd;

        //
        //
        //
        // Setup
        var tigc = {}; // ThreeIsoGameCamera
        tigc.camera = camera;
        tigc.domElement = domElement;
        tigc.angleV = angleV;
        tigc.angleH = angleH;
        tigc.distance = distance;
        tigc.canvasWidth = canvasWidth;
        tigc.canvasHeight = canvasHeight;
        tigc.onStart = onStart;
        tigc.onChange = onChange;
        tigc.onEnd = onEnd;
        tigc.THREE = THREE;

        //
        //
        //
        // Methods
        tigc.getCameraPosition = function () {
            var fov = tigc.camera.fov;
            var scale = tigc.d3Transform.k;
            var newRadius = getRadiusFromScale(scale, fov, tigc.canvasHeight);
            var cameraAngle = polarToCartesian(tigc.angleV, tigc.angleH, newRadius);
            var x = (tigc.d3Transform.x - tigc.canvasWidth / 2) / scale;
            var y = (tigc.d3Transform.y - tigc.canvasHeight / 2) / scale;
            var cameraPaned = panCamera(new tigc.THREE.Vector3(cameraAngle.x, cameraAngle.y, cameraAngle.z), new tigc.THREE.Vector3(0, 0, 0), x, y, tigc.THREE);
            return cameraPaned;
        };

        tigc.updateCameraPosition = function () {
            var cameraPaned = tigc.getCameraPosition();
            var position = cameraPaned.position;
            tigc.camera.position.set(position.x, position.y, position.z);
            tigc.camera.lookAt(cameraPaned.lookAt);
        };

        //
        //
        //
        // d3
        tigc.zoom = d3.zoom().scaleExtent([getScaleFromRadius(distanceMax, tigc.camera.fov, tigc.canvasHeight), getScaleFromRadius(distanceMin, tigc.camera.fov, tigc.canvasHeight)]).on('start', function (e) {
            if (typeof tigc.onStart == 'function') tigc.onStart(d3.event);
        }).on('end', function (e) {
            if (typeof tigc.onEnd == 'function') tigc.onEnd(d3.event);
            // If d3Transform is not the current because onChange we returned false
            // then we have to update the last transform
            if (d3.event.sourceEvent && tigc.d3Transform !== d3.event.transform) {
                tigc.zoom.transform(tigc.view, tigc.d3Transform);
            }
        }).on('zoom', function () {
            var event = d3.event;
            if (tigc.onChange === undefined || tigc.onChange(event) || event.sourceEvent === null) {
                tigc.d3Transform = event.transform;
                tigc.updateCameraPosition();
            }
        });

        tigc.view = d3.select(domElement);
        tigc.view.call(tigc.zoom); //.on('dblclick.zoom', null)
        var initialScale = getScaleFromRadius(tigc.distance, tigc.camera.fov, tigc.canvasHeight);
        var initialTransform = d3.zoomIdentity.translate(tigc.canvasWidth / 2, tigc.canvasHeight / 2).scale(initialScale);

        tigc.zoom.transform(tigc.view, initialTransform);

        return tigc;
    }

    return ThreeIsoGameCamera;

}));

},{}],2:[function(require,module,exports){
window.ThreeIsoGameCamera = require('../dist/three-iso-game-camera.umd.js')

},{"../dist/three-iso-game-camera.umd.js":1}]},{},[2]);
