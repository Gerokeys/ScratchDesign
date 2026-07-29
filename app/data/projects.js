/**
 * Case study content, shared by the work list and the case pages.
 *
 * NOTE ON TESTIMONIALS: `testimonial` is null for every project. A quote
 * attributed to a real client has to come from that client — inventing one
 * would put words in their mouth. Fill these in with what they actually said
 * and the section renders itself; left null, it is skipped.
 */

const projects = [
  {
    slug: 'livelihood-lab-africa',
    title: 'Livelihood Lab Africa',
    year: '2024',
    industry: 'NGO · Digital Presence',
    role: 'Web Design, SEO, Brand Identity',
    tags: ['Web Design', 'SEO', 'Lead Generation', 'NGO'],
    url: 'https://livelihood-lab-africa.vercel.app',
    image: 'https://s0.wp.com/mshots/v1/https://livelihood-lab-africa.vercel.app?w=1600',
    metric: '30+ new enquiries',
    stats: [
      ['30+', 'New enquiries'],
      ['Online', 'Presence built'],
      ['Weeks', 'Time to launch'],
    ],

    overview: [
      'Livelihood Lab Africa is a research and development organisation working on sustainable livelihoods across the continent — the kind of work that lives or dies on institutional credibility.',
      'They had the credibility. What they did not have was anywhere to point to. No website, no searchable record of their work, nothing a prospective partner could read before a first meeting.',
    ],

    challenge: [
      'The organisation was effectively invisible online. Partners and funders who heard about them through a conference or a colleague had no way to verify what they did, and no way to get in touch outside of a personal introduction.',
      'That is a slow, fragile pipeline. Every enquiry depended on someone already knowing someone. For an organisation whose work is inherently collaborative, that ceiling was the real problem — not the absence of a website, but the absence of a way in.',
      'The brief was not "build us a site". It was: make it possible for the right people to find us, understand us, and reach us without an introduction.',
    ],

    strategy: [
      'We started with the audience rather than the pages. Funders, research partners and government bodies all arrive with different questions, so the structure had to answer each of them within a click or two of landing.',
      'Content was written to be scanned first and read second: what they do, who they work with, what has come of it. Programme areas were given their own pages so each could rank for the terms people actually search, rather than burying everything behind one dense "About" page.',
      'Technically it is deliberately plain — semantic markup, structured data, compressed imagery, no framework overhead. For an audience that includes people on slow connections and institutional hardware, speed is an accessibility decision, not a vanity metric.',
    ],

    outcome: [
      'Enquiries began arriving within the first weeks of launch — over thirty in the opening period, from partners who had found the organisation directly rather than through a referral.',
      'More importantly, the character of the conversations changed. People arrived already knowing the scope of the work, which moved first meetings past the explaining stage and into substance.',
      'The site now functions as the organisation\'s front door: the thing you send before a meeting, and the thing that gets found when nobody sends anything at all.',
    ],

    testimonial: null,
  },

  {
    slug: 'toothful-secrets',
    title: 'Toothful Secrets',
    year: '2024',
    industry: 'Healthcare · Growth',
    role: 'Web Design, Content Strategy, SEO',
    tags: ['Web Design', 'Healthcare', 'Content', 'SEO'],
    url: 'https://toothful-secrets.vercel.app',
    image: 'https://s0.wp.com/mshots/v1/https://toothful-secrets.vercel.app?w=1600',
    metric: 'Booking-ready presence',
    stats: [
      ['Clear', 'Service pathways'],
      ['Mobile', 'First build'],
      ['Local', 'SEO foundation'],
    ],

    overview: [
      'Toothful Secrets is a dental practice competing in a category where almost every competitor says the same things in the same order — gentle care, modern equipment, friendly team.',
      'The work was less about visual reinvention than about being genuinely useful at the moment someone is deciding whether to book.',
    ],

    challenge: [
      'Prospective patients arrive anxious and comparison-shopping. They want to know what a procedure involves, roughly what it costs, and whether they will be treated well — and they are usually looking on a phone, often late at night.',
      'The existing presence answered none of that quickly. Service information was thin, pricing was absent, and the path from "I have a toothache" to "I have an appointment" ran through a generic contact form.',
      'Compounding it, the practice was not surfacing for the local searches that matter most — the ones where intent is highest and the decision is nearly made.',
    ],

    strategy: [
      'We rebuilt around the questions patients actually ask, giving each service enough room to explain what happens, why it might be recommended, and what to expect afterwards. Plain language throughout; no clinical euphemism.',
      'Booking was made the persistent action rather than a destination — reachable from any point in a page without hunting for a menu.',
      'The build is mobile-first in the literal sense: designed at phone width first and expanded outward, because that is where nearly all of the traffic starts. Local SEO foundations — structured data, location signals, service-level pages — were laid at build time rather than bolted on afterwards.',
    ],

    outcome: [
      'The practice now has a presence that does the qualifying work before the phone rings: patients arrive at reception already knowing what they are booking and what it involves.',
      'The service pages give the practice something to point people to, which has quietly reduced the volume of repetitive questions coming through direct messages.',
      'The technical foundations mean the site is positioned to compete for local search rather than relying on directories and word of mouth.',
    ],

    testimonial: null,
  },

  {
    slug: 'glam-by-ivy',
    title: 'Glam by Ivy',
    year: '2024',
    industry: 'Beauty · Brand & Booking',
    role: 'Brand Identity, Web Design, Booking Flow',
    tags: ['Brand Identity', 'Web Design', 'Booking', 'Beauty'],
    url: 'https://glam-jet.vercel.app',
    image: 'https://s0.wp.com/mshots/v1/https://glam-jet.vercel.app?w=1600',
    metric: 'Bookings off DMs',
    stats: [
      ['Direct', 'Booking flow'],
      ['Own', 'Brand system'],
      ['Less', 'Admin time'],
    ],

    overview: [
      'Glam by Ivy is a beauty studio whose entire business ran through Instagram — discovery, consultation, scheduling, deposits and reminders, all in one inbox.',
      'It worked, right up until it did not scale. The brand needed a home it owned rather than one it rented from an algorithm.',
    ],

    challenge: [
      'Running a studio out of direct messages means the founder is the booking system. Every enquiry costs a conversation, availability has to be recited from memory, and anything not answered quickly quietly becomes a lost client.',
      'There was also no durable record of the work. A portfolio that lives in a feed disappears the moment someone scrolls past it, and none of it was searchable by anyone who was not already following.',
      'The risk underneath all of it: a business entirely dependent on a platform it does not control, with no way to reach its own clients if that platform changed.',
    ],

    strategy: [
      'We built a brand system that could exist off-platform — type, colour and layout rules that hold together across a website, a price list and a social post, so the studio looks like itself everywhere.',
      'The site was structured around the actual decision sequence: see the work, understand the service, check availability, book. Portfolio imagery leads, because in this category the work is the argument.',
      'Booking was moved out of the inbox into a self-serve flow with services and durations laid out plainly, so clients can schedule without a back-and-forth and the founder gets her evenings back.',
    ],

    outcome: [
      'Bookings now arrive without a conversation first, which removed the largest recurring cost in the founder\'s week — answering the same questions in DMs.',
      'The portfolio finally has a permanent, searchable home instead of vanishing down a feed, and the brand reads as a studio rather than an account.',
      'Most significantly, the business is no longer wholly dependent on a single platform for reaching its own clients.',
    ],

    testimonial: null,
  },

  {
    slug: 'solar-kenya',
    title: 'Solar Kenya',
    year: '2024',
    industry: 'Energy · Lead Generation',
    role: 'Web Design, SEO, Lead Generation',
    tags: ['Web Design', 'SEO', 'Lead Generation', 'Energy'],
    url: 'https://solar-kenya-e3ha.vercel.app',
    image: 'https://s0.wp.com/mshots/v1/https://solar-kenya-e3ha.vercel.app?w=1600',
    metric: 'Qualified enquiries',
    stats: [
      ['Qualified', 'Enquiry flow'],
      ['Clear', 'Product ranges'],
      ['Fast', 'On slow networks'],
    ],

    overview: [
      'Solar Kenya sells and installs solar systems — a considered purchase where the buyer is weighing a significant cost against savings they cannot yet see.',
      'The site had to do the work a good salesperson does: explain the options honestly, size the decision, and make it easy to start a real conversation.',
    ],

    challenge: [
      'Solar is bought slowly. Customers research for weeks, compare vendors, and arrive with specific questions about capacity, cost and whether a system will actually cover their usage.',
      'A brochure site cannot answer that. Without product clarity, every enquiry starts from zero, and the sales team spends its time re-explaining fundamentals rather than qualifying buyers.',
      'There was a delivery constraint too. A meaningful share of the audience browses on mid-range phones over inconsistent mobile data, where a heavy site simply does not load — and an unloaded page converts nobody.',
    ],

    strategy: [
      'Products were organised by the question customers actually ask — what am I trying to power? — rather than by the technical taxonomy the industry uses internally.',
      'Each range explains what it suits, what it includes and what to consider, so a visitor can narrow themselves down before ever making contact. The enquiry form asks the few questions that let the team respond usefully rather than asking for a name and a vague message.',
      'Performance was treated as a conversion requirement, not a technical nicety: lean payloads, compressed imagery, minimal scripting. On a patchy connection the difference between a site that loads and one that does not is the difference between an enquiry and a bounce.',
    ],

    outcome: [
      'Enquiries now arrive with context attached — what the customer wants to power, roughly what scale they are considering — so the team can respond with something specific instead of a discovery call.',
      'The product structure does the early qualifying, which means less time spent explaining the basics and more spent on people genuinely ready to buy.',
      'And the site holds up where the customers actually are: on a phone, on mobile data, without a fast connection to lean on.',
    ],

    testimonial: null,
  },
];

export default projects;
export const bySlug = (slug) => projects.find((p) => p.slug === slug) || null;
