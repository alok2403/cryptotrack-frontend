
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:8080/api/crypto";

const DEFAULT_COINS = [
    "bitcoin",
    "ethereum",
    "solana",
    "binancecoin",
    "ripple",
    "cardano",
    "dogecoin",
    "avalanche-2",
];

const PERIODS = [
    { label: "24H", days: 1 },
    { label: "7D", days: 7 },
    { label: "30D", days: 30 },
    { label: "1Y", days: 365 },
];

export default function Markets() {
    const navigate = useNavigate();

    const [selectedCoin, setSelectedCoin] = useState("bitcoin");
    const [coin, setCoin] = useState(null);
    const [marketCoins, setMarketCoins] = useState([]);

    const [search, setSearch] = useState("");
    const [searchResults, setSearchResults] = useState([]);

    const [days, setDays] = useState(7);
    const [history, setHistory] = useState([]);

    const [loadingCoin, setLoadingCoin] = useState(false);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [loadingMarkets, setLoadingMarkets] = useState(false);
    const [searching, setSearching] = useState(false);

    const [error, setError] = useState("");

    /* =========================================================
       LOAD DEFAULT MARKET COINS
       ========================================================= */

    useEffect(() => {
        loadMarketCoins();
    }, []);

    async function loadMarketCoins() {
        setLoadingMarkets(true);

        try {
            const results = await Promise.all(
                DEFAULT_COINS.map(async (coinId) => {
                    try {
                        const response = await fetch(
                            `${API_BASE}/${coinId}`
                        );

                        if (!response.ok) {
                            return null;
                        }

                        return await response.json();
                    } catch {
                        return null;
                    }
                })
            );

            setMarketCoins(
                results.filter(Boolean)
            );
        } catch {
            setMarketCoins([]);
        } finally {
            setLoadingMarkets(false);
        }
    }

    /* =========================================================
       LOAD SELECTED COIN
       ========================================================= */

    useEffect(() => {
        if (!selectedCoin) {
            return;
        }

        loadCoin(selectedCoin);
    }, [selectedCoin]);

    async function loadCoin(coinId) {
        setLoadingCoin(true);
        setError("");

        try {
            const response = await fetch(
                `${API_BASE}/${encodeURIComponent(coinId)}`
            );

            if (!response.ok) {
                throw new Error(
                    "Unable to fetch cryptocurrency"
                );
            }

            const data = await response.json();

            setCoin(data);
        } catch (err) {
            console.error(err);

            setCoin(null);

            setError(
                "Unable to load cryptocurrency data."
            );
        } finally {
            setLoadingCoin(false);
        }
    }

    /* =========================================================
       LOAD HISTORY
       ========================================================= */

    useEffect(() => {
        if (!selectedCoin) {
            return;
        }

        loadHistory(selectedCoin, days);
    }, [selectedCoin, days]);

    async function loadHistory(coinId, selectedDays) {
        setLoadingHistory(true);

        try {
            const response = await fetch(
                `${API_BASE}/${encodeURIComponent(
                    coinId
                )}/history?days=${selectedDays}`
            );

            if (!response.ok) {
                throw new Error(
                    "Unable to fetch price history"
                );
            }

            const data = await response.json();

            setHistory(
                Array.isArray(data) ? data : []
            );
        } catch (err) {
            console.error(err);
            setHistory([]);
        } finally {
            setLoadingHistory(false);
        }
    }

    /* =========================================================
       SEARCH
       ========================================================= */

    useEffect(() => {
        const query = search.trim();

        if (!query) {
            setSearchResults([]);
            return;
        }

        const timer = setTimeout(() => {
            searchCoins(query);
        }, 350);

        return () => clearTimeout(timer);
    }, [search]);

    async function searchCoins(query) {
        setSearching(true);

        try {
            const response = await fetch(
                `${API_BASE}/search?query=${encodeURIComponent(
                    query
                )}`
            );

            if (!response.ok) {
                throw new Error(
                    "Search failed"
                );
            }

            const data = await response.json();

            setSearchResults(
                Array.isArray(data) ? data : []
            );
        } catch (err) {
            console.error(err);
            setSearchResults([]);
        } finally {
            setSearching(false);
        }
    }

    function selectSearchResult(result) {
        setSelectedCoin(result.id);
        setSearch("");
        setSearchResults([]);
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }

    /* =========================================================
       FORMATTERS
       ========================================================= */

    function formatCurrency(value) {
        if (
            value === null ||
            value === undefined ||
            Number.isNaN(Number(value))
        ) {
            return "—";
        }

        const number = Number(value);

        if (number >= 1) {
            return new Intl.NumberFormat(
                "en-US",
                {
                    style: "currency",
                    currency: "USD",
                    maximumFractionDigits:
                        number >= 1000 ? 0 : 2,
                }
            ).format(number);
        }

        return `$${number.toFixed(6)}`;
    }

    function formatMarketCap(value) {
        if (
            value === null ||
            value === undefined
        ) {
            return "—";
        }

        const number = Number(value);

        if (number >= 1_000_000_000) {
            return `$${(
                number / 1_000_000_000
            ).toFixed(2)}B`;
        }

        if (number >= 1_000_000) {
            return `$${(
                number / 1_000_000
            ).toFixed(2)}M`;
        }

        if (number >= 1_000) {
            return `$${(
                number / 1_000
            ).toFixed(2)}K`;
        }

        return formatCurrency(number);
    }

    function formatPercent(value) {
        if (
            value === null ||
            value === undefined
        ) {
            return "—";
        }

        const number = Number(value);

        return `${number >= 0 ? "+" : ""}${number.toFixed(
            2
        )}%`;
    }

    /* =========================================================
       CHART DATA
       ========================================================= */

    const chart = useMemo(() => {
        if (!history || history.length === 0) {
            return null;
        }

        const values = history
            .map((item) => Number(item.price))
            .filter((value) => Number.isFinite(value));

        if (!values.length) {
            return null;
        }

        const width = 900;
        const height = 340;

        const paddingX = 24;
        const paddingY = 24;

        const min = Math.min(...values);
        const max = Math.max(...values);

        const range =
            max - min === 0
                ? 1
                : max - min;

        const points = values
            .map((value, index) => {
                const x =
                    paddingX +
                    (index /
                        Math.max(
                            values.length - 1,
                            1
                        )) *
                        (width -
                            paddingX * 2);

                const y =
                    height -
                    paddingY -
                    ((value - min) / range) *
                        (height -
                            paddingY * 2);

                return `${x},${y}`;
            })
            .join(" ");

        return {
            width,
            height,
            points,
            min,
            max,
            first: values[0],
            last: values[values.length - 1],
        };
    }, [history]);

    const chartPositive =
        chart &&
        chart.last >= chart.first;

    /* =========================================================
       RENDER
       ========================================================= */

    return (
        <div style={styles.page}>

            {/* TOP BAR */}

            <div style={styles.topBar}>

                <div>
                    <button
                        style={styles.backButton}
                        onClick={() =>
                            navigate("/dashboard")
                        }
                    >
                        ← Dashboard
                    </button>

                    <h1 style={styles.title}>
                        Crypto Markets
                    </h1>

                    <p style={styles.subtitle}>
                        Explore cryptocurrency prices,
                        market data and performance.
                    </p>
                </div>

                {/* SEARCH */}

                <div style={styles.searchWrapper}>

                    <div style={styles.searchBox}>

                        <span style={styles.searchIcon}>
                            🔎
                        </span>

                        <input
                            value={search}
                            onChange={(e) =>
                                setSearch(
                                    e.target.value
                                )
                            }
                            placeholder="Search any cryptocurrency..."
                            style={styles.searchInput}
                        />

                        {searching && (
                            <span style={styles.searchLoader}>
                                Searching...
                            </span>
                        )}

                    </div>

                    {search.trim() && (
                        <div style={styles.searchDropdown}>

                            {searching && (
                                <div
                                    style={
                                        styles.emptySearch
                                    }
                                >
                                    Searching coins...
                                </div>
                            )}

                            {!searching &&
                                searchResults.length ===
                                    0 && (
                                    <div
                                        style={
                                            styles.emptySearch
                                        }
                                    >
                                        No cryptocurrencies
                                        found.
                                    </div>
                                )}

                            {!searching &&
                                searchResults.map(
                                    (result) => (
                                        <button
                                            key={
                                                result.id
                                            }
                                            style={
                                                styles.searchResult
                                            }
                                            onClick={() =>
                                                selectSearchResult(
                                                    result
                                                )
                                            }
                                        >

                                            {result.thumb ? (
                                                <img
                                                    src={
                                                        result.thumb
                                                    }
                                                    alt=""
                                                    style={
                                                        styles.resultImage
                                                    }
                                                />
                                            ) : (
                                                <div
                                                    style={
                                                        styles.resultPlaceholder
                                                    }
                                                >
                                                    ₿
                                                </div>
                                            )}

                                            <div
                                                style={
                                                    styles.resultInfo
                                                }
                                            >
                                                <strong>
                                                    {
                                                        result.name
                                                    }
                                                </strong>

                                                <span>
                                                    {(
                                                        result.symbol ||
                                                        ""
                                                    ).toUpperCase()}
                                                </span>
                                            </div>

                                            <span
                                                style={
                                                    styles.resultArrow
                                                }
                                            >
                                                →
                                            </span>

                                        </button>
                                    )
                                )}

                        </div>
                    )}

                </div>

            </div>


            {/* ERROR */}

            {error && (
                <div style={styles.errorBox}>
                    {error}
                </div>
            )}


            {/* SELECTED COIN */}

            <section style={styles.heroCard}>

                {loadingCoin ? (
                    <div style={styles.loading}>
                        Loading market data...
                    </div>
                ) : coin ? (
                    <>

                        <div style={styles.coinHeader}>

                            <div>

                                <div
                                    style={
                                        styles.coinIdentity
                                    }
                                >

                                    <div
                                        style={
                                            styles.coinIcon
                                        }
                                    >
                                        {coin.symbol
                                            ?.slice(
                                                0,
                                                1
                                            )
                                            .toUpperCase()}
                                    </div>

                                    <div>
                                        <h2
                                            style={
                                                styles.coinName
                                            }
                                        >
                                            {coin.name}
                                        </h2>

                                        <span
                                            style={
                                                styles.coinSymbol
                                            }
                                        >
                                            {coin.symbol?.toUpperCase()}
                                        </span>
                                    </div>

                                </div>

                            </div>

                            <div
                                style={
                                    styles.currentPriceArea
                                }
                            >
                                <div
                                    style={
                                        styles.currentPrice
                                    }
                                >
                                    {formatCurrency(
                                        coin.price
                                    )}
                                </div>

                                <div
                                    style={{
                                        ...styles.change,
                                        color:
                                            Number(
                                                coin.change24h
                                            ) >= 0
                                                ? "#45d483"
                                                : "#ff6577",
                                    }}
                                >
                                    {formatPercent(
                                        coin.change24h
                                    )}{" "}
                                    <span>
                                        24h
                                    </span>
                                </div>
                            </div>

                        </div>


                        {/* METRICS */}

                        <div style={styles.metrics}>

                            <div style={styles.metric}>
                                <span>
                                    Market Cap
                                </span>

                                <strong>
                                    {formatMarketCap(
                                        coin.marketCap
                                    )}
                                </strong>
                            </div>

                            <div style={styles.metric}>
                                <span>
                                    Current Price
                                </span>

                                <strong>
                                    {formatCurrency(
                                        coin.price
                                    )}
                                </strong>
                            </div>

                            <div style={styles.metric}>
                                <span>
                                    24h Change
                                </span>

                                <strong
                                    style={{
                                        color:
                                            Number(
                                                coin.change24h
                                            ) >= 0
                                                ? "#45d483"
                                                : "#ff6577",
                                    }}
                                >
                                    {formatPercent(
                                        coin.change24h
                                    )}
                                </strong>
                            </div>

                            <div style={styles.metric}>
                                <span>
                                    Asset
                                </span>

                                <strong>
                                    {coin.symbol?.toUpperCase()}
                                </strong>
                            </div>

                        </div>

                    </>
                ) : (
                    <div style={styles.loading}>
                        Select a cryptocurrency.
                    </div>
                )}

            </section>


            {/* CHART */}

            <section style={styles.chartCard}>

                <div style={styles.chartHeader}>

                    <div>
                        <h2 style={styles.sectionTitle}>
                            Price Performance
                        </h2>

                        <p style={styles.sectionSubtitle}>
                            Historical price movement
                        </p>
                    </div>

                    <div style={styles.periods}>

                        {PERIODS.map((period) => (
                            <button
                                key={period.days}
                                onClick={() =>
                                    setDays(
                                        period.days
                                    )
                                }
                                style={{
                                    ...styles.periodButton,
                                    ...(days ===
                                    period.days
                                        ? styles.periodActive
                                        : {}),
                                }}
                            >
                                {period.label}
                            </button>
                        ))}

                    </div>

                </div>


                <div style={styles.chartContainer}>

                    {loadingHistory ? (
                        <div style={styles.chartLoading}>
                            Loading chart...
                        </div>
                    ) : chart ? (
                        <>

                            <div
                                style={
                                    styles.chartTopValues
                                }
                            >
                                <span>
                                    High{" "}
                                    <strong>
                                        {formatCurrency(
                                            chart.max
                                        )}
                                    </strong>
                                </span>

                                <span>
                                    Low{" "}
                                    <strong>
                                        {formatCurrency(
                                            chart.min
                                        )}
                                    </strong>
                                </span>
                            </div>

                            <svg
                                viewBox={`0 0 ${chart.width} ${chart.height}`}
                                preserveAspectRatio="none"
                                style={
                                    styles.chartSvg
                                }
                            >

                                <defs>
                                    <linearGradient
                                        id="chartFill"
                                        x1="0"
                                        x2="0"
                                        y1="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="0%"
                                            stopOpacity="0.25"
                                        />

                                        <stop
                                            offset="100%"
                                            stopOpacity="0"
                                        />
                                    </linearGradient>
                                </defs>

                                <polyline
                                    points={chart.points}
                                    fill="none"
                                    stroke={
                                        chartPositive
                                            ? "#45d483"
                                            : "#ff6577"
                                    }
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />

                            </svg>

                            <div
                                style={
                                    styles.chartFooter
                                }
                            >
                                <span>
                                    {days === 1
                                        ? "Last 24 hours"
                                        : days === 7
                                        ? "Last 7 days"
                                        : days === 30
                                        ? "Last 30 days"
                                        : "Last year"}
                                </span>

                                <span>
                                    {history.length} data
                                    points
                                </span>
                            </div>

                        </>
                    ) : (
                        <div style={styles.chartLoading}>
                            No chart data available.
                        </div>
                    )}

                </div>

            </section>


            {/* MARKET SNAPSHOT */}

            <section>

                <div style={styles.snapshotHeader}>

                    <div>
                        <h2 style={styles.sectionTitle}>
                            Market Snapshot
                        </h2>

                        <p style={styles.sectionSubtitle}>
                            Popular cryptocurrencies
                        </p>
                    </div>

                </div>


                <div style={styles.marketGrid}>

                    {loadingMarkets ? (
                        <div style={styles.loading}>
                            Loading markets...
                        </div>
                    ) : marketCoins.length ===
                      0 ? (
                        <div style={styles.loading}>
                            Market data unavailable.
                        </div>
                    ) : (
                        marketCoins.map(
                            (marketCoin) => (
                                <button
                                    key={
                                        marketCoin.id
                                    }
                                    style={{
                                        ...styles.marketCard,
                                        ...(selectedCoin ===
                                        marketCoin.id
                                            ? styles.marketCardActive
                                            : {}),
                                    }}
                                    onClick={() =>
                                        setSelectedCoin(
                                            marketCoin.id
                                        )
                                    }
                                >

                                    <div
                                        style={
                                            styles.marketCardTop
                                        }
                                    >

                                        <div
                                            style={
                                                styles.marketCoinName
                                            }
                                        >
                                            <div
                                                style={
                                                    styles.smallCoinIcon
                                                }
                                            >
                                                {marketCoin.symbol
                                                    ?.slice(
                                                        0,
                                                        1
                                                    )
                                                    .toUpperCase()}
                                            </div>

                                            <div>
                                                <strong>
                                                    {
                                                        marketCoin.name
                                                    }
                                                </strong>

                                                <span>
                                                    {marketCoin.symbol?.toUpperCase()}
                                                </span>
                                            </div>
                                        </div>

                                        <span
                                            style={{
                                                ...styles.marketChange,
                                                color:
                                                    Number(
                                                        marketCoin.change24h
                                                    ) >= 0
                                                        ? "#45d483"
                                                        : "#ff6577",
                                            }}
                                        >
                                            {formatPercent(
                                                marketCoin.change24h
                                            )}
                                        </span>

                                    </div>

                                    <div
                                        style={
                                            styles.marketPrice
                                        }
                                    >
                                        {formatCurrency(
                                            marketCoin.price
                                        )}
                                    </div>

                                    <div
                                        style={
                                            styles.marketCap
                                        }
                                    >
                                        Market cap{" "}
                                        {formatMarketCap(
                                            marketCoin.marketCap
                                        )}
                                    </div>

                                </button>
                            )
                        )
                    )}

                </div>

            </section>


            <footer style={styles.footer}>
                <span>
                    CryptoTrack Market Intelligence
                </span>

                <span>
                    Market data powered by
                    cryptocurrency APIs
                </span>
            </footer>

        </div>
    );
}


/* =========================================================
   STYLES
   ========================================================= */

const styles = {

    page: {
        minHeight: "100vh",
        background:
            "radial-gradient(circle at 10% 0%, rgba(92,76,220,0.10), transparent 30%), #070b14",
        color: "#ffffff",
        padding: "34px 5%",
        fontFamily:
            "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        boxSizing: "border-box",
    },

    topBar: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        gap: "30px",
        marginBottom: "28px",
        flexWrap: "wrap",
    },

    backButton: {
        border: "none",
        background: "transparent",
        color: "#8d98ad",
        cursor: "pointer",
        padding: "0",
        marginBottom: "15px",
        fontSize: "13px",
    },

    title: {
        margin: "0",
        fontSize: "34px",
        letterSpacing: "-1px",
    },

    subtitle: {
        margin: "8px 0 0",
        color: "#7e899d",
        fontSize: "14px",
    },

    searchWrapper: {
        width: "380px",
        position: "relative",
    },

    searchBox: {
        height: "48px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "0 15px",
        background:
            "rgba(255,255,255,0.045)",
        border:
            "1px solid rgba(255,255,255,0.09)",
        borderRadius: "13px",
        boxSizing: "border-box",
    },

    searchIcon: {
        fontSize: "16px",
        opacity: 0.7,
    },

    searchInput: {
        flex: 1,
        border: "none",
        outline: "none",
        background: "transparent",
        color: "#ffffff",
        fontSize: "14px",
    },

    searchLoader: {
        color: "#7f8aa3",
        fontSize: "11px",
    },

    searchDropdown: {
        position: "absolute",
        top: "56px",
        left: 0,
        right: 0,
        background: "#101625",
        border:
            "1px solid rgba(255,255,255,0.10)",
        borderRadius: "13px",
        overflow: "hidden",
        zIndex: 100,
        boxShadow:
            "0 20px 50px rgba(0,0,0,0.45)",
    },

    searchResult: {
        width: "100%",
        border: "none",
        borderBottom:
            "1px solid rgba(255,255,255,0.06)",
        background: "transparent",
        color: "#ffffff",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "12px 15px",
        cursor: "pointer",
        textAlign: "left",
    },

    resultImage: {
        width: "32px",
        height: "32px",
        borderRadius: "50%",
    },

    resultPlaceholder: {
        width: "32px",
        height: "32px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#20283a",
    },

    resultInfo: {
        display: "flex",
        flexDirection: "column",
        gap: "3px",
    },

    resultInfoSpan: {
        color: "#7e899d",
        fontSize: "11px",
    },

    resultArrow: {
        marginLeft: "auto",
        color: "#7e899d",
    },

    emptySearch: {
        padding: "18px",
        color: "#7e899d",
        fontSize: "13px",
    },

    errorBox: {
        padding: "14px 18px",
        marginBottom: "20px",
        borderRadius: "12px",
        background:
            "rgba(255,101,119,0.08)",
        border:
            "1px solid rgba(255,101,119,0.2)",
        color: "#ff8c99",
    },

    heroCard: {
        background:
            "linear-gradient(145deg, rgba(19,27,45,0.96), rgba(12,17,29,0.96))",
        border:
            "1px solid rgba(255,255,255,0.08)",
        borderRadius: "20px",
        padding: "28px",
        marginBottom: "20px",
        boxShadow:
            "0 18px 60px rgba(0,0,0,0.18)",
    },

    coinHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "20px",
        flexWrap: "wrap",
    },

    coinIdentity: {
        display: "flex",
        alignItems: "center",
        gap: "15px",
    },

    coinIcon: {
        width: "54px",
        height: "54px",
        borderRadius: "16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
            "linear-gradient(135deg,#6657e8,#4f46c9)",
        fontSize: "21px",
        fontWeight: "800",
    },

    coinName: {
        margin: "0 0 4px",
        fontSize: "24px",
    },

    coinSymbol: {
        color: "#7e899d",
        fontSize: "12px",
        letterSpacing: "1px",
    },

    currentPriceArea: {
        textAlign: "right",
    },

    currentPrice: {
        fontSize: "31px",
        fontWeight: "750",
        letterSpacing: "-1px",
    },

    change: {
        marginTop: "5px",
        fontSize: "13px",
        fontWeight: "700",
    },

    changeSpan: {
        color: "#7e899d",
        fontWeight: "500",
    },

    metrics: {
        display: "grid",
        gridTemplateColumns:
            "repeat(4, minmax(0,1fr))",
        gap: "12px",
        marginTop: "28px",
    },

    metric: {
        padding: "16px",
        borderRadius: "13px",
        background:
            "rgba(255,255,255,0.035)",
        border:
            "1px solid rgba(255,255,255,0.06)",
    },

    metricSpan: {
        display: "block",
        color: "#7e899d",
        fontSize: "11px",
        marginBottom: "8px",
    },

    metricStrong: {
        fontSize: "15px",
    },

    chartCard: {
        background:
            "rgba(15,21,35,0.9)",
        border:
            "1px solid rgba(255,255,255,0.07)",
        borderRadius: "20px",
        padding: "25px",
        marginBottom: "28px",
    },

    chartHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "20px",
        marginBottom: "18px",
        flexWrap: "wrap",
    },

    sectionTitle: {
        margin: "0",
        fontSize: "20px",
    },

    sectionSubtitle: {
        margin: "5px 0 0",
        color: "#7e899d",
        fontSize: "12px",
    },

    periods: {
        display: "flex",
        gap: "5px",
        padding: "4px",
        background:
            "rgba(255,255,255,0.035)",
        borderRadius: "10px",
    },

    periodButton: {
        border: "none",
        background: "transparent",
        color: "#7e899d",
        padding: "8px 13px",
        borderRadius: "7px",
        cursor: "pointer",
        fontSize: "11px",
        fontWeight: "700",
    },

    periodActive: {
        background: "#6557e8",
        color: "#ffffff",
    },

    chartContainer: {
        minHeight: "360px",
        position: "relative",
    },

    chartTopValues: {
        display: "flex",
        justifyContent: "space-between",
        color: "#68748a",
        fontSize: "11px",
        marginBottom: "10px",
    },

    chartSvg: {
        width: "100%",
        height: "310px",
        display: "block",
    },

    chartFooter: {
        display: "flex",
        justifyContent: "space-between",
        color: "#68748a",
        fontSize: "11px",
    },

    chartLoading: {
        minHeight: "330px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#7e899d",
    },

    snapshotHeader: {
        marginBottom: "15px",
    },

    marketGrid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(4, minmax(0,1fr))",
        gap: "13px",
    },

    marketCard: {
        border:
            "1px solid rgba(255,255,255,0.07)",
        background:
            "rgba(15,21,35,0.82)",
        borderRadius: "16px",
        padding: "17px",
        color: "#ffffff",
        textAlign: "left",
        cursor: "pointer",
        transition: "transform 0.2s ease",
    },

    marketCardActive: {
        border:
            "1px solid rgba(101,87,232,0.55)",
        background:
            "rgba(101,87,232,0.08)",
    },

    marketCardTop: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "10px",
    },

    marketCoinName: {
        display: "flex",
        alignItems: "center",
        gap: "9px",
        minWidth: 0,
    },

    smallCoinIcon: {
        width: "30px",
        height: "30px",
        borderRadius: "10px",
        background:
            "rgba(101,87,232,0.18)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "11px",
        fontWeight: "800",
        flexShrink: 0,
    },

    marketCoinNameStrong: {
        display: "block",
        fontSize: "12px",
    },

    marketCoinNameSpan: {
        display: "block",
        color: "#707c91",
        fontSize: "10px",
        marginTop: "2px",
    },

    marketChange: {
        fontSize: "11px",
        fontWeight: "700",
    },

    marketPrice: {
        marginTop: "18px",
        fontSize: "17px",
        fontWeight: "700",
    },

    marketCap: {
        marginTop: "5px",
        color: "#68748a",
        fontSize: "10px",
    },

    loading: {
        padding: "50px",
        textAlign: "center",
        color: "#7e899d",
    },

    footer: {
        marginTop: "45px",
        paddingTop: "20px",
        borderTop:
            "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        justifyContent: "space-between",
        gap: "15px",
        color: "#59657a",
        fontSize: "11px",
        flexWrap: "wrap",
    },
};
