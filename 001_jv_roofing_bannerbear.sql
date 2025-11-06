-- Seed Data: JV Roofing Bannerbear Configuration
-- Date: 2025-11-06
-- Description: Add JV Roofing photos and Bannerbear configuration

-- Note: Replace clientKnowledgeBaseId with actual ID from your database
-- You can find it by running: SELECT id FROM client_knowledge_bases WHERE businessName LIKE '%JV Roofing%';

SET @jv_roofing_client_id = (SELECT id FROM client_knowledge_bases WHERE businessName LIKE '%JV Roofing%' LIMIT 1);

-- Insert Bannerbear Configuration for JV Roofing
INSERT INTO client_bannerbear_config (
  clientKnowledgeBaseId,
  bannerbearTemplateStories,
  bannerbearTemplateFeed45,
  bannerbearTemplateFeed11,
  logoUrl,
  badge1Url,
  badge2Url,
  badge3Url,
  primaryColor,
  secondaryColor
) VALUES (
  @jv_roofing_client_id,
  'l9E7G65kozz35PLe3R',  -- Stories 9:16
  'Kp21rAZj1y3eb6eLnd',  -- Feed 4:5
  '8BK3vWZJ7a3y5Jzk1a',  -- Feed 1:1
  'https://raw.githubusercontent.com/customizeditcorp/C3-Marketing-Hub/main/assets/jv-roofing/JVrofiinglogoFullcolor.svg',
  'https://raw.githubusercontent.com/customizeditcorp/C3-Marketing-Hub/main/assets/jv-roofing/badge_gaf.png',
  'https://raw.githubusercontent.com/customizeditcorp/C3-Marketing-Hub/main/assets/jv-roofing/badge_malarkey.png',
  'https://raw.githubusercontent.com/customizeditcorp/C3-Marketing-Hub/main/assets/jv-roofing/badge_cslb.png',
  '#2E3A8C',  -- Navy
  '#E31E24'   -- Red
)
ON DUPLICATE KEY UPDATE
  bannerbearTemplateStories = VALUES(bannerbearTemplateStories),
  bannerbearTemplateFeed45 = VALUES(bannerbearTemplateFeed45),
  bannerbearTemplateFeed11 = VALUES(bannerbearTemplateFeed11),
  logoUrl = VALUES(logoUrl),
  badge1Url = VALUES(badge1Url),
  badge2Url = VALUES(badge2Url),
  badge3Url = VALUES(badge3Url),
  primaryColor = VALUES(primaryColor),
  secondaryColor = VALUES(secondaryColor),
  updatedAt = CURRENT_TIMESTAMP;

-- Insert Client Photos for JV Roofing
INSERT INTO client_photos (
  clientKnowledgeBaseId,
  filename,
  url,
  description,
  category,
  isActive
) VALUES
  (
    @jv_roofing_client_id,
    '222A2584copia.jpg',
    'https://raw.githubusercontent.com/customizeditcorp/C3-Marketing-Hub/main/assets/jv-roofing/222A2584copia.jpg',
    'Main roofing project photo',
    'project',
    TRUE
  ),
  (
    @jv_roofing_client_id,
    'foto_principal_template.jpg',
    'https://raw.githubusercontent.com/customizeditcorp/C3-Marketing-Hub/main/assets/jv-roofing/foto_principal_template.jpg',
    'Template principal photo',
    'template',
    TRUE
  ),
  (
    @jv_roofing_client_id,
    'ScreenShot2025-10-31at4.29.13PM.png',
    'https://raw.githubusercontent.com/customizeditcorp/C3-Marketing-Hub/main/assets/jv-roofing/ScreenShot2025-10-31at4.29.13PM.png',
    'Screenshot 1',
    'screenshot',
    TRUE
  ),
  (
    @jv_roofing_client_id,
    'ScreenShot2025-10-31at5.25.24PM.png',
    'https://raw.githubusercontent.com/customizeditcorp/C3-Marketing-Hub/main/assets/jv-roofing/ScreenShot2025-10-31at5.25.24PM.png',
    'Screenshot 2',
    'screenshot',
    TRUE
  ),
  (
    @jv_roofing_client_id,
    'Screenshot2025-11-02at5.42.00AM.png',
    'https://raw.githubusercontent.com/customizeditcorp/C3-Marketing-Hub/main/assets/jv-roofing/Screenshot2025-11-02at5.42.00AM.png',
    'Screenshot 3',
    'screenshot',
    TRUE
  ),
  (
    @jv_roofing_client_id,
    'Screenshot2025-11-02at5.42.11AM.png',
    'https://raw.githubusercontent.com/customizeditcorp/C3-Marketing-Hub/main/assets/jv-roofing/Screenshot2025-11-02at5.42.11AM.png',
    'Screenshot 4',
    'screenshot',
    TRUE
  )
ON DUPLICATE KEY UPDATE
  url = VALUES(url),
  description = VALUES(description),
  category = VALUES(category),
  isActive = VALUES(isActive);

-- Verify insertion
SELECT 'Bannerbear config inserted/updated for JV Roofing' AS status;
SELECT COUNT(*) AS photo_count FROM client_photos WHERE clientKnowledgeBaseId = @jv_roofing_client_id;
