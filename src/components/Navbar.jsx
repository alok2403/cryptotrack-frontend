import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

import NotificationBell from "./NotificationBell";


export default function Navbar() {

    const navigate = useNavigate();

    const navItems = [
        { name: "Dashboard", path: "/dashboard" },
        { name: "Markets", path: "/markets" },
        { name: "Portfolio", path: "/portfolio" },
        { name: "Alerts", path: "/alerts" },
        { name: "AI Analysis", path: "/ai-analysis" },
        { name: "Help Center", path: "/help" },
        { name: "Contact", path: "/contact" }
    ];

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    return (

        <nav style={styles.navbar}>

            {/* =================================================
                LOGO
            ================================================= */}

            <div
                style={styles.logo}
                onClick={() => navigate("/dashboard")}
            >

                <div style={styles.logoIcon}>
                    ₿
                </div>

                <div>
                    <div style={styles.logoText}>
                        CryptoTrack
                    </div>

                    <div style={styles.logoSubtext}>
                        SMART CRYPTO INTELLIGENCE
                    </div>
                </div>

            </div>


            {/* =================================================
                NAVIGATION
            ================================================= */}

            <div style={styles.navigation}>

                {navItems.map(item => (

                    <NavLink
                        key={item.path}
                        to={item.path}
                        style={({ isActive }) => ({
                            ...styles.navLink,
                            ...(isActive ? styles.activeNavLink : {})
                        })}
                    >
                        {item.name}
                    </NavLink>

                ))}

            </div>


            {/* =================================================
                RIGHT SIDE
            ================================================= */}

            <div style={styles.rightSection}>

                <NotificationBell />

                <button
                    type="button"
                    style={styles.logoutButton}
                    onClick={handleLogout}
                >
                    Logout
                </button>

            </div>

        </nav>
    );
}


const styles = {

    navbar: {
        height: "72px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 32px",

        background: "rgba(255, 255, 255, 0.85)",
        borderBottom: "1px solid var(--border, #e2e8f0)",
        boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)",

        position: "sticky",
        top: 0,
        zIndex: 1000,
        backdropFilter: "blur(16px)",
    },

    logo: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        cursor: "pointer",
        minWidth: "190px",
    },

    logoIcon: {
        width: "38px",
        height: "38px",
        borderRadius: "12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg,#6d5dfc,#4f46e5)",
        color: "white",
        fontSize: "21px",
        fontWeight: "800",
        boxShadow: "0 4px 12px rgba(109, 93, 252, 0.3)",
    },

    logoText: {
        color: "var(--text, #0f172a)",
        fontSize: "19px",
        fontWeight: "700",
        letterSpacing: "-0.3px",
    },

    logoSubtext: {
        color: "var(--text-muted, #64748b)",
        fontSize: "8px",
        letterSpacing: "1.4px",
        marginTop: "2px",
    },

    navigation: {
        display: "flex",
        alignItems: "center",
        gap: "5px",
        flex: 1,
        justifyContent: "center",
    },

    navLink: {
        color: "var(--text-muted, #64748b)",
        textDecoration: "none",
        padding: "9px 13px",
        borderRadius: "9px",
        fontSize: "13px",
        fontWeight: "500",
        transition: "all 0.2s ease",
        whiteSpace: "nowrap",
    },

    activeNavLink: {
        color: "#4f46e5",
        background: "rgba(109, 93, 252, 0.1)",
        boxShadow: "inset 0 0 0 1px rgba(109,93,252,0.25)",
    },

    rightSection: {
        minWidth: "190px",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: "12px",
    },

    logoutButton: {
        border: "1px solid var(--border, #e2e8f0)",
        background: "var(--surface, #ffffff)",
        color: "var(--text, #0f172a)",
        padding: "9px 17px",
        borderRadius: "9px",
        cursor: "pointer",
        fontSize: "13px",
        fontWeight: "600",
    },
};