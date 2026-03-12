# 🔧Re-Architectured Frontend with Angular – Clean Street Civic Issue Reporting App  
## ♻️ Frontend Re-Architecture with Angular



![Angular](https://img.shields.io/badge/Re--Architectured%20Frontend-Angular-DD0031?logo=angular&logoColor=white&style=for-the-badge)



This project is a **frontend re-architecture of my Infosys Internship project**, where I redesigned the **Clean Street Civic Issue Reporting System** from **React to Angular** while keeping the **original backend unchanged**.

The goal of this re-architecture was to apply my own architectural ideas to improve **component modularity, frontend maintainability, UI structure, and overall user experience**, while continuing to use the **existing Node.js + Express + MongoDB backend APIs** developed during my internship.

---

## 🧰 Technologies Used (Re-Architecture)

### 🎨 Frontend
- **Angular**
- **TypeScript**
- **TailwindCSS**
- **Leaflet.js**
- **OpenStreetMap API**

### ⚙️ Backend (Original Infosys Internship Project)
- **Node.js**
- **Express.js**
- **MongoDB**
- **JWT Authentication**

---

## 🧩 Angular Concepts & Features Used in the Project

### 🧱 Component-Based Architecture
Created modular Angular components such as:
- **ProfileComponent** → manage user profile and profile image  
- **ReportIssueComponent** → complaint submission with location and images  
- **ViewComplaintsComponent** → display complaints, voting, and comments  

This improved **separation of concerns and maintainability**.

---

### 🔄 Lifecycle Hooks
Used Angular lifecycle hooks to control component behavior:

- **`ngOnInit()`** → fetch complaints, profile data, and initialize component state  
- **`ngAfterViewInit()`** → initialize **Leaflet interactive map** after DOM rendering  
- **`ngOnDestroy()`** → clean up timers and map instances to avoid memory leaks  

---

### 🔗 Data Binding
Implemented multiple Angular binding techniques:

- **Interpolation (`{{ }}`)** → display complaint details, status, and user information  
- **Property Binding (`[src]`, `[value]`)** → dynamic image previews and UI updates  
- **Event Binding (`(click)`, `(change)`)** → handle actions like submit, vote, comment  
- **Two-Way Binding (`[(ngModel)]`)** → manage form inputs for complaints, profile updates, and comments  

---

### 📌 Directives
Used Angular directives to dynamically control UI behavior:

- **`*ngIf`** → display loading states, modals, errors, and conditional UI sections  
- **`*ngFor`** → render complaint lists, comments, and image previews  
- **`[class]` / `[ngStyle]`** → dynamically style complaint status indicators  

---

### 📝 Forms & Validation
Implemented **template-driven forms** for:

- complaint reporting  
- profile updates  
- comment submission  

Forms include validation for required fields and user input handling.

---

### 🌐 HTTP Client & API Integration
Used **Angular HttpClient** through a shared **ApiService** to interact with backend APIs:

- fetch complaints  
- submit complaints  
- upvote / downvote complaints  
- add comments  
- update user profile  

---

### 📷 File Upload & Preview
Used **FormData** to upload complaint photos and profile images, with **real-time preview before submission**.

---

### 🗺️ Interactive Maps
Integrated **Leaflet.js with OpenStreetMap** to allow users to:

- search locations by address  
- select complaint locations on an interactive map  
- automatically capture **latitude and longitude** for issue reporting  

---

### 🎨 UI & Styling
Used **TailwindCSS** to build a responsive and modern UI with consistent styling across components.

---

### 👥 Role-Based UI Rendering
The interface adapts based on user roles:

- **Users** → report issues, comment, vote  
- **Volunteers** → manage assigned complaints  
- **Admins** → monitor complaints and platform activity  

---

## 🚀 Outcome of the Re-Architecture

The Angular migration resulted in a **cleaner, modular, and scalable frontend architecture** while fully reusing the **secure backend from the Infosys Internship project**.

Key improvements:
- better **component organization**
- improved **UI responsiveness**
- easier **code maintainability**
- scalable structure for future feature expansion

 ---
 
 ## 🌍 Live Demo

🔗 **Frontend (Angular Re-architectured UI):**  
https://civic-issue-reporting-rearchitectured.netlify.app/

⚙️ **Backend API:**  
https://civic-issue-reporting-tracking-frontend.onrender.com
