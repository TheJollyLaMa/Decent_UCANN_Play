// js/script.js

// Use the browser bundle exposed on window.w3up
const { create } = window.w3up;

// Helper: Load *all* uploads by paginating through upload.list
async function loadAllUploads(client) {
  let all = [];
  let cursor = null;
  do {
    const opts = cursor ? { cursor } : {};
    const res = await client.capability.upload.list(opts);
    const batch = Array.isArray(res.results) ? res.results
                : Array.isArray(res.ok?.results) ? res.ok.results
                : [];
    all.push(...batch);
    cursor = res.cursor || null;
  } while (cursor);
  return all;
}

async function initClient() {
  try {
    console.log("Initializing client…");
    // Create a persistent client (uses IndexedDB under the hood)
    const client = await create();
    console.log("Client ready:", client);
    // Prompt user for email and perform login
    const email = prompt("Enter your email to login:");
    if (email) {
      console.log("Logging in with:", email);
      const account = await client.login(email);
      console.log("Login successful:", account);
      // If account requires plan selection, wait for plan
      if (account.plan) {
        await account.plan.wait();
        console.log("Payment plan confirmed");
      }
    } else {
      console.warn("No email provided, skipping login");
    }

    // Show the app
    document.getElementById("appSection").style.display = "block";

    // Display agent DID
    const signer = client.agent;
    if (signer?.did) {
      document.getElementById("agentInfo")
              .textContent = `Signed in as: ${signer.did()}`;
    }

    // List your spaces
    listSpaces(client);
  } catch (err) {
    console.error("Error initializing client:", err);
  }
}

function listSpaces(client) {
  const spaces = client.spaces();
  const container = document.getElementById("spacesList");
  container.innerHTML = "";

  if (!spaces.length) {
    container.textContent = "No spaces found.";
    return;
  }

  spaces.forEach(space => {
    const btn = document.createElement("button");
    btn.textContent = space.name || space.did();
    btn.onclick = async () => {
      // Switch to that space
      await client.setCurrentSpace(space.did());
      // Clear previous details
      const details = document.getElementById("spaceDetails");
      details.innerHTML = `<h3>Uploads in ${space.name || space.did()}</h3>`;
      // Show uploads
      showUploads(client);
    };
    container.appendChild(btn);
  });
}

async function showUploads(client) {
  const details = document.getElementById("spaceDetails");
  // Remove old list if any
  let ul = details.querySelector("ul");
  if (ul) ul.remove();

  ul = document.createElement("ul");
  details.appendChild(ul);

  try {
    const uploads = await loadAllUploads(client);
    if (!uploads.length) {
      ul.innerHTML = `<li>No uploads found.</li>`;
      return;
    }

    // Sort descending by insertedAt
    uploads.sort((a, b) =>
      new Date(b.insertedAt) - new Date(a.insertedAt)
    );

    uploads.forEach(upload => {
      const cid = upload.root.toString();
      const url = `https://${cid}.ipfs.w3s.link/`;  // directory view

      const li = document.createElement("li");
      li.innerHTML = `
        <strong>Root CID:</strong>
          <a href="${url}" target="_blank">${cid}</a><br>
        <strong>Size:</strong> ${upload.size} bytes<br>
        <strong>Inserted At:</strong> ${upload.insertedAt}<br>
      `;

      // "Show Files" button that toggles an embedded iframe
      const toggle = document.createElement("button");
      toggle.textContent = "Show Files";
      toggle.onclick = () => {
        let iframe = li.querySelector("iframe");
        if (!iframe) {
          iframe = document.createElement("iframe");
          iframe.src = url;
          iframe.style.width = "100%";
          iframe.style.height = "300px";
          iframe.style.border = "1px solid #ccc";
          li.appendChild(iframe);
          toggle.textContent = "Hide Files";
        } else {
          const showing = iframe.style.display !== "none";
          iframe.style.display = showing ? "none" : "block";
          toggle.textContent = showing ? "Show Files" : "Hide Files";
        }
      };
      li.appendChild(toggle);

      ul.appendChild(li);
    });
  } catch (err) {
    console.error("Error fetching uploads:", err);
    ul.innerHTML = `<li>Error loading uploads.</li>`;
  }
}

// Kick things off
initClient();


// Learning Modal functionality
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("modal");
  const infoButton = document.getElementById("infoButton");
  const closeSpan = document.querySelector(".close");

  infoButton.addEventListener("click", () => {
    modal.style.display = "block";
  });

  closeSpan.addEventListener("click", () => {
    modal.style.display = "none";
  });

  // Close modal if the user clicks outside the modal content.
  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });
});