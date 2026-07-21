import sys
import os
from datetime import datetime, timedelta

# Adjust path to import from app
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal, Base, engine
from app.core import security
from app.models.models import (
    User, Property, PropertyImage, PropertyAmenity, PropertyTag, Review, ChatMessage
)

def seed_db():
    db = SessionLocal()
    try:
        print("Truncating/Cleaning previous seed data...")
        # Make sure tables exist
        Base.metadata.create_all(bind=engine)
        
        # Clean previous seed users
        db.query(ChatMessage).delete()
        db.query(Review).delete()
        db.query(PropertyTag).delete()
        db.query(PropertyAmenity).delete()
        db.query(PropertyImage).delete()
        db.query(Property).delete()
        db.query(User).delete()
        db.commit()

        print("Seeding Users...")
        # 1. Users
        password_hash = security.get_password_hash("password123")
        
        admin_user = User(
            email="admin@landlink.ai",
            password_hash=password_hash,
            full_name="Admin Administrator",
            role="admin",
            phone_number="+919999999999",
            whatsapp_number="+919999999999",
            profile_image_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150"
        )
        
        seller_user1 = User(
            email="seller1@landlink.ai",
            password_hash=password_hash,
            full_name="Rajesh Sharma",
            role="seller",
            phone_number="+918888888888",
            whatsapp_number="+918888888888",
            profile_image_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150"
        )

        seller_user2 = User(
            email="seller2@landlink.ai",
            password_hash=password_hash,
            full_name="Amit Patel",
            role="seller",
            phone_number="+917777777777",
            whatsapp_number="+917777777777",
            profile_image_url="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150"
        )
        
        buyer_user = User(
            email="buyer@landlink.ai",
            password_hash=password_hash,
            full_name="Sneha Rao",
            role="buyer",
            phone_number="+916666666666",
            whatsapp_number="+916666666666",
            profile_image_url="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150"
        )
        
        db.add_all([admin_user, seller_user1, seller_user2, buyer_user])
        db.commit()
        db.refresh(admin_user)
        db.refresh(seller_user1)
        db.refresh(seller_user2)
        db.refresh(buyer_user)
        
        print("Seeding Properties...")
        # 2. Properties
        p1 = Property(
            seller_id=seller_user1.id,
            title="Sunkissed Luxury 3BHK Apartment",
            description="Spectacular contemporary apartment located in prime Bandra West, featuring stunning sea views, customizable smart home integrations, modular kitchen design, and round-the-clock water and power utilities.",
            property_type="Apartment",
            expected_price=45000000.0,
            original_price=48000000.0,
            negotiable=True,
            area_sqft=1850.0,
            bedrooms=3,
            bathrooms=3,
            floors=14,
            parking=2,
            year_built=2021,
            ownership_type="Freehold",
            property_age=5,
            furnished_status="Furnished",
            address="Carter Road, Bandra West",
            city="Mumbai",
            state="Maharashtra",
            country="India",
            lat=19.0664,
            lng=72.8223,
            water_supply="24 Hours Corporation",
            electricity="Dual Grid Backup",
            road_access="4 Lane Tar Road",
            nearby_schools="St. Stanislaus High School, Arya Vidya Mandir",
            nearby_hospitals="Lilavati Hospital & Research Centre",
            reason_for_selling="Relocating overseas",
            contact_number=seller_user1.phone_number,
            whatsapp_number=seller_user1.whatsapp_number,
            contact_email=seller_user1.email,
            status="approved",
            neighborhood_score=9.4,
            safety_score=9.1,
            family_score=9.3,
            investment_score=9.5,
            overall_condition_score=9.2,
            fraud_score=8.5
        )

        p2 = Property(
            seller_id=seller_user2.id,
            title="Elysian Fields 5BHK Contemporary Villa",
            description="Luxurious 5BHK estate nestled in private tranquil enclave of Whitefield. Includes private lap pool, manicured gardens, outdoor home theater, and separate servant accommodation. Completely eco-friendly solar integration.",
            property_type="Villa",
            expected_price=85000000.0,
            original_price=90000000.0,
            negotiable=True,
            area_sqft=4200.0,
            bedrooms=5,
            bathrooms=6,
            floors=2,
            parking=3,
            year_built=2023,
            ownership_type="Freehold",
            property_age=3,
            furnished_status="Semi-Furnished",
            address="ECC Road, Whitefield",
            city="Bangalore",
            state="Karnataka",
            country="India",
            lat=12.9698,
            lng=77.7500,
            water_supply="Private Borewell & Kaveri connection",
            electricity="10kW Solar Net Metering",
            road_access="Gated Community Main Road",
            nearby_schools="The Deens Academy, Vydehi School",
            nearby_hospitals="Vydehi Institute of Medical Sciences",
            reason_for_selling="Asset portfolio liquidation",
            contact_number=seller_user2.phone_number,
            whatsapp_number=seller_user2.whatsapp_number,
            contact_email=seller_user2.email,
            status="approved",
            neighborhood_score=8.9,
            safety_score=8.8,
            family_score=9.0,
            investment_score=8.7,
            overall_condition_score=9.8,
            fraud_score=5.0
        )
        
        p3 = Property(
            seller_id=seller_user1.id,
            title="Scenic Vista Corner Farm Land",
            description="Lush green organic farm land ready for cultivation or building your dream country home. Clear titles, fenced parameter boundaries, direct approach highway access, and operational borewell.",
            property_type="Farm Land",
            expected_price=12000000.0,
            original_price=12000000.0,
            negotiable=False,
            area_sqft=10800.0,
            bedrooms=0,
            bathrooms=0,
            floors=0,
            parking=5,
            year_built=2025,
            ownership_type="Freehold",
            property_age=1,
            furnished_status="Unfurnished",
            address="Mulshi Valley bypass road",
            city="Pune",
            state="Maharashtra",
            country="India",
            lat=18.4907,
            lng=73.5134,
            water_supply="Private Wells & Borewell",
            electricity="Agricultural power connection",
            road_access="Direct Highway Touch Road",
            nearby_schools="Mulshi Public School",
            nearby_hospitals="Pune Rural Health Clinic",
            reason_for_selling="Inheritance property split",
            contact_number=seller_user1.phone_number,
            whatsapp_number=seller_user1.whatsapp_number,
            contact_email=seller_user1.email,
            status="approved",
            neighborhood_score=8.2,
            safety_score=8.5,
            family_score=8.0,
            investment_score=8.9,
            overall_condition_score=8.5,
            fraud_score=12.0
        )
        
        db.add_all([p1, p2, p3])
        db.commit()
        db.refresh(p1)
        db.refresh(p2)
        db.refresh(p3)

        print("Seeding Images...")
        # 3. Images
        p1_img1 = PropertyImage(property_id=p1.id, image_url="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80", condition_score=9.2)
        p1_img2 = PropertyImage(property_id=p1.id, image_url="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80", condition_score=9.0)
        
        p2_img1 = PropertyImage(property_id=p2.id, image_url="https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80", condition_score=9.8)
        p2_img2 = PropertyImage(property_id=p2.id, image_url="https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80", condition_score=9.7)
        
        p3_img1 = PropertyImage(property_id=p3.id, image_url="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80", condition_score=8.5)
        
        db.add_all([p1_img1, p1_img2, p2_img1, p2_img2, p3_img1])
        
        print("Seeding Amenities & Tags...")
        # 4. Amenities
        a1 = ["Swimming Pool", "Sea View", "Modular Kitchen", "Gymnasium", "24x7 Security"]
        for a in a1:
            db.add(PropertyAmenity(property_id=p1.id, amenity_name=a))
            
        a2 = ["Private Lap Pool", "Solar Powered Grid", "Home Theater Room", "Private Garden", "Servant Quarters"]
        for a in a2:
            db.add(PropertyAmenity(property_id=p2.id, amenity_name=a))
            
        a3 = ["Direct Highway Touch", "Fenced Border", "Borewell Water", "Quiet Countryside"]
        for a in a3:
            db.add(PropertyAmenity(property_id=p3.id, amenity_name=a))
            
        # 5. Tags
        t1 = ["Sea View", "Corner Plot", "Bandra Premium", "Near Metro", "Ready to Move"]
        for t in t1:
            db.add(PropertyTag(property_id=p1.id, tag_name=t))
            
        t2 = ["Luxury Villa", "Elysian Estate", "Eco Friendly", "Smart Home", "Pool Side"]
        for t in t2:
            db.add(PropertyTag(property_id=p2.id, tag_name=t))
            
        t3 = ["Organic Farm", "Investment Opportunity", "Pune Suburban", "Highway Connected"]
        for t in t3:
            db.add(PropertyTag(property_id=p3.id, tag_name=t))
            
        print("Seeding Reviews...")
        # 6. Reviews
        rev1 = Review(
            property_id=p1.id,
            reviewer_id=buyer_user.id,
            reviewee_id=seller_user1.id,
            rating=5,
            review_text="Absolute marvel of architecture. The sea view is breathtaking! Seller was extremely accommodating and professional throughout negotiation.",
            verified_buyer=True,
            verified_seller=True
        )
        db.add(rev1)
        
        print("Seeding Messages...")
        # 7. Messages
        msg1 = ChatMessage(
            property_id=p1.id,
            sender_id=buyer_user.id,
            receiver_id=seller_user1.id,
            message_text="Hi Rajesh, I saw your Bandra West apartment. Is the pricing negotiable?",
            read_receipt=True,
            created_at=datetime.utcnow() - timedelta(hours=2)
        )
        msg2 = ChatMessage(
            property_id=p1.id,
            sender_id=seller_user1.id,
            receiver_id=buyer_user.id,
            message_text="Hello Sneha! Yes, the listing is open to reasonable negotiations. Would you like to schedule a visit?",
            read_receipt=False,
            created_at=datetime.utcnow() - timedelta(hours=1.5)
        )
        db.add_all([msg1, msg2])
        
        db.commit()
        print("Database Seed completed successfully!")
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
