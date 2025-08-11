#version 330 core

in vec3 FragPos;
in vec3 Normal;

out vec4 FragColor;

// Phong 쉐이더와 동일한 변수 선언
uniform vec3 u_MatAmbient;
uniform vec3 u_MatDiffuse;
uniform vec3 u_MatSpecular;
uniform float u_MatShininess;
uniform vec3 u_ViewPos;

// 모든 광원 정보
uniform bool u_worldLightOn;
uniform vec3 u_LightPos;
uniform vec3 u_LightAmbient;
uniform vec3 u_LightDiffuse;
uniform vec3 u_LightSpecular;

uniform bool u_SpotOn;
uniform vec3 u_SpotPos;
uniform vec3 u_SpotDir;
uniform float u_SpotCutOff;

uniform bool u_SpiderLightOn;
uniform vec3 u_SpiderLightPos;
uniform vec3 u_SpiderSpotDir;
uniform float u_SpiderSpotCutOff;
uniform vec3 u_SpiderLightAmbient;
uniform vec3 u_SpiderLightDiffuse;
uniform vec3 u_SpiderLightSpecular;

// 불투명도
uniform float u_Alpha;

void main() {
    vec3 N = normalize(Normal);
    vec3 V = normalize(u_ViewPos - FragPos);

    // 1. Phong 조명 계산은 기존과 동일하게
    vec3 ambient = u_LightAmbient * u_MatAmbient;
    vec3 total_light_effect = vec3(0.0, 0.0, 0.0);

    if (u_worldLightOn) {
        vec3 L = normalize(u_LightPos - FragPos);
        vec3 R = reflect(-L, N);
        float diff = max(dot(N, L), 0.0);
        float spec = pow(max(dot(V, R), 0.0), u_MatShininess);
        vec3 diffuse = u_LightDiffuse * diff * u_MatDiffuse;
        vec3 specular = u_LightSpecular * spec * u_MatSpecular;
        total_light_effect += diffuse + specular;
    }
    if (u_SpotOn) {
        vec3 L = normalize(u_SpotPos - FragPos);
        vec3 R = reflect(-L, N);
        float theta = dot(normalize(FragPos - u_SpotPos), normalize(u_SpotDir));
        if (theta > u_SpotCutOff) {
            float spotFactor = pow((theta - u_SpotCutOff) / (1.0 - u_SpotCutOff), 2.0);
            float diff = max(dot(N, L), 0.0);
            float spec = pow(max(dot(V, R), 0.0), u_MatShininess);
            vec3 diffuse = u_LightDiffuse * diff * u_MatDiffuse;
            vec3 specular = u_LightSpecular * spec * u_MatSpecular;
            total_light_effect += (diffuse + specular) * spotFactor;
        }
    }
    if (u_SpiderLightOn) {
        vec3 L = normalize(u_SpiderLightPos - FragPos);
        vec3 R = reflect(-L, N);
        float theta = dot(normalize(FragPos - u_SpiderLightPos), normalize(u_SpiderSpotDir));
        if (theta > u_SpiderSpotCutOff) {
            float spotFactor = pow((theta - u_SpiderSpotCutOff) / (1.0 - u_SpotCutOff), 2.0);
            float diff = max(dot(N, L), 0.0);
            float spec = pow(max(dot(V, R), 0.0), u_MatShininess);
            vec3 diffuse = u_SpiderLightDiffuse * diff * u_MatDiffuse;
            vec3 specular = u_SpiderLightSpecular * spec * u_MatSpecular;
            total_light_effect += (diffuse + specular) * spotFactor;
        }
    }
    
    vec3 phong_color = ambient + total_light_effect;

    // 색상 반전
    vec3 inverted_color = vec3(1.0, 1.0, 1.0) - phong_color;

    // 최종 색
    FragColor = vec4(inverted_color, u_Alpha);
}