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
      'Livelihood Lab Africa works on sustainable livelihoods across the continent. It is the kind of work that runs on reputation, and theirs was good.',
      'The problem was that there was nowhere to point to. No website, no record of the work online, nothing a new partner could read before a first meeting.',
    ],

    challenge: [
      'Anyone who heard about them at a conference or through a colleague had no way to check what they did, and no way to get in touch without knowing somebody first.',
      'That is a fragile way to find work. Every enquiry depended on an introduction, which put a hard ceiling on an organisation whose whole model is collaboration.',
      'So the brief was never really "build us a site". It was: let the right people find us, work out what we do, and reach us cold.',
    ],

    strategy: [
      'We started with who was coming rather than with pages. Funders, research partners and government bodies all turn up with different questions, so the structure had to answer each of them a click or two in.',
      'Content was written to be skimmed first and read second. What they do, who they work with, what came of it. Each programme area got its own page so it could show up for the terms people actually type, instead of everything hiding behind one long About page.',
      'The build is deliberately plain. Semantic markup, structured data, compressed images, no framework sitting on top. Part of this audience is on slow connections and old institutional hardware, so speed here is an access question rather than a score to chase.',
    ],

    outcome: [
      'Enquiries started coming in during the first few weeks. Over thirty in that opening stretch, from partners who found the organisation themselves rather than being sent.',
      'The conversations changed too. People turned up already knowing the shape of the work, so first meetings skipped the explaining and got on with it.',
      'The site is the front door now. It is the thing you send before a meeting, and the thing that gets found when nobody sends anything.',
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
      'Toothful Secrets is a dental practice in a category where every competitor says the same things in the same order. Gentle care, modern equipment, friendly team.',
      'So the job was less about looking different and more about being useful at the exact moment someone is deciding whether to book.',
    ],

    challenge: [
      'Patients arrive nervous and comparing. They want to know what a procedure involves, roughly what it costs, and whether they will be looked after. Usually they are on a phone, and often it is late.',
      'The old site answered none of that quickly. Service information was thin, there was no pricing anywhere, and the route from toothache to appointment ran through a generic contact form.',
      'It was also not showing up for the local searches that matter, which are the ones where somebody has nearly decided already.',
    ],

    strategy: [
      'We rebuilt it around the questions patients actually ask. Each service got enough room to say what happens, why it might be recommended and what the days after look like. Plain words throughout, no clinical hedging.',
      'Booking became a thing you can do from anywhere on the page rather than a place you have to navigate to.',
      'It is mobile-first in the literal sense. Designed at phone width and expanded outwards, because that is where almost all the traffic starts. Structured data, location signals and a page per service went in while we were building, not months later.',
    ],

    outcome: [
      'The site does some of the qualifying before the phone rings. People arrive at reception already knowing what they booked and what it involves.',
      'The service pages give the practice something to send, which has quietly cut the same three questions arriving in messages every week.',
      'And the technical side is set up to compete for local search instead of leaning on directories and word of mouth.',
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
      'Glam by Ivy ran the whole business through Instagram. Discovery, consultation, scheduling, deposits, reminders, all of it in one inbox.',
      'It worked right up until it did not. The studio needed a home it owned rather than one it was renting from an algorithm.',
    ],

    challenge: [
      'When a studio runs out of direct messages, the founder is the booking system. Every enquiry costs a conversation, availability gets recited from memory, and anything not answered fast enough quietly turns into a client who went elsewhere.',
      'There was no lasting record of the work either. A portfolio that lives in a feed vanishes the moment somebody scrolls, and none of it could be found by anyone not already following.',
      'Underneath that was the real risk. The whole business sat on a platform she did not control, with no way of reaching her own clients if it changed.',
    ],

    strategy: [
      'We built a brand that works off the platform. Type, colour and layout rules that hold up across a website, a price list and a post, so the studio looks like itself wherever it turns up.',
      'The site follows the order people actually decide in. See the work, understand the service, check availability, book. Photography leads, because in this line of work the work is the argument.',
      'Booking moved out of the inbox into a proper self-serve flow with services and durations spelled out, so clients can sort themselves out and she gets her evenings back.',
    ],

    outcome: [
      'Bookings come in without a conversation first, which took out the biggest recurring cost in her week.',
      'The portfolio has a permanent home that can be found by search instead of disappearing down a feed, and the brand reads as a studio rather than an account.',
      'Most of all, the business is no longer sitting entirely on one platform to reach its own clients.',
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
      'Solar Kenya sells and installs solar systems. It is a considered purchase, where somebody is weighing a large cost against savings they cannot see yet.',
      'So the site had to do what a good salesperson does. Explain the options honestly, help size the decision, and make it easy to start a real conversation.',
    ],

    challenge: [
      'Solar gets bought slowly. People research for weeks, compare vendors, and arrive with specific questions about capacity, cost and whether a system will actually cover what they use.',
      'A brochure site cannot answer any of that. Without clarity on the products every enquiry starts from nothing, and the sales team spends its time explaining basics instead of finding out who is serious.',
      'There was a delivery problem too. A good share of the audience is on mid-range phones and patchy mobile data, where a heavy site just does not load, and a page that does not load converts nobody.',
    ],

    strategy: [
      'We organised the products around what customers actually ask, which is what am I trying to power, rather than the technical categories the industry uses internally.',
      'Each range says what it suits, what comes with it and what to think about, so someone can narrow themselves down before getting in touch. The enquiry form asks the few things that let the team reply usefully instead of asking for a name and a vague message.',
      'Performance was treated as part of conversion rather than a technical nicety. Light pages, compressed images, very little script. On a bad connection the gap between a site that loads and one that does not is the gap between an enquiry and a bounce.',
    ],

    outcome: [
      'Enquiries turn up with context attached. What the customer wants to power, roughly what scale they have in mind, so the team can answer with something specific rather than booking a call to find out.',
      'The product structure handles the early qualifying, so less time goes on explaining basics and more on people who are ready.',
      'And it holds up where the customers actually are. On a phone, on mobile data, with nothing fast to lean on.',
    ],

    testimonial: null,
  },
];

export default projects;
export const bySlug = (slug) => projects.find((p) => p.slug === slug) || null;
