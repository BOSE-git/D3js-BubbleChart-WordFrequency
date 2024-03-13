const express = require("express");
const fileUpload = require("express-fileupload");
const pdfParse = require("pdf-parse");
const dotenv = require("dotenv");
const excludedWords = require("./excludedWords")

const app = express();
dotenv.config();

app.use("/", express.static("public"));
app.use(fileUpload());

const port = process.env.PORT || 3000;


app.post("/extract-text", (req, res) => {
    if (!req.files || !req.files.pdfFile) {
        res.status(400).end();
        return;
    }

    pdfParse(req.files.pdfFile).then(result => {
        const text = result.text;
        const words = text.split(/\s+/).map(word => word.toLowerCase()); // Convert words to lowercase

        const wordsWithoutNumbers = words.filter(word => !/\d/.test(word));

        const filteredWords = wordsWithoutNumbers.filter(word => !excludedWords.includes(word));

        const finalWords = filteredWords.filter(word => word.length >= 2);

        // Calculate word frequencies
        const wordFrequencies = finalWords.reduce((acc, word) => {
            acc[word] = (acc[word] || 0) + 1;
            return acc;
        }, {});

        // Convert word frequencies to the desired structured format
        const structuredData = Object.entries(wordFrequencies).map(([word, freq]) => ({
            source: `(${word})`,
            freq: freq,
            x: Math.random() * 400, // Assign a random x-coordinate (you may adjust this based on your data)
            y: Math.random() * 400, // Assign a random y-coordinate (you may adjust this based on your data)
            color: getRandomColor() // Generate a random color
        }));

        res.send({ words: structuredData });
    });
});

function getRandomColor() {
    // Function to generate a random color
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

app.listen(port, () => {
    console.log("Server is listening on port: ",port);
});
