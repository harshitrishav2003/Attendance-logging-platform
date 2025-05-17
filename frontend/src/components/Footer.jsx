import React from "react";
import { Link } from "react-router-dom";
import { FaGithub, FaTwitter, FaLinkedin, FaFacebook } from "react-icons/fa";
import LogoFooter from "../assets/logo.svg";
import "./Footer.css";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <div className="logo-section">

          </div>
          <p className="footer-description">
            &copy; {currentYear} All rights reserved.
          </p>
        </div>

        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul className="footer-links">
            <li>
              <a href="/">Overview</a>
            </li>
            <li>
              <a href="/admin">Admin Dashboard</a>
            </li>
            <li>
              <a href="/login">Sign In</a>
            </li>
           
          </ul>
        </div>

        
      </div>
    </footer>
  );
};

export default Footer;
