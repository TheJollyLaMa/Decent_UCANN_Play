import { create } from '@web3-storage/w3up-client';

// Helper: Load all uploads by looping through paginated results.
async function loadAllUploads(client) {
  let allUploads = [];
  let cursor = null;
  do {
    const options = cursor ? { cursor } : {};
    const res = await client.capability.upload.list(options);
    let uploads = [];
    if (res.results && Array.isArray(res.results)) {
      uploads = res.results;
    } else if (res.ok && Array.isArray(res.ok.results)) {
      uploads = res.ok.results;
    } else {
      console.warn("Unexpected uploads structure:", res);
    }
    allUploads = allUploads.concat(uploads);
    cursor = res.cursor || null;
  } while (cursor);
  return allUploads;
}

// Helper: Fetch file list for a given directory CID using a CORS proxy.
// We'll use ThingProxy (or an alternative) to bypass CORS issues.
async function getFilesForCid(cid) {
  const apiUrl = "https://thingproxy.freeboard.io/fetch/" +
                 encodeURIComponent("https://w3s.link/api/v0/ls?arg=" + cid);
  console.log("Fetching files using URL:", apiUrl);
  const response = await fetch(apiUrl);
  if (!response.ok) throw new Error("Failed to fetch file list");
  const data = await response.text();
  return JSON.parse(data);
}

async function initClient(agentData) {
  try {
    console.log("Initializing client...", agentData);
    const client = await create(agentData);
    console.log("Client created:", client);

    // Show the app section.
    document.getElementById("appSection").style.display = "block";

    // Get agent info (falling back to internal _agent if needed).
    const agent = client.agent || client._agent;
    console.log(agent)
    const agentInfoDiv = document.getElementById("agentInfo");
    if (agent && agent.id) {
      agentInfoDiv.textContent = `Signed in as: ${agent.id.toString()}`;
      console.log("Agent info set:", agent.id.toString());
    } else {
      // agentInfoDiv.textContent = "Agent info not available.";
      // console.log("Agent info not found in client.");
    }
    // List spaces.
    listSpaces(client);
  } catch (err) {
    console.error("Error initializing client:", err);
  }
}

function listSpaces(client) {
  try {
    const spaces = client.spaces();
    console.log("Spaces found:", spaces);
    const spacesListDiv = document.getElementById("spacesList");
    spacesListDiv.innerHTML = "";
    if (spaces.length === 0) {
      spacesListDiv.textContent = "No spaces found.";
    } else {
      spaces.forEach((space) => {
        console.log(space.meta());
        const div = document.createElement("div");
        div.textContent = space.name || space.did;
        div.style.cursor = "pointer";
        div.onclick = async () => {
          await client.setCurrentSpace(space.did());
          // Clear previous uploads and load uploads for the selected space.
          const detailsDiv = document.getElementById("spaceDetails");
          detailsDiv.innerHTML = `<h3>Uploads for ${space.name || space.did}</h3>`;
          showUploads(client, space);
        };
        spacesListDiv.appendChild(div);
      });
    }
  } catch (err) {
    console.error("Error listing spaces:", err);
  }
}

async function showUploads(client, space, cursor = null) {
    try {
      const detailsDiv = document.getElementById("spaceDetails");
      // Create or reuse the UL for uploads.
      let ul = document.getElementById("uploadList");
      if (!ul) {
        ul = document.createElement("ul");
        ul.id = "uploadList";
        detailsDiv.appendChild(ul);
      } else if (!cursor) {
        ul.innerHTML = "";
      }
      
      // Load all uploads at once.
      const uploads = await loadAllUploads(client);
      console.log("All uploads:", uploads);
      if (uploads.length === 0 && !cursor) {
        ul.innerHTML = `<li>No uploads found in this space.</li>`;
        return;
      }
      
      // Sort uploads by insertedAt descending.
      uploads.sort((a, b) => new Date(b.insertedAt) - new Date(a.insertedAt));
      
      uploads.forEach((upload) => {
        const cidStr = upload.root && upload.root.toString ? upload.root.toString() : upload.root;
        if (document.getElementById("upload-" + cidStr)) return;
        
        const li = document.createElement("li");
        li.id = "upload-" + cidStr;
        // Build the URL for directory view.
        const url = `https://${cidStr}.ipfs.w3s.link/`;
        console.log("Generating URL for CID:", cidStr, "=>", url);
        li.innerHTML = `<strong>Root CID:</strong> <a href="${url}" target="_blank">${cidStr}</a><br>
                        <strong>Size:</strong> ${upload.size} bytes<br>
                        <strong>Inserted At:</strong> ${upload.insertedAt}<br>`;
        
        // Create a dropdown button that embeds an iframe with the directory view.
        const toggleButton = document.createElement("button");
        toggleButton.textContent = "Show Files";
        toggleButton.style.marginTop = "5px";
        toggleButton.onclick = () => {
          let iframe = li.querySelector("iframe");
          if (iframe) {
            if (iframe.style.display === "none") {
              iframe.style.display = "block";
              toggleButton.textContent = "Hide Files";
            } else {
              iframe.style.display = "none";
              toggleButton.textContent = "Show Files";
            }
            return;
          }
          // Create iframe and set its src to the directory URL.
          iframe = document.createElement("iframe");
          iframe.src = url;
          iframe.style.width = "100%";
          iframe.style.height = "400px"; // Adjust height as needed.
          iframe.style.border = "1px solid #ccc";
          li.appendChild(iframe);
          toggleButton.textContent = "Hide Files";
        };
        li.appendChild(toggleButton);
        li.style.marginBottom = "10px";
        ul.appendChild(li);
      });
      
      // Pagination: if a cursor exists, you might implement "Load More" here.
      // For now, we're loading all uploads via loadAllUploads().
      console.log("Uploads displayed for space", space.did());
    } catch (err) {
      console.error("Error fetching uploads:", err);
    }
  }

// Initialize client using persistent state.
initClient({ id: "your-agent-id" });


// Modal functionality
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