import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Login() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);


    const handleLogin = async (e) => {

        e.preventDefault();

        setError("");
        setLoading(true);

        /*
         * Remove any old/expired token before
         * attempting a new login.
         */
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        try {

            const response = await fetch(
                "http://localhost:8080/api/auth/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },

                    body: JSON.stringify({
                        email: email.trim(),
                        password: password
                    })
                }
            );


            /*
             * Read response safely.
             */
            const text = await response.text();

            let data;

            try {
                data = text ? JSON.parse(text) : {};
            } catch {
                data = {
                    message: text
                };
            }


            /*
             * Login failed.
             */
            if (!response.ok) {

                throw new Error(
                    data.message ||
                    data.error ||
                    "Invalid email or password"
                );
            }


            /*
             * Your backend should normally return:
             *
             * {
             *     "token": "...",
             *     "id": ...,
             *     "name": "...",
             *     "email": "..."
             * }
             *
             * We also support accessToken in case
             * your backend uses that property.
             */
            const token =
                data.token ||
                data.accessToken;


            /*
             * IMPORTANT:
             * If there is no token, do NOT navigate.
             */
            if (!token) {

                console.error(
                    "Login response does not contain JWT:",
                    data
                );

                throw new Error(
                    "Login successful, but no JWT token was returned by the server."
                );
            }


            /*
             * Save JWT.
             */
            localStorage.setItem(
                "token",
                token
            );


            /*
             * Save user information.
             */
            localStorage.setItem(
                "user",
                JSON.stringify({
                    id: data.id,
                    name: data.name,
                    email: data.email || email.trim()
                })
            );


            /*
             * Verify that the token was actually saved.
             */
            console.log(
                "JWT saved:",
                localStorage.getItem("token")
            );


            /*
             * Go to dashboard.
             */
            navigate("/dashboard");


        } catch (error) {

            console.error(
                "Login error:",
                error
            );

            /*
             * If login failed, don't keep
             * an old token.
             */
            localStorage.removeItem("token");
            localStorage.removeItem("user");

            setError(
                error.message ||
                "Unable to login."
            );

        } finally {

            setLoading(false);

        }
    };


    return (
        <div style={styles.container}>

            <div style={styles.card}>

                <div style={styles.logo}>
                    ₿
                </div>

                <h1 style={styles.title}>
                    CryptoTrack
                </h1>

                <p style={styles.subtitle}>
                    SMART CRYPTO INTELLIGENCE
                </p>

                <h2 style={styles.heading}>
                    Login
                </h2>


                <form onSubmit={handleLogin}>

                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                        required
                        style={styles.input}
                    />


                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                        required
                        style={styles.input}
                    />


                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            ...styles.button,
                            opacity: loading ? 0.65 : 1,
                            cursor: loading
                                ? "not-allowed"
                                : "pointer"
                        }}
                    >

                        {loading
                            ? "Logging in..."
                            : "Login"}

                    </button>

                </form>


                {error && (
                    <div style={styles.error}>
                        {error}
                    </div>
                )}


                <p style={styles.registerText}>

                    Don't have an account?{" "}

                    <Link
                        to="/register"
                        style={styles.link}
                    >
                        Register
                    </Link>

                </p>

            </div>

        </div>
    );
}


const styles = {

    container: {
        minHeight: "100vh",

        display: "flex",

        justifyContent: "center",

        alignItems: "center",

        background:
            "linear-gradient(135deg,#07111f 0%,#0b1220 50%,#101827 100%)",

        fontFamily:
            "Inter,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",

        padding: "20px",

        boxSizing: "border-box"
    },


    card: {

        width: "100%",

        maxWidth: "390px",

        padding: "35px",

        background:
            "rgba(17,27,45,0.85)",

        border:
            "1px solid rgba(255,255,255,0.08)",

        borderRadius: "18px",

        boxShadow:
            "0 25px 70px rgba(0,0,0,0.35)",

        textAlign: "center",

        boxSizing: "border-box"
    },


    logo: {

        width: "52px",

        height: "52px",

        margin: "0 auto 15px",

        display: "flex",

        alignItems: "center",

        justifyContent: "center",

        borderRadius: "14px",

        background:
            "linear-gradient(135deg,#6d5dfc,#4f46e5)",

        color: "#ffffff",

        fontSize: "28px",

        fontWeight: "800"
    },


    title: {

        margin: 0,

        color: "#ffffff",

        fontSize: "27px",

        fontWeight: "750"
    },


    subtitle: {

        margin:
            "5px 0 28px",

        color: "#718096",

        fontSize: "8px",

        letterSpacing: "1.5px"
    },


    heading: {

        margin:
            "0 0 20px",

        color: "#ffffff",

        fontSize: "20px"
    },


    input: {

        width: "100%",

        padding: "12px 13px",

        margin:
            "7px 0",

        boxSizing: "border-box",

        background: "#0b1424",

        border:
            "1px solid rgba(255,255,255,0.1)",

        borderRadius: "9px",

        color: "#ffffff",

        outline: "none",

        fontSize: "13px"
    },


    button: {

        width: "100%",

        padding: "12px",

        marginTop: "14px",

        border: "none",

        borderRadius: "9px",

        background:
            "linear-gradient(135deg,#6d5dfc,#5145cd)",

        color: "#ffffff",

        fontSize: "14px",

        fontWeight: "650"
    },


    error: {

        marginTop: "15px",

        padding: "10px",

        borderRadius: "8px",

        background:
            "rgba(239,68,68,0.1)",

        border:
            "1px solid rgba(239,68,68,0.2)",

        color: "#fca5a5",

        fontSize: "12px"
    },


    registerText: {

        marginTop: "20px",

        color: "#718096",

        fontSize: "12px"
    },


    link: {

        color: "#a5b4fc",

        textDecoration: "none",

        fontWeight: "600"
    }
};


export default Login;