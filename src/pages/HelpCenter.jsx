
import React, { useState } from "react";
import Navbar from "../components/Navbar";

export default function HelpCenter() {

    const [openFaq, setOpenFaq] = useState(null);
    const [search, setSearch] = useState("");
    const [showRequest, setShowRequest] = useState(false);

    // =========================================================
    // SUPPORT FORM STATE
    // =========================================================

    const [email, setEmail] = useState("");
    const [issue, setIssue] = useState("");
    const [description, setDescription] = useState("");

    const [submitting, setSubmitting] = useState(false);

    // =========================================================
    // FAQ DATA
    // =========================================================

    const faqs = [
        {
            question: "How do I search for a cryptocurrency?",
            answer:
                "Open the market section and enter a cryptocurrency name or CoinGecko ID such as bitcoin, ethereum, or solana. CryptoTrack will display the available market information."
        },
        {
            question: "How do I create a price alert?",
            answer:
                "Go to Price Alerts, select a cryptocurrency, enter your target price and choose whether the alert should trigger when the price goes above or below your target."
        },
        {
            question: "How do I delete a price alert?",
            answer:
                "Open the Price Alerts page and select the delete action on the alert you want to remove."
        },
        {
            question: "Why am I asked to log in again?",
            answer:
                "CryptoTrack uses JWT authentication. If your authentication token expires or becomes invalid, you may need to log in again to continue using protected features."
        },
        {
            question: "What is AI Analysis?",
            answer:
                "AI Analysis uses available cryptocurrency market and historical price data to generate a structured explanation of recent price movement, trends, risks and factors to monitor."
        },
        {
            question: "Does AI Analysis predict cryptocurrency prices?",
            answer:
                "No. AI Analysis is designed to explain the supplied market data. It should not be treated as a guaranteed prediction or personalized financial advice."
        },
        {
            question: "Why is AI Analysis temporarily unavailable?",
            answer:
                "AI Analysis depends on the configured Gemini API. If the API quota has been exceeded, the service may temporarily become unavailable until the quota becomes available again or the API configuration is changed."
        },
        {
            question: "Is my password stored securely?",
            answer:
                "Passwords should be stored using secure password hashing such as BCrypt rather than plain text. Never share your password, JWT token or API key with anyone."
        }
    ];

    // =========================================================
    // FILTER FAQ
    // =========================================================

    const filteredFaqs = faqs.filter((faq) => {

        const text =
            `${faq.question} ${faq.answer}`.toLowerCase();

        return text.includes(
            search.toLowerCase()
        );
    });

    // =========================================================
    // FAQ TOGGLE
    // =========================================================

    const toggleFaq = (index) => {

        setOpenFaq(
            openFaq === index
                ? null
                : index
        );
    };

    // =========================================================
    // OPEN SUPPORT MODAL
    // =========================================================

    const openSupportModal = () => {

        setShowRequest(true);
    };

    // =========================================================
    // CLOSE SUPPORT MODAL
    // =========================================================

    const closeSupportModal = () => {

        if (submitting) {
            return;
        }

        setShowRequest(false);
    };

    // =========================================================
    // SUBMIT SUPPORT REQUEST
    // =========================================================

    const submitSupportRequest = async () => {

        if (!email.trim()) {

            alert("Please enter your registered email.");

            return;
        }

        if (!issue.trim()) {

            alert("Please select an issue.");

            return;
        }

        if (!description.trim()) {

            alert("Please describe your issue.");

            return;
        }

        try {

            setSubmitting(true);

            const response = await fetch(
                "https://cryptotrack-backend-mgou.onrender.com/api/support",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email: email.trim(),
                        issue: issue.trim(),
                        description: description.trim()
                    })
                }
            );

            const contentType =
                response.headers.get(
                    "content-type"
                );

            let data;

            if (
                contentType &&
                contentType.includes("application/json")
            ) {

                data = await response.json();

            } else {

                data = await response.text();
            }

            if (!response.ok) {

                const errorMessage =
                    typeof data === "string"
                        ? data
                        : "Failed to submit support request.";

                throw new Error(
                    errorMessage
                );
            }

            // =================================================
            // SUCCESS
            // =================================================

            alert(
                "Support request submitted successfully!"
            );

            // Clear form

            setEmail("");
            setIssue("");
            setDescription("");

            // Close modal

            setShowRequest(false);

        } catch (error) {

            console.error(
                "Support request error:",
                error
            );

            alert(
                error.message ||
                "Unable to submit support request. Please try again."
            );

        } finally {

            setSubmitting(false);
        }
    };

    return (

        <div style={styles.page}>

            <Navbar />

            <main style={styles.container}>

                {/* =================================================
                    HERO
                ================================================= */}

                <section style={styles.hero}>

                    <div style={styles.heroBadge}>
                        CRYPTOTRACK SUPPORT
                    </div>

                    <h1 style={styles.heroTitle}>
                        How can we help?
                    </h1>

                    <p style={styles.heroSubtitle}>
                        Find answers about your account,
                        cryptocurrency tracking, price alerts
                        and AI analysis.
                    </p>

                    {/* SEARCH */}

                    <div style={styles.searchWrapper}>

                        <span style={styles.searchIcon}>
                            🔍
                        </span>

                        <input
                            type="text"
                            placeholder="Search the Help Center..."
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                            style={styles.searchInput}
                        />

                        {search && (

                            <button
                                onClick={() =>
                                    setSearch("")
                                }
                                style={styles.clearSearch}
                            >
                                ×
                            </button>

                        )}

                    </div>

                </section>


                {/* =================================================
                    QUICK HELP CARDS
                ================================================= */}

                <section style={styles.quickSection}>

                    <div style={styles.quickGrid}>

                        <div style={styles.quickCard}>

                            <div style={styles.quickIcon}>
                                ◈
                            </div>

                            <h3 style={styles.quickTitle}>
                                Getting Started
                            </h3>

                            <p style={styles.quickText}>
                                Learn how to use CryptoTrack,
                                search cryptocurrencies and
                                navigate the dashboard.
                            </p>

                        </div>


                        <div style={styles.quickCard}>

                            <div style={styles.quickIcon}>
                                ◉
                            </div>

                            <h3 style={styles.quickTitle}>
                                Price Alerts
                            </h3>

                            <p style={styles.quickText}>
                                Create, manage and remove
                                cryptocurrency price alerts.
                            </p>

                        </div>


                        <div style={styles.quickCard}>

                            <div style={styles.quickIcon}>
                                ✦
                            </div>

                            <h3 style={styles.quickTitle}>
                                AI Analysis
                            </h3>

                            <p style={styles.quickText}>
                                Understand how CryptoTrack
                                generates cryptocurrency
                                market analysis.
                            </p>

                        </div>


                        <div style={styles.quickCard}>

                            <div style={styles.quickIcon}>
                                🔒
                            </div>

                            <h3 style={styles.quickTitle}>
                                Security
                            </h3>

                            <p style={styles.quickText}>
                                Learn important security
                                practices for protecting
                                your account.
                            </p>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    FAQ
                ================================================= */}

                <section style={styles.faqSection}>

                    <div style={styles.sectionHeader}>

                        <div>

                            <div style={styles.sectionEyebrow}>
                                FREQUENTLY ASKED QUESTIONS
                            </div>

                            <h2 style={styles.sectionTitle}>
                                Common questions
                            </h2>

                            <p style={styles.sectionSubtitle}>
                                Everything you need to know
                                about using CryptoTrack.
                            </p>

                        </div>

                    </div>


                    <div style={styles.faqContainer}>

                        {filteredFaqs.length === 0 && (

                            <div style={styles.noResults}>

                                <div style={styles.noResultsIcon}>
                                    ?
                                </div>

                                <h3 style={styles.noResultsTitle}>
                                    No results found
                                </h3>

                                <p style={styles.noResultsText}>
                                    Try searching for another topic.
                                </p>

                            </div>

                        )}


                        {filteredFaqs.map(
                            (faq, index) => {

                                const isOpen =
                                    openFaq === index;

                                return (

                                    <div
                                        key={faq.question}
                                        style={{
                                            ...styles.faqItem,
                                            ...(isOpen
                                                ? styles.faqItemOpen
                                                : {})
                                        }}
                                    >

                                        <button
                                            onClick={() =>
                                                toggleFaq(index)
                                            }
                                            style={styles.faqQuestion}
                                        >

                                            <span>
                                                {faq.question}
                                            </span>

                                            <span
                                                style={{
                                                    ...styles.faqArrow,
                                                    transform:
                                                        isOpen
                                                            ? "rotate(180deg)"
                                                            : "rotate(0deg)"
                                                }}
                                            >
                                                ▼
                                            </span>

                                        </button>


                                        {isOpen && (

                                            <div
                                                style={
                                                    styles.faqAnswer
                                                }
                                            >
                                                {faq.answer}
                                            </div>

                                        )}

                                    </div>
                                );
                            }
                        )}

                    </div>

                </section>


                {/* =================================================
                    QUICK GUIDE
                ================================================= */}

                <section style={styles.guideSection}>

                    <div style={styles.guideHeader}>

                        <div style={styles.sectionEyebrow}>
                            QUICK GUIDE
                        </div>

                        <h2 style={styles.sectionTitle}>
                            Using CryptoTrack
                        </h2>

                        <p style={styles.sectionSubtitle}>
                            A simple overview of the main features.
                        </p>

                    </div>


                    <div style={styles.guideGrid}>

                        <div style={styles.guideCard}>

                            <div style={styles.stepNumber}>
                                01
                            </div>

                            <h3 style={styles.guideTitle}>
                                Explore Markets
                            </h3>

                            <p style={styles.guideText}>
                                Search for cryptocurrencies
                                and view their current market
                                information, price and
                                historical data.
                            </p>

                        </div>


                        <div style={styles.guideCard}>

                            <div style={styles.stepNumber}>
                                02
                            </div>

                            <h3 style={styles.guideTitle}>
                                Manage Your Portfolio
                            </h3>

                            <p style={styles.guideText}>
                                Keep track of your cryptocurrency
                                holdings and portfolio information
                                from the dashboard.
                            </p>

                        </div>


                        <div style={styles.guideCard}>

                            <div style={styles.stepNumber}>
                                03
                            </div>

                            <h3 style={styles.guideTitle}>
                                Create Alerts
                            </h3>

                            <p style={styles.guideText}>
                                Set a target price and condition
                                so that you can monitor important
                                price levels.
                            </p>

                        </div>


                        <div style={styles.guideCard}>

                            <div style={styles.stepNumber}>
                                04
                            </div>

                            <h3 style={styles.guideTitle}>
                                Use AI Analysis
                            </h3>

                            <p style={styles.guideText}>
                                Review structured AI-generated
                                analysis based on available
                                market and historical data.
                            </p>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    SECURITY
                ================================================= */}

                <section style={styles.securitySection}>

                    <div style={styles.securityIcon}>
                        🔐
                    </div>

                    <div style={styles.securityContent}>

                        <div style={styles.sectionEyebrow}>
                            SECURITY & PRIVACY
                        </div>

                        <h2 style={styles.securityTitle}>
                            Keep your account secure
                        </h2>

                        <p style={styles.securityText}>
                            CryptoTrack support will never need
                            your password, JWT token or private
                            API key. Do not share sensitive
                            credentials with anyone claiming
                            to provide support.
                        </p>

                        <div style={styles.securityList}>

                            <div style={styles.securityItem}>

                                <span
                                    style={styles.checkIcon}
                                >
                                    ✓
                                </span>

                                <span>
                                    Never share your password.
                                </span>

                            </div>


                            <div style={styles.securityItem}>

                                <span
                                    style={styles.checkIcon}
                                >
                                    ✓
                                </span>

                                <span>
                                    Never share JWT authentication
                                    tokens.
                                </span>

                            </div>


                            <div style={styles.securityItem}>

                                <span
                                    style={styles.checkIcon}
                                >
                                    ✓
                                </span>

                                <span>
                                    Never expose API keys publicly.
                                </span>

                            </div>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    SUPPORT CTA
                ================================================= */}

                <section style={styles.supportSection}>

                    <div style={styles.supportCard}>

                        <div>

                            <div style={styles.sectionEyebrow}>
                                STILL NEED HELP?
                            </div>

                            <h2 style={styles.supportTitle}>
                                Contact CryptoTrack Support
                            </h2>

                            <p style={styles.supportText}>
                                If you cannot find an answer,
                                send us a description of your
                                issue and our support system
                                will record your request.
                            </p>

                        </div>

                        <button
                            style={styles.supportButton}
                            onClick={openSupportModal}
                        >
                            Contact Support
                        </button>

                    </div>

                </section>

            </main>


            {/* =====================================================
                SUPPORT MODAL
            ===================================================== */}

            {showRequest && (

                <div
                    style={styles.modalOverlay}
                    onClick={closeSupportModal}
                >

                    <div
                        style={styles.modal}
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        {/* MODAL HEADER */}

                        <div style={styles.modalHeader}>

                            <div>

                                <div style={styles.sectionEyebrow}>
                                    CRYPTOTRACK CARE
                                </div>

                                <h2 style={styles.modalTitle}>
                                    Contact Support
                                </h2>

                            </div>

                            <button
                                onClick={closeSupportModal}
                                style={styles.closeButton}
                                disabled={submitting}
                            >
                                ×
                            </button>

                        </div>


                        {/* MODAL BODY */}

                        <div style={styles.modalBody}>

                            <p style={styles.modalText}>
                                Describe your issue clearly
                                so it can be investigated
                                efficiently.
                            </p>


                            {/* EMAIL */}

                            <label style={styles.label}>
                                Registered Email
                            </label>

                            <input
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) =>
                                    setEmail(e.target.value)
                                }
                                style={styles.modalInput}
                            />


                            {/* ISSUE */}

                            <label style={styles.label}>
                                Issue
                            </label>

                            <select
                                value={issue}
                                onChange={(e) =>
                                    setIssue(e.target.value)
                                }
                                style={styles.modalInput}
                            >

                                <option value="">
                                    Select an issue
                                </option>

                                <option value="Login problem">
                                    Login problem
                                </option>

                                <option value="Cryptocurrency data">
                                    Cryptocurrency data
                                </option>

                                <option value="Price alert problem">
                                    Price alert problem
                                </option>

                                <option value="AI analysis problem">
                                    AI analysis problem
                                </option>

                                <option value="Other">
                                    Other
                                </option>

                            </select>


                            {/* DESCRIPTION */}

                            <label style={styles.label}>
                                Description
                            </label>

                            <textarea
                                rows="5"
                                placeholder="Describe your issue..."
                                value={description}
                                onChange={(e) =>
                                    setDescription(
                                        e.target.value
                                    )
                                }
                                style={styles.textarea}
                            />


                            {/* SUBMIT */}

                            <button
                                style={{
                                    ...styles.submitButton,
                                    ...(submitting
                                        ? styles.submitButtonDisabled
                                        : {})
                                }}
                                onClick={
                                    submitSupportRequest
                                }
                                disabled={submitting}
                            >

                                {submitting
                                    ? "Submitting..."
                                    : "Submit Request"}

                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}


/* =============================================================
   STYLES
   ============================================================= */

const styles = {

    page: {
        minHeight: "100vh",
        background:
            "linear-gradient(180deg, #07101d 0%, #091321 50%, #07101d 100%)",
        color: "#ffffff",
        fontFamily:
            "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    },

    container: {
        width: "100%",
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "50px 30px 80px",
        boxSizing: "border-box"
    },

    /* =========================================================
       HERO
       ========================================================= */

    hero: {
        textAlign: "center",
        padding: "65px 20px 55px"
    },

    heroBadge: {
        display: "inline-block",
        padding: "7px 13px",
        borderRadius: "999px",
        background: "rgba(59, 130, 246, 0.10)",
        border:
            "1px solid rgba(59, 130, 246, 0.25)",
        color: "#60a5fa",
        fontSize: "11px",
        fontWeight: "800",
        letterSpacing: "1.5px",
        marginBottom: "18px"
    },

    heroTitle: {
        margin: 0,
        fontSize: "clamp(34px, 5vw, 58px)",
        lineHeight: "1.05",
        fontWeight: "800",
        letterSpacing: "-2px"
    },

    heroSubtitle: {
        maxWidth: "680px",
        margin: "20px auto 30px",
        color: "#94a3b8",
        fontSize: "16px",
        lineHeight: "1.7"
    },

    searchWrapper: {
        maxWidth: "650px",
        height: "58px",
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        background:
            "rgba(15, 23, 42, 0.85)",
        border:
            "1px solid rgba(148, 163, 184, 0.18)",
        borderRadius: "16px",
        boxShadow:
            "0 15px 45px rgba(0,0,0,0.25)",
        padding: "0 16px",
        boxSizing: "border-box"
    },

    searchIcon: {
        fontSize: "18px",
        marginRight: "12px"
    },

    searchInput: {
        flex: 1,
        minWidth: 0,
        border: "none",
        outline: "none",
        background: "transparent",
        color: "#ffffff",
        fontSize: "15px"
    },

    clearSearch: {
        border: "none",
        background: "transparent",
        color: "#64748b",
        fontSize: "24px",
        cursor: "pointer",
        padding: "0 4px"
    },

    /* =========================================================
       QUICK HELP
       ========================================================= */

    quickSection: {
        marginBottom: "70px"
    },

    quickGrid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(4, minmax(0, 1fr))",
        gap: "16px"
    },

    quickCard: {
        padding: "24px",
        borderRadius: "18px",
        background:
            "rgba(15, 23, 42, 0.72)",
        border:
            "1px solid rgba(148, 163, 184, 0.12)"
    },

    quickIcon: {
        width: "42px",
        height: "42px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "12px",
        background:
            "rgba(59, 130, 246, 0.12)",
        color: "#60a5fa",
        fontSize: "20px",
        marginBottom: "18px"
    },

    quickTitle: {
        margin: "0 0 9px",
        fontSize: "16px",
        fontWeight: "700"
    },

    quickText: {
        margin: 0,
        color: "#8492a6",
        fontSize: "13px",
        lineHeight: "1.65"
    },

    /* =========================================================
       SECTION
       ========================================================= */

    sectionHeader: {
        marginBottom: "28px"
    },

    sectionEyebrow: {
        color: "#60a5fa",
        fontSize: "10px",
        fontWeight: "800",
        letterSpacing: "1.5px",
        marginBottom: "8px"
    },

    sectionTitle: {
        margin: 0,
        fontSize: "28px",
        fontWeight: "750",
        letterSpacing: "-0.7px"
    },

    sectionSubtitle: {
        margin: "9px 0 0",
        color: "#8492a6",
        fontSize: "14px",
        lineHeight: "1.6"
    },

    /* =========================================================
       FAQ
       ========================================================= */

    faqSection: {
        marginBottom: "80px"
    },

    faqContainer: {
        borderTop:
            "1px solid rgba(148, 163, 184, 0.12)"
    },

    faqItem: {
        borderBottom:
            "1px solid rgba(148, 163, 184, 0.12)",
        background: "transparent"
    },

    faqItemOpen: {
        background:
            "rgba(15, 23, 42, 0.45)"
    },

    faqQuestion: {
        width: "100%",
        border: "none",
        background: "transparent",
        color: "#f8fafc",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "20px",
        padding: "22px 18px",
        textAlign: "left",
        fontSize: "15px",
        fontWeight: "650",
        cursor: "pointer"
    },

    faqArrow: {
        color: "#64748b",
        fontSize: "10px",
        transition: "transform .2s ease",
        flexShrink: 0
    },

    faqAnswer: {
        padding: "0 50px 22px 18px",
        color: "#94a3b8",
        fontSize: "14px",
        lineHeight: "1.75"
    },

    /* =========================================================
       NO RESULTS
       ========================================================= */

    noResults: {
        padding: "50px 20px",
        textAlign: "center",
        background:
            "rgba(15, 23, 42, 0.55)",
        borderRadius: "16px",
        border:
            "1px solid rgba(148, 163, 184, 0.12)"
    },

    noResultsIcon: {
        width: "42px",
        height: "42px",
        margin: "0 auto 12px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
            "rgba(148, 163, 184, 0.1)",
        color: "#94a3b8",
        fontWeight: "800"
    },

    noResultsTitle: {
        margin: "0 0 6px",
        fontSize: "17px"
    },

    noResultsText: {
        margin: 0,
        color: "#64748b",
        fontSize: "13px"
    },

    /* =========================================================
       GUIDE
       ========================================================= */

    guideSection: {
        marginBottom: "70px"
    },

    guideHeader: {
        marginBottom: "28px"
    },

    guideGrid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(2, minmax(0, 1fr))",
        gap: "16px"
    },

    guideCard: {
        position: "relative",
        padding: "26px",
        borderRadius: "18px",
        background:
            "rgba(15, 23, 42, 0.65)",
        border:
            "1px solid rgba(148, 163, 184, 0.12)"
    },

    stepNumber: {
        color: "#3b82f6",
        fontSize: "12px",
        fontWeight: "800",
        letterSpacing: "1px",
        marginBottom: "20px"
    },

    guideTitle: {
        margin: "0 0 9px",
        fontSize: "17px",
        fontWeight: "700"
    },

    guideText: {
        margin: 0,
        color: "#8492a6",
        fontSize: "13px",
        lineHeight: "1.7"
    },

    /* =========================================================
       SECURITY
       ========================================================= */

    securitySection: {
        display: "flex",
        gap: "24px",
        alignItems: "flex-start",
        padding: "30px",
        marginBottom: "70px",
        borderRadius: "20px",
        background:
            "linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(15, 23, 42, 0.7))",
        border:
            "1px solid rgba(16, 185, 129, 0.16)"
    },

    securityIcon: {
        width: "52px",
        height: "52px",
        borderRadius: "14px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
            "rgba(16, 185, 129, 0.1)",
        fontSize: "22px",
        flexShrink: 0
    },

    securityContent: {
        flex: 1,
        minWidth: 0
    },

    securityTitle: {
        margin: "0 0 10px",
        fontSize: "24px",
        fontWeight: "750"
    },

    securityText: {
        margin: "0 0 20px",
        color: "#94a3b8",
        fontSize: "14px",
        lineHeight: "1.7",
        maxWidth: "800px"
    },

    securityList: {
        display: "flex",
        flexWrap: "wrap",
        gap: "12px 25px"
    },

    securityItem: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        color: "#cbd5e1",
        fontSize: "13px"
    },

    checkIcon: {
        color: "#34d399",
        fontWeight: "800"
    },

    /* =========================================================
       SUPPORT
       ========================================================= */

    supportSection: {
        marginBottom: "20px"
    },

    supportCard: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "30px",
        padding: "32px",
        borderRadius: "20px",
        background:
            "linear-gradient(135deg, rgba(30, 64, 175, 0.22), rgba(15, 23, 42, 0.8))",
        border:
            "1px solid rgba(59, 130, 246, 0.2)"
    },

    supportTitle: {
        margin: "0 0 10px",
        fontSize: "25px",
        fontWeight: "750"
    },

    supportText: {
        maxWidth: "650px",
        margin: 0,
        color: "#94a3b8",
        fontSize: "14px",
        lineHeight: "1.7"
    },

    supportButton: {
        border: "none",
        borderRadius: "12px",
        padding: "13px 20px",
        background: "#2563eb",
        color: "#ffffff",
        fontWeight: "700",
        fontSize: "13px",
        cursor: "pointer",
        whiteSpace: "nowrap"
    },

    /* =========================================================
       MODAL
       ========================================================= */

    modalOverlay: {
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        background:
            "rgba(2, 6, 23, 0.78)",
        backdropFilter: "blur(8px)",
        boxSizing: "border-box"
    },

    modal: {
        width: "100%",
        maxWidth: "580px",
        maxHeight: "90vh",
        overflowY: "auto",
        borderRadius: "20px",
        background: "#0b1423",
        border:
            "1px solid rgba(148, 163, 184, 0.16)",
        boxShadow:
            "0 30px 80px rgba(0,0,0,0.5)"
    },

    modalHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "20px",
        padding: "26px 26px 20px",
        borderBottom:
            "1px solid rgba(148, 163, 184, 0.1)"
    },

    modalTitle: {
        margin: 0,
        fontSize: "24px",
        fontWeight: "750"
    },

    closeButton: {
        width: "34px",
        height: "34px",
        borderRadius: "9px",
        border:
            "1px solid rgba(148, 163, 184, 0.12)",
        background:
            "rgba(148, 163, 184, 0.06)",
        color: "#94a3b8",
        fontSize: "22px",
        cursor: "pointer"
    },

    modalBody: {
        padding: "26px"
    },

    modalText: {
        margin: "0 0 22px",
        color: "#94a3b8",
        fontSize: "14px",
        lineHeight: "1.65"
    },

    label: {
        display: "block",
        marginBottom: "8px",
        color: "#cbd5e1",
        fontSize: "13px",
        fontWeight: "650"
    },

    modalInput: {
        width: "100%",
        height: "45px",
        boxSizing: "border-box",
        marginBottom: "18px",
        padding: "0 13px",
        borderRadius: "10px",
        border:
            "1px solid rgba(148, 163, 184, 0.15)",
        outline: "none",
        background: "#101b2d",
        color: "#ffffff",
        fontSize: "13px"
    },

    textarea: {
        width: "100%",
        boxSizing: "border-box",
        marginBottom: "18px",
        padding: "13px",
        borderRadius: "10px",
        border:
            "1px solid rgba(148, 163, 184, 0.15)",
        outline: "none",
        resize: "vertical",
        background: "#101b2d",
        color: "#ffffff",
        fontSize: "13px",
        fontFamily: "inherit"
    },

    submitButton: {
        width: "100%",
        height: "46px",
        border: "none",
        borderRadius: "10px",
        background: "#2563eb",
        color: "#ffffff",
        fontSize: "13px",
        fontWeight: "700",
        cursor: "pointer"
    },

    submitButtonDisabled: {
        opacity: 0.6,
        cursor: "not-allowed"
    }
};

