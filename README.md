# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)


---

## 보안 업데이트 (2026-10-27)

Node.js 보안 릴리스(2026-10-21), PHP2Shell(CVE-2026-109618/109619), Next.js 긴급 업데이트(2026-10-14) 대응 내역입니다.

- **Next.js**: 사용하지 않음(React + Express 5.1.0) — 해당 없음.
- **Node.js 런타임**: Node 20.x는 EOL이라 2026-10-21 보안 릴리스(Brotli RCE CVE-2026-111497, TLS/DNS 취약점 등 10건)가 제공되지 않습니다. 개발 머신은 **v22.23.4로 교체 완료**(nvm 기본 버전, pm2 7.1.1 재설치)했고, 운영 서버는 22.23.4 이상(또는 24.22.1 이상)으로 교체가 필요합니다.
- **PHP**: 이 프로젝트는 PHP를 사용하지 않아 해당 없음.
- **적용 완료**: `ecosystem.config.js`의 npm 경로를 `v22.23.4`로 변경(개발 머신에 Node 22.23.4 설치 완료). 운영 서버에도 Node 22 설치 후 적용 필요.
- 상세 배경과 절차는 `/mnt/e/dev/web/Pulspia 서비스 개발-배포 가이드.md` 15장 참조.
