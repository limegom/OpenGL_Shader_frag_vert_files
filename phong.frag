#version 330 core

// ���� ���̴����� �����Ǿ� �Ѿ�� ��
in vec3 FragPos;
in vec3 Normal;

out vec4 FragColor; // ���� ��� ����

// --- ������ ���� ---
// ���� �� ī�޶�
uniform vec3 u_MatAmbient;
uniform vec3 u_MatDiffuse;
uniform vec3 u_MatSpecular;
uniform float u_MatShininess;
uniform vec3 u_ViewPos;

// 1. ���� ����
uniform bool u_worldLightOn;
uniform vec3 u_LightPos;
uniform vec3 u_LightAmbient;
uniform vec3 u_LightDiffuse;
uniform vec3 u_LightSpecular;

// 2. ī�޶� ���� ����
uniform bool u_SpotOn;
uniform vec3 u_SpotPos;
uniform vec3 u_SpotDir;
uniform float u_SpotCutOff;

// 3. �Ź� ���� ����
uniform bool u_SpiderLightOn;
uniform vec3 u_SpiderLightPos;
uniform vec3 u_SpiderSpotDir;
uniform float u_SpiderSpotCutOff;
uniform vec3 u_SpiderLightAmbient;
uniform vec3 u_SpiderLightDiffuse;
uniform vec3 u_SpiderLightSpecular;

// ������
uniform float u_Alpha;

void main() {
    // --- ���� ��� ---
    vec3 N = normalize(Normal);
    vec3 V = normalize(u_ViewPos - FragPos);

    // --- �⺻ �ֺ���(Ambient) ��� ---
    vec3 ambient = u_LightAmbient * u_MatAmbient;
    
    // --- ���� ���� ȿ�� (�ʱⰪ�� 0) ---
    vec3 total_light_effect = vec3(0.0, 0.0, 0.0);

    // --- 1. ���� ���� ȿ�� ��� ---
    if (u_worldLightOn) {
        vec3 L = normalize(u_LightPos - FragPos);
        vec3 R = reflect(-L, N);
        float diff = max(dot(N, L), 0.0);
        float spec = pow(max(dot(V, R), 0.0), u_MatShininess);
        
        vec3 diffuse = u_LightDiffuse * diff * u_MatDiffuse;
        vec3 specular = u_LightSpecular * spec * u_MatSpecular;
        total_light_effect += diffuse + specular;
    }

    // --- 2. ī�޶� ���� ���� ȿ�� ��� ---
    if (u_SpotOn) {
        vec3 L = normalize(u_SpotPos - FragPos);
        vec3 R = reflect(-L, N);
    
        // lightDir: �������� �����׸�Ʈ�� ���ϴ� ���� ����
        vec3 lightDir = normalize(FragPos - u_SpotPos); 
        // spotDir: ������ �ٶ󺸴� ���� ����
        vec3 spotDir = normalize(u_SpotDir);
        // theta: ���� ����� ���� ���� ������ ����
        float theta = dot(lightDir, spotDir);
        if (theta > u_SpotCutOff) {
            float spotFactor = pow((theta - u_SpotCutOff) / (1.0 - u_SpotCutOff), 2.0);
            spotFactor = clamp(spotFactor, 0.0, 1.0);

            float diff = max(dot(N, L), 0.0);
            float spec = pow(max(dot(V, R), 0.0), u_MatShininess);

            vec3 diffuse = u_LightDiffuse * diff * u_MatDiffuse;
            vec3 specular = u_LightSpecular * spec * u_MatSpecular;
            total_light_effect += (diffuse + specular) * spotFactor;
        }
    }

    // --- 3. �Ź� ���� ���� ȿ�� ��� ---
    if (u_SpiderLightOn) {
        vec3 L = normalize(u_SpiderLightPos - FragPos);
        vec3 R = reflect(-L, N);
        
        float theta = dot(normalize(FragPos - u_SpiderLightPos), -normalize(u_SpiderSpotDir));
        if (theta > u_SpiderSpotCutOff) {
            float spotFactor = pow((theta - u_SpiderSpotCutOff) / (1.0 - u_SpotCutOff), 2.0);
            spotFactor = clamp(spotFactor, 0.0, 1.0);

            float diff = max(dot(N, L), 0.0);
            float spec = pow(max(dot(V, R), 0.0), u_MatShininess);
            
            vec3 diffuse = u_SpiderLightDiffuse * diff * u_MatDiffuse;
            vec3 specular = u_SpiderLightSpecular * spec * u_MatSpecular;
            total_light_effect += (diffuse + specular) * spotFactor;
        }
    }

    // --- ���� ���� ��� ---
    //FragColor = vec4(ambient + total_light_effect, 1.0);
    
    vec3 final_rgb_color = ambient + total_light_effect;
    // ���� ����� alpha ä�ο� u_Alpha �� ���
    FragColor = vec4(final_rgb_color, u_Alpha);
}