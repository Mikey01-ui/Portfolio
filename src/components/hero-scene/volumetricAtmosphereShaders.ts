export const voidHazeVertexShader = /* glsl */ `
  varying vec3 vWorldPosition;
  varying vec3 vViewDirection;

  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorldPosition = world.xyz;
    vViewDirection = normalize(world.xyz - cameraPosition);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

export const voidHazeFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uWarm;
  uniform vec3 uCool;

  varying vec3 vWorldPosition;
  varying vec3 vViewDirection;

  float hash(vec3 p) {
    return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
  }

  float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float n = mix(
      mix(mix(hash(i), hash(i + vec3(1.0, 0.0, 0.0)), f.x),
          mix(hash(i + vec3(0.0, 1.0, 0.0)), hash(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
      mix(mix(hash(i + vec3(0.0, 0.0, 1.0)), hash(i + vec3(1.0, 0.0, 1.0)), f.x),
          mix(hash(i + vec3(0.0, 1.0, 1.0)), hash(i + vec3(1.0, 1.0, 1.0)), f.x), f.y),
      f.z
    );
    return n;
  }

  void main() {
    float radial = length(vWorldPosition.xz) * 0.22;
    float vertical = smoothstep(-1.0, 1.35, vWorldPosition.y);
    float grain = noise(vWorldPosition * 0.65 + vec3(0.0, uTime * 0.015, 0.0));

    vec3 keyDir = normalize(vec3(-0.55, 0.72, 0.42));
    float key = pow(max(dot(normalize(vViewDirection), keyDir), 0.0), 2.4);
    float cool = pow(max(dot(normalize(vViewDirection), vec3(0.35, 0.25, -0.88)), 0.0), 3.0);

    vec3 tint = mix(uWarm, uCool, cool * 0.65);
    float alpha = (0.028 + grain * 0.012) * vertical * (0.55 + key * 0.45);
    alpha *= smoothstep(6.5, 1.5, radial);

    gl_FragColor = vec4(tint * (0.35 + key * 0.4), alpha);
  }
`;

export const lightShaftVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying float vAxis;

  void main() {
    vUv = uv;
    vAxis = position.y;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const lightShaftFragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;

  varying vec2 vUv;
  varying float vAxis;

  void main() {
    float radial = length(vUv - 0.5) * 2.0;
    float along = smoothstep(-0.55, 0.45, vAxis);
    float soft = smoothstep(1.0, 0.0, radial);
    float alpha = soft * along * uOpacity;
    gl_FragColor = vec4(uColor, alpha);
  }
`;
