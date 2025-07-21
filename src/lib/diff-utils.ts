// File diff utilities similar to Python's difflib.HtmlDiff

interface DiffLine {
  type: "equal" | "delete" | "insert" | "replace";
  leftLine?: string;
  rightLine?: string;
  leftLineNum?: number;
  rightLineNum?: number;
}

export function generateHtmlDiff(
  text1: string,
  text2: string,
  filename1: string,
  filename2: string
): string {
  const lines1 = text1.split("\n");
  const lines2 = text2.split("\n");

  const diffLines = computeDiff(lines1, lines2);

  return generateHtmlTable(diffLines, filename1, filename2);
}

function computeDiff(lines1: string[], lines2: string[]): DiffLine[] {
  const result: DiffLine[] = [];
  let i = 0,
    j = 0;

  while (i < lines1.length || j < lines2.length) {
    if (i >= lines1.length) {
      // Only lines2 remaining (insertions)
      result.push({
        type: "insert",
        rightLine: lines2[j],
        rightLineNum: j + 1,
      });
      j++;
    } else if (j >= lines2.length) {
      // Only lines1 remaining (deletions)
      result.push({
        type: "delete",
        leftLine: lines1[i],
        leftLineNum: i + 1,
      });
      i++;
    } else if (lines1[i] === lines2[j]) {
      // Lines are equal
      result.push({
        type: "equal",
        leftLine: lines1[i],
        rightLine: lines2[j],
        leftLineNum: i + 1,
        rightLineNum: j + 1,
      });
      i++;
      j++;
    } else {
      // Lines are different - look ahead to find best match
      const match = findBestMatch(lines1, lines2, i, j);

      if (match.type === "replace") {
        result.push({
          type: "replace",
          leftLine: lines1[i],
          rightLine: lines2[j],
          leftLineNum: i + 1,
          rightLineNum: j + 1,
        });
        i++;
        j++;
      } else if (match.type === "delete") {
        result.push({
          type: "delete",
          leftLine: lines1[i],
          leftLineNum: i + 1,
        });
        i++;
      } else {
        result.push({
          type: "insert",
          rightLine: lines2[j],
          rightLineNum: j + 1,
        });
        j++;
      }
    }
  }

  return result;
}

function findBestMatch(
  lines1: string[],
  lines2: string[],
  i: number,
  j: number
): { type: "replace" | "delete" | "insert" } {
  // Simple heuristic: look ahead a few lines to see if we can find a match
  const lookAhead = 3;

  // Check if line1[i] appears in the next few lines of lines2
  for (let k = j + 1; k < Math.min(j + lookAhead, lines2.length); k++) {
    if (lines1[i] === lines2[k]) {
      return { type: "insert" }; // Insert lines2[j] to lines2[k-1]
    }
  }

  // Check if line2[j] appears in the next few lines of lines1
  for (let k = i + 1; k < Math.min(i + lookAhead, lines1.length); k++) {
    if (lines2[j] === lines1[k]) {
      return { type: "delete" }; // Delete lines1[i] to lines1[k-1]
    }
  }

  // Default to replace
  return { type: "replace" };
}

function generateHtmlTable(
  diffLines: DiffLine[],
  filename1: string,
  filename2: string
): string {
  let html = `
    <table class="table table-sm table-bordered" style="font-family: monospace; font-size: 0.875rem;">
      <thead>
        <tr>
          <th style="width: 50px; background-color: #f8f9fa;">#</th>
          <th style="width: 50%; background-color: #f8f9fa;">${escapeHtml(
            filename1
          )}</th>
          <th style="width: 50px; background-color: #f8f9fa;">#</th>
          <th style="width: 50%; background-color: #f8f9fa;">${escapeHtml(
            filename2
          )}</th>
        </tr>
      </thead>
      <tbody>
  `;

  for (const line of diffLines) {
    html += generateTableRow(line);
  }

  html += `
      </tbody>
    </table>
  `;

  return html;
}

function generateTableRow(line: DiffLine): string {
  let rowClass = "";
  let leftBg = "";
  let rightBg = "";

  switch (line.type) {
    case "equal":
      rowClass = "";
      break;
    case "delete":
      leftBg = "background-color: #f8d7da;";
      rightBg = "background-color: #f8f9fa;";
      break;
    case "insert":
      leftBg = "background-color: #f8f9fa;";
      rightBg = "background-color: #d4edda;";
      break;
    case "replace":
      leftBg = "background-color: #fff3cd;";
      rightBg = "background-color: #fff3cd;";
      break;
  }

  const leftLineNum = line.leftLineNum ? line.leftLineNum.toString() : "";
  const rightLineNum = line.rightLineNum ? line.rightLineNum.toString() : "";
  const leftContent = line.leftLine ? escapeHtml(line.leftLine) : "";
  const rightContent = line.rightLine ? escapeHtml(line.rightLine) : "";

  return `
    <tr class="${rowClass}">
      <td style="text-align: right; color: #6c757d; ${leftBg}">${leftLineNum}</td>
      <td style="white-space: pre-wrap; ${leftBg}">${
    leftContent || "&nbsp;"
  }</td>
      <td style="text-align: right; color: #6c757d; ${rightBg}">${rightLineNum}</td>
      <td style="white-space: pre-wrap; ${rightBg}">${
    rightContent || "&nbsp;"
  }</td>
    </tr>
  `;
}

function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Server-side version of escapeHtml for Node.js
export function escapeHtmlServer(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Server-side version of the main function
export function generateHtmlDiffServer(
  text1: string,
  text2: string,
  filename1: string,
  filename2: string
): string {
  const lines1 = text1.split("\n");
  const lines2 = text2.split("\n");

  const diffLines = computeDiff(lines1, lines2);

  return generateHtmlTableServer(diffLines, filename1, filename2);
}

function generateHtmlTableServer(
  diffLines: DiffLine[],
  filename1: string,
  filename2: string
): string {
  let html = `
    <table class="table table-sm table-bordered" style="font-family: monospace; font-size: 0.875rem;">
      <thead>
        <tr>
          <th style="width: 50px; background-color: #f8f9fa;">#</th>
          <th style="width: 50%; background-color: #f8f9fa;">${escapeHtmlServer(
            filename1
          )}</th>
          <th style="width: 50px; background-color: #f8f9fa;">#</th>
          <th style="width: 50%; background-color: #f8f9fa;">${escapeHtmlServer(
            filename2
          )}</th>
        </tr>
      </thead>
      <tbody>
  `;

  for (const line of diffLines) {
    html += generateTableRowServer(line);
  }

  html += `
      </tbody>
    </table>
  `;

  return html;
}

function generateTableRowServer(line: DiffLine): string {
  let rowClass = "";
  let leftBg = "";
  let rightBg = "";

  switch (line.type) {
    case "equal":
      rowClass = "";
      break;
    case "delete":
      leftBg = "background-color: #f8d7da;";
      rightBg = "background-color: #f8f9fa;";
      break;
    case "insert":
      leftBg = "background-color: #f8f9fa;";
      rightBg = "background-color: #d4edda;";
      break;
    case "replace":
      leftBg = "background-color: #fff3cd;";
      rightBg = "background-color: #fff3cd;";
      break;
  }

  const leftLineNum = line.leftLineNum ? line.leftLineNum.toString() : "";
  const rightLineNum = line.rightLineNum ? line.rightLineNum.toString() : "";
  const leftContent = line.leftLine ? escapeHtmlServer(line.leftLine) : "";
  const rightContent = line.rightLine ? escapeHtmlServer(line.rightLine) : "";

  return `
    <tr class="${rowClass}">
      <td style="text-align: right; color: #6c757d; ${leftBg}">${leftLineNum}</td>
      <td style="white-space: pre-wrap; ${leftBg}">${
    leftContent || "&nbsp;"
  }</td>
      <td style="text-align: right; color: #6c757d; ${rightBg}">${rightLineNum}</td>
      <td style="white-space: pre-wrap; ${rightBg}">${
    rightContent || "&nbsp;"
  }</td>
    </tr>
  `;
}
