"""
LandLink AI Database Seeder
Run from the backend directory: python seed_data.py
Creates demo users (admin, seller, buyer) + 8 rich property listings.
"""
import sys
import os

# Force UTF-8 output for Windows terminals
if sys.stdout.encoding != 'utf-8':
    sys.stdout = open(sys.stdout.fileno(), mode='w', encoding='utf-8', buffering=1)

# Add parent directory to path so imports work
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import engine, Base, SessionLocal
from app.models.models import (
    User, Property, PropertyImage, PropertyAmenity, PropertyTag,
    Offer, ScheduledVisit, Review
)
from app.core.security import get_password_hash
import uuid
from datetime import datetime, timedelta

def generate_uuid():
    return str(uuid.uuid4())

# Ensure tables exist
Base.metadata.create_all(bind=engine)

db = SessionLocal()

print("[*] Starting LandLink AI Database Seeder...")


# ============================================================
# CLEAN EXISTING DATA (for idempotent re-runs)
# ============================================================
try:
    db.query(Review).delete()
    db.query(ScheduledVisit).delete()
    db.query(Offer).delete()
    db.query(PropertyTag).delete()
    db.query(PropertyAmenity).delete()
    db.query(PropertyImage).delete()
    db.query(Property).delete()
    db.query(User).delete()
    db.commit()
    print("[CLEAN] Cleared old data.")
except Exception as e:
    db.rollback()
    print(f"[WARN] Rollback on clean: {e}")

# ============================================================
# CREATE USERS
# ============================================================
admin_id = generate_uuid()
seller1_id = generate_uuid()
seller2_id = generate_uuid()
buyer_id = generate_uuid()

users_data = [
    User(
        id=admin_id,
        email="admin@landlink.ai",
        password_hash=get_password_hash("password123"),
        full_name="Arjun Sharma",
        role="admin",
        phone_number="+91 98765 43210",
        whatsapp_number="+91 98765 43210",
        profile_image_url="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face"
    ),
    User(
        id=seller1_id,
        email="seller1@landlink.ai",
        password_hash=get_password_hash("password123"),
        full_name="Priya Mehta",
        role="seller",
        phone_number="+91 87654 32109",
        whatsapp_number="+91 87654 32109",
        profile_image_url="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=100&h=100&fit=crop&crop=face"
    ),
    User(
        id=seller2_id,
        email="seller2@landlink.ai",
        password_hash=get_password_hash("password123"),
        full_name="Rahul Kapoor",
        role="seller",
        phone_number="+91 76543 21098",
        whatsapp_number="+91 76543 21098",
        profile_image_url="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
    ),
    User(
        id=buyer_id,
        email="buyer@landlink.ai",
        password_hash=get_password_hash("password123"),
        full_name="Ananya Singh",
        role="buyer",
        phone_number="+91 65432 10987",
        whatsapp_number="+91 65432 10987",
        profile_image_url="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face"
    )
]

for u in users_data:
    db.add(u)
db.commit()
print(f"[OK] Created {len(users_data)} users.")

# ============================================================
# CREATE PROPERTIES
# ============================================================

properties_seed = [
    {
        "id": generate_uuid(),
        "seller_id": seller1_id,
        "title": "Sky Penthouse Premium 4BHK | Sea View | Bandra West",
        "description": "Welcome to Mumbai's most coveted sky penthouse, a masterpiece of architectural brilliance situated on the 42nd floor of the award-winning Bandra West tower. Spanning an imperial 4200 sq.ft., this exquisite residence commands panoramic Arabian Sea views from every angle. The grand foyer flows into an open-plan living space with 18-ft cathedral ceilings, Italian marble flooring, and floor-to-ceiling frameless glass. The chef's kitchen features handcrafted walnut cabinetry and Miele premium appliances. Four bedrooms, each a sanctuary of calm, include an opulent master suite with a private 400 sqft terrace and luxury ensuite. Perfect for families and investors seeking exceptional returns in Mumbai's premium micro-market.",
        "property_type": "Apartment",
        "expected_price": 98500000.0,
        "original_price": 115000000.0,
        "negotiable": True,
        "area_sqft": 4200.0,
        "bedrooms": 4,
        "bathrooms": 4,
        "floors": 1,
        "parking": 3,
        "year_built": 2022,
        "ownership_type": "Freehold",
        "property_age": 2,
        "furnished_status": "Furnished",
        "address": "1402, Seaview Heights, Carter Road, Bandra West",
        "city": "Mumbai",
        "state": "Maharashtra",
        "country": "India",
        "lat": 19.0607,
        "lng": 72.8295,
        "water_supply": "24-Hour Corporation + Rainwater Harvesting",
        "electricity": "100% Power Backup + Solar Panels",
        "road_access": "6 Lane BKC Highway Access",
        "nearby_schools": "Jamnabai Narsee School 0.8km, Dhirubhai Ambani International 2km",
        "nearby_hospitals": "Lilavati Hospital 1.2km, Kokilaben Ambani Hospital 3km",
        "reason_for_selling": "Relocating to London for business expansion",
        "contact_number": "+91 87654 32109",
        "whatsapp_number": "+91 87654 32109",
        "contact_email": "seller1@landlink.ai",
        "status": "approved",
        "is_flagged": False,
        "neighborhood_score": 9.2,
        "safety_score": 9.0,
        "family_score": 8.8,
        "investment_score": 9.5,
        "overall_condition_score": 9.8,
        "fraud_score": 10.0,
        "images": [
            "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&fit=crop",
            "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&fit=crop",
            "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&fit=crop",
            "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800&fit=crop"
        ],
        "amenities": ["Swimming Pool", "Gymnasium", "Concierge 24/7", "SPA & Wellness Center", "Smart Home Automation", "Private Elevator Lobby", "Rooftop Sky Lounge", "Power Backup"],
        "tags": ["Sea View", "Luxury Listing", "Ready to Move", "Premium Amenities"]
    },
    {
        "id": generate_uuid(),
        "seller_id": seller1_id,
        "title": "Colonial Heritage Villa | Private Pool | Koregaon Park",
        "description": "An extraordinary colonial-era heritage villa standing as one of Pune's most iconic private residences. Nestled within 1.2 acres of manicured gardens, this sprawling 7500 sq.ft. villa blends colonial architecture with contemporary luxury. The palatial living spaces feature original teak wood flooring, ornate coffered ceilings, and bespoke period furniture. The private 40ft heated pool is surrounded by tropical landscaping. The villa's 5 bedroom suites each have private dressing rooms and luxury bathrooms. A separate guest cottage, wine cellar, home theatre, and 6-car garage complete this once-in-a-lifetime offering. Ideal for diplomatic missions, elite families, or boutique hospitality ventures.",
        "property_type": "Villa",
        "expected_price": 185000000.0,
        "original_price": 220000000.0,
        "negotiable": False,
        "area_sqft": 7500.0,
        "bedrooms": 5,
        "bathrooms": 6,
        "floors": 2,
        "parking": 6,
        "year_built": 1968,
        "ownership_type": "Freehold",
        "property_age": 58,
        "furnished_status": "Furnished",
        "address": "14, Kalyani Nagar Bungalow Estate, Koregaon Park Road",
        "city": "Pune",
        "state": "Maharashtra",
        "country": "India",
        "lat": 18.5388,
        "lng": 73.8950,
        "water_supply": "Borewell + 24-hr Municipal",
        "electricity": "Dedicated 3-Phase + DG Backup",
        "road_access": "Private Gated Road with Security",
        "nearby_schools": "Bishop's Co-Ed School 1.5km, Symbiosis International 2.2km",
        "nearby_hospitals": "Ruby Hall Clinic 2km, Jehangir Hospital 3.5km",
        "reason_for_selling": "Inheritance settlement, heirs moving abroad",
        "contact_number": "+91 87654 32109",
        "whatsapp_number": "+91 87654 32109",
        "contact_email": "seller1@landlink.ai",
        "status": "approved",
        "is_flagged": False,
        "neighborhood_score": 9.0,
        "safety_score": 9.5,
        "family_score": 9.2,
        "investment_score": 8.5,
        "overall_condition_score": 8.4,
        "fraud_score": 8.0,
        "images": [
            "https://images.unsplash.com/photo-1613977257592-4871e5fcd7c4?w=800&fit=crop",
            "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&fit=crop",
            "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800&fit=crop",
            "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&fit=crop"
        ],
        "amenities": ["Private Heated Pool", "Home Theatre", "Wine Cellar", "Guest Cottage", "Security Guards", "Garden & Landscaping", "6-Car Garage"],
        "tags": ["Luxury Listing", "Garden", "Luxury Pool", "Heritage Property"]
    },
    {
        "id": generate_uuid(),
        "seller_id": seller2_id,
        "title": "Smart 3BHK Urban Living | Whitefield Tech Hub | Metro 400m",
        "description": "An intelligently designed 3-bedroom smart home in Whitefield's most dynamic tech corridor, moments from Bangalore's major IT parks including ITPL, EcoWorld, and Manyata. The 1850 sq.ft. apartment features voice-controlled smart home automation covering lighting, HVAC, security and entertainment. Premium vitrified tile flooring, modular kitchen with Hettich fittings, and elegant bedrooms with custom wardrobes. The building's amenities are award-winning: Olympic-length pool, rooftop terrace garden, co-working lounge, and a modern clubhouse. The Whitefield Metro station is a 5-minute walk, making this perfect for working professionals. Excellent rental yield potential of 4.5%+ in current market.",
        "property_type": "Apartment",
        "expected_price": 12800000.0,
        "original_price": 11500000.0,
        "negotiable": True,
        "area_sqft": 1850.0,
        "bedrooms": 3,
        "bathrooms": 3,
        "floors": 1,
        "parking": 2,
        "year_built": 2021,
        "ownership_type": "Freehold",
        "property_age": 3,
        "furnished_status": "Semi-Furnished",
        "address": "B-504, Prestige Smart City, ITPL Main Road, Whitefield",
        "city": "Bangalore",
        "state": "Karnataka",
        "country": "India",
        "lat": 12.9698,
        "lng": 77.7499,
        "water_supply": "Kaveri Water + RO Purification System",
        "electricity": "100% Generator Backup + Solar Subsidy",
        "road_access": "6-Lane ITPL Expressway",
        "nearby_schools": "The Inventure Academy 1km, Vydehi Institute School 1.8km",
        "nearby_hospitals": "Manipal Whitefield Hospital 1.5km, Columbia Asia Whitefield 2km",
        "reason_for_selling": "Upgrading to a larger unit in the same complex",
        "contact_number": "+91 76543 21098",
        "whatsapp_number": "+91 76543 21098",
        "contact_email": "seller2@landlink.ai",
        "status": "approved",
        "is_flagged": False,
        "neighborhood_score": 8.5,
        "safety_score": 8.8,
        "family_score": 8.7,
        "investment_score": 9.0,
        "overall_condition_score": 9.2,
        "fraud_score": 8.0,
        "images": [
            "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&fit=crop",
            "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&fit=crop",
            "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800&fit=crop",
        ],
        "amenities": ["Smart Home Automation", "Olympic Swimming Pool", "Rooftop Garden", "Co-working Space", "Gymnasium", "EV Charging Station", "Power Backup"],
        "tags": ["Near Metro", "Ready to Move", "Premium Amenities", "Smart Home"]
    },
    {
        "id": generate_uuid(),
        "seller_id": seller2_id,
        "title": "4000 Sqft Corner Plot | DTCP Approved | Serene ECR Location",
        "description": "A premium 4000 square foot DTCP-approved corner plot situated on Chennai's prestigious East Coast Road, in the rapidly developing Injambakkam micro-market. Boasting 60 feet of frontage and excellent road connectivity, this plot benefits from two-side open layout — ideal for constructing a luxury independent villa or a boutique investment property. Located just 400 meters from the beach, surrounded by premium residential projects and premium beach resorts. The entire area has undergone infrastructure beautification with wide roads, underground cabling, and a dedicated CMWSSB water supply connection. The plot comes with clear title, single ownership, EC verified, and tax paid receipts.",
        "property_type": "Land",
        "expected_price": 25000000.0,
        "original_price": 20000000.0,
        "negotiable": True,
        "area_sqft": 4000.0,
        "bedrooms": 0,
        "bathrooms": 0,
        "floors": 0,
        "parking": 0,
        "year_built": None,
        "ownership_type": "Freehold",
        "property_age": 0,
        "furnished_status": "Unfurnished",
        "address": "Plot 34B, ECR Layout, Injambakkam Beach Road",
        "city": "Chennai",
        "state": "Tamil Nadu",
        "country": "India",
        "lat": 12.9236,
        "lng": 80.2535,
        "water_supply": "CMWSSB Municipal Connection Available",
        "electricity": "TNEB 3-Phase Connection",
        "road_access": "60 Ft ECR Road + 30 Ft Side Road",
        "nearby_schools": "Sishya School 2km, Chettinad Hari Shree 3km",
        "nearby_hospitals": "MGM Hospital 5km, Chettinad Health City 4km",
        "reason_for_selling": "Diversifying into commercial real estate ventures",
        "contact_number": "+91 76543 21098",
        "whatsapp_number": "+91 76543 21098",
        "contact_email": "seller2@landlink.ai",
        "status": "approved",
        "is_flagged": False,
        "neighborhood_score": 8.0,
        "safety_score": 8.3,
        "family_score": 7.5,
        "investment_score": 9.1,
        "overall_condition_score": 8.0,
        "fraud_score": 12.0,
        "images": [
            "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&fit=crop",
            "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&fit=crop",
        ],
        "amenities": ["Clear Title", "DTCP Approved", "EC Verified", "Tax Paid Receipts"],
        "tags": ["Sea View", "Corner Plot", "Investment Ready", "Beach Proximity"]
    },
    {
        "id": generate_uuid(),
        "seller_id": seller1_id,
        "title": "Ultra-Modern 2BHK | Glass Facade | Gurugram Golf Course View",
        "description": "An architecturally iconic 2-bedroom penthouse-style apartment in DLF Cyber City's most coveted residential high-rise, offering sweeping views of the prestigious DLF Golf & Country Club greens. The 1450 sq.ft. residence boasts a stunning glass facade, an expansive private terrace, and a designer open-plan living area fitted with German modular kitchen, Kohler sanitary ware, and Häfele hardware throughout. The building features a sky lounge, infinity pool on the 35th floor, and an exclusive private members club. Located minutes from Cyber Hub, premium dining, and the Gurugram rapid metro station. Exceptional opportunity for investors seeking maximum capital appreciation.",
        "property_type": "Flat",
        "expected_price": 22500000.0,
        "original_price": 19800000.0,
        "negotiable": True,
        "area_sqft": 1450.0,
        "bedrooms": 2,
        "bathrooms": 2,
        "floors": 1,
        "parking": 1,
        "year_built": 2023,
        "ownership_type": "Freehold",
        "property_age": 1,
        "furnished_status": "Furnished",
        "address": "Unit 3502, DLF One Midtown, Golf Course Rd, DLF Phase 5",
        "city": "Delhi",
        "state": "Haryana",
        "country": "India",
        "lat": 28.4595,
        "lng": 77.0266,
        "water_supply": "24-Hour Municipal + Purified Water Supply",
        "electricity": "Standby DG + Solar Net Metering",
        "road_access": "Golf Course Extension Road - 8 Lane",
        "nearby_schools": "DPS Gurugram 2km, The Shri Ram Global 3km",
        "nearby_hospitals": "Medanta Medicity 4km, Artemis Hospital 3km",
        "reason_for_selling": "Divorce settlement requiring immediate liquidation",
        "contact_number": "+91 87654 32109",
        "whatsapp_number": "+91 87654 32109",
        "contact_email": "seller1@landlink.ai",
        "status": "approved",
        "is_flagged": False,
        "neighborhood_score": 8.8,
        "safety_score": 8.5,
        "family_score": 8.2,
        "investment_score": 9.2,
        "overall_condition_score": 9.5,
        "fraud_score": 12.5,
        "images": [
            "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&fit=crop",
            "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800&fit=crop",
            "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&fit=crop",
        ],
        "amenities": ["Sky Infinity Pool", "Members Lounge", "Private Terrace", "Concierge Service", "Valet Parking", "Golf Course View", "Smart Lighting"],
        "tags": ["Luxury Listing", "Ready to Move", "Golf Course View", "Luxury Pool"]
    },
    {
        "id": generate_uuid(),
        "seller_id": seller2_id,
        "title": "3BHK Builder Floor | Peaceful Locality | Vasant Vihar",
        "description": "A thoughtfully designed independent builder floor in the upscale Vasant Vihar residential colony, offering an enviable combination of privacy, spaciousness, and convenience. The 2200 sq.ft. first-floor unit features three generous bedrooms with attached bathrooms, a spacious drawing-dining area, and a fully equipped kitchen. The property benefits from a private garden terrace with dedicated parking for 2 vehicles. The neighbourhood is characterised by tree-lined avenues, proximity to Priya Cinema, modern supermarkets, and excellent IGNOU and IIT Delhi academic neighbourhood atmosphere. Well-suited for families prioritising education and accessibility.",
        "property_type": "House",
        "house_type": "Single-Family Detached Houses",
        "land_factors": ["Corner Plot Advantages", "Main Arterial Road Accessibility"],
        "soil_and_infrastructure": ["Solar Power Grid Infrastructure", "Water Pump and Borewell Irrigation Capacities"],
        "expected_price": 34000000.0,
        "original_price": 31500000.0,
        "negotiable": True,
        "area_sqft": 2200.0,
        "bedrooms": 3,
        "bathrooms": 3,
        "floors": 1,
        "parking": 2,
        "year_built": 2015,
        "ownership_type": "Freehold",
        "property_age": 9,
        "furnished_status": "Semi-Furnished",
        "address": "B-11 First Floor, Vasant Vihar Colony, New Delhi",
        "city": "Delhi",
        "state": "Delhi",
        "country": "India",
        "lat": 28.5534,
        "lng": 77.1641,
        "water_supply": "Delhi Jal Board 24-Hour + Storage Tanks",
        "electricity": "BSES Yamuna + Inverter Backup",
        "road_access": "30 Ft Colony Road",
        "nearby_schools": "Vasant Valley School 500m, DPS RK Puram 1km",
        "nearby_hospitals": "Venkateshwar Hospital 1.5km, Shri Ram Hospital 2km",
        "reason_for_selling": "Shift to Faridabad as part of retirement planning",
        "contact_number": "+91 76543 21098",
        "whatsapp_number": "+91 76543 21098",
        "contact_email": "seller2@landlink.ai",
        "status": "approved",
        "is_flagged": False,
        "neighborhood_score": 8.3,
        "safety_score": 8.7,
        "family_score": 9.0,
        "investment_score": 8.4,
        "overall_condition_score": 8.2,
        "fraud_score": 10.0,
        "images": [
            "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&fit=crop",
            "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&fit=crop",
            "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&fit=crop",
        ],
        "amenities": ["Private Garden Terrace", "Modular Kitchen", "Inverter Backup", "Security Camera System"],
        "tags": ["Ready to Move", "Family-Friendly", "Modern Design"]
    },
    {
        "id": generate_uuid(),
        "seller_id": seller1_id,
        "title": "IT Commercial Space | Grade A Office | Hitech City",
        "description": "Premium Grade-A commercial office space on the 12th floor of Hyderabad's iconic Cyber Towers in the heart of Hitech City's IT corridor. The 5000 sq.ft. plug-and-play ready floor features raised access flooring, suspended acoustic ceilings, VRF air conditioning, and pre-wired data network infrastructure. Panoramic west-facing views over Hussain Sagar lake. The building provides LEED Gold certification, 3 passenger + 1 service elevator, 24x7 building management, and 2-level basement parking. Currently fully fitted-out with workstations for 60 occupants. Ideal for BFSI, consulting, or software firms expanding in Hyderabad. Attractive ROI of 7.2% at current prevailing rental rates.",
        "property_type": "Commercial",
        "expected_price": 55000000.0,
        "original_price": 50000000.0,
        "negotiable": True,
        "area_sqft": 5000.0,
        "bedrooms": 0,
        "bathrooms": 4,
        "floors": 1,
        "parking": 8,
        "year_built": 2018,
        "ownership_type": "Freehold",
        "property_age": 6,
        "furnished_status": "Furnished",
        "address": "Unit 1205, Cyber Towers Phase-2, Hitech City Main Road, Madhapur",
        "city": "Hyderabad",
        "state": "Telangana",
        "country": "India",
        "lat": 17.4473,
        "lng": 78.3762,
        "water_supply": "HMWS&SB + Borewell Backup",
        "electricity": "TSSPDCL 3-Phase + UPS + DG at 100%",
        "road_access": "Hitech City Main Road + Cyber Pearl Signal",
        "nearby_schools": "Oakridge International 3km",
        "nearby_hospitals": "Maxcure Hospital 2km, Care Hospital 3km",
        "reason_for_selling": "Consolidating portfolio into industrial assets",
        "contact_number": "+91 87654 32109",
        "whatsapp_number": "+91 87654 32109",
        "contact_email": "seller1@landlink.ai",
        "status": "approved",
        "is_flagged": False,
        "neighborhood_score": 9.1,
        "safety_score": 8.9,
        "family_score": 7.2,
        "investment_score": 9.3,
        "overall_condition_score": 9.0,
        "fraud_score": 10.0,
        "images": [
            "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&fit=crop",
            "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&fit=crop",
            "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&fit=crop",
        ],
        "amenities": ["Plug-and-Play Ready", "LEED Gold Certified", "Raised Access Flooring", "VRF Air Conditioning", "24x7 BMS", "Lake View", "Basement Parking"],
        "tags": ["Commercial Investment", "LEED Certified", "Prime Location"]
    },
    {
        "id": generate_uuid(),
        "seller_id": seller2_id,
        "title": "5.5 Acre Organic Farm Land | Certified Organic | Nashik Valley",
        "description": "An exceptional 5.5-acre certified organic farm land parcel nestled in the UNESCO-recognized wine country of Nashik's Dindori taluka, a premium viticulture zone ideal for grape cultivation, resort development, or eco-agri-tourism ventures. The property includes an established 4-year-old organic vineyard spanning 3 acres, a 2-acre area suitable for pomegranate and mango plantation, and a 400 sq.ft. farm house structure. Clear NA (Non-Agricultural) conversion feasibility for 1 acre. 365-day water access from Godavari river canal distribution. Surrounded by premium wineries including Sula Vineyards 8km. Excellent opportunity for agri-tourism business, weekend farmhouse, or strategic vineyard investment.",
        "property_type": "Land",
        "house_type": "Farmhouses",
        "land_factors": ["Highway Proximity and Commercial Visibility", "Main Arterial Road Accessibility"],
        "soil_and_infrastructure": ["Dual and Multiple-Crop Fertilities", "Crop Fallow Durations and Soil Health", "Water Pump and Borewell Irrigation Capacities", "Solar Power Grid Infrastructure"],
        "expected_price": 18500000.0,
        "original_price": 15000000.0,
        "negotiable": True,
        "area_sqft": 239580.0,
        "bedrooms": 1,
        "bathrooms": 1,
        "floors": 1,
        "parking": 4,
        "year_built": 2020,
        "ownership_type": "Freehold",
        "property_age": 4,
        "furnished_status": "Unfurnished",
        "address": "Survey No. 142/3, Niphad Taluka, Nashik Rural",
        "city": "Nashik",
        "state": "Maharashtra",
        "country": "India",
        "lat": 20.0088,
        "lng": 73.7932,
        "water_supply": "Godavari Canal Drip Irrigation Rights",
        "electricity": "MSEDCL 3-Phase Agricultural Tariff",
        "road_access": "Nashik-Pune NH-160 via Dindori Road (8km)",
        "nearby_schools": "Nashik City schools 15km",
        "nearby_hospitals": "Civil Hospital Nashik 16km",
        "reason_for_selling": "Retirement, seeking urban lifestyle transition",
        "contact_number": "+91 76543 21098",
        "whatsapp_number": "+91 76543 21098",
        "contact_email": "seller2@landlink.ai",
        "status": "approved",
        "is_flagged": False,
        "neighborhood_score": 7.5,
        "safety_score": 8.2,
        "family_score": 7.0,
        "investment_score": 8.8,
        "overall_condition_score": 8.5,
        "fraud_score": 10.0,
        "images": [
            "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&fit=crop",
            "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&fit=crop",
            "https://images.unsplash.com/photo-1534766555764-ce878a5e3a2b?w=800&fit=crop",
        ],
        "amenities": ["Organic Certification", "Drip Irrigation", "Farm House", "Bore Well", "Vineyard Established"],
        "tags": ["Garden", "Investment Ready", "Organic Farm", "Wine Country"]
    }
]

property_ids = []
for p in properties_seed:
    images = p.pop("images")
    amenities = p.pop("amenities")
    tags = p.pop("tags")
    
    prop = Property(**p)
    db.add(prop)
    db.flush()  # Get the ID assigned
    
    property_ids.append(p["id"])
    
    for img_url in images:
        db.add(PropertyImage(
            property_id=p["id"],
            image_url=img_url,
            analyzed_cracks=False,
            analyzed_leakage=False,
            analyzed_paint="Good",
            analyzed_flooring="Good",
            analyzed_garden="N/A",
            analyzed_roof="Good",
            condition_score=p["overall_condition_score"]
        ))
    
    for amenity in amenities:
        db.add(PropertyAmenity(property_id=p["id"], amenity_name=amenity))
    
    for tag in tags:
        db.add(PropertyTag(property_id=p["id"], tag_name=tag))

db.commit()
print(f"[OK] Created {len(properties_seed)} property listings with images, amenities, and tags.")

# ============================================================
# SEED OFFERS & VISITS for Dashboard Demo
# ============================================================
if len(property_ids) >= 2:
    offer = Offer(
        property_id=property_ids[0],
        buyer_id=buyer_id,
        offer_amount=92000000.0,
        status="pending",
        notes="We are very interested in this property. Would you consider 92L?"
    )
    db.add(offer)
    
    visit = ScheduledVisit(
        property_id=property_ids[0],
        buyer_id=buyer_id,
        visit_date=datetime.utcnow() + timedelta(days=7),
        status="scheduled",
        notes="Prefer a morning slot, around 10 AM if possible"
    )
    db.add(visit)
    
    review = Review(
        property_id=property_ids[2],
        reviewer_id=buyer_id,
        reviewee_id=seller2_id,
        rating=5,
        review_text="Excellent communication, transparent about property details, and the AI valuation was spot on!",
        verified_buyer=True,
        verified_seller=True
    )
    db.add(review)
    
    db.commit()
    print("[OK] Created sample offer, visit, and review for demo.")

print("\n" + "="*60)
print("[DONE] LandLink AI Database Seeded Successfully!")
print("="*60)
print("\n[INFO] Demo Credentials:")
print("  Admin:  admin@landlink.ai / password123")
print("  Seller: seller1@landlink.ai / password123")
print("  Seller: seller2@landlink.ai / password123")
print("  Buyer:  buyer@landlink.ai / password123")
print("\n[INFO] Properties Created: 8 listings across Mumbai, Pune, Bangalore, Chennai, Delhi, Hyderabad, Nashik")
print("\n[INFO] Start the backend server:")
print("  cd backend")
print("  uvicorn app.main:app --reload --host 0.0.0.0 --port 8000")
print("\n[INFO] Then start the frontend:")
print("  cd frontend")
print("  npm run dev")
print("\n[INFO] API Docs: http://localhost:8000/docs")
print("[INFO] Frontend: http://localhost:3000")
