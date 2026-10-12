const db = require('../config/db');

async function updateVerifiedHackathons() {
  try {
    console.log('--- Updating Verified Hackathon Details ---');

    // ID 18: Q-HACK INDIA 2026
    await db.query(`
      UPDATE hackathons
      SET 
        external_url = 'https://devfolio.co/hackathons/q-hack-india-2026',
        rules = 'Teams of 3 to 4 members. Solo participation not allowed. Individual Devfolio registration required.',
        prize_details = '₹50,000+ Track Cash Prizes, Cloud & Quantum Simulator Credits, and Mentorship from Industry Experts',
        eligibility = 'Open to all university students and developers interested in quantum computing and algorithms.'
      WHERE hackathon_id = 18
    `);
    console.log('✅ Updated Hackathon 18 (Q-HACK INDIA 2026)');

    // ID 19: HackShift 2026 – IIIT Delhi
    await db.query(`
      UPDATE hackathons
      SET 
        external_url = 'https://unstop.com/hackathons/hackshift-iiit-delhi',
        max_team_size = 5,
        eligibility = 'Open to all undergraduate and postgraduate university students across all disciplines with valid college ID.',
        rules = 'Round 1 requires a 5–6 slide PDF proposal on one of 4 problem statements. Shortlisted teams build working prototype in 24hr offline hackathon at IIIT Delhi.',
        prize_details = '₹1,00,000 Total Cash Prize Pool (1st: ₹50,000, 2nd: ₹30,000, 3rd: ₹20,000 + ₹20,000 in-kind awards for Top 10)'
      WHERE hackathon_id = 19
    `);
    console.log('✅ Updated Hackathon 19 (HackShift 2026 – IIIT Delhi)');

    // ID 20: ETHGlobal Mumbai 2026
    await db.query(`
      UPDATE hackathons
      SET 
        external_url = 'https://ethglobal.com/events/mumbai',
        rules = 'Teams of 1 to 5 members. Projects must be built during the 36-hour hacking period. Open source repository required.',
        prize_details = '$50,000+ USD in bounties and pool prizes from ecosystem sponsors',
        eligibility = 'Open to global Web3 developers, designers, and researchers.'
      WHERE hackathon_id = 20
    `);
    console.log('✅ Updated Hackathon 20 (ETHGlobal Mumbai 2026)');

    // ID 21: Vihaan X 2026 – IEEE DTU
    await db.query(`
      UPDATE hackathons
      SET 
        external_url = 'https://unstop.com/hackathons/vihaan-x-dtu',
        registration_deadline = '2026-11-09 18:30:00',
        prize_details = '₹10,000+ Main Track Cash Prizes (Winner ₹5,000, 1st Runner Up ₹3,000, 2nd Runner Up ₹2,000) + sponsor bounties, certificates and goodies',
        eligibility = 'Open to all college students with valid student identification.',
        rules = '24-hour offline hackathon at DTU campus. Teams of 1 to 4 members.'
      WHERE hackathon_id = 21
    `);
    console.log('✅ Updated Hackathon 21 (Vihaan X 2026 – IEEE DTU)');

    // ID 22: Innohack 2.0 – VIT Vellore
    await db.query(`
      UPDATE hackathons
      SET 
        title = 'Innohack 2.0 – VIT Vellore',
        external_url = 'https://vit.ac.in/events/innohack2026',
        status = 'COMPLETED',
        hackathon_mode = 'OFFLINE',
        location = 'VOC Gallery, TT Block, VIT Vellore',
        start_date = '2026-08-20 09:00:00',
        end_date = '2026-08-21 18:00:00',
        registration_deadline = '2026-08-15 23:59:59',
        submission_deadline = '2026-08-21 18:00:00',
        eligibility = 'Open to student innovators and engineering developers from recognized institutions.',
        rules = '2-day on-campus innovation sprint. Software, hardware, and hybrid prototypes accepted.',
        prize_details = 'Cash prizes for Top 3 in each track (1st: ₹30,000, 2nd: ₹20,000, 3rd: ₹10,000) + incubation opportunities with VIT TBI'
      WHERE hackathon_id = 22
    `);
    console.log('✅ Updated Hackathon 22 (Innohack 2.0 – VIT Vellore)');

    // Query back all 5 to verify
    const [rows] = await db.query(`
      SELECT 
        hackathon_id, title, status, hackathon_mode, location,
        start_date, end_date, registration_deadline, external_url,
        is_verified
      FROM hackathons 
      WHERE hackathon_id IN (18, 19, 20, 21, 22)
      ORDER BY hackathon_id
    `);
    console.log('\n--- Verified Records in DB ---');
    console.table(rows);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error updating verified hackathons:', err);
    process.exit(1);
  }
}

updateVerifiedHackathons();
