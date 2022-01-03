# Markdown to Printer

Combines [md-to-pdf](https://www.npmjs.com/package/md-to-pdf) and [pdf-to-printer](https://www.npmjs.com/package/pdf-to-printer) to print markdown files.

## Quick Start

```sh
# Install md-to-printer
npm install github:rachidlamouri/md-to-printer

# Print usage
npx md-to-printer

# Create a directory; the name doesn't matter
mkdir <tmp>

# PDF Example
npx md-to-printer preview node_modules/md-to-printer/example/example.md <tmp> node_modules/md-to-printer/example/example.css

# Open <tmp>/example.md.pdf in a pdf viewer
```

## FAQ

### Why is the \<tmp\> dir necessary?

md-to-printer uses pdf-to-printer which requires a pdf file name as input. md-to-pdf is internally configured to write the pdf file to disk. An input directory is required, because md-to-printer doesn't want to assume where to write the pdf file.

## Development

```sh
# Install dependencies
npm install

# Run the cli locally
./bin/run
```
