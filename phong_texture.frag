#version 330 core

// 정점 셰이더에서 보간되어 넘어온 값
in vec3 FragPos;
in vec3 Normal;
in vec2 TexCoord;

out vec4 FragColor; // 최종 출력 색상

// --- 유니폼 변수 ---
uniform sampler2D u_Texture; // 텍스처 샘플러

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

void main() {
    // --- 텍스처 및 공통 계산 ---
    vec3 texColor = texture(u_Texture, TexCoord).rgb;
    vec3 N = normalize(Normal);
    vec3 V = normalize(u_ViewPos - FragPos);

    // --- 기본 ambient 계산 ---
    // 주변광은 텍스처 색상과 곱해집니다.
    vec3 ambient = u_LightAmbient * texColor * u_MatAmbient;
    
    // --- 최종 조명 효과 (초기값은 0) ---
    vec3 total_light_effect = vec3(0.0, 0.0, 0.0);

    // --- 1. 세상 광원 ---
    if (u_worldLightOn) {
        vec3 L = normalize(u_LightPos - FragPos);
        vec3 R = reflect(-L, N);
        float diff = max(dot(N, L), 0.0);
        float spec = pow(max(dot(V, R), 0.0), u_MatShininess);
        
        vec3 diffuse = u_LightDiffuse * diff * texColor * u_MatDiffuse;
        vec3 specular = u_LightSpecular * spec * u_MatSpecular;
        total_light_effect += diffuse + specular;
    }

    // --- 2. 카메라 스폿 광원 효과 계산하기 ---
    if (u_SpotOn) {
        vec3 L = normalize(u_SpotPos - FragPos);
        vec3 R = reflect(-L, N);
    
        // lightDir: 광원에서 프래그먼트로 향하는 방향 벡터
        vec3 lightDir = normalize(FragPos - u_SpotPos); 
        // spotDir: 광원이 바라보는 방향 벡터
        vec3 spotDir = normalize(u_SpotDir);
        // theta: 광원 방향과 스폿 방향 사이의 각도
        float theta = dot(lightDir, spotDir);
        if (theta > u_SpotCutOff) {
            float spotFactor = pow((theta - u_SpotCutOff) / (1.0 - u_SpotCutOff), 2.0);
            spotFactor = clamp(spotFactor, 0.0, 1.0);

            float diff = max(dot(N, L), 0.0);
            float spec = pow(max(dot(V, R), 0.0), u_MatShininess);

            vec3 diffuse = u_LightDiffuse * diff * texColor * u_MatDiffuse;
            vec3 specular = u_LightSpecular * spec * u_MatSpecular;
            total_light_effect += (diffuse + specular) * spotFactor;
        }
    }

    // --- 3. 거미 스폿 광원 계산하는 부분 ---
    if (u_SpiderLightOn) {
        vec3 L = normalize(u_SpiderLightPos - FragPos);
        vec3 R = reflect(-L, N);
        
        float theta = dot(normalize(FragPos - u_SpiderLightPos), -normalize(u_SpiderSpotDir));
        if (theta > u_SpiderSpotCutOff) {
            float spotFactor = pow((theta - u_SpiderSpotCutOff) / (1.0 - u_SpotCutOff), 2.0);
            spotFactor = clamp(spotFactor, 0.0, 1.0);

            float diff = max(dot(N, L), 0.0);
            float spec = pow(max(dot(V, R), 0.0), u_MatShininess);
            
            vec3 diffuse = u_SpiderLightDiffuse * diff * texColor * u_MatDiffuse;
            vec3 specular = u_SpiderLightSpecular * spec * u_MatSpecular;
            total_light_effect += (diffuse + specular) * spotFactor;
        }
    }

    // 최종 색상 계산
    // RGB 값과 Alpha(투명도) 값을 합쳐서 최종 출력
    vec3 final_rgb_color = ambient + total_light_effect;
    FragColor = vec4(final_rgb_color, u_Alpha);
}