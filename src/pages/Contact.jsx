import React from "react";
import Navbar from "../components/Navbar";

export default function Contact() {
    return (
        <div style={styles.page}>

            <Navbar />

            <main style={styles.container}>

                <h1>Contact Us</h1>

                <p>
                    Have questions about CryptoTrack?
                    Our support team is here to help.
                </p>

            </main>

        </div>
    );
}

const styles = {
    page: {
        minHeight: "100vh",
        background: "#08101d",
        color: "#ffffff"
    },

    container: {
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "50px 30px"
    }
};