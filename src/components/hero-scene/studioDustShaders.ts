export const studioDustVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  uniform float uMotion;
  uniform vec3 uKeyDir;
  uniform vec3 uFillDir;
  uniform vec3 uRimDir;

  attribute float aSeed;
  attribute float aSize;

  varying float vLight;
  varying float vAlpha;
  varying vec3 vTint;

  void main() {
    vec3 pos = position;

    float t = uTime * uMotion;
    float s = aSeed * 6.28318;

    pos.x += sin(t * 0.51 + s) * 0.012;
    pos.y += cos(t * 0.39 + s * 1.7) * 0.009;
    pos.z += sin(t * 0.44 + s * 2.1) * 0.01;

    vec4 world = modelMatrix * vec4(pos, 1.0);
    vec4 mvPosition = viewMatrix * world;
    gl_Position = projectionMatrix * mvPosition;

    float depthScale = 320.0 / -mvPosition.z;
    gl_PointSize = clamp(uSize * aSize * depthScale, 1.2, 22.0);

    vec3 samplePos = normalize(world.xyz + vec3(0.0, 0.15, 0.0));
    float key = max(dot(samplePos, normalize(uKeyDir)), 0.0);
    float fill = max(dot(samplePos, normalize(uFillDir)), 0.0) * 0.28;
    float rim = pow(max(dot(samplePos, normalize(uRimDir)), 0.0), 2.0) * 0.6;

    vLight = clamp(0.4 + key * 0.5 + fill + rim * 0.38, 0.0, 1.0);
    vAlpha = 0.5 + 0.5 * aSeed;
    vTint = vec3(key, fill, rim);
  }
`;

export const studioDustFragmentShader = /* glsl */ `
  uniform vec3 uWarm;
  uniform vec3 uCool;
  uniform vec3 uRim;

  varying float vLight;
  varying float vAlpha;
  varying vec3 vTint;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float dist = length(uv);
    if (dist > 0.5) {
      discard;
    }

    float soft = smoothstep(0.5, 0.14, dist);
    float alpha = soft * vAlpha * 0.22 * mix(0.72, 1.0, vLight);

    vec3 color = mix(uCool, uWarm, clamp(vTint.x + vLight * 0.4, 0.0, 1.0));
    color = mix(color, uRim, clamp(vTint.z, 0.0, 1.0) * 0.5);
    color += vec3(0.06, 0.05, 0.04) * vLight;

    gl_FragColor = vec4(color, alpha);
  }
`;
