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

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
