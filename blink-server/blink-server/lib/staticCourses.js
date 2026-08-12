// Curated fallback for platforms that don't offer a public course
// catalog API (freeCodeCamp, Khan Academy, MIT OCW), plus a safety
// net for Coursera/edX/Udemy when their live calls fail or aren't
// configured yet. Update this list by hand as you find new courses.

module.exports = [
  { id: "fcc-rwd", title: "Responsive Web Design", platform: "freeCodeCamp", category: "Programming", level: "Beginner", duration: "~300 hrs", access: "Fully free", blurb: "Build real projects while earning a free certification — no paywall anywhere in the curriculum.", url: "https://www.freecodecamp.org/learn/2022/responsive-web-design/" },
  { id: "fcc-jsads", title: "JavaScript Algorithms and Data Structures", platform: "freeCodeCamp", category: "Programming", level: "Intermediate", duration: "~300 hrs", access: "Fully free", blurb: "From basic syntax through recursion and Big-O, with a free certificate at the end.", url: "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/" },
  { id: "khan-stats", title: "Introduction to Statistics", platform: "Khan Academy", category: "Data Science", level: "Beginner", duration: "Self-paced", access: "Fully free", blurb: "Distributions, sampling and hypothesis testing, taught in short videos with instant practice checks.", url: "https://www.khanacademy.org/math/statistics-probability" },
  { id: "khan-design", title: "Graphic Design Basics", platform: "Khan Academy", category: "Design", level: "Beginner", duration: "Self-paced", access: "Fully free", blurb: "Color, layout and typography principles explained through short, visual lessons.", url: "https://www.khanacademy.org/humanities/hass-storytelling" },
  { id: "ocw-6001", title: "MIT 6.0001: Intro to CS and Programming", platform: "MIT OCW", category: "Programming", level: "Beginner", duration: "~13 wks", access: "Fully free", blurb: "Full MIT lecture videos, problem sets and exams — the whole course, no login wall.", url: "https://ocw.mit.edu/search/?q=6.0001" },
  { id: "ocw-1806", title: "MIT 18.06: Linear Algebra", platform: "MIT OCW", category: "Data Science", level: "Intermediate", duration: "~13 wks", access: "Fully free", blurb: "Gilbert Strang's legendary lecture series — the math underneath most of machine learning.", url: "https://ocw.mit.edu/search/?q=18.06" },
  { id: "google-digital", title: "Digital Marketing Fundamentals", platform: "Other", category: "Marketing", level: "Beginner", duration: "~40 hrs", access: "Fully free", blurb: "Google's own certification covering search, social and analytics basics, exam included.", url: "https://learndigital.withgoogle.com/digitalgarage/" },
  { id: "eoa", title: "Elements of AI", platform: "Other", category: "AI & ML", level: "Beginner", duration: "~30 hrs", access: "Fully free", blurb: "University of Helsinki's plain-language tour of what AI can and can't do, no coding required.", url: "https://www.elementsofai.com/" }
];
