import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "https://cryptotrack-backend-mgou.onrender.com/api";

export default function Dashboard() {
    const navigate = useNavigate();

    const [crypto, setCrypto] = useState(null);
    const [history, setHistory] = useState([]);

    const [loading, setLoading] = useState(true);
    const [historyLoading, setHistoryLoading] = useState(false);

    const [error, setError] = useState("");
    const [historyError, setHistoryError] = useState("");

    const [selectedCoin, setSelectedCoin] = useState("bitcoin");
    const [days, setDays] = useState(7);

    const [search, setSearch] = useState("");
    const [searchResults, setSearchResults] = useState([]);

    // =====================================================
    // LOAD CRYPTO PRICE
    // =====================================================

    useEffect(() => {
        loadCrypto();
    }, [selectedCoin]);

    const loadCrypto = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `${API}/crypto/${selectedCoin}`
            );

            if (!response.ok) {
                throw new Error(
                    "Failed to fetch cryptocurrency"
                );
            }

            const data = await response.json();

            setCrypto(data);

        } catch (err) {
            console.error(
                "Crypto loading error:",
                err
            );

            setCrypto(null);

            setError(
                "Unable to load cryptocurrency data. Make sure the backend is running."
            );
        } finally {
            setLoading(false);
        }
    };


    // =====================================================
    // LOAD HISTORY
    // =====================================================

    useEffect(() => {
        loadHistory();
    }, [selectedCoin, days]);

    const loadHistory = async () => {
        try {
            setHistoryLoading(true);
            setHistoryError("");

            const response = await fetch(
                `${API}/crypto/${selectedCoin}/history?days=${days}`
            );

            if (!response.ok) {

                let message =
                    "Historical data is temporarily unavailable.";

                try {
                    const errorData =
                        await response.json();

                    if (errorData?.message) {
                        message = errorData.message;
                    }
                } catch {
                    // Ignore invalid error JSON
                }

                throw new Error(message);
            }

            const data = await response.json();

            if (!Array.isArray(data)) {
                throw new Error(
                    "Invalid historical data received."
                );
            }

            setHistory(data);

        } catch (err) {

            console.error(
                "History loading error:",
                err
            );

            setHistory([]);

            /*
             * IMPORTANT:
             * History failure does NOT affect
             * the rest of the dashboard.
             */

            if (
                err.message?.includes("429") ||
                err.message?.toLowerCase().includes("rate")
            ) {
                setHistoryError(
                    "CoinGecko rate limit reached. The price chart will be available again after the API limit resets."
                );
            } else {
                setHistoryError(
                    "Historical price data is temporarily unavailable."
                );
            }

        } finally {
            setHistoryLoading(false);
        }
    };


    // =====================================================
    // SEARCH
    // =====================================================

    const handleSearch = async (value) => {

        setSearch(value);

        if (!value.trim()) {
            setSearchResults([]);
            return;
        }

        try {

            const response = await fetch(
                `${API}/crypto/search?query=${encodeURIComponent(
                    value
                )}`
            );

            if (!response.ok) {
                setSearchResults([]);
                return;
            }

            const data = await response.json();

            setSearchResults(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (err) {

            console.error(
                "Search error:",
                err
            );

            setSearchResults([]);
        }
    };


    // =====================================================
    // SELECT COIN
    // =====================================================

    const selectCoin = (coin) => {

        setSelectedCoin(coin.id);

        setSearch("");

        setSearchResults([]);

        setHistory([]);

        setHistoryError("");
    };


    // =====================================================
    // FORMAT PRICE
    // =====================================================

    const formatPrice = (price) => {

        if (
            price === null ||
            price === undefined ||
            Number.isNaN(Number(price))
        ) {
            return "--";
        }

        return new Intl.NumberFormat(
            "en-US",
            {
                style: "currency",
                currency: "USD",
                maximumFractionDigits:
                    price < 1
                        ? 6
                        : 2,
            }
        ).format(price);
    };


    // =====================================================
    // FORMAT LARGE NUMBER
    // =====================================================

    const formatLargeNumber = (value) => {

        if (
            value === null ||
            value === undefined
        ) {
            return "--";
        }

        if (value >= 1e12) {
            return `$${(
                value / 1e12
            ).toFixed(2)}T`;
        }

        if (value >= 1e9) {
            return `$${(
                value / 1e9
            ).toFixed(2)}B`;
        }

        if (value >= 1e6) {
            return `$${(
                value / 1e6
            ).toFixed(2)}M`;
        }

        return formatPrice(value);
    };


    // =====================================================
    // CHANGE CLASS
    // =====================================================

    const getChangeClass = (value) => {

        if (value > 0) {
            return "positive";
        }

        if (value < 0) {
            return "negative";
        }

        return "";
    };


    // =====================================================
    // CHART DATA
    // =====================================================

    const chartData = useMemo(() => {

        if (
            !Array.isArray(history) ||
            history.length < 2
        ) {
            return null;
        }

        const validHistory =
            history.filter(
                (item) =>
                    item &&
                    typeof item.price ===
                        "number" &&
                    Number.isFinite(
                        item.price
                    )
            );

        if (validHistory.length < 2) {
            return null;
        }

        const width = 900;
        const height = 280;

        const paddingTop = 20;
        const paddingBottom = 25;

        const values =
            validHistory.map(
                (item) => item.price
            );

        const min = Math.min(...values);
        const max = Math.max(...values);

        const range =
            max - min || 1;

        const points =
            validHistory
                .map((item, index) => {

                    const x =
                        (index /
                            Math.max(
                                validHistory.length -
                                    1,
                                1
                            )) *
                        width;

                    const y =
                        height -
                        paddingBottom -
                        ((item.price - min) /
                            range) *
                            (
                                height -
                                paddingTop -
                                paddingBottom
                            );

                    return {
                        x,
                        y,
                        price: item.price,
                        date: item.date,
                    };
                });

        const line =
            points
                .map(
                    (point) =>
                        `${point.x},${point.y}`
                )
                .join(" ");

        const area =
            `0,${height} ` +
            points
                .map(
                    (point) =>
                        `${point.x},${point.y}`
                )
                .join(" ") +
            ` ${width},${height}`;

        return {
            points,
            line,
            area,
            min,
            max,
        };

    }, [history]);


    // =====================================================
    // COIN INITIAL
    // =====================================================

    const getCoinInitial = () => {

        if (crypto?.symbol) {

            return crypto.symbol
                .charAt(0)
                .toUpperCase();
        }

        if (crypto?.name) {

            return crypto.name
                .charAt(0)
                .toUpperCase();
        }

        return "₿";
    };


    // =====================================================
    // LOADING SCREEN
    // =====================================================

    if (loading) {

        return (
            <div style={styles.page}>

                <div
                    style={
                        styles.loadingContainer
                    }
                >

                    <div
                        style={
                            styles.spinner
                        }
                    ></div>

                    <h2
                        style={
                            styles.loadingTitle
                        }
                    >
                        Loading CryptoTrack
                    </h2>

                    <p
                        style={
                            styles.loadingText
                        }
                    >
                        Fetching live cryptocurrency
                        data...
                    </p>

                </div>

            </div>
        );
    }


    // =====================================================
    // MAIN
    // =====================================================

    return (
        <div style={styles.page}>

            {/* =================================================
                HEADER
            ================================================= */}

            <header style={styles.header}>

                <div
                    style={styles.logo}
                    onClick={() =>
                        navigate("/dashboard")
                    }
                >

                    <div style={styles.logoIcon}>
                        ₿
                    </div>

                    <div>

                        <div
                            style={
                                styles.logoTitle
                            }
                        >
                            CryptoTrack
                        </div>

                        <div
                            style={
                                styles.logoSubtitle
                            }
                        >
                            SMART CRYPTO INTELLIGENCE
                        </div>

                    </div>

                </div>


                <nav style={styles.nav}>

                    <button
                        style={
                            styles.navActive
                        }
                        onClick={() =>
                            navigate(
                                "/dashboard"
                            )
                        }
                    >
                        Dashboard
                    </button>

                    <button
                        style={
                            styles.navButton
                        }
                        onClick={() =>
                            navigate("/markets")
                        }
                    >
                        Markets
                    </button>

                    <button
                        style={
                            styles.navButton
                        }
                        onClick={() =>
                            navigate(
                                "/portfolio"
                            )
                        }
                    >
                        Portfolio
                    </button>

                    <button
                        style={
                            styles.navButton
                        }
                        onClick={() =>
                            navigate("/alerts")
                        }
                    >
                        Alerts
                    </button>

                    <button
                        style={
                            styles.navButton
                        }
                        onClick={() =>
                            navigate(
                                "/ai-analysis"
                            )
                        }
                    >
                        AI Analysis
                    </button>

                    <button
                        style={
                            styles.navButton
                        }
                        onClick={() =>
                            navigate("/help")
                        }
                    >
                        Help
                    </button>

                </nav>


                <button
                    style={
                        styles.logoutButton
                    }
                    onClick={() => {

                        localStorage.removeItem(
                            "token"
                        );

                        localStorage.removeItem(
                            "user"
                        );

                        navigate("/login");
                    }}
                >
                    Logout
                </button>

            </header>


            {/* =================================================
                MAIN
            ================================================= */}

            <main style={styles.main}>

                {/* HERO */}

                <section style={styles.hero}>

                    <div>

                        <p
                            style={
                                styles.eyebrow
                            }
                        >
                            MARKET OVERVIEW
                        </p>

                        <h1
                            style={
                                styles.heroTitle
                            }
                        >
                            Good afternoon.
                            <br />
                            Stay ahead of the market.
                        </h1>

                        <p
                            style={
                                styles.heroText
                            }
                        >
                            Track cryptocurrency
                            prices, market trends
                            and portfolio performance
                            from one place.
                        </p>

                    </div>


                    {/* SEARCH */}

                    <div
                        style={
                            styles.searchContainer
                        }
                    >

                        <input
                            value={search}
                            onChange={(e) =>
                                handleSearch(
                                    e.target.value
                                )
                            }
                            placeholder="Search cryptocurrency..."
                            style={
                                styles.searchInput
                            }
                        />


                        {searchResults.length >
                            0 && (

                            <div
                                style={
                                    styles.searchResults
                                }
                            >

                                {searchResults.map(
                                    (coin) => (

                                    <div
                                        key={
                                            coin.id
                                        }
                                        style={
                                            styles.searchResult
                                        }
                                        onClick={() =>
                                            selectCoin(
                                                coin
                                            )
                                        }
                                    >

                                        {coin.thumb && (

                                            <img
                                                src={
                                                    coin.thumb
                                                }
                                                alt=""
                                                style={
                                                    styles.coinImage
                                                }
                                            />

                                        )}


                                        <div>

                                            <strong>
                                                {
                                                    coin.name
                                                }
                                            </strong>

                                            <span
                                                style={
                                                    styles.searchSymbol
                                                }
                                            >
                                                {coin.symbol?.toUpperCase()}
                                            </span>

                                        </div>

                                    </div>

                                ))}

                            </div>

                        )}

                    </div>

                </section>


                {/* ERROR */}

                {error && (

                    <div
                        style={
                            styles.errorBox
                        }
                    >
                        {error}
                    </div>

                )}


                {/* =================================================
                    COIN HEADER
                ================================================= */}

                {crypto && (

                    <section
                        style={
                            styles.coinHeader
                        }
                    >

                        <div
                            style={
                                styles.coinIdentity
                            }
                        >

                            <div
                                style={
                                    styles.bigCoinIcon
                                }
                            >
                                {getCoinInitial()}
                            </div>

                            <div>

                                <div
                                    style={
                                        styles.coinName
                                    }
                                >
                                    {
                                        crypto.name
                                    }
                                </div>

                                <div
                                    style={
                                        styles.coinSymbol
                                    }
                                >
                                    {
                                        crypto.symbol
                                    }
                                </div>

                            </div>

                        </div>


                        <div
                            style={
                                styles.priceBlock
                            }
                        >

                            <div
                                style={
                                    styles.currentPrice
                                }
                            >
                                {formatPrice(
                                    crypto.price
                                )}
                            </div>

                            <div
                                className={
                                    getChangeClass(
                                        crypto.change24h
                                    )
                                }
                                style={
                                    styles.change
                                }
                            >

                                {crypto.change24h >
                                0
                                    ? "+"
                                    : ""}

                                {crypto.change24h !==
                                null &&
                                crypto.change24h !==
                                    undefined
                                    ? crypto.change24h.toFixed(
                                          2
                                      )
                                    : "--"}

                                %

                                <span
                                    style={
                                        styles.changeLabel
                                    }
                                >
                                    {" "}
                                    24h
                                </span>

                            </div>

                        </div>

                    </section>

                )}


                {/* =================================================
                    STAT CARDS
                ================================================= */}

                {crypto && (

                    <section
                        style={
                            styles.statsGrid
                        }
                    >

                        <div
                            style={
                                styles.card
                            }
                        >

                            <div
                                style={
                                    styles.cardLabel
                                }
                            >
                                CURRENT PRICE
                            </div>

                            <div
                                style={
                                    styles.cardValue
                                }
                            >
                                {formatPrice(
                                    crypto.price
                                )}
                            </div>

                            <div
                                style={
                                    styles.cardSmall
                                }
                            >
                                Live market price
                            </div>

                        </div>


                        <div
                            style={
                                styles.card
                            }
                        >

                            <div
                                style={
                                    styles.cardLabel
                                }
                            >
                                MARKET CAP
                            </div>

                            <div
                                style={
                                    styles.cardValue
                                }
                            >
                                {formatLargeNumber(
                                    crypto.marketCap
                                )}
                            </div>

                            <div
                                style={
                                    styles.cardSmall
                                }
                            >
                                Current valuation
                            </div>

                        </div>


                        <div
                            style={
                                styles.card
                            }
                        >

                            <div
                                style={
                                    styles.cardLabel
                                }
                            >
                                24H CHANGE
                            </div>

                            <div
                                className={
                                    getChangeClass(
                                        crypto.change24h
                                    )
                                }
                                style={
                                    styles.cardValue
                                }
                            >

                                {crypto.change24h >
                                0
                                    ? "+"
                                    : ""}

                                {crypto.change24h !==
                                null &&
                                crypto.change24h !==
                                    undefined
                                    ? crypto.change24h.toFixed(
                                          2
                                      )
                                    : "--"}

                                %

                            </div>

                            <div
                                style={
                                    styles.cardSmall
                                }
                            >
                                Last 24 hours
                            </div>

                        </div>


                        <div
                            style={
                                styles.card
                            }
                        >

                            <div
                                style={
                                    styles.cardLabel
                                }
                            >
                                TIMEFRAME
                            </div>

                            <div
                                style={
                                    styles.cardValue
                                }
                            >
                                {days === 1
                                    ? "24H"
                                    : days ===
                                      365
                                    ? "1Y"
                                    : `${days}D`}
                            </div>

                            <div
                                style={
                                    styles.cardSmall
                                }
                            >
                                Chart period
                            </div>

                        </div>

                    </section>

                )}


                {/* =================================================
                    PRICE CHART
                ================================================= */}

                <section
                    style={
                        styles.chartCard
                    }
                >

                    <div
                        style={
                            styles.chartHeader
                        }
                    >

                        <div>

                            <div
                                style={
                                    styles.sectionTitle
                                }
                            >
                                Price Performance
                            </div>

                            <div
                                style={
                                    styles.sectionSubtitle
                                }
                            >
                                Historical price movement
                            </div>

                        </div>


                        <div
                            style={
                                styles.timeButtons
                            }
                        >

                            {[1, 7, 30, 365].map(
                                (value) => (

                                <button
                                    key={value}
                                    onClick={() =>
                                        setDays(
                                            value
                                        )
                                    }
                                    style={
                                        days ===
                                        value
                                            ? styles.timeActive
                                            : styles.timeButton
                                    }
                                >

                                    {value === 1
                                        ? "24H"
                                        : value ===
                                          365
                                        ? "1Y"
                                        : `${value}D`}

                                </button>

                            ))}

                        </div>

                    </div>


                    {/* CHART */}

                    <div
                        style={
                            styles.chartContainer
                        }
                    >

                        {historyLoading ? (

                            <div
                                style={
                                    styles.chartMessage
                                }
                            >

                                <div
                                    style={
                                        styles.smallSpinner
                                    }
                                ></div>

                                <span>
                                    Loading price history...
                                </span>

                            </div>

                        ) : chartData ? (

                            <div
                                style={
                                    styles.chartWrapper
                                }
                            >

                                <svg
                                    viewBox="0 0 900 280"
                                    preserveAspectRatio="none"
                                    style={
                                        styles.chart
                                    }
                                >

                                    <defs>

                                        <linearGradient
                                            id="chartGradient"
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="1"
                                        >

                                            <stop
                                                offset="0%"
                                                stopColor="#6d5dfc"
                                                stopOpacity="0.35"
                                            />

                                            <stop
                                                offset="100%"
                                                stopColor="#6d5dfc"
                                                stopOpacity="0"
                                            />

                                        </linearGradient>

                                    </defs>


                                    {/* GRID */}

                                    <line
                                        x1="0"
                                        y1="60"
                                        x2="900"
                                        y2="60"
                                        stroke="rgba(255,255,255,0.06)"
                                        strokeWidth="1"
                                    />

                                    <line
                                        x1="0"
                                        y1="140"
                                        x2="900"
                                        y2="140"
                                        stroke="rgba(255,255,255,0.06)"
                                        strokeWidth="1"
                                    />

                                    <line
                                        x1="0"
                                        y1="220"
                                        x2="900"
                                        y2="220"
                                        stroke="rgba(255,255,255,0.06)"
                                        strokeWidth="1"
                                    />


                                    {/* AREA */}

                                    <polygon
                                        points={
                                            chartData.area
                                        }
                                        fill="url(#chartGradient)"
                                    />


                                    {/* LINE */}

                                    <polyline
                                        points={
                                            chartData.line
                                        }
                                        fill="none"
                                        stroke="#8b7cff"
                                        strokeWidth="4"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />

                                </svg>


                                <div
                                    style={
                                        styles.chartLabels
                                    }
                                >

                                    <span>
                                        {formatPrice(
                                            chartData.max
                                        )}
                                    </span>

                                    <span>
                                        {formatPrice(
                                            chartData.min
                                        )}
                                    </span>

                                </div>

                            </div>

                        ) : (

                            <div
                                style={
                                    styles.noData
                                }
                            >

                                <div>

                                    <div
                                        style={
                                            styles.noDataIcon
                                        }
                                    >
                                        ◌
                                    </div>

                                    <div
                                        style={
                                            styles.noDataTitle
                                        }
                                    >
                                        Historical chart unavailable
                                    </div>

                                    <div
                                        style={
                                            styles.noDataText
                                        }
                                    >
                                        {historyError ||
                                            "No historical price data is currently available."}
                                    </div>

                                    <button
                                        style={
                                            styles.retryButton
                                        }
                                        onClick={
                                            loadHistory
                                        }
                                    >
                                        Try Again
                                    </button>

                                </div>

                            </div>

                        )}

                    </div>

                </section>


                {/* =================================================
                    QUICK ACTIONS
                ================================================= */}

                <section
                    style={
                        styles.actionsSection
                    }
                >

                    <div
                        style={
                            styles.sectionTitle
                        }
                    >
                        Quick Actions
                    </div>

                    <div
                        style={
                            styles.actionsGrid
                        }
                    >

                        <button
                            style={
                                styles.actionCard
                            }
                            onClick={() =>
                                navigate(
                                    "/markets"
                                )
                            }
                        >

                            <span
                                style={
                                    styles.actionIcon
                                }
                            >
                                ◈
                            </span>

                            <span>
                                Explore Markets
                            </span>

                        </button>


                        <button
                            style={
                                styles.actionCard
                            }
                            onClick={() =>
                                navigate(
                                    "/portfolio"
                                )
                            }
                        >

                            <span
                                style={
                                    styles.actionIcon
                                }
                            >
                                ◫
                            </span>

                            <span>
                                Manage Portfolio
                            </span>

                        </button>


                        <button
                            style={
                                styles.actionCard
                            }
                            onClick={() =>
                                navigate(
                                    "/ai-analysis"
                                )
                            }
                        >

                            <span
                                style={
                                    styles.actionIcon
                                }
                            >
                                ✦
                            </span>

                            <span>
                                AI Analysis
                            </span>

                        </button>


                        <button
                            style={
                                styles.actionCard
                            }
                            onClick={() =>
                                navigate(
                                    "/alerts"
                                )
                            }
                        >

                            <span
                                style={
                                    styles.actionIcon
                                }
                            >
                                ◉
                            </span>

                            <span>
                                Price Alerts
                            </span>

                        </button>

                    </div>

                </section>

            </main>


            {/* =================================================
                FOOTER
            ================================================= */}

            <footer
                style={
                    styles.footer
                }
            >

                <div>
                    © 2026 CryptoTrack
                </div>

                <div
                    style={
                        styles.footerLinks
                    }
                >

                    <button
                        onClick={() =>
                            navigate("/help")
                        }
                        style={
                            styles.footerButton
                        }
                    >
                        Help Center
                    </button>

                    <button
                        onClick={() =>
                            navigate("/contact")
                        }
                        style={
                            styles.footerButton
                        }
                    >
                        Contact
                    </button>

                </div>

            </footer>

        </div>
    );
}


// =============================================================
// STYLES
// =============================================================

const styles = {

    page: {
        minHeight: "100vh",
        background:
            "linear-gradient(135deg,#070b16 0%,#0b1120 55%,#10162a 100%)",
        color: "#ffffff",
        fontFamily:
            "Inter, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
    },


    header: {
        height: "72px",
        display: "flex",
        alignItems: "center",
        padding: "0 32px",
        borderBottom:
            "1px solid rgba(255,255,255,0.07)",
        background:
            "rgba(7,11,22,0.92)",
        backdropFilter: "blur(18px)",
        position: "sticky",
        top: 0,
        zIndex: 100,
    },


    logo: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        cursor: "pointer",
        minWidth: "210px",
    },


    logoIcon: {
        width: "38px",
        height: "38px",
        borderRadius: "11px",
        background:
            "linear-gradient(135deg,#7c6cff,#5146e5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "21px",
        fontWeight: "800",
    },


    logoTitle: {
        fontSize: "18px",
        fontWeight: "750",
    },


    logoSubtitle: {
        fontSize: "8px",
        letterSpacing: "1.4px",
        color: "#68748c",
        marginTop: "2px",
    },


    nav: {
        display: "flex",
        alignItems: "center",
        gap: "3px",
        flex: 1,
        justifyContent: "center",
    },


    navButton: {
        border: "none",
        background: "transparent",
        color: "#8f9bb2",
        padding: "9px 12px",
        borderRadius: "9px",
        cursor: "pointer",
        fontSize: "13px",
        fontWeight: "500",
    },


    navActive: {
        border: "none",
        background:
            "rgba(109,93,252,0.16)",
        color: "#ffffff",
        padding: "9px 12px",
        borderRadius: "9px",
        cursor: "pointer",
        fontSize: "13px",
        fontWeight: "600",
    },


    logoutButton: {
        border:
            "1px solid rgba(255,255,255,0.1)",
        background:
            "rgba(255,255,255,0.04)",
        color: "#cbd5e1",
        padding: "9px 17px",
        borderRadius: "9px",
        cursor: "pointer",
        fontSize: "13px",
        fontWeight: "600",
    },


    main: {
        width:
            "min(1180px, calc(100% - 48px))",
        margin: "0 auto",
        padding: "52px 0 80px",
    },


    hero: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        gap: "40px",
        marginBottom: "42px",
    },


    eyebrow: {
        color: "#8b7cff",
        fontSize: "11px",
        letterSpacing: "2px",
        fontWeight: "700",
        margin: "0 0 12px",
    },


    heroTitle: {
        fontSize: "42px",
        lineHeight: "1.12",
        letterSpacing: "-1.5px",
        margin: 0,
        fontWeight: "750",
    },


    heroText: {
        color: "#7f8aa3",
        fontSize: "15px",
        lineHeight: "1.7",
        maxWidth: "560px",
        marginTop: "18px",
    },


    searchContainer: {
        position: "relative",
        width: "320px",
    },


    searchInput: {
        width: "100%",
        boxSizing: "border-box",
        padding: "14px 17px",
        borderRadius: "12px",
        border:
            "1px solid rgba(255,255,255,0.1)",
        background:
            "rgba(255,255,255,0.045)",
        color: "#ffffff",
        outline: "none",
        fontSize: "14px",
    },


    searchResults: {
        position: "absolute",
        top: "52px",
        left: 0,
        right: 0,
        maxHeight: "360px",
        overflowY: "auto",
        background: "#111827",
        border:
            "1px solid rgba(255,255,255,0.1)",
        borderRadius: "12px",
        overflow: "hidden",
        zIndex: 50,
    },


    searchResult: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "12px 14px",
        cursor: "pointer",
        borderBottom:
            "1px solid rgba(255,255,255,0.05)",
    },


    coinImage: {
        width: "30px",
        height: "30px",
        borderRadius: "50%",
    },


    searchSymbol: {
        display: "block",
        color: "#748097",
        fontSize: "11px",
        marginTop: "2px",
    },


    errorBox: {
        padding: "16px 18px",
        marginBottom: "24px",
        background:
            "rgba(239,68,68,0.08)",
        border:
            "1px solid rgba(239,68,68,0.2)",
        color: "#fca5a5",
        borderRadius: "12px",
    },


    coinHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "28px",
        background:
            "rgba(255,255,255,0.035)",
        border:
            "1px solid rgba(255,255,255,0.07)",
        borderRadius: "18px",
        marginBottom: "18px",
    },


    coinIdentity: {
        display: "flex",
        alignItems: "center",
        gap: "15px",
    },


    bigCoinIcon: {
        width: "56px",
        height: "56px",
        borderRadius: "50%",
        background:
            "linear-gradient(135deg,#7c6cff,#5146e5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "25px",
        fontWeight: "800",
    },


    coinName: {
        fontSize: "23px",
        fontWeight: "700",
    },


    coinSymbol: {
        color: "#758198",
        fontSize: "12px",
        marginTop: "4px",
    },


    priceBlock: {
        textAlign: "right",
    },


    currentPrice: {
        fontSize: "31px",
        fontWeight: "750",
    },


    change: {
        marginTop: "5px",
        fontSize: "14px",
        fontWeight: "650",
    },


    changeLabel: {
        color: "#68748c",
        fontWeight: "400",
    },


    positive: {
        color: "#34d399",
    },


    negative: {
        color: "#f87171",
    },


    statsGrid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(4, 1fr)",
        gap: "16px",
        marginBottom: "18px",
    },


    card: {
        padding: "23px",
        borderRadius: "16px",
        background:
            "rgba(255,255,255,0.035)",
        border:
            "1px solid rgba(255,255,255,0.07)",
    },


    cardLabel: {
        color: "#68748c",
        fontSize: "10px",
        letterSpacing: "1.2px",
        fontWeight: "700",
    },


    cardValue: {
        marginTop: "12px",
        fontSize: "23px",
        fontWeight: "700",
    },


    cardSmall: {
        color: "#66728a",
        fontSize: "11px",
        marginTop: "7px",
    },


    chartCard: {
        background:
            "rgba(255,255,255,0.035)",
        border:
            "1px solid rgba(255,255,255,0.07)",
        borderRadius: "18px",
        padding: "26px",
        marginBottom: "28px",
    },


    chartHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "25px",
    },


    sectionTitle: {
        fontSize: "18px",
        fontWeight: "700",
    },


    sectionSubtitle: {
        color: "#68748c",
        fontSize: "12px",
        marginTop: "5px",
    },


    timeButtons: {
        display: "flex",
        gap: "5px",
    },


    timeButton: {
        border: "none",
        background:
            "rgba(255,255,255,0.045)",
        color: "#8d99ae",
        padding: "8px 12px",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "11px",
        fontWeight: "600",
    },


    timeActive: {
        border: "none",
        background: "#6658e8",
        color: "#ffffff",
        padding: "8px 12px",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "11px",
        fontWeight: "600",
    },


    chartContainer: {
        height: "280px",
        width: "100%",
        overflow: "hidden",
        position: "relative",
    },


    chartWrapper: {
        width: "100%",
        height: "100%",
        position: "relative",
    },


    chart: {
        width: "100%",
        height: "100%",
        overflow: "visible",
    },


    chartLabels: {
        position: "absolute",
        right: "5px",
        top: "10px",
        bottom: "20px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        color: "#68748c",
        fontSize: "10px",
        pointerEvents: "none",
    },


    chartMessage: {
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        color: "#78859c",
        fontSize: "13px",
    },


    smallSpinner: {
        width: "17px",
        height: "17px",
        border:
            "2px solid rgba(255,255,255,0.12)",
        borderTop:
            "2px solid #7567ff",
        borderRadius: "50%",
        animation:
            "spin 1s linear infinite",
    },


    noData: {
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        color: "#657189",
    },


    noDataIcon: {
        fontSize: "30px",
        color: "#7567ff",
        marginBottom: "10px",
    },


    noDataTitle: {
        color: "#c7cfdd",
        fontSize: "14px",
        fontWeight: "650",
    },


    noDataText: {
        maxWidth: "480px",
        margin:
            "7px auto 14px",
        color: "#66728a",
        fontSize: "11px",
        lineHeight: "1.6",
    },


    retryButton: {
        border: "none",
        background: "#6658e8",
        color: "#ffffff",
        padding: "8px 15px",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "11px",
        fontWeight: "600",
    },


    actionsSection: {
        marginTop: "32px",
    },


    actionsGrid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(4, 1fr)",
        gap: "14px",
        marginTop: "16px",
    },


    actionCard: {
        border:
            "1px solid rgba(255,255,255,0.07)",
        background:
            "rgba(255,255,255,0.035)",
        color: "#dce2ed",
        borderRadius: "14px",
        padding: "19px",
        display: "flex",
        alignItems: "center",
        gap: "11px",
        cursor: "pointer",
        fontSize: "13px",
        fontWeight: "600",
        textAlign: "left",
    },


    actionIcon: {
        width: "31px",
        height: "31px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "9px",
        background:
            "rgba(109,93,252,0.13)",
        color: "#9b91ff",
        fontSize: "16px",
    },


    footer: {
        borderTop:
            "1px solid rgba(255,255,255,0.07)",
        padding: "25px 40px",
        display: "flex",
        justifyContent: "space-between",
        color: "#59657b",
        fontSize: "12px",
    },


    footerLinks: {
        display: "flex",
        gap: "20px",
    },


    footerButton: {
        border: "none",
        background: "transparent",
        color: "#77839a",
        cursor: "pointer",
        fontSize: "12px",
    },


    loadingContainer: {
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
    },


    spinner: {
        width: "38px",
        height: "38px",
        border:
            "3px solid rgba(255,255,255,0.1)",
        borderTop:
            "3px solid #7567ff",
        borderRadius: "50%",
        animation:
            "spin 1s linear infinite",
    },


    loadingTitle: {
        marginTop: "20px",
        marginBottom: "6px",
    },


    loadingText: {
        color: "#718097",
        fontSize: "13px",
    },
};