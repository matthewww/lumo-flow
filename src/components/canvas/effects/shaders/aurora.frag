varying vec2 vUv;

void main() {
  vec2 uv = vUv * 2.0 - 1.0;
  float t = u_time * 0.15;

  vec2 warp = vec2(
    snoise(vec3(uv.x * 1.2, uv.y * 1.2, t)),
    snoise(vec3(uv.x * 1.5 + 10.0, uv.y * 1.5, t * 1.2))
  );
  uv += warp * 0.4;

  float wave = sin(uv.y * 4.0 - uv.x * 3.0 + u_time * 0.8) * 0.5 + 0.5;
  wave *= snoise(vec3(uv * 2.5, t * 2.0)) * 0.5 + 0.5;

  float intensity = smoothstep(0.1, 0.7, wave);

  vec3 col = mix(u_color1, u_color2, uv.x * 0.5 + 0.5);
  col = mix(col, u_color3, intensity);
  col += u_color3 * pow(intensity, 2.5) * 0.6;

  float dist = length(vUv - 0.5);
  float alpha = smoothstep(0.8, 0.2, dist) * 0.9;

  gl_FragColor = vec4(col, alpha);
}
