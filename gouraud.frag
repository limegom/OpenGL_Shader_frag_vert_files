#version 330 core

in vec3 v_Color;

// 불투명도
uniform float u_Alpha;

// 최종적으로 화면에 출력될 색
out vec4 FragColor;

void main() {
    FragColor = vec4(v_Color, u_Alpha);
}