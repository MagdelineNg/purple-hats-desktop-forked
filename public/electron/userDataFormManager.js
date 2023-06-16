const {
  browserTypes,
  getDefaultEdgeDataDir,
  getDefaultChromeDataDir,
} = require("./constants");
const { ipcMain, BrowserView } = require("electron");
const path = require("path");
const os = require("os");
const fs = require("fs");
const { globSync } = require("glob");
const { backendPath } = require("./constants");

const init = () => {
  ipcMain.on("submitFormViaBrowser", async (_event, formDetails) => {
    const playwrightPath = path.join(
      backendPath,
      "purple-hats",
      "node_modules",
      "playwright",
      "index.js"
    );
    const playwright = require(playwrightPath);
    const chromium = playwright.chromium;

    const chromeDataDir = getDefaultChromeDataDir();
    const edgeDataDir = getDefaultEdgeDataDir();

    let browserChannel;
    let userDataDir;

    if (formDetails.browser == browserTypes.chrome && chromeDataDir) {
      browserChannel = browserTypes.chrome;
      userDataDir = cloneChromeProfiles();
    } else if (formDetails.browser == browserTypes.edge && edgeDataDir) {
      browserChannel = browserTypes.edge;
      userDataDir = cloneEdgeProfiles();
    } else {
      hasUserProfile = false;
      browserChannel = null;
      userDataDir = "";
    }

    const context = await chromium.launchPersistentContext(userDataDir, {
      ignoreDefaultArgs: ["--use-mock-keychain"],
      ...(browserChannel && { channel: browserChannel }),
    });

    const page = await context.newPage();

    await page.goto(formDetails.formUrl);
    await page
      .getByRole("textbox", { name: "Website URL" })
      .fill(formDetails.websiteUrl);
    await page.getByRole("textbox", { name: "Scan Type" }).click();
    await page
      .getByRole("textbox", { name: "Scan Type" })
      .fill(formDetails.scanType);
    await page.getByRole("textbox", { name: "Email" }).click();
    await page.getByRole("textbox", { name: "Email" }).fill(formDetails.email);
    await page.getByRole("textbox", { name: "Name" }).click();
    await page.getByRole("textbox", { name: "Name" }).fill(formDetails.name);
    await page.getByRole("button", { name: "Submit" }).click();

    await page.close();
    await context.close();

    if (browserChannel == browserTypes.chrome) {
      deleteClonedChromeProfiles();
    } else if (browserChannel == browserTypes.edge) {
      deleteClonedEdgeProfiles();
    }
  });
};

const cloneChromeProfileCookieFiles = (options, destDir) => {
  let profileCookiesDir;
  // Cookies file per profile is located in .../User Data/<profile name>/Network/Cookies for windows
  // and ../Chrome/<profile name>/Cookies for mac
  let profileNamesRegex;
  if (os.platform() === "win32") {
    profileCookiesDir = globSync("**/Network/Cookies", {
      ...options,
      ignore: ["Purple-HATS/**"],
    });
    profileNamesRegex = /User Data\\(.*?)\\Network/;
  } else if (os.platform() === "darwin") {
    // maxDepth 2 to avoid copying cookies from the Purple-HATS directory if it exists
    profileCookiesDir = globSync("**/Cookies", {
      ...options,
      ignore: "Purple-HATS/**",
    });
    profileNamesRegex = /Chrome\/(.*?)\/Cookies/;
  }

  if (profileCookiesDir.length > 0) {
    profileCookiesDir.map((dir) => {
      const profileName = dir.match(profileNamesRegex)[1];
      if (profileName) {
        let destProfileDir = path.join(destDir, profileName);
        if (os.platform() === "win32") {
          destProfileDir = path.join(destProfileDir, "Network");
        }
        // Recursive true to create all parent directories (e.g. PbProfile/Default/Cookies)
        if (!fs.existsSync(destProfileDir)) {
          fs.mkdirSync(destProfileDir, { recursive: true });
          if (!fs.existsSync(destProfileDir)) {
            fs.mkdirSync(destProfileDir);
          }
        }

        // Prevents duplicate cookies file if the cookies already exist
        if (!fs.existsSync(path.join(destProfileDir, "Cookies"))) {
          fs.copyFileSync(dir, path.join(destProfileDir, "Cookies"));
        }
      }
    });
  } else {
    console.error("Unable to find Chrome profile cookies file in the system.");
    return;
  }
};

const cloneEdgeProfileCookieFiles = (options, destDir) => {
  let profileCookiesDir;
  // Cookies file per profile is located in .../User Data/<profile name>/Network/Cookies for windows
  // and ../Chrome/<profile name>/Cookies for mac
  let profileNamesRegex;
  // Ignores the cloned Purple-HATS directory if exists
  if (os.platform() === "win32") {
    ["Purple-HATS/**"],
      (profileCookiesDir = globSync("**/Network/Cookies", {
        ...options,
      }));
    profileNamesRegex = /User Data\\(.*?)\\Network/;
  } else if (os.platform() === "darwin") {
    // Ignores copying cookies from the Purple-HATS directory if it exists
    profileCookiesDir = globSync("**/Cookies", {
      ...options,
      ignore: "Purple-HATS/**",
    });
    profileNamesRegex = /Microsoft Edge\/(.*?)\/Cookies/;
  }

  if (profileCookiesDir.length > 0) {
    profileCookiesDir.map((dir) => {
      const profileName = dir.match(profileNamesRegex)[1];
      if (profileName) {
        let destProfileDir = path.join(destDir, profileName);
        if (os.platform() === "win32") {
          destProfileDir = path.join(destProfileDir, "Network");
        }
        // Recursive true to create all parent directories (e.g. PbProfile/Default/Cookies)
        if (!fs.existsSync(destProfileDir)) {
          fs.mkdirSync(destProfileDir, { recursive: true });
          if (!fs.existsSync(destProfileDir)) {
            fs.mkdirSync(destProfileDir);
          }
        }

        // Prevents duplicate cookies file if the cookies already exist
        if (!fs.existsSync(path.join(destProfileDir, "Cookies"))) {
          fs.copyFileSync(dir, path.join(destProfileDir, "Cookies"));
        }
      }
    });
  } else {
    console.error("Unable to find Edge profile cookies file in the system.");
    return;
  }
};

const cloneLocalStateFile = (options, destDir) => {
  const localState = globSync("**/*Local State", {
    ...options,
    maxDepth: 1,
  });

  if (localState.length > 0) {
    localState.map((dir) => {
      fs.copyFileSync(dir, path.join(destDir, "Local State"));
    });
  } else {
    console.error("Unable to find local state file in the system.");
    return;
  }
};

const cloneChromeProfiles = () => {
  const baseDir = getDefaultChromeDataDir();

  if (!baseDir) {
    console.error("Unable to find Chrome data directory in the system.");
    return;
  }

  const destDir = path.join(baseDir, "Purple-HATS");

  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir);
  }

  const baseOptions = {
    cwd: baseDir,
    recursive: true,
    absolute: true,
    nodir: true,
  };
  cloneChromeProfileCookieFiles(baseOptions, destDir);
  cloneLocalStateFile(baseOptions, destDir);
  // eslint-disable-next-line no-undef, consistent-return
  return path.join(baseDir, "Purple-HATS");
};

const cloneEdgeProfiles = () => {
  const baseDir = getDefaultEdgeDataDir();

  if (!baseDir) {
    console.error("Unable to find Edge data directory in the system.");
    return;
  }

  const destDir = path.join(baseDir, "Purple-HATS");

  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir);
  }

  const baseOptions = {
    cwd: baseDir,
    recursive: true,
    absolute: true,
    nodir: true,
  };
  cloneEdgeProfileCookieFiles(baseOptions, destDir);
  cloneLocalStateFile(baseOptions, destDir);
  // eslint-disable-next-line no-undef, consistent-return
  return path.join(baseDir, "Purple-HATS");
};

const deleteClonedChromeProfiles = () => {
  const baseDir = getDefaultChromeDataDir();

  if (!baseDir) {
    console.error("Unable to find Chrome data directory in the system.");
    return;
  }

  const destDir = path.join(baseDir, "Purple-HATS");

  if (fs.existsSync(destDir)) {
    fs.rmSync(destDir, { recursive: true });
    return;
  } else {
    console.error(
      "Unable to find Purple-HATS directory in the Chrome data directory."
    );
    return;
  }
};

const deleteClonedEdgeProfiles = () => {
  const baseDir = getDefaultEdgeDataDir();

  if (!baseDir) {
    console.error("Unable to find Edge data directory in the system.");
    return;
  }

  const destDir = path.join(baseDir, "Purple-HATS");

  if (fs.existsSync(destDir)) {
    fs.rmSync(destDir, { recursive: true });
    return;
  } else {
    console.error(
      "Unable to find Purple-HATS directory in the Edge data directory."
    );
    return;
  }
};

module.exports = {
  init,
};
