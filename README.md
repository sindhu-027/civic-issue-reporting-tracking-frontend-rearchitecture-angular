# Re-architectured with angular - Clean Street – Civic Issue Reporting & Tracking App (Angular Frontend)

![Re-architected with Angular](https://img.shields.io/badge/Frontend-Angular-blue?logo=angular&logoColor=white&style=for-the-badge)

I re-architected the frontend of the **Clean Street civic issue reporting system** using Angular, while keeping the original backend from my Infosys Internship project intact. The goal was to improve **frontend architecture, modularity, maintainability, and user experience**.

**Angular Concepts & Features Used:**  
- **Components & Modular Architecture:** Profile, ReportIssue, ViewComplaints  
- **Lifecycle Hooks:** ngOnInit, ngAfterViewInit, ngOnDestroy  
- **Data Binding:** Interpolation, Property Binding, Event Binding, Two-way Binding (ngModel)  
- **Directives:** Structural (*ngIf, *ngFor), Attribute ([class], [ngStyle])  
- **Forms & Validation:** Template-driven forms with validation  
- **HTTP Client:** HttpClient for GET, POST, PUT requests via ApiService  
- **File Upload & Preview:** FormData, image preview handling  
- **Routing & Navigation:** Programmatic and declarative routing  
- **Third-party Libraries:** Leaflet for interactive maps, TailwindCSS for UI styling  
- **State Management:** Component-level state for loading, submitting, editing, comments, voting  
- **Pipes:** Built-in pipes like date, custom pipes if needed  
- **UI Features:** Alerts, modals, role-based rendering for Users, Volunteers, Admins  

This resulted in a **clean, scalable, and maintainable frontend** fully integrated with backend APIs, enhancing the user experience for reporting, tracking, and managing civic complaints.






# 🚧 Re-Architectured Frontend with Angular – Clean Street Civic Issue Reporting App

![Re-architectured Frontend with Angular](https://img.shields.io/badge/Re--Architectured%20Frontend-Angular-red?logo=angular&logoColor=white&style=for-the-badge)
![Tech Used](https://img.shields.io/badge/Tech-Angular%20%7C%20TailwindCSS%20%7C%20Node.js%20%7C%20Express%20%7C%20MongoDB-blue?style=for-the-badge)

This project is a **re-architecture of my Infosys Internship project**, where I redesigned the **Clean Street Civic Issue Reporting System frontend** from **React to Angular** while keeping the **original backend unchanged**.

The purpose of this re-architecture was to apply my own architectural ideas to improve **modularity, component structure, maintainability, and user experience**, while ensuring full compatibility with the existing **Node.js + Express + MongoDB backend APIs** built during my internship.

---

## **Angular Concepts & Features Used in the Project**

**Components & Modular Architecture**  
- Created modular Angular components such as **ProfileComponent**, **ReportIssueComponent**, and **ViewComplaintsComponent** to separate features like complaint reporting, viewing complaints, and user profile management.

**Lifecycle Hooks**  
- `ngOnInit()` → Used to **load profile data and complaints when components initialize**.  
- `ngAfterViewInit()` → Used to **initialize the Leaflet interactive map** in the complaint reporting page.  
- `ngOnDestroy()` → Used to **clean up timers and map instances** when components are destroyed.

**Data Binding**  
- **Interpolation (`{{ }}`)** → Display complaint details, user information, and status.  
- **Property Binding (`[src]`, `[value]`)** → Used for **image previews and dynamic UI updates**.  
- **Event Binding (`(click)`, `(change)`)** → Handles actions like **submit complaint, vote, comment, navigation**.  
- **Two-Way Binding (`[(ngModel)]`)** → Used in **complaint forms, profile editing, and comments**.

**Directives**  
- `*ngIf` → Conditionally display **loading states, errors, modals, and UI sections**.  
- `*ngFor` → Render **lists of complaints, comments, and uploaded images dynamically**.  
- `[class]`, `[ngStyle]` → Dynamically style complaint statuses such as **Resolved, In Progress, Assigned**.

**Forms & Validation**  
- Implemented **template-driven forms** for complaint submission, profile updates, and comments with input validation.

**HTTP Client & API Integration**  
- Used **Angular HttpClient** through a shared **ApiService** to communicate with backend APIs for:
  - fetching complaints  
  - submitting complaints  
  - voting and commenting  
  - updating user profile  

**File Upload & Image Preview**  
- Used **FormData** for uploading complaint photos and profile images, with **real-time preview before submission**.

**Routing & Navigation**  
- Implemented Angular routing for navigation between **login, dashboard, report issue, and profile pages**.

**Interactive Maps**  
- Integrated **Leaflet.js with OpenStreetMap** to allow users to **select complaint locations on the map or via address search**.

**State Handling**  
- Managed component-level states for **loading, submitting, voting, commenting, and error handling**.

**UI & Styling**  
- Used **TailwindCSS** for responsive UI design and clean layouts.

**Role-based UI Rendering**  
- UI dynamically adapts for **Users, Volunteers, and Admins**, enabling different features like complaint management and status updates.

---

## **Result of the Re-Architecture**

The Angular re-architecture produced a **clean, scalable, and modular frontend architecture** while fully reusing the **existing backend from the Infosys Internship project**.

This improved:
- code maintainability  
- UI responsiveness  
- component organization  
- frontend scalability for future features

while preserving the original system’s **secure backend APIs and data model**.









# 🔧 Clean Street – Civic Issue Reporting App  
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
