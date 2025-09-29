import { useEffect } from "react";
import "./DriveManagerLanding.css";
import { Link } from "react-router-dom";

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
      if (!navbar) return;

      if (window.scrollY > 100) {
        navbar.style.background = "rgba(26, 31, 58, 0.95)";
        navbar.style.backdropFilter = "blur(10px)";
      } else {
        navbar.style.background = "rgba(26, 31, 58, 1)";
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
            <img src="/images/logo.png" alt="RiyaGuru" className="logo-img" />
          </div>
          <ul className="nav-links">
            <li><a href="#home" className="nav-button">Home</a></li>
            <li><a href="#program" className="nav-button">Program</a></li>
            <li><a href="#about" className="nav-button">About Us</a></li>
            <li><a href="#contact" className="nav-button">Contact Us</a></li>
            <li><a href="#testimonials" className="nav-button">Testimonials</a></li>
          </ul>
          <Link to="/login" className="login-btn">LOG IN</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero" id="home">
        <div className="hero-background">
          <img src="/images/hero/instructor-student.jpg" alt="RiyaGuru Driving Instructor with Student" className="hero-image" />
          <div className="hero-overlay"></div>
        </div>
        <div className="hero-container">
          <div className="hero-content fade-in">
            <h1>RiyaGuru Driving School - Master the Road with Confidence</h1>
            <p>
              At RiyaGuru Driving School, we provide expert training with
              personalized guidance to help you master the road. Our certified
              instructors ensure you gain the skills, confidence, and knowledge to
              become a responsible driver for life.
            </p>
            <div className="hero-buttons">
              <a href="#program" className="cta-button">EXPLORE MORE </a>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="programs" id="program">
        <div className="container">
          <div className="section-header fade-in">
            <span className="section-subtitle">OUR PROGRAMS</span>
            <h2>what we offer</h2>
          </div>
          <div className="programs-grid">
            <div className="program-card fade-in">
              <div className="program-image">
                <img src="/images/programs/graduation1.jpg" alt="Driving Course Completion" />
              </div>
              <div className="program-content">
                <h3>Complete Driving Course</h3>
                <p>Comprehensive training program covering all aspects of safe driving with certified instructors.</p>
              </div>
            </div>
            <div className="program-card fade-in">
              <div className="program-image">
                <img src="/images/programs/graduation2.jpg" alt="Advanced Driving Skills" />
              </div>
              <div className="program-content">
                <h3>Advanced Skills Training</h3>
                <p>Master advanced driving techniques and defensive driving strategies for confident road navigation.</p>
              </div>
            </div>
            <div className="program-card fade-in">
              <div className="program-image">
                <img src="/images/programs/graduation3.jpg" alt="License Preparation" />
              </div>
              <div className="program-content">
                <h3>License Test Preparation</h3>
                <p>Focused preparation for your driving license test with mock tests and practical guidance.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about" id="about">
        <div className="container">
          <div className="about-content">
            <div className="about-text fade-in">
              <span className="section-subtitle">ABOUT RIYAGURU.LK</span>
              <h2>Shaping Safer Drivers for Tomorrow</h2>
              
              <div className="about-points">
                <div className="about-point">
                  <div className="point-line"></div>
                  <p>Welcome to RiyaGuru.lk â€" Sri Lanka's modern driving school management system. We provide a complete platform for students to register online, book lessons, and access digital learning resources with ease.</p>
                </div>
                
                <div className="about-point">
                  <div className="point-line"></div>
                  <p>With expert instructors, well-maintained vehicles, and real-time scheduling, we ensure every learner receives practical, flexible, and safe training. Our mission is to empower drivers with knowledge, confidence, and road safety awareness.</p>
                </div>
                
                <div className="about-point">
                  <div className="point-line"></div>
                  <p>At RiyaGuru, technology meets training â€" helping you track your progress, receive instant feedback, and achieve your driving license faster and smarter.</p>
                </div>
              </div>
            </div>
            <div className="about-image fade-in">
              <img src="/images/about/student-learning.jpg" alt="Student Learning at RiyaGuru" />
              <div className="play-button">
                <div className="play-icon">â–¶</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact" id="contact">
        <div className="container">
          <div className="section-header fade-in">
            <span className="section-subtitle">CONTACT US</span>
            <h2>Get in Touch</h2>
          </div>
          
          <div className="contactus">
            <div className="contact-col fade-in">
              <h3>Contact RiyaGuru.lk 
                <span className="contact-emoji">📧</span>
              </h3>
              <p>
                Have a question about lessons, bookings, or payments? 
                Our team is ready to assist you in starting your driving journey 
                with confidence.
              </p>

              <ul>
                <li>
                  <span className="contact-emoji">📧</span>
                  support@riyaguru.lk
                </li>
                <li>
                  <span className="contact-emoji">📞</span>
                  +94 71 234 5678
                </li>
                <li>
                  <span className="contact-emoji">📍</span>
                  No. 25, Main Road, Kandy, Sri Lanka
                </li>
              </ul>
            </div>

            <div className="contact-col fade-in">
              <form className="contact-form">
                <h2>Send Us a Message</h2>
                <input type="text" name="name" placeholder="Your Full Name" required />
                <input type="tel" name="phone" placeholder="Your Phone Number" required />
                <textarea name="message" rows="5" placeholder="Write your message here..." required></textarea>
                <button type="submit">Send Message</button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials" id="testimonials">
        <div className="container">
          <div className="section-header fade-in">
            <span className="section-subtitle">TESTIMONIALS</span>
            <h2>What student says</h2>
          </div>
          
          <div className="testimonials-container">
            <button className="testimonial-nav prev"></button>
            
            <div className="testimonials-grid">
              <div className="testimonial-card fade-in">
                <div className="testimonial-header">
                  <img src="/images/testimonials/pasindu.jpg" alt="Pasindu Sankalpa" className="testimonial-avatar" />
                  <div className="testimonial-info">
                    <h4>Pasindu Sankalpa</h4>
                    <p>Galle, SRI LANKA</p>
                  </div>
                </div>
                <div className="testimonial-content">
                  <p>"RiyaGuru feels like home! I love the experienced instructors, friendly staff, and practicing with my fellow learners after learning new driving techniques every day."</p>
                </div>
              </div>
              
              <div className="testimonial-card fade-in">
                <div className="testimonial-header">
                  <img src="/images/testimonials/sandani.jpg" alt="Nimesha Basnayaka" className="testimonial-avatar" />
                  <div className="testimonial-info">
                    <h4>Nimesha Basnayaka</h4>
                    <p>Kandy, SRI LANKA</p>
                  </div>
                </div>
                <div className="testimonial-content">
                  <p>"I like RiyaGuru because I learn new driving skills and the instructors are really kind and supportive."</p>
                </div>
              </div>
            </div>
            
            <button className="testimonial-nav next"></button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-section">
              <h3 className="footer-logo">RiyaGuru.lk</h3>
              <p className="footer-description">
                Simplifying driving school management with online booking, digital learning,
                and real-time progress tracking for safer drivers in Sri Lanka.
              </p>
              <div className="social-links">
                <a href="#" className="social-link"><i className="fab fa-facebook-f"></i></a>
                <a href="#" className="social-link"><i className="fab fa-twitter"></i></a>
                <a href="#" className="social-link"><i className="fab fa-linkedin-in"></i></a>
                <a href="#" className="social-link"><i className="fab fa-instagram"></i></a>
              </div>
            </div>

            <div className="footer-section">
              <h4 className="footer-title">Quick Links</h4>
              <ul className="footer-links">
                <li><a href="#about">About Us</a></li>
                <li><a href="#program">Driving Lessons</a></li>
                <li><a href="#instructors">Instructors</a></li>
                <li><a href="#vehicles">Vehicles</a></li>
                <li><a href="#contact">Contact</a></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4 className="footer-title">Support</h4>
              <ul className="footer-links">
                <li><a href="#help">Help Center</a></li>
                <li><a href="#portal">Student Portal</a></li>
                <li><a href="#payment">Payment Support</a></li>
                <li><a href="#faq">FAQs</a></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4 className="footer-title">Contact Info</h4>
              <div className="contact-info">
                <p className="contact-item"><i className="fas fa-map-marker-alt"></i> No. 25, Main Road, Kandy</p>
                <p className="contact-item"><i className="fas fa-phone"></i> +94 71 234 5678</p>
                <p className="contact-item"><i className="fas fa-envelope"></i> support@riyaguru.lk</p>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p className="copyright">Â© 2025 RiyaGuru.lk. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}