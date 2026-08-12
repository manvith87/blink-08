import { useEffect, useMemo, useState } from "react";
import { AuthProvider } from "./context/AuthContext.jsx";
import { fetchCourses } from "./api.js";
import fallbackCourses from "./data/fallbackCourses.js";

import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import Controls from "./components/Controls.jsx";
import CourseGrid from "./components/CourseGrid.jsx";
import HowItWorks from "./components/HowItWorks.jsx";
import Footer from "./components/Footer.jsx";
import AuthModal from "./components/AuthModal.jsx";

function AppShell() {
  const [courses, setCourses] = useState(fallbackCourses);
  const [liveStatus, setLiveStatus] = useState("static"); // "static" | "live" | "offline"
  const [freshCount, setFreshCount] = useState(0);

  const [activePlatform, setActivePlatform] = useState("All");
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Load real data from the backend on mount. If it's unreachable,
  // the built-in fallback list (set as initial state above) stays put.
  useEffect(() => {
    let cancelled = false;

    fetchCourses()
      .then((data) => {
        if (cancelled) return;
        const results = data.results || [];
        setCourses(results);
        setLiveStatus("live");
        setFreshCount(results.length);
      })
      .catch((err) => {
        if (cancelled) return;
        setLiveStatus("offline");
        console.info("Blink: live backend not reachable, showing built-in list only.", err.message);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const platforms = useMemo(
    () => ["All", ...Array.from(new Set(courses.map((c) => c.platform))).sort()],
    [courses]
  );
  const categories = useMemo(
    () => Array.from(new Set(courses.map((c) => c.category || "General"))).sort(),
    [courses]
  );

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const category = c.category || "General";
      const matchesPlatform = activePlatform === "All" || c.platform === activePlatform;
      const matchesCategory = activeCategory === "all" || category === activeCategory;
      const haystack = `${c.title} ${c.platform} ${category} ${c.blurb || ""}`.toLowerCase();
      const matchesSearch = searchTerm === "" || haystack.includes(searchTerm.toLowerCase());
      return matchesPlatform && matchesCategory && matchesSearch;
    });
  }, [courses, activePlatform, activeCategory, searchTerm]);

  // If the active category no longer exists in the current course
  // list (e.g. after switching platforms), fall back to "all" rather
  // than silently showing zero results.
  useEffect(() => {
    if (activeCategory !== "all" && !categories.includes(activeCategory)) {
      setActiveCategory("all");
    }
  }, [categories, activeCategory]);

  return (
    <>
      <Header onOpenAuth={() => setAuthModalOpen(true)} />

      <main id="top">
        <Hero courses={courses} liveStatus={liveStatus} freshCount={freshCount} />

        <Controls
          platforms={platforms}
          categories={categories}
          activePlatform={activePlatform}
          activeCategory={activeCategory}
          searchTerm={searchTerm}
          resultCount={filteredCourses.length}
          onPlatformChange={setActivePlatform}
          onCategoryChange={setActiveCategory}
          onSearchChange={setSearchTerm}
        />

        <CourseGrid courses={filteredCourses} />

        <HowItWorks />
      </main>

      <Footer />

      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
