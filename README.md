# Decent UCAN Play

![Horus Background](img/Horus.png)

## Overview

Decent UCAN Play is a futuristic, web-based application that leverages [web3.storage](https://web3.storage) and UCAN-based authentication to provide secure and persistent file storage and browsing on IPFS. With a visually striking, neon-themed interface featuring a Horus-inspired background and dynamic UI elements, Decent UCAN Play offers a compelling experience for managing your digital spaces.

## Features

- **Persistent Authentication:** Users authenticate via a unique agent credential that is securely stored in IndexedDB. New users undergo an email verification and UCAN authorization process, while returning users have their state automatically restored.

- **Spaces & Uploads:** Each user’s agent is associated with multiple Spaces (namespaces for uploads). The app lists all Spaces with human-readable names (if provided) and allows you to view each Space's uploads.

- **Embedded Directory Views:** Each upload entry displays a root CID formatted as a clickable link (using the `w3s.link` gateway). A dropdown button toggles an embedded iframe that displays the directory view of the uploaded content directly from IPFS.

- **Comprehensive Aggregation:** The application aggregates uploads across paginated API responses, so all results are loaded and displayed together without needing a separate "Load More" button.

- **Custom UI with Neon Effects:** Enjoy a distinctive, futuristic look with a custom CSS theme. The app features a Horus.png background, neon text, animations, and a dynamic neon round button that opens an educational modal.

- **Educational Modal:** A neon round button in the upper left (featuring a 📚 emoji) opens a modal in the center of the screen. The modal provides embedded YouTube videos and resource links to help you learn about IPFS and web3.storage.

## Installation

Ensure you have Node.js (v18+) and npm (v7+) installed. Then, clone this repository and install dependencies:

```bash
git clone https://github.com/yourusername/Decent_UCAN_Play.git
cd Decent_UCAN_Play
npm install
```

## Usage

To run the application locally, start a development server (using Vite):

```bash
npm run dev
```

The app typically runs at [http://localhost:5173](http://localhost:5173).

### Authentication & Persistence

- **New Users:** New users are prompted to login via email verification if no agent credentials exist. After email confirmation (and optional payment plan selection), the agent state is persisted locally.

- **Existing Users:** Returning users load their agent credentials from IndexedDB, and their associated Spaces and uploads are restored.

## How It Works

1. **Client Initialization:**
   The client is initialized by calling `create()` from the w3up-client library, which loads persisted agent data from IndexedDB. Once authenticated, the app displays your agent’s DID and retrieves all associated Spaces.

2. **Space Listing:**
   Available Spaces are rendered as clickable entries. The app prioritizes human-readable names (if provided via metadata) over long DID keys. Clicking a Space sets it as the current context and fetches all its uploads.

3. **Upload Aggregation & Directory Embedding:**
   All uploads are fetched and sorted by their insertion timestamp. Each upload entry includes a clickable root CID and a dropdown button that toggles an embedded iframe displaying the directory view of the uploaded content from IPFS.

4. **Educational Modal:**
   A neon round button in the upper left (with a 📚 emoji) provides quick access to learning resources about IPFS. When clicked, a modal appears in the center of the screen containing embedded YouTube videos and helpful resource links.

5. **Security & Privacy:**
   All sensitive agent credentials are securely stored in IndexedDB. No sensitive data is exposed in the repository or transmitted insecurely.

## Code Structure

- **`index.html`**: Contains the main HTML structure for the app, including sections for agent information, Space listing, upload viewing, and the educational modal.
- **`css/style.css`**: Provides the styling, including neon effects, the Horus background, modal design, and custom animations.
- **`js/script.js`**: Implements application logic such as client initialization, event handling for Spaces and uploads, and modal interactions.

## License

This project is licensed under the [MIT License](LICENSE).