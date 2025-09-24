import { useEffect } from "react";
import "./DriveManagerLanding.css";

export default function DriveManagerLanding() {
  useEffect(() => {
    // Scroll animations
    function isElementInViewport(el) {
      const rect = el.getBoundingClientRect();
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <=
          (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
      );
    }

    function handleScrollAnimations() {
      const elements = document.querySelectorAll(".fade-in");
      elements.forEach((el) => {
        if (
          isElementInViewport(el) ||
          window.scrollY + window.innerHeight >= el.offsetTop + 100
        ) {
          el.classList.add("visible");
        }
      });
    }

    function handleNavbarScroll() {
  const navbar = document.querySelector(".navbar");
  if (!navbar) return; // ✅ skip if navbar not found

  if (window.scrollY > 100) {
    navbar.style.background = "rgba(255, 255, 255, 0.95)";
    navbar.style.backdropFilter = "blur(10px)";
  } else {
    navbar.style.background = "#FFFFFF";
    navbar.style.backdropFilter = "none";
  }
}


    function setupSmoothScrolling() {
      document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", function (e) {
          e.preventDefault();
          const target = document.querySelector(this.getAttribute("href"));
          if (target) {
            target.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        });
      });
    }

    function animateCounters() {
      const counters = document.querySelectorAll(".stat-item h3");
      counters.forEach((counter) => {
        const target = parseInt(counter.textContent.replace(/[^0-9]/g, ""));
        let current = 0;
        const increment = target / 50;
        const suffix = counter.textContent.replace(/[0-9]/g, "");
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            counter.textContent = target + suffix;
            clearInterval(timer);
          } else {
            counter.textContent = Math.floor(current) + suffix;
          }
        }, 40);
      });
    }

    const statsSection = document.querySelector(".stats");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounters();
          observer.unobserve(entry.target);
        }
      });
    });

    if (statsSection) {
      observer.observe(statsSection);
    }

    // Init
    window.addEventListener("scroll", () => {
      handleScrollAnimations();
      handleNavbarScroll();
    });

    window.addEventListener("load", () => {
      handleScrollAnimations();
      setupSmoothScrolling();
    });

    return () => {
      window.removeEventListener("scroll", handleScrollAnimations);
      window.removeEventListener("scroll", handleNavbarScroll);
    };
  }, []);

  return (
    <>
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo">
            Riya<span>Guru</span>.lk
          </div>
          <ul className="nav-links">
            <li><a href="#features">Lesson Progress</a></li>
            <li><a href="#tracking">Progress Tracking</a></li>
            <li><a href="#payments">Payments</a></li>
            <li><a href="#vehicles">Vehicles</a></li>
            <li><a href="#dashboard">Student Dashboard</a></li>
          </ul>
          <a href="/login" className="login-btn">Log In</a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-container">
          <h1 className="fade-in">
            Manage Lessons, Track Progress, Empower Students
          </h1>
          <p className="fade-in">
            The complete driving school management system that streamlines
            lesson scheduling, progress tracking, and certificate management
            for instructors and students.
          </p>
          <div className="fade-in">
            <a href="#get-started" className="cta-button">Get Started Free</a>
            <a href="#demo" className="cta-secondary">Watch Demo</a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features" id="features">
        <div className="container">
          <div className="section-header fade-in">
            <h2>Everything You Need to Run Your Driving School</h2>
            <p>
              Comprehensive tools designed for modern driving instructors and
              their students
            </p>
          </div>
          <div className="features-grid">
            <div className="feature-card fade-in">
              <div className="feature-icon">📚</div>
              <h3>Lesson Management</h3>
              <p>
                Schedule, track, and manage driving lessons with ease.
                Real-time updates and automated notifications keep everyone
                informed.
              </p>
            </div>
            <div className="feature-card fade-in">
              <div className="feature-icon">📊</div>
              <h3>Progress Tracking</h3>
              <p>
                Monitor student progress with detailed analytics, skill
                assessments, and milestone tracking throughout their learning
                journey.
              </p>
            </div>
            <div className="feature-card fade-in">
              <div className="feature-icon">💳</div>
              <h3>Payment Management</h3>
              <p>
                Handle payments, invoicing, and financial records seamlessly
                with integrated payment processing and reporting tools.
              </p>
            </div>
            <div className="feature-card fade-in">
              <div className="feature-icon">🏆</div>
              <h3>Certificate Issuance</h3>
              <p>
                Generate and issue certificates automatically upon course
                completion with customizable templates and digital verification.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats">
        <div className="container stats-container">
          <div className="stats-grid">
            <div className="stat-item fade-in">
              <h3>500+</h3>
              <p>Students Enrolled</p>
            </div>
            <div className="stat-item fade-in">
              <h3>1,000+</h3>
              <p>Lessons Completed</p>
            </div>
            <div className="stat-item fade-in">
              <h3>200+</h3>
              <p>Certificates Issued</p>
            </div>
            <div className="stat-item fade-in">
              <h3>98%</h3>
              <p>Success Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="how-it-works">
        <div className="container">
          <div className="section-header fade-in">
            <h2>How It Works</h2>
            <p>Simple, efficient workflow that works for everyone</p>
          </div>
          <div className="steps-grid">
            <div className="step-card fade-in">
              <div className="step-number">1</div>
              <h3>Instructors Log Lessons</h3>
              <p>
                Instructors easily record lesson details, student performance,
                and progress notes through our intuitive interface.
              </p>
            </div>
            <div className="step-card fade-in">
              <div className="step-number">2</div>
              <h3>Students View Progress</h3>
              <p>
                Students access their personalized dashboard to track progress,
                view upcoming lessons, and monitor skill development.
              </p>
            </div>
            <div className="step-card fade-in">
              <div className="step-number">3</div>
              <h3>Admins Issue Certificates</h3>
              <p>
                Upon completion, administrators can instantly generate and
                issue official certificates with full audit trails.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-banner">
        <div className="container">
          <div className="cta-content fade-in">
            <h2>Ready to Transform Your Driving School?</h2>
            <p>
              Join hundreds of driving instructors who are already using
              RiyaGuru.lk to streamline their operations and enhance
              student learning.
            </p>
            <a href="#get-started" className="cta-button">
              Start Free Trial
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>Product</h3>
              <ul>
                <li><a href="#features">Features</a></li>
                <li><a href="#pricing">Pricing</a></li>
                <li><a href="#demo">Demo</a></li>
                <li><a href="#integrations">Integrations</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h3>Support</h3>
              <ul>
                <li><a href="#help">Help Center</a></li>
                <li><a href="#contact">Contact Us</a></li>
                <li><a href="#training">Training</a></li>
                <li><a href="#api">API Docs</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h3>Company</h3>
              <ul>
                <li><a href="#about">About Us</a></li>
                <li><a href="#careers">Careers</a></li>
                <li><a href="#blog">Blog</a></li>
                <li><a href="#news">News</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h3>Legal</h3>
              <ul>
                <li><a href="#privacy">Privacy Policy</a></li>
                <li><a href="#terms">Terms of Service</a></li>
                <li><a href="#security">Security</a></li>
                <li><a href="#compliance">Compliance</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 RiyaGuru.lk. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
