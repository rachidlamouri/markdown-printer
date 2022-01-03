import fs from 'fs';
import path from 'path';
import { mdToPdf }  from 'md-to-pdf';
import * as pdfToPrinter from 'pdf-to-printer';

const logErrorAndAbort = (error: unknown) => {
  console.error(error instanceof Error ? error.stack ?? '' : error)
  process.exit(1);
}

const usage = (message?: string): never => {
  if (message) {
    console.log(message);
  }

  console.log('Usage: md-to-printer <command> <...args>');
  console.log('');
  console.log('  Commands:');
  console.log('    list-printers');
  console.log('      Lists available printer information.')
  console.log('');
  console.log('    preview <filepath> <tmpDirpath> [<stylesheetFilepath>]');
  console.log('      Converts markdown file at <filepath> to pdf file at <tmpDirpath>/<filepath>.pdf')
  console.log('      Pdf file can be styled with an optional CSS stylesheet located at <stylesheetFilepath>.');
  console.log('');
  console.log('    print <printerName> <filepath> <tmpDirpath> [<stylesheetFilepath>]');
  console.log('      Converts markdown file at <filepath> to pdf file at <tmpDirpath>/<filepath>.pdf')
  console.log('      and sends that pdf file to the specified printer. Use list-printers to see available printers.');
  console.log('      Pdf file can be styled with an optional CSS stylesheet located at <stylesheetFilepath>.');
  process.exit();
};

const validateFilepaths = (inputFilepath: string, tmpDirpath: string, stylesheetFilepath: string | null): string => {
  if (!inputFilepath || !tmpDirpath) {
    usage();
  }

  if (!fs.existsSync(inputFilepath)) {
    logErrorAndAbort(new Error(`File "${inputFilepath}" does not exist`));
  }

  if (!fs.existsSync(tmpDirpath) || !fs.statSync(tmpDirpath).isDirectory()) {
    logErrorAndAbort(new Error(`Directory "${tmpDirpath}" does not exist`));
  }

  if (stylesheetFilepath !== null && !fs.existsSync(stylesheetFilepath)) {
    logErrorAndAbort(new Error(`Stylesheet "${stylesheetFilepath}" does not exist`));
  }

  const outputFilepath = `${tmpDirpath}/${path.basename(inputFilepath)}.pdf`
  return outputFilepath;
}

const writePdfToTmpDir = (inputFilepath: string, outputFilepath: string, stylesheetFilepath: string | null) => (
  mdToPdf(
    { path: inputFilepath },
    {
      dest: outputFilepath,
      stylesheet: stylesheetFilepath !== null ? [stylesheetFilepath] : undefined
    },
  )
    .then(() => {
      console.log(`Wrote ${inputFilepath} to ${outputFilepath}`);
    })
)

const [command, ...args] = process.argv.slice(2);

if (command === 'list-printers') {
  pdfToPrinter.getPrinters()
    .then((printers) => {
      console.log(printers.map(({ name, ...properties }) => ({ name, ...properties })));
    })
    .catch(logErrorAndAbort);
} else if (command === 'preview') {
  const [inputFilepath, tmpDir, stylesheetFilepath = null ] = args;

  const outputFilepath = validateFilepaths(inputFilepath, tmpDir, stylesheetFilepath);

  writePdfToTmpDir(inputFilepath, outputFilepath, stylesheetFilepath)
    .catch(logErrorAndAbort);
} else if (command === 'print') {
  const [printerName, inputFilepath, tmpDir, stylesheetFilepath = null] = args;

  const outputFilepath = validateFilepaths(inputFilepath, tmpDir, stylesheetFilepath);

  if (!printerName) {
    usage();
  }

  pdfToPrinter.getPrinters()
    .then((printers) => {
      if(!printers.some((p) => p.name === printerName)) {
        logErrorAndAbort(new Error(`Printer ${printerName} does not exist`))
      }
    })
    .then(() => writePdfToTmpDir(inputFilepath, outputFilepath, stylesheetFilepath))
    .then(() => pdfToPrinter.print(outputFilepath, { printer: printerName }))
    .then(() => {
      console.log(`Sent "${outputFilepath}" to printer "${printerName}"`)
    })
    .catch(logErrorAndAbort)
} else {
  usage();
}
