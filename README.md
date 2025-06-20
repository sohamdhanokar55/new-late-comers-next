# Late Comers Attendance Management System

A modern web application to automate and manage the late comers attendance and fine system for colleges.  
**Built as a real-world project for my college's official late comers tracking and reporting.**

---

## 🚀 Features

- **Secure Login:** Role-based authentication for students and admins.
- **Barcode/Manual Attendance:** Mark late attendance by scanning barcodes or entering roll numbers.
- **Duplicate Prevention:** Prevents multiple late entries for the same student on the same day.
- **Fine Calculation:** Automatically tracks late counts and calculates fines for repeated offenses.
- **Payment Management:** Admins can mark fines as paid and update records.
- **Department-wise Records:** Data is organized by department for easy management.
- **Monthly Archiving:** Attendance data is archived monthly for reporting and compliance.
- **Excel Export:** Download attendance and fine data as Excel files.
- **Google Sheets Integration:** Optionally match records with Google Sheets data.
- **Responsive UI:** Clean, mobile-friendly interface with real-time feedback.

---

## 🏫 Project Context

This repository was created as a **college project** and is actively used for my college's actual late comers system.  
It aims to replace manual registers and spreadsheets with a reliable, automated, and user-friendly solution.

---

## 🛠️ Tech Stack

<div align="center">

<table>
  <tr>
    <td align="center" width="120">
      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg" width="40" height="40" alt="Next.js" /><br/>
      <b>Next.js</b>
    </td>
    <td align="center" width="120">
      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" width="40" height="40" alt="React" /><br/>
      <b>React</b>
    </td>
    <td align="center" width="120">
      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" width="40" height="40" alt="TypeScript" /><br/>
      <b>TypeScript</b>
    </td>
    <td align="center" width="120">
      <img src="https://avatars.githubusercontent.com/u/67109815?s=48&v=4" width="40" height="40" alt="Tailwind CSS" /><br/>
      <b>Tailwind CSS</b>
    </td>
    <td align="center" width="120">
      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-plain.svg" width="40" height="40" alt="Firebase" /><br/>
      <b>Firebase</b>
    </td>
  </tr>
  <tr>
    <td align="center" width="120">
      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" width="40" height="40" alt="GitHub Actions" /><br/>
      <b>GitHub Actions</b>
    </td>
    <td align="center" width="120">
      <img src="https://avatars.githubusercontent.com/u/46546912?s=48&v=4" width="40" height="40" alt="ExcelJS" /><br/>
      <b>ExcelJS</b>
    </td>
    <td align="center" width="120">
      <img src="https://lucide.dev/logo.svg" width="40" height="40" alt="Lucide Icons" /><br/>
      <b>Lucide Icons</b>
    </td>
    <td align="center" width="120">
      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" width="40" height="40" alt="HTML5" /><br/>
      <b>HTML5</b>
    </td>
    <td align="center" width="120">
      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" width="40" height="40" alt="CSS3" /><br/>
      <b>CSS3</b>
    </td>
  </tr>
</table>

</div>

---


## 🏗️ Project Structure

```
late-comers-next-main/
  ├── src/
  │   ├── app/           # Next.js app directory (pages, layouts, reports)
  │   ├── components/    # Reusable React components (BarcodeScanner, Table, etc.)
  │   ├── hooks/         # Custom React hooks
  │   ├── lib/           # Utility functions and actions
  │   └── context/       # Auth context
  ├── public/            # Static assets (icons, manifest, etc.)
  ├── firebase.tsx       # Firebase configuration
  ├── firestore.rules    # Firestore security rules
  └── ...                # Config files, README, etc.
```

---

## ⚡ Getting Started

### 1. **Clone the repository**

```bash
git clone https://github.com/yourusername/late-comers-next-main.git
cd late-comers-next-main
```

### 2. **Install dependencies**

```bash
npm install
```

### 3. **Set up Firebase**

- Create a Firebase project at [Firebase Console](https://console.firebase.google.com/).
- Enable Firestore and Authentication.
- Copy your Firebase config to `firebase.tsx`.

### 4. **Configure Firestore Rules**

- Use the provided `firestore.rules` for secure access.

### 5. **Run the development server**

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the app.

---

## 📊 Reporting & Export

- View monthly attendance and fine reports in the **Reports** section.
- Export data as Excel files for offline use or sharing.

---

## 🤝 Contributing

This project was built for a specific college use case.

---

## 📄 License

This project is for educational and institutional use ONLY.  

---

## 🙋‍♂️ Author
  
**Soham Dhanokar**
<br>
Students Council, Agnel Polytechnic
<br>
sosadhanokar@gmail.com 


---

**Thank you for checking out this project! If you find it useful, please star the repo.**

