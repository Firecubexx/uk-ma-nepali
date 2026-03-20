/**
 * seed.js — populate the database with realistic demo data
 * Run with: node seed.js
 * Make sure MongoDB is running and server/.env is configured
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const User  = require('./models/User');
const Post  = require('./models/Post');
const Job   = require('./models/Job');
const Room  = require('./models/Room');
const Blog  = require('./models/Blog');

// ─── Demo users ──────────────────────────────────────────────────────────────
const USERS = [
  { name: 'Aarav Sharma',   email: 'aarav@demo.com',   password: 'demo1234', location: 'London',     hometown: 'Kathmandu',  gender: 'male',   age: 28, occupation: 'Software Engineer',  bio: 'Tech lover living the London dream 🇬🇧 | Originally from Kathmandu' },
  { name: 'Sita Thapa',     email: 'sita@demo.com',    password: 'demo1234', location: 'Manchester', hometown: 'Pokhara',    gender: 'female', age: 25, occupation: 'Nurse',              bio: 'NHS nurse | Pokhara girl making it in Manchester 💪' },
  { name: 'Bikash Rai',     email: 'bikash@demo.com',  password: 'demo1234', location: 'Birmingham', hometown: 'Dharan',     gender: 'male',   age: 32, occupation: 'Restaurant Owner',   bio: 'Running my own Nepali restaurant in Brum 🍜' },
  { name: 'Priya Gurung',   email: 'priya@demo.com',   password: 'demo1234', location: 'Leeds',      hometown: 'Chitwan',    gender: 'female', age: 23, occupation: 'Student',            bio: 'MSc Data Science @ Leeds Uni | Foodie | Hiker 🏔️' },
  { name: 'Rohan Magar',    email: 'rohan@demo.com',   password: 'demo1234', location: 'Glasgow',    hometown: 'Lalitpur',   gender: 'male',   age: 30, occupation: 'Security Officer',   bio: 'Glasgow bhanda Lalitpur nai ramro cha 😂 | Just kidding, love Scotland!' },
  { name: 'Anita Koirala',  email: 'anita@demo.com',   password: 'demo1234', location: 'Edinburgh',  hometown: 'Biratnagar', gender: 'female', age: 27, occupation: 'Accountant',        bio: 'CPA | Edinburgh life is beautiful | Missing momo 🥟' },
  { name: 'Dipesh Bhattarai', email: 'dipesh@demo.com', password: 'demo1234', location: 'Bristol',  hometown: 'Butwal',     gender: 'male',   age: 35, occupation: 'Delivery Driver',   bio: 'Bristol Nepali community admin | Helping new arrivals settle 🙏' },
  { name: 'Kamala Limbu',   email: 'kamala@demo.com',  password: 'demo1234', location: 'Cardiff',    hometown: 'Taplejung',  gender: 'female', age: 29, occupation: 'Care Assistant',    bio: 'Care worker | Welsh-Nepali | Cymru am byth 🏴󠁧󠁢󠁷󠁬󠁳󠁿' },
];

// ─── Demo posts ──────────────────────────────────────────────────────────────
const POST_TEXTS = [
  'Finally got my Indefinite Leave to Remain approved after 5 years! 🎉 This journey has been incredible. Thank you to everyone in this community who helped me through the process. Dhanyabad sabai lai! 🙏🇬🇧',
  'Any Nepalis in Manchester? Let\'s organise a dashain party this year! Last year we had 80+ people and it was amazing. Comment below if you\'re interested 🎊',
  'Missing momo so much today. Made some at home but nothing beats Boudha ko momo 😭 Who else struggles with homesickness?',
  'Just passed my UK driving test on the first attempt! 🚗 It took me 6 months of practice. Consistency is key. If I can do it, you can too!',
  'Reminder: UK Skilled Worker Visa changes come into effect next month. Make sure your salary meets the new threshold. Here\'s what you need to know...',
  'The fog in London today reminded me of Kathmandu in winter. Different country, same vibe ☁️',
  'Tihar is coming! Who is setting up lights? Let\'s make the whole neighbourhood know Nepalis are here 🪔✨',
  'NHS is hiring healthcare support workers in Birmingham. Good salary, no experience needed. Check the NHS website. Let\'s support each other 💪',
  'Anyone know a good Nepali grocery store in Leeds? Running out of gundruk and sukuti 🙏',
  'Proud moment: my son just got accepted to Cambridge! From a small village in Sindhupalchok to Cambridge University. Dreams do come true 🎓❤️',
];

// ─── Demo jobs ───────────────────────────────────────────────────────────────
const JOBS = [
  { title: 'Care Assistant', company: 'Sunrise Care Homes', location: 'London', type: 'full-time', salary: '£11.50 - £13/hr', description: 'We are looking for compassionate care assistants to join our team. No experience required — full training provided. Sponsorship available for eligible candidates.', requirements: ['Good communication', 'Compassionate nature', 'Flexible hours'], contactEmail: 'hr@sunrisecare.co.uk' },
  { title: 'Nepali Cook / Chef', company: 'Himalayan Restaurant Group', location: 'Manchester', type: 'full-time', salary: '£26,000 - £32,000', description: 'Looking for an experienced Nepali/Indian cuisine chef for our busy restaurant. Must have at least 2 years experience in a commercial kitchen.', requirements: ['2+ years cooking experience', 'Food hygiene certificate', 'Nepali cuisine knowledge'], contactEmail: 'jobs@himalayanrestaurants.co.uk' },
  { title: 'Delivery Driver', company: 'QuickDeliver UK', location: 'Birmingham', type: 'zero-hours', salary: '£12 - £15/hr', description: 'Flexible delivery driver roles available across Birmingham. Use your own vehicle or rent one from us. Great earnings potential. Perfect for new arrivals.', requirements: ['Valid UK driving licence', 'Smartphone', 'Good navigation skills'] },
  { title: 'Healthcare Support Worker', company: 'NHS Trust', location: 'Leeds', type: 'full-time', salary: '£23,000 - £25,000', description: 'Join the NHS as a Healthcare Support Worker. Help nurses and doctors provide excellent patient care. Visa sponsorship available for overseas applicants.', requirements: ['English language proficiency', 'DBS check required', 'Caring attitude'], contactEmail: 'recruitment@leedsnhs.uk' },
  { title: 'IT Support Technician', company: 'TechHelp Solutions', location: 'London', type: 'full-time', salary: '£28,000 - £35,000', description: 'Growing IT company looking for 1st/2nd line support technicians. Excellent growth opportunities. Nepali speakers preferred for our growing South Asian client base.', requirements: ['CompTIA A+ or equivalent', 'Windows/Mac support', 'Good customer service skills'] },
  { title: 'Security Officer', company: 'SecureGuard UK', location: 'Glasgow', type: 'part-time', salary: '£11 - £12/hr', description: 'Part-time security officers needed across Glasgow city centre. SIA licence required (we can help you obtain one). Flexible shifts available.', requirements: ['SIA Door Supervisor or Security Guard licence', 'Good physical fitness', 'Reliable'] },
];

// ─── Demo rooms ───────────────────────────────────────────────────────────────
const ROOMS = [
  { title: 'Large Double Room in Wembley', description: 'Spacious double room in a friendly Nepali household. Broadband included, near to Wembley Park tube station. Cooking allowed. Bills included except council tax.', location: 'Wembley', city: 'London', price: 850, type: 'double-room', billsIncluded: true, amenities: ['WiFi', 'Bills Included', 'Near Transport', 'Furnished'], preferredTenant: 'any', contactNumber: '07700900123' },
  { title: 'Single Room — Nepali Household', description: 'Clean single room in a quiet Nepali family home. All amenities included. Perfect for students or single professionals. Nepali food available if needed!', location: 'Fallowfield', city: 'Manchester', price: 550, type: 'single-room', billsIncluded: true, amenities: ['WiFi', 'Bills Included', 'Washing Machine', 'Furnished'], preferredTenant: 'female', contactNumber: '07700900456' },
  { title: 'En-suite Room in Modern Flat', description: 'Lovely en-suite double room in a modern flat share with 3 other professionals. 10 minutes walk to city centre. No smokers.', location: 'Jewellery Quarter', city: 'Birmingham', price: 700, type: 'en-suite', billsIncluded: false, amenities: ['WiFi', 'Parking', 'Furnished', 'Near Transport'], preferredTenant: 'any', contactNumber: '07700900789' },
  { title: 'Studio Flat — All Bills Included', description: 'Self-contained studio flat available immediately. All bills included. Perfect for a couple or single professional. Quiet neighbourhood, great transport links.', location: 'Headingley', city: 'Leeds', price: 950, type: 'studio', billsIncluded: true, amenities: ['WiFi', 'Bills Included', 'Near Transport'], preferredTenant: 'any', contactNumber: '07700900321' },
  { title: 'House Share — 2 Rooms Available', description: 'Two rooms available in a 5-bedroom Nepali house. Large kitchen, living room, garden. Very friendly atmosphere. Dashain and Tihar celebrations guaranteed! 🎊', location: 'Govanhill', city: 'Glasgow', price: 480, type: 'house-share', billsIncluded: false, amenities: ['WiFi', 'Garden', 'Washing Machine', 'Furnished', 'Pet Friendly'], preferredTenant: 'any', contactNumber: '07700900654' },
];

// ─── Demo blogs ───────────────────────────────────────────────────────────────
const BLOGS = [
  {
    title: '10 Things Nobody Tells You About Moving to the UK from Nepal',
    category: 'life-in-uk',
    tags: ['moving', 'tips', 'visa', 'adjustment'],
    content: `Moving to the UK is a dream for many Nepalis, but the reality can be quite different from expectations. Here are 10 things I wish someone had told me before I made the move.

1. The Weather Is Worse Than You Think
You've heard about British weather, but hearing and experiencing are two very different things. The grey sky that lasts from October to April can genuinely affect your mood. Invest in a good vitamin D supplement immediately.

2. NHS Registration Takes Time
Register with a GP (local doctor) as soon as you arrive. Don't wait until you're sick — by then it might take weeks to get an appointment. Your nearest surgery can be found on the NHS website.

3. Opening a Bank Account Is Surprisingly Hard
Most banks require proof of address, but you can't get proof of address without a bank account. Start with Monzo or Revolut — they open accounts online without the usual documentation headaches.

4. National Insurance Number Is Essential
Apply for your National Insurance (NI) number as soon as possible. You'll need this for work, benefits, and tax. Without it, you'll pay emergency tax.

5. The Food Adjustment Is Real
British food is... different. Find your nearest South Asian grocery store immediately. In London, Wembley and Southall are your best friends. In other cities, find the local Nepali community — they'll know where to shop.

6. Public Transport Is Expensive But Essential
Monthly travel passes save a lot. Get an Oyster card in London. Consider living near good transport links as the UK is very car-independent in cities.

7. Community Is Everything
Connect with the local Nepali community as soon as possible. They have already solved all the problems you're facing. This platform exists for exactly this reason!

8. Your Qualifications May Not Be Recognised
Medical, legal, and teaching qualifications from Nepal often need re-certification in the UK. Research your profession's requirements early — some processes take years.

9. The Homesickness Hits Hard in Year 2
The first year you're too busy figuring things out to feel homesick. Year 2 is when it hits. Video call home regularly, celebrate Nepali festivals, and build your community here.

10. You Are Stronger Than You Think
Every single Nepali who has made it in the UK has faced enormous challenges. You will too. But the community is here to help, and you will get through it. Jai Nepal! 🇳🇵`,
    excerpt: 'Moving to the UK is a dream for many Nepalis — but the reality has surprises. Here are 10 honest things nobody tells you before you make the move.',
  },
  {
    title: 'How I Found My First Job in the UK as a Nepali Immigrant',
    category: 'career',
    tags: ['jobs', 'career', 'visa', 'tips'],
    content: `When I arrived in the UK on a Skilled Worker Visa in 2021, I had qualifications, experience, and zero understanding of how the UK job market actually works. Here's my honest story.

The CV Format Is Different
In Nepal, CVs can be 3-5 pages with photos and personal details. UK CVs are maximum 2 pages, no photo, no age, no marital status. I had to completely rebuild mine.

LinkedIn Is Everything
The UK job market lives on LinkedIn. I spent two weeks optimising my profile, connecting with people in my industry, and following companies. Three of my interviews came directly from LinkedIn outreach.

The Interview Style Is Different
UK interviews are competency-based. They ask "Tell me about a time when..." questions. Prepare STAR answers (Situation, Task, Action, Result) for common scenarios. Practice with a friend.

Your Accent Is Fine
I was terrified that my accent would hold me back. It didn't. British employers — especially larger companies — are used to international accents and actively celebrate diversity.

Networking Events Work
I attended three tech meetups in my first month. I felt awkward at all three. But I made connections that eventually led to my first job offer.

The Key Lesson
The UK job market rewards persistence and relationships, not just qualifications. Be patient, be consistent, and lean on the community here for advice and referrals.

It took me 4 months to get my first job. It was worth every rejected application. Hamro dream, hamro mehnat! 💪`,
    excerpt: 'My honest story of finding employment in the UK as a fresh immigrant from Nepal — what worked, what failed, and what I would do differently.',
  },
  {
    title: 'Making Authentic Dal Bhat in the UK — A Complete Guide',
    category: 'food',
    tags: ['food', 'cooking', 'dal-bhat', 'recipe'],
    content: `Dal Bhat is more than food — it's home. And making it properly in the UK requires knowing where to find the right ingredients. This is your complete guide.

Where to Find Nepali/South Asian Ingredients in the UK

London: Wembley (HA9), Southall, East Ham, Tooting
Manchester: Rusholme (Curry Mile), Longsight
Birmingham: Lozells, Handsworth, Sparkbrook
Leeds: Harehills, Beeston
Glasgow: Pollokshields

What You Need
Lentils: Red lentils (masoor dal) are the easiest to find in any supermarket. Yellow split peas work too. For proper Nepali dal, look for split pigeon peas (toor/arhar dal) at South Asian shops.

Ghee: Available in most large supermarkets now, or South Asian shops for better value.

Spices: Turmeric, cumin seeds, hing (asafoetida), ginger-garlic paste — all from South Asian shops.

The Secret: Tadka (Tarkari)
The most important step is the tadka — heating ghee, adding cumin seeds until they spit, then adding hing, dried chilli, and ginger. Pour this sizzling mix over your cooked dal at the end. This is what makes it taste like home.

UK Substitutions That Actually Work
Can't find Nepali achar? Mango pickle (achaar) from Indian shops works well.
Gundruk substitute? Slightly fermented mustard greens or sauerkraut at a push.
Sukuti? Jerky works as a distant cousin substitute.

The truth is — food never tastes exactly like home. But the smell of cumin in hot ghee will always remind you of where you came from. Cook with love and it will taste like Nepal. 🙏`,
    excerpt: 'A practical guide to making authentic Dal Bhat in the UK — including where to find the right ingredients and the secrets to making it taste like home.',
  },
];

// ─── Main seed function ───────────────────────────────────────────────────────
async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/uk-ma-nepali');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Post.deleteMany({}),
      Job.deleteMany({}),
      Room.deleteMany({}),
      Blog.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing data');

    // Create users
    const createdUsers = [];
    for (const u of USERS) {
      const user = await User.create({ ...u, datingActive: true, interestedIn: 'both' });
      createdUsers.push(user);
    }
    console.log(`👥 Created ${createdUsers.length} users`);

    // Create posts
    const posts = [];
    for (let i = 0; i < POST_TEXTS.length; i++) {
      const author = createdUsers[i % createdUsers.length];
      const post = await Post.create({ author: author._id, text: POST_TEXTS[i] });
      posts.push(post);
    }
    // Add some likes and comments
    for (const post of posts) {
      const likers = createdUsers.slice(0, Math.floor(Math.random() * 5) + 1);
      post.likes = likers.map((u) => u._id);
      post.comments.push({ user: createdUsers[0]._id, text: 'Ekdum ramro! ❤️' });
      if (Math.random() > 0.5) post.comments.push({ user: createdUsers[1]._id, text: 'Sahi bhannu bhayo! 🙏' });
      await post.save();
    }
    console.log(`📰 Created ${posts.length} posts`);

    // Create jobs
    for (let i = 0; i < JOBS.length; i++) {
      await Job.create({ ...JOBS[i], postedBy: createdUsers[i % createdUsers.length]._id });
    }
    console.log(`💼 Created ${JOBS.length} jobs`);

    // Create rooms
    for (let i = 0; i < ROOMS.length; i++) {
      await Room.create({ ...ROOMS[i], postedBy: createdUsers[i % createdUsers.length]._id });
    }
    console.log(`🏠 Created ${ROOMS.length} room listings`);

    // Create blogs
    for (let i = 0; i < BLOGS.length; i++) {
      await Blog.create({ ...BLOGS[i], author: createdUsers[i % createdUsers.length]._id, views: Math.floor(Math.random() * 500) + 50 });
    }
    console.log(`✍️  Created ${BLOGS.length} blog posts`);

    // Set up some follows
    for (let i = 0; i < createdUsers.length; i++) {
      const user = createdUsers[i];
      const toFollow = createdUsers.filter((_, j) => j !== i).slice(0, 3);
      user.following = toFollow.map((u) => u._id);
      toFollow.forEach((u) => u.followers.push(user._id));
      await user.save();
    }
    await Promise.all(createdUsers.map((u) => u.save()));
    console.log('🤝 Set up follow relationships');

    console.log('\n🎉 Database seeded successfully!\n');
    console.log('📋 Demo accounts (all use password: demo1234)');
    console.log('─'.repeat(45));
    USERS.forEach((u) => console.log(`  ${u.email.padEnd(25)} ${u.name}`));
    console.log('─'.repeat(45));
    console.log('\nRun the server and frontend, then log in with any of the above accounts.\n');

  } catch (err) {
    console.error('❌ Seed error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
