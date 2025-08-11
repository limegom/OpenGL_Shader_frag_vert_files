#version 330 core

layout(location = 0) in vec3 aPos;
layout(location = 1) in vec3 aNormal;

uniform mat4 u_ModelViewProjectionMatrix;
uniform mat4 u_ModelMatrix;
uniform mat3 u_NormalMatrix;

out vec3 FragPos;
out vec3 Normal;

void main() {
    FragPos = vec3(u_ModelMatrix * vec4(aPos,1.0));
    Normal  = normalize(u_NormalMatrix * aNormal);
    gl_Position = u_ModelViewProjectionMatrix * vec4(aPos,1.0);
}