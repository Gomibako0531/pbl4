* This project does **not include the `node_modules` folder**.  
  `node_modules` contains all the dependencies downloaded via npm, and it's intentionally excluded to keep the repository small and clean.

## Setting up a React Development Environment with Vite (Mac OS)

### What I did to setup:  

1. Create the Vite project:
   ```bash
   npm create vite@latest schedule_planner
   
2. Select:
  Framework: React
  Variant: JavaScript

3. Navigate to the project folder:
   ```bash
   cd planner
   
4. Install dependencies:
  npm install

  *This will create the node_modules folder locally in the planner folder. It will not be          uploaded to GitHub.

5. Start the development server:
   ```bash
   npm run dev

After this, you will see the local host (e.g., http://localhost:0000/).
Click the link, and you can edit the code while viewing the live changes in your browser.
