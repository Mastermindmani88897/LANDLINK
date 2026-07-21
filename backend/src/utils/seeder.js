const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Property = require('../models/Property');
const Visit = require('../models/Visit');
const Offer = require('../models/Offer');

async function seedAdminUser() {
  const adminEmail = (process.env.ADMIN_EMAIL || 'mani@gmail.com').toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || 'mani';

  try {
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      await User.create({
        email: adminEmail,
        full_name: 'System Administrator',
        password_hash: passwordHash,
        role: 'admin',
        phone_number: '+91 98765 00000',
        whatsapp_number: '+91 98765 00000',
        city: 'Admin City',
        state: 'Admin State',
        profile_image_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop',
      });
      console.log(`✅ Admin account created automatically (${adminEmail})`);
    } else {
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
      }
      console.log(`ℹ️ Admin account verified (${adminEmail}).`);
    }
  } catch (err) {
    console.warn('⚠️ Admin seed notice:', err.message);
  }
}

async function seedInitialData() {
  try {
    await seedAdminUser();

    const existingPropertiesCount = await Property.countDocuments();
    if (existingPropertiesCount > 0) {
      console.log('ℹ️ Database already contains properties. Skipping demo listings seed.');
      return;
    }

    console.log('🌱 Database is empty. Seeding initial demo listings & users...');

    // 1. Create Demo Users
    const passwordHash = await bcrypt.hash('Password123!', 10);
    const seller = await User.findOneAndUpdate(
      { email: 'seller1@landlink.ai' },
      {
        full_name: 'Manikanta G',
        email: 'seller1@landlink.ai',
        password_hash: passwordHash,
        role: 'seller',
        phone_number: '+91 98765 43210',
        whatsapp_number: '+91 98765 43210',
        is_verified: true,
      },
      { upsert: true, new: true }
    );

    const buyer = await User.findOneAndUpdate(
      { email: 'buyer1@landlink.ai' },
      {
        full_name: 'Alex Johnson',
        email: 'buyer1@landlink.ai',
        password_hash: passwordHash,
        role: 'buyer',
        phone_number: '+91 91234 56789',
        whatsapp_number: '+91 91234 56789',
        is_verified: true,
      },
      { upsert: true, new: true }
    );

    // 2. Create Initial Properties
    const demoProperties = [
      {
        seller_id: seller._id,
        title: "Sky Penthouse Premium 4BHK | Sea View | Bandra West",
        description: "Welcome to Mumbai's most coveted sky penthouse, a masterpiece of architectural brilliance situated on the 42nd floor of Bandra West tower. Spanning 4200 sq.ft., this exquisite residence commands panoramic Arabian Sea views. Features Italian marble flooring, 18ft ceilings, frameless glass walls, and a chef's kitchen.",
        property_type: "House",
        house_type: "Apartments and Condominiums",
        land_factors: ["Highway Proximity and Commercial Visibility", "Main Arterial Road Accessibility"],
        soil_and_infrastructure: ["Solar Power Grid Infrastructure", "Water Pump and Borewell Irrigation Capacities"],
        expected_price: 98500000.0,
        original_price: 115000000.0,
        negotiable: true,
        area_sqft: 4200.0,
        bedrooms: 4,
        bathrooms: 4,
        floors: 1,
        parking: 3,
        year_built: 2022,
        ownership_type: "Freehold",
        property_age: 2,
        furnished_status: "Furnished",
        address: "1402, Seaview Heights, Carter Road, Bandra West",
        city: "Mumbai",
        state: "Maharashtra",
        country: "India",
        water_supply: "24-Hour Corporation + Rainwater Harvesting",
        electricity: "100% Power Backup + Solar Panels",
        road_access: "6 Lane BKC Highway Access",
        reason_for_selling: "Relocating to London for business expansion",
        contact_number: "+91 98765 43210",
        whatsapp_number: "+91 98765 43210",
        contact_email: "seller1@landlink.ai",
        status: "approved",
        overall_condition_score: 9.8,
        neighborhood_score: 9.2,
        safety_score: 9.0,
        family_score: 8.8,
        investment_score: 9.5,
        images: [
          { image_url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&fit=crop", condition_score: 9.8 },
          { image_url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&fit=crop", condition_score: 9.8 },
        ],
        amenities: ["Swimming Pool", "Gymnasium", "Concierge 24/7", "Power Backup", "Private Elevator"],
        tags: ["Sea View", "Luxury Listing", "Ready to Move"],
      },
      {
        seller_id: seller._id,
        title: "3BHK Builder Floor House | Peaceful Locality | Vasant Vihar",
        description: "A thoughtfully designed independent builder floor in the upscale Vasant Vihar colony. Offers 2200 sq.ft. of living space with 3 bedrooms, private garden terrace, and dedicated parking. Surrounded by tree-lined avenues and top schools.",
        property_type: "House",
        house_type: "Single-Family Detached Houses",
        land_factors: ["Corner Plot Advantages", "Main Arterial Road Accessibility"],
        soil_and_infrastructure: ["Solar Power Grid Infrastructure", "Water Pump and Borewell Irrigation Capacities"],
        expected_price: 34000000.0,
        original_price: 31500000.0,
        negotiable: true,
        area_sqft: 2200.0,
        bedrooms: 3,
        bathrooms: 3,
        floors: 1,
        parking: 2,
        year_built: 2015,
        ownership_type: "Freehold",
        property_age: 9,
        furnished_status: "Semi-Furnished",
        address: "B-11 First Floor, Vasant Vihar Colony",
        city: "Delhi",
        state: "Delhi",
        country: "India",
        water_supply: "24-Hour Municipal + Storage Tanks",
        electricity: "3-Phase + Solar Backup",
        road_access: "30 Ft Colony Road",
        reason_for_selling: "Moving closer to family",
        contact_number: "+91 98765 43210",
        whatsapp_number: "+91 98765 43210",
        contact_email: "seller1@landlink.ai",
        status: "approved",
        overall_condition_score: 8.5,
        neighborhood_score: 8.8,
        safety_score: 9.0,
        family_score: 9.2,
        investment_score: 8.4,
        images: [
          { image_url: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&fit=crop", condition_score: 8.5 },
          { image_url: "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&fit=crop", condition_score: 8.5 },
        ],
        amenities: ["Private Garden Terrace", "Modular Kitchen", "Inverter Backup", "Security Camera System"],
        tags: ["Ready to Move", "Family-Friendly", "Modern Design"],
      },
      {
        seller_id: seller._id,
        title: "5.5 Acre Organic Farm Land & Farmhouse | Nashik Valley",
        description: "Certified organic farm land in Dindori taluka, Nashik wine country. Features established 3-acre vineyard, fertile soil suitable for multiple crops, 400 sq.ft. farmhouse structure, and 365-day river canal water access.",
        property_type: "Land",
        house_type: "Farmhouses",
        land_factors: ["Highway Proximity and Commercial Visibility", "Main Arterial Road Accessibility"],
        soil_and_infrastructure: ["Dual and Multiple-Crop Fertilities", "Crop Fallow Durations and Soil Health", "Water Pump and Borewell Irrigation Capacities", "Solar Power Grid Infrastructure"],
        expected_price: 18500000.0,
        original_price: 15000000.0,
        negotiable: true,
        area_sqft: 239580.0,
        bedrooms: 1,
        bathrooms: 1,
        floors: 1,
        parking: 4,
        year_built: 2020,
        ownership_type: "Freehold",
        property_age: 4,
        furnished_status: "Unfurnished",
        address: "Survey No. 142/3, Dindori Taluka",
        city: "Nashik",
        state: "Maharashtra",
        country: "India",
        water_supply: "Godavari Canal + Borewell Pump",
        electricity: "3-Phase Agricultural Solar Grid",
        road_access: "State Highway 17 Access",
        reason_for_selling: "Portfolio rebalancing",
        contact_number: "+91 98765 43210",
        whatsapp_number: "+91 98765 43210",
        contact_email: "seller1@landlink.ai",
        status: "approved",
        overall_condition_score: 9.0,
        neighborhood_score: 8.5,
        safety_score: 8.8,
        family_score: 8.0,
        investment_score: 9.4,
        images: [
          { image_url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&fit=crop", condition_score: 9.0 },
        ],
        amenities: ["Organic Vineyard", "Borewell Pump", "Solar Power", "Farmhouse"],
        tags: ["Organic Farm", "High ROI", "Vineyard"],
      }
    ];

    await Property.insertMany(demoProperties);
    console.log('✅ Demo database successfully seeded with initial listings and users!');
  } catch (err) {
    console.warn('⚠️ Seeding error:', err.message);
  }
}

module.exports = { seedInitialData };
