const script = document.createElement('script')
script.onload = () => {
    const script2 = document.createElement('script')
    script2.src = './script.js?' + Math.random()
    document.head.appendChild(script2)
}
script.src = './OrbitControls.js?' + Math.random()
document.head.appendChild(script)
