#version 330 core

in vec3 v_Color;

// ������
uniform float u_Alpha;

// ���������� ȭ�鿡 ��µ� ��
out vec4 FragColor;

void main() {
    FragColor = vec4(v_Color, u_Alpha);
}