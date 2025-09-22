// clean-structure.js
import fs from "fs";
import path from "path";

function listDir(dir, prefix = "") {
  let result = "";
  const files = fs.readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    if (
      file.name === "node_modules" ||
      file.name === "build" ||
      file.name === "dist" ||
      file.name.startsWith(".")
    ) {
      continue; // skip unwanted dirs
    }

    const filepath = path.join(dir, file.name);
    result += `${prefix}${file.name}\n`;

    if (file.isDirectory()) {
      result += listDir(filepath, prefix + "  ");
    }
  }

  return result;
}

// Dump FRONTEND (src only, since that's where React code lives)
console.log("FRONTEND/src");
console.log(listDir("frontend/src", "  "));

// Dump BACKEND
console.log("\nBACKEND");
console.log(listDir("backend", "  "));
