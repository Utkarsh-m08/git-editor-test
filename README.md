# Git Editor

A visual, full-stack editor for GitHub repository README.md and markdown files. Build, preview, and commit changes directly from a modern, low-code web interface.

---

## Features

- Visual editing of any markdown file in your GitHub repositories using a rich-text interface.
- Live Markdown preview and formatting.
- Secure GitHub authentication (OAuth).
- View any public repository as **read-only**—browse and preview contents without editing privileges.
- Commit changes directly to your repositories after editing.
- **Real-time sync:** All file edits are saved and previewed in real time, with a 2-second debounce delay before updating.
- View file revision history and previous commits; revert changes if needed.
- Clean, user-friendly interface designed for productivity and clarity.
- Error handling and update feedback for smooth interactions.

---

## Tech Stack

- **Frontend:** React.js, Tailwind CSS, Tiptap Editor
- **Backend:** Express.js, Node.js
- **APIs:** GitHub REST API (authentication, file access & commits)
- **Authentication:** OAuth2

---

## Screenshots

| Editor                                                                                              | Editing in Action ( / command menu)                                                                                               |
|--------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------|
| <img width="400" alt="Screenshot 2025-08-20 144707" src="https://github.com/user-attachments/assets/96184eee-2a8a-4f8e-9bab-bd1550d79f7c" /> | <img width="400" alt="Screenshot 2025-08-20 144735" src="https://github.com/user-attachments/assets/25e865b4-3873-45e8-90b9-6f21ff5ed6e6" /> |

| Home to Search public repo                                                                                   | Public Repo Read-Only                                                                                                |
|--------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------|
| <img width="400" alt="Screenshot 2025-08-20 144746" src="https://github.com/user-attachments/assets/f3058f32-4934-415a-9bf1-26efbad102c4" /> | <img width="400" alt="Screenshot 2025-08-20 145055" src="https://github.com/user-attachments/assets/e1967958-88d9-433a-bd7e-7b71f879c0a7" /> |

<!-- Adjust the alt text and captions to exactly match what users see in each screenshot -->

---
## Getting Started

1. **Clone the repository:**
    ```
    git clone https://github.com/Utkarsh-m08/git-editor.git
    ```

2. **Install backend dependencies and start backend:**
    ```
    cd git-editor/backend/github-oauth-backend
    npm install
    npm start
    ```

3. **Open a new terminal session, then install frontend dependencies and start frontend:**
    ```
    cd git-editor/frontend/git-editor
    npm install
    npm start
    ```

4. **Set up environment variables:**
    - In the backend folder, create a `.env` file for OAuth credentials (see `.env.example` for reference):
      ```
      GITHUB_CLIENT_ID=your_client_id
      GITHUB_CLIENT_SECRET=your_client_secret
      ```

5. **Access the app:**
    - Open [http://localhost:3000](http://localhost:5173) in your browser.

---

> **Tip:**  
> The backend and frontend must be started **individually** in their respective folders, each in a separate terminal.


---

### Author

[Utkarsh Mishra](https://github.com/Utkarsh-m08)
