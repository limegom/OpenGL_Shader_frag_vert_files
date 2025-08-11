#version 330 core
layout(location = 0) in vec3 aPos;
layout(location = 1) in vec3 aNormal;

// --- 유니폼 변수 ---
// 행렬 및 카메라
uniform mat4 u_ModelViewProjectionMatrix;
uniform mat4 u_ModelMatrix;
uniform mat3 u_NormalMatrix;
uniform vec3 u_ViewPos;

// 재질
uniform vec3 u_MatAmbient;
uniform vec3 u_MatDiffuse;
uniform vec3 u_MatSpecular;
uniform float u_MatShininess;

// 1. 세상 광원 (Point Light)
uniform bool u_worldLightOn;
uniform vec3 u_LightPos;
uniform vec3 u_LightAmbient;
uniform vec3 u_LightDiffuse;
uniform vec3 u_LightSpecular;

// 2. 카메라 스폿 광원 (Camera Spot Light)
uniform bool u_SpotOn;
uniform vec3 u_SpotPos;
uniform vec3 u_SpotDir;
uniform float u_SpotCutOff;

// 3. 거미 스폿 광원 (Spider Spot Light)
uniform bool u_SpiderLightOn;
uniform vec3 u_SpiderLightPos;
uniform vec3 u_SpiderSpotDir;
uniform float u_SpiderSpotCutOff;
uniform vec3 u_SpiderLightAmbient;
uniform vec3 u_SpiderLightDiffuse;
uniform vec3 u_SpiderLightSpecular;

// 불투명도
uniform float u_Alpha;

out vec3 v_Color; // 프래그먼트 셰이더로 전달할 최종 색상

void main() {
    // --- 공통 계산 ---
    vec3 fragPos = vec3(u_ModelMatrix * vec4(aPos, 1.0));
    vec3 N = normalize(u_NormalMatrix * aNormal);
    vec3 V = normalize(u_ViewPos - fragPos);

    // --- 기본 주변광(Ambient) 계산 ---
    // 주변광은 세상 광원의 것을 기본으로 사용합니다.
    vec3 ambient = u_LightAmbient * u_MatAmbient;
    
    // --- 최종 조명 효과 (초기값은 0) ---
    vec3 total_light_effect = vec3(0.0, 0.0, 0.0);

    // --- 1. 세상 광원 효과 계산 ---
    if (u_worldLightOn) {
        vec3 L = normalize(u_LightPos - fragPos);
        vec3 R = reflect(-L, N);
        float diff = max(dot(N, L), 0.0);
        float spec = pow(max(dot(V, R), 0.0), u_MatShininess);
        
        vec3 diffuse = u_LightDiffuse * diff * u_MatDiffuse;
        vec3 specular = u_LightSpecular * spec * u_MatSpecular;
        total_light_effect += diffuse + specular;
    }

    // --- 2. 카메라 스폿 광원 효과 계산 ---
    if (u_SpotOn) {
        vec3 L = normalize(u_SpotPos - fragPos);
        vec3 R = reflect(-L, N);
    
        // lightDir: 광원에서 프래그먼트로 향하는 방향 벡터
        vec3 lightDir = normalize(fragPos - u_SpotPos); 
        // spotDir: 광원이 바라보는 방향 벡터
        vec3 spotDir = normalize(u_SpotDir);
        // theta: 광원 방향과 스폿 방향 사이의 각도
        float theta = dot(lightDir, spotDir);
        if (theta > u_SpotCutOff) {
            float spotFactor = pow((theta - u_SpotCutOff) / (1.0 - u_SpotCutOff), 2.0);
            spotFactor = clamp(spotFactor, 0.0, 1.0);

            float diff = max(dot(N, L), 0.0);
            float spec = pow(max(dot(V, R), 0.0), u_MatShininess);

            // 카메라 스폿은 세상 광원의 색을 따라갑니다.
            vec3 diffuse = u_LightDiffuse * diff * u_MatDiffuse;
            vec3 specular = u_LightSpecular * spec * u_MatSpecular;
            total_light_effect += (diffuse + specular) * spotFactor;
        }
    }

    // --- 3. 거미 스폿 광원 효과 계산 ---
    if (u_SpiderLightOn) {
        vec3 L = normalize(u_SpiderLightPos - fragPos);
        vec3 R = reflect(-L, N);
        
        float theta = dot(normalize(fragPos - u_SpiderLightPos), -normalize(u_SpiderSpotDir));
        if (theta > u_SpiderSpotCutOff) {
            float spotFactor = pow((theta - u_SpiderSpotCutOff) / (1.0 - u_SpiderSpotCutOff), 2.0);
            spotFactor = clamp(spotFactor, 0.0, 1.0);

            float diff = max(dot(N, L), 0.0);
            float spec = pow(max(dot(V, R), 0.0), u_MatShininess);
            
            // 거미 스폿은 자신만의 색(빨간색)을 사용합니다.
            vec3 diffuse = u_SpiderLightDiffuse * diff * u_MatDiffuse;
            vec3 specular = u_SpiderLightSpecular * spec * u_MatSpecular;
            total_light_effect += (diffuse + specular) * spotFactor;
        }
    }

    // --- 최종 색상 및 위치 계산 ---
    v_Color = ambient + total_light_effect;
    gl_Position = u_ModelViewProjectionMatrix * vec4(aPos, 1.0);
}