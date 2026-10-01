
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:8080";

export default function AIAnalysis() {

    const navigate = useNavigate();

    const [coin, setCoin] = useState("");
    const [analysis, setAnalysis] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");


    // =========================================================
    // ANALYZE CRYPTO
    // =========================================================

    const analyzeCrypto = async () => {

        const trimmedCoin = coin.trim();

        if (!trimmedCoin) {

            setError(
                "Please enter a cryptocurrency name."
            );

            return;
        }


        setLoading(true);
        setError("");
        setAnalysis("");


        const token =
            localStorage.getItem("token");


        try {

            const response =
                await fetch(
                    `${API}/api/ai/analyze`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            ...(token
                                ? {
                                    Authorization:
                                        `Bearer ${token}`,
                                }
                                : {}),
                        },

                        body: JSON.stringify({
                            coinId:
                                trimmedCoin,
                        }),
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data?.error ||
                    `Unable to analyze ${trimmedCoin}.`
                );
            }


            if (!data.analysis) {

                throw new Error(
                    "AI returned an empty analysis."
                );
            }


            setAnalysis(
                data.analysis
            );


        } catch (err) {

            console.error(
                "AI Analysis Error:",
                err
            );


            setError(
                err.message ||
                "Unable to generate AI analysis."
            );


        } finally {

            setLoading(false);
        }
    };


    // =========================================================
    // ENTER KEY
    // =========================================================

    const handleKeyDown = (event) => {

        if (
            event.key === "Enter" &&
            !loading
        ) {

            analyzeCrypto();
        }
    };


    // =========================================================
    // CLEAR
    // =========================================================

    const clearAnalysis = () => {

        setCoin("");
        setAnalysis("");
        setError("");
    };


    // =========================================================
    // FORMAT AI RESPONSE
    // =========================================================

    const formatAnalysis = (text) => {

        if (!text) {
            return null;
        }


        const lines =
            text.split("\n");


        return lines.map(
            (line, index) => {

                const trimmed =
                    line.trim();


                if (!trimmed) {

                    return (
                        <div
                            key={index}
                            style={{
                                height: "8px",
                            }}
                        />
                    );
                }


                // Markdown heading
                if (
                    trimmed.startsWith("### ")
                ) {

                    return (
                        <h3
                            key={index}
                            style={
                                styles.aiHeading
                            }
                        >
                            {
                                trimmed.substring(
                                    4
                                )
                            }
                        </h3>
                    );
                }


                // Numbered heading
                if (
                    /^\d+\.\s/.test(
                        trimmed
                    )
                ) {

                    return (
                        <h3
                            key={index}
                            style={
                                styles.aiHeading
                            }
                        >
                            {trimmed}
                        </h3>
                    );
                }


                // Bullet
                if (
                    trimmed.startsWith("- ") ||
                    trimmed.startsWith("* ")
                ) {

                    return (
                        <div
                            key={index}
                            style={
                                styles.aiBullet
                            }
                        >
                            <span
                                style={
                                    styles.bulletDot
                                }
                            >
                                •
                            </span>

                            <span>
                                {
                                    trimmed.substring(
                                        2
                                    )
                                }
                            </span>
                        </div>
                    );
                }


                // Bold markdown
                const formatted =
                    trimmed.replace(
                        /\*\*(.*?)\*\*/g,
                        "$1"
                    );


                return (
                    <p
                        key={index}
                        style={
                            styles.aiParagraph
                        }
                    >
                        {formatted}
                    </p>
                );
            }
        );
    };


    // =========================================================
    // PAGE
    // =========================================================

    return (

        <div style={styles.page}>

            {/* =================================================
                HEADER
            ================================================= */}

            <header
                style={styles.header}
            >

                <div>

                    <button
                        style={
                            styles.backButton
                        }
                        onClick={() =>
                            navigate(
                                "/dashboard"
                            )
                        }
                    >
                        ← Dashboard
                    </button>


                    <h1
                        style={
                            styles.title
                        }
                    >
                        AI Crypto Analysis
                    </h1>


                    <p
                        style={
                            styles.subtitle
                        }
                    >
                        Get an AI-powered educational
                        analysis of any cryptocurrency.
                    </p>

                </div>

            </header>


            {/* =================================================
                SEARCH CARD
            ================================================= */}

            <section
                style={
                    styles.searchCard
                }
            >

                <div
                    style={
                        styles.searchHeader
                    }
                >

                    <div
                        style={
                            styles.aiIcon
                        }
                    >
                        ✦
                    </div>


                    <div>

                        <h2
                            style={
                                styles.searchTitle
                            }
                        >
                            Analyze a Cryptocurrency
                        </h2>


                        <p
                            style={
                                styles.searchDescription
                            }
                        >
                            Enter a cryptocurrency name
                            and let AI explain its technology,
                            ecosystem, strengths and risks.
                        </p>

                    </div>

                </div>


                {/* INPUT */}

                <div
                    style={
                        styles.inputContainer
                    }
                >

                    <input
                        type="text"
                        value={coin}
                        onChange={(e) =>
                            setCoin(
                                e.target.value
                            )
                        }
                        onKeyDown={
                            handleKeyDown
                        }
                        placeholder="Enter cryptocurrency e.g. Bitcoin, Solana, Ethereum"
                        style={
                            styles.input
                        }
                        disabled={loading}
                    />


                    <button
                        onClick={
                            analyzeCrypto
                        }
                        disabled={
                            loading ||
                            !coin.trim()
                        }
                        style={{
                            ...styles.analyzeButton,

                            opacity:
                                loading ||
                                !coin.trim()
                                    ? 0.55
                                    : 1,

                            cursor:
                                loading ||
                                !coin.trim()
                                    ? "not-allowed"
                                    : "pointer",
                        }}
                    >

                        {loading ? (

                            <>
                                <span
                                    style={
                                        styles.smallSpinner
                                    }
                                />

                                Analyzing...
                            </>

                        ) : (

                            <>
                                ✦ Analyze
                            </>
                        )}

                    </button>

                </div>


                {/* EXAMPLES */}

                <div
                    style={
                        styles.examples
                    }
                >

                    <span
                        style={
                            styles.exampleLabel
                        }
                    >
                        Try:
                    </span>


                    {[
                        "Bitcoin",
                        "Ethereum",
                        "Solana",
                        "Cardano",
                    ].map(
                        (item) => (

                            <button
                                key={item}
                                style={
                                    styles.exampleButton
                                }
                                onClick={() =>
                                    setCoin(
                                        item
                                    )
                                }
                                disabled={
                                    loading
                                }
                            >
                                {item}
                            </button>

                        )
                    )}

                </div>


                {/* ERROR */}

                {error && (

                    <div
                        style={
                            styles.errorBox
                        }
                    >

                        <div
                            style={
                                styles.errorIcon
                            }
                        >
                            !
                        </div>


                        <div>

                            <div
                                style={
                                    styles.errorTitle
                                }
                            >
                                Analysis failed
                            </div>


                            <div
                                style={
                                    styles.errorText
                                }
                            >
                                {error}
                            </div>

                        </div>

                    </div>

                )}

            </section>


            {/* =================================================
                LOADING
            ================================================= */}

            {loading && (

                <section
                    style={
                        styles.loadingCard
                    }
                >

                    <div
                        style={
                            styles.largeSpinner
                        }
                    />

                    <h2
                        style={
                            styles.loadingTitle
                        }
                    >
                        AI is analyzing {coin}
                    </h2>


                    <p
                        style={
                            styles.loadingText
                        }
                    >
                        Generating an educational analysis.
                    </p>

                </section>

            )}


            {/* =================================================
                RESULT
            ================================================= */}

            {analysis &&
                !loading && (

                    <section
                        style={
                            styles.resultCard
                        }
                    >

                        {/* RESULT HEADER */}

                        <div
                            style={
                                styles.resultHeader
                            }
                        >

                            <div>

                                <div
                                    style={
                                        styles.resultLabel
                                    }
                                >
                                    AI ANALYSIS
                                </div>


                                <h2
                                    style={
                                        styles.resultTitle
                                    }
                                >
                                    {coin}
                                </h2>

                            </div>


                            <button
                                style={
                                    styles.clearButton
                                }
                                onClick={
                                    clearAnalysis
                                }
                            >
                                New Analysis
                            </button>

                        </div>


                        {/* DISCLAIMER */}

                        <div
                            style={
                                styles.infoBox
                            }
                        >

                            <span>
                                ⓘ
                            </span>

                            <span>
                                This analysis is
                                educational and does not
                                constitute personalized
                                financial advice.
                            </span>

                        </div>


                        {/* AI CONTENT */}

                        <div
                            style={
                                styles.analysisContent
                            }
                        >
                            {
                                formatAnalysis(
                                    analysis
                                )
                            }
                        </div>

                    </section>

                )}


            {/* =================================================
                EMPTY STATE
            ================================================= */}

            {!analysis &&
                !loading &&
                !error && (

                    <section
                        style={
                            styles.emptyCard
                        }
                    >

                        <div
                            style={
                                styles.emptyIcon
                            }
                        >
                            ✦
                        </div>


                        <h2
                            style={
                                styles.emptyTitle
                            }
                        >
                            Explore Crypto With AI
                        </h2>


                        <p
                            style={
                                styles.emptyText
                            }
                        >
                            Enter a cryptocurrency above
                            to receive an AI-generated
                            educational analysis.
                        </p>

                    </section>

                )}


            {/* =================================================
                FOOTER
            ================================================= */}

            <div
                style={
                    styles.footer
                }
            >
                CryptoTrack AI Analysis
            </div>

        </div>
    );
}


/* ================================================================
   STYLES
================================================================ */

const styles = {

    page: {
        minHeight: "100vh",

        background:
            "linear-gradient(135deg, #07111f 0%, #0b1220 50%, #101827 100%)",

        color: "#e5e7eb",

        padding: "40px",

        boxSizing: "border-box",

        fontFamily:
            "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    },


    header: {
        maxWidth: "1100px",

        margin:
            "0 auto 30px",

        display: "flex",

        justifyContent:
            "space-between",

        alignItems: "flex-end",
    },


    backButton: {
        background: "transparent",

        border: "none",

        color: "#8b9bb4",

        cursor: "pointer",

        padding: 0,

        marginBottom: "14px",

        fontSize: "13px",
    },


    title: {
        margin: 0,

        fontSize: "34px",

        fontWeight: "750",

        letterSpacing: "-1px",

        color: "#ffffff",
    },


    subtitle: {
        margin:
            "8px 0 0",

        color: "#8491a7",

        fontSize: "14px",
    },


    searchCard: {
        maxWidth: "1100px",

        margin: "0 auto 24px",

        padding: "28px",

        background:
            "rgba(17, 27, 43, 0.86)",

        border:
            "1px solid rgba(255,255,255,0.07)",

        borderRadius: "20px",

        boxShadow:
            "0 16px 45px rgba(0,0,0,0.18)",
    },


    searchHeader: {
        display: "flex",

        alignItems: "center",

        gap: "15px",

        marginBottom: "25px",
    },


    aiIcon: {
        width: "48px",

        height: "48px",

        borderRadius: "14px",

        background:
            "linear-gradient(135deg, #6d5dfc, #5145cd)",

        display: "flex",

        alignItems: "center",

        justifyContent: "center",

        fontSize: "23px",

        color: "#ffffff",

        flexShrink: 0,

        boxShadow:
            "0 8px 25px rgba(109,93,252,0.25)",
    },


    searchTitle: {
        margin: 0,

        color: "#ffffff",

        fontSize: "19px",
    },


    searchDescription: {
        margin:
            "5px 0 0",

        color: "#718096",

        fontSize: "13px",

        lineHeight: "1.5",
    },


    inputContainer: {
        display: "flex",

        gap: "10px",
    },


    input: {
        flex: 1,

        minWidth: 0,

        background:
            "rgba(7,17,31,0.75)",

        border:
            "1px solid rgba(255,255,255,0.1)",

        borderRadius: "11px",

        padding:
            "13px 15px",

        color: "#ffffff",

        fontSize: "14px",

        outline: "none",

        boxSizing: "border-box",
    },


    analyzeButton: {
        border: "none",

        background:
            "linear-gradient(135deg, #6d5dfc, #5145cd)",

        color: "#ffffff",

        padding:
            "0 22px",

        borderRadius: "11px",

        fontWeight: "700",

        fontSize: "13px",

        display: "flex",

        alignItems: "center",

        justifyContent: "center",

        gap: "8px",

        minWidth: "130px",

        boxShadow:
            "0 8px 25px rgba(109,93,252,0.2)",
    },


    smallSpinner: {
        width: "14px",

        height: "14px",

        borderRadius: "50%",

        border:
            "2px solid rgba(255,255,255,0.3)",

        borderTop:
            "2px solid #ffffff",

        animation:
            "aiSpin 0.8s linear infinite",
    },


    examples: {
        display: "flex",

        alignItems: "center",

        flexWrap: "wrap",

        gap: "7px",

        marginTop: "15px",
    },


    exampleLabel: {
        color: "#59667a",

        fontSize: "12px",

        marginRight: "3px",
    },


    exampleButton: {
        background:
            "rgba(109,93,252,0.08)",

        border:
            "1px solid rgba(109,93,252,0.2)",

        color: "#aaa1ff",

        padding:
            "6px 11px",

        borderRadius: "7px",

        cursor: "pointer",

        fontSize: "11px",

        fontWeight: "600",
    },


    errorBox: {
        marginTop: "18px",

        display: "flex",

        alignItems: "flex-start",

        gap: "12px",

        padding: "14px",

        borderRadius: "10px",

        background:
            "rgba(251,113,133,0.07)",

        border:
            "1px solid rgba(251,113,133,0.18)",
    },


    errorIcon: {
        width: "25px",

        height: "25px",

        borderRadius: "50%",

        background:
            "rgba(251,113,133,0.15)",

        color: "#fb7185",

        display: "flex",

        alignItems: "center",

        justifyContent: "center",

        fontWeight: "800",

        flexShrink: 0,
    },


    errorTitle: {
        color: "#fb7185",

        fontSize: "13px",

        fontWeight: "700",

        marginBottom: "3px",
    },


    errorText: {
        color: "#a87b86",

        fontSize: "12px",

        lineHeight: "1.5",
    },


    loadingCard: {
        maxWidth: "1100px",

        margin: "0 auto",

        minHeight: "250px",

        background:
            "rgba(17,27,43,0.86)",

        border:
            "1px solid rgba(255,255,255,0.07)",

        borderRadius: "20px",

        display: "flex",

        flexDirection: "column",

        alignItems: "center",

        justifyContent: "center",

        textAlign: "center",
    },


    largeSpinner: {
        width: "42px",

        height: "42px",

        borderRadius: "50%",

        border:
            "3px solid rgba(255,255,255,0.08)",

        borderTop:
            "3px solid #7c6cff",

        animation:
            "aiSpin 0.8s linear infinite",
    },


    loadingTitle: {
        color: "#ffffff",

        fontSize: "18px",

        margin:
            "18px 0 5px",
    },


    loadingText: {
        color: "#718096",

        fontSize: "13px",

        margin: 0,
    },


    resultCard: {
        maxWidth: "1100px",

        margin: "0 auto",

        background:
            "rgba(17,27,43,0.86)",

        border:
            "1px solid rgba(255,255,255,0.07)",

        borderRadius: "20px",

        overflow: "hidden",

        boxShadow:
            "0 16px 45px rgba(0,0,0,0.18)",
    },


    resultHeader: {
        padding:
            "24px 28px",

        display: "flex",

        alignItems: "center",

        justifyContent: "space-between",

        borderBottom:
            "1px solid rgba(255,255,255,0.06)",
    },


    resultLabel: {
        color: "#8175ff",

        fontSize: "10px",

        fontWeight: "800",

        letterSpacing: "1.2px",

        marginBottom: "5px",
    },


    resultTitle: {
        margin: 0,

        color: "#ffffff",

        fontSize: "25px",
    },


    clearButton: {
        background:
            "rgba(255,255,255,0.04)",

        border:
            "1px solid rgba(255,255,255,0.08)",

        color: "#aab4c5",

        padding:
            "9px 14px",

        borderRadius: "9px",

        cursor: "pointer",

        fontSize: "12px",

        fontWeight: "600",
    },


    infoBox: {
        margin:
            "20px 28px",

        padding:
            "12px 14px",

        display: "flex",

        alignItems: "center",

        gap: "9px",

        background:
            "rgba(109,93,252,0.06)",

        border:
            "1px solid rgba(109,93,252,0.12)",

        borderRadius: "9px",

        color: "#8175a8",

        fontSize: "11px",

        lineHeight: "1.5",
    },


    analysisContent: {
        padding:
            "5px 28px 35px",

        color: "#b9c2d0",

        fontSize: "14px",

        lineHeight: "1.75",
    },


    aiHeading: {
        color: "#ffffff",

        fontSize: "17px",

        fontWeight: "700",

        margin:
            "24px 0 9px",

        paddingBottom: "7px",

        borderBottom:
            "1px solid rgba(255,255,255,0.06)",
    },


    aiParagraph: {
        margin:
            "8px 0",

        color: "#aeb8c8",

        lineHeight: "1.75",
    },


    aiBullet: {
        display: "flex",

        gap: "9px",

        margin:
            "7px 0",

        paddingLeft: "5px",

        color: "#aeb8c8",

        lineHeight: "1.65",
    },


    bulletDot: {
        color: "#8175ff",

        fontWeight: "900",
    },


    emptyCard: {
        maxWidth: "1100px",

        margin: "0 auto",

        minHeight: "300px",

        background:
            "rgba(17,27,43,0.7)",

        border:
            "1px solid rgba(255,255,255,0.06)",

        borderRadius: "20px",

        display: "flex",

        flexDirection: "column",

        alignItems: "center",

        justifyContent: "center",

        textAlign: "center",

        padding: "30px",

        boxSizing: "border-box",
    },


    emptyIcon: {
        width: "62px",

        height: "62px",

        borderRadius: "19px",

        background:
            "rgba(109,93,252,0.1)",

        color: "#9186ff",

        display: "flex",

        alignItems: "center",

        justifyContent: "center",

        fontSize: "27px",

        marginBottom: "17px",
    },


    emptyTitle: {
        margin: 0,

        color: "#ffffff",

        fontSize: "20px",
    },


    emptyText: {
        maxWidth: "450px",

        color: "#718096",

        fontSize: "13px",

        lineHeight: "1.6",

        margin:
            "8px 0 0",
    },


    footer: {
        maxWidth: "1100px",

        margin:
            "18px auto 0",

        color: "#4f5c70",

        fontSize: "10px",

        textAlign: "center",
    },
};
