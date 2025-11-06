#!/usr/bin/env python3
"""
Generate final images for all 3 JV Roofing templates with correct assets
"""
import requests
import time
import json

API_KEY = "bb_pr_68c446c743c4b27916126868d25fa3"
BASE_URL = "https://api.bannerbear.com/v2"

# Template UIDs
TEMPLATES = {
    "Stories 9:16": "l9E7G65kozz35PLe3R",
    "Feed 4:5": "Kp21rAZj1y3eb6eLnd",
    "Feed 1:1": "8BK3vWZJ7a3y5Jzk1a"
}

# Asset URLs (using FINAL assets from GitHub)
ASSETS = {
    "background_image": "https://raw.githubusercontent.com/customizeditcorp/C3-Marketing-Hub/main/assets/jv-roofing/222A2584copia.jpg",
    "logo": "https://raw.githubusercontent.com/customizeditcorp/C3-Marketing-Hub/main/assets/jv-roofing/JVrofiinglogoFullcolor.svg",
    "badge_gaf": "https://raw.githubusercontent.com/customizeditcorp/C3-Marketing-Hub/main/assets/jv-roofing/badge_gaf.png",
    "badge_malarkey": "https://raw.githubusercontent.com/customizeditcorp/C3-Marketing-Hub/main/assets/jv-roofing/badge_malarkey.png",
    "badge_cslb": "https://raw.githubusercontent.com/customizeditcorp/C3-Marketing-Hub/main/assets/jv-roofing/badge_cslb.png"
}

# Copy
COPY = {
    "headline": "Leaking Roof? Storm Damage?",
    "subtitle": "⭐5.0 Licensed Roofers • Serving SLO Since 2010",
    "cta": "Book Free Estimate"
}

def create_image(template_uid, template_name):
    """Create image using Bannerbear API"""
    
    print(f"\n{'='*80}")
    print(f"Generating: {template_name}")
    print(f"Template UID: {template_uid}")
    print(f"{'='*80}\n")
    
    # Prepare modifications
    modifications = [
        {"name": "background_image", "image_url": ASSETS["background_image"]},
        {"name": "logo", "image_url": ASSETS["logo"]},
        {"name": "headline", "text": COPY["headline"]},
        {"name": "subtitle", "text": COPY["subtitle"]},
        {"name": "cta", "text": COPY["cta"]},
        {"name": "badge_gaf", "image_url": ASSETS["badge_gaf"]},
        {"name": "badge_malarkey", "image_url": ASSETS["badge_malarkey"]},
        {"name": "badge_cslb", "image_url": ASSETS["badge_cslb"]}
    ]
    
    # Create image request
    payload = {
        "template": template_uid,
        "modifications": modifications,
        "webhook_url": None
    }
    
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    
    print("📤 Sending request to Bannerbear...")
    response = requests.post(
        f"{BASE_URL}/images",
        headers=headers,
        json=payload
    )
    
    if response.status_code in [200, 202]:
        data = response.json()
        image_uid = data.get("uid")
        status = data.get("status")
        
        print(f"✅ Request accepted!")
        print(f"   Image UID: {image_uid}")
        print(f"   Status: {status}")
        
        # Poll for completion
        print(f"\n⏳ Waiting for image to be generated...")
        max_attempts = 30
        attempt = 0
        
        while attempt < max_attempts:
            attempt += 1
            time.sleep(2)
            
            # Check status
            status_response = requests.get(
                f"{BASE_URL}/images/{image_uid}",
                headers=headers
            )
            
            if status_response.status_code == 200:
                status_data = status_response.json()
                current_status = status_data.get("status")
                
                print(f"   Attempt {attempt}/{max_attempts}: {current_status}")
                
                if current_status == "completed":
                    image_url = status_data.get("image_url")
                    print(f"\n🎉 Image generated successfully!")
                    print(f"   URL: {image_url}")
                    
                    # Download image
                    filename = f"jv_roofing_{template_name.lower().replace(' ', '_').replace(':', 'x')}_FINAL.png"
                    print(f"\n📥 Downloading to {filename}...")
                    
                    img_response = requests.get(image_url)
                    if img_response.status_code == 200:
                        with open(filename, 'wb') as f:
                            f.write(img_response.content)
                        print(f"✅ Saved: {filename}")
                        return filename, image_url
                    else:
                        print(f"❌ Failed to download image")
                        return None, None
                        
                elif current_status == "failed":
                    print(f"❌ Image generation failed")
                    print(f"   Error: {status_data.get('error')}")
                    return None, None
        
        print(f"⏱️ Timeout waiting for image")
        return None, None
        
    else:
        print(f"❌ Error: {response.status_code}")
        print(response.text)
        return None, None

def main():
    print("="*80)
    print("JV ROOFING - FINAL IMAGE GENERATION")
    print("="*80)
    print(f"\nGenerating FINAL images for {len(TEMPLATES)} templates...")
    print("\nUsing assets:")
    for name, url in ASSETS.items():
        print(f"  - {name}: {url.split('/')[-1]}")
    
    results = {}
    urls = {}
    
    for template_name, template_uid in TEMPLATES.items():
        filename, url = create_image(template_uid, template_name)
        results[template_name] = filename
        urls[template_name] = url
        
        if filename:
            print(f"\n✅ {template_name}: SUCCESS")
        else:
            print(f"\n❌ {template_name}: FAILED")
    
    # Summary
    print("\n" + "="*80)
    print("GENERATION SUMMARY")
    print("="*80)
    
    for template_name, filename in results.items():
        status = "✅ SUCCESS" if filename else "❌ FAILED"
        print(f"{template_name:20} {status:15} {filename or 'N/A'}")
    
    successful = sum(1 for f in results.values() if f)
    print(f"\nTotal: {successful}/{len(TEMPLATES)} images generated successfully")
    
    # Save URLs to file
    if any(urls.values()):
        print("\n" + "="*80)
        print("SAVING IMAGE URLS")
        print("="*80)
        
        with open("generated_images_urls.txt", "w") as f:
            f.write("JV ROOFING - GENERATED IMAGES\n")
            f.write("="*80 + "\n\n")
            for template_name, url in urls.items():
                if url:
                    f.write(f"{template_name}:\n{url}\n\n")
        
        print("✅ URLs saved to: generated_images_urls.txt")
    
    return results

if __name__ == "__main__":
    main()
