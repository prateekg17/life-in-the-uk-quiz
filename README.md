# Life in the UK - Practice Quiz

A free, static, browser-based practice quiz for the UK "Life in the UK" citizenship/settlement
test. Pick a topic section or take the full quiz, answer multiple-choice questions, and get
instant feedback with your score.

## Features

- 308 questions across 35 topic sections (Geography, Roman/Anglo-Saxon/Viking/Norman history,
  Tudors & Stuarts, the Union Flag, Victorian era, Voting & Reform, both World Wars, Devolved
  Administrations, Courts & Legal System, Arts & Culture, the Monarchy & Constitution,
  Parliament & Elections, International Institutions, Policing & the Law, and more)
- Take a single section or the full quiz
- Instant marking on submission, with correct answers highlighted
- Score summary as a count and percentage
- No build step, no dependencies, no backend - just static HTML/CSS/JS

## Getting started

Clone the repo and open `static/index.html` in a browser, or serve it locally:

```sh
cd static
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Deploying to GitHub Pages

This repo includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that deploys the
site automatically on every push to `main`.

1. Push this repo to GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to `GitHub Actions`.
4. Push to `main` (or trigger the workflow manually via **Actions → Deploy Life in the UK Quiz
   to GitHub Pages → Run workflow**).
5. GitHub will publish the site at `https://prateekg17.github.io/life-in-the-uk-quiz/`.

## Project structure

```text
.
|-- static/
|   |-- index.html    # Page markup and styling
|   |-- quiz.js        # Home page, section rendering, quiz logic and scoring
|   |-- questions.js   # Question bank (sections, options, correct answers)
|-- .github/
|   |-- workflows/
|   |   |-- deploy.yml    # Builds and deploys static/ to GitHub Pages
|   |   |-- labeler.yaml  # Auto-labels pull requests based on branch name/changed files
|   |-- labeler.yaml   # Label rules used by the labeler workflow
|   |-- dependabot.yaml # Keeps GitHub Actions dependencies up to date
|-- LICENSE
|-- README.md
```

## Adding or editing questions

Questions live in `static/questions.js` as a flat array. Each entry has the shape:

```js
{ section: "Geography & Overview", q: "Question text?", options: ["A", "B", "C", "D"], answer: 1 }
```

`answer` is the zero-based index into `options`. Add new entries to an existing section (to
group them under that heading) or start a new `// --- SECTION NAME ---` block for a new topic.

## Attribution and copyright

This project is an independent, unofficial study aid created from personal notes and publicly
available information from the official *Life in the UK Test* handbook, published on
[gov.uk](https://www.gov.uk) under Crown copyright and the
[Open Government Licence v3.0](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/).

It is **not affiliated with, endorsed by, or produced by the UK Home Office**, and should not be
treated as an official or exhaustive study resource. Always refer to the official handbook and
gov.uk guidance when preparing for the actual test.

## License

The code in this repository (HTML/CSS/JS) is available under the [MIT License](LICENSE). The
underlying factual content is derived from Crown copyright material under the Open Government
Licence v3.0, as noted above.
