#version 330 core

in vec3 FragPos;
in vec3 Normal;

out vec4 FragColor;

// 재질 및 카메라
uniform vec3 u_MatAmbient;
uniform vec3 u_MatDiffuse;
uniform vec3 u_MatSpecular;
uniform float u_MatShininess;
uniform vec3 u_ViewPos;

// 1. 세상 광원
uniform bool u_worldLightOn;
uniform vec3 u_LightPos;
uniform vec3 u_LightAmbient;
uniform vec3 u_LightDiffuse;
uniform vec3 u_LightSpecular;

// 2. 카메라 스폿 광원
uniform bool u_SpotOn;
uniform vec3 u_SpotPos;
uniform vec3 u_SpotDir;
uniform float u_SpotCutOff;

// 3. 거미 스폿 광원
uniform bool u_SpiderLightOn;
uniform vec3 u_SpiderLightPos;
uniform vec3 u_SpiderSpotDir;
uniform float u_SpiderSpotCutOff;
uniform vec3 u_SpiderLightAmbient;
uniform vec3 u_SpiderLightDiffuse;
uniform vec3 u_SpiderLightSpecular;

// 불투명도
uniform float u_Alpha;

// 외곽선 두께
uniform float outlineThickness = 0.03;

void main() {
    // --- 공통 계산 ---
    vec3 N = normalize(Normal);
    vec3 V = normalize(u_ViewPos - FragPos);

    // --- [수정] 외곽선 감지 ---
    // 시선 벡터와 법선 벡터의 내적이 특정 임계값보다 작으면 외곽선으로 처리
    if (dot(V, N) < 0.25) { 
        FragColor = vec4(0.0, 0.0, 0.0, 1.0); // 외곽선은 검은색
    }
    else {
        // --- 외곽선이 아닐 경우, 조명 계산 수행 ---
        vec3 ambient = u_LightAmbient * u_MatAmbient;
        vec3 total_light_effect = vec3(0.0, 0.0, 0.0);

        // --- 조명 계산 (Phong 셰이더 로직과 동일) ---
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

        // --- 툰 셰이딩 효과 적용 ---
        float intensity = dot(total_light_effect, vec3(0.299, 0.587, 0.114));

        if (intensity > 0.95) intensity = 1.0;
        else if (intensity > 0.6) intensity = 0.7;
        else if (intensity > 0.3) intensity = 0.4;
        else intensity = 0.2;

        vec3 final_color = u_MatDiffuse * intensity + ambient;
        FragColor = vec4(final_color, u_Alpha);
    }
}